import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import UserSearch from './components/UserSearch';
import NameEntry from './components/NameEntry';
import UserSwitcher from './components/UserSwitcher';
import './App.css';

const socket = io('http://localhost:5004');

function App() {
  const [user, setUser] = useState(null);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  // For multi-tab support - don't auto-load from localStorage
  // Each tab should login independently
  useEffect(() => {
    // You can implement auto-login here if needed
    // For now, each tab requires manual login for better multi-user testing
  }, []);

  useEffect(() => {
    if (user) {
      console.log('🟢 User online:', user.username);
      // Announce user is online
      socket.emit('userOnline', user._id);
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit('joinChat', { chatId: selectedChat._id, userId: user._id });
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('📨 Received message:', {
        id: message._id,
        sender: message.sender,
        content: message.content,
        currentUser: user?._id
      });
      setMessages(prev => [...prev, message]);
    });

    socket.on('messageStatusUpdate', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, status: data.status } : msg
      ));
    });

    socket.on('userStatusUpdate', (data) => {
      setOnlineUsers(prev => {
        const index = prev.findIndex(u => u.userId === data.userId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index].status = data.status;
          return updated;
        }
        return [...prev, data];
      });
    });

    socket.on('userTyping', (data) => {
      setTypingUsers(prev => ({ ...prev, [data.userId]: data.username }));
    });

    socket.on('userStoppedTyping', (data) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageStatusUpdate');
      socket.off('userStatusUpdate');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`http://localhost:5004/api/chats/${user._id}`);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://localhost:5004/api/messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNameSubmit = (userData) => {
    console.log('👤 User logged in:', userData.username);
    setUser(userData);
    // Add to current session's logged in users
    setLoggedInUsers(prev => {
      const exists = prev.find(u => u._id === userData._id);
      if (!exists) {
        return [...prev, userData];
      }
      return prev;
    });
  };

  const handleSwitchUser = (selectedUser) => {
    // Disconnect current user
    if (user) {
      socket.emit('userOffline', user._id);
    }
    setUser(selectedUser);
    setSelectedChat(null);
    setMessages([]);
    setChats([]);
  };

  const handleAddUser = (newUser) => {
    console.log('➕ Adding user to session:', newUser.username);
    setLoggedInUsers(prev => {
      const exists = prev.find(u => u._id === newUser._id);
      if (exists) return prev;
      return [...prev, newUser];
    });
  };

  const handleLogoutUser = (userId) => {
    console.log('👋 User logged out:', userId);
    // Remove user from logged in users
    setLoggedInUsers(prev => prev.filter(u => u._id !== userId));
    
    // If logging out current user, switch to another or show login
    if (user && user._id === userId) {
      socket.emit('userOffline', userId);
      const remaining = loggedInUsers.filter(u => u._id !== userId);
      if (remaining.length > 0) {
        setUser(remaining[0]);
      } else {
        setUser(null);
      }
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    socket.emit('joinChat', { chatId: chat._id, userId: user._id });
  };

  const handleStartChat = (chat) => {
    setChats(prev => {
      const exists = prev.find(c => c._id === chat._id);
      if (exists) return prev;
      return [chat, ...prev];
    });
    setSelectedChat(chat);
    fetchMessages(chat._id);
    socket.emit('joinChat', { chatId: chat._id, userId: user._id });
  };

  const handleSendMessage = (content) => {
    if (!selectedChat || !user) return;
    const messageData = { 
      chatId: selectedChat._id, 
      senderId: user._id, 
      senderName: user.username,
      content 
    };
    socket.emit('sendMessage', messageData);
  };

  if (!user) {
    return <NameEntry onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <UserSwitcher 
            currentUser={user}
            users={loggedInUsers}
            onSwitchUser={handleSwitchUser}
            onAddUser={handleAddUser}
            onLogoutUser={handleLogoutUser}
          />
        </div>
        <UserSearch 
          currentUser={user}
          onStartChat={handleStartChat}
          onlineUsers={onlineUsers}
        />
        <ChatList 
          chats={chats} 
          onChatSelect={handleChatSelect} 
          currentUser={user}
          onlineUsers={onlineUsers}
        />
      </div>
      <ChatWindow
        chat={selectedChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUser={user}
        typingUsers={typingUsers}
      />
    </div>
  );
}

export default App;