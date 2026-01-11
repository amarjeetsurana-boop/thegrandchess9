import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔹 STATIC FILES
app.use(express.static("public"));

/* ========= ADD THESE ROUTES ========= */

// 🔥 Default → 9×9 Chess
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chess9x9.html"));
});

// 9×9 direct route
app.get("/chess9x9", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chess9x9.html"));
});

// 8×8 direct route
app.get("/chess8x8", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chess8x8.html"));
});

/* =================================== */

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

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on port:", port);
});
