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
let rooms = ['general'];

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setUsername', (username) => {
    if (!users[socket.id]) {
      users[socket.id] = username;
      io.emit('message', { user: 'Bot', text: `${username} est arrivé sur le serveur` });
      io.emit('rooms', rooms);
    }
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      socket.join(roomName);
      io.emit('rooms', rooms);
      io.to(roomName).emit('message', { user: 'Bot', text: `${users[socket.id]} a créé le salon ${roomName}` });
    } else {
      socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} existe déjà.` });
    }
  });

  socket.on('joinRoom', (roomName) => {
    if (rooms.includes(roomName)) {
      socket.join(roomName);
      io.to(roomName).emit('message', { user: 'Bot', text: `${users[socket.id]} a rejoint le salon ${roomName}` });
    } else {
      socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} n'existe pas.` });
    }
  });

  socket.on('deleteRoom', (roomName) => {
    if (rooms.includes(roomName) && roomName !== 'general') {
      rooms = rooms.filter(room => room !== roomName);
      io.emit('rooms', rooms);
      io.emit('message', { user: 'Bot', text: `Le salon ${roomName} a été supprimé.` });
    } else {
      socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} ne peut pas être supprimé.` });
    }
  });

  socket.on('listRooms', (searchString) => {
    const filteredRooms = rooms.filter(room => room.includes(searchString));
    socket.emit('message', { user: 'Bot', text: `Salons disponibles: ${filteredRooms.join(', ')}` });
  });

  socket.on('message', (message) => {
    const user = users[socket.id];
    if (message.text.startsWith('/nick ')) {
      const newNick = message.text.split(' ')[1];
      const oldNick = users[socket.id];
      users[socket.id] = newNick;
      io.emit('message', { user: 'Bot', text: `${oldNick} a changé son pseudo en ${newNick}` });
    } else if (message.text.startsWith('/create ')) {
      const roomName = message.text.split(' ')[1];
      if (rooms.includes(roomName)) {
        socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} existe déjà.` });
      } else {
        rooms.push(roomName);
        io.emit('rooms', rooms);
        socket.join(roomName);
        io.to(roomName).emit('message', { user: 'Bot', text: `${user} a créé le salon ${roomName}` });
      }
    } else if (message.text.startsWith('/delete ')) {
      const roomName = message.text.split(' ')[1];
      if (rooms.includes(roomName) && roomName !== 'general') {
        rooms = rooms.filter(room => room !== roomName);
        io.emit('rooms', rooms);
        io.emit('message', { user: 'Bot', text: `Le salon ${roomName} a été supprimé.` });
      } else {
        socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} ne peut pas être supprimé.` });
      }
    } else if (message.text.startsWith('/list')) {
      const searchString = message.text.split(' ')[1] || '';
      const filteredRooms = rooms.filter(room => room.includes(searchString));
      socket.emit('message', { user: 'Bot', text: `Channels disponibles: ${filteredRooms.join(', ')}` });
    } else {
      const roomName = message.roomName || 'general';
      io.to(roomName).emit('message', { user: user, text: message.text });
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log(`User disconnected: ${username}`);
    io.emit('message', { user: 'Bot', text: `${username} a quitté le serveur` });
    delete users[socket.id];
  });
});

server.listen(3001, () => {
  console.log('Listening on port 3001');
});
