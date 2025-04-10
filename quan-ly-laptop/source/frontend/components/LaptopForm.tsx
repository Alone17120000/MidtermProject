// components/LaptopForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Import thư viện zod

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Để hiển thị thông báo lỗi validation (tùy chọn)

// Định nghĩa kiểu dữ liệu cho Laptop (để dùng cho initialData)
interface LaptopFormData {
  name: string;
  configuration: string;
  pricePerHour: number;
}

// Định nghĩa Schema validation bằng Zod
const laptopFormSchema = z.object({
  name: z.string().min(3, {
    message: "Laptop name must be at least 3 characters.",
  }),
  configuration: z.string().min(5, {
    message: "Configuration must be at least 5 characters.",
  }),
  // Đảm bảo pricePerHour là số và lớn hơn 0
  pricePerHour: z.coerce // coerce giúp ép kiểu từ string (input type="number") về number
    .number({ invalid_type_error: "Price must be a number." })
    .positive({ message: "Price must be positive." }),
});

// Định nghĩa kiểu cho Props của component
interface LaptopFormProps {
  mode: 'create' | 'edit'; // Chế độ của form
  initialData?: LaptopFormData & { id?: string }; // Dữ liệu ban đầu (chỉ dùng cho edit)
  isLoading?: boolean; // Trạng thái loading (khi đang submit)
  // Hàm xử lý khi submit form (nhận dữ liệu đã validate)
  onSubmit: (values: z.infer<typeof laptopFormSchema>) => void | Promise<void>;
}

export function LaptopForm({ mode, initialData, isLoading, onSubmit }: LaptopFormProps) {
  // 1. Thiết lập react-hook-form
  const form = useForm<z.infer<typeof laptopFormSchema>>({
    resolver: zodResolver(laptopFormSchema), // Sử dụng zod để validate
    defaultValues: { // Giá trị mặc định cho form
      name: initialData?.name || "",
      configuration: initialData?.configuration || "",
      pricePerHour: initialData?.pricePerHour || 0,
    },
  });

  // 2. [Chỉ dùng cho Edit mode] Cập nhật defaultValues khi initialData thay đổi
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({ // Reset form với dữ liệu mới
        name: initialData.name,
        configuration: initialData.configuration,
        pricePerHour: initialData.pricePerHour,
      });
    }
    // Chỉ chạy khi initialData hoặc mode thay đổi (và form.reset sẵn sàng)
  }, [initialData, mode, form.reset]); // Thêm form.reset vào dependency array

  // 3. Hàm nội bộ để xử lý submit, có thể thêm xử lý lỗi validation tại đây
  const handleFormSubmit = async (values: z.infer<typeof laptopFormSchema>) => {
      try {
          await onSubmit(values); // Gọi hàm onSubmit được truyền từ cha
      } catch (error) {
          // Xử lý lỗi chung nếu hàm onSubmit từ cha throw error (ví dụ lỗi mạng)
          console.error("Form submission error:", error);
          toast.error("An unexpected error occurred during submission.");
      }
  };

   // Hàm xử lý khi validation thất bại (tùy chọn)
   const onValidationErrors = (errors: FieldErrors<z.infer<typeof laptopFormSchema>>) => {
    console.error("Form validation errors:", errors);
       // Có thể hiện toast thông báo lỗi validation đầu tiên
       const firstErrorMessage = Object.values(errors)[0]?.message;
       if (typeof firstErrorMessage === 'string') {
           toast.error(firstErrorMessage);
       } else {
           toast.error("Please check the form for errors.");
       }
   };

  // 4. Render JSX cho form
  return (
    // Bọc bằng component Form của shadcn, truyền vào các phương thức của react-hook-form
    <Form {...form}>
      {/* Thẻ form HTML với sự kiện onSubmit */}
      <form
          onSubmit={form.handleSubmit(handleFormSubmit, onValidationErrors)}
          className="space-y-6" // Thêm khoảng cách giữa các trường
        >
        {/* Trường Name */}
        <FormField
          control={form.control} // Liên kết với react-hook-form
          name="name" // Tên trường phải khớp với schema zod và defaultValues
          render={({ field }) => ( // field chứa các props (onChange, onBlur, value, ...)
            <FormItem>
              <FormLabel>Laptop Name</FormLabel>
              <FormControl>
                {/* Input của shadcn */}
                <Input placeholder="e.g., Dell XPS 15" {...field} />
              </FormControl>
              <FormMessage /> {/* Hiển thị lỗi validation nếu có */}
            </FormItem>
          )}
        />

        {/* Trường Configuration */}
        <FormField
          control={form.control}
          name="configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Configuration</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 16GB Ram, 512GB SSD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trường Price Per Hour */}
        <FormField
          control={form.control}
          name="pricePerHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Hour (VND)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 20000" step="1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nút Submit */}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (mode === 'create' ? 'Creating...' : 'Updating...')
            : (mode === 'create' ? 'Create Laptop' : 'Update Laptop')
          }
        </Button>
      </form>
    </Form>
  );
}