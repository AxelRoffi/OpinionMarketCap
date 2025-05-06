// libraries/PriceCalculator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PriceCalculator {
    // Random number generation for price movement
    function calculateNextPrice(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 minimumPrice,
        uint256 maxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) public view returns (uint256) {
        // Generate a pseudo-random number between 0 and 999
        uint256 randomFactor = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    opinionId,
                    nonce
                )
            )
        ) % 1000;

        // Initialize price adjustment
        int256 adjustment;

        // Distribution:
        // 20% chance of price decrease (-20% to -1%)
        // 55% chance of small increase (1% to 30%)
        // 20% chance of medium increase (31% to 75%)
        // 5% chance of large increase (76% to maxPriceChange%)
        if (randomFactor < 200) {
            // Decrease: -20% to -1%
            adjustment = -20 + int256(randomFactor % 20);
        } else if (randomFactor < 750) {
            // Small increase: 1% to 30%
            adjustment = 1 + int256(randomFactor % 30);
        } else if (randomFactor < 950) {
            // Medium increase: 31% to 75%
            adjustment = 31 + int256(randomFactor % 45);
        } else {
            // Large increase: 76% to maxPriceChange%
            uint256 remainingRange = maxPriceChange > 76
                ? maxPriceChange - 76
                : 24;
            adjustment = 76 + int256(randomFactor % remainingRange);
        }

        // Apply price adjustment with safeguards
        uint256 newPrice;
        if (adjustment >= 0) {
            // Price increase
            newPrice = lastPrice + ((lastPrice * uint256(adjustment)) / 100);

            // Cap the maximum price change
            uint256 maxNewPrice = lastPrice +
                ((lastPrice * maxPriceChange) / 100);
            if (newPrice > maxNewPrice) {
                newPrice = maxNewPrice;
            }
        } else {
            // Price decrease
            uint256 decreaseAmount = (lastPrice * uint256(-adjustment)) / 100;
            newPrice = lastPrice > decreaseAmount
                ? lastPrice - decreaseAmount
                : minimumPrice;
        }

        // Ensure minimum price
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }

        // Apply volatility damper based on price history
        newPrice = _applyVolatilityDamper(
            opinionId,
            lastPrice,
            newPrice,
            priceMetadata,
            priceHistory
        );

        return newPrice;
    }

    // Prevent extreme volatility by checking price history
    function _applyVolatilityDamper(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 newPrice,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) private view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        // If we have at least 2 price data points, apply damping
        if (count >= 2) {
            uint256 history = priceHistory[opinionId];

            // Extract previous price (second most recent)
            uint256 prevPrice = (history >> 80) & ((1 << 80) - 1);

            // If there are extreme changes in both directions (zigzag)
            bool lastChangeWasUp = prevPrice < lastPrice;
            bool newChangeIsUp = lastPrice < newPrice;

            // If price is reversing direction with a large swing
            if (lastChangeWasUp != newChangeIsUp) {
                uint256 lastChangePercent = lastChangeWasUp
                    ? ((lastPrice - prevPrice) * 100) / prevPrice
                    : ((prevPrice - lastPrice) * 100) / lastPrice;

                uint256 newChangePercent = newChangeIsUp
                    ? ((newPrice - lastPrice) * 100) / lastPrice
                    : ((lastPrice - newPrice) * 100) / newPrice;

                // If both changes were significant, reduce the amplitude
                if (lastChangePercent > 30 && newChangePercent > 30) {
                    // Dampen the change by 50%
                    if (newChangeIsUp) {
                        newPrice = lastPrice + ((newPrice - lastPrice) / 2);
                    } else {
                        newPrice = lastPrice - ((lastPrice - newPrice) / 2);
                    }
                }
            }
        }

        return newPrice;
    }
}
