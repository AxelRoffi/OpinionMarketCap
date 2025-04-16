// types/index.ts (add or modify as needed)
export type OpinionDetail = {
  id: bigint;
  question: string;
  creator: string;
  currentPrice: bigint;
  nextPrice: bigint;
  isActive: boolean;
  currentAnswer: string;
  currentAnswerOwner: string;
  totalVolume: bigint;
  formattedPrice: string;
  formattedNextPrice: string;
  formattedVolume: string;
  priceChange?: string;
  priceChangeValue?: number;
  creatorEarnings: string;
  ownerEarnings: string;
  formattedCreatorEarnings: string;
  formattedOwnerEarnings: string;
  history?: AnswerHistoryItemWithMetadata[];
};

export type AnswerHistoryItemWithMetadata = {
  answer: string;
  owner: string;
  price: bigint;
  timestamp: bigint;
  formattedPrice: string;
  formattedTimestamp: string;
  shortOwnerAddress: string;
};