import fs from "fs";
import path from "path";
import readline from "readline";
import axios from "axios";

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export async function loginCli() {
  const repoPath = path.resolve(process.cwd(), ".gitV");
  const configPath = path.join(repoPath, "config.json");

  if (!fs.existsSync(repoPath)) {
    console.error("No .gitV repository found here. Run `init` first.");
    return;
  }

  const email = await ask("Email: ");
  const password = await ask("Password: ");

  try {
    const response = await axios.post("http://localhost:3000/users/login", {
      email,
      password,
    });

    const { token, userId } = response.data;

    // Merge into existing config.json rather than overwriting it,
    // since `bucket` (and eventually repoId) already live there from `init`.
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(
        await fs.promises.readFile(configPath, "utf-8"),
      );
    }

    const updatedConfig = { ...existingConfig, token, userId };
    await fs.promises.writeFile(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
    );

    console.log("Logged in successfully.");
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data?.message || error.message,
    );
  }
}
