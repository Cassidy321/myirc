// index.js
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

io.on('connexion', (socket) => {
  console.log('Nouveau client connecté');
  users[socket.id] = `${oldNick}`; 
  socket.on('message', (message) => {
    if (message.text.startsWith('/nick ')) {
      const newNick = message.text.split(' ')[1];
      const oldNick = users[socket.id];
      users[socket.id] = newNick;
      io.emit('message', { user: 'Bot', text : `${oldNick} a changé son pseudo en ${newNick}` });
    } else {
      io.emit('message', { user: users[socket.id], text: message.text });
    }
  });

  socket.on('deconnexion', () => {
    console.log('Client déconnecté');
    delete users[socket.id];
  });
});

server.listen(3001, () => {
  console.log('Listening on port 3001');
});
