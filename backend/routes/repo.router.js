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
} from "../controllers/repoControllers.js";

const repoRouter = express.Router();

repoRouter.post("/create", createRepository);
repoRouter.get("/all", getAllRepositories);
repoRouter.get("/:repoId", getRepositoryById);
repoRouter.get("/name/:repoName", getRepositoryByName);
repoRouter.get("/owner/:repoOwner", getRepositoryByOwner);
repoRouter.get("/user/:currUserId", getRepositoriesForCurrUser);
repoRouter.put("/update/:repoId", updateRepository);
repoRouter.patch("/toggle-visibility/:repoId", visibilityToggle);
repoRouter.patch("/toggle-star/:repoId", starToggle);
repoRouter.delete("/delete/:repoId", deleteRepository);

export default repoRouter;
