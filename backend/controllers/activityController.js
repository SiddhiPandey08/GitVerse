import Repository from "../models/repoModel.js";
import Issue from "../models/issueModel.js";
import mongoose from "mongoose";
import Commit from "../models/commitModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";

const dateGroup = {
  $group: {
    _id: { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } },
    count: { $sum: 1 },
  },
};

const mergeActivity = (entries) => {
  const merged = {};
  for (const entry of entries) {
    merged[entry._id] = (merged[entry._id] || 0) + entry.count;
  }
  return Object.entries(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
};

const getVisibleRepoIds = async (user) => {
  const repositories = await Repository.find({
    $or: [
      { visibility: true },
      { owner: user._id },
      { collaborators: user._id },
    ],
  }).select("_id");
  return repositories.map((repo) => repo._id);
};

export const getUserActivity = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const repoIds = await getVisibleRepoIds(req.user);
    const [repoActivity, issueActivity, commitActivity] = await Promise.all([
      Repository.aggregate([
        {
          $match: {
            _id: { $in: repoIds },
            owner: new mongoose.Types.ObjectId(userId),
            createdAt: { $exists: true },
          },
        },
        dateGroup,
      ]),
      Issue.aggregate([
        {
          $match: {
            repository: { $in: repoIds },
            author: new mongoose.Types.ObjectId(userId),
            createdAt: { $exists: true },
          },
        },
        dateGroup,
      ]),
      Commit.aggregate([
        {
          $match: {
            repository: { $in: repoIds },
            author: new mongoose.Types.ObjectId(userId),
            createdAt: { $exists: true },
          },
        },
        dateGroup,
      ]),
    ]);

    res.status(200).json({
      activity: mergeActivity([
        ...repoActivity,
        ...issueActivity,
        ...commitActivity,
      ]),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoryActivity = async (req, res) => {
  const { repoId } = req.params;
  try {
    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ message: "Invalid repository id" });
    }

    const access = await getRepoAccess(repoId, req.user);
    if (!access) {
      return res.status(404).json({ message: "Repository not found" });
    }
    const repo = access.repo;

    const [repoActivity, issueActivity, commitActivity] = await Promise.all([
      Repository.aggregate([
        { $match: { _id: repo._id, createdAt: { $exists: true } } },
        dateGroup,
      ]),
      Issue.aggregate([
        { $match: { repository: repo._id, createdAt: { $exists: true } } },
        dateGroup,
      ]),
      Commit.aggregate([
        { $match: { repository: repo._id, createdAt: { $exists: true } } },
        dateGroup,
      ]),
    ]);

    res.status(200).json({
      activity: mergeActivity([
        ...repoActivity,
        ...issueActivity,
        ...commitActivity,
      ]),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
