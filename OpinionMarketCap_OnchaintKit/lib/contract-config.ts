// app/lib/contract-config.ts
import { Abi } from 'viem';

export const CONTRACT_ADDRESS = '0x42785b24fc527B031A8e83f845e37cB827416791';

export const CONTRACT_ABI: Abi = [
  {
    type: 'function',
    name: 'nextOpinionId',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'opinions',
    inputs: [{ type: 'uint256' }],
    outputs: [
      { type: 'uint256', name: 'id' },
      { type: 'string', name: 'question' },
      { type: 'address', name: 'creator' },
      { type: 'uint256', name: 'currentPrice' },
      { type: 'uint256', name: 'nextPrice' },
      { type: 'bool', name: 'isActive' },
      { type: 'string', name: 'currentAnswer' },
      { type: 'address', name: 'currentAnswerOwner' },
      { type: 'uint256', name: 'totalVolume' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getAnswerHistory',
    inputs: [{ type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { type: 'string', name: 'answer' },
          { type: 'address', name: 'owner' },
          { type: 'uint256', name: 'price' },
          { type: 'uint256', name: 'timestamp' }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'submitAnswer',
    inputs: [
      { type: 'uint256' },
      { type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'createOpinion',
    inputs: [
      { type: 'string' },
      { type: 'string' },
      { type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
];