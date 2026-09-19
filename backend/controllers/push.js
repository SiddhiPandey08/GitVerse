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

  try {
    const commitDirs = await fs.promises.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.promises.readdir(commitPath);

      // Read the commit's local metadata (written by `commit.js`)
      const commitJsonPath = path.join(commitPath, "commit.json");
      const commitMeta = JSON.parse(
        await fs.promises.readFile(commitJsonPath, "utf-8"),
      );

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

      // Now log the real Commit in MongoDB via the same endpoint the
      // web app's edit form uses — sending only `message` + `files`
      // (no description/content) means the repo's content stays untouched.
      await axios.put(
        `http://localhost:3000/repositories/update/${repoId}`,
        {
          message: commitMeta.message,
          files: uploadedKeys,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log(`Synced commit ${commitDir} to GitVerse.`);
    }
  } catch (error) {
    console.error(
      "Error pushing changes:",
      error.response?.data || error.message,
    );
  }
}
