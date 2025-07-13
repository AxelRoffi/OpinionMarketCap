'use client';

import { useReadContract, useAccount } from 'wagmi';
import { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

export default function SimplePage() {
  const { address, isConnected } = useAccount();

  console.log('🔍 Debug:', {
    address,
    isConnected,
    contractAddress: CONTRACTS.OPINION_CORE
  });

  // Get total opinions
  const { data: nextOpinionId, error: nextOpinionIdError, isLoading: nextOpinionIdLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  console.log('nextOpinionId result:', {
    data: nextOpinionId?.toString(),
    error: nextOpinionIdError?.message,
    loading: nextOpinionIdLoading
  });

  const totalOpinions = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  // Get opinion 1
  const { data: opinion1Data, error: opinion1Error, isLoading: opinion1Loading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'opinions',
    args: [1n],
    query: { enabled: totalOpinions >= 1 }
  });

  console.log('opinion1 result:', {
    data: opinion1Data,
    error: opinion1Error?.message,
    loading: opinion1Loading,
    enabled: totalOpinions >= 1
  });

  // Get opinion 2
  const { data: opinion2Data, error: opinion2Error, isLoading: opinion2Loading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'opinions',
    args: [2n],
    query: { enabled: totalOpinions >= 2 }
  });

  // Get opinion 3
  const { data: opinion3Data, error: opinion3Error, isLoading: opinion3Loading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'opinions',
    args: [3n],
    query: { enabled: totalOpinions >= 3 }
  });

  // Process opinions exactly like the main page
  const allOpinions = useMemo(() => {
    const opinions = [
      { data: opinion1Data, error: opinion1Error, loading: opinion1Loading },
      { data: opinion2Data, error: opinion2Error, loading: opinion2Loading },
      { data: opinion3Data, error: opinion3Error, loading: opinion3Loading }
    ];
    
    console.log('Processing opinions:', opinions.map((op, i) => ({
      index: i + 1,
      hasData: !!op.data,
      error: op.error?.message,
      loading: op.loading
    })));
    
    return opinions
      .map((query, index) => {
        if (!query.data || index + 1 > totalOpinions) return null;
        return {
          id: index + 1,
          question: query.data.question,
          currentAnswer: query.data.currentAnswer,
          nextPrice: query.data.nextPrice,
          lastPrice: query.data.lastPrice,
          totalVolume: BigInt(0),
          currentAnswerOwner: query.data.currentOwner,
          isActive: query.data.isActive,
          creator: query.data.creator,
          categories: [],
        };
      })
      .filter((opinion) => opinion !== null && opinion.isActive);
  }, [opinion1Data, opinion2Data, opinion3Data, totalOpinions, opinion1Error, opinion2Error, opinion3Error]);

  console.log('Final processed opinions:', allOpinions);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Simple Debug Page</h1>
          <ConnectButton />
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Connection Status</h2>
            <p>Address: {address || 'Not connected'}</p>
            <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
            <p>Contract: {CONTRACTS.OPINION_CORE}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Contract Data</h2>
            <div className="space-y-2">
              <p>Next Opinion ID: {nextOpinionId?.toString() || 'Loading...'}</p>
              <p>Total Opinions: {totalOpinions}</p>
              <p>nextOpinionId Loading: {nextOpinionIdLoading ? 'Yes' : 'No'}</p>
              <p>nextOpinionId Error: {nextOpinionIdError?.message || 'None'}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Individual Opinions</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="font-semibold">Opinion 1</h3>
                <p>Loading: {opinion1Loading ? 'Yes' : 'No'}</p>
                <p>Error: {opinion1Error?.message || 'None'}</p>
                <p>Enabled: {totalOpinions >= 1 ? 'Yes' : 'No'}</p>
                {opinion1Data && (
                  <div className="mt-2 space-y-1">
                    <p>Question: {opinion1Data.question}</p>
                    <p>Answer: {opinion1Data.currentAnswer}</p>
                    <p>Active: {opinion1Data.isActive ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              <div className="border border-gray-700 p-4 rounded">
                <h3 className="font-semibold">Opinion 2</h3>
                <p>Loading: {opinion2Loading ? 'Yes' : 'No'}</p>
                <p>Error: {opinion2Error?.message || 'None'}</p>
                <p>Enabled: {totalOpinions >= 2 ? 'Yes' : 'No'}</p>
                {opinion2Data && (
                  <div className="mt-2 space-y-1">
                    <p>Question: {opinion2Data.question}</p>
                    <p>Answer: {opinion2Data.currentAnswer}</p>
                    <p>Active: {opinion2Data.isActive ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              <div className="border border-gray-700 p-4 rounded">
                <h3 className="font-semibold">Opinion 3</h3>
                <p>Loading: {opinion3Loading ? 'Yes' : 'No'}</p>
                <p>Error: {opinion3Error?.message || 'None'}</p>
                <p>Enabled: {totalOpinions >= 3 ? 'Yes' : 'No'}</p>
                {opinion3Data && (
                  <div className="mt-2 space-y-1">
                    <p>Question: {opinion3Data.question}</p>
                    <p>Answer: {opinion3Data.currentAnswer}</p>
                    <p>Active: {opinion3Data.isActive ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Final Results</h2>
            <p className="text-2xl font-bold">Processed Opinions: {allOpinions.length}</p>
            
            {allOpinions.length > 0 && (
              <div className="mt-4 space-y-4">
                {allOpinions.map((opinion) => (
                  <div key={opinion.id} className="border border-green-500 p-4 rounded bg-green-900/20">
                    <h3 className="font-semibold">Opinion {opinion.id}</h3>
                    <p>Question: {opinion.question}</p>
                    <p>Answer: {opinion.currentAnswer}</p>
                    <p>Active: {opinion.isActive ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            )}

            {allOpinions.length === 0 && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded">
                <p className="text-red-300">No opinions processed successfully!</p>
                <p className="text-sm mt-2">Check the individual opinion data above to see what went wrong.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}