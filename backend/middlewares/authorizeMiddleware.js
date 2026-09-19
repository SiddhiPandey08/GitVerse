import Repository from "../models/repoModel.js";

// Runs after authMiddleware — req.user must already be set.
// Confirms the authenticated user actually owns the repo they're
// trying to modify (update/delete/toggle-visibility, etc).
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
