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

    event AnswerOwnershipTransferred(
        uint256 indexed opinionId,
        address indexed previousOwner,
        address indexed newOwner,
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

    // --- EXTENSION SLOTS EVENTS - IMPOSED SIGNATURES ---
    /**
     * @dev Emitted when a string extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionStringExtensionSet(uint256 indexed opinionId, string key, string value);

    /**
     * @dev Emitted when a number extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionNumberExtensionSet(uint256 indexed opinionId, string key, uint256 value);

    /**
     * @dev Emitted when a bool extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionBoolExtensionSet(uint256 indexed opinionId, string key, bool value);

    /**
     * @dev Emitted when an address extension is set for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    event OpinionAddressExtensionSet(uint256 indexed opinionId, string key, address value);

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
     * @dev Emitted when treasury address is updated
     * @param oldTreasury Previous treasury address
     * @param newTreasury New treasury address
     * @param admin Admin who performed the update
     * @param timestamp Block timestamp of the update
     */
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury,
        address indexed admin,
        uint256 timestamp
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
     * @dev Emitted when an answer is moderated by admin
     * @param opinionId Opinion ID
     * @param moderatedUser Address of user whose answer was moderated
     * @param newOwner Address of new answer owner (question creator)
     * @param reason Reason for moderation
     * @param timestamp Block timestamp of moderation
     */
    event AnswerModerated(
        uint256 indexed opinionId,
        address indexed moderatedUser,
        address indexed newOwner,
        string reason,
        uint256 timestamp
    );

    /**
     * @dev Emitted when category management actions occur
     * @param actionType Action type (0 = add single, 1 = add multiple)
     * @param categoryIndex Index of the category
     * @param categoryName Name of the category
     * @param actor Address performing the action
     * @param data Additional data (unused, set to 0)
     */
    event CategoryAction(
        uint8 indexed actionType,
        uint256 indexed categoryIndex,
        string categoryName,
        address indexed actor,
        uint256 data
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
     * @dev Emitted when question ownership is transferred (free transfer)
     * @param opinionId Opinion ID
     * @param previousOwner Previous owner address
     * @param newOwner New owner address
     */
    event QuestionOwnershipTransferred(
        uint256 indexed opinionId,
        address indexed previousOwner,
        address indexed newOwner
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

    /**
     * @dev Emitted when a contributor withdraws early from a pool with penalty
     * OBLIGATOIRE: Event pour early pool withdrawal
     * @param poolId Pool ID
     * @param contributor Address of the contributor withdrawing
     * @param originalContribution Original contribution amount
     * @param penaltyAmount Total penalty amount (10%)
     * @param userReceived Amount received by user (90%)
     * @param timestamp Withdrawal timestamp
     */
    event PoolEarlyWithdrawal(
        uint256 indexed poolId,
        address indexed contributor,
        uint96 originalContribution,
        uint96 penaltyAmount,
        uint96 userReceived,
        uint256 timestamp
    );
    
    // === 🛡️ BOT DETECTION EVENTS ===
    
    /**
     * @dev Emitted when bot detection is enabled/disabled
     * @param enabled Whether bot detection is enabled
     * @param admin Admin who toggled the setting
     */
    event BotDetectionToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin manually flags/unflags a trader
     * @param trader Trader address
     * @param flaggedAsBot Whether trader is flagged as bot
     * @param suspicionLevel New suspicion level (0-4)
     * @param admin Admin who performed the action
     */
    event AdminTraderFlagged(
        address indexed trader,
        bool flaggedAsBot,
        uint8 suspicionLevel,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin resets trader bot detection data
     * @param trader Trader address
     * @param admin Admin who performed the reset
     */
    event AdminTraderReset(
        address indexed trader,
        address indexed admin
    );
    
    // === 🔥 ENHANCED MEV PROTECTION EVENTS ===
    
    /**
     * @dev Emitted when enhanced MEV protection is enabled/disabled
     * @param enabled Whether enhanced MEV protection is enabled
     * @param admin Admin who toggled the setting
     */
    event EnhancedMevProtectionToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin manually adjusts a user's MEV risk level
     * @param user User address
     * @param oldLevel Previous risk level
     * @param newLevel New risk level
     * @param reason Reason for adjustment
     * @param admin Admin who performed the adjustment
     */
    event AdminMevRiskAdjusted(
        address indexed user,
        uint8 oldLevel,
        uint8 newLevel,
        string reason,
        address indexed admin
    );
    
    /**
     * @dev Emitted when an admin resets a user's MEV profile
     * @param user User address
     * @param admin Admin who performed the reset
     */
    event AdminMevProfileReset(
        address indexed user,
        address indexed admin
    );
    
    // === 🔒 INPUT VALIDATION HARDENING EVENTS ===
    
    /**
     * @dev Emitted when validation hardening is enabled/disabled
     * @param enabled Whether validation hardening is enabled
     * @param admin Admin who toggled the setting
     */
    event ValidationHardeningToggled(
        bool enabled,
        address indexed admin
    );
    
    /**
     * @dev Emitted when validation warning occurs
     * @param operation Operation that triggered warning
     * @param gasUsed Gas consumed
     * @param message Warning message
     */
    event ValidationWarning(
        string operation,
        uint256 gasUsed,
        string message
    );
    
    /**
     * @dev Emitted when system recovers from emergency mode
     * @param reason Reason for recovery
     * @param admin Admin who performed recovery
     */
    event SystemRecovered(
        string reason,
        address indexed admin
    );
    
    /**
     * @dev Emitted when emergency shutdown is triggered
     * @param trigger What triggered the shutdown
     * @param severity Severity level (0-100)
     * @param adminAction Required admin action
     */
    event EmergencyShutdownTriggered(
        string trigger,
        uint8 severity,
        string adminAction
    );
    
    /**
     * @dev Emitted when data corruption is detected
     * @param dataType Type of corrupted data
     * @param corruptionLevel Level of corruption (0-100)
     * @param recoverySteps Required recovery steps
     */
    event DataCorruptionDetected(
        string dataType,
        uint8 corruptionLevel,
        string recoverySteps
    );

    // === 🎁 REFERRAL SYSTEM EVENTS ===
    
    /**
     * @dev Emitted when a referral code is used successfully
     * @param newUser Address of the user who used the referral code
     * @param referrer Address of the user who referred them  
     * @param referralCode Referral code that was used
     * @param discountAmount Amount of discount received (in USDC)
     */
    event ReferralUsed(
        address indexed newUser,
        address indexed referrer,
        uint256 indexed referralCode,
        uint256 discountAmount
    );

    /**
     * @dev Emitted when cashback is withdrawn by a referrer
     * @param referrer Address of the referrer withdrawing cashback
     * @param amount Amount withdrawn (in USDC)
     */
    event CashbackWithdrawn(
        address indexed referrer,
        uint256 amount
    );
}
