// Share decimals constant (matches contract SHARES_DECIMALS = 100)
// 1 share = 100 internal units, so 5.00 shares = 500 in contract
export const SHARES_DECIMALS = 100;

// Contract addresses
export const CONTRACTS = {
  // Base Mainnet
  mainnet: {
    ANSWER_SHARES_CORE: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Deploy to mainnet
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  },
  // Base Sepolia (Testnet)
  testnet: {
    ANSWER_SHARES_CORE: "0x9be74C78AD107bbBf3580128d90ebb2aac022BfC" as `0x${string}`, // V3 deploy Feb 19, 2025 (exponential + king fees)
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

// ============ ANSWER SHARES CORE V3 ABI ============
export const ANSWER_SHARES_CORE_ABI = [
  // === EVENTS ===
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "text", type: "string" },
      { indexed: false, name: "category", type: "string" },
    ],
    name: "QuestionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "questionText", type: "string" },
      { indexed: false, name: "answerText", type: "string" },
      { indexed: false, name: "answerDescription", type: "string" },
      { indexed: false, name: "answerLink", type: "string" },
      { indexed: false, name: "initialShares", type: "uint256" },
    ],
    name: "QuestionCreatedWithAnswer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "proposer", type: "address" },
      { indexed: false, name: "text", type: "string" },
      { indexed: false, name: "description", type: "string" },
      { indexed: false, name: "link", type: "string" },
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
      { indexed: false, name: "newPoolValue", type: "uint256" },
      { indexed: false, name: "newTotalShares", type: "uint256" },
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
  // V3 Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: false, name: "marketCap", type: "uint256" },
    ],
    name: "AnswerGraduated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "newLeaderId", type: "uint256" },
      { indexed: true, name: "oldLeaderId", type: "uint256" },
      { indexed: false, name: "newLeaderMarketCap", type: "uint256" },
    ],
    name: "LeaderChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint96" },
    ],
    name: "KingFeesDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "answerId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint96" },
    ],
    name: "KingFeesClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "questionId", type: "uint256" },
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
    ],
    name: "QuestionOwnershipTransferred",
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
    name: "kingFeeBps",
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
  // V3 Config
  {
    inputs: [],
    name: "bootstrapThreshold",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxMultiplier",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseAnswerLimit",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxAnswerLimit",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "volumePerSlot",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kingFlipThresholdBps",
    outputs: [{ name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "graduationThreshold",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },

  // Questions
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getQuestion",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "text", type: "string" },
      { name: "category", type: "string" },
      { name: "creator", type: "address" },
      { name: "owner", type: "address" },
      { name: "createdAt", type: "uint48" },
      { name: "isActive", type: "bool" },
      { name: "totalVolume", type: "uint256" },
      { name: "answerCount", type: "uint256" },
      { name: "salePrice", type: "uint96" },
      { name: "leadingAnswerId", type: "uint256" },
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
  {
    inputs: [{ name: "questionId", type: "uint256" }],
    name: "getMaxAnswersForQuestion",
    outputs: [{ name: "", type: "uint8" }],
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
      { name: "description", type: "string" },
      { name: "link", type: "string" },
      { name: "proposer", type: "address" },
      { name: "totalShares", type: "uint256" },
      { name: "poolValue", type: "uint256" },
      { name: "pricePerShare", type: "uint256" },
      { name: "createdAt", type: "uint48" },
      { name: "isActive", type: "bool" },
      { name: "isFlagged", type: "bool" },
      { name: "hasGraduated", type: "bool" },
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
      { name: "pendingKingFees", type: "uint96" },
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
  // V3: King fees
  {
    inputs: [
      { name: "answerId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getPendingKingFees",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },

  // === WRITE FUNCTIONS ===
  {
    inputs: [
      { name: "text", type: "string" },
      { name: "category", type: "string" },
    ],
    name: "createQuestion",
    outputs: [{ name: "questionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "questionText", type: "string" },
      { name: "category", type: "string" },
      { name: "answerText", type: "string" },
      { name: "answerDescription", type: "string" },
      { name: "answerLink", type: "string" },
    ],
    name: "createQuestionWithAnswer",
    outputs: [
      { name: "questionId", type: "uint256" },
      { name: "answerId", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "questionId", type: "uint256" },
      { name: "answerText", type: "string" },
      { name: "description", type: "string" },
      { name: "link", type: "string" },
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
  // V3: King fee claiming
  {
    inputs: [{ name: "answerId", type: "uint256" }],
    name: "claimKingFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Question ownership
  {
    inputs: [
      { name: "questionId", type: "uint256" },
      { name: "newOwner", type: "address" },
    ],
    name: "transferQuestionOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ============ TYPES ============
export interface Question {
  id: bigint;
  text: string;
  category: string;
  creator: `0x${string}`;
  owner: `0x${string}`;
  createdAt: number;
  isActive: boolean;
  totalVolume: bigint;
  answerCount: bigint;
  salePrice: bigint;
  leadingAnswerId: bigint;
}

// All categories (matching Hot Potato + crypto-specific)
export const ALL_CATEGORIES = [
  // Crypto/Web3 specific
  "Crypto", "DeFi", "NFTs", "Gaming", "Memes",
  // General topics (from Hot Potato)
  "AI", "Automotive", "Books & Literature", "Business", "Celebrities",
  "Conspiracy", "Dating & Relationships", "Entertainment", "Investing",
  "Luxury", "Mobile Apps", "Movies & TV", "Music", "Parenting",
  "Podcasts", "Politics", "Real Estate", "Social Media", "Sports",
  "Other", "Adult"
] as const;

// Categories to hide (deprecated/redundant)
export const HIDDEN_CATEGORIES = ["Books & Literature", "Parenting", "Podcasts"] as const;

// Visible categories (sorted, Adult at end)
export const CATEGORIES = (() => {
  const active = ALL_CATEGORIES.filter(cat => !HIDDEN_CATEGORIES.includes(cat as any));
  const nonAdult = active.filter(cat => cat !== "Adult").sort();
  const adult = active.filter(cat => cat === "Adult");
  return [...nonAdult, ...adult] as readonly string[];
})();

export type Category = typeof CATEGORIES[number];

export interface Answer {
  id: bigint;
  questionId: bigint;
  text: string;
  description: string;
  link: string;
  proposer: `0x${string}`;
  totalShares: bigint;
  poolValue: bigint;
  pricePerShare: bigint;
  createdAt: number;
  isActive: boolean;
  isFlagged: boolean;
  hasGraduated: boolean;
}

export interface UserPosition {
  shares: bigint;
  currentValue: bigint;
  costBasis: bigint;
  profitLoss: bigint;
  pendingKingFees: bigint;
}

export interface LeadingAnswer {
  answerId: bigint;
  marketCap: bigint;
}
