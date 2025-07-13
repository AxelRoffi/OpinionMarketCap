'use client';

import { useReadContract, useAccount, useChainId } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

export default function DebugContract() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  console.log('🔍 Debug Info:', {
    address,
    isConnected,
    chainId,
    expectedChainId: 84532,
    contractAddress: CONTRACTS.OPINION_CORE
  });

  // Test nextOpinionId
  const { 
    data: nextOpinionId, 
    error: nextOpinionIdError, 
    isLoading: nextOpinionIdLoading 
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  console.log('🧪 nextOpinionId result:', {
    data: nextOpinionId?.toString(),
    error: nextOpinionIdError?.message,
    loading: nextOpinionIdLoading
  });

  const totalOpinions = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  // Test opinion 1
  const { 
    data: opinion1Data, 
    error: opinion1Error, 
    isLoading: opinion1Loading 
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [1n],
  });

  console.log('🧪 opinion1 result:', {
    data: opinion1Data,
    error: opinion1Error?.message,
    loading: opinion1Loading,
    enabled: totalOpinions >= 1
  });

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">🔍 Contract Debug Info</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Connection Status:</h3>
          <p>Address: {address || 'Not connected'}</p>
          <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p>Chain ID: {chainId} {chainId === 84532 ? '✅' : '❌ Wrong network!'}</p>
          <p>Contract: {CONTRACTS.OPINION_CORE}</p>
        </div>

        <div>
          <h3 className="font-semibold">nextOpinionId():</h3>
          <p>Loading: {nextOpinionIdLoading ? 'Yes' : 'No'}</p>
          <p>Data: {nextOpinionId?.toString() || 'None'}</p>
          <p>Total Opinions: {totalOpinions}</p>
          <p>Error: {nextOpinionIdError?.message || 'None'}</p>
        </div>

        <div>
          <h3 className="font-semibold">getOpinionDetails(1):</h3>
          <p>Loading: {opinion1Loading ? 'Yes' : 'No'}</p>
          <p>Enabled: Always</p>
          <p>Error: {opinion1Error?.message || 'None'}</p>
          {opinion1Data && (
            <div className="ml-4">
              <p>Question: {opinion1Data.question}</p>
              <p>Answer: {opinion1Data.currentAnswer}</p>
              <p>Active: {opinion1Data.isActive ? 'Yes' : 'No'}</p>
              <p>Creator: {opinion1Data.creator}</p>
              <p>Categories: {JSON.stringify(opinion1Data.categories)}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-red-900 rounded">
          <h3 className="font-semibold">🚨 If no data shows:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check wallet is connected to Base Sepolia (Chain ID 84532)</li>
            <li>Check browser console for errors</li>
            <li>Try disconnecting and reconnecting wallet</li>
            <li>Hard refresh browser (Ctrl+Shift+R)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}