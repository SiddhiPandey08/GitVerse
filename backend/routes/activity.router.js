import express from "express";
import { getUserActivity } from "../controllers/activityController.js";

const activityRouter = express.Router();
activityRouter.get("/:userId", getUserActivity);

export default activityRouter;
