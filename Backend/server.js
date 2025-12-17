const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Models
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/messages', require('./routes/messages'));

// Active users map
const activeUsers = new Map();

// Socket.io Events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User comes online
  socket.on('userOnline', async (userId) => {
    activeUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit('userStatusChanged', { userId, online: true });
    console.log(`✅ User ${userId} online`);
  });

  // User joins a chat
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`📍 User joined chat: ${chatId}`);
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, senderId, senderName, content } = data;
      
      console.log('📥 Received message data:', { chatId, senderId, senderName, content });
      
      // Save message to DB
      const message = new Message({
        chat: chatId,
        sender: senderId,
        content,
        status: 'sent'
      });
      await message.save();
      await message.populate('sender', 'username');
      
      // Add senderName to response
      const messageData = {
        ...message.toObject(),
        senderName: senderName || message.sender.username
      };
      
      // Broadcast to chat room
      io.to(chatId).emit('receiveMessage', messageData);
      
      // Auto mark as delivered after 500ms
      setTimeout(() => {
        message.status = 'delivered';
        message.save();
        io.to(chatId).emit('messageStatusUpdate', {
          messageId: message._id,
          status: 'delivered'
        });
      }, 500);

      console.log('📤 Message sent:', message._id);
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      socket.emit('error', 'Failed to send message: ' + error.message);
    }
  });

  // Mark message as read
  socket.on('markAsRead', async (data) => {
    try {
      const { messageId, userId, chatId } = data;
      const message = await Message.findById(messageId);
      
      if (message && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
        
        // Check if all participants read it
        const chat = await Chat.findById(message.chat).populate('participants');
        const allRead = chat.participants.every(p => 
          message.readBy.includes(p._id) || p._id.toString() === message.sender.toString()
        );
        
        message.status = allRead ? 'read' : 'delivered';
        await message.save();
        
        io.to(chatId).emit('messageStatusUpdate', {
          messageId: message._id,
          status: message.status
        });
        
        console.log('✅ Message read:', messageId);
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('userTyping', {
      userId: data.userId,
      username: data.username
    });
  });

  // Stop typing
  socket.on('stopTyping', (data) => {
    socket.to(data.chatId).emit('userStoppedTyping', {
      userId: data.userId
    });
  });

  // User goes offline
  socket.on('userOffline', async (userId) => {
    activeUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { online: false });
    io.emit('userStatusChanged', { userId, online: false });
    console.log(`❌ User ${userId} offline`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));