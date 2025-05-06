// interfaces/IOpinionMarketEvents.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOpinionMarketEvents {
    // Opinion events - more granular with additional indexed fields
    event OpinionCreated(
        uint256 indexed opinionId,
        string question,
        string initialAnswer,
        address indexed creator,
        uint256 initialPrice,
        uint256 timestamp
    );

    event OpinionAnswered(
        uint256 indexed opinionId,
        string answer,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 price,
        uint256 timestamp
    );

    event OpinionStatusChanged(
        uint256 indexed opinionId,
        bool isActive,
        address indexed moderator,
        uint256 timestamp
    );

    // Question trading events
    event QuestionListed(
        uint256 indexed opinionId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event QuestionPurchased(
        uint256 indexed opinionId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );

    event QuestionListingCancelled(
        uint256 indexed opinionId,
        address indexed seller,
        uint256 timestamp
    );

    // Fee events - more detailed for financial tracking
    event FeeDistributed(
        uint256 indexed opinionId,
        address indexed recipient,
        uint8 feeType, // 0: platform, 1: creator, 2: owner
        uint256 amount,
        uint256 timestamp
    );

    event FeeAccumulated(
        address indexed user,
        uint256 amount,
        uint256 newTotal,
        uint256 timestamp
    );

    event FeeClaimed(address indexed user, uint256 amount, uint256 timestamp);

    // Add to IOpinionMarketEvents.sol
    /**
     * @dev Emitted on fee-related actions:
     * actionType: 0 = fee calculation, 1 = fee accumulation, 2 = fee claiming
     * @param opinionId Opinion ID (0 for non-opinion-specific actions)
     * @param actionType Action type (0 = calculation, 1 = accumulation, 2 = claiming)
     * @param account Account involved in the action
     * @param amount Fee amount
     * @param platformFee Platform fee amount (only used for actionType 0)
     * @param creatorFee Creator fee amount (only used for actionType 0)
     * @param ownerAmount Owner amount (only used for actionType 0)
     */
    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed account,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    // Add to IOpinionMarketEvents.sol
    /**
     * @dev Emitted when a parameter is updated
     * @param paramId Parameter ID
     * @param value New parameter value
     */
    event ParameterUpdated(uint8 indexed paramId, uint256 value);

    /**
     * @dev Emitted for administrative actions
     * @param actionType Action type
     * @param account Account that performed the action
     * @param data Additional data
     * @param amount Amount involved (if applicable)
     */
    event AdminAction(
        uint8 indexed actionType,
        address indexed account,
        bytes32 data,
        uint256 amount
    );

    /**
     * @dev Emitted when an opinion action occurs
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = create, 1 = answer, 2 = deactivate, 3 = reactivate)
     * @param content Content associated with the action (question or answer)
     * @param actor Address performing the action
     * @param price Price involved (if applicable)
     */
    event OpinionAction(
        uint256 indexed opinionId,
        uint8 actionType,
        string content,
        address indexed actor,
        uint256 price
    );

    /**
     * @dev Emitted when a question sale action occurs
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = list, 1 = buy, 2 = cancel)
     * @param seller Address of the seller
     * @param buyer Address of the buyer (address(0) for listing/cancellation)
     * @param price Sale price
     */
    event QuestionSaleAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    /**
     * @dev Emitted when a pool action occurs
     * @param poolId Pool ID
     * @param opinionId Opinion ID
     * @param actionType Action type (0 = create, 1 = contribute, 2 = execute, 3 = expire, 4 = extend, 5 = withdraw, 6 = distribute rewards)
     * @param actor Address performing the action
     * @param amount Amount involved
     * @param answer Proposed answer (if applicable)
     */
    event PoolAction(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed actor,
        uint256 amount,
        string answer
    );

    /**
     * @dev Emitted when a contract address is updated
     * @param contractType Contract type (0 = OpinionCore, 1 = FeeManager, 2 = PoolManager)
     * @param newAddress New contract address
     */
    event ContractAddressUpdated(
        uint8 indexed contractType,
        address indexed newAddress
    );

    /**
     * @dev Emitted when pool rewards are distributed
     * @param poolId Pool ID
     * @param contributor Contributor address
     * @param amount Reward amount
     * @param share Contribution share percentage (scaled by 100)
     */
    event RewardDistributed(
        uint256 indexed poolId,
        address indexed contributor,
        uint256 amount,
        uint256 share
    );

    // Pool events - with more indexed parameters
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        address indexed creator,
        uint256 initialContribution,
        uint256 deadline,
        string name,
        uint256 timestamp
    );

    event PoolContribution(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint256 amount,
        uint256 newTotalAmount,
        uint256 timestamp
    );

    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 targetPrice,
        uint256 timestamp
    );

    event PoolExpired(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint256 totalAmount,
        uint256 contributorCount,
        uint256 timestamp
    );

    event PoolExtended(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed extender,
        uint256 newDeadline,
        uint256 timestamp
    );

    event PoolRefund(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event PoolRewardDistributed(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint256 contributionAmount,
        uint256 sharePercentage,
        uint256 rewardAmount,
        uint256 timestamp
    );

    // Admin events - more detailed
    event ContractPaused(address indexed operator, uint256 timestamp);

    event ContractUnpaused(address indexed operator, uint256 timestamp);

    event PublicCreationToggled(
        bool newStatus,
        address indexed admin,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event ParameterUpdated(
        uint8 indexed paramId,
        uint256 oldValue,
        uint256 newValue,
        address indexed admin,
        uint256 timestamp
    );
}
