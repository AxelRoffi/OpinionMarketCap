'use client';

import { useReadContract, useAccount, useChainId } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

export default function DebugInline() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Test nextOpinionId
  const { data: nextOpinionId, error: nextError, isLoading: nextLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  // Test opinion 1
  const { data: opinion1, error: op1Error, isLoading: op1Loading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'opinions',
    args: [1n],
  });

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">DEBUG PAGE</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Connection Info</h2>
          <p>Connected: {isConnected ? 'YES' : 'NO'}</p>
          <p>Address: {address || 'None'}</p>
          <p>Chain ID: {chainId} (should be 84532)</p>
          <p>Contract: {CONTRACTS.OPINION_CORE}</p>
          <p>Network Match: {chainId === 84532 ? 'YES' : 'NO - WRONG NETWORK!'}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">nextOpinionId() Test</h2>
          <p>Loading: {nextLoading ? 'YES' : 'NO'}</p>
          <p>Data: {nextOpinionId?.toString() || 'None'}</p>
          <p>Error: {nextError?.message || 'None'}</p>
          <p>Expected: Should be 6</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">opinions(1) Test</h2>
          <p>Loading: {op1Loading ? 'YES' : 'NO'}</p>
          <p>Error: {op1Error?.message || 'None'}</p>
          {opinion1 && (
            <div className="mt-2">
              <p>Question: {opinion1.question}</p>
              <p>Answer: {opinion1.currentAnswer}</p>
              <p>Active: {opinion1.isActive ? 'YES' : 'NO'}</p>
            </div>
          )}
          <p>Expected: Should show Bitcoin question</p>
        </div>

        <div className="bg-red-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Troubleshooting</h2>
          <p>1. Check chain ID is 84532 (Base Sepolia)</p>
          <p>2. Open browser console (F12) for errors</p>
          <p>3. Try disconnecting and reconnecting wallet</p>
          <p>4. Clear browser cache and refresh</p>
        </div>
      </div>
    </div>
  );
}