'use client';

import { useState, useEffect } from 'react';
import { WagmiProvider, type State } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi-simple';
import { suppressExtensionErrors } from '@/lib/wagmi-conflict-free';
import '@rainbow-me/rainbowkit/styles.css';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track if we're mounted on the client
  const [mounted, setMounted] = useState(false);

  // Suppress extension errors on mount
  useEffect(() => {
    setMounted(true);
    suppressExtensionErrors();
  }, []);

  // Create QueryClient with wallet persistence optimizations
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Extended cache times for wallet state
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          staleTime: 1000 * 60 * 10, // 10 minutes
          // Conservative retry strategy to prevent disconnections
          retry: (failureCount, error) => {
            // Don't retry wallet connection errors
            if (error?.message?.includes('connector') || error?.message?.includes('wallet')) {
              return false;
            }
            return failureCount < 2;
          },
          retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
          // Critical: Prevent automatic refetches that cause disconnections
          refetchOnWindowFocus: false,
          refetchOnReconnect: false, 
          refetchOnMount: false,
          // Disable network refetch to maintain connection stability
          networkMode: 'online',
        },
        mutations: {
          retry: 1,
          retryDelay: 2000,
        },
      },
    })
  );

  // During SSR/static generation, render children without providers
  // This prevents the "useContext" error during build
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}