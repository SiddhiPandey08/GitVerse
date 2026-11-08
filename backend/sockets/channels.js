// sockets/channels.js — persistent channel socket events (join, leave, message).
// Talks to: channelModel.js, chatMessageModel.js, utils/repoAccess.js.
// Connected to by server.js via registerChannelSockets(io).

import Channel from "../models/channelModel.js";
import ChatMessage from "../models/chatMessageModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";

// In-memory rate limiter: tracks how many messages each socket has sent
// within the current 3-second window.  Max 5 messages per 3 s per socket.
// Simple and fast — no Redis needed for this use-case. Resets on disconnect.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 3000;
const rateLimitMap = new Map(); // socketId -> { count, resetAt }

function checkRateLimit(socketId) {
  const now = Date.now();
  const entry = rateLimitMap.get(socketId) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    // Window expired — start a fresh one.
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  rateLimitMap.set(socketId, entry);

  return entry.count <= RATE_LIMIT_MAX;
}

/**
 * Register persistent channel socket events on the given io instance.
 * Room naming convention: `channel:<channelId>`
 *
 * Events:
 *   channel:join    (channelId, ack)        – join a channel room if access is granted
 *   channel:leave   (channelId)             – leave a channel room
 *   channel:message (channelId, text, options, ack) – persist and broadcast a message
 *   channel:message-update (channelId, messageId, metadata, ack) – update metadata
 *
 * @param {import("socket.io").Server} io
 */
const registerChannelSockets = (io) => {
  io.on("connection", (socket) => {
    // ------------------------------------------------------------------
    // channel:join
    // ------------------------------------------------------------------
    socket.on("channel:join", async (channelId, ack) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) return ack({ ok: false, reason: "channel not found" });

        const access = await getRepoAccess(String(channel.repo), socket.user);
        if (!access) return ack({ ok: false, reason: "access denied" });

        socket.join(`channel:${channelId}`);
        ack({ ok: true });
      } catch {
        ack({ ok: false, reason: "server error" });
      }
    });

    // ------------------------------------------------------------------
    // channel:leave
    // ------------------------------------------------------------------
    socket.on("channel:leave", (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    // ------------------------------------------------------------------
    // channel:message
    // ------------------------------------------------------------------
    socket.on("channel:message", async (channelId, text, options, ack) => {
      try {
        if (typeof options === "function") {
          ack = options;
          options = {};
        }
        options = options || {};
        // Must be authenticated.
        if (!socket.user) return ack({ ok: false, reason: "unauthenticated" });

        // Rate-limit: max 5 messages per 3 seconds per socket.
        if (!checkRateLimit(socket.id)) {
          return ack({ ok: false, reason: "rate limit exceeded" });
        }

        const room = `channel:${channelId}`;

        // Socket must already be in the room (prevents drive-by messages).
        if (!socket.rooms.has(room)) {
          return ack({ ok: false, reason: "not in channel" });
        }

        // Validate text.
        const trimmed = typeof text === "string" ? text.trim() : "";
        if (trimmed.length < 1 || trimmed.length > 2000) {
          return ack({ ok: false, reason: "invalid text length" });
        }
        const type = options.type || "user";
        if (!["user", "meeting"].includes(type)) {
          return ack({ ok: false, reason: "invalid message type" });
        }

        // Persist — sender is always taken from socket.user, never from the client payload.
        const msg = await ChatMessage.create({
          channel: channelId,
          sender: socket.user._id,
          text: trimmed,
          type,
          metadata: options.metadata ?? null,
        });

        // Broadcast to everyone in the room (including the sender).
        const payload = {
          _id: msg._id,
          channel: msg.channel,
          text: msg.text,
          type: msg.type,
          metadata: msg.metadata,
          createdAt: msg.createdAt,
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
          },
        };

        io.to(room).emit("channel:message", payload);
        ack({ ok: true });
      } catch {
        ack({ ok: false, reason: "server error" });
      }
    });

    socket.on("channel:message-update", async (channelId, messageId, metadata, ack) => {
      try {
        if (!socket.user) return ack({ ok: false, reason: "unauthenticated" });
        const room = `channel:${channelId}`;
        if (!socket.rooms.has(room)) {
          return ack({ ok: false, reason: "not in channel" });
        }
        const message = await ChatMessage.findOneAndUpdate(
          { _id: messageId, channel: channelId },
          { $set: { metadata } },
          { new: true },
        ).populate("sender", "username");
        if (!message) return ack({ ok: false, reason: "message not found" });

        io.to(room).emit("message-updated", {
          _id: message._id,
          channel: message.channel,
          text: message.text,
          type: message.type,
          metadata: message.metadata,
          createdAt: message.createdAt,
          sender: message.sender,
        });
        ack({ ok: true });
      } catch {
        ack({ ok: false, reason: "server error" });
      }
    });

    // Clean up rate-limit state when the socket disconnects.
    socket.on("disconnect", () => {
      rateLimitMap.delete(socket.id);
    });
  });
};

export default registerChannelSockets;
