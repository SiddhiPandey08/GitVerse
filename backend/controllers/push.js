import fs from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js";

export async function pushChanges() {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  try {
    const commitDirs = await fs.promises.readdir(commitsPath);
    for (const commitDir of commitDirs) {
      // Loop through each commit directory
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.promises.readdir(commitPath);
      for (const file of files) {
        // Loop through each file in the commit directory
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.promises.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`, // Use commit directory as a prefix for the file key
          Body: fileContent,
        };
        await s3.upload(params).promise();
        console.log(`Uploaded ${file} from commit ${commitDir} to S3`);
      }
    }
  } catch (error) {
    console.error("Error pushing changes to S3:", error);
  }
}
