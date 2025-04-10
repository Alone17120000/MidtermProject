// src/server.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env từ thư mục gốc backend

// Import các module tự định nghĩa
const connectDB = require('./config/db');
const resolvers = require('./graphql/resolvers');

// Đọc nội dung file schema.graphql
// Sử dụng readFileSync để đảm bảo schema được đọc trước khi tạo server
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'graphql/schema.graphql'),
  'utf-8'
);

// Hàm bất đồng bộ để khởi tạo và chạy server
const startServer = async () => {
  // Khởi tạo ứng dụng Express
  const app = express();

  // --- Middleware ---
  // Cho phép Cross-Origin Resource Sharing (CORS) từ mọi nguồn
  // Cần cấu hình chặt chẽ hơn cho môi trường production
  app.use(cors());

  // Middleware để parse JSON request body (không quá cần thiết cho GraphQL nhưng có thể hữu ích cho các route REST khác nếu có)
  app.use(express.json());

  // --- Kết nối Database ---
  try {
    await connectDB(); // Gọi hàm kết nối MongoDB
  } catch (dbError) {
     // Nếu kết nối DB thất bại ngay từ đầu, không cần khởi động server
     console.error('Could not connect to Database. Server not started.', dbError);
     process.exit(1); // Thoát ứng dụng
  }


  // --- Khởi tạo Apollo Server ---
  const server = new ApolloServer({
    typeDefs,     // Định nghĩa schema từ file .graphql
    resolvers,    // Các hàm xử lý logic
    context: ({ req }) => {
      // Context có thể chứa thông tin chung cho mọi resolver, ví dụ: thông tin user từ request header
      // Hiện tại chưa dùng nhưng để sẵn cấu trúc
      // return { user: req.user };
      return {};
    },
    // Bật các công cụ introspection và playground trong môi trường development
    // (Mặc định thường là bật nếu NODE_ENV không phải là 'production')
    introspection: true, // Cho phép các công cụ client khám phá schema
    // playground: true, // Apollo Server 3 không còn dùng playground, thay bằng landing page mặc định
                         // Hoặc có thể cấu hình landing page plugin nếu muốn giao diện cũ
  });

  // --- Tích hợp Apollo Server với Express ---
  // Cần gọi server.start() trước khi apply middleware trong Apollo Server v3+
  await server.start();

  // Áp dụng middleware của Apollo vào Express tại đường dẫn /graphql
  // Mọi request đến /graphql sẽ được Apollo Server xử lý
  server.applyMiddleware({ app, path: '/graphql' });

  // --- Khởi động Express Server ---
  const PORT = process.env.PORT || 4000; // Lấy port từ biến môi trường hoặc dùng 4000

  app.listen(PORT, () => {
    console.log(`🚀 Backend Server ready at http://localhost:${PORT}`);
    console.log(`🚀 GraphQL endpoint ready at http://localhost:<span class="math-inline">\{PORT\}</span>{server.graphqlPath}`);
  });
};

// Gọi hàm để bắt đầu server
startServer().catch(error => {
   console.error('Failed to start the server:', error);
});