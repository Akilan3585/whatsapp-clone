import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateGroupChat.css';

function CreateGroupChat({ onClose, onChatCreated, currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5004/api/users');
      setUsers(response.data.filter(user => user._id !== currentUser._id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      const response = await axios.post('http://localhost:5004/api/chats/group', {
        participants: selectedUsers,
        groupName,
        creatorId: currentUser._id
      });
      onChatCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="create-group-overlay">
      <div className="create-group-modal">
        <h3>Create Group Chat</h3>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="user-list">
          <h4>Select Members:</h4>
          {users.map(user => (
            <div key={user._id} className="user-item">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleUserSelect(user._id)}
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0}>
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupChat;