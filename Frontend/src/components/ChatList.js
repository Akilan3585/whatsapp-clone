import React from 'react';
import './ChatList.css';

function ChatList({ chats, onChatSelect, currentUser, onChatCreated, onlineUsers }) {
  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId && u.status === 'online');
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
      </div>
      <div className="chat-items">
        {chats.map(chat => (
          <div key={chat._id} className="chat-item" onClick={() => onChatSelect(chat)}>
            <div className="chat-avatar">
              {chat.participants[0].username[0]}
            </div>
            <div className="chat-info">
              <div className="chat-name">
                {chat.participants[0].username}
                {isUserOnline(chat.participants[0]._id) && (
                  <span className="online-badge">●</span>
                )}
              </div>
              <div className="chat-last-message">
                {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;