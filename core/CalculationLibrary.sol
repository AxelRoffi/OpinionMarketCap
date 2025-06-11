// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CalculationLibrary {
    /**
     * @notice Calculate platform and creator fees based on price
     * @param price The price to calculate fees from
     * @param platformFeePercent Platform fee percentage
     * @param creatorFeePercent Creator fee percentage
     * @return platformFee Amount for platform
     * @return creatorFee Amount for creator
     */
    function calculateFees(
        uint256 price,
        uint256 platformFeePercent,
        uint256 creatorFeePercent
    ) external pure returns (uint256 platformFee, uint256 creatorFee) {
        platformFee = (price * platformFeePercent) / 100;
        creatorFee = (price * creatorFeePercent) / 100;
        return (platformFee, creatorFee);
    }

    /**
     * @notice Calculate the next price based on the last price
     * @param lastPrice The last price
     * @param seed Random seed for price calculation
     * @param minimumPrice Minimum allowed price
     * @param absoluteMaxPriceChange Maximum price change percentage
     * @return The next price
     */
    function calculateNextPrice(
        uint256 lastPrice,
        uint256 seed,
        uint256 minimumPrice,
        uint256 absoluteMaxPriceChange
    ) external pure returns (uint256) {
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(seed))) %
            1000;
        int256 adjustment;

        // Revised distribution to target ~10-12% average growth rate
        if (randomFactor < 200) {
            adjustment = -15 + int256(randomFactor % 15); // -15% to -1%
        } else if (randomFactor < 850) {
            adjustment = 5 + int256(randomFactor % 15); // +5% to +19%
        } else if (randomFactor < 990) {
            adjustment = 20 + int256(randomFactor % 30); // +20% to +49%
        } else {
            adjustment = 70 + int256(randomFactor % 30); // +70% to +99%
        }

        uint256 newPrice;
        if (adjustment < 0) {
            // Handle negative adjustment properly
            uint256 reduction = (lastPrice * uint256(-adjustment)) / 100;
            newPrice = lastPrice > reduction
                ? lastPrice - reduction
                : minimumPrice;
        } else {
            // Handle positive adjustment
            newPrice = (lastPrice * (100 + uint256(adjustment))) / 100;
        }

        // Ensure price changes for testing
        if (newPrice == lastPrice) {
            newPrice = lastPrice + 1;
        }

        newPrice = newPrice < minimumPrice ? minimumPrice : newPrice;

        // Validate against max price change
        if (newPrice > lastPrice) {
            uint256 increase = ((newPrice - lastPrice) * 100) / lastPrice;
            if (increase > absoluteMaxPriceChange) {
                // Cap the increase at the maximum allowed
                newPrice =
                    lastPrice +
                    ((lastPrice * absoluteMaxPriceChange) / 100);
            }
        }

        return newPrice;
    }

    /**
     * @notice Provide a simple estimate of the next price for UI purposes
     * @param lastPrice The last price
     * @return An estimated next price
     */
    function estimateNextPrice(
        uint256 lastPrice
    ) external pure returns (uint256) {
        // Simple estimation: 25% increase (more conservative than the average increase in calculateNextPrice)
        return (lastPrice * 125) / 100;
    }

    /**
     * @notice Validate if a price change is within the maximum allowed limit
     * @param lastPrice The last price
     * @param newPrice The new price
     * @param absoluteMaxPriceChange Maximum percentage change allowed
     * @return isValid Whether the price change is valid
     * @return actualIncrease The calculated price increase percentage
     */
    function validatePriceChange(
        uint256 lastPrice,
        uint256 newPrice,
        uint256 absoluteMaxPriceChange
    ) external pure returns (bool isValid, uint256 actualIncrease) {
        if (newPrice <= lastPrice) {
            return (true, 0);
        }

        uint256 increase = ((newPrice - lastPrice) * 100) / lastPrice;
        return (increase <= absoluteMaxPriceChange, increase);
    }
}
