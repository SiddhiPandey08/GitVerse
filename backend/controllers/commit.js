import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function commitChanges(message) {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const stagingPath = path.join(repoPath, "staging");
  const commitsPath = path.join(repoPath, "commits");
  try {
    const commitHashID = uuidv4();
    const commitDir = path.join(commitsPath, commitHashID);
    await fs.promises.mkdir(commitDir, { recursive: true });
    const files = await fs.promises.readdir(stagingPath);
    for (const file of files) {
      await fs.promises.copyFile(
        path.join(stagingPath, file),
        path.join(commitDir, file),
      );
    }

    await fs.promises.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, timestamp: new Date().toISOString() }),
    );
    console.log(`Commit ${commitHashID} created with message: "${message}"`);
  } catch (err) {
    console.error("Error committing changes:", err);
  }
}
