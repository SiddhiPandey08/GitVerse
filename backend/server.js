import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import mainRouter from "./routes/main.router.js";
import jwt from "jsonwebtoken";
import User from "./models/userModel.js";
import meetingRouter from "./routes/meeting.router.js";
import registerMeetingSockets from "./sockets/meeting.js";

export async function startServer() {
  console.log("Initializing the server...");

  const mongoDbUri = process.env.MONGODB_URI;
  if (!mongoDbUri) {
    throw new Error("MONGODB_URI is not set in backend/.env");
  }

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json()); // body-parser is redundant with Express 5
  app.use("/meetings", meetingRouter);
  app.use("/", mainRouter);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // no token = guest
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  registerMeetingSockets(io);

  io.on("connection", (socket) => {
    socket.on("join-room", (userId) => {
      // NOTE: the old code did `user = userId;` on an undeclared variable,
      // which throws a ReferenceError in an ES module and crashed the server.
      socket.join(userId);
    });
  });

  // Fail fast with a clear error instead of hanging silently.
  try {
    await mongoose.connect(mongoDbUri, { serverSelectionTimeoutMS: 8000 });
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new Error(`Could not connect to MongoDB: ${error.message}`);
  }

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
