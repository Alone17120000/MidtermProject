// components/ApolloProviderWrapper.tsx // <--- Đường dẫn đúng
'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
// Alias "@/*" thường được cấu hình để trỏ vào thư mục gốc (frontend)
// nên import này VẪN ĐÚNG
import client from '@/lib/apolloClient';

export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}