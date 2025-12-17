// Script to fix MongoDB index conflict
const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.connection.collection('users');
    
    // Drop the conflicting email index
    try {
      await User.dropIndex('email_1');
      console.log('✅ Dropped old email_1 index');
    } catch (err) {
      console.log('ℹ️  No email_1 index to drop');
    }
    
    // Create the new sparse index
    await User.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse email index');
    
    console.log('✅ Index fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();
