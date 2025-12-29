// libraries/InputValidation.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PriceCalculator.sol";
import "./MevProtection.sol";

/**
 * @title InputValidation
 * @dev Comprehensive input validation and hardening for sophisticated OpinionMarket system
 * Protects against malicious inputs, edge cases, and state corruption attacks
 */
library InputValidation {
    
    // === VALIDATION ERROR DEFINITIONS ===
    
    error InvalidMarketRegime(uint8 regime);
    error InvalidActivityLevel(uint8 level);
    error InvalidMevRiskLevel(uint8 riskLevel);
    error PriceOutOfBounds(uint256 price, uint256 min, uint256 max);
    error PriceMovementTooExtreme(int256 movement, int256 maxAllowed);
    error ActivityDataCorrupted(uint256 opinionId, string reason);
    error StateInconsistency(string component, string reason);
    error TimestampInvalid(uint256 timestamp, uint256 current);
    error AddressZeroNotAllowed(string parameter);
    error ValueOverflow(uint256 value, uint256 max);
    error ValueUnderflow(uint256 value, uint256 min);
    error GasLimitExceeded(uint256 gasUsed, uint256 limit);
    error OpinionStateCorrupted(uint256 opinionId, string details);
    error UserLimitExceeded(address user, uint256 current, uint256 max);
    error InvalidStringParameter(string parameter, string reason);
    error InvalidArrayParameter(string parameter, uint256 length, string reason);
    
    // === VALIDATION CONSTANTS ===
    
    uint256 private constant MAX_PRICE = 1000000e6;           // $1M USDC maximum price
    uint256 private constant MIN_PRICE = 1e6;                 // $1 USDC minimum price
    uint256 private constant MAX_PRICE_MOVEMENT = 200;        // 200% maximum price movement
    uint256 private constant MAX_ACTIVITY_COUNT = 10000;      // Maximum activity transactions
    uint256 private constant MAX_TIMESTAMP_DRIFT = 86400;     // 24h timestamp drift allowance
    uint256 private constant MAX_GAS_FOR_VALIDATION = 50000;  // 50k gas limit for validation
    uint256 private constant MAX_USER_DAILY_LIMIT = 1000;     // 1000 transactions per user per day
    uint256 private constant MAX_STRING_LENGTH = 1000;        // Maximum string length
    uint256 private constant MAX_ARRAY_LENGTH = 100;          // Maximum array length
    
    // === CORE INPUT VALIDATION FUNCTIONS ===
    
    /**
     * @dev Validates market regime enum value
     * @param regime Market regime value to validate
     */
    function validateMarketRegime(uint8 regime) external pure {
        if (regime > uint8(PriceCalculator.MarketRegime.PARABOLIC)) {
            revert InvalidMarketRegime(regime);
        }
    }
    
    /**
     * @dev Validates activity level enum value
     * @param level Activity level value to validate
     */
    function validateActivityLevel(uint8 level) external pure {
        if (level > uint8(PriceCalculator.ActivityLevel.HOT)) {
            revert InvalidActivityLevel(level);
        }
    }
    
    /**
     * @dev Validates MEV risk level enum value
     * @param riskLevel MEV risk level value to validate
     */
    function validateMevRiskLevel(uint8 riskLevel) external pure {
        if (riskLevel > uint8(MevProtection.MevRiskLevel.BLOCKED)) {
            revert InvalidMevRiskLevel(riskLevel);
        }
    }
    
    /**
     * @dev Validates price value against system bounds
     * @param price Price value to validate
     * @param minPrice Minimum allowed price (context-specific)
     * @param maxPrice Maximum allowed price (context-specific)
     */
    function validatePrice(uint256 price, uint256 minPrice, uint256 maxPrice) external pure {
        // System-wide bounds
        if (price < MIN_PRICE || price > MAX_PRICE) {
            revert PriceOutOfBounds(price, MIN_PRICE, MAX_PRICE);
        }
        
        // Context-specific bounds
        if (price < minPrice || price > maxPrice) {
            revert PriceOutOfBounds(price, minPrice, maxPrice);
        }
    }
    
    /**
     * @dev Validates price movement percentage
     * @param movement Price movement percentage (signed)
     * @param regime Current market regime for context validation
     */
    function validatePriceMovement(int256 movement, PriceCalculator.MarketRegime regime) external pure {
        int256 maxMovement = int256(MAX_PRICE_MOVEMENT);
        
        // System-wide movement bounds
        if (movement < -maxMovement || movement > maxMovement) {
            revert PriceMovementTooExtreme(movement, maxMovement);
        }
        
        // Regime-specific validation
        if (regime == PriceCalculator.MarketRegime.CONSOLIDATION) {
            // Consolidation should be limited to ±15%
            if (movement < -15 || movement > 15) {
                revert PriceMovementTooExtreme(movement, 15);
            }
        } else if (regime == PriceCalculator.MarketRegime.MILD_CORRECTION) {
            // Mild correction should be limited to -25% to +10%
            if (movement < -25 || movement > 10) {
                revert PriceMovementTooExtreme(movement, 25);
            }
        } else if (regime == PriceCalculator.MarketRegime.PARABOLIC) {
            // Parabolic should be limited to +80% (anti-bot protection)
            if (movement < 0 || movement > 80) {
                revert PriceMovementTooExtreme(movement, 80);
            }
        }
    }
    
    /**
     * @dev Validates address parameter
     * @param addr Address to validate
     * @param parameterName Name of parameter for error context
     */
    function validateAddress(address addr, string memory parameterName) external pure {
        if (addr == address(0)) {
            revert AddressZeroNotAllowed(parameterName);
        }
    }
    
    /**
     * @dev Validates timestamp value
     * @param timestamp Timestamp to validate
     * @param allowFuture Whether future timestamps are allowed
     */
    function validateTimestamp(uint256 timestamp, bool allowFuture) external view {
        if (timestamp == 0) {
            revert TimestampInvalid(timestamp, block.timestamp);
        }
        
        if (!allowFuture && timestamp > block.timestamp) {
            revert TimestampInvalid(timestamp, block.timestamp);
        }
        
        // Check for reasonable bounds (not too far in past)
        if (timestamp < block.timestamp - (365 * 24 * 3600)) { // 1 year in past
            revert TimestampInvalid(timestamp, block.timestamp);
        }
        
        // Check for reasonable future bounds
        if (allowFuture && timestamp > block.timestamp + MAX_TIMESTAMP_DRIFT) {
            revert TimestampInvalid(timestamp, block.timestamp);
        }
    }
    
    /**
     * @dev Validates value against overflow/underflow
     * @param value Value to validate
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     * @param parameterName Parameter name for error context
     */
    function validateValueBounds(
        uint256 value,
        uint256 minValue,
        uint256 maxValue,
        string memory parameterName
    ) external pure {
        if (value < minValue) {
            revert ValueUnderflow(value, minValue);
        }
        
        if (value > maxValue) {
            revert ValueOverflow(value, maxValue);
        }
    }
    
    /**
     * @dev Validates string parameter
     * @param str String to validate
     * @param maxLength Maximum allowed length
     * @param allowEmpty Whether empty strings are allowed
     * @param parameterName Parameter name for error context
     */
    function validateString(
        string memory str,
        uint256 maxLength,
        bool allowEmpty,
        string memory parameterName
    ) external pure {
        bytes memory strBytes = bytes(str);
        
        if (!allowEmpty && strBytes.length == 0) {
            revert InvalidStringParameter(parameterName, "Empty string not allowed");
        }
        
        if (strBytes.length > maxLength) {
            revert InvalidStringParameter(parameterName, "String too long");
        }
        
        if (strBytes.length > MAX_STRING_LENGTH) {
            revert InvalidStringParameter(parameterName, "String exceeds system limit");
        }
    }
    
    /**
     * @dev Validates array parameter
     * @param arrayLength Length of array to validate
     * @param minLength Minimum required length
     * @param maxLength Maximum allowed length
     * @param parameterName Parameter name for error context
     */
    function validateArray(
        uint256 arrayLength,
        uint256 minLength,
        uint256 maxLength,
        string memory parameterName
    ) external pure {
        if (arrayLength < minLength) {
            revert InvalidArrayParameter(parameterName, arrayLength, "Array too short");
        }
        
        if (arrayLength > maxLength) {
            revert InvalidArrayParameter(parameterName, arrayLength, "Array too long");
        }
        
        if (arrayLength > MAX_ARRAY_LENGTH) {
            revert InvalidArrayParameter(parameterName, arrayLength, "Array exceeds system limit");
        }
    }
    
    // === ACTIVITY VALIDATION FUNCTIONS ===
    
    /**
     * @dev Validates activity data integrity
     * @param opinionId Opinion ID for context
     * @param eligibleTransactions Number of eligible transactions
     * @param uniqueUsers Number of unique users
     * @param totalUsers Total user count
     * @param lastReset Last reset timestamp
     */
    function validateActivityData(
        uint256 opinionId,
        uint32 eligibleTransactions,
        uint32 uniqueUsers,
        uint32 totalUsers,
        uint256 lastReset
    ) external view {
        // Basic bounds validation
        if (eligibleTransactions > MAX_ACTIVITY_COUNT) {
            revert ActivityDataCorrupted(opinionId, "Eligible transactions exceeds maximum");
        }
        
        // Logical consistency validation
        if (uniqueUsers > eligibleTransactions) {
            revert ActivityDataCorrupted(opinionId, "Unique users cannot exceed eligible transactions");
        }
        
        if (uniqueUsers > totalUsers) {
            revert ActivityDataCorrupted(opinionId, "Unique users cannot exceed total users");
        }
        
        // Timestamp validation
        if (lastReset > block.timestamp) {
            revert ActivityDataCorrupted(opinionId, "Last reset timestamp is in future");
        }
        
        // Reasonable bounds check
        if (lastReset > 0 && block.timestamp - lastReset > 7 * 24 * 3600) { // 7 days
            revert ActivityDataCorrupted(opinionId, "Last reset timestamp too old");
        }
    }
    
    /**
     * @dev Validates user activity limits
     * @param user User address
     * @param currentCount Current user activity count
     * @param dailyLimit Daily limit for user
     * @param activityType Type of activity for error context
     */
    function validateUserLimits(
        address user,
        uint256 currentCount,
        uint256 dailyLimit,
        string memory activityType
    ) external pure {
        if (user == address(0)) {
            revert AddressZeroNotAllowed("user");
        }
        
        if (currentCount >= dailyLimit) {
            revert UserLimitExceeded(user, currentCount, dailyLimit);
        }
        
        if (dailyLimit > MAX_USER_DAILY_LIMIT) {
            revert ValueOverflow(dailyLimit, MAX_USER_DAILY_LIMIT);
        }
    }
    
    // === STATE CONSISTENCY VALIDATION ===
    
    /**
     * @dev Validates market state consistency
     * @param regime Current market regime
     * @param activityLevel Current activity level
     * @param priceMovement Calculated price movement
     * @param currentPrice Current price
     */
    function validateMarketStateConsistency(
        PriceCalculator.MarketRegime regime,
        PriceCalculator.ActivityLevel activityLevel,
        int256 priceMovement,
        uint256 currentPrice
    ) external pure {
        // Validate individual components
        if (uint8(regime) > uint8(PriceCalculator.MarketRegime.PARABOLIC)) {
            revert InvalidMarketRegime(uint8(regime));
        }
        if (uint8(activityLevel) > uint8(PriceCalculator.ActivityLevel.HOT)) {
            revert InvalidActivityLevel(uint8(activityLevel));
        }
        
        // Validate price movement
        int256 maxMovement = int256(MAX_PRICE_MOVEMENT);
        if (priceMovement < -maxMovement || priceMovement > maxMovement) {
            revert PriceMovementTooExtreme(priceMovement, maxMovement);
        }
        
        // Cross-validate regime and activity level consistency
        if (activityLevel == PriceCalculator.ActivityLevel.HOT) {
            // Hot activity should favor more volatile regimes
            if (regime == PriceCalculator.MarketRegime.CONSOLIDATION && priceMovement > 10) {
                revert StateInconsistency("market_regime", "Consolidation with high movement on hot activity");
            }
        }
        
        if (activityLevel == PriceCalculator.ActivityLevel.COLD) {
            // Cold activity should favor stable regimes
            if (regime == PriceCalculator.MarketRegime.PARABOLIC) {
                revert StateInconsistency("market_regime", "Parabolic regime on cold activity");
            }
        }
        
        // Validate price movement makes sense for current price
        if (currentPrice > 0) {
            uint256 maxChange = (currentPrice * uint256(int256(MAX_PRICE_MOVEMENT))) / 100;
            if (priceMovement > 0) {
                uint256 increase = (currentPrice * uint256(priceMovement)) / 100;
                if (currentPrice + increase > MAX_PRICE) {
                    revert StateInconsistency("price_bounds", "Price movement would exceed maximum price");
                }
            }
        }
    }
    
    /**
     * @dev Validates MEV protection state consistency
     * @param user User address
     * @param riskLevel MEV risk level
     * @param penalties Applied penalties
     * @param tradeValue Trade value
     */
    function validateMevStateConsistency(
        address user,
        MevProtection.MevRiskLevel riskLevel,
        uint256 penalties,
        uint256 tradeValue
    ) external pure {
        if (user == address(0)) {
            revert AddressZeroNotAllowed("user");
        }
        if (uint8(riskLevel) > uint8(MevProtection.MevRiskLevel.BLOCKED)) {
            revert InvalidMevRiskLevel(uint8(riskLevel));
        }
        
        // Validate penalty consistency with risk level
        if (riskLevel == MevProtection.MevRiskLevel.NONE && penalties > 0) {
            revert StateInconsistency("mev_penalties", "Penalties applied with no risk level");
        }
        
        if (riskLevel == MevProtection.MevRiskLevel.BLOCKED && penalties < 50) {
            revert StateInconsistency("mev_penalties", "Insufficient penalties for blocked user");
        }
        
        // Validate trade value consistency with risk level
        if (riskLevel >= MevProtection.MevRiskLevel.HIGH && tradeValue > 100000e6) { // $100k
            revert StateInconsistency("mev_trade_value", "Large trade value with high MEV risk");
        }
    }
    
    // === EDGE CASE PROTECTION ===
    
    /**
     * @dev Protects against arithmetic overflow in calculations
     * @param a First operand
     * @param b Second operand
     * @param operation Operation type ("add", "mul", "sub")
     * @return result Safe calculation result
     */
    function safeArithmetic(
        uint256 a,
        uint256 b,
        string memory operation
    ) external pure returns (uint256 result) {
        if (keccak256(bytes(operation)) == keccak256(bytes("add"))) {
            if (a > type(uint256).max - b) {
                revert ValueOverflow(a + b, type(uint256).max);
            }
            return a + b;
        } else if (keccak256(bytes(operation)) == keccak256(bytes("mul"))) {
            if (a != 0 && b > type(uint256).max / a) {
                revert ValueOverflow(a * b, type(uint256).max);
            }
            return a * b;
        } else if (keccak256(bytes(operation)) == keccak256(bytes("sub"))) {
            if (a < b) {
                revert ValueUnderflow(a - b, 0);
            }
            return a - b;
        } else {
            revert InvalidStringParameter("operation", "Unknown arithmetic operation");
        }
    }
    
    /**
     * @dev Validates gas usage to prevent gas limit attacks
     * @param startGas Gas at start of operation
     * @return gasUsed Gas consumed
     */
    function validateGasUsage(uint256 startGas) external view returns (uint256 gasUsed) {
        gasUsed = startGas - gasleft();
        
        if (gasUsed > MAX_GAS_FOR_VALIDATION) {
            revert GasLimitExceeded(gasUsed, MAX_GAS_FOR_VALIDATION);
        }
        
        return gasUsed;
    }
    
    /**
     * @dev Comprehensive opinion state validation
     * @param opinionId Opinion ID
     * @param exists Whether opinion exists
     * @param isActive Whether opinion is active
     * @param currentPrice Current opinion price
     * @param owner Current owner address
     */
    function validateOpinionState(
        uint256 opinionId,
        bool exists,
        bool isActive,
        uint256 currentPrice,
        address owner
    ) external view {
        if (!exists) {
            revert OpinionStateCorrupted(opinionId, "Opinion does not exist");
        }
        
        if (!isActive) {
            revert OpinionStateCorrupted(opinionId, "Opinion is not active");
        }
        
        if (currentPrice < MIN_PRICE || currentPrice > MAX_PRICE) {
            revert PriceOutOfBounds(currentPrice, MIN_PRICE, MAX_PRICE);
        }
        if (owner == address(0)) {
            revert AddressZeroNotAllowed("opinion_owner");
        }
        
        if (opinionId == 0) {
            revert OpinionStateCorrupted(opinionId, "Invalid opinion ID");
        }
    }
    
    // === BATCH VALIDATION FUNCTIONS ===
    
    /**
     * @dev Validates multiple parameters in a single call (gas-efficient)
     * @param addresses Array of addresses to validate
     * @param values Array of values to validate
     * @param timestamps Array of timestamps to validate
     * @param allowFutureTimestamps Whether future timestamps are allowed
     */
    function batchValidate(
        address[] memory addresses,
        uint256[] memory values,
        uint256[] memory timestamps,
        bool allowFutureTimestamps
    ) external view {
        uint256 startGas = gasleft();
        
        // Validate array lengths consistency
        if (addresses.length != values.length || values.length != timestamps.length) {
            revert InvalidArrayParameter("batch_parameters", addresses.length, "Inconsistent array lengths");
        }
        
        if (addresses.length < 1 || addresses.length > 50) {
            revert InvalidArrayParameter("batch_addresses", addresses.length, "Invalid array length");
        }
        
        // Validate each parameter
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == address(0)) {
                revert AddressZeroNotAllowed("batch_address");
            }
            if (values[i] > MAX_PRICE) {
                revert ValueOverflow(values[i], MAX_PRICE);
            }
            // Simplified timestamp validation
            if (timestamps[i] == 0 || (!allowFutureTimestamps && timestamps[i] > block.timestamp)) {
                revert TimestampInvalid(timestamps[i], block.timestamp);
            }
        }
        
        // Check gas usage
        uint256 gasUsed = startGas - gasleft();
        if (gasUsed > MAX_GAS_FOR_VALIDATION) {
            revert GasLimitExceeded(gasUsed, MAX_GAS_FOR_VALIDATION);
        }
    }
    
    // === VIEW FUNCTIONS FOR DIAGNOSTICS ===
    
    /**
     * @dev Gets validation constants for external reference
     * @return maxPrice Maximum allowed price
     * @return minPrice Minimum allowed price
     * @return maxMovement Maximum price movement percentage
     * @return maxActivity Maximum activity count
     */
    function getValidationConstants() external pure returns (
        uint256 maxPrice,
        uint256 minPrice,
        uint256 maxMovement,
        uint256 maxActivity
    ) {
        return (MAX_PRICE, MIN_PRICE, MAX_PRICE_MOVEMENT, MAX_ACTIVITY_COUNT);
    }
    
    /**
     * @dev Checks if value is within safe bounds (view function)
     * @param value Value to check
     * @param min Minimum bound
     * @param max Maximum bound
     * @return isValid Whether value is within bounds
     * @return reason Reason if invalid
     */
    function checkValueBounds(
        uint256 value,
        uint256 min,
        uint256 max
    ) external pure returns (bool isValid, string memory reason) {
        if (value < min) {
            return (false, "Value below minimum");
        }
        if (value > max) {
            return (false, "Value above maximum");
        }
        return (true, "Valid");
    }
}