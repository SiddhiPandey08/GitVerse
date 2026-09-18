import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

export const revertChanges = async (commitHashID) => {
  const repoPath = path.join(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDir = path.join(commitsPath, commitHashID);
    const files = await readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      await copyFile(path.join(commitDir, file), path.join(parentDir, file)); // Copy each file from the commit directory to the parent directory
      console.log(`Reverted ${file} to the state of commit ${commitHashID}`);
    }
  } catch (error) {
    console.error("Error reverting changes:", error);
  }
};
