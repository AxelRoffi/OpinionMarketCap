// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OpinionMarketEvents
 * @dev Interface containing all events emitted by the OpinionMarket contract
 */
interface OpinionMarketEvents {
    // --- CORE EVENTS ---
    event OpinionCreated(
        uint256 indexed id,
        string question,
        uint256 initialPrice,
        address creator,
        string ipfsHash,
        string link
    );

    event PublicCreationToggled(bool isEnabled);

    event AnswerSubmitted(
        uint256 indexed opinionId,
        string answer,
        address owner,
        uint256 price
    );

    event OpinionDeactivated(uint256 indexed opinionId);

    event FeesDistributed(
        uint256 indexed opinionId,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount,
        address currentOwner
    );

    event EmergencyWithdraw(address token, uint256 amount, uint256 timestamp);

    event RoleGranted(bytes32 indexed role, address indexed account);

    event RoleRevoked(bytes32 indexed role, address indexed account);

    event FeesAccumulated(address indexed user, uint256 amount);

    event FeesClaimed(address indexed user, uint256 amount);

    event OpinionReactivated(uint256 indexed opinionId);

    // --- POOL EVENTS ---
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 initialContribution,
        address creator,
        uint256 deadline,
        string name,
        string ipfsHash
    );

    event PoolContributed(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address contributor,
        uint256 amount,
        uint256 newTotalAmount
    );

    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 priceAtExecution
    );

    event PoolAnswerPurchased(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address newOwner,
        uint256 purchasePrice,
        uint256 totalRewardAmount
    );

    event PoolCreatorBadgeAwarded(
        address indexed creator,
        uint256 indexed poolId
    );

    event PoolExpired(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint256 totalAmount,
        uint256 contributorCount
    );

    event PoolExtended(
        uint256 indexed poolId,
        uint256 newDeadline,
        address extender
    );

    event PoolRefundIssued(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount
    );

    event PoolRewardDistributed(
        uint256 indexed poolId,
        address indexed contributor,
        uint256 contributionAmount,
        uint256 sharePercentage,
        uint256 rewardAmount
    );

    // --- EVENTS FOR STATE VARIABLE UPDATES ---
    event MinimumPriceUpdated(uint256 newPrice);
    event PlatformFeePercentUpdated(uint256 newPercent);
    event CreatorFeePercentUpdated(uint256 newPercent);
    event MaxPriceChangeUpdated(uint256 newPercent);
    event MaxTradesPerBlockUpdated(uint256 newCount);
    event RapidTradeWindowUpdated(uint256 newWindow);
    event QuestionCreationFeeUpdated(uint256 newFee);
    event InitialAnswerPriceUpdated(uint256 newPrice);
    event PoolCreationFeeUpdated(uint256 newFee);
    event PoolContributionFeeUpdated(uint256 newFee);
    event MinPoolDurationUpdated(uint256 newDuration);
    event MaxPoolDurationUpdated(uint256 newDuration);
}
