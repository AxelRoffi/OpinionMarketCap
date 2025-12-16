// Contract addresses from deployment - BASE MAINNET
export const CONTRACTS = {
  // 🚀 MAINNET CONTRACTS
  OPINION_CORE: '0xC47bFEc4D53C51bF590beCEA7dC935116E210E97' as `0x${string}`, // OpinionCoreNoMod
  FEE_MANAGER: '0x64997bd18520d93e7f0da87c69582d06b7f265d5' as `0x${string}`,
  POOL_MANAGER: '0xd6f4125e1976c5eee6fc684bdb68d1719ac34259' as `0x${string}`,
  USDC_TOKEN: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, // Official Base USDC
  // Legacy referral system (not deployed on mainnet)
  REFERRAL_MANAGER: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Not used on mainnet
  OPINION_CORE_WITH_REFERRALS: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Not used on mainnet
} as const;


// OpinionCore ABI with advanced functions
export const OPINION_CORE_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'actionType', type: 'uint8' },
      { indexed: false, internalType: 'string', name: 'content', type: 'string' },
      { indexed: true, internalType: 'address', name: 'actor', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'price', type: 'uint256' }
    ],
    name: 'OpinionAction',
    type: 'event'
  },
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
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'link', type: 'string' }
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
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getAnswerHistory',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'answer', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'uint96', name: 'price', type: 'uint96' },
          { internalType: 'uint32', name: 'timestamp', type: 'uint32' },
        ],
        internalType: 'struct AnswerStructs.AnswerHistory[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Referral system functions
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getReferralData',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'uint8', name: 'discountedOpinionsUsed', type: 'uint8' },
          { internalType: 'bool', name: 'hasReferralCode', type: 'bool' },
          { internalType: 'uint256', name: 'referralCode', type: 'uint256' },
          { internalType: 'uint256', name: 'pendingCashback', type: 'uint256' },
          { internalType: 'uint256', name: 'totalReferrals', type: 'uint256' }
        ],
        internalType: 'struct ReferralData',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'referralCode', type: 'uint256' }],
    name: 'getUserFromReferralCode',
    outputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getReferralEligibility',
    outputs: [
      { internalType: 'bool', name: 'isEligible', type: 'bool' },
      { internalType: 'uint8', name: 'remainingDiscounts', type: 'uint8' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint96', name: 'baseCreationFee', type: 'uint96' },
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'referralCode', type: 'uint256' }
    ],
    name: 'calculateReferralDiscount',
    outputs: [
      { internalType: 'uint96', name: 'finalFee', type: 'uint96' },
      { internalType: 'uint96', name: 'discount', type: 'uint96' },
      { internalType: 'bool', name: 'isValidReferral', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdrawCashback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint96', name: 'initialPrice', type: 'uint96' },
      { internalType: 'string[]', name: 'opinionCategories', type: 'string[]' },
      { internalType: 'uint256', name: 'referralCode', type: 'uint256' }
    ],
    name: 'createOpinionWithReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
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

// ReferralManager ABI for referral operations
export const REFERRAL_MANAGER_ABI = [
  {
    name: 'generateReferralCode',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'referralCode', type: 'uint256' }]
  },
  {
    name: 'getReferralStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalReferrals', type: 'uint256' },
      { name: 'availableFreeMints', type: 'uint256' },
      { name: 'totalFreeMints', type: 'uint256' },
      { name: 'referralCode', type: 'uint256' },
      { name: 'isReferred', type: 'bool' },
      { name: 'referredBy', type: 'address' }
    ]
  },
  {
    name: 'getAvailableFreeMints',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'available', type: 'uint256' }]
  },
  {
    name: 'getReferrerFromCode',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'referralCode', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }]
  },
  // New referral system functions
  {
    name: 'getReferralData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        components: [
          { name: 'referrer', type: 'address' },
          { name: 'discountedOpinionsUsed', type: 'uint8' },
          { name: 'hasReferralCode', type: 'bool' },
          { name: 'referralCode', type: 'uint256' },
          { name: 'pendingCashback', type: 'uint256' },
          { name: 'totalReferrals', type: 'uint256' }
        ],
        name: 'referralData',
        type: 'tuple'
      }
    ]
  },
  {
    name: 'getUserFromReferralCode',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'referralCode', type: 'uint256' }],
    outputs: [{ name: 'user', type: 'address' }]
  },
  {
    name: 'getReferralEligibility',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'isEligible', type: 'bool' },
      { name: 'remainingDiscounts', type: 'uint8' }
    ]
  },
  {
    name: 'calculateReferralDiscount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'baseCreationFee', type: 'uint96' },
      { name: 'user', type: 'address' },
      { name: 'referralCode', type: 'uint256' }
    ],
    outputs: [
      { name: 'finalFee', type: 'uint96' },
      { name: 'discount', type: 'uint96' },
      { name: 'isValidReferral', type: 'bool' }
    ]
  },
  {
    name: 'withdrawCashback',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'createOpinionWithReferral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'answer', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'initialPrice', type: 'uint96' },
      { name: 'opinionCategories', type: 'string[]' },
      { name: 'referralCode', type: 'uint256' }
    ],
    outputs: []
  },
  // Events
  {
    name: 'OpinionAction',
    type: 'event',
    inputs: [
      { name: 'opinionId', type: 'uint256', indexed: true },
      { name: 'actionType', type: 'uint8', indexed: false },
      { name: 'content', type: 'string', indexed: false },
      { name: 'actor', type: 'address', indexed: true },
      { name: 'price', type: 'uint256', indexed: false }
    ]
  }
] as const;