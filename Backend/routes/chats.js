const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// Create a new chat or get existing one
router.post('/', async (req, res) => {
  try {
    const { participants, isGroup, groupName } = req.body;
    
    // For one-to-one chats, check if chat already exists
    if (!isGroup && participants.length === 2) {
      let existingChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      }).populate('participants', 'username avatar online lastSeen');
      
      if (existingChat) {
        console.log('✅ Found existing chat:', existingChat._id);
        return res.json(existingChat);
      }
    }
    
    // Create new chat if not exists
    const chat = new Chat({ participants, isGroup, groupName });
    await chat.save();
    await chat.populate('participants', 'username avatar online lastSeen');
    console.log('✅ Created new chat:', chat._id);
    res.status(201).json(chat);
  } catch (error) {
    console.error('❌ Error creating chat:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Create a group chat
router.post('/group', async (req, res) => {
  try {
    const { participants, groupName, creatorId } = req.body;
    const chat = new Chat({ 
      participants: [...participants, creatorId], 
      isGroup: true, 
      groupName 
    });
    await chat.save();
    await chat.populate('participants', 'username avatar');
    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'username avatar online lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;