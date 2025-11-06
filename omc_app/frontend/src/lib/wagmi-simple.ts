import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: 'd6c2fada7d8b7f5a4cefb2e8d4a1b7e9', // Simple fixed ID
  chains: [baseSepolia],
  ssr: false, // Disable SSR for simpler setup
});