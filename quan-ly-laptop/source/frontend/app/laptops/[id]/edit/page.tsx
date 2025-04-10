// app/laptops/[id]/edit/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link'; // Import Link dù không dùng trực tiếp trong return nhưng có thể cần sau này
import { GET_LAPTOP_BY_ID, UPDATE_LAPTOP, GET_LAPTOPS } from '@/lib/graphqlQueries';
import { LaptopForm } from '@/components/LaptopForm';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Schema và Type
const laptopFormSchema = z.object({
    name: z.string().min(3),
    configuration: z.string().min(5),
    pricePerHour: z.coerce.number().positive(),
});
type LaptopFormValues = z.infer<typeof laptopFormSchema>;

interface Laptop {
    id: string;
    name: string;
    configuration: string;
    pricePerHour: number;
}

export default function EditLaptopPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string | undefined;

    const [isSubmitting, setIsSubmitting] = useState(false); // State cho lúc submit mutation

    // 1. Fetch dữ liệu hiện tại của laptop
    const { data: queryData, loading: queryLoading, error: queryError } = useQuery<{ laptop: Laptop }>(GET_LAPTOP_BY_ID, {
        variables: { id },
        skip: !id,
    });

    // 2. Setup mutation để cập nhật
    const [updateLaptopMutation] = useMutation(UPDATE_LAPTOP, {
        onCompleted: (data) => {
            toast.success(`Laptop "${data.updateLaptop?.name}" updated successfully!`);
            setIsSubmitting(false);
            router.push(`/laptops/${id}`); // Quay về trang chi tiết
        },
        onError: (error) => {
            console.error("Error updating laptop:", error);
            toast.error(`Failed to update laptop: ${error.message}`);
            setIsSubmitting(false);
        },
        refetchQueries: [
            { query: GET_LAPTOPS },
            { query: GET_LAPTOP_BY_ID, variables: { id } }
        ],
    });

    // 3. Hàm xử lý submit form
    const handleUpdateLaptop = async (values: LaptopFormValues) => {
        if (!id) return;
        setIsSubmitting(true);
        updateLaptopMutation({
            variables: {
                id: id,
                input: {
                    name: values.name,
                    configuration: values.configuration,
                    pricePerHour: values.pricePerHour,
                }
            }
        });
    };

    // --- Xử lý trạng thái Loading của Query ---
    if (queryLoading) {
         return (
            <div className="container mx-auto p-4 max-w-lg">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                 </Card>
            </div>
        );
    }

    // --- Xử lý trạng thái Error của Query ---
    if (queryError) {
        console.error("Error fetching laptop for edit:", queryError);
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-xl font-semibold mb-4">Error</h1>
                <p className="text-red-500 mb-4">
                  Could not load laptop data: {queryError.message}
                </p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // --- Xử lý Not Found hoặc Data chưa sẵn sàng (sau khi hết loading/error) ---
    // ** Phần đã sửa để fix lỗi TS18048 **
    if (!queryData?.laptop) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-xl font-semibold mb-4">Not Found</h1>
                <p className="text-muted-foreground mb-4">Laptop data not found or unavailable.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // --- Lấy dữ liệu Laptop (An toàn) ---
    // Nếu code chạy đến đây, queryData và queryData.laptop chắc chắn đã tồn tại
    const initialData = queryData.laptop;

    // --- Render Form khi có dữ liệu ---
    return (
        <div className="container mx-auto p-4 max-w-lg">
            <Card>
                <CardHeader>
                   <CardTitle>Edit Laptop: {initialData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Truyền initialData và mode='edit' vào form */}
                    <LaptopForm
                        mode="edit"
                        initialData={initialData}
                        onSubmit={handleUpdateLaptop}
                        isLoading={isSubmitting} // Dùng state loading của mutation
                    />
                </CardContent>
             </Card>
        </div>
    );
}