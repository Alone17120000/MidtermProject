// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // Chỉ định đường dẫn tới file .env ở gốc backend

const connectDB = async () => {
  try {
    // Kiểm tra xem MONGODB_URI đã được load chưa
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Thoát khỏi process với lỗi
    process.exit(1);
  }
};

module.exports = connectDB;