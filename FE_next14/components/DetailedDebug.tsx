'use client';

import { useEffect, useState } from 'react';
import { useReadContract, useAccount, useChainId } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI, BASE_SEPOLIA } from '@/lib/contracts';

const DetailedDebug = () => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Test basic contract connection
  const { 
    data: nextOpinionId, 
    isLoading: loadingCount, 
    error: errorCount,
    isSuccess: successCount,
    status: statusCount
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
    query: {
      enabled: mounted, // Only run after hydration
    }
  });

  // Test reading opinion 1
  const { 
    data: opinion1, 
    isLoading: loading1, 
    error: error1,
    isSuccess: success1,
    status: status1
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [1n],
    query: {
      enabled: mounted && nextOpinionId && Number(nextOpinionId) > 1,
    }
  });

  useEffect(() => {
    console.log('=== Detailed Debug Info ===');
    console.log('Mounted:', mounted);
    console.log('Account connected:', isConnected);
    console.log('Account address:', address);
    console.log('Chain ID:', chainId);
    console.log('Expected Chain ID:', BASE_SEPOLIA.id);
    console.log('Contract Address:', CONTRACTS.OPINION_CORE);
    console.log('');
    console.log('NextOpinionId Query:');
    console.log('- Status:', statusCount);
    console.log('- Loading:', loadingCount);
    console.log('- Success:', successCount);
    console.log('- Data:', nextOpinionId?.toString());
    console.log('- Error:', errorCount);
    console.log('');
    console.log('Opinion1 Query:');
    console.log('- Status:', status1);
    console.log('- Loading:', loading1);
    console.log('- Success:', success1);
    console.log('- Data:', opinion1);
    console.log('- Error:', error1);
  }, [mounted, isConnected, address, chainId, statusCount, loadingCount, successCount, nextOpinionId, errorCount, status1, loading1, success1, opinion1, error1]);

  if (!mounted) {
    return <div className="card">Loading client...</div>;
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold">Detailed Debug Info</h2>
      
      {/* Environment Info */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Environment:</h3>
        <div className="text-sm space-y-1">
          <p>Mounted: {mounted.toString()}</p>
          <p>Wallet Connected: {isConnected.toString()}</p>
          <p>Address: {address || 'Not connected'}</p>
          <p>Chain ID: {chainId} (Expected: {BASE_SEPOLIA.id})</p>
          <p>Contract: {CONTRACTS.OPINION_CORE}</p>
        </div>
      </div>

      {/* Chain Status */}
      {chainId !== BASE_SEPOLIA.id && (
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-700 font-semibold">⚠️ Wrong Network</p>
          <p className="text-red-600 text-sm">Please switch to Base Sepolia (Chain ID: {BASE_SEPOLIA.id})</p>
        </div>
      )}

      {/* Next Opinion ID */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Next Opinion ID Query:</h3>
        <div className="text-sm space-y-1">
          <p>Status: <span className="font-mono">{statusCount}</span></p>
          <p>Loading: {loadingCount.toString()}</p>
          <p>Success: {successCount.toString()}</p>
          <p>Data: {nextOpinionId?.toString() || 'null'}</p>
          {errorCount && (
            <div className="text-red-600">
              <p>Error Message: {errorCount.message}</p>
              <p>Error Name: {errorCount.name}</p>
              {errorCount.cause && (
                <p>Cause: {JSON.stringify(errorCount.cause)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Opinion 1 Details */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Opinion 1 Query:</h3>
        <div className="text-sm space-y-1">
          <p>Status: <span className="font-mono">{status1}</span></p>
          <p>Loading: {loading1.toString()}</p>
          <p>Success: {success1.toString()}</p>
          <p>Enabled: {String(mounted && nextOpinionId && Number(nextOpinionId) > 1)}</p>
          {opinion1 && (
            <div className="text-green-600">
              <p>✅ Question: {opinion1.question || 'N/A'}</p>
              <p>✅ Answer: {opinion1.currentAnswer || 'N/A'}</p>
              <p>✅ Active: {opinion1.isActive?.toString() || 'N/A'}</p>
            </div>
          )}
          {error1 && (
            <div className="text-red-600">
              <p>Error Message: {error1.message}</p>
              <p>Error Name: {error1.name}</p>
              {error1.cause && (
                <p>Cause: {JSON.stringify(error1.cause)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedDebug;