// src/graphql/resolvers.js

// Import model Laptop đã định nghĩa ở bước trước
const Laptop = require('../models/Laptop');
const { Types } = require('mongoose'); // Import Types để kiểm tra ObjectId hợp lệ

const resolvers = {
  // Resolvers cho các Query
  Query: {
    // Resolver cho query 'laptops'
    laptops: async () => {
      try {
        // Tìm tất cả các document trong collection 'laptops'
        const laptops = await Laptop.find();
        return laptops;
      } catch (err) {
        console.error('Error fetching laptops:', err);
        // Ném lỗi để Apollo Server biết có vấn đề xảy ra
        throw new Error('Failed to fetch laptops');
      }
    },

    // Resolver cho query 'laptop' (lấy theo ID)
    // Tham số thứ hai (args) chứa các đối số truyền vào query (ở đây là { id })
    laptop: async (_, { id }) => {
      try {
         // Kiểm tra xem ID có phải là ObjectId hợp lệ không
         if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid Laptop ID format');
         }
        // Tìm laptop theo _id trong MongoDB
        const laptop = await Laptop.findById(id);
        if (!laptop) {
          // Nếu không tìm thấy, ném lỗi (Apollo sẽ trả về null và errors)
          throw new Error('Laptop not found');
        }
        return laptop;
      } catch (err) {
        console.error(`Error fetching laptop with id ${id}:`, err);
        // Ném lỗi lại để client biết
         // Check xem có phải lỗi do mình throw không hay lỗi khác
         if (err.message === 'Laptop not found' || err.message === 'Invalid Laptop ID format') {
            throw err;
         }
        throw new Error('Failed to fetch laptop');
      }
    },
  },

  // Resolvers cho các Mutation
  Mutation: {
    // Resolver cho mutation 'createLaptop'
    // Tham số thứ hai (args) chứa đối số 'input'
    createLaptop: async (_, { input }) => {
      try {
        // Tạo một instance mới của Laptop model với dữ liệu từ input
        const newLaptop = new Laptop({
          name: input.name,
          configuration: input.configuration,
          pricePerHour: input.pricePerHour,
          imageUrl: input.imageUrl
        });
        // Lưu vào database
        await newLaptop.save();
        // Trả về laptop vừa tạo
        return newLaptop;
      } catch (err) {
        console.error('Error creating laptop:', err);
         // Kiểm tra lỗi validation từ Mongoose
        if (err.name === 'ValidationError') {
            // Lấy thông điệp lỗi đầu tiên cho đơn giản
            const message = Object.values(err.errors).map(e => e.message).join(', ');
            throw new Error(`Validation failed: ${message}`);
        }
        throw new Error('Failed to create laptop');
      }
    },

    // Resolver cho mutation 'updateLaptop'
    // Tham số thứ hai (args) chứa 'id' và 'input'
    updateLaptop: async (_, { id, input }) => {
      try {
        if (!Types.ObjectId.isValid(id)) {
           throw new Error('Invalid Laptop ID format');
        }
        // Tìm và cập nhật laptop theo ID
        // { new: true } để trả về document sau khi đã cập nhật
        // runValidators: true để chạy lại các validation của Mongoose schema khi update
        const updatedLaptop = await Laptop.findByIdAndUpdate(
          id,
          { $set: input }, // Chỉ cập nhật các trường có trong input
          { new: true, runValidators: true }
        );
        if (!updatedLaptop) {
          throw new Error('Laptop not found, cannot update');
        }
        return updatedLaptop;
      } catch (err) {
        console.error(`Error updating laptop with id ${id}:`, err);
        if (err.message.includes('not found') || err.message.includes('Invalid ID')) {
            throw err;
        }
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(e => e.message).join(', ');
            throw new Error(`Validation failed: ${message}`);
        }
        throw new Error('Failed to update laptop');
      }
    },

    // Resolver cho mutation 'deleteLaptop'
    deleteLaptop: async (_, { id }) => {
      try {
        if (!Types.ObjectId.isValid(id)) {
           throw new Error('Invalid Laptop ID format');
        }
        // Tìm và xóa laptop theo ID
        const deletedLaptop = await Laptop.findByIdAndDelete(id);
        if (!deletedLaptop) {
          throw new Error('Laptop not found, cannot delete');
        }
        // Trả về thông tin laptop đã xóa để xác nhận
        return deletedLaptop;
      } catch (err) {
        console.error(`Error deleting laptop with id ${id}:`, err);
         if (err.message.includes('not found') || err.message.includes('Invalid ID')) {
            throw err;
        }
        throw new Error('Failed to delete laptop');
      }
    },
  },

   // Resolver cho các trường của Type Laptop (nếu cần tùy chỉnh)
   // Ví dụ: Đảm bảo createdAt và updatedAt trả về đúng định dạng nếu cần
   Laptop: {
       createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
       updatedAt: (parent) => parent.updatedAt ? parent.updatedAt.toISOString() : null,
       // Trường 'id' thường được Mongoose tự động xử lý khi có toJSON/toObject virtuals
       // id: (parent) => parent._id.toString(), // Không cần thiết nếu đã cấu hình virtual trong schema
   }
};

module.exports = resolvers;