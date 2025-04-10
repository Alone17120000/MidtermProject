// scripts/seed.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env từ thư mục gốc backend

// Import Laptop model
const Laptop = require('../src/models/Laptop'); // Đường dẫn đúng tới file model

// Dữ liệu mẫu (10 laptops)
const sampleLaptops = [
  {
    name: 'Dell Inspiron 14',
    configuration: '8GB Ram, 256GB SSD',
    pricePerHour: 15000,
    imageUrl: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/inspiron-notebooks/14-5430/media-gallery/silver/in5430-cnb-05000ff090-sl.psd?qlt=90&fit=constrain,1&w=570&h=394&fmt=jpg' // Example URL
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    configuration: '16GB Ram, 512GB SSD',
    pricePerHour: 16000,
    imageUrl: 'https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MTM5NzMzfGltYWdlL3BuZ3xoMTEvaDA3LzE3MzgyMzM0NzU0ODQ2LnBuZ3wzMGE5Yzc5NWZmZmMzMjEyNzJiMmY0MjBiZDZiMzQ3MmJmMjllZTA5MjgxZjkxNWVmMjQ5ZDJjZmQ5ZmQ5ZmIz/lenovo-laptop-thinkpad-x1-carbon-gen-11-14-intel-hero.png' // Example URL
  },
  {
    name: 'Asus VivoBook 14',
    configuration: '16GB Ram, 512GB SSD',
    pricePerHour: 17000,
    imageUrl: 'https://dlcdnwebimgs.asus.com/gain/d86a8f54-9f91-457b-b763-c51544e1396b/w800' // Example URL
  },
  {
    name: 'MacBook Air M1',
    configuration: '8GB Ram, 256GB SSD',
    pricePerHour: 18000,
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664472289661' // Example URL
  },
  {
    name: 'Acer Aspire', // Using Aspire 5 as example
    configuration: '8GB Ram, 256GB SSD',
    pricePerHour: 19000,
    imageUrl: 'https://images.acer.com/is/image/acer/acer-aspire-5-a515-58m-finger-print-wallpaper-steel-gray-01-1?$Product-Cards-XL@2x$' // Example URL
  },
  {
    name: 'Microsoft Surface Laptop', // Using Surface Laptop 5 as example
    configuration: '16GB Ram, 512GB SSD',
    pricePerHour: 20000,
    imageUrl: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4Vtfn?ver=5389&q=90&m=6&h=705&w=1253&b=%23FFFFFFFF&f=jpg&o=f&p=140&aim=true' // Example URL
  },
  {
    name: 'Gigabyte Aero', // Using Aero 16 as example
    configuration: '16GB Ram, 512GB SSD',
    pricePerHour: 21000,
    imageUrl: 'https://static.gigabyte.com/StaticFile/Image/Global/1126139eb8931df78d092ff51162df5e/Product/29091/png/1000' // Example URL
  },
  {
    name: 'Razer Blade 16',
    configuration: '32GB Ram, 1TB SSD',
    pricePerHour: 22000,
    imageUrl: 'https://assets2.razerzone.com/images/pnx.assets/78844ab141610930764654c4f593904f/razer-blade-16-2024-laptop-500x500.png' // Example URL
  },
  {
    name: 'HP Pavilion', // Using Pavilion 15 as example
    configuration: '8 GB Ram, 256GB SSD',
    pricePerHour: 23000,
    imageUrl: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08186058.png' // Example URL
  },
  {
    name: 'GPD Duo',
    configuration: '8GB Ram, 1TB SSD',
    pricePerHour: 24000,
    imageUrl: 'https://via.placeholder.com/150/CCCCCC/808080?text=GPD+Duo' // Placeholder URL
  },
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