import fs from "fs";
import path from "path";

export const revertChanges = async (commitHashID) => {
  const repoPath = path.join(process.cwd(), ".gitV");
  const commitsPath = path.join(repoPath, "commits");
  const projectDir = path.resolve(repoPath, "..");

  try {
    // Read every commit's timestamp so history can be replayed in order.
    const commits = [];
    for (const dir of await fs.promises.readdir(commitsPath)) {
      const metaPath = path.join(commitsPath, dir, "commit.json");
      if (!fs.existsSync(metaPath)) continue;
      const meta = JSON.parse(await fs.promises.readFile(metaPath, "utf-8"));
      commits.push({ dir, time: new Date(meta.timestamp).getTime() });
    }

    // Accept the short ids that `log --oneline` prints, as long as unambiguous.
    const matches = commits.filter((c) => c.dir.startsWith(commitHashID));
    if (matches.length === 0) {
      console.error(`No commit found matching "${commitHashID}".`);
      process.exitCode = 1;
      return;
    }
    if (matches.length > 1) {
      console.error(
        `"${commitHashID}" matches several commits. Use more characters.`,
      );
      process.exitCode = 1;
      return;
    }
    const target = matches[0];

    // Replay history up to the target, oldest first: a later commit's version
    // of a file replaces an earlier one. This works for old full-snapshot
    // commits and for new commits that only contain changed files.
    const history = commits
      .filter((c) => c.time <= target.time)
      .sort((a, b) => a.time - b.time);

    const toRestore = new Map(); // file name -> path of the version to restore
    for (const commit of history) {
      const commitDir = path.join(commitsPath, commit.dir);
      const entries = await fs.promises.readdir(commitDir, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        if (!entry.isFile() || entry.name === "commit.json") continue; // metadata isn't a repo file
        toRestore.set(entry.name, path.join(commitDir, entry.name));
      }
    }

    if (toRestore.size === 0) {
      console.log(`Commit ${target.dir} has no files to restore.`);
      return;
    }

    for (const [file, source] of toRestore) {
      await fs.promises.copyFile(source, path.join(projectDir, file));
      console.log(`Reverted ${file} to the state of commit ${target.dir}`);
    }
  } catch (error) {
    console.error("Error reverting changes:", error);
    process.exitCode = 1;
  }
};
