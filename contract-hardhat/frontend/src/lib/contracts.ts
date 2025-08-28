// Contract addresses from deployment
export const CONTRACTS = {
  OPINION_CORE: '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f' as `0x${string}`,
  FEE_MANAGER: '0xc8f879d86266C334eb9699963ca0703aa1189d8F' as `0x${string}`,
  POOL_MANAGER: '0x3B4584e690109484059D95d7904dD9fEbA246612' as `0x${string}`,
  USDC_TOKEN: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
} as const;


// OpinionCore ABI with advanced functions
export const OPINION_CORE_ABI = [
  {
    inputs: [],
    name: 'nextOpinionId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionDetails',
    outputs: [
      {
        components: [
          { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
          { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address', name: 'questionOwner', type: 'address' },
          { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'string', name: 'question', type: 'string' },
          { internalType: 'string', name: 'currentAnswer', type: 'string' },
          { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
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
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' }
    ],
    name: 'submitAnswer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint96', name: 'initialPrice', type: 'uint96' },
      { internalType: 'string[]', name: 'opinionCategories', type: 'string[]' }
    ],
    name: 'createOpinion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Question marketplace functions
  {
    inputs: [
      { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { internalType: 'uint256', name: 'price', type: 'uint256' }
    ],
    name: 'listQuestionForSale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'buyQuestion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'cancelQuestionSale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// USDC Contract ABI (for approvals)
export const USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// USDC contract address on Base Sepolia (Real USDC)
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;

// Treasury address
export const TREASURY_ADDRESS = '0xFb7eF00D5C2a87d282F273632e834f9105795067' as `0x${string}`;

// FeeManager ABI for fee-related operations
export const FEE_MANAGER_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getAccumulatedFees',
    outputs: [{ name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimAccumulatedFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// PoolManager ABI for pool completion operations
export const POOL_MANAGER_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'getPoolDetails',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
          { internalType: 'string', name: 'proposedAnswer', type: 'string' },
          { internalType: 'uint96', name: 'totalAmount', type: 'uint96' },
          { internalType: 'uint32', name: 'deadline', type: 'uint32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'uint96', name: 'targetPrice', type: 'uint96' },
        ],
        internalType: 'struct PoolStructs.PoolInfo',
        name: 'info',
        type: 'tuple',
      },
      { internalType: 'uint256', name: 'currentPrice', type: 'uint256' },
      { internalType: 'uint256', name: 'remainingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'timeRemaining', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'contributeToPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'completePool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;