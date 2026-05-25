'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi-simple';
import { suppressExtensionErrors } from '@/lib/suppress-extension-errors';
import '@rainbow-me/rainbowkit/styles.css';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    suppressExtensionErrors();
  }, []);

  // QueryClient is created once per browser session. wagmi's `ssr: true`
  // config + the RainbowKit `mounted` render-prop on WalletBtn handle the
  // server-vs-client state difference — no global mounted gate needed.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24h cache for wallet state
            staleTime: 1000 * 60 * 10,   // 10min fresh
            retry: (failureCount, error) => {
              if (
                error?.message?.includes('connector') ||
                error?.message?.includes('wallet')
              ) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            networkMode: 'online',
          },
          mutations: {
            retry: 1,
            retryDelay: 2000,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
