import React, { useState } from 'react';
import './UserSwitcher.css';

function UserSwitcher({ currentUser, users, onSwitchUser, onAddUser, onLogoutUser }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddUser = async () => {
    if (!newUsername.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5004/api/users/by-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim() })
      });

      if (!response.ok) throw new Error('Failed to create user');
      
      const user = await response.json();
      onAddUser(user);
      onSwitchUser(user);
      setNewUsername('');
      setShowAddUser(false);
      setShowDropdown(false);
    } catch (err) {
      alert('Error adding user: ' + err.message);
    }
  };

  const handleLogout = (e, userId) => {
    e.stopPropagation();
    if (window.confirm('Logout this user?')) {
      onLogoutUser(userId);
    }
  };

  return (
    <div className="user-switcher">
      <div className="user-header">
        <button 
          className="user-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          👤 {currentUser.username}
          <span className="dropdown-arrow">▼</span>
        </button>
      </div>

      {showDropdown && (
        <div className="dropdown-menu">
          <div className="dropdown-title">Logged in accounts</div>
          <div className="users-list">
            {users.map(user => (
              <div
                key={user._id}
                className={`user-item ${currentUser._id === user._id ? 'active' : ''}`}
              >
                <button
                  className="user-select"
                  onClick={() => {
                    onSwitchUser(user);
                    setShowDropdown(false);
                  }}
                >
                  <span className="user-info">
                    <span className={`online-dot ${user.online ? 'online' : 'offline'}`}></span>
                    {user.username}
                  </span>
                  {currentUser._id === user._id && <span className="check">✓</span>}
                </button>
                <button
                  className="logout-btn"
                  onClick={(e) => handleLogout(e, user._id)}
                  title="Logout"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {!showAddUser ? (
            <button 
              className="add-user-trigger"
              onClick={() => setShowAddUser(true)}
            >
              + Add another account
            </button>
          ) : (
            <div className="add-user-section">
              <input
                type="text"
                placeholder="Enter username..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                autoFocus
              />
              <div className="add-user-actions">
                <button onClick={handleAddUser} className="add-btn">Add</button>
                <button onClick={() => setShowAddUser(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserSwitcher;
