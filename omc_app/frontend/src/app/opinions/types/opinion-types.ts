// TypeScript interfaces for opinion detail page
export interface OpinionDetail {
  id: number;
  creator: string;
  questionOwner: string;
  currentAnswerOwner: string;
  currentAnswer: string;
  currentAnswerDescription: string;
  lastPrice: bigint;
  nextPrice: bigint;
  salePrice: bigint;
  isActive: boolean;
  totalVolume: bigint;
  question: string;
  categories: string[];
  createdAt: number;
}

export interface AnswerHistory {
  answer: string;
  description: string;
  owner: string;
  price: bigint;
  timestamp: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface OpinionStats {
  totalTrades: number;
  uniqueHolders: number;
  priceRange: {
    min: number;
    max: number;
  };
  volumeHistory: PricePoint[];
}

export interface MarketChange {
  percentage: number;
  isPositive: boolean;
  absolute: number;
}

export interface TradingActivity {
  id: string;
  type: 'answer_change' | 'question_trade';
  user: string;
  answer: string;
  price: bigint;
  timestamp: number;
  transactionHash?: string;
}