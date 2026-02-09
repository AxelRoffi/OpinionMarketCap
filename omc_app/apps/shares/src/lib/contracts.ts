// Contract addresses
export const CONTRACTS = {
  // Base Mainnet
  mainnet: {
    ANSWER_SHARES_CORE: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Deploy to mainnet
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  },
  // Base Sepolia (Testnet)
  testnet: {
    ANSWER_SHARES_CORE: "0xb0461e420F65d711f84a7daA0E94893482435617" as `0x${string}`, // Deployed Feb 9, 2025
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Base Sepolia USDC
  },
} as const;

// Get contracts for current chain
export function getContracts(chainId: number) {
  if (chainId === 8453) {
    return CONTRACTS.mainnet;
  }
  return CONTRACTS.testnet;
}

// ============ USDC ABI ============
export const USDC_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ============ ANSWER SHARES CORE ABI ============
export const ANSWER_SHARES_CORE_ABI = [
  // === EVENTS ===
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "text", type: "string" },
      { indexed: false, name: "description", type: "string" },
      { indexed: false, name: "link", type: "string" },
      { indexed: false, name: "category", type: "string" },
    ],
    name: "QuestionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "proposer", type: "address" },
      { indexed: false, name: "text", type: "string" },
      { indexed: false, name: "initialShares", type: "uint256" },
    ],
    name: "AnswerProposed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "shares", type: "uint256" },
      { indexed: false, name: "cost", type: "uint256" },
      { indexed: false, name: "newPrice", type: "uint256" },
    ],
    name: "SharesBought",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "shares", type: "uint256" },
      { indexed: false, name: "returnAmount", type: "uint256" },
      { indexed: false, name: "newPrice", type: "uint256" },
    ],
    name: "SharesSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint96" },
    ],
    name: "FeesClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "recipient", type: "address" },
      { indexed: false, name: "amount", type: "uint96" },
      { indexed: false, name: "newTotal", type: "uint96" },
    ],
    name: "FeesAccumulated",
    type: "event",
  },

  // === READ FUNCTIONS ===
  // Config
  {
    inputs: [],
    name: "questionCreationFee",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "answerProposalStake",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeeBps",
    outputs: [{ name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creatorFeeBps",
    outputs: [{ name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextQuestionId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextAnswerId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalAccumulatedFees",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },

  // Questions
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getQuestion",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "text", type: "string" },
      { name: "description", type: "string" },
      { name: "link", type: "string" },
      { name: "category", type: "string" },
      { name: "creator", type: "address" },
      { name: "createdAt", type: "uint48" },
      { name: "isActive", type: "bool" },
      { name: "totalVolume", type: "uint256" },
      { name: "answerCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getAnswerCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getQuestionAnswers",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getLeadingAnswer",
    outputs: [
      { name: "leadingAnswerId", type: "uint256" },
      { name: "marketCap", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },

  // Answers
  {
    inputs: [{ name: "answerId", type: "uint256" }],
    name: "getAnswer",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "questionId", type: "uint256" },
      { name: "text", type: "string" },
      { name: "proposer", type: "address" },
      { name: "totalShares", type: "uint256" },
      { name: "poolValue", type: "uint256" },
      { name: "pricePerShare", type: "uint256" },
      { name: "createdAt", type: "uint48" },
      { name: "isActive", type: "bool" },
      { name: "isFlagged", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "answerId", type: "uint256" }],
    name: "getSharePrice",
    outputs: [{ name: "pricePerShare", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "answerId", type: "uint256" }],
    name: "getHolderCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // User data
  {
    inputs: [
      { name: "answerId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getUserPosition",
    outputs: [
      { name: "shares", type: "uint256" },
      { name: "currentValue", type: "uint256" },
      { name: "costBasis", type: "uint256" },
      { name: "profitLoss", type: "int256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getAccumulatedFees",
    outputs: [{ name: "amount", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "accumulatedFees",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },

  // === WRITE FUNCTIONS ===
  {
    inputs: [
      { name: "text", type: "string" },
      { name: "description", type: "string" },
      { name: "link", type: "string" },
      { name: "category", type: "string" },
    ],
    name: "createQuestion",
    outputs: [{ name: "questionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "questionId", type: "uint256" },
      { name: "answerText", type: "string" },
    ],
    name: "proposeAnswer",
    outputs: [{ name: "answerId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "answerId", type: "uint256" },
      { name: "usdcAmount", type: "uint256" },
      { name: "minSharesOut", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    name: "buyShares",
    outputs: [{ name: "sharesBought", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "answerId", type: "uint256" },
      { name: "shareAmount", type: "uint256" },
      { name: "minUsdcOut", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    name: "sellShares",
    outputs: [{ name: "usdcReturned", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimAccumulatedFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ============ TYPES ============
export interface Question {
  id: bigint;
  text: string;
  description: string;
  link: string;
  category: string;
  creator: `0x${string}`;
  createdAt: number;
  isActive: boolean;
  totalVolume: bigint;
  answerCount: bigint;
}

// Categories available for questions
export const CATEGORIES = [
  "Crypto",
  "DeFi",
  "NFTs",
  "Gaming",
  "AI",
  "Technology",
  "Politics",
  "Sports",
  "Entertainment",
  "Business",
  "Science",
  "Culture",
  "Memes",
  "Other",
] as const;

export type Category = typeof CATEGORIES[number];

export interface Answer {
  id: bigint;
  questionId: bigint;
  text: string;
  proposer: `0x${string}`;
  totalShares: bigint;
  poolValue: bigint;
  pricePerShare: bigint;
  createdAt: number;
  isActive: boolean;
  isFlagged: boolean;
}

export interface UserPosition {
  shares: bigint;
  currentValue: bigint;
  costBasis: bigint;
  profitLoss: bigint;
}

export interface LeadingAnswer {
  answerId: bigint;
  marketCap: bigint;
}
