#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";

// Load .env exactly once, silently. Remove any other dotenv.config() calls
// in controllers/config files (e.g. aws-config.js) so it isn't repeated.
dotenv.config({ quiet: true });

// Each command imports its controller only when it actually runs, so
// `login` never pays for express / socket.io / mongoose / the AWS SDK.
const handler = (load) => async (argv) => {
  try {
    await load(argv);
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
};

await yargs(hideBin(process.argv))
  .scriptName("gitv")
  .command(
    "launch",
    "Launching the server",
    {},
    handler(async () => {
      const { startServer } = await import("./server.js");
      await startServer();
    }),
  )
  .command(
    "init <repoId>",
    "Initialize the application and link it to an existing repository",
    (y) =>
      y.positional("repoId", {
        describe:
          "The MongoDB ID of an existing repository (create it via the web app first)",
        type: "string",
      }),
    handler(async (argv) => {
      const { initRepo } = await import("./controllers/init.js");
      await initRepo(argv.repoId);
    }),
  )
  .command(
    "add <file>",
    "Add a file to the repository",
    (y) =>
      y.positional("file", {
        describe: "File will be added to staging",
        type: "string",
      }),
    handler(async (argv) => {
      const { addFiles } = await import("./controllers/add.js");
      await addFiles(argv.file);
    }),
  )
  .command(
    "commit <message>",
    "Commit staged files with a message",
    (y) =>
      y.positional("message", {
        describe: "Commit message",
        type: "string",
      }),
    handler(async (argv) => {
      const { commitChanges } = await import("./controllers/commit.js");
      await commitChanges(argv.message);
    }),
  )
  .command(
    "push",
    "Push changes to the remote repository",
    {},
    handler(async () => {
      const { pushChanges } = await import("./controllers/push.js");
      await pushChanges();
    }),
  )
  .command(
    "pull",
    "Pull changes from the remote repository",
    {},
    handler(async () => {
      const { pullChanges } = await import("./controllers/pull.js");
      await pullChanges();
    }),
  )
  .command(
    "revert <commitHashID>",
    "Revert changes to a specific commit",
    (y) =>
      y.positional("commitHashID", {
        describe: "Commit hash ID to revert to",
        type: "string",
      }),
    handler(async (argv) => {
      const { revertChanges } = await import("./controllers/revert.js");
      await revertChanges(argv.commitHashID);
    }),
  )
  .command(
    "login",
    "Log in to GitVerse",
    (y) =>
      y
        .option("email", { type: "string", describe: "Account email" })
        .option("password", { type: "string", describe: "Account password" }),
    handler(async (argv) => {
      const { loginCli } = await import("./controllers/login.js");
      await loginCli({ email: argv.email, password: argv.password });
    }),
  )
  .command(
    "log",
    "Show local commit history",
    (y) =>
      y
        .option("oneline", {
          type: "boolean",
          default: false,
          describe: "One commit per line",
        })
        .option("n", { type: "number", describe: "Limit number of commits" }),
    handler(async (argv) => {
      const { logCommits } = await import("./controllers/log.js");
      await logCommits({ oneline: argv.oneline, limit: argv.n });
    }),
  )
  .command(
    "whoami",
    "Show linked repository and login status",
    {},
    handler(async () => {
      const { whoami } = await import("./controllers/whoami.js");
      await whoami();
    }),
  )
  .demandCommand(1, "You need to specify a command")
  .strict()
  .help()
  .parse();
