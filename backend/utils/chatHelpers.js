// chatHelpers.js — shared helpers for programmatically posting channel messages from controllers.
// Talks to: channelModel.js (upsert), chatMessageModel.js (save message),
//           socket.io instance (emit to room). Used by issueControllers.js.

import Channel from "../models/channelModel.js";
import ChatMessage from "../models/chatMessageModel.js";

/**
 * Finds or creates a channel by name inside a repo.
 * Using upsert means calling this twice is safe — it won't create duplicates.
 * "createdBy" is only written on the first insert because of $setOnInsert.
 */
export async function ensureChannel(repoId, name, createdBy) {
  return Channel.findOneAndUpdate(
    { repo: repoId, name },
    { $setOnInsert: { repo: repoId, name, createdBy } },
    { upsert: true, new: true },
  );
}

/**
 * Saves a ChatMessage to the database and emits it to the matching socket.io room.
 * Using this helper keeps the payload shape identical whether a message comes from
 * the socket handler or from a server-side action (like opening an issue).
 *
 * The room name follows the same convention used in sockets/channels.js:
 *   `channel:<channelId>`
 *
 * @param {import("socket.io").Server} io        - the Socket.io server instance
 * @param {string} repoId                        - MongoDB id of the repo
 * @param {string} channelName                   - e.g. "general" or "collab-requests"
 * @param {string} senderId                      - MongoDB id of the User posting the message
 * @param {string} text                          - message body (max 2000 chars)
 * @param {string} senderUsername                - display name to include in the payload
 */
export async function postChannelMessage(
  io,
  repoId,
  channelName,
  senderId,
  text,
  senderUsername,
) {
  // Make sure the channel row exists before we try to attach a message to it.
  const channel = await ensureChannel(repoId, channelName, senderId);

  const msg = await ChatMessage.create({
    channel: channel._id,
    sender: senderId,
    text: String(text).trim().slice(0, 2000),
  });

  // Emit using the same shape that the socket handler produces, so the
  // frontend doesn't need separate handling for automated vs. user messages.
  const payload = {
    _id: msg._id,
    channel: msg.channel,
    text: msg.text,
    createdAt: msg.createdAt,
    sender: {
      _id: senderId,
      username: senderUsername,
    },
  };

  io.to(`channel:${channel._id}`).emit("channel:message", payload);

  return msg;
}
