// server.js — boots Express, connects to MongoDB, wires up Socket.io.
// Talks to: all routers (main.router.js, meeting.router.js, chat.router.js),
//           sockets/meeting.js, sockets/channels.js, models/userModel.js.

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import mainRouter from "./routes/main.router.js";
import jwt from "jsonwebtoken";
import User from "./models/userModel.js";
import meetingRouter from "./routes/meeting.router.js";
import registerMeetingSockets from "./sockets/meeting.js";
import chatRouter from "./routes/chat.router.js";
import registerChannelSockets from "./sockets/channels.js";

export async function startServer() {
  console.log("Initializing the server...");

  const mongoDbUri = process.env.MONGODB_URI;
  if (!mongoDbUri) {
    throw new Error("MONGODB_URI is not set in backend/.env");
  }

  // Parse allowed origins from CLIENT_ORIGIN env var (comma-separated list).
  // Default to localhost:5173 for local dev. Never use "*" — that bypasses cookies.
  const allowedOrigins = (
    process.env.CLIENT_ORIGIN || "http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  };

  const app = express();
  // When deployed on Render, Vercel, or any reverse-proxy host the real client
  // IP arrives in X-Forwarded-For.  "trust proxy 1" tells Express to read it
  // so that express-rate-limit counts requests per real IP, not the proxy IP.
  app.set("trust proxy", 1);
  app.use(cors(corsOptions));
  app.use(express.json());

  // Rate-limit the /chat and /issues API paths — prevents bulk scraping or spam.
  // 100 requests per 15 minutes per IP is generous for normal use.
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
  });

  app.use("/meetings", meetingRouter);
  app.use("/chat", apiLimiter, chatRouter);
  // Apply the same rate limit to /issues — both are high-frequency write surfaces.
  app.use("/issues", apiLimiter);
  app.use("/", mainRouter);        // /issues lives inside mainRouter

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Make io available to controllers via req.app.get("io").
  // This lets issueControllers.js post automated channel messages without
  // importing io directly (which would create a circular dependency).
  app.set("io", io);

  // Authenticate socket connections via the JWT sent in handshake auth.
  // Unauthenticated sockets are allowed through (socket.user stays undefined)
  // but meeting.js and channels.js will reject them for protected actions.
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // no token = guest socket
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  registerMeetingSockets(io);
  registerChannelSockets(io);

  io.on("connection", (socket) => {
    // join-room lets a user subscribe to personal notifications (e.g. DMs).
    // We only allow the socket to join a room that matches its own user id
    // — otherwise any client could eavesdrop on another user's room.
    socket.on("join-room", (userId) => {
      if (!socket.user || String(socket.user._id) !== String(userId)) return;
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
