const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log('✅ Player connected:', socket.id);

  socket.on('createRoom', (roomId) => {
    if (rooms[roomId]) return;

    rooms[roomId] = {
      players: [socket.id]
    };

    socket.join(roomId);
    socket.emit('roomCreated');
  });

  socket.on('joinRoom', (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players.length >= 2) {
      socket.emit('error', 'Room full ya exist nahi');
      return;
    }

    if (!room.players.includes(socket.id)) {
      room.players.push(socket.id);
    }

    socket.join(roomId);
    io.to(roomId).emit('playerJoined');
  });

  socket.on('move', (data) => {
    const room = rooms[data.roomId];
    if (!room) return;

    // 🔐 allow only room players
    if (!room.players.includes(socket.id)) return;

    socket.to(data.roomId).emit('opponentMove', data);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(roomId).emit('playerLeft');

        if (room.players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('🎯 CHESS SERVER: http://localhost:3000');
});