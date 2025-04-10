// src/graphql/resolvers.js

// Import model Laptop đã định nghĩa ở bước trước
const Laptop = require('../models/Laptop');
const { Types } = require('mongoose'); // Import Types để kiểm tra ObjectId hợp lệ

const resolvers = {
  // Resolvers cho các Query
  Query: {

    // --- HÀM RESOLVER laptops MỚI (Thay thế hoàn toàn hàm cũ) ---
    laptops: async (_, args) => {
      // Lấy các arguments với giá trị mặc định nếu không được cung cấp
      const {
        page = 1,
        limit = 5, // Đặt lại limit mặc định là 5 như trong schema
        sortBy = 'NAME', // Giá trị enum từ GQL Schema
        sortOrder = 'ASC', // Giá trị enum từ GQL Schema
        filter,        // Object chứa minPrice, maxPrice (có thể undefined)
        search         // Chuỗi tìm kiếm (có thể undefined)
      } = args;

      try {
        // --- 1. Input Validation (Cơ bản) ---
        const pageInt = Math.max(1, parseInt(page, 10) || 1);
        const limitInt = Math.max(1, parseInt(limit, 10) || 5);
        const skip = (pageInt - 1) * limitInt; // Số lượng documents cần bỏ qua

        // --- 2. Xây dựng điều kiện tìm kiếm (findCriteria) ---
        const findCriteria = {}; // Bắt đầu với object rỗng

        // Tìm kiếm theo Tên (search) - không phân biệt hoa thường
        if (search && typeof search === 'string' && search.trim() !== '') {
          const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          findCriteria.name = { $regex: escapedSearch.trim(), $options: 'i' };
        }

        // Lọc theo khoảng giá (filter)
        if (filter) {
          const priceFilter = {};
          if (filter.minPrice !== null && typeof filter.minPrice === 'number') {
            priceFilter.$gte = filter.minPrice; // $gte = greater than or equal
          }
          if (filter.maxPrice !== null && typeof filter.maxPrice === 'number') {
            if (priceFilter.$gte === undefined || filter.maxPrice >= priceFilter.$gte) {
               priceFilter.$lte = filter.maxPrice; // $lte = less than or equal
            } else {
               console.warn("Warning: maxPrice is less than minPrice. Ignoring maxPrice filter.");
            }
          }
          // Chỉ thêm điều kiện pricePerHour nếu có min hoặc max
          if (Object.keys(priceFilter).length > 0) {
            findCriteria.pricePerHour = priceFilter;
          }
          // Thêm các điều kiện lọc khác ở đây nếu cần (vd: filter.minRam...)
        }

        // --- 3. Xây dựng tùy chọn sắp xếp (sortOptions) ---
        const sortOptions = {};
        let sortField = 'name'; // Trường sắp xếp mặc định trong DB
        if (sortBy === 'PRICE_PER_HOUR') {
          sortField = 'pricePerHour';
        }
        // Thêm các trường hợp khác nếu enum LaptopSortBy có thêm giá trị

        const order = (sortOrder === 'DESC') ? -1 : 1; // 1 = ASC, -1 = DESC
        sortOptions[sortField] = order;
        // Có thể thêm sắp xếp phụ, ví dụ luôn xếp theo tên nếu giá bằng nhau
        // if (sortField !== 'name') { sortOptions['name'] = 1; }

        // --- 4. Thực thi Query vào DB ---
        // Query 1: Đếm tổng số document khớp điều kiện (cho phân trang)
        const totalCount = await Laptop.countDocuments(findCriteria);

        // Query 2: Lấy danh sách laptop đã lọc, sắp xếp, phân trang
        const laptops = await Laptop.find(findCriteria) // Áp dụng lọc/tìm kiếm
          .sort(sortOptions)                         // Áp dụng sắp xếp
          .skip(skip)                                // Bỏ qua các trang trước
          .limit(limitInt);                          // Giới hạn số lượng kết quả

        // --- 5. Trả về kết quả đúng cấu trúc LaptopsPage ---
        return {
          laptops: laptops,
          totalCount: totalCount,
        };

      } catch (err) {
        console.error('Error fetching laptops:', err);
        throw new Error('Failed to fetch laptops');
      }
    }, // --- Kết thúc hàm resolver laptops MỚI ---

    // Giữ nguyên resolver cũ cho query 'laptop(id: ID!)'
    laptop: async (_, { id }) => {
      try {
         if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid Laptop ID format');
         }
        const laptop = await Laptop.findById(id);
        if (!laptop) {
          throw new Error('Laptop not found');
        }
        return laptop;
      } catch (err) {
        console.error(`Error fetching laptop with id ${id}:`, err);
         if (err.message === 'Laptop not found' || err.message === 'Invalid Laptop ID format') {
            throw err;
         }
        throw new Error('Failed to fetch laptop');
      }
    }, // Kết thúc laptop(id: ID!)

  }, // Kết thúc Query block

  // Resolvers cho các Mutation (Đã cập nhật imageUrl ở bước trước)
  Mutation: {
    createLaptop: async (_, { input }) => {
      try {
        const newLaptop = new Laptop({
          name: input.name,
          configuration: input.configuration,
          pricePerHour: input.pricePerHour,
          imageUrl: input.imageUrl // Đã thêm ở bước trước
        });
        await newLaptop.save();
        return newLaptop;
      } catch (err) {
        console.error('Error creating laptop:', err);
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(e => e.message).join(', ');
            throw new Error(`Validation failed: ${message}`);
        }
        throw new Error('Failed to create laptop');
      }
    },

    updateLaptop: async (_, { id, input }) => {
      try {
        if (!Types.ObjectId.isValid(id)) {
           throw new Error('Invalid Laptop ID format');
        }
        // $set: input sẽ tự động xử lý imageUrl nếu có trong input
        const updatedLaptop = await Laptop.findByIdAndUpdate(
          id,
          { $set: input },
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

    deleteLaptop: async (_, { id }) => {
      try {
        if (!Types.ObjectId.isValid(id)) {
           throw new Error('Invalid Laptop ID format');
        }
        const deletedLaptop = await Laptop.findByIdAndDelete(id);
        if (!deletedLaptop) {
          throw new Error('Laptop not found, cannot delete');
        }
        return deletedLaptop;
      } catch (err) {
        console.error(`Error deleting laptop with id ${id}:`, err);
         if (err.message.includes('not found') || err.message.includes('Invalid ID')) {
            throw err;
        }
        throw new Error('Failed to delete laptop');
      }
    },
  }, // Kết thúc Mutation block

   // Resolver cho các trường của Type Laptop (Đã cập nhật ở bước trước)
   Laptop: {
       createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
       updatedAt: (parent) => parent.updatedAt ? parent.updatedAt.toISOString() : null,
       // id đã được xử lý bởi toJSON/toObject virtuals trong Model
   }
}; // Kết thúc const resolvers

module.exports = resolvers;