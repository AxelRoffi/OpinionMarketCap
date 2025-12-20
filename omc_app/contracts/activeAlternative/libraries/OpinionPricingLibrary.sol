// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PriceCalculator.sol";

/**
 * @title OpinionPricingLibrary
 * @dev Library for opinion pricing calculations and price history management
 */
library OpinionPricingLibrary {

    /**
     * @dev Calculates the next price for an opinion using competition-aware pricing
     * @param opinionTraders Storage mapping of traders per opinion
     * @param opinionId The opinion ID
     * @param lastPrice Current price
     * @param minimumPrice Minimum allowed price
     * @param absoluteMaxPriceChange Maximum price change percentage
     * @param nonce Random nonce for price calculation
     * @param priceMetadata Storage mapping for price metadata
     * @param priceHistory Storage mapping for price history
     * @return newPrice Calculated next price
     */
    function calculateNextPrice(
        mapping(uint256 => address[]) storage opinionTraders,
        uint256 opinionId,
        uint256 lastPrice,
        uint96 minimumPrice,
        uint256 absoluteMaxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) internal returns (uint256 newPrice) {
        // Check if there's competitive trading (2+ unique traders)
        bool isCompetitive = opinionTraders[opinionId].length >= 2;
        
        if (isCompetitive) {
            // COMPETITIVE AUCTION: Minimum growth floor when 2+ traders compete
            // This ensures auction-style price increases, not decreases
            uint256 randomSeed = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                opinionId,
                lastPrice,
                nonce
            )));
            
            // Guaranteed minimum 8-12% increase for competitive scenarios
            uint256 increasePercent = 8 + (randomSeed % 5); // 8%, 9%, 10%, 11%, or 12%
            uint256 increase = (lastPrice * increasePercent) / 100;
            newPrice = lastPrice + increase;
            
        } else {
            // MARKET REGIME PRICING: Use complex market simulation for non-competitive scenarios
            // This allows for price volatility when there's no active competition
            newPrice = PriceCalculator.calculateNextPrice(
                opinionId,
                lastPrice,
                minimumPrice,
                absoluteMaxPriceChange,
                nonce,
                priceMetadata,
                priceHistory
            );
        }

        // Apply global safety limits
        uint256 maxAllowedPrice = lastPrice + ((lastPrice * absoluteMaxPriceChange) / 100);
        if (newPrice > maxAllowedPrice) {
            newPrice = maxAllowedPrice;
        }

        // Ensure minimum price floor
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }

        // Update price history
        updatePriceHistory(priceMetadata, priceHistory, opinionId, newPrice);

        return newPrice;
    }

    /**
     * @dev Estimates a next price based on current price (for view functions)
     * @param currentPrice Current opinion price
     * @param minimumPrice Minimum allowed price
     * @return estimatedPrice Estimated next price
     */
    function estimateNextPrice(
        uint256 currentPrice,
        uint96 minimumPrice
    ) internal view returns (uint256 estimatedPrice) {
        // Simple estimation: increase by 10-30% or use minimum price
        uint256 increase = (currentPrice * (10 + (block.timestamp % 20))) / 100;
        uint256 newPrice = currentPrice + increase;
        
        // Ensure it's at least the minimum price
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }
        
        return newPrice;
    }

    /**
     * @dev Updates price history for an opinion
     * @param priceMetadata Storage mapping for price metadata
     * @param priceHistory Storage mapping for price history
     * @param opinionId The opinion ID
     * @param newPrice The new price to record
     */
    function updatePriceHistory(
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory,
        uint256 opinionId,
        uint256 newPrice
    ) internal {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        // Store timestamp in upper bits
        priceMetadata[opinionId] =
            (block.timestamp << 8) |
            (count < 3 ? count + 1 : 3);

        // Shift prices and add new one
        uint256 history = priceHistory[opinionId];
        history = (history << 80) & (~uint256(0) << 160);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    /**
     * @dev Gets the current price history for an opinion
     * @param priceMetadata Storage mapping for price metadata
     * @param priceHistory Storage mapping for price history
     * @param opinionId The opinion ID
     * @return timestamps Array of timestamps for price history
     * @return prices Array of historical prices
     */
    function getPriceHistory(
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory,
        uint256 opinionId
    ) internal view returns (
        uint256[] memory timestamps,
        uint256[] memory prices
    ) {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);
        uint256 lastTimestamp = meta >> 8;
        
        timestamps = new uint256[](count);
        prices = new uint256[](count);
        
        if (count > 0) {
            timestamps[0] = lastTimestamp;
            
            uint256 history = priceHistory[opinionId];
            for (uint8 i = 0; i < count; i++) {
                prices[i] = history & ((1 << 80) - 1);
                history = history >> 80;
                
                if (i > 0) {
                    // Estimate earlier timestamps (this is approximate)
                    timestamps[i] = timestamps[0] - (i * 300); // Assume 5 min intervals
                }
            }
        }
        
        return (timestamps, prices);
    }

    /**
     * @dev Validates price ranges for opinion creation
     * @param initialPrice User-chosen initial price
     * @param minPrice Minimum allowed price
     * @param maxPrice Maximum allowed price
     */
    function validatePriceRange(
        uint96 initialPrice,
        uint96 minPrice,
        uint96 maxPrice
    ) internal pure {
        require(
            initialPrice >= minPrice && initialPrice <= maxPrice,
            "Price outside allowed range"
        );
    }

    /**
     * @dev Calculates creation fee based on initial price and fee percentage
     * @param initialPrice The initial price chosen by user
     * @param creationFeePercent Fee percentage (e.g., 20 for 20%)
     * @param minimumFee Minimum fee amount (e.g., 5 USDC)
     * @return creationFee Calculated creation fee
     */
    function calculateCreationFee(
        uint96 initialPrice,
        uint256 creationFeePercent,
        uint96 minimumFee
    ) internal pure returns (uint96 creationFee) {
        creationFee = uint96((initialPrice * creationFeePercent) / 100);
        if (creationFee < minimumFee) {
            creationFee = minimumFee;
        }
        return creationFee;
    }

    /**
     * @dev Gets the effective next price for an opinion (handles legacy opinions)
     * @param storedNextPrice The stored next price from storage
     * @param lastPrice The last price paid
     * @param minimumPrice Minimum allowed price
     * @return effectiveNextPrice The price to use for next transaction
     */
    function getEffectiveNextPrice(
        uint96 storedNextPrice,
        uint96 lastPrice,
        uint96 minimumPrice
    ) internal view returns (uint256 effectiveNextPrice) {
        // If nextPrice is 0 (for older opinions), return an estimate
        if (storedNextPrice == 0) {
            return estimateNextPrice(lastPrice, minimumPrice);
        }
        return storedNextPrice;
    }

    /**
     * @dev Calculates price increase percentage between two prices
     * @param oldPrice Previous price
     * @param newPrice New price
     * @return increasePercent Percentage increase (scaled by 100, e.g., 1250 = 12.5%)
     */
    function calculatePriceIncreasePercent(
        uint256 oldPrice,
        uint256 newPrice
    ) internal pure returns (uint256 increasePercent) {
        if (oldPrice == 0) return 0;
        
        if (newPrice >= oldPrice) {
            increasePercent = ((newPrice - oldPrice) * 10000) / oldPrice;
        } else {
            // Handle price decrease (negative percentage)
            increasePercent = 0; // Or could return a flag for decrease
        }
    }

    /**
     * @dev Applies price bounds to ensure price stays within acceptable limits
     * @param calculatedPrice The calculated price before bounds
     * @param minimumPrice Minimum allowed price
     * @param maximumPrice Maximum allowed price  
     * @return boundedPrice Price after applying bounds
     */
    function applyPriceBounds(
        uint256 calculatedPrice,
        uint96 minimumPrice,
        uint256 maximumPrice
    ) internal pure returns (uint256 boundedPrice) {
        if (calculatedPrice < minimumPrice) {
            return minimumPrice;
        }
        if (calculatedPrice > maximumPrice) {
            return maximumPrice;
        }
        return calculatedPrice;
    }
}