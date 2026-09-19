import fs from "fs";
import path from "path";

export async function initRepo(repoId) {
  if (!repoId) {
    console.error(
      "A repository ID is required. Usage: node index.js init <repoId>",
    );
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");

  try {
    await fs.promises.mkdir(repoPath, { recursive: true });
    await fs.promises.mkdir(commitsPath, { recursive: true });

    // Merge into existing config.json rather than overwriting it — running
    // `init` again (e.g. to re-link to a different repo) shouldn't wipe out
    // a `token`/`userId` that `login` already saved.
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(
        await fs.promises.readFile(configPath, "utf-8"),
      );
    }

    const updatedConfig = {
      ...existingConfig,
      bucket: process.env.S3_BUCKET,
      repoId,
    };

    await fs.promises.writeFile(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
    );

    console.log(`Repository initialized and linked to repo ${repoId}.`);
  } catch (err) {
    console.error("Error initializing repository:", err);
  }
}
