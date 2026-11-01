// pull.js — CLI controller: downloads remote commits via signed GET URLs.
// No AWS SDK or credentials — the server issues the signed URLs and this code
// fetches them with plain axios.  removedFiles handling from the last session is kept.

import fs from "fs";
import path from "path";
import axios from "axios";
import { requireAuth } from "./gitvConfig.js";
import { getApiUrl } from "./apiConfig.js";

// Fetches commits from the server and downloads any files not yet held locally.
// For each new commit:
//  1. Ask the server for signed S3 GET URLs for the commit's file keys.
//  2. GET each file via axios — no AWS SDK, no credentials on the CLI.
//  3. Handle removedFiles: delete those names from the working directory.
// Commits are processed oldest-first so a later removedFiles correctly wins.
export const pullChanges = async () => {
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
  // The project root is one level above .gitV — that is where user files live.
  const projectDir = path.resolve(repoPath, "..");

  try {
    await fs.promises.mkdir(commitsPath, { recursive: true });
    const localDirs = new Set(await fs.promises.readdir(commitsPath));

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch the full commit list so we know which ones are already local.
    let commits;
    try {
      const response = await axios.get(
        `${apiUrl}/repositories/${repoId}/commits`,
        authHeaders,
      );
      commits = response.data.commits;
    } catch (err) {
      process.exitCode = 1;
      const status = err.response?.status;
      if (status === 401) {
        console.error("Pull failed: not authenticated — run `gitv login` first.");
      } else if (status === 403) {
        console.error("Pull failed: you don't have access to this repository.");
      } else if (status === 404) {
        console.error(
          "Pull failed: repository not found — check the repoId in .gitV/config.json.",
        );
      } else {
        console.error("Pull failed:", err.response?.data?.message || err.message);
      }
      return;
    }

    // Server returns commits oldest-first; process in that order so that
    // a later commit's removedFiles correctly overrides an earlier file write.
    for (const commit of commits) {
      const localCommitDir = path.join(commitsPath, commit._id);

      // Skip commits we already have:
      //  - pulled before (commit.json exists in a folder named by its _id), or
      //  - made locally and pushed (its local folder name is embedded in the
      //    file keys: "repoId/<localCommitDir>/file").
      const alreadyHave =
        fs.existsSync(path.join(localCommitDir, "commit.json")) ||
        (commit.files || []).some((key) => localDirs.has(key.split("/")[1]));
      if (alreadyHave) continue;

      await fs.promises.mkdir(localCommitDir, { recursive: true });

      // If this commit has files, get signed download URLs for all of them
      // in one round-trip, then fetch each one with axios.
      if ((commit.files || []).length > 0) {
        let downloadEntries;
        try {
          const { data } = await axios.post(
            `${apiUrl}/repositories/${repoId}/download-urls`,
            { keys: commit.files },
            authHeaders,
          );
          downloadEntries = data; // [{key, url}]
        } catch (err) {
          console.error(
            `Could not get download URLs for commit ${commit._id}:`,
            err.response?.data?.message || err.message,
          );
          // Remove the half-created directory so next pull retries cleanly.
          await fs.promises.rm(localCommitDir, { recursive: true, force: true });
          continue;
        }

        // Build a map for quick lookup: key -> url.
        const urlMap = new Map(downloadEntries.map((e) => [e.key, e.url]));

        for (const key of commit.files) {
          const fileName = path.basename(key); // strip the repoId/commitDir/ prefix
          const url = urlMap.get(key);
          if (!url) {
            console.error(`No download URL for key "${key}" — skipping.`);
            continue;
          }
          try {
            const response = await axios.get(url, {
              responseType: "arraybuffer",
            });
            const content = Buffer.from(response.data);
            await fs.promises.writeFile(
              path.join(localCommitDir, fileName),
              content,
            );
            await fs.promises.writeFile(
              path.join(projectDir, fileName),
              content,
            );
            console.log(`Pulled ${fileName} (commit ${commit._id})`);
          } catch (err) {
            console.error(`Failed to download "${fileName}": ${err.message}`);
            process.exitCode = 1;
          }
        }
      }

      // Handle removedFiles: delete the named files from the working directory
      // so the local tree matches the server's view after the revert.
      // Silently skip names that don't exist locally (already gone is fine).
      for (const name of commit.removedFiles || []) {
        const target = path.join(projectDir, name);
        try {
          await fs.promises.rm(target, { force: true });
          console.log(`Removed ${name} (commit ${commit._id} revert)`);
        } catch {
          // File not present locally — nothing to do.
        }
      }

      // Written last, so a failed download is retried on the next pull.
      // `pushed: true` because this commit came from the server, and `push`
      // must never send it back.
      await fs.promises.writeFile(
        path.join(localCommitDir, "commit.json"),
        JSON.stringify({
          message: commit.message,
          timestamp: commit.createdAt,
          pushed: true,
        }),
      );
    }

    console.log("Pull complete.");
  } catch (err) {
    console.error("Unable to pull:", err.response?.data || err.message);
  }
};
