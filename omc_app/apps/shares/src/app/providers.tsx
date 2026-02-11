"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { config } from "@/lib/wagmi";
import { WalletPersistence } from "@/components/WalletPersistence";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect } from "react";

function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const theme = isDark
    ? darkTheme({
        accentColor: "#10b981",
        accentColorForeground: "white",
        borderRadius: "medium",
      })
    : lightTheme({
        accentColor: "#10b981",
        accentColorForeground: "white",
        borderRadius: "medium",
      });

  return <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with wallet persistence optimizations
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Extended cache times for wallet state
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 10, // 10 minutes
            // Conservative retry strategy to prevent disconnections
            retry: (failureCount, error) => {
              // Don't retry wallet connection errors
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage.includes('connector') || errorMessage.includes('wallet')) {
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

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>
          <WalletPersistence />
          {children}
        </RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
