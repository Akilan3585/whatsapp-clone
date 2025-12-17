import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserSearch.css';

function UserSearch({ currentUser, onStartChat, onlineUsers }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        user._id !== currentUser._id
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users, currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5004/api/users');
      setUsers(response.data.filter(user => user._id !== currentUser._id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId && u.status === 'online');
  };

  const handleUserClick = async (user) => {
    try {
      // Create or get one-to-one chat
      const response = await axios.post('http://localhost:5004/api/chats', {
        participants: [currentUser._id, user._id],
        isGroup: false
      });
      onStartChat(response.data);
      setSearchTerm('');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="user-search">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {filteredUsers.length > 0 && (
        <div className="search-results">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="user-result"
              onClick={() => handleUserClick(user)}
            >
              <div className="result-avatar">
                {user.username[0].toUpperCase()}
              </div>
              <div className="result-info">
                <div className="result-name">
                  {user.username}
                  {isUserOnline(user._id) && (
                    <span className="online-badge">●</span>
                  )}
                </div>
                <div className="result-status">
                  {isUserOnline(user._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSearch;