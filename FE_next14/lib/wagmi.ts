import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { BASE_SEPOLIA } from './contracts';

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-wallet-connect-project-id',
  chains: [BASE_SEPOLIA],
  transports: {
    [BASE_SEPOLIA.id]: http('https://sepolia.base.org', {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: true,
});

export const chains = [BASE_SEPOLIA];