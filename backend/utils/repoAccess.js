import mongoose from "mongoose";
import Repository from "../models/repoModel.js";

/**
 * Resolve access to a repository for a given user.
 *
 * Returns null when:
 *   - user is falsy (unauthenticated)
 *   - repoId is not a valid ObjectId
 *   - the repository does not exist
 *   - the repository is private (visibility === false) and the user is not the owner
 *
 * Returns { repo, isOwner } on success.
 *
 * @param {string} repoId
 * @param {import("../models/userModel.js").default} user  Mongoose User document
 */
export async function getRepoAccess(repoId, user) {
  if (!user) return null;
  if (!mongoose.isValidObjectId(repoId)) return null;

  const repo = await Repository.findById(repoId).select("owner visibility");
  if (!repo) return null;

  const isOwner = String(repo.owner) === String(user._id);

  if (repo.visibility === false && !isOwner) return null;

  return { repo, isOwner };
}
