import express from "express";
import {
  getUserActivity,
  getRepositoryActivity,
} from "../controllers/activityController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const activityRouter = express.Router();
activityRouter.get("/repo/:repoId", authMiddleware, getRepositoryActivity);
activityRouter.get("/:userId", authMiddleware, getUserActivity);

export default activityRouter;
