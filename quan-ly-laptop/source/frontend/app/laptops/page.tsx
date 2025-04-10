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

// Định nghĩa kiểu dữ liệu Laptop (khớp với query GET_LAPTOPS)
interface Laptop {
  id: string;
  name: string;
  configuration: string;
  pricePerHour: number;
}

export default function LaptopsPage() {
  const router = useRouter();
  // Lấy dữ liệu bằng useQuery
  const { loading, error, data } = useQuery(GET_LAPTOPS);

  // Hàm xử lý khi click vào một dòng
  const handleRowClick = (id: string) => {
    router.push(`/laptops/${id}`); // Điều hướng đến trang chi tiết
  };

  // --- Xử lý trạng thái Loading ---
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
                        <TableHead>Name</TableHead>
                        <TableHead>Configuration</TableHead>
                        <TableHead>Price/Hour (VND)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => ( // Hiện 5 dòng skeleton
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>
    );
  }

  // --- Xử lý trạng thái Error ---
  // !!! LƯU Ý: Hiện tại chúng ta RẤT CÓ KHẢ NĂNG sẽ thấy lỗi này !!!
  // Do backend và Codespaces chưa được kết nối đúng cách. Cứ chấp nhận nó bây giờ.
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

  // --- Xử lý khi có Data ---
  const laptops: Laptop[] = data?.laptops || []; // Lấy dữ liệu hoặc mảng rỗng

  // Hàm định dạng tiền tệ (tùy chọn)
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- Render UI chính ---
  return (
    <div className="container mx-auto p-4">
      {/* Tiêu đề và nút Add */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Laptops</h1>
        <Button asChild> {/* asChild để Button hoạt động như Link */}
          <Link href="/laptops/new">Add New Laptop</Link>
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="border rounded-md">
        <Table>
          <TableCaption>A list of available laptops for rent.</TableCaption>
          <TableHeader>
            <TableRow>
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
                    onClick={() => handleRowClick(laptop.id)} // Gọi hàm khi click
                    className="cursor-pointer hover:bg-muted/50" // Style con trỏ + hover
                >
                  <TableCell className="font-medium">{laptop.name}</TableCell>
                  <TableCell>{laptop.configuration}</TableCell>
                  <TableCell className="text-right">{formatCurrency(laptop.pricePerHour)}</TableCell>
                </TableRow>
              ))
            ) : (
               // Trường hợp không có dữ liệu
               <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
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