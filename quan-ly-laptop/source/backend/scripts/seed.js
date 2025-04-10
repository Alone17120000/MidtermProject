// scripts/seed.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env từ thư mục gốc backend

// Import Laptop model
const Laptop = require('../src/models/Laptop'); // Đường dẫn đúng tới file model

// Dữ liệu mẫu (10 laptops)
const sampleLaptops = [
  { name: 'Dell Inspiron 14', configuration: '8GB Ram, 256GB SSD', pricePerHour: 15000 },
  { name: 'Lenovo ThinkPad X1 Carbon', configuration: '16GB Ram, 512GB SSD', pricePerHour: 16000 },
  { name: 'Asus VivoBook 14', configuration: '16GB Ram, 512GB SSD', pricePerHour: 17000 },
  { name: 'MacBook Air M1', configuration: '8GB Ram, 256GB SSD', pricePerHour: 18000 },
  { name: 'Acer Aspire', configuration: '8GB Ram, 256GB SSD', pricePerHour: 19000 },
  { name: 'Microsoft Surface Laptop', configuration: '16GB Ram, 512GB SSD', pricePerHour: 20000 },
  { name: 'Gigabyte Aero', configuration: '16GB Ram, 512GB SSD', pricePerHour: 21000 },
  { name: 'Razer Blade 16', configuration: '32GB Ram, 1TB SSD', pricePerHour: 22000 },
  { name: 'HP Pavilion', configuration: '8 GB Ram, 256GB SSD', pricePerHour: 23000 },
  { name: 'GPD Duo', configuration: '8GB Ram, 1TB SSD', pricePerHour: 24000 },
];

// Hàm async để thực hiện seed data
const seedDB = async () => {
  console.log('Connecting to MongoDB for seeding...');
  try {
    // Kiểm tra biến môi trường
    if (!process.env.MONGODB_URI) {
       throw new Error('MONGODB_URI is not defined in .env file');
    }
    // Kết nối tới MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding.');

    // Xóa tất cả dữ liệu cũ trong collection 'laptops'
    // Quan trọng: Cẩn thận khi chạy lệnh này trên database production!
    console.log('Deleting existing laptops...');
    await Laptop.deleteMany({});
    console.log('Existing laptops deleted successfully.');

    // Thêm dữ liệu mẫu vào collection
    console.log('Inserting sample laptops...');
    await Laptop.insertMany(sampleLaptops);
    console.log(`${sampleLaptops.length} sample laptops inserted successfully.`);

  } catch (err) {
    // Bắt lỗi và in ra console
    console.error('Error seeding database:', err.message);
    process.exit(1); // Thoát script với mã lỗi
  } finally {
    // Luôn ngắt kết nối MongoDB sau khi hoàn thành hoặc gặp lỗi
    try {
       await mongoose.disconnect();
       console.log('MongoDB disconnected.');
    } catch (disconnectErr) {
       console.error('Error disconnecting MongoDB:', disconnectErr.message);
    }

  }
};

// Gọi hàm để chạy seed
seedDB();