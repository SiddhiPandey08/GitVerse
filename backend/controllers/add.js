import fs from "fs";
import path from "path";

export async function addFiles(filePaths) {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const stagingPath = path.join(repoPath, "staging");
  try {
    await fs.promises.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePaths);
    await fs.promises.copyFile(filePaths, path.join(stagingPath, fileName));
    console.log(`File ${fileName} added to staging.`);
  } catch (err) {
    console.error("Error adding files:", err);
  }
}
