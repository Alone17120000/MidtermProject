import type { Metadata } from "next";
// Giữ lại font bạn đang dùng (Geist)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import component bao bọc ApolloProvider đã tạo
import { ApolloProviderWrapper } from "@/components/ApolloProviderWrapper";
// Import Toaster từ sonner (đã cài qua shadcn) để hiển thị thông báo
import { Toaster } from "@/components/ui/sonner"; // Đường dẫn có thể khác nếu shadcn cấu hình khác

// Giữ lại thiết lập font của bạn
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cập nhật metadata cho phù hợp với ứng dụng
export const metadata: Metadata = {
  title: "Laptop Rental Admin", // Title cụ thể hơn
  description: "Quản lý danh sách laptop cho thuê", // Mô tả cụ thể hơn
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Giữ lại className font của bạn */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Bọc children bằng ApolloProviderWrapper */}
        <ApolloProviderWrapper>
          {children}
          {/* Thêm Toaster vào đây để có thể hiển thị thông báo */}
          <Toaster richColors position="top-right"/>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}