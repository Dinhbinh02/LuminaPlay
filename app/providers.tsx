'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import HistoryInitializer from '@/components/auth/HistoryInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 hour (Data stays fresh)
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (Keep in memory even if unmounted)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <HistoryInitializer />
      {children}
    </QueryClientProvider>
  );
}
