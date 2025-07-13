import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: 'demo-project-id',
  chains: [baseSepolia],
  ssr: true,
});