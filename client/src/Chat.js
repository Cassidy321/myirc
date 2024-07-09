import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
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

    return () => {
      socket.off('message');
      socket.off('rooms');
    };
  }, [username, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      alert('Please enter a message.');
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
    } else {
      socket.emit('message', { text: message, roomName: currentRoom });
    }
    setMessage('');
  };

  const joinRoom = (roomName) => {
    socket.emit('joinRoom', roomName);
    setCurrentRoom(roomName);
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h1 className="chat-title">Channel: {currentRoom}</h1>
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
            <li key={idx} onClick={() => joinRoom(room)}>{room}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;
