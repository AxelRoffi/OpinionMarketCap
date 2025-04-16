import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from './components/Header';
// Add this import for the gaming font
import { Rajdhani } from 'next/font/google';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
  description: 'Generated by `create-onchain`, a Next.js template for OnchainKit',
};

// Initialize the gaming font
const gamingFont = Rajdhani({
  weight: ['500', '700'],
  subsets: ['latin'],
  variable: '--font-gaming',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-background dark ${gamingFont.variable}`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-gray-200 dark:border-gray-800 p-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} OpinionMarketCap
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}