// app/laptops/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hooks để lấy params và điều hướng
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { GET_LAPTOP_BY_ID, DELETE_LAPTOP, GET_LAPTOPS } from '@/lib/graphqlQueries'; // Import queries/mutations - Thêm GET_LAPTOPS nếu cần refetch sau xóa
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import Alert Dialog
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { toast } from "sonner"; // Import toast từ sonner đã cài

// Định nghĩa kiểu Laptop (đã thêm imageUrl)
interface Laptop {
    id: string;
    name: string;
    configuration: string;
    pricePerHour: number;
    imageUrl?: string; // Đã thêm
    createdAt?: string;
    updatedAt?: string;
}

export default function LaptopDetailPage() {
  const params = useParams(); // Hook để lấy params từ URL
  const router = useRouter(); // Hook để điều hướng
  const id = params?.id as string | undefined; // Lấy id, ép kiểu hoặc undefined

  // --- Fetch dữ liệu chi tiết ---
  const { data, loading, error } = useQuery<{ laptop: Laptop }>(GET_LAPTOP_BY_ID, {
    variables: { id }, // Truyền biến id vào query
    skip: !id, // Bỏ qua query nếu chưa có id (quan trọng!)
  });

  // --- Mutation để xóa ---
  const [deleteLaptopMutation, { loading: deleteLoading }] = useMutation(DELETE_LAPTOP, {
       variables: { id }, // Gán sẵn id cho mutation
       onCompleted: (data) => {
            toast.success(`Laptop ${data.deleteLaptop?.id || ''} deleted successfully!`);
            // Xóa thành công, quay về trang danh sách
            router.push('/laptops');
            // Cập nhật cache Apollo sau khi xóa (quan trọng để list tự cập nhật)
            // Cách 1: Dùng refetchQueries (đơn giản nhất)
            // Cần import GET_LAPTOPS
            // }, { refetchQueries: [{ query: GET_LAPTOPS }] }); // <-- Thêm vào options của useMutation
             // Cách 2: Cập nhật cache thủ công (linh hoạt hơn)
             // }, { update(cache) { // <-- Thêm update vào options của useMutation
             //       cache.evict({ id: cache.identify({ __typename: 'Laptop', id: id }) });
             //       cache.gc();
             //   }});
        },
        onError: (error) => {
            console.error("Error deleting laptop:", error);
            toast.error(`Failed to delete laptop: ${error.message}`);
        },
         // Nên thêm refetchQueries hoặc update cache vào options của useMutation ở trên
         // Ví dụ dùng refetchQueries:
         refetchQueries: [{ query: GET_LAPTOPS }], // Refetch list sau khi xoá
  });

  // --- Xử lý trạng thái Loading (Đã cập nhật Skeleton) ---
  if (loading) {
    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-lg mx-auto"> {/* Sửa max-w-md thành max-w-lg */}
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4"> {/* Tăng space nếu cần */}
                    {/* Thêm Skeleton cho ảnh */}
                    <Skeleton className="h-48 w-full rounded-md" />
                    {/* Giữ Skeleton cho text */}
                    <div className='space-y-2'>
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                     <div className='space-y-2'>
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  // --- Xử lý trạng thái Error ---
   if (error) {
     console.error("Error fetching laptop details:", error);
     return (
       <div className="container mx-auto p-4 text-center">
         <h1 className="text-xl font-semibold mb-4">Error</h1>
         <p className="text-red-500 mb-4">
           Could not load laptop details: {error.message}
         </p>
         <Button onClick={() => router.back()}>Go Back</Button>
       </div>
     );
   }

  // --- Xử lý Not Found hoặc Data chưa sẵn sàng (sau khi hết loading/error) ---
  if (!data?.laptop) {
    return (
      <div className="container mx-auto p-4 text-center">
         <h1 className="text-xl font-semibold mb-4">Not Found</h1>
        <p className="text-muted-foreground mb-4">Laptop not found or data is unavailable.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // --- Lấy dữ liệu Laptop ---
  const laptop = data.laptop;

  // Hàm thực hiện xóa
  const handleDelete = () => {
    if (!id) return;
    deleteLaptopMutation();
  };

   // Hàm định dạng tiền tệ
   const formatCurrency = (value: number) => {
       return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
   };

  // --- Render UI chính (Đã cập nhật CardContent) ---
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{laptop.name}</CardTitle>
          <CardDescription>ID: {laptop.id}</CardDescription>
        </CardHeader>
        {/* --- CardContent ĐÃ CẬP NHẬT --- */}
        <CardContent className="space-y-4 pt-4">
            {/* Thêm phần hiển thị ảnh */}
            {laptop.imageUrl && ( // Chỉ hiển thị nếu có imageUrl
                <div className="mb-4 border rounded-md overflow-hidden"> {/* Thêm border + overflow */}
                    <img
                        src={laptop.imageUrl}
                        alt={`Image of ${laptop.name}`}
                        className="w-full h-auto max-h-64 object-contain bg-white" // CSS cho ảnh chi tiết
                    />
                </div>
            )}

            {/* Giữ lại phần hiển thị text */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Configuration</p>
                <p>{laptop.configuration}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Price per Hour</p>
                <p>{formatCurrency(laptop.pricePerHour)}</p>
            </div>
            {/* Phần hiển thị createdAt/updatedAt (nếu có) giữ nguyên */}
        </CardContent>
        {/* ----------------------------- */}
        <CardFooter className="flex justify-end space-x-2">
          {/* Nút Edit - Link tới trang edit */}
          <Button variant="outline" asChild>
             <Link href={`/laptops/${laptop.id}/edit`}>Edit</Link>
          </Button>

          {/* Nút Delete - Mở Alert Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="destructive" disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
               </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  laptop &quot;{laptop.name}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {/* Nút xác nhận xóa sẽ gọi hàm handleDelete */}
                <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                     Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </CardFooter>
      </Card>
    </div>
  );
}