// components/Header.tsx
'use client';

import { CustomConnectButton } from './ConnectButton';
import Link from 'next/link';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold">
          OpinionMarketCap
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex space-x-4 mr-4">
          <Link href="/" className="hover:text-blue-500">Home</Link>
          <Link href="/opinions" className="hover:text-blue-500">Opinions</Link>
          <Link href="/create" className="hover:text-blue-500">Create</Link>
        </nav>
        <CustomConnectButton />
      </div>
    </header>
  );
}