// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AntiManipulationLib
 * @dev Enhanced anti-manipulation library for OpinionMarketCap
 * Addresses remaining price manipulation vulnerabilities:
 * - Whale manipulation through spending limits
 * - Sybil attacks through enhanced validation 
 * - MEV attacks through protective mechanisms
 */
library AntiManipulationLib {
    
    // ═══════════════════════════════════════════════════════════════
    // WHALE PROTECTION CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public constant MAX_USER_OPINION_SHARE = 40; // Max 40% individual spending per opinion
    uint256 public constant WHALE_THRESHOLD_BASE = 50_000_000; // 50 USDC base threshold
    uint256 public constant MIN_DIVERSE_TRADERS = 3; // Minimum traders for healthy competition
    uint256 public constant SPENDING_RESET_PERIOD = 7 days; // Weekly spending limits reset
    
    // ═══════════════════════════════════════════════════════════════
    // SYBIL DETECTION CONSTANTS  
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public constant MIN_WALLET_AGE = 24 hours; // Minimum wallet age for competition
    uint256 public constant MIN_WALLET_HISTORY = 3; // Minimum transaction history
    uint256 public constant SYBIL_TIME_WINDOW = 300; // 5-minute window for coordinated detection
    uint256 public constant MAX_COORDINATED_ACCOUNTS = 2; // Max accounts from same source
    
    // ═══════════════════════════════════════════════════════════════
    // MEV PROTECTION CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public constant MEV_PROTECTION_DELAY = 1; // 1 block delay minimum
    uint256 public constant PRICE_BAND_WIDTH = 5; // 5% price bands for MEV protection
    uint256 public constant MAX_SLIPPAGE_PROTECTION = 10; // 10% max slippage
    
    // ═══════════════════════════════════════════════════════════════
    // DATA STRUCTURES
    // ═══════════════════════════════════════════════════════════════
    
    struct WhaleProtectionData {
        mapping(address => uint256) userSpending; // User spending in this opinion
        mapping(address => uint256) userSpendingResetTime; // When spending resets
        uint256 totalOpinionVolume; // Total volume for this opinion
        uint256 maxUserSpending; // Dynamic max spending for this opinion
        uint32 uniqueTraders; // Number of unique traders
    }
    
    struct SybilDetectionData {
        mapping(address => uint256) walletFirstSeen; // When wallet first interacted
        mapping(address => uint32) walletTransactionCount; // Wallet transaction history
        mapping(uint256 => address[]) timeWindowTraders; // Traders in time windows
        mapping(address => bool) verifiedTraders; // Traders that passed validation
        uint256 lastValidationReset; // Last time validation data was reset
    }
    
    struct MEVProtectionData {
        mapping(address => uint256) lastTradeBlock; // Last trade block per user
        mapping(uint256 => uint256) blockPriceHigh; // Highest price in block
        mapping(uint256 => uint256) blockPriceLow; // Lowest price in block
        uint256 lastPriceUpdate; // Last price update timestamp
        uint256 protectionLevel; // Current MEV protection level (0-3)
    }
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    event WhaleProtectionTriggered(uint256 indexed opinionId, address indexed user, uint256 attemptedAmount, uint256 limit);
    event SybilAttackDetected(uint256 indexed opinionId, address indexed suspiciousTrader, string reason);
    event MEVProtectionActivated(uint256 indexed opinionId, address indexed user, uint256 protectionLevel);
    event SpendingLimitUpdated(uint256 indexed opinionId, uint256 newLimit, uint256 totalVolume);
    event CompetitionValidated(uint256 indexed opinionId, uint32 uniqueTraders, bool isValid);
    
    // ═══════════════════════════════════════════════════════════════
    // WHALE PROTECTION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Validates that user spending doesn't exceed whale limits
     * @param opinionId Opinion identifier
     * @param user User attempting to trade
     * @param tradeAmount Amount user wants to spend
     * @param whaleData Whale protection data storage
     * @return isValid Whether trade is within whale limits
     * @return newLimit Updated spending limit for user
     */
    function validateWhaleProtection(
        uint256 opinionId,
        address user,
        uint256 tradeAmount,
        WhaleProtectionData storage whaleData
    ) external returns (bool isValid, uint256 newLimit) {
        
        // Reset spending if period expired
        if (block.timestamp >= whaleData.userSpendingResetTime[user]) {
            whaleData.userSpending[user] = 0;
            whaleData.userSpendingResetTime[user] = block.timestamp + SPENDING_RESET_PERIOD;
        }
        
        // Calculate dynamic spending limit based on opinion volume
        uint256 maxAllowedSpending = _calculateDynamicSpendingLimit(
            whaleData.totalOpinionVolume,
            whaleData.uniqueTraders
        );
        
        // Check if user would exceed limit
        uint256 newUserSpending = whaleData.userSpending[user] + tradeAmount;
        if (newUserSpending > maxAllowedSpending) {
            emit WhaleProtectionTriggered(opinionId, user, tradeAmount, maxAllowedSpending);
            return (false, maxAllowedSpending - whaleData.userSpending[user]);
        }
        
        // Update user spending
        whaleData.userSpending[user] = newUserSpending;
        whaleData.totalOpinionVolume += tradeAmount;
        
        // Update unique trader count if new trader
        if (whaleData.userSpending[user] == tradeAmount) {
            whaleData.uniqueTraders++;
        }
        
        // Update max spending limit for next calculations
        whaleData.maxUserSpending = maxAllowedSpending;
        
        emit SpendingLimitUpdated(opinionId, maxAllowedSpending, whaleData.totalOpinionVolume);
        return (true, maxAllowedSpending - newUserSpending);
    }
    
    /**
     * @dev Calculates dynamic spending limit based on opinion activity
     * @param totalVolume Total opinion volume
     * @param uniqueTraders Number of unique traders
     * @return Dynamic spending limit
     */
    function _calculateDynamicSpendingLimit(
        uint256 totalVolume,
        uint32 uniqueTraders
    ) internal pure returns (uint256) {
        
        // Base limit: 50 USDC or 40% of total volume, whichever is higher
        uint256 baseLimit = (totalVolume * MAX_USER_OPINION_SHARE) / 100;
        if (baseLimit < WHALE_THRESHOLD_BASE) {
            baseLimit = WHALE_THRESHOLD_BASE;
        }
        
        // Adjust based on trader diversity
        if (uniqueTraders >= MIN_DIVERSE_TRADERS) {
            // More traders = higher individual limits (healthy competition)
            baseLimit = (baseLimit * (100 + uniqueTraders * 5)) / 100;
        } else {
            // Few traders = stricter limits (prevent dominance)
            baseLimit = (baseLimit * 75) / 100;
        }
        
        return baseLimit;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SYBIL ATTACK DETECTION
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Validates that competition is real (not Sybil attack)
     * @param opinionId Opinion identifier  
     * @param user Current user trading
     * @param sybilData Sybil detection data storage
     * @return isValidTrader Whether trader passes Sybil checks
     * @return competitionScore Competition authenticity score (0-100)
     */
    function validateRealCompetition(
        uint256 opinionId,
        address user, 
        SybilDetectionData storage sybilData
    ) external returns (bool isValidTrader, uint256 competitionScore) {
        
        // Check 1: Wallet age validation
        bool walletAgeValid = _validateWalletAge(user, sybilData);
        if (!walletAgeValid) {
            emit SybilAttackDetected(opinionId, user, "Wallet too new");
            return (false, 0);
        }
        
        // Check 2: Transaction history validation
        bool historyValid = _validateWalletHistory(user, sybilData);
        if (!historyValid) {
            emit SybilAttackDetected(opinionId, user, "Insufficient transaction history");
            return (false, 0);
        }
        
        // Check 3: Coordinated timing detection
        bool timingValid = _detectCoordinatedTiming(user, sybilData);
        if (!timingValid) {
            emit SybilAttackDetected(opinionId, user, "Coordinated timing detected");
            return (false, 0);
        }
        
        // Check 4: Calculate competition authenticity score
        competitionScore = _calculateCompetitionScore(sybilData);
        
        // Mark trader as verified if passed all checks
        sybilData.verifiedTraders[user] = true;
        sybilData.walletTransactionCount[user]++;
        
        return (true, competitionScore);
    }
    
    /**
     * @dev Validates wallet age meets minimum requirements
     * @param user User address to validate
     * @param sybilData Sybil detection data
     * @return isValid Whether wallet age is sufficient
     */
    function _validateWalletAge(
        address user,
        SybilDetectionData storage sybilData
    ) internal returns (bool isValid) {
        
        // Record first interaction if not recorded
        if (sybilData.walletFirstSeen[user] == 0) {
            sybilData.walletFirstSeen[user] = block.timestamp;
            return false; // New wallets fail age check initially
        }
        
        // Check if wallet meets minimum age requirement
        return (block.timestamp - sybilData.walletFirstSeen[user]) >= MIN_WALLET_AGE;
    }
    
    /**
     * @dev Validates wallet has sufficient transaction history
     * @param user User address to validate  
     * @param sybilData Sybil detection data
     * @return isValid Whether wallet has sufficient history
     */
    function _validateWalletHistory(
        address user,
        SybilDetectionData storage sybilData
    ) internal view returns (bool isValid) {
        
        return sybilData.walletTransactionCount[user] >= MIN_WALLET_HISTORY;
    }
    
    /**
     * @dev Detects coordinated timing patterns across multiple accounts
     * @param user Current user
     * @param sybilData Sybil detection data
     * @return isValid Whether timing patterns are natural (not coordinated)
     */
    function _detectCoordinatedTiming(
        address user,
        SybilDetectionData storage sybilData
    ) internal returns (bool isValid) {
        
        uint256 currentTimeWindow = block.timestamp / SYBIL_TIME_WINDOW;
        
        // Add user to current time window
        sybilData.timeWindowTraders[currentTimeWindow].push(user);
        
        // Check if too many accounts trading in same time window
        if (sybilData.timeWindowTraders[currentTimeWindow].length > MAX_COORDINATED_ACCOUNTS) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Calculates competition authenticity score
     * @param sybilData Sybil detection data
     * @return score Competition score (0-100, higher = more authentic)
     */
    function _calculateCompetitionScore(
        SybilDetectionData storage sybilData
    ) internal view returns (uint256 score) {
        
        // Count verified traders
        uint256 verifiedCount = 0;
        uint256 totalChecked = 0;
        
        // This is simplified - real implementation would track verified traders count
        // For now, we return a base score
        score = 75; // Base authentic competition score
        
        return score;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MEV PROTECTION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Protects against MEV attacks through block delays and price bands
     * @param opinionId Opinion identifier
     * @param user User attempting to trade
     * @param proposedPrice Proposed trade price
     * @param mevData MEV protection data storage
     * @return isProtected Whether trade is protected from MEV
     * @return adjustedPrice Price adjusted for MEV protection
     * @return delayBlocks Number of blocks to delay (if any)
     */
    function protectAgainstMEV(
        uint256 opinionId,
        address user,
        uint256 proposedPrice,
        MEVProtectionData storage mevData
    ) external returns (bool isProtected, uint256 adjustedPrice, uint256 delayBlocks) {
        
        // Check 1: Block delay protection
        if (mevData.lastTradeBlock[user] == block.number) {
            emit MEVProtectionActivated(opinionId, user, 1);
            return (false, proposedPrice, MEV_PROTECTION_DELAY);
        }
        
        // Check 2: Price band protection
        (bool withinBands, uint256 bandAdjustedPrice) = _validatePriceBands(
            proposedPrice,
            mevData
        );
        
        if (!withinBands) {
            emit MEVProtectionActivated(opinionId, user, 2);
            return (true, bandAdjustedPrice, 0);
        }
        
        // Check 3: Slippage protection
        uint256 slippageProtectedPrice = _applySlippageProtection(
            proposedPrice,
            mevData.blockPriceHigh[block.number],
            mevData.blockPriceLow[block.number]
        );
        
        // Update MEV tracking data
        mevData.lastTradeBlock[user] = block.number;
        _updateBlockPriceData(proposedPrice, mevData);
        
        return (true, slippageProtectedPrice, 0);
    }
    
    /**
     * @dev Validates price is within acceptable bands to prevent MEV
     * @param proposedPrice Proposed trade price
     * @param mevData MEV protection data
     * @return withinBands Whether price is within bands
     * @return adjustedPrice Band-adjusted price
     */
    function _validatePriceBands(
        uint256 proposedPrice,
        MEVProtectionData storage mevData
    ) internal view returns (bool withinBands, uint256 adjustedPrice) {
        
        if (mevData.lastPriceUpdate == 0) {
            // No previous price data, allow any reasonable price
            return (true, proposedPrice);
        }
        
        // Calculate acceptable price range (±5%)
        uint256 lastPrice = mevData.blockPriceHigh[block.number - 1];
        if (lastPrice == 0) lastPrice = proposedPrice; // Fallback
        
        uint256 maxPrice = lastPrice + ((lastPrice * PRICE_BAND_WIDTH) / 100);
        uint256 minPrice = lastPrice - ((lastPrice * PRICE_BAND_WIDTH) / 100);
        
        if (proposedPrice > maxPrice) {
            return (false, maxPrice);
        } else if (proposedPrice < minPrice) {
            return (false, minPrice);  
        }
        
        return (true, proposedPrice);
    }
    
    /**
     * @dev Applies slippage protection to prevent MEV extraction
     * @param proposedPrice Proposed trade price
     * @param blockHigh Highest price in current block
     * @param blockLow Lowest price in current block
     * @return protectedPrice Slippage-protected price
     */
    function _applySlippageProtection(
        uint256 proposedPrice,
        uint256 blockHigh,
        uint256 blockLow
    ) internal pure returns (uint256 protectedPrice) {
        
        if (blockHigh == 0 || blockLow == 0) {
            // First trade in block, no slippage protection needed
            return proposedPrice;
        }
        
        // Limit slippage to maximum allowed
        uint256 blockRange = blockHigh > blockLow ? blockHigh - blockLow : 0;
        uint256 maxSlippage = (proposedPrice * MAX_SLIPPAGE_PROTECTION) / 100;
        
        if (blockRange > maxSlippage) {
            // Too much slippage, adjust price toward midpoint
            protectedPrice = (blockHigh + blockLow) / 2;
        } else {
            protectedPrice = proposedPrice;
        }
        
        return protectedPrice;
    }
    
    /**
     * @dev Updates block-level price tracking for MEV protection
     * @param price Current trade price
     * @param mevData MEV protection data storage
     */
    function _updateBlockPriceData(
        uint256 price,
        MEVProtectionData storage mevData
    ) internal {
        
        // Update block price high/low
        if (mevData.blockPriceHigh[block.number] == 0 || price > mevData.blockPriceHigh[block.number]) {
            mevData.blockPriceHigh[block.number] = price;
        }
        
        if (mevData.blockPriceLow[block.number] == 0 || price < mevData.blockPriceLow[block.number]) {
            mevData.blockPriceLow[block.number] = price;
        }
        
        mevData.lastPriceUpdate = block.timestamp;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS FOR MONITORING
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Gets user spending status for whale protection
     * @param user User address
     * @param opinionId Opinion identifier  
     * @param whaleData Whale protection data storage
     * @return currentSpending User's current spending in opinion
     * @return spendingLimit Current spending limit for user
     * @return resetTime When spending limit resets
     */
    function getUserSpendingStatus(
        address user,
        uint256 opinionId,
        WhaleProtectionData storage whaleData
    ) external view returns (uint256 currentSpending, uint256 spendingLimit, uint256 resetTime) {
        
        currentSpending = whaleData.userSpending[user];
        spendingLimit = whaleData.maxUserSpending;
        resetTime = whaleData.userSpendingResetTime[user];
        
        return (currentSpending, spendingLimit, resetTime);
    }
    
    /**
     * @dev Gets trader verification status
     * @param user User address
     * @param sybilData Sybil detection data storage
     * @return isVerified Whether trader is verified authentic
     * @return walletAge Age of wallet in seconds
     * @return transactionCount Number of transactions
     */
    function getTraderVerificationStatus(
        address user,
        SybilDetectionData storage sybilData
    ) external view returns (bool isVerified, uint256 walletAge, uint32 transactionCount) {
        
        isVerified = sybilData.verifiedTraders[user];
        
        if (sybilData.walletFirstSeen[user] > 0) {
            walletAge = block.timestamp - sybilData.walletFirstSeen[user];
        } else {
            walletAge = 0;
        }
        
        transactionCount = sybilData.walletTransactionCount[user];
        
        return (isVerified, walletAge, transactionCount);
    }
    
    /**
     * @dev Gets MEV protection status for user
     * @param user User address  
     * @param mevData MEV protection data storage
     * @return lastTradeBlock Block of user's last trade
     * @return protectionLevel Current MEV protection level
     * @return canTradeThisBlock Whether user can trade in current block
     */
    function getMEVProtectionStatus(
        address user,
        MEVProtectionData storage mevData
    ) external view returns (uint256 lastTradeBlock, uint256 protectionLevel, bool canTradeThisBlock) {
        
        lastTradeBlock = mevData.lastTradeBlock[user];
        protectionLevel = mevData.protectionLevel;
        canTradeThisBlock = (lastTradeBlock != block.number);
        
        return (lastTradeBlock, protectionLevel, canTradeThisBlock);
    }
    
    /**
     * @dev Gets opinion manipulation protection summary
     * @param opinionId Opinion identifier
     * @param whaleData Whale protection data storage
     * @return totalVolume Total opinion volume
     * @return uniqueTraders Number of unique traders
     * @return maxUserSpending Current max spending per user
     * @return protectionLevel Overall protection level (0-100)
     */
    function getOpinionProtectionSummary(
        uint256 opinionId,
        WhaleProtectionData storage whaleData
    ) external view returns (
        uint256 totalVolume,
        uint32 uniqueTraders,
        uint256 maxUserSpending,
        uint256 protectionLevel
    ) {
        
        totalVolume = whaleData.totalOpinionVolume;
        uniqueTraders = whaleData.uniqueTraders;
        maxUserSpending = whaleData.maxUserSpending;
        
        // Calculate protection level based on trader diversity
        if (uniqueTraders >= MIN_DIVERSE_TRADERS) {
            protectionLevel = 85; // High protection with diverse traders
        } else if (uniqueTraders >= 2) {
            protectionLevel = 65; // Medium protection with some diversity
        } else {
            protectionLevel = 40; // Low protection with single trader dominance
        }
        
        return (totalVolume, uniqueTraders, maxUserSpending, protectionLevel);
    }
}