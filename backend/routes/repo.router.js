// repo.router.js — mounts all repository HTTP routes and their middleware chains.
// Talks to: repoControllers.js, authMiddleware.js, authorizeMiddleware.js.
// New: POST /:repoId/upload-urls (writer), POST /:repoId/download-urls (reader),
//      PATCH /:repoId/commits/:commitId/reviewed (owner), POST /:repoId/commits/:commitId/revert (owner).

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
  getRepoFile,
  listCollaborators,
  addCollaborator,
  removeCollaborator,
  markCommitReviewed,
  revertCommit,
  getUploadUrls,
  getDownloadUrls,
} from "../controllers/repoControllers.js";
import { listCollaborationRequests } from "../controllers/issueControllers.js";
import {
  scheduleMeeting,
  getUpcomingMeetings,
  cancelMeeting,
  startMeeting,
} from "../controllers/meetingControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  authorizeRepoOwner,
  authorizeRepoWriter,
} from "../middlewares/authorizeMiddleware.js";

const repoRouter = express.Router();

repoRouter.post("/create", authMiddleware, createRepository);

// getAllRepositories now requires auth — it filters results by what the caller can see.
repoRouter.get("/all", authMiddleware, getAllRepositories);

repoRouter.get("/user/:currUserId", authMiddleware, getRepositoriesForCurrUser);
repoRouter.get("/:repoId", authMiddleware, getRepositoryById);
repoRouter.get("/name/:repoName", authMiddleware, getRepositoryByName);
repoRouter.get("/owner/:repoOwner", authMiddleware, getRepositoryByOwner);

// Push route: owner OR collaborator can push (authorizeRepoWriter).
repoRouter.put(
  "/update/:repoId",
  authMiddleware,
  authorizeRepoWriter,
  updateRepository,
);

// Visibility toggle and delete remain owner-only.
repoRouter.patch(
  "/toggle-visibility/:repoId",
  authMiddleware,
  authorizeRepoOwner,
  visibilityToggle,
);

// Star requires auth to prevent anonymous abuse.
repoRouter.patch("/toggle-star/:repoId", authMiddleware, starToggle);

repoRouter.delete(
  "/delete/:repoId",
  authMiddleware,
  authorizeRepoOwner,
  deleteRepository,
);

repoRouter.get("/:repoId/file", authMiddleware, getRepoFile);
repoRouter.get("/:repoId/commits", authMiddleware, getRepoCommits);

// Signed S3 upload URLs: writer only (owner or collaborator) so viewers can't
// inject files.  The server validates the commitId and each file name.
repoRouter.post(
  "/:repoId/upload-urls",
  authMiddleware,
  authorizeRepoWriter,
  getUploadUrls,
);

// Signed S3 download URLs: getRepoAccess is enforced inline in the handler
// so public-repo viewers are also allowed (no authorizeRepoWriter needed).
repoRouter.post("/:repoId/download-urls", authMiddleware, getDownloadUrls);

// Mark a commit as reviewed — owner only so only the repo owner can sign off.
repoRouter.patch(
  "/:repoId/commits/:commitId/reviewed",
  authMiddleware,
  authorizeRepoOwner,
  markCommitReviewed,
);

// Create a web-side revert commit — owner only for the same reason.
repoRouter.post(
  "/:repoId/commits/:commitId/revert",
  authMiddleware,
  authorizeRepoOwner,
  revertCommit,
);

// Collaborator management — owner only for all three operations.
repoRouter.get(
  "/:repoId/collaborators",
  authMiddleware,
  authorizeRepoOwner,
  listCollaborators,
);
repoRouter.post(
  "/:repoId/collaborators",
  authMiddleware,
  authorizeRepoOwner,
  addCollaborator,
);
repoRouter.delete(
  "/:repoId/collaborators/:username",
  authMiddleware,
  authorizeRepoOwner,
  removeCollaborator,
);
repoRouter.get(
  "/:repoId/collab-requests",
  authMiddleware,
  authorizeRepoOwner,
  listCollaborationRequests,
);
repoRouter.post(
  "/:repoId/meetings/schedule",
  authMiddleware,
  scheduleMeeting,
);
repoRouter.get(
  "/:repoId/meetings/upcoming",
  authMiddleware,
  getUpcomingMeetings,
);
repoRouter.patch(
  "/:repoId/meetings/:meetingId/cancel",
  authMiddleware,
  cancelMeeting,
);
repoRouter.post(
  "/:repoId/meetings/start",
  authMiddleware,
  startMeeting,
);

export default repoRouter;
