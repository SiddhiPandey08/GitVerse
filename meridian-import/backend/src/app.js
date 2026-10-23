import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/usersRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 5000);
app.use(
  cors({
    origin: ["https://meridian-vst3.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

app.get("/", (req, res) => {
  res.send("At your service");
});

app.use("/api/v1/users", userRoutes);
console.log(process.env.MONGODB_URI);

const start = async () => {
  const connectDB = await mongoose.connect(process.env.MONGODB_URI);
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
};
start();
