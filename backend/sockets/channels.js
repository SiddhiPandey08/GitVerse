import Channel from "../models/channelModel.js";
import ChatMessage from "../models/chatMessageModel.js";
import { getRepoAccess } from "../utils/repoAccess.js";

/**
 * Register persistent channel socket events on the given io instance.
 * Room naming convention: `channel:<channelId>`
 *
 * Events:
 *   channel:join  (channelId, ack)  – join a channel room if access is granted
 *   channel:leave (channelId)       – leave a channel room
 *   channel:message (channelId, text, ack) – persist and broadcast a message
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
    socket.on("channel:message", async (channelId, text, ack) => {
      try {
        // Must be authenticated.
        if (!socket.user) return ack({ ok: false, reason: "unauthenticated" });

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

        // Persist — sender is always taken from socket.user, never from the client payload.
        const msg = await ChatMessage.create({
          channel: channelId,
          sender: socket.user._id,
          text: trimmed,
        });

        // Broadcast to everyone in the room (including the sender).
        const payload = {
          _id: msg._id,
          channel: msg.channel,
          text: msg.text,
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
  });
};

export default registerChannelSockets;
