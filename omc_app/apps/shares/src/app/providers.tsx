"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { config } from "@/lib/wagmi";
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>{children}</RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
