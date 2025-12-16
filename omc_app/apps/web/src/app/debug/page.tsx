'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import DebugContract from '@/components/DebugContract';
import DebugTest from '../debug-test';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Contract Debug</h1>
          <ConnectButton />
        </div>
        
        <DebugTest />
        <DebugContract />
      </div>
    </div>
  );
}