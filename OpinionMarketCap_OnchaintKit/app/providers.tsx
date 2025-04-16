'use client';

import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { 
  RainbowKitProvider, 
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Define the chains array for wagmi
const chains = [baseSepolia] as const;

// Configure wallets for RainbowKit
const { wallets } = getDefaultWallets();

// Create connectors from wallets
const connectors = connectorsForWallets(wallets, {
  appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'OpinionMarketCap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
});

// Create wagmi config
const wagmiConfig = createConfig({
  chains,
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors,
});

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
        >
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={baseSepolia}
            config={{ 
              appearance: { 
                mode: 'auto' 
              }
            }}
          >
            {props.children}
          </OnchainKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}