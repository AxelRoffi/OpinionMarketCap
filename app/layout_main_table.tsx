'use client';

import localFont from "next/font/local";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Head from 'next/head';
import "./globals.css";
import NavigationBar from './components/NavigationBar';

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
        <ThirdwebProvider activeChain="base">
          <NavigationBar />
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}