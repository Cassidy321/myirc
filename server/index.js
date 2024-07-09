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
let roomActivity = { general: Date.now() };

const updateConnectedUsers = () => {
  const connectedUsers = Object.values(users);
  io.emit('connectedUsers', connectedUsers);
};

const checkInactiveRooms = () => {
  const now = Date.now();
  for (const [room, lastActive] of Object.entries(roomActivity)) {
    if (room !== 'general' && (now - lastActive > 30000)) {
      rooms = rooms.filter(r => r !== room);
      delete roomActivity[room];
      io.emit('rooms', rooms);
      io.emit('message', { user: 'Bot', text: `Le channel ${room} a été supprimé pour inactivité.` });
    }
  }
};

// Check for inactive rooms every 5 seconds
setInterval(checkInactiveRooms, 5000);

io.on('connection', (socket) => {
  console.log('nouvel utilisateur connecté');

  socket.on('setUsername', (username) => {
    if (!users[socket.id]) {
      users[socket.id] = username;
      io.emit('message', { user: 'Bot', text: `${username} est arrivé sur le serveur` });
      socket.join('general');  // Join the general room by default
      roomActivity['general'] = Date.now();
      io.to('general').emit('message', { user: 'Bot', text: `${username} a rejoint le salon general` });
      io.emit('rooms', rooms);
      updateConnectedUsers();
    }
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      roomActivity[roomName] = Date.now();
      socket.join(roomName);
      io.emit('rooms', rooms);
      io.to(roomName).emit('message', { user: 'Bot', text: `${users[socket.id]} a créé le salon ${roomName}` });
    } else {
      socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} existe déjà.` });
    }
  });

  socket.on('joinRoom', (roomName) => {
    if (rooms.includes(roomName)) {
      roomActivity[roomName] = Date.now();
      socket.join(roomName);
      if (roomName !== 'general') {
        io.to(roomName).emit('message', { user: 'Bot', text: `${users[socket.id]} a rejoint le salon ${roomName}` });
      }
    } else {
      socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} n'existe pas.` });
    }
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    io.to(roomName).emit('message', { user: 'Bot', text: `${users[socket.id]} a quitté le salon ${roomName}` });
  });

  socket.on('deleteRoom', (roomName) => {
    if (rooms.includes(roomName) && roomName !== 'general') {
      rooms = rooms.filter(room => room !== roomName);
      delete roomActivity[roomName];
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

  socket.on('listUsers', (roomName) => {
    const clients = io.sockets.adapter.rooms.get(roomName);
    if (clients) {
      const usersInRoom = Array.from(clients).map(socketId => users[socketId]);
      socket.emit('message', { user: 'Bot', text: `Utilisateurs dans ${roomName}: ${usersInRoom.join(', ')}` });
    } else {
      socket.emit('message', { user: 'Bot', text: `Aucun utilisateur dans le salon ${roomName}` });
    }
  });

  socket.on('message', (message) => {
    const user = users[socket.id];
    if (message.text.startsWith('/nick ')) {
      const newNick = message.text.split(' ')[1];
      const oldNick = users[socket.id];
      users[socket.id] = newNick;
      io.emit('message', { user: 'Bot', text: `${oldNick} a changé son pseudo en ${newNick}` });
      updateConnectedUsers();
    } else if (message.text.startsWith('/create ')) {
      const roomName = message.text.split(' ')[1];
      if (rooms.includes(roomName)) {
        socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} existe déjà.` });
      } else {
        rooms.push(roomName);
        roomActivity[roomName] = Date.now();
        io.emit('rooms', rooms);
        socket.join(roomName);
        io.to(roomName).emit('message', { user: 'Bot', text: `${user} a créé le salon ${roomName}` });
      }
    } else if (message.text.startsWith('/delete ')) {
      const roomName = message.text.split(' ')[1];
      if (rooms.includes(roomName) && roomName !== 'general') {
        rooms = rooms.filter(room => room !== roomName);
        delete roomActivity[roomName];
        io.emit('rooms', rooms);
        io.emit('message', { user: 'Bot', text: `Le salon ${roomName} a été supprimé.` });
      } else {
        socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} ne peut pas être supprimé.` });
      }
    } else if (message.text.startsWith('/list')) {
      const searchString = message.text.split(' ')[1] || '';
      const filteredRooms = rooms.filter(room => room.includes(searchString));
      socket.emit('message', { user: 'Bot', text: `Salons disponibles: ${filteredRooms.join(', ')}` });
    } else if (message.text.startsWith('/join ')) {
      const roomName = message.text.split(' ')[1];
      if (rooms.includes(roomName)) {
        roomActivity[roomName] = Date.now();
        socket.join(roomName);
        io.to(roomName).emit('message', { user: 'Bot', text: `${user} a rejoint le salon ${roomName}` });
      } else {
        socket.emit('message', { user: 'Bot', text: `Le salon ${roomName} n'existe pas.` });
      }
    } else if (message.text.startsWith('/leave ')) {
      const roomName = message.text.split(' ')[1];
      socket.leave(roomName);
      io.to(roomName).emit('message', { user: 'Bot', text: `${user} a quitté le salon ${roomName}` });
    } else {
      const roomName = message.roomName || 'general';
      roomActivity[roomName] = Date.now();
      io.to(roomName).emit('message', { user: user, text: message.text });
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log(`utilisateur déconnecté: ${username}`);
    io.emit('message', { user: 'Bot', text: `${username} a quitté le serveur` });
    delete users[socket.id];
    updateConnectedUsers();
  });
});

server.listen(3001, () => {
  console.log('Listening on port 3001');
});
