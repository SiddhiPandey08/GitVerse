import fs from "fs";
import path from "path";
import axios from "axios";

const DEFAULT_API_URL = "http://127.0.0.1:3000";

export function getApiUrl() {
  // 127.0.0.1 instead of localhost avoids IPv6-first resolution stalls on Node 18+
  return process.env.GITVERSE_API_URL || DEFAULT_API_URL;
}

export async function loginCli({ email, password } = {}) {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const configPath = path.join(repoPath, "config.json");

  if (!fs.existsSync(repoPath)) {
    console.error("No .gitV repository found here. Run `init` first.");
    process.exitCode = 1;
    return;
  }

  email = email || process.env.GITVERSE_EMAIL;
  password = password || process.env.GITVERSE_PASSWORD;

  // Only load the prompt library if we actually need to prompt.
  if (!email || !password) {
    const { input, password: passwordPrompt } =
      await import("@inquirer/prompts");
    if (!email) email = await input({ message: "Email:" });
    if (!password) {
      password = await passwordPrompt({ message: "Password:", mask: "*" });
    }
  }

  try {
    const response = await axios.post(
      `${getApiUrl()}/users/login`,
      { email, password },
      { timeout: 10000 },
    );

    const { token, userId } = response.data;

    // Merge into existing config.json so `bucket` and `repoId` from `init` survive.
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(
        await fs.promises.readFile(configPath, "utf-8"),
      );
    }

    await fs.promises.writeFile(
      configPath,
      JSON.stringify({ ...existingConfig, token, userId }, null, 2),
    );

    console.log("Logged in successfully.");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error(
        `Login failed: cannot reach ${getApiUrl()}. Is the server running (\`node index.js launch\`)?`,
      );
    } else {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
    }
    process.exitCode = 1;
  }
}
