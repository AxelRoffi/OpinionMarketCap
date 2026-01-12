// libraries/FeeCalculator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../structs/OpinionStructs.sol";

library FeeCalculator {
    struct FeeParams {
        uint8 platformFeePercent;
        uint8 creatorFeePercent;
        uint8 mevPenaltyPercent;
        uint32 rapidTradeWindow;
    }

    // Calculate standard fees for a transaction
    function calculateFees(
        uint256 price,
        FeeParams memory params
    ) internal pure returns (OpinionStructs.FeeDistribution memory) {
        OpinionStructs.FeeDistribution memory fees;

        fees.platformFee = uint96((price * params.platformFeePercent) / 100);
        fees.creatorFee = uint96((price * params.creatorFeePercent) / 100);
        fees.ownerAmount = uint96(price) - fees.platformFee - fees.creatorFee;

        return fees;
    }

    // Apply MEV penalty for rapid trading
    function applyMEVPenalty(
        OpinionStructs.FeeDistribution memory fees,
        uint96 price,
        uint256 lastTradeTime,
        uint256 currentTime,
        uint256 lastTradePrice,
        FeeParams memory params
    ) internal pure returns (OpinionStructs.FeeDistribution memory) {
        // Skip if not a rapid trade
        if (
            lastTradeTime == 0 ||
            (currentTime - lastTradeTime) >= params.rapidTradeWindow
        ) {
            return fees;
        }

        // Progressive penalty based on how recent the last trade was
        uint256 timeElapsed = currentTime - lastTradeTime;
        uint256 penaltyMultiplier = params.rapidTradeWindow - timeElapsed;
        penaltyMultiplier = (penaltyMultiplier * 100) / params.rapidTradeWindow;

        // Check for potential profit
        if (lastTradePrice > 0 && fees.ownerAmount > lastTradePrice) {
            // Potential profit from rapid trading
            uint96 potentialProfit = fees.ownerAmount - uint96(lastTradePrice);

            // Apply progressive penalty (up to 100% of profit)
            uint96 penaltyAmount = uint96(
                (potentialProfit * penaltyMultiplier) / 100
            );

            // Redistribute profit to platform fee
            fees.platformFee += penaltyAmount;
            fees.ownerAmount -= penaltyAmount;
        } else {
            // No profit, but still apply penalty to discourage MEV
            uint96 baseAmount = uint96(
                (price * params.mevPenaltyPercent) / 100
            );
            uint96 penaltyAmount = uint96(
                (baseAmount * penaltyMultiplier) / 100
            );

            // Cap the penalty to ensure owner gets something
            if (penaltyAmount >= fees.ownerAmount / 2) {
                penaltyAmount = fees.ownerAmount / 2;
            }

            fees.platformFee += penaltyAmount;
            fees.ownerAmount -= penaltyAmount;
        }

        return fees;
    }

    // Handle multiple pool contributors fee distribution
    function calculateContributorRewards(
        uint96 rewardAmount,
        uint96[] memory contributions,
        uint96 totalContributed
    ) internal pure returns (uint96[] memory rewards) {
        uint256 length = contributions.length;
        rewards = new uint96[](length);
        uint96 distributedAmount = 0;

        for (uint256 i = 0; i < length; i++) {
            uint96 contribution = contributions[i];
            if (contribution > 0) {
                // Calculate share (100% = 10000 for precision)
                uint256 share = (uint256(contribution) * 10000) /
                    totalContributed;
                rewards[i] = i < length - 1
                    ? uint96((uint256(rewardAmount) * share) / 10000)
                    : rewardAmount - distributedAmount;

                distributedAmount += rewards[i];
            }
        }

        return rewards;
    }
}
