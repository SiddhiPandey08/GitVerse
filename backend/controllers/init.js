// init.js — CLI controller: creates the .gitV folder structure and links it to a repo.
// No longer stores bucket or AWS credentials — those live only on the server.
// The config.json written here holds only repoId (and token/userId from login).

import fs from "fs";
import path from "path";

// Initialises .gitV in the current directory and saves the repoId to config.json.
// Merges into any existing config so a re-run doesn't erase the user's saved token.
// bucket is intentionally NOT stored here — the server reads it from its own env.
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

    // Strip any leftover bucket/aws fields from older config versions.
    const { bucket: _b, ...rest } = existingConfig;
    const updatedConfig = { ...rest, repoId };

    await fs.promises.writeFile(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
    );

    console.log(`Repository initialized and linked to repo ${repoId}.`);
  } catch (err) {
    console.error("Error initializing repository:", err);
  }
}
