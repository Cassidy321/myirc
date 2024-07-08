import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    socket.emit('setUsername', username);

    const messageListener = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const roomsListener = (rooms) => {
      setAvailableRooms(rooms);
    };

    socket.on('message', messageListener);
    socket.on('rooms', roomsListener);

    return () => {
      socket.off('message', messageListener);
      socket.off('rooms', roomsListener);
    };
  }, [username, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      alert('Please enter a message.');
      return;
    }
    socket.emit('message', { text: message });
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h1 className="chat-title">Salon général</h1>
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
            <li key={idx}>{room}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;
