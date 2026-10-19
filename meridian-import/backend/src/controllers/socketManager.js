import { Server } from "socket.io";

let connections = {}; // roomId -> [{ socketId, username }]
let messages = {};
let timeOnline = {};
let mediaStatus = {}; // socketId -> { audio, video }

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://meridian-vst3.vercel.app", "http://localhost:5173"],
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-call", (roomId, username) => {
      if (connections[roomId] === undefined) {
        connections[roomId] = [];
      }
      connections[roomId].push({
        socketId: socket.id,
        username: username || "Guest",
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

    socket.on("chat-message", (message, sender) => {
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

  return io;
};

export default connectToSocket;
