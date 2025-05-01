// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOpinionMarketEvents
 * @dev Optimized interface for OpinionMarket events
 */
interface IOpinionMarketEvents {
    // Combined Opinion Management Events
    event OpinionAction(
        uint256 indexed id,
        uint8 actionType, // 0: Created, 1: AnswerSubmitted, 2: Deactivated, 3: Reactivated
        string data, // question or answer depending on actionType
        address actor, // creator, owner, etc.
        uint256 price
    );

    // Combined Sale Events
    event QuestionSaleAction(
        uint256 indexed opinionId,
        uint8 actionType, // 0: Listed, 1: Sold, 2: Cancelled
        address seller,
        address buyer,
        uint256 price
    );

    // Combined Fee Events
    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType, // 0: Distributed, 1: Accumulated, 2: Claimed
        address user,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    // Combined Admin Events
    event AdminAction(
        uint8 actionType, // 0: EmergencyWithdraw, 1: ToggleCreation, 2: RoleGranted, 3: RoleRevoked
        address account,
        bytes32 data, // role for role actions, or empty for others
        uint256 amount
    );

    // Parameter Updates - Combined into one event
    event ParameterUpdated(
        uint8 paramType, // 0: MinimumPrice, 1: PlatformFee, etc.
        uint256 newValue
    );

    // Pool Events - Consolidated
    event PoolAction(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint8 actionType, // 0: Created, 1: Contributed, 2: Executed, 3: Expired, 4: Extended
        address actor,
        uint256 amount,
        string data // For answers or other string data
    );

    // Reward Distribution (kept separate as it's more complex)
    event RewardDistributed(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 sharePercentage
    );
}
