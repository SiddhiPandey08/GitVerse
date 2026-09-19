import fs from "fs";
import path from "path";
import axios from "axios";
import { s3, S3_BUCKET } from "../config/aws-config.js";
import { requireAuth } from "./gitvConfig.js";

export const pullChanges = async () => {
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
    const response = await axios.get(
      `http://localhost:3000/repositories/${repoId}/commits`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const commits = response.data.commits;

    for (const commit of commits) {
      const localCommitDir = path.join(commitsPath, commit._id);

      // Skip commits we've already pulled — a commit.json already existing
      // locally means this one was fetched before.
      if (fs.existsSync(path.join(localCommitDir, "commit.json"))) {
        continue;
      }

      await fs.promises.mkdir(localCommitDir, { recursive: true });

      for (const key of commit.files || []) {
        const fileName = path.basename(key); // strip the repoId/commitDir/ prefix
        const fileContent = await s3
          .getObject({ Bucket: S3_BUCKET, Key: key })
          .promise();

        await fs.promises.writeFile(
          path.join(localCommitDir, fileName),
          fileContent.Body,
        );
        console.log(`Pulled ${fileName} (commit ${commit._id})`);
      }

      // Keep local commit.json format consistent with what `commit.js` writes
      await fs.promises.writeFile(
        path.join(localCommitDir, "commit.json"),
        JSON.stringify({
          message: commit.message,
          timestamp: commit.createdAt,
        }),
      );
    }

    console.log("Pull complete.");
  } catch (err) {
    console.error("Unable to pull:", err.response?.data || err.message);
  }
};
