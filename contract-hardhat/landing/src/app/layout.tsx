import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpinionMarketCap (OMC) | The Marketplace of Ideas',
  description: 'The first decentralized marketplace where opinions have real value.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}