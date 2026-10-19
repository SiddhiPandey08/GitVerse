import Meeting from "../models/meetingModel.js";

export const getHistory = async (req, res) => {
  const meetings = await Meeting.find({ user: req.user._id }).sort({
    date: -1,
  });
  res.json(meetings);
};

export const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;
  if (!meeting_code) {
    return res.status(400).json({ message: "meeting_code is required" });
  }
  await Meeting.create({ user: req.user._id, meetingCode: meeting_code });
  res.status(201).json({ message: "Added code to history" });
};
