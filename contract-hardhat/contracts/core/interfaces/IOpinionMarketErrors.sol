// interfaces/IOpinionMarketErrors.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionMarketErrors {
    // Opinion errors
    error OpinionNotFound();
    error OpinionNotActive();
    error OpinionAlreadyActive();
    error UnauthorizedCreator();
    error NotTheOwner(address caller, address owner);
    error InvalidQuestionLength();
    error InvalidAnswerLength();
    error InvalidIpfsHashLength();
    error InvalidLinkLength();
    error InvalidIpfsHashFormat();
    error EmptyString();
    error SameOwner();
    error NotForSale(uint256 opinionId);
    error InvalidInitialPrice();
    error InvalidDescriptionLength();
    
    // Category errors - IMPOSED SIGNATURES
    error NoCategoryProvided();
    error TooManyCategories();
    error InvalidCategory();
    error DuplicateCategory();
    error CategoryAlreadyExists();

    // Fee errors
    error InsufficientAllowance(uint256 required, uint256 provided);
    error NoFeesToClaim();
    error FeeTooHigh(uint8 feeType, uint256 newFee, uint256 maxFee);
    error CooldownNotElapsed(uint8 paramId, uint256 cooldownEnds);

    // Pool errors
    error PoolInvalidPoolId(uint256 poolId);
    error PoolInvalidOpinionId(uint256 opinionId);
    error PoolSameAnswerAsCurrentAnswer(uint256 opinionId, string answer);
    error PoolDeadlineTooShort(uint256 deadline, uint256 minDuration);
    error PoolDeadlineTooLong(uint256 deadline, uint256 maxDuration);
    error PoolInitialContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInvalidProposedAnswer();
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolDeadlinePassed(uint256 poolId, uint256 deadline);
    error PoolContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInsufficientFunds(uint256 current, uint256 target);
    error PoolExecutionFailed(uint256 poolId);
    error PoolAlreadyExecuted(uint256 poolId);
    error PoolNoContribution(uint256 poolId, address user);
    error PoolNotExpired(uint256 poolId, uint256 deadline);
    error PoolAlreadyRefunded(uint256 poolId, address user);
    error PoolAlreadyFunded(uint256 poolId);
    error PoolInvalidNameLength();

    // Extension errors - IMPOSED SIGNATURES
    error InvalidExtensionKey();

    // Security/rate limiting errors
    error MaxTradesPerBlockExceeded(uint256 trades, uint256 maxTrades);
    error OneTradePerBlock();
    error MaxParameterValueExceeded(
        uint8 paramId,
        uint256 value,
        uint256 maxValue
    );
    error ZeroAddressNotAllowed();
    error InvalidOperationWhilePaused();
    error InvalidTokenTransfer();
}
