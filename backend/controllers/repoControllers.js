import Repository from "../models/repoModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Issue from "../models/issueModel.js";
import Commit from "../models/commitModel.js";

export const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "Repository name is needed" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ message: "Invalid user" });
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

export const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");
    res.status(200).json({ repositories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoryById = async (req, res) => {
  const { repoId } = req.params;

  try {
    const result = await Repository.findById(repoId)
      .populate("owner")
      .populate("issues");
    if (!result) {
      return res.status(404).json({ message: "Repository not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoryByName = async (req, res) => {
  const { repoName } = req.params;

  try {
    const result = await Repository.find({ name: repoName })
      .populate("owner")
      .populate("issues");
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
      .populate("owner")
      .populate("issues");

    if (repositories.length === 0) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }
    res.status(200).json({
      repositories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepositoriesForCurrUser = async (req, res) => {
  const { currUserId } = req.params;
  try {
    const result = await Repository.find({ owner: currUserId })
      .populate("issues")
      .populate("content");
    if (!result || result.length == 0) {
      return res.status(404).json({ message: "Repository not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRepository = async (req, res) => {
  const { repoId } = req.params;
  const { description, content, message, files } = req.body;
  const author = req.user._id;
  try {
    if (!message) {
      return res.status(400).json({ message: "Commit message is required" });
    }

    const updatedRepo = await Repository.findByIdAndUpdate(
      repoId,
      { description, content },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedRepo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    await Commit.create({
      author,
      message,
      repository: repoId,
      files: files || [],
    });

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

// Add this to repoControllers.js (or a new commitControllers.js if you'd
// rather keep commit-related logic separate from repo CRUD — your call).

export const getRepoCommits = async (req, res) => {
  const { repoId } = req.params;
  try {
    const commits = await Commit.find({ repository: repoId })
      .sort({ createdAt: 1 }) // oldest first, matching commit order
      .populate("author", "username");

    res.status(200).json({ commits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
