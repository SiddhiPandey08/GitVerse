import Issue from "../models/issueModel.js";
import Repository from "../models/repoModel.js";

export const createIssue = async (req, res) => {
  const { title, description, repository } = req.body;
  try {
    if (!repository) {
      res.status(400).json({ message: "Repository id is needed" });
    }

    const newIssue = new Issue({
      repository,
      title,
      description,
    });
    const result = await newIssue.save();
    res.status(201).json({ message: "Issue created successfully ", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  //by repoId
  const { id } = req.params;

  try {
    const issues = Issue.find({ repository: id });
    if (!issues) {
      res.json({ message: "This repository has no issues associated" });
    }
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issues = await Issue.findById(id);
    if (!issues) {
      res.json({ message: "Issue not found" });
    }
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIssueById = async (req, res) => {
  const { id } = req.params;

  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findByIdAndUpdate(
      id,
      { title, description, status },
      { returnDocument: "after", runValidators: true },
    );
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
    }
    res.json({ issue, message: "Issue updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Issue.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Issue not found" });
    }
    res.json({ message: "Issue deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
