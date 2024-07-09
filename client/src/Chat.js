import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const socket = io('http://localhost:3001');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [userCreatedRooms, setUserCreatedRooms] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [renamingRoom, setRenamingRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    socket.emit('setUsername', username);
    socket.emit('joinRoom', 'general');

    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('rooms', (rooms) => {
      setAvailableRooms(rooms);
    });

    socket.on('userCreatedRooms', (rooms) => {
      setUserCreatedRooms(rooms);
    });

    socket.on('connectedUsers', (users) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.off('message');
      socket.off('rooms');
      socket.off('userCreatedRooms');
      socket.off('connectedUsers');
    };
  }, [username, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      alert('veuillez entrer un message');
      return;
    }
    if (message.startsWith('/create ')) {
      const roomName = message.split(' ')[1];
      if (roomName) {
        socket.emit('createRoom', roomName);
        setCurrentRoom(roomName);
        setMessages([]);
      }
    } else if (message.startsWith('/delete ')) {
      const roomName = message.split(' ')[1];
      if (roomName) {
        socket.emit('deleteRoom', roomName);
        setCurrentRoom('general');
        setMessages([]);
      }
    } else if (message.startsWith('/list ')) {
      const searchString = message.split(' ')[1];
      socket.emit('listRooms', searchString);
    } else if (message === '/list') {
      socket.emit('listRooms', '');
    } else if (message.startsWith('/join ')) {
      const roomName = message.split(' ')[1];
      if (roomName) {
        socket.emit('joinRoom', roomName);
        setCurrentRoom(roomName);
        setMessages([]);
      }
    } else if (message.startsWith('/leave ')) {
      const roomName = message.split(' ')[1];
      if (roomName) {
        socket.emit('leaveRoom', roomName);
        setCurrentRoom('general');
        setMessages([]);
      }
    } else if (message === '/users') {
      socket.emit('listUsers', currentRoom);
    } else {
      socket.emit('message', { text: message, roomName: currentRoom });
    }
    setMessage('');
  };

  const startRenamingRoom = (roomName) => {
    setRenamingRoom(roomName);
    setNewRoomName(roomName);
  };

  const renameRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim() === '') {
      alert('veuillez entrer un nouveau nom de salon');
      return;
    }
    socket.emit('renameRoom', { oldName: renamingRoom, newName: newRoomName });
    setRenamingRoom(null);
    setNewRoomName('');
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h1 className="chat-title">Channel : {currentRoom}</h1>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="chat-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="chat-input"
            placeholder="Votre message"
            required
          />
          <button type="submit" className="chat-button">
            Envoyer
          </button>
        </form>
      </div>
      <div className="room-list-container">
        <h2>Channels disponibles :</h2>
        <ul className="room-list">
          {availableRooms.map((room, idx) => (
            <li key={idx}>
              {renamingRoom === room ? (
                <form onSubmit={renameRoom} className="rename-form">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="rename-input"
                    placeholder="Nouveau nom"
                    required
                  />
                  <button type="submit" className="rename-button">
                    Renommer
                  </button>
                </form>
              ) : (
                <>
                  {room} {' '} {}
                  {userCreatedRooms.includes(room) && (
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => startRenamingRoom(room)}
                      className="edit-icon"
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="users-list-container">
        <h2>Utilisateurs connectés :</h2>
        <ul className="users-list">
          {connectedUsers.map((user, idx) => (
            <li key={idx}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;
