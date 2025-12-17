import React, { useState } from 'react';
import './NameEntry.css';

function NameEntry({ onNameSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter a name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    try {
      // Fetch or create user by name
      const response = await fetch('http://localhost:5004/api/users/by-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedName })
      });

      if (!response.ok) {
        throw new Error('Failed to get/create user');
      }

      const user = await response.json();
      onNameSubmit(user);
    } catch (err) {
      setError('Error creating user: ' + err.message);
    }
  };

  return (
    <div className="name-entry-container">
      <div className="name-entry-card">
        <h1>💬 WhatsApp Chat</h1>
        <p className="welcome-text">Multi-User Chat Application</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
          />
          <button type="submit">Login & Start Chatting</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <div className="info-section">
          <p className="info-text">✨ How it works:</p>
          <ul className="info-list">
            <li>🔹 Enter any name to login (e.g., "nis", "aki")</li>
            <li>🔹 Open another tab and login with different name</li>
            <li>🔹 Search and chat with other users</li>
            <li>🔹 See message status: ✓ sent, ✓✓ delivered, ✓✓ read</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NameEntry;
