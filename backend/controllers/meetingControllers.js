import Meeting from "../models/meetingModel.js";
import { getRepoAccess, sameId } from "../utils/repoAccess.js";
import { postChannelMessage, updateChannelMessageMetadata } from "../utils/chatHelpers.js";

const getMeetingAccess = async (repoId, user) => getRepoAccess(repoId, user);

const getIo = (req) => {
  const io = req.app.get("io");
  if (!io) throw new Error("Socket server is unavailable");
  return io;
};

const meetingMetadata = (meeting) => ({
  meetingId: meeting._id,
  title: meeting.title,
  scheduledFor: meeting.scheduledFor,
  status: meeting.status,
  roomId: meeting.roomId,
});

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

export const scheduleMeeting = async (req, res) => {
  const { repoId } = req.params;
  const { title, scheduledFor } = req.body;
  const date = new Date(scheduledFor);
  if (!title || !scheduledFor || Number.isNaN(date.getTime()) || date <= new Date()) {
    return res.status(400).json({ message: "title and a future scheduledFor are required" });
  }

  try {
    const access = await getMeetingAccess(repoId, req.user);
    if (!access) return res.status(404).json({ message: "Repository not found" });
    if (!access.canPush) {
      return res.status(403).json({ message: "Only owners and collaborators can schedule meetings" });
    }

    const meeting = await Meeting.create({
      repoId,
      title: String(title).trim(),
      scheduledFor: date,
      status: "scheduled",
      createdBy: req.user._id,
      user: req.user._id,
      roomId: `repo-${repoId}`,
    });
    meeting.roomId = `repo-${repoId}-${meeting._id}`;
    const message = await postChannelMessage(
      getIo(req),
      repoId,
      "meetings",
      req.user._id,
      meeting.title,
      req.user.username,
      "meeting",
      meetingMetadata(meeting),
    );
    meeting.messageId = message._id;
    await meeting.save();
    return res.status(201).json(meeting);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUpcomingMeetings = async (req, res) => {
  try {
    const access = await getMeetingAccess(req.params.repoId, req.user);
    if (!access) return res.status(404).json({ message: "Repository not found" });
    const meetings = await Meeting.find({
      repoId: req.params.repoId,
      status: "scheduled",
      scheduledFor: { $gt: new Date() },
    }).sort({ scheduledFor: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.meetingId,
      repoId: req.params.repoId,
    });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    const access = await getMeetingAccess(req.params.repoId, req.user);
    if (!access) return res.status(404).json({ message: "Repository not found" });
    if (!access.isOwner && !sameId(meeting.createdBy, req.user._id)) {
      return res.status(403).json({ message: "Only the meeting creator or repository owner can cancel it" });
    }
    if (meeting.status !== "scheduled") {
      return res.status(409).json({ message: "Only scheduled meetings can be cancelled" });
    }
    meeting.status = "cancelled";
    await meeting.save();
    if (meeting.messageId) {
      await updateChannelMessageMetadata(getIo(req), meeting.messageId, meetingMetadata(meeting));
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startMeeting = async (req, res) => {
  const { repoId } = req.params;
  try {
    const access = await getMeetingAccess(repoId, req.user);
    if (!access) return res.status(404).json({ message: "Repository not found" });
    if (!access.canPush) {
      return res.status(403).json({ message: "Only owners and collaborators can start meetings" });
    }

    const io = getIo(req);
    const { meetingId } = req.body;
    if (meetingId) {
      const meeting = await Meeting.findOne({ _id: meetingId, repoId });
      if (!meeting) return res.status(404).json({ message: "Meeting not found" });
      if (meeting.status !== "scheduled") {
        return res.status(409).json({ message: "Only scheduled meetings can be started" });
      }
      meeting.status = "live";
      await meeting.save();
      if (meeting.messageId) {
        await updateChannelMessageMetadata(io, meeting.messageId, meetingMetadata(meeting));
      }
      return res.json(meeting);
    }

    const meeting = await Meeting.create({
      repoId,
      title: "Instant meeting",
      status: "live",
      createdBy: req.user._id,
      user: req.user._id,
      roomId: `repo-${repoId}`,
    });
    const message = await postChannelMessage(
      io,
      repoId,
      "meetings",
      req.user._id,
      meeting.title,
      req.user.username,
      "meeting",
      meetingMetadata(meeting),
    );
    meeting.messageId = message._id;
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
