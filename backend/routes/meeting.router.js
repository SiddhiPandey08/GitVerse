import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getHistory, addToHistory } from "../controllers/meetingControllers.js";

const router = express.Router();
router.get("/history", authMiddleware, getHistory);
router.post("/history", authMiddleware, addToHistory);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ username: req.user.username });
});
export default router;
