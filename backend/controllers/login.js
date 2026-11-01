// login.js — CLI controller: authenticates against the API and saves the JWT locally.
// Now imports getApiUrl from apiConfig.js instead of defining it here, so the
// server URL is sourced from one canonical place across all CLI controllers.

import fs from "fs";
import path from "path";
import axios from "axios";
import { getApiUrl } from "./apiConfig.js";

// Logs the user in via the GitVerse API and saves the token to .gitV/config.json.
// Credentials can come from --email/--password flags, GITVERSE_EMAIL/PASSWORD env
// vars, or an interactive prompt — no AWS credentials or .env needed.
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

    // Merge into existing config.json so `repoId` from `init` survives.
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
