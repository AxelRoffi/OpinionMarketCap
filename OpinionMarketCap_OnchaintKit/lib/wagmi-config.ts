import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({ 
      appName: 'OpinionMarketCap',
      preference: 'smartWalletOnly'
    }),
    metaMask(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' 
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});