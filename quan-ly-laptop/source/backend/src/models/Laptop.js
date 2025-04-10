// src/models/Laptop.js
const mongoose = require('mongoose');

const LaptopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Laptop name is required'], // Thêm thông báo lỗi
      trim: true, // Loại bỏ khoảng trắng thừa ở đầu và cuối
    },
    configuration: {
      type: String,
      required: [true, 'Configuration is required'],
    },
    pricePerHour: {
      type: Number, // Sử dụng Number cho giá tiền
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'], // Giá không thể âm
    },
  },
  {
    // Tự động thêm trường createdAt và updatedAt
    timestamps: true,
    // Đảm bảo _id được chuyển thành id khi chuyển sang JSON/Object (cho GraphQL)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tạo virtual field 'id' từ '_id' để tương thích GraphQL ID type
// Mongoose tự động làm điều này với toJSON/toObject nhưng khai báo tường minh cũng tốt
LaptopSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


module.exports = mongoose.model('Laptop', LaptopSchema); // 'Laptop' là tên model, Mongoose sẽ tạo collection 'laptops'