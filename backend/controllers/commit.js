// commit.js — CLI controller: stages a local commit and writes commit.json.
// The --review flag marks the commit as wanting a code review; push.js reads
// this flag and forwards it to the server.

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Creates a local commit from whatever is currently in the staging area.
// Accepts an options object so the yargs handler can pass --review through
// without changing the public API signature used by the rest of the CLI.
// The review flag is stored in commit.json so push.js can read it later.
export async function commitChanges(message, { review = false } = {}) {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const stagingPath = path.join(repoPath, "staging");
  const commitsPath = path.join(repoPath, "commits");

  let commitDir;
  try {
    // Check for staged files BEFORE creating anything, so a failed commit
    // never leaves an empty commit folder behind.
    const files = fs.existsSync(stagingPath)
      ? await fs.promises.readdir(stagingPath)
      : [];
    if (files.length === 0) {
      console.error(
        "Nothing to commit. Use `add <file>` to stage changes first.",
      );
      process.exitCode = 1;
      return;
    }

    const commitHashID = uuidv4();
    commitDir = path.join(commitsPath, commitHashID);
    await fs.promises.mkdir(commitDir, { recursive: true });

    for (const file of files) {
      await fs.promises.copyFile(
        path.join(stagingPath, file),
        path.join(commitDir, file),
      );
    }

    // Persist commit metadata including the review flag so push.js can
    // forward it to the server without re-parsing args.
    await fs.promises.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        reviewRequested: Boolean(review),
      }),
    );

    // Like git: staging is emptied, so the next commit contains only what
    // you add after this point.
    for (const file of files) {
      await fs.promises.rm(path.join(stagingPath, file), {
        recursive: true,
        force: true,
      });
    }

    const reviewNote = review ? " [review requested]" : "";
    console.log(
      `Commit ${commitHashID} created with message: "${message}" (${files.length} file${files.length === 1 ? "" : "s"})${reviewNote}`,
    );
  } catch (err) {
    // Don't leave a half-written commit behind.
    if (commitDir) {
      await fs.promises.rm(commitDir, { recursive: true, force: true });
    }
    console.error("Error committing changes:", err);
    process.exitCode = 1;
  }
}
