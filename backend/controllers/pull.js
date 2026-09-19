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
    await fs.promises.mkdir(commitsPath, { recursive: true });
    const localDirs = new Set(await fs.promises.readdir(commitsPath));

    const response = await axios.get(
      `http://localhost:3000/repositories/${repoId}/commits`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const commits = response.data.commits;

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
