import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setUsername }) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      alert('Please enter a username.');
      return;
    }
    setUsername(name);
    navigate('/chat');
  };

  return (
    <div className="container mt-4">
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h2 className="text-center">Enter your username</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-input"
            placeholder="Enter username"
          />
          <button type="submit" className="login-button">
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
