import fs from "fs";
import path from "path";
import axios from "axios";
import { s3, S3_BUCKET } from "../config/aws-config.js";
import { requireAuth } from "./gitvConfig.js";

export async function pushChanges() {
  const config = requireAuth();
  if (!config) return;

  const { repoId, token } = config;
  if (!repoId) {
    console.error(
      "This folder isn't linked to a repository. Run `node index.js init <repoId>` first.",
    );
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  try {
    // 1. Ask the server what it already has, so nothing is pushed twice.
    const { data } = await axios.get(
      `http://localhost:3000/repositories/${repoId}/commits`,
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

    // 2. Read local commits and push them oldest first, so the order on the
    //    website matches the order you made them in.
    const commits = [];
    for (const commitDir of await fs.promises.readdir(commitsPath)) {
      const commitPath = path.join(commitsPath, commitDir);
      const commitJsonPath = path.join(commitPath, "commit.json");
      if (!fs.existsSync(commitJsonPath)) continue; // incomplete commit folder
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

      // Already on the server (pushed before this fix, or pulled): just mark it.
      if (remoteCommitIds.has(commitDir) || remoteLocalIds.has(commitDir)) {
        meta.pushed = true;
        await fs.promises.writeFile(commitJsonPath, JSON.stringify(meta));
        continue;
      }

      const files = await fs.promises.readdir(commitPath);
      const uploadedKeys = [];

      for (const file of files) {
        if (file === "commit.json") continue; // metadata stays local, not a repo file

        const filePath = path.join(commitPath, file);
        const fileContent = await fs.promises.readFile(filePath);
        const key = `${repoId}/${commitDir}/${file}`;

        await s3
          .upload({
            Bucket: S3_BUCKET,
            Key: key,
            Body: fileContent,
          })
          .promise();

        uploadedKeys.push(key);
        console.log(`Uploaded ${file} from commit ${commitDir} to S3`);
      }

      await axios.put(
        `http://localhost:3000/repositories/update/${repoId}`,
        {
          message: meta.message,
          files: uploadedKeys,
        },
        authHeaders,
      );

      // Only mark as pushed after the server accepted it.
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
    console.error(
      "Error pushing changes:",
      error.response?.data || error.message,
    );
  }
}
