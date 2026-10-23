import Channel from "../models/channelModel.js";
import ChatMessage from "../models/chatMessageModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";

// ---------------------------------------------------------------------------
// GET /chat/repos/:repoId/channels
// ---------------------------------------------------------------------------
export const listChannels = async (req, res) => {
  const access = await getRepoAccess(req.params.repoId, req.user);
  if (!access) return res.status(404).json({ message: "Repository not found" });

  const { repo } = access;

  // Guarantee the "general" channel always exists (idempotent upsert).
  await Channel.findOneAndUpdate(
    { repo: repo._id, name: "general" },
    { $setOnInsert: { repo: repo._id, name: "general", createdBy: req.user._id } },
    { upsert: true, new: true },
  );

  const channels = await Channel.find({ repo: repo._id }).sort({ createdAt: 1 });
  return res.json(channels);
};

// ---------------------------------------------------------------------------
// POST /chat/repos/:repoId/channels
// ---------------------------------------------------------------------------
export const createChannel = async (req, res) => {
  const access = await getRepoAccess(req.params.repoId, req.user);
  if (!access) return res.status(404).json({ message: "Repository not found" });

  if (!access.isOwner) {
    return res.status(403).json({ message: "Only the repository owner can create channels" });
  }

  const { name } = req.body;
  if (!name || !/^[a-z0-9-]{1,30}$/.test(name)) {
    return res
      .status(400)
      .json({ message: "Channel name must match /^[a-z0-9-]{1,30}$/" });
  }

  try {
    const channel = await Channel.create({
      repo: access.repo._id,
      name,
      createdBy: req.user._id,
    });
    return res.status(201).json(channel);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Channel name already exists in this repository" });
    }
    throw err; // let Express 5 async error handler deal with it
  }
};

// ---------------------------------------------------------------------------
// GET /chat/channels/:channelId/messages
// ---------------------------------------------------------------------------
export const getMessages = async (req, res) => {
  const channel = await Channel.findById(req.params.channelId);
  if (!channel) return res.status(404).json({ message: "Channel not found" });

  const access = await getRepoAccess(String(channel.repo), req.user);
  if (!access) return res.status(404).json({ message: "Repository not found" });

  const filter = { channel: channel._id };
  if (req.query.before) {
    const before = new Date(req.query.before);
    if (!isNaN(before.getTime())) {
      filter.createdAt = { $lt: before };
    }
  }

  // Fetch newest 50, then reverse so the client receives oldest-first.
  const messages = await ChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("sender", "username");

  return res.json(messages.reverse());
};
