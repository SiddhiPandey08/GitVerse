import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { initRepo } from "./controllers/init.js";
import { addFiles } from "./controllers/add.js";
import { commitChanges } from "./controllers/commit.js";
import { pushChanges } from "./controllers/push.js";
import { pullChanges } from "./controllers/pull.js";
import { revertChanges } from "./controllers/revert.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import mainRouter from "./routes/main.router.js";

dotenv.config();

yargs(hideBin(process.argv))
  .command("launch", "Launching the server", {}, initializeServer)
  .command("init", "Initialize the application", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File will be added to staging",
        type: "string",
      });
    },
    (argv) => addFiles(argv.file),
  )
  .command(
    "commit <message>",
    "Commit staged files with a message",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => commitChanges(argv.message),
  )
  .command("push", "Push changes to the remote repository", {}, pushChanges)
  .command("pull", "Pull changes from the remote repository", {}, pullChanges)
  .command(
    "revert <commitHashID>",
    "Revert changes to a specific commit",
    (yargs) => {
      yargs.positional("commitHashID", {
        describe: "Commit hash ID to revert to",
        type: "string",
      });
    },
    (argv) => revertChanges(argv.commitHashID),
  )
  .demandCommand(1, "You need to specify a command")
  .help().argv;

function initializeServer() {
  console.log("Initializing the server...");
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(bodyParser.json());
  app.use(express.json());
  const server = http.createServer(app);

  const mongoDbUri = process.env.MONGODB_URI;
  mongoose
    .connect(mongoDbUri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });

  app.use("/", mainRouter);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (userId) => {
      user = userId;
      console.log("===");
      console.log(user);
      console.log("===");
      socket.join(userId);
    });
  });

  const db = mongoose.connection;
  db.once("open", () => {
    console.log("CRUD operations are ready to be performed.");
  });

  httpServer.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
}
