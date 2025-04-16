'use client';

import localFont from "next/font/local";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "viem/chains"; // Import Base Sepolia chain
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// OnchainKit configuration
const onchainConfig = {
  wallets: {
    coinbase: true,
    metaMask: true,
    walletConnect: true
  },
  chains: [
    {
      name: 'Base Sepolia',
      id: baseSepolia.id, 
      rpcUrl: 'https://sepolia.base.org'
    }
  ],
  appName: 'OpinionMarketCap'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>QuestionMarketCap</title>
        <meta name="description" content="The Web3 Opinion DEX" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <OnchainProvider config={onchainConfig}>
          {children}
        </OnchainProvider>
      </body>
    </html>
  );
}