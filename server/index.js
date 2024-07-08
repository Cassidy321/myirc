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

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setUsername', (username) => {
    users[socket.id] = username;
    io.emit('message', { user: 'Bot', text : `${username} est arrivé sur le serveur` });
  });

  socket.on('message', (message) => {
    if (message.text.startsWith('/nick ')) {
      const newNick = message.text.split(' ')[1];
      const oldNick = users[socket.id];
      users[socket.id] = newNick;
      io.emit('message', { user: 'Bot', text: `${oldNick} a changé son pseudo en ${newNick}` });
    } else {
      const user = users[socket.id];
      io.emit('message', { user: user, text: message.text });
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
