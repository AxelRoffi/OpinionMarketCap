// ErrorsLib.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface OpinionMarketErrors {
    error ContractPaused();
    error ContractNotPaused();
    error WithdrawalFailed();
    error EmptyString();
    error InvalidQuestionLength();
    error InvalidAnswerLength();
    error InvalidPrice();
    error UnauthorizedCreator();
    error OpinionNotActive();
    error TransferFailed();
    error OpinionNotFound();
    error InsufficientAllowance(uint256 required, uint256 provided);
    error OneTradePerBlock();
    error PriceChangeExceedsLimit(uint256 increase, uint256 limit);
    error MaxTradesPerBlockExceeded(uint256 current, uint256 max);
    error NoFeesToClaim();
    error InvalidLinkLength();
    error InvalidIpfsHashLength();
    error InvalidIpfsHashFormat();
    error OpinionAlreadyActive();
    error SameOwner();

    // Pool errors
    error PoolInvalidOpinionId(uint256 opinionId);
    error PoolSameAnswerAsCurrentAnswer(uint256 opinionId, string answer);
    error PoolDeadlineTooShort(uint256 deadline, uint256 minDuration);
    error PoolDeadlineTooLong(uint256 deadline, uint256 maxDuration);
    error PoolInitialContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInvalidProposedAnswer();
    error PoolInvalidPoolId(uint256 poolId);
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolDeadlinePassed(uint256 poolId, uint256 deadline);
    error PoolContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInsufficientFunds(uint256 current, uint256 target);
    error PoolExecutionFailed(uint256 poolId);
    error PoolAlreadyExecuted(uint256 poolId);
    error PoolNoContribution(uint256 poolId, address user);
    error PoolNotExpired(uint256 poolId, uint256 deadline);
    error PoolAlreadyRefunded(uint256 poolId, address user);
    error PoolInvalidNameLength();
    error PoolAlreadyFunded(uint256 poolId);
}
