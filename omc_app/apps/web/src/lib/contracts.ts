// Contract addresses from deployment - BASE MAINNET
// Deployed: 2025-01-07
export const CONTRACTS = {
  // 🚀 MAINNET CONTRACTS (Modular Architecture)
  OPINION_CORE: '0x7b5d97fb78fbf41432F34f46a901C6da7754A726' as `0x${string}`,
  FEE_MANAGER: '0x31D604765CD76Ff098A283881B2ca57e7F703199' as `0x${string}`,
  POOL_MANAGER: '0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e' as `0x${string}`,
  OPINION_ADMIN: '0x4F0A1938E8707292059595275F9BBD067A301FD2' as `0x${string}`,
  OPINION_EXTENSIONS: '0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA' as `0x${string}`,
  VALIDATION_LIBRARY: '0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5' as `0x${string}`,
  USDC_TOKEN: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, // Official Base USDC
  // Legacy (not used)
  REFERRAL_MANAGER: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  OPINION_CORE_WITH_REFERRALS: '0x0000000000000000000000000000000000000000' as `0x${string}`,
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
  // Admin state variables
  {
    inputs: [],
    name: 'isPublicCreationEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minimumPrice',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'treasury',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'togglePublicCreation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'paramType', type: 'uint8' },
      { internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'setParameter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getTradeCount',
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

// USDC contract address on Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

// Treasury address (Base Mainnet)
export const TREASURY_ADDRESS = '0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9' as `0x${string}`;

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

// OpinionExtensions ABI for category fetching
export const OPINION_EXTENSIONS_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionCategories',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAvailableCategories',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;