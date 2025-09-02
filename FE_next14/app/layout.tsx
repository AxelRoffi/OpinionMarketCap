import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OpinionMarketCap - Trade Opinion Ownership',
  description: 'The future of prediction markets. Trade opinion ownership with real economic value.',
  keywords: 'prediction markets, opinion trading, blockchain, DeFi, Base',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}