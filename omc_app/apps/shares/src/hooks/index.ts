// Read hooks
export { useQuestions, useQuestionsByCreator } from './useQuestions';
export { useQuestion } from './useQuestion';
export { useAnswers, useAnswer } from './useAnswers';
export { useUserPosition, useUserPositions, type PositionWithAnswer } from './useUserPositions';
export { useAccumulatedFees, useTotalAccumulatedFees } from './useAccumulatedFees';

// Write hooks
export { useBuyShares, type BuySharesStatus } from './useBuyShares';
export { useSellShares, type SellSharesStatus } from './useSellShares';
export { useCreateQuestionWithAnswer, type CreateQuestionWithAnswerStatus } from './useCreateQuestionWithAnswer';
export { useProposeAnswer, type ProposeAnswerStatus } from './useProposeAnswer';
export { useClaimFees, type ClaimFeesStatus } from './useClaimFees';
export { useClaimKingFees, type ClaimKingFeesStatus } from './useClaimKingFees';

// Utility hooks
export { useChainSwitch, TARGET_CHAIN_ID, TARGET_CHAIN } from './useChainSwitch';
export { usePriceHistory, type PricePoint } from './usePriceHistory';
export { useTotalMarketCapHistory } from './useTotalMarketCapHistory';
export { useAnimatedCounter, useAnimatedBigIntCounter } from './useAnimatedCounter';
export { useIsMobile } from './useIsMobile';
export { useConfetti, type ConfettiType } from './useConfetti';
export {
  useUserProfile,
  formatUSDC,
  formatPercentage,
  formatAddress,
  formatTimeAgo,
  type UserStats,
  type UserProfile,
  type PositionWithDetails,
  type CategoryCount,
} from './useUserProfile';
