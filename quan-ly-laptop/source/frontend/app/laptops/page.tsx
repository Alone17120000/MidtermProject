// app/laptops/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GET_LAPTOPS } from '@/lib/graphqlQueries';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // Icons for sorting

// Định nghĩa kiểu Laptop
interface Laptop {
  id: string;
  name: string;
  configuration: string;
  pricePerHour: number;
  imageUrl?: string;
}

// Định nghĩa kiểu cho SortBy và SortOrder
type SortByType = 'NAME' | 'PRICE_PER_HOUR';
type SortOrderType = 'ASC' | 'DESC';

export default function LaptopsPage() {
  const router = useRouter();

  // --- STATE VARIABLES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5); // Items per page
  const [sortBy, setSortBy] = useState<SortByType>('NAME');
  const [sortOrder, setSortOrder] = useState<SortOrderType>('ASC');
  const [searchTerm, setSearchTerm] = useState(''); // Live search input state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Search term sent to query
  const [filters, setFilters] = useState<{ minPrice?: number | null; maxPrice?: number | null }>({}); // Applied filters
  // State for filter inputs
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  // ----------------------

  // --- UseQuery Hook ---
  const { loading, error, data, refetch } = useQuery(GET_LAPTOPS, {
       variables: {
           page: currentPage,
           limit: limit,
           sortBy: sortBy,
           sortOrder: sortOrder,
           filter: (filters.minPrice || filters.maxPrice) ? {
               minPrice: filters.minPrice || null,
               maxPrice: filters.maxPrice || null,
           } : null,
           search: appliedSearchTerm || null,
       },
       fetchPolicy: 'cache-and-network', // Ensures data refetches on variable change
       // notifyOnNetworkStatusChange: true, // Optional: sets loading=true on refetches
   });
   // --------------------

  // Handle row click (navigation)
  const handleRowClick = (id: string) => {
    router.push(`/laptops/${id}`);
  };

  // --- HÀM XỬ LÝ SORT ---
  const handleSort = (column: SortByType) => {
      if (sortBy === column) {
          setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
      } else {
          setSortBy(column);
          setSortOrder('ASC');
      }
      setCurrentPage(1); // Reset page on sort
  };
  // -----------------------

  // --- HÀM XỬ LÝ FILTER ---
  const handleApplyFilters = () => {
    const minPrice = minPriceInput ? parseFloat(minPriceInput) : null;
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : null;
    const validMinPrice = (minPrice !== null && !isNaN(minPrice)) ? minPrice : null;
    const validMaxPrice = (maxPrice !== null && !isNaN(maxPrice)) ? maxPrice : null;

    setFilters({
        minPrice: validMinPrice,
        maxPrice: validMaxPrice,
    });
    setCurrentPage(1); // Reset page on filter
  };

  const handleClearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setFilters({});
    setCurrentPage(1);
  };
  // --------------------------

  // --- Xử lý trạng thái Loading ---
  if (loading && !data?.laptopsPage) { // Initial full page skeleton
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4"><Skeleton className="h-8 w-[200px]" /><Skeleton className="h-10 w-[150px]" /></div>
        <div className="flex items-center py-4"><Skeleton className="h-10 w-full max-w-sm" /></div>
         {/* Skeleton cho Filter */}
         <div className="flex items-center space-x-2 pb-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" /></div>
        <div className="border rounded-md">
            <Table>
                <TableHeader><TableRow><TableHead className="w-[100px]">Image</TableHead><TableHead>Name</TableHead><TableHead>Configuration</TableHead><TableHead className="text-right">Price/Hour</TableHead></TableRow></TableHeader>
                <TableBody>{[...Array(limit)].map((_, index) => (<TableRow key={index}><TableCell><Skeleton className="h-16 w-24 rounded-md" /></TableCell><TableCell><Skeleton className="h-4 w-[150px]" /></TableCell><TableCell><Skeleton className="h-4 w-[250px]" /></TableCell><TableCell className="text-right"><Skeleton className="h-4 w-[100px] float-right" /></TableCell></TableRow>))}</TableBody>
            </Table>
        </div>
        {/* Skeleton cho Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4"><Skeleton className="h-6 w-[150px]" /><div className="space-x-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div></div>
      </div>
    );
  }

  // --- Xử lý trạng thái Error ---
  if (error) {
    console.error("Error fetching laptops:", error);
    return (
      <div className="container mx-auto p-4">
         <div className="flex justify-between items-center mb-4"><h1 className="text-2xl font-bold">Manage Laptops</h1><Button asChild> <Link href="/laptops/new">Add New Laptop</Link> </Button></div>
          {/* Giữ lại Search/Filter UI khi lỗi */}
          <div className="flex items-center py-4"><Input placeholder="Search by laptop name..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { setAppliedSearchTerm(searchTerm); setCurrentPage(1);}}} className="max-w-sm"/></div>
          <div className="flex items-center space-x-2 pb-4"><Input type="number" placeholder="Min Price (VND)" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} className="max-w-[150px]"/><Input type="number" placeholder="Max Price (VND)" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} className="max-w-[150px]"/><Button onClick={handleApplyFilters}>Apply Filters</Button>{(filters.minPrice || filters.maxPrice || minPriceInput || maxPriceInput) && (<Button variant="outline" onClick={handleClearFilters}>Clear</Button>)}</div>
        <p className="text-red-500">Error loading laptops. Could not connect to the service.</p>
        <p className="text-sm text-muted-foreground">Please ensure the backend service is running and accessible.</p>
      </div>
    );
  }

  // --- Lấy dữ liệu ---
  const laptops: Laptop[] = data?.laptopsPage?.laptops || [];
  const totalCount: number = data?.laptopsPage?.totalCount || 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1; // Đảm bảo totalPages ít nhất là 1
  // --------------------

  // Hàm định dạng tiền tệ
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- Render UI chính ---
  return (
    <div className="container mx-auto p-4">
      {/* Tiêu đề và nút Add */}
      <div className="flex justify-between items-center mb-4"> <h1 className="text-2xl font-bold">Manage Laptops</h1> <Button asChild> <Link href="/laptops/new">Add New Laptop</Link> </Button> </div>

      {/* --- KHU VỰC TÌM KIẾM VÀ LỌC --- */}
      <div className="flex flex-wrap items-center gap-2 py-4"> {/* Dùng flex-wrap và gap */}
        <Input
          placeholder="Search by laptop name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { setAppliedSearchTerm(searchTerm); setCurrentPage(1); } }}
          className="max-w-xs" // Điều chỉnh độ rộng
        />
        <div className="flex items-center space-x-2"> {/* Nhóm bộ lọc giá */}
            <Input
                type="number"
                placeholder="Min Price"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="max-w-[120px]"
            />
             <span>-</span>
             <Input
                type="number"
                placeholder="Max Price"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="max-w-[120px]"
            />
             <Button onClick={handleApplyFilters} disabled={loading} size="sm">Apply</Button>
             {(filters.minPrice || filters.maxPrice || minPriceInput || maxPriceInput) && (
                 <Button variant="ghost" onClick={handleClearFilters} disabled={loading} size="sm">Clear</Button> // Đổi thành ghost
             )}
        </div>
      </div>
      {/* -------------------------------- */}

      {/* Bảng dữ liệu */}
      <div className="border rounded-md">
        <Table>
          <TableCaption>A list of available laptops for rent.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort('NAME')} className="px-0 hover:bg-transparent"> Name {sortBy === 'NAME' ? ( sortOrder === 'ASC' ? <ArrowUp className="ml-2 h-4 w-4 inline" /> : <ArrowDown className="ml-2 h-4 w-4 inline" /> ) : <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" /> } </Button>
              </TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead className="text-right">
                   <Button variant="ghost" onClick={() => handleSort('PRICE_PER_HOUR')} className="px-0 hover:bg-transparent"> {sortBy === 'PRICE_PER_HOUR' ? ( sortOrder === 'ASC' ? <ArrowUp className="ml-2 h-4 w-4 inline" /> : <ArrowDown className="ml-2 h-4 w-4 inline" /> ) : <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" /> } Price/Hour (VND) </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && ( <TableRow><TableCell colSpan={4} className="h-24 text-center"><div className="flex justify-center items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</div></TableCell></TableRow> )}
            {!loading && laptops.length > 0 ? (
              laptops.map((laptop) => (
                <TableRow key={laptop.id} onClick={() => handleRowClick(laptop.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{laptop.imageUrl ? (<img src={laptop.imageUrl} alt={laptop.name} className="h-16 w-24 rounded-md object-contain border bg-white"/>) : (<div className="h-16 w-24 rounded-md bg-secondary flex items-center justify-center text-xs text-muted-foreground">No Image</div>)}</TableCell>
                  <TableCell className="font-medium">{laptop.name}</TableCell>
                  <TableCell>{laptop.configuration}</TableCell>
                  <TableCell className="text-right">{formatCurrency(laptop.pricePerHour)}</TableCell>
                </TableRow>
              ))
            ) : null}
             {!loading && laptops.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center">No laptops found matching your criteria.</TableCell></TableRow>
             ) : null}
          </TableBody>
        </Table>
      </div>

      {/* UI Phân trang */}
      <div className="flex items-center justify-between space-x-2 py-4">
         <span className="text-sm text-muted-foreground"> Page {currentPage} of {totalPages} (Total: {totalCount} items) </span> {/* Sửa text */}
         <div className="space-x-2"> <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage <= 1 || loading} > Previous </Button> <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage >= totalPages || loading} > Next </Button> </div>
      </div>

    </div>
  );
}