const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;