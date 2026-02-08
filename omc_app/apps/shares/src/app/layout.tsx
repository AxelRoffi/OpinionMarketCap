import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

// Force dynamic rendering to avoid SSR issues with wallet providers
export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "AnswerShares | Trade Opinions Like Stocks",
    template: "%s | AnswerShares",
  },
  description: "Buy and sell shares in answers you believe in. The best answers rise to the top through market dynamics. Built on Base blockchain.",
  keywords: ["prediction market", "opinion trading", "crypto", "base", "blockchain", "defi"],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AnswerShares',
    title: 'AnswerShares | Trade Opinions Like Stocks',
    description: 'Buy and sell shares in answers you believe in. The best answers rise to the top.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnswerShares | Trade Opinions Like Stocks',
    description: 'Buy and sell shares in answers you believe in. The best answers rise to the top.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
