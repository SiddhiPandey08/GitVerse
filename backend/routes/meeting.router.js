import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getHistory, addToHistory } from "../controllers/meetingControllers.js";

const router = express.Router();
router.get("/history", authMiddleware, getHistory);
router.post("/history", authMiddleware, addToHistory);

export default router;
