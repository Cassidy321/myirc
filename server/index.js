const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let users = {};
let rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setUsername', (username) => {
    if (!users[socket.id]) {
      users[socket.id] = username;
      io.emit('message', { user: 'Bot', text : `${username} est arrivé sur le serveur` });
    }
  });

  socket.on('createRoom', (roomName) => {
    rooms[roomName] = roomName;
    socket.join(roomName);
    io.emit('rooms', Object.keys(rooms));
    io.to(roomName).emit('message', { user: 'Bot', text : `${users[socket.id]} a créé le salon ${roomName}` });
  });

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    io.to(roomName).emit('message', { user: 'Bot', text : `${users[socket.id]} a rejoint le salon ${roomName}` });
  });

  socket.on('message', (message) => {
    const user = users[socket.id];
    if (message.text.startsWith('/nick ')) {
      const newNick = message.text.split(' ')[1];
      const oldNick = users[socket.id];
      users[socket.id] = newNick;
      io.emit('message', { user: 'Bot', text : `${oldNick} a changé son pseudo en ${newNick}` });
    } else {
      const roomName = message.roomName;
      io.to(roomName).emit('message', { user: user, text : message.text });
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log(`User disconnected: ${username}`);
    io.emit('message', { user: 'Bot', text : `${username} a quitté le serveur` });
    delete users[socket.id];
  });
});

server.listen(3001, () => {
  console.log('Listening on port 3001');
});
