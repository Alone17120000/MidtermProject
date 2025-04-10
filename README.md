# Quản Lý Cho Thuê Laptop Khách Sạn (Bài tập giữa kỳ)

Ứng dụng web fullstack đơn giản giúp admin khách sạn quản lý (CRUD - Create, Read, Update, Delete) danh sách các laptop cho thuê. Dự án được xây dựng theo yêu cầu bài tập giữa kỳ.

## Công nghệ sử dụng

* **Backend:** Node.js, Express, Apollo Server (GraphQL), MongoDB, Mongoose
* **Frontend:** Next.js (v14+ App Router), React (v18), TypeScript, Tailwind CSS, shadcn/ui, Apollo Client
* **Database:** MongoDB (chạy như một service trong Docker Compose)
* **Môi trường Phát triển:** GitHub Codespaces (Dev Container với Docker Compose)

## Yêu cầu cài đặt

* Tài khoản GitHub.
* Trình duyệt web tương thích với GitHub Codespaces.
* **Không** cần cài đặt Node.js, MongoDB, Docker hay bất kỳ công cụ nào khác trên máy cá nhân nếu sử dụng GitHub Codespaces.

## Khởi chạy dự án với GitHub Codespaces (Khuyến nghị)

Đây là cách đơn giản và đảm bảo nhất để chạy dự án với đầy đủ môi trường cần thiết.

1.  **Mở trong Codespaces:**
    * Truy cập repository chứa mã nguồn này trên GitHub.
    * Nhấn nút `<> Code`.
    * Chọn tab "Codespaces".
    * Nhấn nút "Create codespace on [tên-nhánh]" (ví dụ: `main`).
    * Chờ trong vài phút để GitHub Codespaces tạo môi trường. Nó sẽ tự động đọc cấu hình trong thư mục `.devcontainer` (sử dụng `docker-compose.yml`) để dựng lên các container cần thiết (Node.js cho app và MongoDB) và tự động chạy `npm install` cho cả backend và frontend (dựa theo `postCreateCommand` trong `devcontainer.json`).

2.  **Seed Dữ liệu Mẫu (Chạy 1 lần đầu):**
    * Sau khi Codespace khởi tạo xong và VS Code mở ra, hãy mở một cửa sổ Terminal.
    * Chạy các lệnh sau để đi vào thư mục backend và thêm dữ liệu mẫu vào MongoDB:
        ```bash
        cd source/backend
        npm run seed
        ```
    * Nếu thành công, bạn sẽ thấy các log thông báo kết nối và thêm 10 laptops vào database.

3.  **Chạy Backend Server:**
    * Trong terminal (vẫn ở `source/backend` hoặc mở terminal mới và `cd source/backend`), chạy:
        ```bash
        npm run dev
        ```
    * Server backend GraphQL sẽ khởi động và lắng nghe trên cổng 4000 (bên trong Codespace).

4.  **Chạy Frontend Server:**
    * Mở một cửa sổ Terminal **khác** (không dùng chung với terminal đang chạy backend).
    * Chạy các lệnh sau:
        ```bash
        cd source/frontend
        npm run dev
        ```
    * Server frontend Next.js sẽ khởi động và lắng nghe trên cổng 3000 (bên trong Codespace).

## Truy cập ứng dụng

Khi cả backend và frontend đã chạy trong Codespaces:

1.  **Mở Tab "Ports":** Trong VS Code (giao diện Codespaces), nhìn xuống panel phía dưới, tìm và mở tab "Ports".
2.  **Truy cập Frontend:**
    * Tìm dòng có cổng (Port) là **3000** (thường có tên là "Next.js dev server" hoặc tương tự).
    * Nhấn vào biểu tượng quả địa cầu 🌐 (Open in Browser) ở cột "Local Address".
    * Trình duyệt sẽ mở ra trang chủ của ứng dụng frontend. Điều hướng đến `/laptops` để xem chức năng chính.
3.  **Truy cập GraphQL Playground (Backend):**
    * Trong tab "Ports", tìm dòng có cổng (Port) là **4000**.
    * Nhấn vào biểu tượng quả địa cầu 🌐.
    * Trình duyệt sẽ mở URL tương ứng. Thêm `/graphql` vào cuối URL đó (ví dụ: `https://[tên-codespace-dài]-4000.app.github.dev/graphql`).
    * Bạn sẽ thấy giao diện Apollo Server Sandbox, nơi bạn có thể viết và thực thi các câu lệnh GraphQL trực tiếp để kiểm tra API backend.

## Biến môi trường cần thiết

Các biến môi trường đã được cấu hình sẵn để hoạt động trong môi trường Docker Compose của Codespaces:

* **Backend (`source/backend/.env`):**
    * `MONGODB_URI=mongodb://mongo:27017/hotel_laptops`: Kết nối tới service `mongo` trong Docker Compose.
    * `PORT=4000`: Cổng chạy backend.
* **Frontend (`source/frontend/.env.local`):**
    * `NEXT_PUBLIC_GRAPHQL_API_URL=http://localhost:4000/graphql`: Địa chỉ để frontend gọi backend GraphQL API. Codespaces sẽ tự động định tuyến `localhost:4000` này đến backend service đang chạy trên cổng 4000.
    * ## Cấu trúc thư mục dự án
├── .devcontainer/        # Cấu hình Dev Container (Docker Compose)
│   ├── devcontainer.json
│   └── docker-compose.yml
├── .gitignore            # Các file/thư mục bị Git bỏ qua
├── readme.md             # File hướng dẫn này
└── source/
├── backend/          # Mã nguồn backend (Node.js, GraphQL)
└── frontend/         # Mã nguồn frontend (Next.js, React)

