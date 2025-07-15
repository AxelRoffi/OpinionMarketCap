'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

// Test different function signatures
export default function DebugTest() {
  // Test nextOpinionId
  const { data: nextOpinionId, error: nextOpinionError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: [
      {
        inputs: [],
        name: 'nextOpinionId',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }
    ],
    functionName: 'nextOpinionId',
  });

  // Test getOpinionDetails function
  const { data: opinionData, error: opinionError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: [
      {
        inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
        name: 'getOpinionDetails',
        outputs: [
          {
            components: [
              { internalType: 'address', name: 'creator', type: 'address' },
              { internalType: 'address', name: 'questionOwner', type: 'address' },
              { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
              { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
              { internalType: 'bool', name: 'isActive', type: 'bool' },
              { internalType: 'string', name: 'question', type: 'string' },
              { internalType: 'string', name: 'currentAnswer', type: 'string' },
              { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
              { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
              { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
              { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
              { internalType: 'string', name: 'ipfsHash', type: 'string' },
              { internalType: 'string', name: 'link', type: 'string' },
              { internalType: 'string[]', name: 'categories', type: 'string[]' },
            ],
            internalType: 'struct OpinionStructs.Opinion',
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }
    ],
    functionName: 'getOpinionDetails',
    args: [BigInt(1)],
  });

  // Test another getOpinionDetails call
  const { data: directOpinion, error: directError } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: [
      {
        inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
        name: 'getOpinionDetails',
        outputs: [
          {
            components: [
              { internalType: 'address', name: 'creator', type: 'address' },
              { internalType: 'address', name: 'questionOwner', type: 'address' },
              { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
              { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
              { internalType: 'bool', name: 'isActive', type: 'bool' },
              { internalType: 'string', name: 'question', type: 'string' },
              { internalType: 'string', name: 'currentAnswer', type: 'string' },
              { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
              { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
              { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
              { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
              { internalType: 'string', name: 'ipfsHash', type: 'string' },
              { internalType: 'string', name: 'link', type: 'string' },
              { internalType: 'string[]', name: 'categories', type: 'string[]' },
            ],
            internalType: 'struct OpinionStructs.Opinion',
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      }
    ],
    functionName: 'getOpinionDetails',
    args: [BigInt(1)],
  });

  return (
    <div className="p-8">
      <h1>Contract Debug Test</h1>
      <div className="space-y-4">
        <div>
          <h2>Contract Address: {CONTRACTS.OPINION_CORE}</h2>
        </div>
        
        <div>
          <h3>nextOpinionId:</h3>
          <p>Data: {nextOpinionId?.toString()}</p>
          <p>Error: {nextOpinionError?.message}</p>
          <p>Total Opinions: {nextOpinionId ? Number(nextOpinionId) - 1 : 0}</p>
        </div>

        <div>
          <h3>getOpinionDetails(1):</h3>
          <p>Data: {opinionData ? JSON.stringify(opinionData, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2) : 'None'}</p>
          <p>Error: {opinionError?.message}</p>
        </div>

        <div>
          <h3>getOpinionDetails(1) - Second Call:</h3>
          <p>Data: {directOpinion ? JSON.stringify(directOpinion, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2) : 'None'}</p>
          <p>Error: {directError?.message}</p>
          
          {/* Show key fields */}
          {directOpinion && (
            <div className="mt-2 space-y-1 text-sm">
              <p>✅ Question: {directOpinion.question}</p>
              <p>✅ Answer: {directOpinion.currentAnswer}</p>
              <p>✅ Creator: {directOpinion.creator}</p>
              <p>✅ Active: {directOpinion.isActive?.toString()}</p>
              <p>✅ LastPrice: {directOpinion.lastPrice?.toString()}</p>
              <p>✅ NextPrice: {directOpinion.nextPrice?.toString()}</p>
              <p>✅ Categories: {JSON.stringify(directOpinion.categories)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}