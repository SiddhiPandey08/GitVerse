// sockets/meeting.js — WebRTC signalling and in-call chat for video meetings.
// Talks to: utils/repoAccess.js (access check), no DB writes (all in-memory).
// Connected to by server.js via registerMeetingSockets(io).

import { getRepoAccess } from "../utils/repoAccess.js";

let connections = {}; // roomId -> [{ socketId, username }]
let messages = {};
let timeOnline = {};
let mediaStatus = {}; // socketId -> { audio, video }

// Decides whether a socket is allowed into a meeting room.
// Repo rooms are named "repo-<repoId>" — for those, getRepoAccess is the
// single source of truth (handles private repos and collaborator check).
// Ad-hoc rooms (any other name) let any logged-in user in.
const canJoin = async (roomId, user) => {
  if (!user) return false; // guests are never allowed
  const code = String(roomId).split("?")[0].split("/").pop();
  if (!code.startsWith("repo-")) return true; // ad-hoc room: logged-in user only
  const repoId = code.slice(5);
  // getRepoAccess returns null when the user has no access (private repo, not a member).
  const access = await getRepoAccess(repoId, user);
  return access !== null;
};

const registerMeetingSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-call", async (roomId) => {
      // Reject immediately if no user — the socket middleware sets socket.user from JWT.
      if (!socket.user) {
        socket.emit("join-denied");
        return;
      }
      if (!(await canJoin(roomId, socket.user))) {
        socket.emit("join-denied");
        return;
      }
      if (connections[roomId] === undefined) {
        connections[roomId] = [];
      }

      // Display name always comes from the verified token, never from the client.
      const displayName = socket.user.username;

      connections[roomId].push({
        socketId: socket.id,
        username: displayName,
      });
      timeOnline[socket.id] = new Date();
      mediaStatus[socket.id] = { audio: true, video: true };

      for (let i = 0; i < connections[roomId].length; i++) {
        const enrichedClients = connections[roomId].map((p) => ({
          socketId: p.socketId,
          username: p.username,
          audio: mediaStatus[p.socketId]?.audio ?? true,
          video: mediaStatus[p.socketId]?.video ?? true,
        }));

        io.to(connections[roomId][i].socketId).emit(
          "user-joined",
          socket.id,
          enrichedClients,
        );
      }

      if (messages[roomId] !== undefined) {
        for (let i in messages[roomId]) {
          io.to(socket.id).emit(
            "chat-message",
            messages[roomId][i]["data"],
            messages[roomId][i]["sender"],
            messages[roomId][i]["socket-id-sender"],
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("media-status", (audio, video) => {
      mediaStatus[socket.id] = { audio, video };

      for (const [roomId, participants] of Object.entries(connections)) {
        if (participants.some((p) => p.socketId === socket.id)) {
          participants.forEach((p) => {
            io.to(p.socketId).emit("media-status", socket.id, audio, video);
          });
          break;
        }
      }
    });

    socket.on("disconnect", () => {
      let roomOfDisconnectedSocket;

      roomSearch: for (const [roomId, participants] of Object.entries(
        connections,
      )) {
        for (let i = 0; i < participants.length; ++i) {
          if (participants[i].socketId === socket.id) {
            roomOfDisconnectedSocket = roomId;

            connections[roomOfDisconnectedSocket].forEach((p) => {
              io.to(p.socketId).emit("user-left", socket.id);
            });

            connections[roomOfDisconnectedSocket] = connections[
              roomOfDisconnectedSocket
            ].filter((p) => p.socketId !== socket.id);

            if (connections[roomOfDisconnectedSocket].length === 0) {
              delete connections[roomOfDisconnectedSocket];
            }

            break roomSearch;
          }
        }
      }

      delete mediaStatus[socket.id];
    });

    socket.on("chat-message", (message) => {
      // sender is always taken from the verified socket.user, never from the client payload.
      const sender = socket.user?.username ?? "Unknown";

      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomId, socketsInRoom]) => {
          if (!isFound && socketsInRoom.some((p) => p.socketId === socket.id)) {
            return [roomId, true];
          }
          return [room, isFound];
        },
        ["", false],
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender,
          data: message,
          "socket-id-sender": socket.id,
        });

        connections[matchingRoom].forEach((p) => {
          io.to(p.socketId).emit("chat-message", message, sender, socket.id);
        });
      }
    });
  });
};

export default registerMeetingSockets;
