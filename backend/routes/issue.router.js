import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
} from "../controllers/issueControllers.js";

import express from "express";

const issueRouter = express.Router();

issueRouter.post("/create", createIssue);
issueRouter.get("/repo/:id", getAllIssues);
issueRouter.get("/:id", getIssueById);
issueRouter.put("/update/:id", updateIssueById);
issueRouter.delete("/delete/:id", deleteIssueById);

export default issueRouter;
