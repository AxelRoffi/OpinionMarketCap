import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: 'd6c2fada7d8b7f5a4cefb2e8d4a1b7e9',
  chains: [base],
  // SSR on so the provider tree can render server-side. wagmi hooks
  // return their disconnected/idle state during SSR; WalletBtn already
  // gates on RainbowKit's `mounted` flag, so the chrome is safe.
  ssr: true,
});