// interfaces/IValidationErrors.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IValidationErrors
 * @dev Comprehensive error definitions for input validation hardening
 * Provides specific, actionable error messages for debugging and security
 */
interface IValidationErrors {
    
    // === CORE VALIDATION ERRORS ===
    
    /**
     * @dev Thrown when market regime value is invalid
     * @param regime Invalid regime value provided
     */
    error InvalidMarketRegime(uint8 regime);
    
    /**
     * @dev Thrown when activity level value is invalid
     * @param level Invalid activity level provided
     */
    error InvalidActivityLevel(uint8 level);
    
    /**
     * @dev Thrown when MEV risk level value is invalid
     * @param riskLevel Invalid MEV risk level provided
     */
    error InvalidMevRiskLevel(uint8 riskLevel);
    
    /**
     * @dev Thrown when price value is outside allowed bounds
     * @param price Price value provided
     * @param min Minimum allowed price
     * @param max Maximum allowed price
     */
    error PriceOutOfBounds(uint256 price, uint256 min, uint256 max);
    
    /**
     * @dev Thrown when price movement is too extreme for regime
     * @param movement Price movement percentage
     * @param maxAllowed Maximum allowed movement for context
     */
    error PriceMovementTooExtreme(int256 movement, int256 maxAllowed);
    
    /**
     * @dev Thrown when activity data is corrupted or inconsistent
     * @param opinionId Opinion ID with corrupted data
     * @param reason Specific reason for corruption
     */
    error ActivityDataCorrupted(uint256 opinionId, string reason);
    
    /**
     * @dev Thrown when system state is inconsistent
     * @param component Component with inconsistency
     * @param reason Specific reason for inconsistency
     */
    error StateInconsistency(string component, string reason);
    
    /**
     * @dev Thrown when timestamp value is invalid
     * @param timestamp Invalid timestamp provided
     * @param current Current block timestamp
     */
    error TimestampInvalid(uint256 timestamp, uint256 current);
    
    /**
     * @dev Thrown when zero address is provided where not allowed
     * @param parameter Name of parameter that was zero
     */
    error AddressZeroNotAllowed(string parameter);
    
    /**
     * @dev Thrown when value would cause overflow
     * @param value Value that would overflow
     * @param max Maximum allowed value
     */
    error ValueOverflow(uint256 value, uint256 max);
    
    /**
     * @dev Thrown when value would cause underflow
     * @param value Value that would underflow
     * @param min Minimum allowed value
     */
    error ValueUnderflow(uint256 value, uint256 min);
    
    /**
     * @dev Thrown when gas limit is exceeded
     * @param gasUsed Gas actually used
     * @param limit Gas limit that was exceeded
     */
    error GasLimitExceeded(uint256 gasUsed, uint256 limit);
    
    /**
     * @dev Thrown when opinion state is corrupted
     * @param opinionId Opinion ID with corrupted state
     * @param details Specific details about corruption
     */
    error OpinionStateCorrupted(uint256 opinionId, string details);
    
    /**
     * @dev Thrown when user exceeds activity limits
     * @param user User address that exceeded limit
     * @param current Current activity count
     * @param max Maximum allowed activity
     */
    error UserLimitExceeded(address user, uint256 current, uint256 max);
    
    /**
     * @dev Thrown when string parameter is invalid
     * @param parameter Parameter name
     * @param reason Specific reason for invalidity
     */
    error InvalidStringParameter(string parameter, string reason);
    
    /**
     * @dev Thrown when array parameter is invalid
     * @param parameter Parameter name
     * @param length Array length provided
     * @param reason Specific reason for invalidity
     */
    error InvalidArrayParameter(string parameter, uint256 length, string reason);
    
    // === SECURITY-SPECIFIC ERRORS ===
    
    /**
     * @dev Thrown when potential manipulation attempt detected
     * @param user User attempting manipulation
     * @param attemptType Type of manipulation attempted
     * @param evidence Evidence of manipulation
     */
    error ManipulationAttemptDetected(address user, string attemptType, bytes evidence);
    
    /**
     * @dev Thrown when rate limit is exceeded
     * @param user User exceeding rate limit
     * @param action Action being rate limited
     * @param timeRemaining Time until rate limit resets
     */
    error RateLimitExceeded(address user, string action, uint256 timeRemaining);
    
    /**
     * @dev Thrown when system is in emergency mode
     * @param reason Reason for emergency mode
     * @param estimatedResolution Estimated time for resolution
     */
    error SystemInEmergencyMode(string reason, uint256 estimatedResolution);
    
    /**
     * @dev Thrown when operation would exceed system capacity
     * @param operation Operation being attempted
     * @param current Current system load
     * @param capacity Maximum system capacity
     */
    error SystemCapacityExceeded(string operation, uint256 current, uint256 capacity);
    
    // === MEV PROTECTION ERRORS ===
    
    /**
     * @dev Thrown when MEV protection blocks transaction
     * @param user User being blocked
     * @param riskLevel Current MEV risk level
     * @param reason Specific reason for blocking
     */
    error MevProtectionBlocked(address user, uint8 riskLevel, string reason);
    
    /**
     * @dev Thrown when coordination attack detected
     * @param primaryUser Primary user in coordination
     * @param coordinatedUsers Array of coordinated user addresses
     * @param confidence Detection confidence level (0-100)
     */
    error CoordinationAttackDetected(address primaryUser, address[] coordinatedUsers, uint8 confidence);
    
    /**
     * @dev Thrown when bot behavior detected
     * @param user User exhibiting bot behavior
     * @param patterns Array of detected patterns
     * @param severity Severity level (0-100)
     */
    error BotBehaviorDetected(address user, string[] patterns, uint8 severity);
    
    // === ACTIVITY VALIDATION ERRORS ===
    
    /**
     * @dev Thrown when activity gaming attempt detected
     * @param user User attempting to game activity
     * @param opinionId Opinion being gamed
     * @param evidence Evidence of gaming attempt
     */
    error ActivityGamingDetected(address user, uint256 opinionId, string evidence);
    
    /**
     * @dev Thrown when activity threshold manipulation detected
     * @param user User manipulating thresholds
     * @param targetThreshold Threshold being targeted
     * @param manipulation Type of manipulation
     */
    error ThresholdManipulationDetected(address user, string targetThreshold, string manipulation);
    
    /**
     * @dev Thrown when fake activity injection detected
     * @param source Source of fake activity
     * @param opinionId Opinion receiving fake activity
     * @param amount Amount of fake activity detected
     */
    error FakeActivityDetected(address source, uint256 opinionId, uint256 amount);
    
    // === EMERGENCY AND RECOVERY ERRORS ===
    
    /**
     * @dev Thrown when emergency shutdown is triggered
     * @param trigger What triggered the shutdown
     * @param severity Severity level (0-100)
     * @param adminAction Required admin action
     */
    error EmergencyShutdownError(string trigger, uint8 severity, string adminAction);
    
    /**
     * @dev Thrown when data corruption requires manual intervention
     * @param dataType Type of corrupted data
     * @param corruptionLevel Level of corruption (0-100)
     * @param recoverySteps Required recovery steps
     */
    error DataCorruptionError(string dataType, uint8 corruptionLevel, string recoverySteps);
    
    /**
     * @dev Thrown when system state requires admin recovery
     * @param component Component requiring recovery
     * @param issue Specific issue requiring intervention
     * @param urgency Urgency level (0-100)
     */
    error AdminRecoveryRequired(string component, string issue, uint8 urgency);
}