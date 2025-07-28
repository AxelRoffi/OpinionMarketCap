import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
  chains: [baseSepolia],
  ssr: true,
});