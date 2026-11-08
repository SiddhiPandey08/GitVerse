// repoControllers.js — HTTP handlers for repository CRUD, visibility, starring,
//   commits, file access (upload-urls, download-urls, streaming), collaborator
//   management, review flagging, and revert.
// Talks to: repoModel.js, userModel.js, issueModel.js, commitModel.js,
//           config/aws-config.js, utils/repoAccess.js, utils/chatHelpers.js,
//           models/channelModel.js (for socket disconnect on collaborator removal).

import Repository from "../models/repoModel.js";
import User from "../models/userModel.js";
import Issue from "../models/issueModel.js";
import Commit from "../models/commitModel.js";
import Channel from "../models/channelModel.js";
import { s3, S3_BUCKET } from "../config/aws-config.js";
import { getRepoAccess, sameId } from "../utils/repoAccess.js";
import { postChannelMessage } from "../utils/chatHelpers.js";

export const createRepository = async (req, res) => {
  // `owner` comes from the verified JWT (req.user), never from the request body,
  // so nobody can create a repository under someone else's account.
  const { name, issues, content, description, visibility } = req.body;
  try {
    const owner = req.user?._id;
    if (!owner) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!name) {
      return res.status(400).json({ message: "Repository name is needed" });
    }
    const newRepo = new Repository({
      name,
      description,
      owner,
      issues,
      visibility,
      content,
    });

    const result = await newRepo.save();

    await Channel.bulkWrite(
      ["general", "collab-requests", "meetings"].map((name) => ({
        updateOne: {
          filter: { repo: result._id, name },
          update: {
            $setOnInsert: {
              repo: result._id,
              name,
              createdBy: owner,
            },
          },
          upsert: true,
        },
      })),
    );

    await Commit.create({
      author: owner,
      message: "Initial commit",
      repository: result._id,
    });

    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Returns repos that the authenticated caller can actually see:
// public repos OR repos where the caller is the owner or a collaborator.
// Requires auth — visitors must log in to browse.
export const getAllRepositories = async (req, res) => {
  try {
    const userId = req.user._id;
    const repositories = await Repository.find({
      $or: [
        { visibility: true },
        { owner: userId },
        { collaborators: userId },
      ],
    })
      .populate("owner", "-password")
      .populate("issues");
    res.status(200).json({ repositories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns a single repo by id, enriched with the caller's role.
// The `role` field lets the frontend decide what UI options to show.
export const getRepositoryById = async (req, res) => {
  const { repoId } = req.params;

  try {
    // Use getRepoAccess so private repos are hidden from non-members.
    const access = await getRepoAccess(repoId, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const result = await Repository.findById(repoId)
      .populate("owner", "-password")
      .populate("issues")
      .populate("collaborators", "username");

    if (!result) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Attach the caller's role so the frontend doesn't have to recalculate it.
    res.status(200).json({ ...result.toObject(), role: access.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoryByName = async (req, res) => {
  const { repoName } = req.params;

  try {
    const repositories = await Repository.find({ name: repoName })
      .populate("owner", "-password")
      .populate("issues");
    const result = [];
    for (const repository of repositories) {
      if (await getRepoAccess(repository._id, req.user)) {
        result.push(repository);
      }
    }
    if (result.length === 0) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoryByOwner = async (req, res) => {
  const { repoOwner } = req.params;
  try {
    const repositories = await Repository.find({ owner: repoOwner })
      .populate("owner", "-password")
      .populate("issues");
    const visibleRepositories = [];
    for (const repository of repositories) {
      if (await getRepoAccess(repository._id, req.user)) {
        visibleRepositories.push(repository);
      }
    }

    if (visibleRepositories.length === 0) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }
    res.status(200).json({
      repositories: visibleRepositories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns repos owned by the user plus repos where they're a collaborator,
// each decorated with a `role` field so the dashboard can show "owner" vs
// "collaborator" without a second API call.  The outer array shape is kept
// the same as before (raw array, not wrapped) so frontend code doesn't break.
export const getRepositoriesForCurrUser = async (req, res) => {
  const { currUserId } = req.params;
  try {
    if (!sameId(currUserId, req.user._id)) {
      return res.status(403).json({ message: "You can only list your own repositories" });
    }

    // Fetch owned repos and collaborator repos in parallel for speed.
    const [ownedRepos, collabRepos] = await Promise.all([
      Repository.find({ owner: currUserId })
        .populate("issues")
        .populate("owner", "-password"),
      Repository.find({ collaborators: currUserId })
        .populate("issues")
        .populate("owner", "-password"),
    ]);

    if (ownedRepos.length === 0 && collabRepos.length === 0) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Tag each repo with the caller's role before merging into one list.
    const withRole = [
      ...ownedRepos.map((r) => ({ ...r.toObject(), role: "owner" })),
      ...collabRepos.map((r) => ({ ...r.toObject(), role: "collaborator" })),
    ];

    res.status(200).json(withRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Push route handler — creates a commit linked to the authenticated user.
// The caller's identity (author) is always taken from req.user, so the CLI
// can't impersonate another user by sending a different author in the body.
// When reviewRequested is true, posts to #general via postChannelMessage.
// KEY SAFETY: every file key must start with "<repoId>/" (or "<repoId>/<commitId>/")
// — this prevents a collaborator from registering S3 keys that belong to another repo.
export const updateRepository = async (req, res) => {
  const { repoId } = req.params;
  const {
    description,
    content,
    message,
    files,
    reviewRequested,
    commitId,
    commit,
  } = req.body;
  const author = req.user._id; // always from the verified JWT, never from client
  try {
    if (!message) {
      return res.status(400).json({ message: "Commit message is required" });
    }
    if (
      reviewRequested &&
      !req.repo.collaborators.some((id) => sameId(id, author))
    ) {
      return res.status(403).json({
        message: "Only collaborators can request a review",
      });
    }

    // Reject any key that doesn't start with "<repoId>/<commitId>/" (or "<repoId>/")
    // — prevents hand-crafted requests from sneaking foreign keys past the push handler.
    const cId = commitId || (commit && commit.id);
    const fileList = files || [];
    const badKeys = fileList.filter((k) => {
      if (typeof k !== "string") return true;
      if (cId) {
        return !k.startsWith(`${repoId}/${cId}/`);
      }
      return !k.startsWith(`${repoId}/`);
    });
    if (badKeys.length > 0) {
      return res.status(400).json({
        message: "All file keys must belong to this repository and commit",
        badKeys,
      });
    }

    const updatedRepo = await Repository.findByIdAndUpdate(
      repoId,
      { description, content },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedRepo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const newCommit = await Commit.create({
      author,
      message,
      repository: repoId,
      files: fileList,
      reviewRequested: Boolean(reviewRequested),
    });

    // Post a channel message when the pusher has asked for a review.
    // The io instance is attached to the app in server.js; fetching it here
    // keeps chatHelpers.js free of circular imports.
    if (reviewRequested) {
      const io = req.app.get("io");
      const shortId = String(newCommit._id).slice(-7);
      await postChannelMessage(
        io,
        repoId,
        "general",
        author,
        `requested review on commit ${shortId}: ${message}`,
        req.user.username,
      );
    }

    res.status(200).json(updatedRepo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const visibilityToggle = async (req, res) => {
  const { repoId } = req.params;
  try {
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    repo.visibility = !repo.visibility;

    const updatedRepo = await repo.save();
    res.status(200).json({
      updatedRepo,
      message: "Repository visibility toggled successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Starring requires auth so we know who starred (and to prevent anonymous abuse).
export const starToggle = async (req, res) => {
  const { repoId } = req.params;
  try {
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Toggle the boolean state (or initialize it to true if undefined)
    repo.isStarred = !repo.isStarred;

    const updatedRepo = await repo.save();
    return res.status(200).json({
      updatedRepo,
      message: "Repository star status toggled successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRepository = async (req, res) => {
  const { repoId } = req.params;
  try {
    const result = await Repository.findByIdAndDelete(repoId);
    if (!result) {
      return res.status(404).json({ message: "Repository not found" });
    }
    res.json({ message: "Repository deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns all commits for a repo, oldest first, with author username and
// the new review/revert fields populated so the frontend can display them.
export const getRepoCommits = async (req, res) => {
  const { repoId } = req.params;
  try {
    const access = await getRepoAccess(repoId, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const commits = await Commit.find({ repository: repoId })
      .sort({ createdAt: 1 }) // oldest first, matching commit order
      .populate("author", "username")
      .populate("reviewedBy", "username")
      .populate("revertOf", "message");

    res.status(200).json({ commits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /repositories/:repoId/file?key=<repoId>/<commitId>/<name>
export const getRepoFile = async (req, res) => {
  const { repoId } = req.params;
  const { key } = req.query;

  // The key must belong to this repo...
  if (
    typeof key !== "string" ||
    !key.startsWith(`${repoId}/`) ||
    key.split("/").includes("..")
  ) {
    return res.status(400).json({ message: "Invalid file key" });
  }

  try {
    const access = await getRepoAccess(repoId, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // ...and must be a file that one of this repo's commits actually registered.
    const registered = await Commit.exists({ repository: repoId, files: key });
    if (!registered) {
      return res.status(404).json({ message: "File not found" });
    }

    // Always sent as a download so a browser never renders or runs an
    // uploaded HTML/JS file from your API's origin.
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment");
    res.setHeader("X-Content-Type-Options", "nosniff");

    const stream = s3
      .getObject({ Bucket: S3_BUCKET, Key: key })
      .createReadStream();
    stream.on("error", (err) => {
      if (res.headersSent) return res.end();
      res
        .status(err.statusCode === 404 ? 404 : 500)
        .json({ message: "Could not read file from storage" });
    });
    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: error.message });
  }
};

// ─── Signed upload / download URLs ──────────────────────────────────────────

// POST /repositories/:repoId/upload-urls — writer only (owner or collaborator).
// Issues short-lived S3 presigned PUT URLs so the CLI can upload files directly
// to S3 without needing AWS credentials.  The Bucket is read from server env only.
// Validates commitId (UUID), file count (1-50), and each file name (no path chars).
export const getUploadUrls = async (req, res) => {
  const { repoId } = req.params;
  const { commitId, files } = req.body;

  // commitId must be a standard UUID (the CLI generates them with uuid v4).
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!commitId || !UUID_RE.test(commitId)) {
    return res.status(400).json({ message: "commitId must be a valid UUID" });
  }

  if (!Array.isArray(files) || files.length < 1 || files.length > 50) {
    return res
      .status(400)
      .json({ message: "files must be an array of 1-50 names" });
  }

  // Each name must be a plain filename: no slashes, no backslashes, no "..",
  // no leading dot-dot, and no longer than 120 characters.
  const invalidName = files.find(
    (n) =>
      typeof n !== "string" ||
      n.length === 0 ||
      n.length > 120 ||
      n.includes("/") ||
      n.includes("\\") ||
      n === ".." ||
      n.startsWith(".."),
  );
  if (invalidName !== undefined) {
    return res.status(400).json({
      message:
        "Each file name must be a plain filename with no path separators or leading '..'",
    });
  }

  try {
    const results = await Promise.all(
      files.map(async (name) => {
        const key = `${repoId}/${commitId}/${name}`;
        const url = await s3.getSignedUrlPromise("putObject", {
          Bucket: S3_BUCKET,
          Key: key,
          Expires: 300, // 5 minutes — enough for any reasonably sized file
        });
        return { name, key, url };
      }),
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /repositories/:repoId/download-urls — viewers of public repos allowed;
// private repos require owner or collaborator (enforced via getRepoAccess).
// Issues short-lived S3 presigned GET URLs so the CLI can download files
// without AWS credentials.  Every key must start with "<repoId>/".
export const getDownloadUrls = async (req, res) => {
  const { repoId } = req.params;
  const { keys } = req.body;

  try {
    const access = await getRepoAccess(repoId, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ message: "keys must be a non-empty array" });
    }

    // Guard: every key must belong to this repo to prevent cross-repo leaks.
    const badKeys = keys.filter((k) => !String(k).startsWith(`${repoId}/`));
    if (badKeys.length > 0) {
      return res.status(400).json({
        message: "All keys must belong to this repository",
        badKeys,
      });
    }

    const results = await Promise.all(
      keys.map(async (key) => {
        const url = await s3.getSignedUrlPromise("getObject", {
          Bucket: S3_BUCKET,
          Key: key,
          Expires: 300,
        });
        return { key, url };
      }),
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Review flag ─────────────────────────────────────────────────────────────

// PATCH /repositories/:repoId/commits/:commitId/reviewed — owner only.
// Stamps reviewedBy/reviewedAt on the commit and posts a confirmation
// message to #general so collaborators can see the review was completed.
export const markCommitReviewed = async (req, res) => {
  const { repoId, commitId } = req.params;
  const io = req.app.get("io");

  try {
    const commit = await Commit.findOne({ _id: commitId, repository: repoId });
    if (!commit) {
      return res.status(404).json({ message: "Commit not found" });
    }

    // Stamp the reviewer fields — idempotent if called twice.
    commit.reviewedBy = req.user._id;
    commit.reviewedAt = new Date();
    await commit.save();

    const shortId = String(commit._id).slice(-7);
    await postChannelMessage(
      io,
      repoId,
      "general",
      req.user._id,
      `marked commit ${shortId} as reviewed`,
      req.user.username,
    );

    res.status(200).json({
      message: "Commit marked as reviewed",
      reviewedBy: req.user._id,
      reviewedAt: commit.reviewedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Web-side revert ─────────────────────────────────────────────────────────

// POST /repositories/:repoId/commits/:commitId/revert — owner only.
// Creates a new commit that restores the file state as it was at the target
// commit, without touching S3 (existing keys are reused so no copying needed).
//
// Algorithm:
//  1. Extract file names from the target commit's S3 keys.
//  2. For each name, find the latest commit BEFORE the target that contains
//     a key for that name — that key becomes the restored version.
//  3. If no earlier version exists, the name goes into removedFiles (the
//     file didn't exist before this commit, so reverting means deleting it).
//  4. If any LATER commit (after the target) also touches one of those names,
//     respond 409 with the conflicting names and change nothing — the caller
//     must resolve the conflict first.
//  5. Otherwise create the new revert commit.
export const revertCommit = async (req, res) => {
  const { repoId, commitId } = req.params;

  try {
    // Load the target commit and all commits for this repo ordered oldest-first.
    const [targetCommit, allCommits] = await Promise.all([
      Commit.findOne({ _id: commitId, repository: repoId }),
      Commit.find({ repository: repoId }).sort({ createdAt: 1 }),
    ]);

    if (!targetCommit) {
      return res.status(404).json({ message: "Commit not found" });
    }

    const targetTime = targetCommit.createdAt.getTime();

    // Extract the bare file name from each S3 key in the target commit.
    // Keys look like "<repoId>/<commitDir>/<filename>".
    const targetNames = (targetCommit.files || []).map((k) =>
      k.split("/").pop(),
    );

    if (targetNames.length === 0) {
      return res
        .status(400)
        .json({ message: "Target commit has no files to revert" });
    }

    // Separate commits into those before and those after the target.
    const earlierCommits = allCommits.filter(
      (c) =>
        c.createdAt.getTime() < targetTime &&
        String(c._id) !== String(commitId),
    );
    const laterCommits = allCommits.filter(
      (c) =>
        c.createdAt.getTime() > targetTime &&
        String(c._id) !== String(commitId),
    );

    // Build a map of name -> latest S3 key from commits BEFORE the target.
    // We iterate oldest-to-newest so the last write wins.
    const nameToEarlierKey = new Map();
    for (const c of earlierCommits) {
      for (const key of c.files || []) {
        const name = key.split("/").pop();
        nameToEarlierKey.set(name, key);
      }
    }

    // Check for conflicts: any later commit that also contains one of the
    // target's file names blocks the revert to avoid silent overwrites.
    const laterNames = new Set();
    for (const c of laterCommits) {
      for (const key of c.files || []) {
        laterNames.add(key.split("/").pop());
      }
    }

    const conflicts = targetNames.filter((n) => laterNames.has(n));
    if (conflicts.length > 0) {
      return res.status(409).json({
        message:
          "Cannot revert: later commits have modified the following files",
        conflicts,
      });
    }

    // Build the restored file list and the removedFiles list.
    const restoredKeys = [];
    const removedFiles = [];

    for (const name of targetNames) {
      const earlierKey = nameToEarlierKey.get(name);
      if (earlierKey) {
        // Reuse the existing S3 key — no copying needed.
        restoredKeys.push(earlierKey);
      } else {
        // No version existed before this commit, so reverting means deleting it.
        removedFiles.push(name);
      }
    }

    // Create the revert commit.  Author is the requester (req.user), not the
    // original author, because this is a new action recorded on behalf of
    // the person who triggered the revert.
    const newCommit = await Commit.create({
      author: req.user._id,
      message: `Revert "${targetCommit.message}"`,
      repository: repoId,
      files: restoredKeys,
      removedFiles,
      revertOf: targetCommit._id,
    });

    res.status(201).json({ commit: newCommit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Collaborator management ──────────────────────────────────────────────────
// Only the repo owner can add or remove collaborators.

// Lists all collaborators for a repo (by username).
export const listCollaborators = async (req, res) => {
  const { repoId } = req.params;
  try {
    const repo = await Repository.findById(repoId).populate(
      "collaborators",
      "username",
    );
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }
    res.json({ collaborators: repo.collaborators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adds a user as a collaborator by username.
// Uses $addToSet so calling this twice for the same user is harmless.
// 400 if trying to add the owner (they already have full access).
export const addCollaborator = async (req, res) => {
  const { repoId } = req.params;
  const { username } = req.body;

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: `User '${username}' not found` });
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // The owner doesn't need to be in the collaborators list — they already own it.
    if (sameId(repo.owner, targetUser._id)) {
      return res
        .status(400)
        .json({ message: "Cannot add the repository owner as a collaborator" });
    }

    const updated = await Repository.findByIdAndUpdate(
      repoId,
      { $addToSet: { collaborators: targetUser._id } },
      { new: true },
    ).populate("collaborators", "username");

    res.json({
      message: `${username} added as collaborator`,
      collaborators: updated.collaborators,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Removes a collaborator by username.
// After removing them from the DB, we also evict any live sockets they have
// open inside this repo's channel rooms so they immediately lose access
// without needing to disconnect/reconnect.  Rooms are named `channel:<id>`.
export const removeCollaborator = async (req, res) => {
  const { repoId, username } = req.params;

  try {
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: `User '${username}' not found` });
    }

    const updated = await Repository.findByIdAndUpdate(
      repoId,
      { $pull: { collaborators: targetUser._id } },
      { new: true },
    ).populate("collaborators", "username");

    if (!updated) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Disconnect the removed collaborator's sockets from every channel room
    // in this repo so real-time access is revoked immediately.
    // We fetch all channels for the repo, then iterate every socket in each
    // room and force-leave any socket whose socket.user._id matches.
    const io = req.app.get("io");
    if (io) {
      const channels = await Channel.find({ repo: repoId }).select("_id");
      for (const channel of channels) {
        const room = `channel:${channel._id}`;
        const sockets = await io.in(room).fetchSockets();
        for (const sock of sockets) {
          if (
            sock.data?.user &&
            sameId(sock.data.user._id, targetUser._id)
          ) {
            sock.leave(room);
          } else if (
            sock.user &&
            sameId(sock.user._id, targetUser._id)
          ) {
            // socket.user is set directly on the socket object in server.js
            sock.leave(room);
          }
        }
      }
    }

    res.json({
      message: `${username} removed from collaborators`,
      collaborators: updated.collaborators,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
