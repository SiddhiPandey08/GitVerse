// issueControllers.js — CRUD for issues, plus the grant-collaborator action.
// Talks to: issueModel.js, repoModel.js, utils/repoAccess.js, utils/chatHelpers.js.
// All routes require authMiddleware (see issue.router.js).

import Issue from "../models/issueModel.js";
import Repository from "../models/repoModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";
import { postChannelMessage } from "../utils/chatHelpers.js";

// Creates a new issue on a repo.
// Only users who have at least viewer access (i.e. getRepoAccess is non-null)
// may open an issue — this prevents strangers from spamming private repos.
// author is always set from req.user, never from the request body.
export const createIssue = async (req, res) => {
  const { title, description, repository, requestCollaboration } = req.body;
  try {
    if (!repository) {
      return res.status(400).json({ message: "Repository id is needed" });
    }

    // Check that the caller can actually see this repo.
    const access = await getRepoAccess(repository, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const newIssue = new Issue({
      repository,
      title,
      description,
      author: req.user._id, // always from the verified JWT
      requestCollaboration: Boolean(requestCollaboration),
    });
    const result = await newIssue.save();

    // Post an automated message to #collab-requests so the team can see new issues.
    // We get the io instance from app.set("io", io) in server.js.
    try {
      const io = req.app.get("io");
      if (io) {
        const collabNote = result.requestCollaboration
          ? " (is requesting collaborator access)"
          : "";
        await postChannelMessage(
          io,
          repository,
          "collab-requests",
          req.user._id,
          `opened issue: ${title}${collabNote}`,
          req.user.username,
        );
      }
    } catch {
      // Don't fail the whole request if the channel post fails — it's non-critical.
    }

    res.status(201).json({ message: "Issue created successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lists all issues for a repository.
// The missing `await` in the original code meant it returned a Mongoose Query
// object instead of the actual array — fixed here.
export const getAllIssues = async (req, res) => {
  const { id } = req.params;

  try {
    const issues = await Issue.find({ repository: id }).populate(
      "author",
      "username",
    );
    if (!issues || issues.length === 0) {
      return res.json({ message: "This repository has no issues associated" });
    }
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id).populate("author", "username");
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Updates an issue's title, description, or status.
// Allowed only for the repo owner OR the issue's original author.
export const updateIssueById = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check whether the caller is the repo owner or the issue author.
    const access = await getRepoAccess(String(issue.repository), req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const isIssueAuthor = String(issue.author) === String(req.user._id);
    if (!access.isOwner && !isIssueAuthor) {
      return res
        .status(403)
        .json({ message: "Only the repo owner or issue author can update this issue" });
    }

    const updated = await Issue.findByIdAndUpdate(
      id,
      { title, description, status },
      { returnDocument: "after", runValidators: true },
    );
    res.json({ issue: updated, message: "Issue updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletes an issue.
// Same permission rule as update: repo owner or issue author.
export const deleteIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const access = await getRepoAccess(String(issue.repository), req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const isIssueAuthor = String(issue.author) === String(req.user._id);
    if (!access.isOwner && !isIssueAuthor) {
      return res
        .status(403)
        .json({ message: "Only the repo owner or issue author can delete this issue" });
    }

    await Issue.findByIdAndDelete(id);
    res.json({ message: "Issue deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grants collaborator access to the user who opened a "request collaboration" issue.
// Only the repo owner can call this. The issue must have requestCollaboration=true.
// Uses $addToSet so adding the same person twice is safe.
export const grantCollaborator = async (req, res) => {
  const { id } = req.params; // issue id

  try {
    const issue = await Issue.findById(id).populate("author", "username");
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Only the repo owner is allowed to grant this.
    const access = await getRepoAccess(String(issue.repository), req.user);
    if (!access || !access.isOwner) {
      return res.status(403).json({ message: "Only the repository owner can grant collaborator access" });
    }

    // The issue must actually be a collaboration request.
    if (!issue.requestCollaboration) {
      return res
        .status(400)
        .json({ message: "This issue is not a collaboration request" });
    }

    // Add the issue author to collaborators (idempotent: $addToSet won't duplicate).
    const repo = await Repository.findByIdAndUpdate(
      issue.repository,
      { $addToSet: { collaborators: issue.author._id } },
      { new: true },
    );

    // Close the issue now that it's been handled.
    issue.status = "closed";
    await issue.save();

    // Announce the grant in #collab-requests.
    try {
      const io = req.app.get("io");
      if (io) {
        await postChannelMessage(
          io,
          String(issue.repository),
          "collab-requests",
          req.user._id,
          `${req.user.username} granted ${issue.author.username} collaborator access`,
          req.user.username,
        );
      }
    } catch {
      // Non-critical — don't fail the whole request.
    }

    res.json({
      message: `${issue.author.username} is now a collaborator`,
      repo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
