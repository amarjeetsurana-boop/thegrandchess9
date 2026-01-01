import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("createRoom", (roomId) => {
    if (rooms[roomId]) return socket.emit("roomExists");
    rooms[roomId] = [socket.id];
    socket.join(roomId);
    socket.emit("roomCreated");
  });

  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) return socket.emit("roomNotFound");
    if (rooms[roomId].length >= 2) return socket.emit("roomFull");

    rooms[roomId].push(socket.id);
    socket.join(roomId);
    socket.to(roomId).emit("playerJoined");
  });

  socket.on("move", (data) => {
    socket.to(data.roomId).emit("opponentMove", data);
  });

  socket.on("disconnect", () => {
    for (const r in rooms) {
      rooms[r] = rooms[r].filter(id => id !== socket.id);
      if (rooms[r].length === 0) delete rooms[r];
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});