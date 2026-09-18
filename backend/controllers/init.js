import fs from "fs";
import path from "path";

export async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  try {
    await fs.promises.mkdir(repoPath, { recursive: true });
    await fs.promises.mkdir(commitsPath, { recursive: true });
    await fs.promises.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: process.env.S3_BUCKET }),
    );
    console.log("Repository initialized successfully.");
  } catch (err) {
    console.error("Error initializing repository:", err);
  }
}
