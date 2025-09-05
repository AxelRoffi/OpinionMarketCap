'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;
const TREASURY_ADDRESS = '0xFb7eF00D5C2a87d282F273632e834f9105795067' as `0x${string}`;

const USDC_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

export function TreasuryBalanceChecker() {
  const [isVisible, setIsVisible] = useState(false);

  const { data: balance, refetch, isLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [TREASURY_ADDRESS],
  });

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return (Number(balance) / 1000000).toFixed(6);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          Check Treasury
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-sm">Treasury Balance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Current Balance:</span>
          <span className="text-white font-mono text-sm">
            {isLoading ? '...' : `${formatBalance(balance)} USDC`}
          </span>
        </div>
        
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1 rounded text-sm"
        >
          {isLoading ? 'Checking...' : 'Refresh Balance'}
        </button>
        
        <div className="text-xs text-white/60 mt-2">
          <p>💡 Tip: Check this after pool contributions</p>
          <p>Even if explorer shows "Failed", balance should increase by 1 USDC</p>
        </div>
      </div>
    </div>
  );
}