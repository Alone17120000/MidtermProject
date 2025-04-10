// app/laptops/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_LAPTOP, GET_LAPTOPS } from '@/lib/graphqlQueries'; // Import mutation và query list
import { LaptopForm } from '@/components/LaptopForm'; // Import form component
import { toast } from 'sonner';
import { z } from 'zod'; // Import Zod để dùng lại kiểu dữ liệu
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Optional: Bọc form cho đẹp

// Định nghĩa lại kiểu dữ liệu hoặc import từ form component nếu đã export
// (Cần để định kiểu cho hàm onSubmit)
const laptopFormSchema = z.object({
    name: z.string().min(3),
    configuration: z.string().min(5),
    pricePerHour: z.coerce.number().positive(),
});
type LaptopFormValues = z.infer<typeof laptopFormSchema>;

export default function AddLaptopPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Setup mutation để tạo Laptop
    const [createLaptopMutation] = useMutation(CREATE_LAPTOP, {
        onCompleted: (data) => {
            toast.success(`Laptop "${data.createLaptop?.name}" created successfully!`);
            setIsLoading(false);
            router.push('/laptops'); // Quay về trang danh sách sau khi tạo thành công
        },
        onError: (error) => {
            console.error("Error creating laptop:", error);
            toast.error(`Failed to create laptop: ${error.message}`);
            setIsLoading(false);
        },
        // Tự động fetch lại danh sách laptops sau khi tạo thành công
        // để cập nhật UI ở trang list mà không cần refresh trang
        refetchQueries: [{ query: GET_LAPTOPS }],
        // awaitRefetchQueries: true, // Đảm bảo refetch xong mới chạy onCompleted (nếu cần)
    });

    // Hàm xử lý khi form được submit và đãผ่าน validation
    const handleCreateLaptop = async (values: LaptopFormValues) => {
        setIsLoading(true); // Bắt đầu loading
        console.log('Form values submitted:', values); // Log dữ liệu gửi đi
        // Gọi mutation với biến input đúng cấu trúc schema GraphQL
        createLaptopMutation({
            variables: {
                input: {
                    name: values.name,
                    configuration: values.configuration,
                    pricePerHour: values.pricePerHour,
                }
            }
        });
        // Không cần setIsLoading(false) ở đây vì nó đã được xử lý trong onCompleted/onError
    };

    return (
        <div className="container mx-auto p-4 max-w-lg"> {/* Giới hạn chiều rộng */}
             <Card>
                <CardHeader>
                   <CardTitle>Add New Laptop</CardTitle>
                </CardHeader>
                <CardContent>
                     <LaptopForm
                        mode="create" // Chế độ 'tạo mới'
                        onSubmit={handleCreateLaptop} // Hàm xử lý submit
                        isLoading={isLoading} // Trạng thái loading
                        // Không cần initialData cho chế độ create
                    />
                </CardContent>
             </Card>

        </div>
    );
}