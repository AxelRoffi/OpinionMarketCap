'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

const DebugOpinions = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Test basic contract connection
  const { data: nextOpinionId, isLoading: loadingCount, error: errorCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
    query: {
      enabled: mounted,
      retry: 3,
      retryDelay: 1000,
    }
  });

  // Test reading opinion 1
  const { data: opinion1, isLoading: loading1, error: error1 } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [1n],
    query: {
      enabled: mounted && nextOpinionId && Number(nextOpinionId) > 1,
      retry: 3,
      retryDelay: 1000,
    }
  });

  // Test reading opinion 2
  const { data: opinion2, isLoading: loading2, error: error2 } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [2n],
    query: {
      enabled: mounted && nextOpinionId && Number(nextOpinionId) > 2,
      retry: 3,
      retryDelay: 1000,
    }
  });

  if (!mounted) {
    return <div className="card">Initializing...</div>;
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-bold">Debug Contract Connection</h2>
      
      {/* Contract Address */}
      <div>
        <h3 className="font-semibold mb-2">Contract Info:</h3>
        <p className="text-sm text-gray-600">Address: {CONTRACTS.OPINION_CORE}</p>
        <p className="text-sm text-gray-600">Chain: Base Sepolia (84532)</p>
      </div>

      {/* Next Opinion ID */}
      <div>
        <h3 className="font-semibold mb-2">Next Opinion ID:</h3>
        {loadingCount ? (
          <p className="text-blue-600">Loading...</p>
        ) : errorCount ? (
          <p className="text-red-600">Error: {errorCount.message}</p>
        ) : (
          <p className="text-green-600">Success: {nextOpinionId?.toString()} (Total opinions: {nextOpinionId ? Number(nextOpinionId) - 1 : 0})</p>
        )}
      </div>

      {/* Opinion 1 */}
      <div>
        <h3 className="font-semibold mb-2">Opinion #1:</h3>
        {loading1 ? (
          <p className="text-blue-600">Loading...</p>
        ) : error1 ? (
          <div className="text-red-600">
            <p>Error: {error1.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="text-xs mt-2 bg-red-50 p-2 rounded">{JSON.stringify(error1, null, 2)}</pre>
            </details>
          </div>
        ) : opinion1 ? (
          <div className="text-green-600 space-y-1">
            <p>✅ Question: {opinion1.question}</p>
            <p>✅ Answer: {opinion1.currentAnswer}</p>
            <p>✅ Active: {opinion1.isActive.toString()}</p>
            <p>✅ Creator: {opinion1.creator}</p>
          </div>
        ) : (
          <p className="text-gray-600">No data</p>
        )}
      </div>

      {/* Opinion 2 */}
      <div>
        <h3 className="font-semibold mb-2">Opinion #2:</h3>
        {loading2 ? (
          <p className="text-blue-600">Loading...</p>
        ) : error2 ? (
          <div className="text-red-600">
            <p>Error: {error2.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="text-xs mt-2 bg-red-50 p-2 rounded">{JSON.stringify(error2, null, 2)}</pre>
            </details>
          </div>
        ) : opinion2 ? (
          <div className="text-green-600 space-y-1">
            <p>✅ Question: {opinion2.question}</p>
            <p>✅ Answer: {opinion2.currentAnswer}</p>
            <p>✅ Active: {opinion2.isActive.toString()}</p>
            <p>✅ Creator: {opinion2.creator}</p>
          </div>
        ) : (
          <p className="text-gray-600">No data</p>
        )}
      </div>
    </div>
  );
};

export default DebugOpinions;