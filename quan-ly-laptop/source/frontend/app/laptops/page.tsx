// app/laptops/page.tsx
'use client'; // Cần thiết vì dùng hooks

import React from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Dùng trong App Router
import { GET_LAPTOPS } from '@/lib/graphqlQueries'; // Import query
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"; // Import components table
import { Button } from "@/components/ui/button"; // Import button
import { Skeleton } from "@/components/ui/skeleton"; // Import skeleton cho loading

// Định nghĩa kiểu dữ liệu Laptop (đã thêm imageUrl)
interface Laptop {
  id: string;
  name: string;
  configuration: string;
  pricePerHour: number;
  imageUrl?: string; // Đã thêm trường này
}

export default function LaptopsPage() {
  const router = useRouter();
  // Lấy dữ liệu bằng useQuery
  const { loading, error, data } = useQuery(GET_LAPTOPS);

  // Hàm xử lý khi click vào một dòng
  const handleRowClick = (id: string) => {
    router.push(`/laptops/${id}`); // Điều hướng đến trang chi tiết
  };

  // --- Xử lý trạng thái Loading (Đã cập nhật Skeleton) ---
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-[200px]" /> {/* Skeleton cho title */}
            <Skeleton className="h-10 w-[150px]" /> {/* Skeleton cho Button */}
        </div>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        {/* Thêm cột Skeleton cho Image */}
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Configuration</TableHead>
                        <TableHead className="text-right">Price/Hour</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => ( // Hiện 5 dòng skeleton
                        <TableRow key={index}>
                            {/* Thêm Cell Skeleton cho Image */}
                            <TableCell>
                                <Skeleton className="h-16 w-24 rounded-md" />
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-[100px] float-right" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>
    );
  }

  // --- Xử lý trạng thái Error (Giữ nguyên) ---
  if (error) {
    console.error("Error fetching laptops:", error); // Log lỗi ra console để debug
    return (
      <div className="container mx-auto p-4">
         <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold">Manage Laptops</h1>
             {/* Vẫn hiện nút Add */}
             <Button asChild>
                <Link href="/laptops/new">Add New Laptop</Link>
             </Button>
         </div>
        <p className="text-red-500">Error loading laptops. Could not connect to the service.</p>
        <p className="text-sm text-muted-foreground">Please ensure the backend service is running and accessible.</p>
      </div>
    );
  }

  // --- Xử lý khi có Data (Giữ nguyên) ---
  const laptops: Laptop[] = data?.laptops || []; // Lấy dữ liệu hoặc mảng rỗng

  // Hàm định dạng tiền tệ (Giữ nguyên)
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- Render UI chính (Đã cập nhật Table) ---
  return (
    <div className="container mx-auto p-4">
      {/* Tiêu đề và nút Add (giữ nguyên) */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Laptops</h1>
        <Button asChild>
          <Link href="/laptops/new">Add New Laptop</Link>
        </Button>
      </div>

      {/* Bảng dữ liệu - ĐÃ CẬP NHẬT */}
      <div className="border rounded-md">
        <Table>
          <TableCaption>A list of available laptops for rent.</TableCaption>
          <TableHeader>
            <TableRow>
              {/* Thêm cột Image */}
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead className="text-right">Price/Hour (VND)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laptops.length > 0 ? (
              laptops.map((laptop) => (
                <TableRow
                    key={laptop.id}
                    onClick={() => handleRowClick(laptop.id)}
                    className="cursor-pointer hover:bg-muted/50"
                >
                  {/* Thêm Cell hiển thị Image */}
                  <TableCell>
                    {laptop.imageUrl ? (
                      <img
                        src={laptop.imageUrl}
                        alt={laptop.name}
                        className="h-16 w-24 rounded-md object-contain border bg-white" // CSS cho ảnh
                      />
                    ) : (
                      // Placeholder nếu không có ảnh
                      <div className="h-16 w-24 rounded-md bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{laptop.name}</TableCell>
                  <TableCell>{laptop.configuration}</TableCell>
                  <TableCell className="text-right">{formatCurrency(laptop.pricePerHour)}</TableCell>
                </TableRow>
              ))
            ) : (
               // Cập nhật colSpan thành 4
               <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No laptops found.
                  </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}