// authorizeMiddleware.js — route-level guards that run after authMiddleware.
// Talks to: repoModel.js (ownership check), utils/repoAccess.js (writer check).

import Repository from "../models/repoModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";

// Confirms the authenticated user is the OWNER of the repo in :repoId.
// Used on delete, toggle-visibility, and collaborator-management routes
// where only the owner is ever allowed.
export const authorizeRepoOwner = async (req, res, next) => {
  const { repoId } = req.params;

  try {
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to modify this repository",
        });
    }

    req.repo = repo; // pass along so the controller doesn't need to refetch
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirms the user is either the OWNER or a COLLABORATOR of the repo.
// Used on the push (PUT /repositories/update/:repoId) route so collaborators
// can push commits without being full owners.
export const authorizeRepoWriter = async (req, res, next) => {
  const { repoId } = req.params;

  try {
    // getRepoAccess handles the ObjectId validity check and the privacy check.
    const access = await getRepoAccess(repoId, req.user);

    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // "viewer" role means the user has no write access.
    if (!access.canPush) {
      return res
        .status(403)
        .json({ message: "You do not have write access to this repository" });
    }

    req.repo = access.repo; // saves the controller from doing another DB hit
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
