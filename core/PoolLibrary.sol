// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OpinionMarketErrors} from "./OpinionMarketErrors.sol";

/**
 * @title PoolLibrary
 * @dev Library containing pool-related validation and utility functions for OpinionMarket
 * Uses uint8 values instead of enums for compatibility
 */
library PoolLibrary {
    // --- CONSTANTS ---
    // Status values matching the PoolStatus enum in main contract
    uint8 internal constant STATUS_ACTIVE = 0;
    uint8 internal constant STATUS_EXECUTED = 1;
    uint8 internal constant STATUS_EXPIRED = 2;
    uint8 internal constant STATUS_EXTENDED = 3;

    // Opinion data needed for validation
    struct OpinionData {
        bool isActive;
        string currentAnswer;
        uint256 nextPrice;
        uint256 lastPrice;
    }

    // --- VALIDATION FUNCTIONS ---

    /**
     * @dev Validates pool creation parameters
     */
    function validatePoolCreationParams(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash,
        OpinionData memory opinion,
        uint256 nextOpinionId,
        uint256 minPoolDuration,
        uint256 maxPoolDuration,
        uint256 MAX_POOL_NAME_LENGTH,
        uint256 MAX_IPFS_HASH_LENGTH,
        uint256 MAX_ANSWER_LENGTH
    ) external view {
        // Validate opinion exists and is active
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_INVALID_OPINION_ID,
                opinionId,
                0
            );
        if (!opinion.isActive)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_ACTIVE
            );

        // Validate pool name
        if (bytes(name).length > MAX_POOL_NAME_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.POOL_INVALID_NAME_LENGTH
            );

        // Validate IPFS hash if provided
        if (bytes(ipfsHash).length > 0) {
            if (bytes(ipfsHash).length > MAX_IPFS_HASH_LENGTH)
                revert OpinionMarketErrors.ERR(
                    OpinionMarketErrors.INVALID_IPFS_HASH_LENGTH
                );
            validateIpfsHash(ipfsHash);
        }

        // Validate proposed answer
        bytes memory answerBytes = bytes(proposedAnswer);
        if (answerBytes.length == 0)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.EMPTY_STRING);
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.POOL_INVALID_PROPOSED_ANSWER
            );

        // Check that proposed answer is different from current
        if (keccak256(bytes(opinion.currentAnswer)) == keccak256(answerBytes))
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_SAME_ANSWER_AS_CURRENT,
                opinionId,
                0
            );
        // Note: We can't pass the string directly in ERR_DATA, so we just use the opinionId

        // Validate deadline
        if (deadline <= block.timestamp + minPoolDuration)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_DEADLINE_TOO_SHORT,
                deadline,
                minPoolDuration
            );
        if (deadline > block.timestamp + maxPoolDuration)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_DEADLINE_TOO_LONG,
                deadline,
                maxPoolDuration
            );

        // For pool creation, use a lower minimum (1 USDC)
        uint256 minimumInitialContribution = 1_000_000; // 1 USDC

        // Validate initial contribution
        if (initialContribution < minimumInitialContribution)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_INITIAL_CONTRIBUTION_TOO_LOW,
                initialContribution,
                minimumInitialContribution
            );
    }

    /**
     * @dev Validates IPFS hash format
     */
    function validateIpfsHash(string memory _ipfsHash) public pure {
        bytes memory ipfsHashBytes = bytes(_ipfsHash);

        // Check that it's either a valid CIDv0 (starts with "Qm" and is 46 chars long)
        // or a valid CIDv1 (starts with "b" and has a proper length)
        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_IPFS_HASH_FORMAT
            );
        }
    }

    /**
     * @dev Validates pool contribution parameters and returns adjusted amount if needed
     */
    function validatePoolContribution(
        uint256 poolId,
        uint256 amount,
        uint8 poolStatus,
        uint256 deadline,
        uint256 totalAmount,
        uint256 targetPrice,
        uint256 poolCount
    ) external view returns (uint256) {
        // Validate pool exists and is active
        if (poolId >= poolCount)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_INVALID_POOL_ID,
                poolId,
                0
            );

        if (poolStatus != STATUS_ACTIVE)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_NOT_ACTIVE,
                poolId,
                poolStatus
            );

        if (block.timestamp > deadline)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_DEADLINE_PASSED,
                poolId,
                deadline
            );

        // Check if pool already has enough funds
        if (totalAmount >= targetPrice)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_ALREADY_FUNDED,
                poolId,
                0
            );

        // Calculate the maximum allowed contribution
        uint256 maxAllowed = targetPrice - totalAmount;

        // If contribution exceeds what's needed, adjust it
        uint256 actualAmount = amount;
        if (amount > maxAllowed) {
            actualAmount = maxAllowed;
        }

        // Ensure non-zero contribution (1 wei minimum)
        if (actualAmount == 0)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_CONTRIBUTION_TOO_LOW,
                actualAmount,
                1
            );

        return actualAmount;
    }

    /**
     * @dev Estimates the next price based on the last price (simplified version)
     */
    function estimateNextPrice(
        uint256 lastPrice
    ) external pure returns (uint256) {
        // Simple estimation: 25% increase (matching CalculationLibrary)
        return (lastPrice * 125) / 100;
    }

    /**
     * @dev Checks if a pool has expired and returns its new status
     */
    function checkPoolExpiry(
        uint256 poolId,
        uint8 currentStatus,
        uint256 deadline,
        uint256 poolCount
    ) external view returns (bool isExpired, uint8 newStatus) {
        if (poolId >= poolCount)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.POOL_INVALID_POOL_ID,
                poolId,
                0
            );

        // Only check active pools
        if (currentStatus != STATUS_ACTIVE) {
            return (currentStatus == STATUS_EXPIRED, currentStatus);
        }

        // Check if deadline has passed
        if (block.timestamp > deadline) {
            return (true, STATUS_EXPIRED);
        }

        return (false, STATUS_ACTIVE);
    }
}
