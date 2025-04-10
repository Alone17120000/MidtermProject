// components/LaptopForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FieldErrors } from 'react-hook-form'; // Đảm bảo đã import

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
import { toast } from "sonner";

// --- Cập nhật Interface ---
interface LaptopFormData {
  name: string;
  configuration: string;
  pricePerHour: number;
  imageUrl?: string; // <--- Thêm vào đây
}

// --- Cập nhật Schema validation ---
const laptopFormSchema = z.object({
  name: z.string().min(3, {
    message: "Laptop name must be at least 3 characters.",
  }),
  configuration: z.string().min(5, {
    message: "Configuration must be at least 5 characters.",
  }),
  pricePerHour: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .positive({ message: "Price must be positive." }),
  // Thêm validation cho imageUrl: là string, dạng URL, hoặc rỗng, và không bắt buộc
  imageUrl: z.string()
             .url({ message: "Please enter a valid URL." }) // Phải là URL nếu có nhập
             .optional() // Cho phép không nhập (undefined)
             .or(z.literal('')), // Hoặc cho phép chuỗi rỗng ""
});

// Định nghĩa kiểu cho Props của component (giữ nguyên)
interface LaptopFormProps {
  mode: 'create' | 'edit';
  initialData?: LaptopFormData & { id?: string };
  isLoading?: boolean;
  onSubmit: (values: z.infer<typeof laptopFormSchema>) => void | Promise<void>;
}

// --- Export Schema và Type để trang Add/Edit có thể dùng ---
// (Tùy chọn, nhưng nên làm để tránh định nghĩa lại)
export { laptopFormSchema };
export type LaptopFormValues = z.infer<typeof laptopFormSchema>;
// --------------------------------------------------------

export function LaptopForm({ mode, initialData, isLoading, onSubmit }: LaptopFormProps) {
  // 1. Thiết lập react-hook-form
  const form = useForm<LaptopFormValues>({ // Sử dụng type đã export
    resolver: zodResolver(laptopFormSchema),
    // --- Cập nhật defaultValues ---
    defaultValues: {
      name: initialData?.name || "",
      configuration: initialData?.configuration || "",
      pricePerHour: initialData?.pricePerHour || 0,
      imageUrl: initialData?.imageUrl || "", // <--- Thêm vào đây
    },
  });

  // 2. Cập nhật defaultValues khi initialData thay đổi (Edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
       // --- Cập nhật form.reset ---
      form.reset({
        name: initialData.name,
        configuration: initialData.configuration,
        pricePerHour: initialData.pricePerHour,
        imageUrl: initialData.imageUrl || "", // <--- Thêm vào đây
      });
    }
  }, [initialData, mode, form.reset]);

  // 3. Hàm xử lý submit và lỗi validation (đã sửa ở bước trước)
  const handleFormSubmit = async (values: LaptopFormValues) => {
      try {
          await onSubmit(values);
      } catch (error) {
          console.error("Form submission error:", error);
          toast.error("An unexpected error occurred during submission.");
      }
  };

   const onValidationErrors = (errors: FieldErrors<LaptopFormValues>) => {
       console.error("Form validation errors:", errors);
       toast.error("Validation failed. Please check the form fields.");
   };

  // 4. Render JSX cho form
  return (
    <Form {...form}>
      <form
          onSubmit={form.handleSubmit(handleFormSubmit, onValidationErrors)}
          className="space-y-6"
        >
        {/* Trường Name (giữ nguyên) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Laptop Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dell XPS 15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trường Configuration (giữ nguyên) */}
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

        {/* Trường Price Per Hour (giữ nguyên) */}
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

        {/* --- Thêm FormField cho imageUrl --- */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                 {/* Dùng type="url" để trình duyệt hỗ trợ gợi ý/validate cơ bản */}
                <Input type="url" placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage /> {/* Hiển thị lỗi nếu nhập sai định dạng URL */}
            </FormItem>
          )}
        />
        {/* --------------------------------- */}

        {/* Nút Submit (giữ nguyên) */}
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