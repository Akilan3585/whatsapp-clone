import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ChatWindow.css';

const socket = io('http://localhost:5004');

function ChatWindow({ chat, messages, onSendMessage, currentUser, typingUsers }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout;

  useEffect(() => {
    if (chat && messages.length > 0) {
      // Mark unread messages as read
      messages.forEach(msg => {
        if (msg.sender._id !== currentUser._id && !msg.readBy.includes(currentUser._id)) {
          socket.emit('markAsRead', { messageId: msg._id, userId: currentUser._id, chatId: chat._id });
        }
      });
    }
  }, [chat, messages, currentUser]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);

    // Send typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket.emit('typing', { chatId: chat._id, userId: currentUser._id, username: currentUser.username });
    }

    // Clear typing timeout
    clearTimeout(typingTimeout);

    // Stop typing after 2 seconds of inactivity
    if (text.length > 0) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stopTyping', { chatId: chat._id, userId: currentUser._id });
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      socket.emit('stopTyping', { chatId: chat._id, userId: currentUser._id });
    }
  };

  if (!chat) {
    return <div className="chat-window"><div className="no-chat">Select a chat to start messaging</div></div>;
  }

  // Get the other participant (not current user)
  const otherParticipant = chat.participants.find(p => p._id !== currentUser._id) || chat.participants[0];

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-avatar">
          {otherParticipant.username[0].toUpperCase()}
        </div>
        <div className="chat-info">
          <div className="chat-name">
            {otherParticipant.username}
          </div>
          <div className="chat-status">
            {otherParticipant.online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
      <div className="messages">
        {messages.map(msg => {
          // Ensure we're comparing the right IDs
          const senderId = msg.sender?._id || msg.sender;
          const currentUserId = currentUser._id;
          const isOwnMessage = senderId === currentUserId;
          const senderName = msg.sender?.username || msg.senderName || 'Unknown';
          
          return (
            <div key={msg._id} className={`message ${isOwnMessage ? 'own' : 'received'}`}>
              {!isOwnMessage && <div className="message-sender">{senderName}</div>}
              <div className="message-bubble">
                <div className="message-content">{msg.content}</div>
                <div className="message-footer">
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {isOwnMessage && (
                    <span className="message-status">
                      {msg.status === 'sent' && <span className="status-tick single">✓</span>}
                      {msg.status === 'delivered' && <span className="status-tick double">✓✓</span>}
                      {msg.status === 'read' && <span className="status-tick read">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator">
            <span>{Object.values(typingUsers).join(', ')} is typing</span>
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatWindow;