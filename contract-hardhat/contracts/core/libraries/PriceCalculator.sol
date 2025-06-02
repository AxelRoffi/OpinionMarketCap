// libraries/PriceCalculator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PriceCalculator
 * @dev Market simulation pricing system with 4 trading regimes
 * Replaces random pricing with realistic market behavior while maintaining trader profitability
 */
library PriceCalculator {
    // === MARKET REGIME DEFINITIONS ===
    
    enum MarketRegime {
        CONSOLIDATION,    // 25% - Range trading ±10%
        BULLISH_TRENDING, // 60% - Steady gains +5% to +40%  
        MILD_CORRECTION,  // 15% - Limited drops -20% to +5%
        PARABOLIC        //  2% - Extreme moves +40% to +100%
    }
    
    // === ACTIVITY THRESHOLDS ===
    
    uint256 private constant HOT_THRESHOLD = 50;     // Hot topic activity score
    uint256 private constant COLD_THRESHOLD = 10;    // Cold topic activity score
    uint256 private constant ACTIVITY_DECAY_RATE = 4; // 4% decay per hour
    uint256 private constant MAX_DECAY_HOURS = 24;   // Maximum decay period
    
    // === REGIME PROBABILITIES (Base: Consolidation, Bullish, Correction, Parabolic) ===
    
    uint8 private constant PROB_CONSOLIDATION = 25;
    uint8 private constant PROB_BULLISH = 60;
    uint8 private constant PROB_CORRECTION = 13;
    uint8 private constant PROB_PARABOLIC = 2;
    
    // === ACTIVITY METRICS STRUCTURE ===
    
    struct ActivityMetrics {
        uint32 recentTrades;      // Last 24h trades count
        uint96 recentVolume;      // Last 24h volume in USDC
        uint32 lastActivityTime;  // Timestamp of last activity
        uint32 uniqueTraders;     // Count of unique traders (last 24h)
    }
    
    // === EVENTS FOR ACTIVITY TRACKING ===
    
    event ActivityUpdated(uint256 indexed opinionId, uint32 trades, uint96 volume, uint32 timestamp);
    event RegimeSelected(uint256 indexed opinionId, MarketRegime regime, uint256 activityScore);
    
    // === MAIN PRICING FUNCTION (BACKWARD COMPATIBLE) ===
    function calculateNextPrice(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 minimumPrice,
        uint256 maxPriceChange,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) public returns (uint256) {
        // === MARKET SIMULATION CORE LOGIC (SIMPLIFIED FOR LIBRARY) ===
        
        // 1. Calculate simplified activity score from price history
        uint256 activityScore = _calculateSimpleActivityScore(opinionId, priceMetadata);
        
        // 2. Determine market regime based on activity and probabilities
        MarketRegime regime = _selectMarketRegime(opinionId, activityScore, nonce);
        
        // 3. Generate secure entropy for price calculation
        uint256 entropy = _getSecureEntropy(opinionId, nonce, lastPrice);
        
        // 4. Calculate regime-based price movement
        int256 priceMovement = _calculateRegimeMovement(regime, entropy);
        
        // 5. Apply price movement with safeguards
        uint256 newPrice = _applyPriceMovement(
            lastPrice, 
            priceMovement, 
            minimumPrice, 
            maxPriceChange
        );
        
        // 6. Apply volatility damper (maintain existing stability logic)
        newPrice = _applyVolatilityDamper(
            opinionId,
            lastPrice,
            newPrice,
            priceMetadata,
            priceHistory
        );
        
        // 7. Emit events for external tracking
        emit ActivityUpdated(opinionId, uint32(activityScore), uint96(lastPrice), uint32(block.timestamp));
        emit RegimeSelected(opinionId, regime, activityScore);
        
        return newPrice;
    }
    
    // === MARKET SIMULATION HELPER FUNCTIONS ===
    
    /**
     * @dev Calculates simplified activity score from existing price metadata
     * @param opinionId Opinion identifier
     * @param priceMetadata Existing price metadata storage
     * @return Activity score (0-100+ scale)
     */
    function _calculateSimpleActivityScore(
        uint256 opinionId, 
        mapping(uint256 => uint256) storage priceMetadata
    ) internal view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 tradeCount = uint8(meta);          // Number of recent trades
        uint32 lastUpdate = uint32(meta >> 8);   // Last update timestamp
        
        // Base activity from trade count (existing data)
        uint256 baseScore = uint256(tradeCount) * 3; // Weight trades more heavily
        
        // Time decay: reduce score based on inactivity
        if (lastUpdate > 0) {
            uint256 hoursInactive = (block.timestamp - lastUpdate) / 3600;
            if (hoursInactive > MAX_DECAY_HOURS) hoursInactive = MAX_DECAY_HOURS;
            
            uint256 decayFactor = 100 - (hoursInactive * ACTIVITY_DECAY_RATE);
            baseScore = (baseScore * decayFactor) / 100;
        }
        
        return baseScore;
    }
    
    /**
     * @dev Selects market regime based on activity and probabilities
     * @param opinionId Opinion identifier
     * @param activityScore Current activity score
     * @param nonce Entropy nonce
     * @return Selected market regime
     */
    function _selectMarketRegime(
        uint256 opinionId, 
        uint256 activityScore, 
        uint256 nonce
    ) internal view returns (MarketRegime) {
        // Get activity-adjusted probabilities
        uint8[4] memory probabilities = _getRegimeProbabilities(activityScore);
        
        // Generate deterministic but unpredictable selection
        uint256 entropy = _getSecureEntropy(opinionId, nonce, activityScore);
        uint256 selector = entropy % 100; // 0-99 range
        
        // Select regime based on cumulative probabilities
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                return MarketRegime(i);
            }
        }
        
        // Fallback to BULLISH_TRENDING (should never reach here)
        return MarketRegime.BULLISH_TRENDING;
    }
    
    /**
     * @dev Gets activity-adjusted regime probabilities
     * @param activityScore Current activity score
     * @return Array of probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function _getRegimeProbabilities(uint256 activityScore) internal pure returns (uint8[4] memory) {
        uint8[4] memory probs = [PROB_CONSOLIDATION, PROB_BULLISH, PROB_CORRECTION, PROB_PARABOLIC];
        
        if (activityScore > HOT_THRESHOLD) {
            // Hot topics: More volatility (more Parabolic, less Consolidation)
            probs[0] = 15; // Consolidation: 25% → 15%
            probs[1] = 62; // Bullish: 60% → 62%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 10; // Parabolic: 2% → 10%
            
        } else if (activityScore < COLD_THRESHOLD) {
            // Cold topics: More stable (more Consolidation, less volatility)
            probs[0] = 40; // Consolidation: 25% → 40%
            probs[1] = 45; // Bullish: 60% → 45%
            probs[2] = 13; // Correction: 13% → 13%
            probs[3] = 2;  // Parabolic: 2% → 2%
        }
        
        return probs;
    }
    
    /**
     * @dev Generates secure entropy for market simulation
     * @param opinionId Opinion identifier
     * @param nonce Entropy nonce
     * @param additionalSeed Additional entropy seed
     * @return Secure pseudo-random number
     */
    function _getSecureEntropy(
        uint256 opinionId, 
        uint256 nonce, 
        uint256 additionalSeed
    ) internal view returns (uint256) {
        // Multi-source entropy for MEV resistance
        return uint256(keccak256(abi.encodePacked(
            block.prevrandao,        // Beacon chain randomness (primary)
            block.timestamp / 3600,  // Hour-level granularity (reduces manipulation window)
            opinionId,              // Opinion-specific seed
            nonce,                  // Transaction-specific nonce
            additionalSeed,         // Additional entropy (activity score, etc.)
            address(this),          // Contract address
            tx.gasprice            // Transaction gas price (harder to predict)
        )));
    }
    
    /**
     * @dev Calculates price movement based on market regime
     * @param regime Current market regime
     * @param entropy Random entropy for movement calculation
     * @return Price movement percentage (signed integer)
     */
    function _calculateRegimeMovement(MarketRegime regime, uint256 entropy) internal pure returns (int256) {
        // Use different entropy ranges for different regimes
        uint256 movementSeed = entropy % 100;
        
        if (regime == MarketRegime.CONSOLIDATION) {
            // Range trading: -10% to +15% (slight bullish bias)
            return -10 + int256(movementSeed % 26);
            
        } else if (regime == MarketRegime.BULLISH_TRENDING) {
            // Steady gains: +5% to +40%
            return 5 + int256(movementSeed % 36);
            
        } else if (regime == MarketRegime.MILD_CORRECTION) {
            // Limited corrections: -20% to +5%
            return -20 + int256(movementSeed % 26);
            
        } else { // PARABOLIC
            // Extreme moves: +40% to +100%
            return 40 + int256(movementSeed % 61);
        }
    }
    
    /**
     * @dev Applies price movement with safeguards and limits
     * @param lastPrice Previous price
     * @param movement Price movement percentage
     * @param minimumPrice Minimum allowed price
     * @param maxPriceChange Maximum allowed price change
     * @return New price after movement and safeguards
     */
    function _applyPriceMovement(
        uint256 lastPrice,
        int256 movement,
        uint256 minimumPrice,
        uint256 maxPriceChange
    ) internal pure returns (uint256) {
        uint256 newPrice;
        
        if (movement >= 0) {
            // Price increase
            uint256 increaseAmount = (lastPrice * uint256(movement)) / 100;
            newPrice = lastPrice + increaseAmount;
            
            // Cap at maximum price change
            uint256 maxAllowedPrice = lastPrice + ((lastPrice * maxPriceChange) / 100);
            if (newPrice > maxAllowedPrice) {
                newPrice = maxAllowedPrice;
            }
            
        } else {
            // Price decrease
            uint256 decreaseAmount = (lastPrice * uint256(-movement)) / 100;
            newPrice = lastPrice > decreaseAmount ? lastPrice - decreaseAmount : minimumPrice;
        }
        
        // Ensure minimum price floor
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }
        
        return newPrice;
    }
    
    // Note: Market state tracking removed from library (state stored externally)

    // === EXISTING VOLATILITY DAMPER (PRESERVED) ===
    // Prevent extreme volatility by checking price history
    // Correction pour PriceCalculator.sol
    function _applyVolatilityDamper(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 newPrice,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) private view returns (uint256) {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        // Si nous avons au moins 2 points de données de prix, appliquer l'amortissement
        if (count >= 2) {
            uint256 history = priceHistory[opinionId];

            // Extraire le prix précédent (second plus récent)
            uint256 prevPrice = (history >> 80) & ((1 << 80) - 1);

            // Si le prix précédent est zéro, retourner simplement le nouveau prix
            if (prevPrice == 0) return newPrice;

            // Si des changements extrêmes dans les deux directions (zigzag)
            bool lastChangeWasUp = prevPrice < lastPrice;
            bool newChangeIsUp = lastPrice < newPrice;

            // Si le prix inverse sa direction avec une grande oscillation
            if (lastChangeWasUp != newChangeIsUp) {
                // Vérifier que le prix n'est pas zéro avant de faire la division
                uint256 lastChangePercent = lastChangeWasUp
                    ? ((lastPrice - prevPrice) * 100) / prevPrice
                    : ((prevPrice - lastPrice) * 100) /
                        (lastPrice > 0 ? lastPrice : 1); // Éviter division par zéro

                uint256 newChangePercent = newChangeIsUp
                    ? ((newPrice - lastPrice) * 100) / lastPrice
                    : ((lastPrice - newPrice) * 100) /
                        (newPrice > 0 ? newPrice : 1); // Éviter division par zéro

                // Si les deux changements étaient significatifs, réduire l'amplitude
                if (lastChangePercent > 30 && newChangePercent > 30) {
                    // Amortir le changement de 50%
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
    
    // === VIEW FUNCTIONS FOR MONITORING & ANALYTICS ===
    
    /**
     * @dev Gets market regime probabilities for given activity level
     * @param activityScore Activity score
     * @return probabilities Array of regime probabilities [Consolidation, Bullish, Correction, Parabolic]
     */
    function getRegimeProbabilities(uint256 activityScore) external pure returns (uint8[4] memory probabilities) {
        return _getRegimeProbabilities(activityScore);
    }
    
    /**
     * @dev Simulates next price movement for testing/preview (pure function)
     * @param activityScore Activity score for the opinion
     * @param currentPrice Current price
     * @param testNonce Test nonce for simulation
     * @return Simulated next price
     * @return Selected regime for the simulation
     */
    function simulateNextPrice(
        uint256 activityScore,
        uint256 currentPrice,
        uint256 testNonce
    ) external pure returns (uint256, MarketRegime) {
        // Select regime based on activity
        uint8[4] memory probabilities = _getRegimeProbabilities(activityScore);
        uint256 selector = testNonce % 100;
        
        MarketRegime regime = MarketRegime.BULLISH_TRENDING; // default
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 4; i++) {
            cumulative += probabilities[i];
            if (selector < cumulative) {
                regime = MarketRegime(i);
                break;
            }
        }
        
        // Calculate movement using test nonce as entropy
        int256 movement = _calculateRegimeMovement(regime, testNonce);
        
        // Apply movement (simplified)
        uint256 newPrice;
        if (movement >= 0) {
            newPrice = currentPrice + ((currentPrice * uint256(movement)) / 100);
        } else {
            uint256 decreaseAmount = (currentPrice * uint256(-movement)) / 100;
            newPrice = currentPrice > decreaseAmount ? currentPrice - decreaseAmount : currentPrice / 2;
        }
        
        return (newPrice, regime);
    }
}
