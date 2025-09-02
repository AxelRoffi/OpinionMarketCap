export interface Opinion {
  id: number;
  creator: string;
  questionOwner: string;
  lastPrice: bigint;
  nextPrice: bigint;
  salePrice: bigint;
  isActive: boolean;
  question: string;
  currentAnswer: string;
  currentAnswerDescription: string;
  currentAnswerOwner: string;
  totalVolume: bigint;
  ipfsHash: string;
  link: string;
  categories: string[];
  // Computed fields
  priceChange?: number; // Percentage change
  priceChangeDirection?: 'up' | 'down' | 'neutral';
}

export interface AnswerHistory {
  answer: string;
  description: string;
  owner: string;
  price: bigint;
  timestamp: number;
}

export interface UserPortfolio {
  ownedAnswers: Opinion[];
  totalValue: bigint;
  totalFees: bigint;
  opinionCount: number;
}

export interface TradingTableColumn {
  key: keyof Opinion | 'actions';
  label: string;
  sortable: boolean;
  className?: string;
  render?: (opinion: Opinion) => React.ReactNode;
}

export interface CreateOpinionForm {
  question: string;
  answer: string;
  description: string;
  initialPrice: string;
  categories: string[];
  ipfsHash?: string;
  link?: string;
}

export interface SubmitAnswerForm {
  answer: string;
  description: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = keyof Opinion;

export interface TableSort {
  field: SortField;
  direction: SortDirection;
}