// app/laptops/[id]/edit/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { GET_LAPTOP_BY_ID, UPDATE_LAPTOP, GET_LAPTOPS } from '@/lib/graphqlQueries';
// Import component, type và schema từ LaptopForm
import { LaptopForm, LaptopFormValues, laptopFormSchema } from '@/components/LaptopForm';
import { toast } from 'sonner';
// import { z } from 'zod'; // Không cần import Zod nếu chỉ dùng type LaptopFormValues
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Interface Laptop giữ nguyên để định kiểu dữ liệu query trả về
interface Laptop {
    id: string;
    name: string;
    configuration: string;
    pricePerHour: number;
    imageUrl?: string;
}

// Không cần định nghĩa lại schema và type ở đây nữa
// const laptopFormSchema = z.object({ ... }); // REMOVE
// type LaptopFormValues = z.infer<typeof laptopFormSchema>; // REMOVE


export default function EditLaptopPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string | undefined;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch dữ liệu hiện tại (giữ nguyên)
    const { data: queryData, loading: queryLoading, error: queryError } = useQuery<{ laptop: Laptop }>(GET_LAPTOP_BY_ID, {
        variables: { id },
        skip: !id,
    });

    // Setup mutation cập nhật (giữ nguyên)
    const [updateLaptopMutation] = useMutation(UPDATE_LAPTOP, {
        onCompleted: (data) => {
            toast.success(`Laptop "${data.updateLaptop?.name}" updated successfully!`);
            setIsSubmitting(false);
            router.push(`/laptops/${id}`);
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

    // Hàm xử lý submit - ĐÃ CẬP NHẬT để gửi imageUrl
    const handleUpdateLaptop = async (values: LaptopFormValues) => {
        if (!id) return;
        setIsSubmitting(true);
        console.log('Form values submitted for update:', values);
        updateLaptopMutation({
            variables: {
                id: id,
                input: { // Gửi đủ các trường bao gồm cả imageUrl
                    name: values.name,
                    configuration: values.configuration,
                    pricePerHour: values.pricePerHour,
                    imageUrl: values.imageUrl // <-- Đã thêm/đảm bảo có
                }
            }
        });
    };

    // Xử lý Loading (giữ nguyên)
    if (queryLoading) {
         return (
            <div className="container mx-auto p-4 max-w-lg">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* ... Skeleton fields ... */}
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
                         {/* Skeleton cho imageUrl field */}
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

    // Xử lý Error (giữ nguyên)
    if (queryError) {
        console.error("Error fetching laptop for edit:", queryError);
        return (
            <div className="container mx-auto p-4 text-center">
                {/* ... Error UI ... */}
                 <h1 className="text-xl font-semibold mb-4">Error</h1>
                 <p className="text-red-500 mb-4">
                   Could not load laptop data: {queryError.message}
                 </p>
                 <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Xử lý Not Found (giữ nguyên)
    if (!queryData?.laptop) {
        return (
            <div className="container mx-auto p-4 text-center">
                 {/* ... Not Found UI ... */}
                 <h1 className="text-xl font-semibold mb-4">Not Found</h1>
                 <p className="text-muted-foreground mb-4">Laptop data not found or unavailable.</p>
                 <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Lấy dữ liệu (giữ nguyên)
    const initialData = queryData.laptop;

    // Render Form (giữ nguyên)
    return (
        <div className="container mx-auto p-4 max-w-lg">
            <Card>
                <CardHeader>
                   <CardTitle>Edit Laptop: {initialData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <LaptopForm
                        mode="edit"
                        initialData={initialData}
                        onSubmit={handleUpdateLaptop}
                        isLoading={isSubmitting}
                    />
                </CardContent>
             </Card>
        </div>
    );
}