import fs from "fs";
import path from "path";

function decodeJwt(token) {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8"),
    );
  } catch {
    return null;
  }
}

export async function whoami() {
  const configPath = path.resolve(process.cwd(), ".gitV", "config.json");

  if (!fs.existsSync(configPath)) {
    console.error("No .gitV repository found here. Run `init <repoId>` first.");
    process.exitCode = 1;
    return;
  }

  const config = JSON.parse(await fs.promises.readFile(configPath, "utf-8"));

  console.log(`Repository: ${config.repoId || "(not linked)"}`);
  console.log(`Bucket:     ${config.bucket || "(none)"}`);

  if (!config.token) {
    console.log("Logged in:  no  (run `login`)");
    return;
  }

  console.log(`User ID:    ${config.userId || "(unknown)"}`);

  const payload = decodeJwt(config.token);
  if (payload?.exp) {
    const expires = new Date(payload.exp * 1000);
    const expired = expires < new Date();
    console.log(
      `Session:    ${expired ? "EXPIRED" : "valid"} (expires ${expires.toLocaleString()})`,
    );
    if (expired) console.log("Run `login` to get a new token.");
  } else {
    console.log("Session:    token present (no expiry info)");
  }
}
