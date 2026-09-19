import fs from "fs";
import path from "path";

const repoPath = path.resolve(process.cwd(), ".gitV");
const configPath = path.join(repoPath, "config.json");

// Reads .gitV/config.json. Returns null if it doesn't exist (e.g. `init`
// hasn't been run in this folder yet).
export function readConfig() {
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

// Confirms the user is logged in (a token is saved locally) before letting
// push/pull proceed. This is the "set once, forget it" check — push/pull
// never prompt for credentials themselves, they just read what `login`
// already saved, and fail with a clear instruction if it's missing.
export function requireAuth() {
  const config = readConfig();

  if (!config) {
    console.error("No .gitV repository found here. Run `init` first.");
    return null;
  }
  if (!config.token || !config.userId) {
    console.error("Not logged in. Run `node index.js login` first.");
    return null;
  }

  return config; // { bucket, token, userId, ...whatever else config holds }
}
