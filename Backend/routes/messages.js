const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    
    // Update status for delivered messages
    for (let message of messages) {
      if (message.status === 'sent') {
        message.status = 'delivered';
        await message.save();
      }
    }
    
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send a message (handled by socket.io, but API for reference)
router.post('/', async (req, res) => {
  try {
    const { chat, sender, content } = req.body;
    const message = new Message({ chat, sender, content });
    await message.save();
    await message.populate('sender', 'username avatar');
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;