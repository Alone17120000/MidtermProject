// lib/graphqlQueries.ts
import { gql } from '@apollo/client';

// Query để lấy danh sách tất cả laptops
// Chỉ lấy các trường cần thiết cho trang danh sách
export const GET_LAPTOPS = gql`
  query GetLaptops {
    laptops {
      id
      name
      configuration
      pricePerHour
      imageUrl
    }
  }
`;

// Query để lấy chi tiết một laptop theo ID
// Lấy tất cả các trường cần thiết cho trang chi tiết
export const GET_LAPTOP_BY_ID = gql`
  query GetLaptopById($id: ID!) {
    laptop(id: $id) {
      id
      name
      configuration
      pricePerHour
      imageUrl
      createdAt # Có thể lấy thêm nếu cần hiển thị
      updatedAt # Có thể lấy thêm nếu cần hiển thị
    }
  }
`;

// Mutation để tạo một laptop mới
// $input là biến, kiểu là CreateLaptopInput! (bắt buộc)
export const CREATE_LAPTOP = gql`
  mutation CreateLaptop($input: CreateLaptopInput!) {
    createLaptop(input: $input) {
      # Lấy về các trường của laptop vừa tạo để cập nhật cache hoặc hiển thị
      id
      name
      configuration
      pricePerHour
      imageUrl
    }
  }
`;

// Mutation để cập nhật một laptop
// $id là ID của laptop cần cập nhật
// $input là dữ liệu mới, kiểu UpdateLaptopInput! (bắt buộc, nhưng các trường bên trong là tùy chọn)
export const UPDATE_LAPTOP = gql`
  mutation UpdateLaptop($id: ID!, $input: UpdateLaptopInput!) {
    updateLaptop(id: $id, input: $input) {
      # Lấy về các trường đã được cập nhật
      id
      name
      configuration
      pricePerHour
      imageUrl
    }
  }
`;

// Mutation để xóa một laptop
// $id là ID của laptop cần xóa
export const DELETE_LAPTOP = gql`
  mutation DeleteLaptop($id: ID!) {
    deleteLaptop(id: $id) {
      # Chỉ cần lấy về ID để xác nhận xóa thành công là đủ
      id
    }
  }
`;

