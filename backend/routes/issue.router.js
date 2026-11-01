// issue.router.js — mounts all issue HTTP routes.
// Talks to: issueControllers.js, authMiddleware.js.

import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
  grantCollaborator,
} from "../controllers/issueControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import express from "express";

const issueRouter = express.Router();

// All issue routes require a logged-in user — prevents anonymous issue spam
// and ensures author is always available on req.user.
issueRouter.use(authMiddleware);

issueRouter.post("/create", createIssue);
issueRouter.get("/repo/:id", getAllIssues);
issueRouter.get("/:id", getIssueById);
issueRouter.put("/update/:id", updateIssueById);
issueRouter.delete("/delete/:id", deleteIssueById);

// Repo owner calls this to approve a collaboration request and add the
// issue's author to the repo's collaborators list.
issueRouter.post("/:id/grant-collaborator", grantCollaborator);

export default issueRouter;
