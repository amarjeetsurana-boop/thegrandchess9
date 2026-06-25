const socket = io();

let roomId = null;
let myColor = null;

function createRoom(id) {
  roomId = id;
  socket.emit("createRoom", id);
}

function joinRoom(id) {
  roomId = id;
  socket.emit("joinRoom", id);
}

socket.on("roomCreated", (color) => {
  myColor = color;
  alert("Room created. You are WHITE");
});

socket.on("roomJoined", (color) => {
  myColor = color;
  alert("Joined room. You are BLACK");
});

socket.on("opponentMove", (data) => {
  applyOpponentMove(data);
});

function sendMove(moveData) {
  socket.emit("move", {
    roomId,
    move: moveData
  });
}
