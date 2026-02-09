import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "OpinionMarketCap Shares",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  // Base Sepolia first for testnet development
  chains: [baseSepolia, base],
  ssr: true,
});
