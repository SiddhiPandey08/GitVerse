import fs from "fs";
import path from "path";

export async function logCommits({ oneline = false, limit } = {}) {
  const commitsDir = path.resolve(process.cwd(), ".gitV", "commits");

  if (!fs.existsSync(commitsDir)) {
    console.log("No commits yet. Use `add` and `commit` first.");
    return;
  }

  const commits = [];
  for (const id of await fs.promises.readdir(commitsDir)) {
    const metaPath = path.join(commitsDir, id, "commit.json");
    if (!fs.existsSync(metaPath)) continue;
    try {
      const meta = JSON.parse(await fs.promises.readFile(metaPath, "utf-8"));
      commits.push({ id, ...meta });
    } catch {
      // skip unreadable commit folders instead of crashing the whole log
    }
  }

  if (commits.length === 0) {
    console.log("No commits yet. Use `add` and `commit` first.");
    return;
  }

  // newest first
  commits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const shown = limit ? commits.slice(0, limit) : commits;

  for (const c of shown) {
    if (oneline) {
      console.log(`${c.id.slice(0, 8)}  ${c.message}`);
    } else {
      console.log(`commit ${c.id}`);
      console.log(`Date:   ${new Date(c.timestamp).toLocaleString()}`);
      console.log(`\n    ${c.message}\n`);
    }
  }
}
