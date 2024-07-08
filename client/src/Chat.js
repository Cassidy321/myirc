import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    socket.emit('setUsername', username);

    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.emit('getRooms');

    socket.on('rooms', (rooms) => {
      setAvailableRooms(rooms);
    });

    return () => {
      socket.off('message');
      socket.off('rooms');
    };
  }, [username]);

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
        <h2>Salons disponibles :</h2>
        <ul className="room-list">
          {availableRooms.map((room, idx) => (
            <li key={idx}>{room}</li>
          ))}
          <li>Room 1</li>
          <li>Room 2</li>
          <li>Room 3</li>
        </ul>
      </div>
    </div>
  );
}

export default Chat;
