'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create QueryClient with persistence and optimized settings
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Cache for 1 hour for wallet state persistence
          gcTime: 1000 * 60 * 60,
          // Consider wallet data stale after 1 minute
          staleTime: 1000 * 60,
          // Retry failed requests
          retry: 2,
          // Shorter retry delay for wallet operations
          retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
          // Reduce refetch frequency for better wallet persistence
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
        mutations: {
          // Retry failed wallet transactions once
          retry: 1,
        },
      },
    })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={wagmiConfig.chains[0]}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}