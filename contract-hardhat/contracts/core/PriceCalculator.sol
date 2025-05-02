// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PriceCalculator {
    /**
     * @dev Enhanced price calculation using market dynamics
     * Extremely optimized for minimal bytecode size
     */
    function calculateNextPrice(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 minimumPrice,
        uint256 absoluteMaxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) external view returns (uint256) {
        // Generate base random adjustment similar to original function
        bytes32 randomness = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                nonce,
                blockhash(block.number - 1)
            )
        );
        uint256 randomFactor = uint256(randomness) % 1000;

        // Get standard adjustment using existing distribution logic
        int256 adjustment;
        if (randomFactor < 200) {
            adjustment = -15 + int256(randomFactor % 15); // -15% to -1%
        } else if (randomFactor < 850) {
            adjustment = 5 + int256(randomFactor % 15); // +5% to +19%
        } else if (randomFactor < 990) {
            adjustment = 20 + int256(randomFactor % 30); // +20% to +49%
        } else {
            adjustment = 70 + int256(randomFactor % 30); // +70% to +99%
        }

        // Apply market dynamics if we have enough price history
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        if (count >= 3) {
            // Calculate simple average from history (limited to 3 prices)
            uint256 history = priceHistory[opinionId];
            uint256 p1 = history & ((1 << 80) - 1);
            uint256 p2 = (history >> 80) & ((1 << 80) - 1);
            uint256 p3 = (history >> 160) & ((1 << 80) - 1);

            uint256 avg = (p1 + p2 + p3) / 3;
            uint256 max = p1 > p2 ? (p1 > p3 ? p1 : p3) : (p2 > p3 ? p2 : p3);
            uint256 min = p1 < p2 ? (p1 < p3 ? p1 : p3) : (p2 < p3 ? p2 : p3);

            // Calculate support/resistance
            uint256 support = avg > min ? avg - ((avg - min) * 70) / 100 : min;
            uint256 resistance = max > avg
                ? avg + ((max - avg) * 70) / 100
                : max;

            // Apply market dynamics - reduce upward pressure near resistance
            if (adjustment > 0 && lastPrice > avg) {
                uint256 range = resistance > avg ? resistance - avg : 1;
                uint256 distance = lastPrice > avg ? lastPrice - avg : 0;
                uint256 proximity = (distance * 100) / range;

                // Dampen upward adjustment near resistance
                adjustment =
                    (adjustment *
                        int256(
                            100 -
                                ((proximity < 100 ? proximity : 100) * 70) /
                                100
                        )) /
                    100;
            }
            // Reduce downward pressure near support
            else if (adjustment < 0 && lastPrice < avg) {
                uint256 range = avg > support ? avg - support : 1;
                uint256 distance = avg > lastPrice ? avg - lastPrice : 0;
                uint256 proximity = (distance * 100) / range;

                // Dampen downward adjustment near support
                adjustment =
                    (adjustment *
                        int256(
                            100 -
                                ((proximity < 100 ? proximity : 100) * 70) /
                                100
                        )) /
                    100;
            }

            // Add volatility factor based on time since last trade
            uint256 lastTradeTime = meta >> 8;
            if (block.timestamp > lastTradeTime) {
                uint256 timeDiff = block.timestamp - lastTradeTime;
                // If recent activity (less than 1 day), increase volatility
                if (timeDiff < 1 days) {
                    uint256 volatility = 100 +
                        ((1 days - timeDiff) * 100) /
                        1 days;
                    adjustment = (adjustment * int256(volatility)) / 100;
                }
            }
        }

        // Calculate new price based on adjustment (same as original function)
        uint256 newPrice;
        if (adjustment < 0) {
            uint256 reduction = (lastPrice * uint256(-adjustment)) / 100;
            newPrice = lastPrice > reduction
                ? lastPrice - reduction
                : minimumPrice;
        } else {
            newPrice = (lastPrice * (100 + uint256(adjustment))) / 100;
        }

        // Ensure price changes for testing (same as original)
        if (newPrice == lastPrice) {
            newPrice = lastPrice + 1;
        }

        newPrice = newPrice < minimumPrice ? minimumPrice : newPrice;

        // Validate price change stays within limits
        validatePriceChange(lastPrice, newPrice, absoluteMaxPriceChange);

        // Update price history handled in the main contract

        return newPrice;
    }

    /**
     * @dev Validates that price changes do not exceed the maximum allowed.
     */
    function validatePriceChange(
        uint256 lastPrice,
        uint256 newPrice,
        uint256 absoluteMaxPriceChange
    ) internal pure {
        if (newPrice > lastPrice) {
            uint256 increase = ((newPrice - lastPrice) * 100) / lastPrice;
            if (increase > absoluteMaxPriceChange) {
                revert PriceChangeExceedsLimit(
                    increase,
                    absoluteMaxPriceChange
                );
            }
        }
    }

    // Error definition needed in the library
    error PriceChangeExceedsLimit(uint256 actual, uint256 limit);
}
