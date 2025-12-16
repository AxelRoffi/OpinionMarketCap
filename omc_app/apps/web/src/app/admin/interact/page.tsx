'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';

export default function ContractInteractPage() {
  const { address, isConnected } = useAccount();
  const [selectedFunction, setSelectedFunction] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  
  // Read contract states
  const { data: nextOpinionId } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId'
  });

  const { data: isPublicEnabled } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'isPublicCreationEnabled'
  });

  const { data: minimumPrice } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'minimumPrice'
  });

  const { data: treasury } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'treasury'
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const readFunctions = [
    { name: 'nextOpinionId', value: nextOpinionId?.toString() },
    { name: 'isPublicCreationEnabled', value: isPublicEnabled?.toString() },
    { name: 'minimumPrice', value: minimumPrice ? formatUnits(minimumPrice as bigint, 6) + ' USDC' : '' },
    { name: 'treasury', value: treasury as string },
  ];

  const writeFunctions = [
    { 
      name: 'togglePublicCreation', 
      params: [],
      action: () => writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'togglePublicCreation'
      })
    },
    { 
      name: 'setParameter', 
      params: ['paramType (uint8)', 'value (uint256)'],
      action: () => writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'setParameter',
        args: [Number(inputValues.paramType), BigInt(inputValues.value)]
      })
    },
    {
      name: 'pause',
      params: [],
      action: () => writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'pause'
      })
    },
    {
      name: 'unpause',
      params: [],
      action: () => writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'unpause'
      })
    }
  ];

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Contract Interaction Interface</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please connect your wallet to interact with the contract.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">OpinionCore Contract Interface</h1>
      <p className="text-gray-600 mb-4">Contract: {CONTRACTS.OPINION_CORE}</p>
      <p className="text-gray-600 mb-8">Network: Base Mainnet</p>

      {/* Read Functions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">📖 Read Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readFunctions.map((func) => (
            <div key={func.name} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold text-lg">{func.name}()</h3>
              <p className="text-gray-600 mt-2">
                {func.value !== undefined ? (
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{func.value}</span>
                ) : (
                  <span className="text-gray-400">Loading...</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Write Functions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">✏️ Write Functions</h2>
        <div className="space-y-4">
          {writeFunctions.map((func) => (
            <div key={func.name} className="bg-white p-6 rounded-lg shadow border">
              <h3 className="font-semibold text-lg mb-3">{func.name}()</h3>
              
              {func.params.length > 0 && (
                <div className="space-y-2 mb-4">
                  {func.params.map((param) => (
                    <div key={param}>
                      <label className="block text-sm font-medium text-gray-700">{param}</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setInputValues({
                          ...inputValues,
                          [param.split(' ')[0]]: e.target.value
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={func.action}
                disabled={isPending || isConfirming}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Execute'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Status */}
      {hash && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold">Transaction Hash:</p>
          <a 
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-mono text-sm"
          >
            {hash}
          </a>
          {isSuccess && <p className="text-green-600 mt-2">✅ Transaction confirmed!</p>}
        </div>
      )}

      {/* Parameter Reference */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">📋 Parameter Types for setParameter()</h3>
        <div className="font-mono text-sm space-y-1">
          <p>0 = minimumPrice</p>
          <p>3 = absoluteMaxPriceChange</p>
          <p>4 = maxTradesPerBlock</p>
          <p>6 = questionCreationFee</p>
          <p>7 = initialAnswerPrice</p>
          <p>8 = maxQuestionLength</p>
          <p>9 = maxAnswerLength</p>
          <p>10 = maxLinkLength</p>
          <p>11 = maxIpfsHashLength</p>
          <p>12 = maxDescriptionLength</p>
          <p>13 = maxCategoriesPerOpinion</p>
          <p>14 = creationFeePercent</p>
        </div>
      </div>
    </div>
  );
}