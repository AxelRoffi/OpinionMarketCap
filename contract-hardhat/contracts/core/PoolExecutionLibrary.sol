// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PoolExecutionLibrary
 * @dev Library for pool execution logic in the OpinionMarket contract
 */
library PoolExecutionLibrary {
    /**
     * @dev Process pool execution
     * @param targetPrice Price target to execute at
     * @param platformFeePercent Platform fee percentage
     * @param creatorFeePercent Creator fee percentage
     * @return platformFee Platform fee calculated
     * @return creatorFee Creator fee calculated
     * @return ownerAmount Amount for the current owner
     */
    function calculateFees(
        uint256 targetPrice,
        uint256 platformFeePercent,
        uint256 creatorFeePercent
    )
        external
        pure
        returns (uint256 platformFee, uint256 creatorFee, uint256 ownerAmount)
    {
        platformFee = (targetPrice * platformFeePercent) / 100;
        creatorFee = (targetPrice * creatorFeePercent) / 100;
        ownerAmount = targetPrice - platformFee - creatorFee;
        return (platformFee, creatorFee, ownerAmount);
    }

    /**
     * @dev Check if pool is ready to execute and validate funds
     * @param poolStatus Status of the pool
     * @param poolTotalAmount Total amount contributed to the pool
     * @param targetPrice Target price required
     * @return isReady Whether the pool is ready to execute
     * @return errorCode Error code if not ready (0 = ready, 1 = not active, 2 = insufficient funds)
     */
    function isPoolReadyToExecute(
        uint8 poolStatus,
        uint256 poolTotalAmount,
        uint256 targetPrice
    ) external pure returns (bool isReady, uint8 errorCode) {
        // Check if pool is active (0 = Active)
        if (poolStatus != 0) {
            return (false, 1); // Not active
        }

        // Check if pool has enough funds
        if (poolTotalAmount < targetPrice) {
            return (false, 2); // Insufficient funds
        }

        return (true, 0); // Ready
    }

    /**
     * @dev Calculate contributor rewards
     * @param contribution Individual contributor's amount
     * @param totalContributed Total amount contributed to the pool
     * @param rewardAmount Total reward amount to distribute
     * @return share Share percentage (0-100)
     * @return reward Individual reward amount
     */
    function calculateContributorReward(
        uint256 contribution,
        uint256 totalContributed,
        uint256 rewardAmount
    ) external pure returns (uint256 share, uint256 reward) {
        if (contribution == 0 || totalContributed == 0) {
            return (0, 0);
        }

        share = (contribution * 100) / totalContributed;
        reward = (rewardAmount * share) / 100;

        return (share, reward);
    }

    /**
     * @dev Check and handle pool expiry
     * @param status Current pool status
     * @param deadline Pool deadline
     * @param currentTime Current block timestamp
     * @return isExpired Whether the pool is expired
     * @return newStatus New pool status if changed
     */
    function checkPoolExpiry(
        uint8 status,
        uint256 deadline,
        uint256 currentTime
    ) external pure returns (bool isExpired, uint8 newStatus) {
        // If already expired or executed, return current status
        if (status == 1 || status == 2) {
            // 1 = Executed, 2 = Expired
            return (status == 2, status);
        }

        // Check if pool has expired
        isExpired = currentTime > deadline;

        // If expired, update status
        if (isExpired) {
            newStatus = 2; // Expired
        } else {
            newStatus = status;
        }

        return (isExpired, newStatus);
    }
}
