import Repository from "../models/repoModel.js";
import Issue from "../models/issueModel.js";
import mongoose from "mongoose";
import Commit from "../models/commitModel.js";
export const getUserActivity = async (req, res) => {
  const { userId } = req.params;
  try {
    const repoActivity = await Repository.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
          createdAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const repoIds = (await Repository.find({ owner: userId })).map(
      (repo) => repo._id,
    );

    const issueActivity = await Issue.aggregate([
      {
        $match: { repository: { $in: repoIds }, createdAt: { $exists: true } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const commitActivity = await Commit.aggregate([
      {
        $match: { repository: { $in: repoIds }, createdAt: { $exists: true } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Merge both arrays into one date -> count map
    const merged = {};
    [...repoActivity, ...issueActivity, ...commitActivity].forEach((entry) => {
      const date = entry._id;
      merged[date] = (merged[date] || 0) + entry.count;
    });

    // Convert back into the array shape the heatmap library expects
    const activity = Object.entries(merged).map(([date, count]) => ({
      date,
      count,
    }));

    res.status(200).json({ activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
