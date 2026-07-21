import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { fallback, http } from 'wagmi';

/**
 * RPC transport strategy — the app was silently using the chain default
 * (https://mainnet.base.org), which rate-limits hard and made stats/reads
 * fail intermittently. Now:
 *  1. NEXT_PUBLIC_BASE_RPC_URL first if set (dedicated Alchemy/QuickNode —
 *     get a free key and set it in .env.local / Vercel env for rock-solid reads)
 *  2. fallback chain of public endpoints, each with JSON-RPC batching
 * `fallback` auto-retries the next transport when one errors or times out.
 */
const BATCH = { batch: { wait: 16 } } as const;
const transports = [
  ...(process.env.NEXT_PUBLIC_BASE_RPC_URL
    ? [http(process.env.NEXT_PUBLIC_BASE_RPC_URL, BATCH)]
    : []),
  http('https://base-rpc.publicnode.com', BATCH),
  http('https://base.llamarpc.com', BATCH),
  http('https://mainnet.base.org', BATCH),
];

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: 'd6c2fada7d8b7f5a4cefb2e8d4a1b7e9',
  chains: [base],
  transports: { [base.id]: fallback(transports) },
  // SSR on so the provider tree can render server-side. wagmi hooks
  // return their disconnected/idle state during SSR; WalletBtn already
  // gates on RainbowKit's `mounted` flag, so the chrome is safe.
  ssr: true,
});
