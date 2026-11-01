// push.js — CLI controller: uploads unpushed local commits via signed PUT URLs.
// No AWS SDK or credentials needed here — the server issues the signed URLs and
// only the server reads S3_ACCESS_KEY / S3_SECRET_KEY from its own .env.

import fs from "fs";
import path from "path";
import axios from "axios";
import { requireAuth } from "./gitvConfig.js";
import { getApiUrl } from "./apiConfig.js";

// Translates HTTP error status codes into clear, actionable CLI messages.
// Called whenever an axios request fails so every command gives the same
// quality of guidance rather than raw JSON dumps.
function handleApiError(error, context) {
  process.exitCode = 1;
  const status = error.response?.status;
  const serverMsg = error.response?.data?.message;

  if (status === 401) {
    console.error(`${context}: not authenticated — run \`gitv login\` first.`);
  } else if (status === 403) {
    console.error(
      `${context}: permission denied — you don't have push access to this repository.`,
    );
  } else if (status === 404) {
    console.error(
      `${context}: repository not found — check the repoId in .gitV/config.json.`,
    );
  } else if (status === 400) {
    console.error(`${context}: bad request — ${serverMsg || "see server logs"}.`);
  } else if (error.code === "ECONNREFUSED") {
    console.error(
      `${context}: cannot reach ${getApiUrl()} — is the server running?`,
    );
  } else {
    console.error(`${context}:`, serverMsg || error.message);
  }
}

// Pushes all local commits that have not yet been sent to the server.
// For each new commit:
//  1. Ask the server for signed S3 PUT URLs (upload-urls endpoint).
//  2. PUT each staged file directly to its signed URL using axios — no AWS SDK.
//  3. Register the commit (message + keys) with the existing push endpoint.
// Works oldest-first so the remote commit order matches local creation order.
export async function pushChanges() {
  const config = requireAuth();
  if (!config) return;

  const { repoId, token } = config;
  if (!repoId) {
    console.error(
      "This folder isn't linked to a repository. Run `gitv init <repoId>` first.",
    );
    return;
  }

  const apiUrl = getApiUrl();
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  try {
    // 1. Ask the server what it already has, so nothing is pushed twice.
    const { data } = await axios.get(
      `${apiUrl}/repositories/${repoId}/commits`,
      authHeaders,
    );

    const remoteCommitIds = new Set(); // Mongo _ids (commits that came from a pull)
    const remoteLocalIds = new Set(); // local commit ids embedded in file keys
    for (const c of data.commits || []) {
      remoteCommitIds.add(String(c._id));
      for (const key of c.files || []) {
        remoteLocalIds.add(key.split("/")[1]); // "repoId/<commitDir>/file"
      }
    }

    // 2. Read local commits and sort oldest-first so remote order matches.
    const commits = [];
    for (const commitDir of await fs.promises.readdir(commitsPath)) {
      const commitPath = path.join(commitsPath, commitDir);
      const commitJsonPath = path.join(commitPath, "commit.json");
      if (!fs.existsSync(commitJsonPath)) continue;
      const meta = JSON.parse(
        await fs.promises.readFile(commitJsonPath, "utf-8"),
      );
      commits.push({ commitDir, commitPath, commitJsonPath, meta });
    }
    commits.sort(
      (a, b) => new Date(a.meta.timestamp) - new Date(b.meta.timestamp),
    );

    let pushedCount = 0;

    for (const { commitDir, commitPath, commitJsonPath, meta } of commits) {
      if (meta.pushed) continue;

      // Already on the server (pushed before this feature, or pulled): mark it.
      if (remoteCommitIds.has(commitDir) || remoteLocalIds.has(commitDir)) {
        meta.pushed = true;
        await fs.promises.writeFile(commitJsonPath, JSON.stringify(meta));
        continue;
      }

      // Collect the staged files for this commit (everything except commit.json).
      const allFiles = await fs.promises.readdir(commitPath);
      const fileNames = allFiles.filter((f) => f !== "commit.json");

      if (fileNames.length === 0) {
        // Empty commit (only metadata) — skip uploading but still register it.
        await registerCommit(apiUrl, repoId, commitDir, [], meta, authHeaders);
        meta.pushed = true;
        await fs.promises.writeFile(commitJsonPath, JSON.stringify(meta));
        pushedCount++;
        continue;
      }

      // 3. Request signed PUT URLs for all files in one round-trip.
      let urlEntries;
      try {
        const { data: urlData } = await axios.post(
          `${apiUrl}/repositories/${repoId}/upload-urls`,
          { commitId: commitDir, files: fileNames },
          authHeaders,
        );
        urlEntries = urlData; // [{name, key, url}]
      } catch (err) {
        handleApiError(err, `Getting upload URLs for commit ${commitDir}`);
        return; // abort the whole push on auth/permission errors
      }

      // Build a lookup so we can match name -> {key, url} quickly.
      const urlMap = new Map(urlEntries.map((e) => [e.name, e]));
      const uploadedKeys = [];

      // 4. PUT each file directly to its signed S3 URL — no AWS SDK on the CLI.
      for (const name of fileNames) {
        const entry = urlMap.get(name);
        if (!entry) {
          console.error(`No upload URL returned for file "${name}" — skipping commit ${commitDir}.`);
          return;
        }
        const fileContent = await fs.promises.readFile(
          path.join(commitPath, name),
        );
        try {
          await axios.put(entry.url, fileContent, {
            headers: { "Content-Type": "application/octet-stream" },
            // S3 signed URLs don't accept an Authorization header from us.
            transformRequest: [(data) => data], // prevent axios from munging the Buffer
          });
        } catch (err) {
          console.error(
            `Failed to upload "${name}" to storage: ${err.message}`,
          );
          return;
        }
        uploadedKeys.push(entry.key);
        console.log(`Uploaded ${name} (commit ${commitDir})`);
      }

      // 5. Register the commit on the server with the confirmed S3 keys.
      try {
        await registerCommit(
          apiUrl,
          repoId,
          commitDir,
          uploadedKeys,
          meta,
          authHeaders,
        );
      } catch (err) {
        handleApiError(err, `Registering commit ${commitDir}`);
        return;
      }

      meta.pushed = true;
      await fs.promises.writeFile(commitJsonPath, JSON.stringify(meta));
      pushedCount++;
      console.log(`Synced commit ${commitDir} to GitVerse.`);
    }

    console.log(
      pushedCount > 0
        ? `Pushed ${pushedCount} commit(s).`
        : "Everything up to date.",
    );
  } catch (error) {
    handleApiError(error, "Push");
  }
}

// Sends the commit metadata to PUT /repositories/update/:repoId.
// Kept as a small helper so the main loop stays readable.
// reviewRequested is forwarded so the server can post to #general if needed.
async function registerCommit(apiUrl, repoId, commitDir, keys, meta, authHeaders) {
  await axios.put(
    `${apiUrl}/repositories/update/${repoId}`,
    {
      commitId: commitDir,
      commit: { id: commitDir },
      message: meta.message,
      files: keys,
      reviewRequested: Boolean(meta.reviewRequested),
    },
    authHeaders,
  );
}
