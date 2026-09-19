import express from "express";
import {
  createRepository,
  getAllRepositories,
  getRepositoryById,
  getRepositoryByName,
  getRepositoryByOwner,
  updateRepository,
  visibilityToggle,
  starToggle,
  deleteRepository,
  getRepositoriesForCurrUser,
  getRepoCommits,
} from "../controllers/repoControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRepoOwner } from "../middlewares/authorizeMiddleware.js";

const repoRouter = express.Router();

repoRouter.post("/create", authMiddleware, createRepository);
repoRouter.get("/all", getAllRepositories);
repoRouter.get("/:repoId", getRepositoryById);
repoRouter.get("/name/:repoName", getRepositoryByName);
repoRouter.get("/owner/:repoOwner", getRepositoryByOwner);
repoRouter.get("/user/:currUserId", getRepositoriesForCurrUser);
repoRouter.put(
  "/update/:repoId",
  authMiddleware,
  authorizeRepoOwner,
  updateRepository,
);
repoRouter.patch(
  "/toggle-visibility/:repoId",
  authMiddleware,
  authorizeRepoOwner,
  visibilityToggle,
);
repoRouter.patch("/toggle-star/:repoId", starToggle);
repoRouter.delete(
  "/delete/:repoId",
  authMiddleware,
  authorizeRepoOwner,
  deleteRepository,
);
repoRouter.get("/:repoId/commits", authMiddleware, getRepoCommits);
export default repoRouter;
