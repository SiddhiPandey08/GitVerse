// repoAccess.js — single source of truth for "can this user see/write this repo?"
// Talks to: repoModel.js (database lookup). Used by chatControllers.js, sockets/meeting.js,
//           sockets/channels.js, issueControllers.js, authorizeMiddleware.js.

import mongoose from "mongoose";
import Repository from "../models/repoModel.js";

/**
 * Resolves what role a user has on a repository.
 *
 * Returns null when access should be completely denied:
 *   - no user (unauthenticated)
 *   - repoId is not a valid MongoDB ObjectId
 *   - the repository doesn't exist in the database
 *   - repo is private AND the user is neither the owner nor a collaborator
 *
 * Returns an access object on success:
 *   { repo, role: "owner"|"collaborator"|"viewer", isOwner, isCollaborator, canPush }
 *
 * "canPush" is true for owners and collaborators — it gates the push route
 * and join-call for private repos.
 */
export async function getRepoAccess(repoId, user) {
  // Reject immediately if there's no authenticated user or the id is garbage.
  if (!user) return null;
  if (!mongoose.isValidObjectId(repoId)) return null;

  // Fetch only the fields we need for the access check (lean query for speed).
  const repo = await Repository.findById(repoId).select(
    "owner visibility collaborators",
  );
  if (!repo) return null;

  const isOwner = String(repo.owner) === String(user._id);
  // collaborators is an array of ObjectIds — compare as strings to be safe.
  const isCollaborator =
    !isOwner &&
    repo.collaborators.some((id) => String(id) === String(user._id));

  // Private repos are visible only to owner and collaborators.
  if (repo.visibility === false && !isOwner && !isCollaborator) return null;

  const role = isOwner ? "owner" : isCollaborator ? "collaborator" : "viewer";
  const canPush = isOwner || isCollaborator;

  return { repo, role, isOwner, isCollaborator, canPush };
}
