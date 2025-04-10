// app/laptops/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_LAPTOP, GET_LAPTOPS } from '@/lib/graphqlQueries';
// Import component, type và schema từ LaptopForm
import { LaptopForm, LaptopFormValues, laptopFormSchema } from '@/components/LaptopForm';
import { toast } from 'sonner';
// import { z } from 'zod'; // Không cần import Zod nếu chỉ dùng type LaptopFormValues
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Không cần định nghĩa lại schema và type ở đây nữa
// const laptopFormSchema = z.object({ ... }); // REMOVE
// type LaptopFormValues = z.infer<typeof laptopFormSchema>; // REMOVE

export default function AddLaptopPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [createLaptopMutation] = useMutation(CREATE_LAPTOP, {
        onCompleted: (data) => {
            toast.success(`Laptop "${data.createLaptop?.name}" created successfully!`);
            setIsLoading(false);
            router.push('/laptops');
        },
        onError: (error) => {
            console.error("Error creating laptop:", error);
            toast.error(`Failed to create laptop: ${error.message}`);
            setIsLoading(false);
        },
        refetchQueries: [{ query: GET_LAPTOPS }],
    });

    // Hàm xử lý submit - ĐÃ CẬP NHẬT để gửi imageUrl
    const handleCreateLaptop = async (values: LaptopFormValues) => {
        setIsLoading(true);
        console.log('Form values submitted:', values);
        createLaptopMutation({
            variables: {
                input: { // Gửi đủ các trường bao gồm cả imageUrl
                    name: values.name,
                    configuration: values.configuration,
                    pricePerHour: values.pricePerHour,
                    imageUrl: values.imageUrl // <-- Đã thêm/đảm bảo có
                }
            }
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-lg">
             <Card>
                <CardHeader>
                   <CardTitle>Add New Laptop</CardTitle>
                </CardHeader>
                <CardContent>
                     <LaptopForm
                        mode="create"
                        onSubmit={handleCreateLaptop}
                        isLoading={isLoading}
                    />
                </CardContent>
             </Card>
        </div>
    );
}