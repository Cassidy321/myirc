import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => socket.off('message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      alert('Please enter a message.');
      return;
    }
    socket.emit('message', { user: username, text: message });
    setMessage(''); // Réinitialisation du champ de message après l'envoi
  };

  return (
    <div className="container mt-4">
      <div>
        <h1 className="text-center">Chat</h1>
        <div className="">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            required
          />
          <button type="submit" className="text-center">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
