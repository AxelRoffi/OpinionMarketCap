// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "./interfaces/IOpinionMarketEvents.sol";
import "./libraries/PriceCalculator.sol";
import "./libraries/MevProtection.sol";
import "./libraries/InputValidation.sol";

/**
 * @title SecurityManager
 * @dev Dedicated contract for bot detection, MEV protection, and security features
 * Extracted from OpinionCore to reduce contract size
 */
contract SecurityManager is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE");
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");

    // --- STATE VARIABLES ---
    
    // 🛡️ Bot detection and anti-bot protection
    mapping(address => PriceCalculator.TraderPattern) private traderPatterns;
    bool public botDetectionEnabled;
    uint256 public botDetectionStartTime;
    
    // 🔥 Enhanced MEV Protection
    mapping(address => MevProtection.MevProfile) private mevProfiles;
    bool public enhancedMevProtectionEnabled;
    
    // 🔒 Input Validation Hardening
    bool public validationHardeningEnabled;
    uint256 public emergencyModeTimestamp;
    mapping(bytes32 => uint256) private validationMetrics;
    
    // --- EVENTS ---
    event BotDetectionToggled(bool enabled, address admin);
    event EnhancedMevProtectionToggled(bool enabled, address admin);
    event ValidationHardeningToggled(bool enabled, address admin);
    event AdminTraderFlagged(address indexed trader, bool flagAsBot, uint8 suspicionLevel, address admin);
    event AdminTraderReset(address indexed trader, address admin);
    event AdminMevRiskAdjusted(address indexed trader, uint8 oldLevel, uint8 newLevel, string reason, address admin);
    event AdminMevProfileReset(address indexed trader, address admin);
    event EmergencyShutdownTriggered(string reason, uint8 severity, string action);
    event SystemRecovered(string message, address admin);
    event ValidationWarning(string operation, uint256 gasUsed, string warning);
    event DataCorruptionDetected(string dataType, uint8 severity, string action);
    
    // --- INITIALIZATION ---
    function initialize(
        address _opinionCore,
        address _usdcToken,
        address _treasury
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Grant role to opinion core to call security functions
        if (_opinionCore != address(0)) {
            _grantRole(CORE_CONTRACT_ROLE, _opinionCore);
        }
        
        // Initialize security features (disabled by default for gas efficiency)
        botDetectionEnabled = false;
        enhancedMevProtectionEnabled = false;
        validationHardeningEnabled = false;
    }
    
    // --- MODIFIERS ---
    modifier onlyCoreContract() {
        require(hasRole(CORE_CONTRACT_ROLE, msg.sender), "Only core contract");
        _;
    }
    
    modifier onlyMarketContract() {
        require(hasRole(MARKET_CONTRACT_ROLE, msg.sender), "Only market contract");
        _;
    }
    
    // --- BOT DETECTION FUNCTIONS ---
    
    /**
     * @dev Analyzes trader patterns for bot behavior detection
     * @param trader Trader address to analyze
     * @param tradeSuccess Whether the current trade was profitable
     * @param tradeValue Value of the current trade
     * @return Current bot penalty level for the trader
     */
    function analyzeTraderPattern(
        address trader,
        bool tradeSuccess,
        uint256 tradeValue
    ) external onlyCoreContract returns (PriceCalculator.BotPenaltyLevel) {
        if (!botDetectionEnabled) {
            return PriceCalculator.BotPenaltyLevel.NONE;
        }
        
        return PriceCalculator.analyzeTraderPattern(
            trader,
            tradeSuccess,
            tradeValue,
            traderPatterns
        );
    }
    
    /**
     * @dev Applies progressive penalties based on bot detection level
     * @param trader Trader address
     * @param penaltyLevel Current penalty level
     * @param baseReward Original reward/benefit amount
     * @return Adjusted reward after penalties
     */
    function applyBotPenalties(
        address trader,
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        uint256 baseReward
    ) external onlyCoreContract returns (uint256) {
        if (!botDetectionEnabled) {
            return baseReward;
        }
        
        return PriceCalculator.applyBotPenalties(trader, penaltyLevel, baseReward);
    }
    
    /**
     * @dev Gets trader bot detection status and statistics
     * @param trader Trader address to query
     * @return penaltyLevel Current penalty level
     * @return flaggedAsBot Whether trader is flagged as bot
     * @return totalTrades Total trades by trader
     * @return successfulTrades Successful trades count
     * @return successRate Success rate percentage
     * @return suspicionLevel Current suspicion level (0-4)
     */
    function getTraderBotInfo(address trader) external view returns (
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        bool flaggedAsBot,
        uint32 totalTrades,
        uint32 successfulTrades,
        uint256 successRate,
        uint8 suspicionLevel
    ) {
        (penaltyLevel, flaggedAsBot) = PriceCalculator.getTraderBotStatus(trader, traderPatterns);
        (totalTrades, successfulTrades, successRate, suspicionLevel) = PriceCalculator.getTraderStats(trader, traderPatterns);
    }
    
    // --- MEV PROTECTION FUNCTIONS ---
    
    /**
     * @dev Analyzes MEV risk for a trade
     * @param user User address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @return Current MEV risk level
     */
    function analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId
    ) external onlyCoreContract returns (MevProtection.MevRiskLevel) {
        if (!enhancedMevProtectionEnabled) {
            return MevProtection.MevRiskLevel.NONE;
        }
        
        return MevProtection.analyzeMevRisk(user, tradeValue, opinionId, mevProfiles);
    }
    
    /**
     * @dev Updates MEV profile after successful trade
     * @param user User address
     * @param opinionId Opinion traded
     * @param tradeValue Trade value
     */
    function updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) external onlyCoreContract {
        if (!enhancedMevProtectionEnabled) {
            return;
        }
        
        MevProtection.updateMevProfile(user, opinionId, tradeValue, mevProfiles);
    }
    
    /**
     * @dev Checks if user should be blocked from trading due to MEV risk
     * @param user User address
     * @return blocked Whether user is currently blocked
     * @return reason Human-readable reason for blocking
     */
    function checkMevTradeBlocking(address user) external view returns (bool blocked, string memory reason) {
        if (!enhancedMevProtectionEnabled) {
            return (false, "Enhanced MEV protection disabled");
        }
        
        blocked = MevProtection.shouldBlockTrading(user, mevProfiles);
        
        if (blocked) {
            MevProtection.MevProfile memory profile = MevProtection.getMevProfile(user, mevProfiles);
            if (profile.riskLevel >= uint8(MevProtection.MevRiskLevel.BLOCKED)) {
                reason = "User blocked due to critical MEV risk";
            } else if (MevProtection.isInMevCooldown(user, mevProfiles)) {
                reason = "User in MEV cooldown period";
            } else {
                reason = "MEV trade limit exceeded for current block";
            }
        } else {
            reason = "Trading allowed";
        }
    }
    
    /**
     * @dev Calculates MEV penalty for a trade
     * @param user User address
     * @param tradeValue Trade value
     * @return penaltyMultiplier Penalty multiplier (100 = no penalty, 150 = 50% penalty)
     */
    function calculateMevPenaltyMultiplier(address user, uint256 tradeValue) external view returns (uint256 penaltyMultiplier) {
        if (!enhancedMevProtectionEnabled) {
            return 100; // No penalty if protection disabled
        }
        
        return MevProtection.calculateMevPenalty(user, tradeValue, mevProfiles);
    }
    
    /**
     * @dev Gets user's MEV protection profile and risk assessment
     * @param user User address to query
     * @return profile Complete MEV profile data
     */
    function getUserMevProfile(address user) external view returns (MevProtection.MevProfile memory profile) {
        return MevProtection.getMevProfile(user, mevProfiles);
    }
    
    // --- VALIDATION HARDENING FUNCTIONS ---
    
    /**
     * @dev Validates opinion creation inputs with enhanced security
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description
     * @param initialPrice The initial price chosen by creator
     * @param opinionCategories Categories for the opinion
     * @param creator Creator address
     */
    function validateCreateOpinionInputs(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        address creator
    ) external view onlyCoreContract {
        if (!validationHardeningEnabled) return;
        
        // Validate strings
        InputValidation.validateString(question, 52, false, "question");
        InputValidation.validateString(answer, 52, false, "answer");
        InputValidation.validateString(description, 500, true, "description");
        
        // Validate price
        InputValidation.validatePrice(initialPrice, 2_000_000, 100_000_000); // 2-100 USDC
        
        // Validate categories array
        InputValidation.validateArray(opinionCategories.length, 1, 3, "opinionCategories");
        
        // Validate user
        InputValidation.validateAddress(creator, "creator");
        
        // Check user limits
        InputValidation.validateUserLimits(creator, 0, 10, "daily_opinion_creation");
    }
    
    /**
     * @dev Validates opinion state for security checks
     * @param opinionId Opinion identifier
     * @param exists Whether opinion exists
     * @param isActive Whether opinion is active
     * @param lastPrice Last price
     * @param owner Current owner
     */
    function validateOpinionState(
        uint256 opinionId,
        bool exists,
        bool isActive,
        uint256 lastPrice,
        address owner
    ) external view onlyCoreContract {
        if (!validationHardeningEnabled) return;
        
        InputValidation.validateOpinionState(opinionId, exists, isActive, lastPrice, owner);
    }
    
    /**
     * @dev Records validation performance metrics
     * @param operation Operation identifier
     * @param gasUsed Gas consumed
     */
    function recordValidationMetrics(string memory operation, uint256 gasUsed) external onlyCoreContract {
        if (!validationHardeningEnabled) return;
        
        bytes32 totalKey = keccak256("totalValidations");
        bytes32 gasKey = keccak256("totalGasCost");
        
        validationMetrics[totalKey]++;
        validationMetrics[gasKey] += gasUsed;
        
        // Emit gas usage warning if excessive
        if (gasUsed > 50000) {
            emit ValidationWarning(operation, gasUsed, "High gas usage detected");
        }
    }
    
    // --- ADMIN FUNCTIONS ---
    
    /**
     * @dev Enables or disables bot detection system
     * @param enabled Whether to enable bot detection
     */
    function setBotDetectionEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        botDetectionEnabled = enabled;
        if (enabled && botDetectionStartTime == 0) {
            botDetectionStartTime = block.timestamp;
        }
        emit BotDetectionToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Enables or disables enhanced MEV protection system
     * @param enabled Whether to enable enhanced MEV protection
     */
    function setEnhancedMevProtectionEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        enhancedMevProtectionEnabled = enabled;
        emit EnhancedMevProtectionToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Enables or disables validation hardening system
     * @param enabled Whether to enable validation hardening
     */
    function setValidationHardeningEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        validationHardeningEnabled = enabled;
        emit ValidationHardeningToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Emergency admin function to manually flag/unflag a trader as bot
     * @param trader Trader address
     * @param flagAsBot Whether to flag as bot
     * @param suspicionLevel Manual suspicion level (0-4)
     */
    function adminFlagTrader(
        address trader,
        bool flagAsBot,
        uint8 suspicionLevel
    ) external onlyRole(ADMIN_ROLE) {
        require(suspicionLevel <= 4, "Invalid suspicion level");
        
        PriceCalculator.TraderPattern storage pattern = traderPatterns[trader];
        pattern.flaggedAsBot = flagAsBot;
        pattern.suspicionLevel = suspicionLevel;
        
        emit AdminTraderFlagged(trader, flagAsBot, suspicionLevel, msg.sender);
    }
    
    /**
     * @dev Emergency admin function to reset trader bot detection data
     * @param trader Trader address
     */
    function adminResetTraderData(address trader) external onlyRole(ADMIN_ROLE) {
        delete traderPatterns[trader];
        emit AdminTraderReset(trader, msg.sender);
    }
    
    /**
     * @dev Admin function to manually adjust user's MEV risk level
     * @param user User address
     * @param newRiskLevel New risk level (0-5)
     * @param reason Reason for manual adjustment
     */
    function adminSetMevRiskLevel(
        address user,
        uint8 newRiskLevel,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        require(newRiskLevel <= uint8(MevProtection.MevRiskLevel.BLOCKED), "Invalid risk level");
        
        MevProtection.MevProfile storage profile = mevProfiles[user];
        uint8 oldLevel = profile.riskLevel;
        profile.riskLevel = newRiskLevel;
        
        emit AdminMevRiskAdjusted(user, oldLevel, newRiskLevel, reason, msg.sender);
    }
    
    /**
     * @dev Admin function to reset user's MEV protection data
     * @param user User address
     */
    function adminResetMevProfile(address user) external onlyRole(ADMIN_ROLE) {
        delete mevProfiles[user];
        emit AdminMevProfileReset(user, msg.sender);
    }
    
    /**
     * @dev Emergency function to activate system protection mode
     * @param reason Reason for emergency activation
     */
    function activateEmergencyMode(string calldata reason) external onlyRole(ADMIN_ROLE) {
        emergencyModeTimestamp = block.timestamp;
        emit EmergencyShutdownTriggered(reason, 50, "Admin review required");
    }
    
    /**
     * @dev Deactivates emergency protection mode
     */
    function deactivateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        emergencyModeTimestamp = 0;
        emit SystemRecovered("Emergency mode deactivated", msg.sender);
    }
    
    // --- VIEW FUNCTIONS ---
    
    /**
     * @dev Gets bot detection system status
     * @return enabled Whether bot detection is enabled
     * @return startTime When bot detection was first enabled
     * @return totalFlaggedTraders Count of flagged traders
     */
    function getBotDetectionStatus() external view returns (
        bool enabled,
        uint256 startTime,
        uint256 totalFlaggedTraders
    ) {
        enabled = botDetectionEnabled;
        startTime = botDetectionStartTime;
        // Note: totalFlaggedTraders would require additional tracking mapping
        totalFlaggedTraders = 0; // Placeholder - would need enumeration
    }
    
    /**
     * @dev Gets MEV protection system statistics
     * @return enabled Whether enhanced MEV protection is enabled
     * @return totalHighRiskUsers Count of users with HIGH+ risk level
     * @return totalBlockedUsers Count of currently blocked users
     */
    function getMevProtectionStats() external view returns (
        bool enabled,
        uint256 totalHighRiskUsers,
        uint256 totalBlockedUsers
    ) {
        enabled = enhancedMevProtectionEnabled;
        // Note: These counts would require additional enumeration tracking for efficiency
        totalHighRiskUsers = 0; // Placeholder - would need enumeration
        totalBlockedUsers = 0; // Placeholder - would need enumeration
    }
    
    /**
     * @dev Gets validation system metrics
     * @return enabled Whether validation hardening is enabled
     * @return emergencyActive Whether emergency mode is active
     * @return totalValidations Total validation operations performed
     * @return averageGasCost Average gas cost for validation
     */
    function getValidationMetrics() external view returns (
        bool enabled,
        bool emergencyActive,
        uint256 totalValidations,
        uint256 averageGasCost
    ) {
        enabled = validationHardeningEnabled;
        emergencyActive = emergencyModeTimestamp > 0 && (block.timestamp - emergencyModeTimestamp < 3600);
        totalValidations = validationMetrics[keccak256("totalValidations")];
        
        uint256 totalGas = validationMetrics[keccak256("totalGasCost")];
        averageGasCost = totalValidations > 0 ? totalGas / totalValidations : 0;
    }
    
    // --- ROLE MANAGEMENT ---
    
    /**
     * @dev Grants CORE_CONTRACT_ROLE to a contract
     * @param contractAddress Address to grant role to
     */
    function grantCoreContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        require(contractAddress != address(0), "Zero address not allowed");
        _grantRole(CORE_CONTRACT_ROLE, contractAddress);
    }
    
    /**
     * @dev Grants MARKET_CONTRACT_ROLE to a contract
     * @param contractAddress Address to grant role to
     */
    function grantMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        require(contractAddress != address(0), "Zero address not allowed");
        _grantRole(MARKET_CONTRACT_ROLE, contractAddress);
    }
    
    /**
     * @dev Revokes CORE_CONTRACT_ROLE from a contract
     * @param contractAddress Address to revoke role from
     */
    function revokeCoreContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        _revokeRole(CORE_CONTRACT_ROLE, contractAddress);
    }
    
    /**
     * @dev Revokes MARKET_CONTRACT_ROLE from a contract
     * @param contractAddress Address to revoke role from
     */
    function revokeMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MARKET_CONTRACT_ROLE, contractAddress);
    }
    
    // --- EMERGENCY FUNCTIONS ---
    
    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}