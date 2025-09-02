// Contract addresses from your deployment
export const CONTRACTS = {
  OPINION_CORE: '0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc' as `0x${string}`,
  MOCK_USDC: '0xAb462fb7F8c952C63b62EF4371A60020e2abcA95' as `0x${string}`,
  PRICE_CALCULATOR: '0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113' as `0x${string}`,
} as const;

// Base Sepolia testnet configuration
export const BASE_SEPOLIA = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
} as const;

// OpinionCore ABI - Essential functions for the interface
export const OPINION_CORE_ABI = [
  // Read functions
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
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address', name: 'questionOwner', type: 'address' },
          { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
          { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'string', name: 'question', type: 'string' },
          { internalType: 'string', name: 'currentAnswer', type: 'string' },
          { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
          { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
          { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
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
    inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
    name: 'getNextPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
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
        internalType: 'struct OpinionStructs.AnswerHistory[]',
        name: '',
        type: 'tuple[]',
      },
    ],
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
  {
    inputs: [],
    name: 'MIN_INITIAL_PRICE',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_INITIAL_PRICE',
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint96', name: 'initialPrice', type: 'uint96' },
      { internalType: 'string[]', name: 'opinionCategories', type: 'string[]' },
    ],
    name: 'createOpinion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { internalType: 'string', name: 'answer', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
    ],
    name: 'submitAnswer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'opinionId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'actionType', type: 'uint8' },
      { indexed: false, internalType: 'string', name: 'content', type: 'string' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'price', type: 'uint256' },
    ],
    name: 'OpinionAction',
    type: 'event',
  },
] as const;

// MockERC20 ABI for USDC interactions
export const MOCK_USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
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
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;