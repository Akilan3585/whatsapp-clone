const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get or create user by name (for quick login without password)
router.post('/by-name', async (req, res) => {
  try {
    const { username } = req.body;
    
    console.log('🔍 Creating/fetching user:', username);
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Try to find existing user
    let user = await User.findOne({ username: cleanUsername });

    // If not found, create new user
    if (!user) {
      // Generate unique email with timestamp
      const timestamp = Date.now();
      const email = `${cleanUsername.replace(/\s+/g, '_')}_${timestamp}@whatsapp.local`;
      
      user = new User({
        username: cleanUsername,
        email: email,
        password: 'auto-generated'
      });
      await user.save();
      console.log('✅ New user created:', user._id, cleanUsername);
    } else {
      console.log('✅ User found:', user._id, cleanUsername);
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Error in /by-name:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;