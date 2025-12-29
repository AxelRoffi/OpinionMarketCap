// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/PriceCalculator.sol";
import "../libraries/MevProtection.sol";

/**
 * @title ISecurityManager
 * @dev Interface for the SecurityManager contract
 */
interface ISecurityManager {
    // --- BOT DETECTION FUNCTIONS ---
    
    function analyzeTraderPattern(
        address trader,
        bool tradeSuccess,
        uint256 tradeValue
    ) external returns (PriceCalculator.BotPenaltyLevel);
    
    function applyBotPenalties(
        address trader,
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        uint256 baseReward
    ) external returns (uint256);
    
    function getTraderBotInfo(address trader) external view returns (
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        bool flaggedAsBot,
        uint32 totalTrades,
        uint32 successfulTrades,
        uint256 successRate,
        uint8 suspicionLevel
    );
    
    // --- MEV PROTECTION FUNCTIONS ---
    
    function analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId
    ) external returns (MevProtection.MevRiskLevel);
    
    function updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) external;
    
    function checkMevTradeBlocking(address user) external view returns (bool blocked, string memory reason);
    
    function calculateMevPenaltyMultiplier(address user, uint256 tradeValue) external view returns (uint256 penaltyMultiplier);
    
    function getUserMevProfile(address user) external view returns (MevProtection.MevProfile memory profile);
    
    // --- VALIDATION HARDENING FUNCTIONS ---
    
    function validateCreateOpinionInputs(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        address creator
    ) external view;
    
    function validateOpinionState(
        uint256 opinionId,
        bool exists,
        bool isActive,
        uint256 lastPrice,
        address owner
    ) external view;
    
    function recordValidationMetrics(string memory operation, uint256 gasUsed) external;
    
    // --- VIEW FUNCTIONS ---
    
    function getBotDetectionStatus() external view returns (
        bool enabled,
        uint256 startTime,
        uint256 totalFlaggedTraders
    );
    
    function getMevProtectionStats() external view returns (
        bool enabled,
        uint256 totalHighRiskUsers,
        uint256 totalBlockedUsers
    );
    
    function getValidationMetrics() external view returns (
        bool enabled,
        bool emergencyActive,
        uint256 totalValidations,
        uint256 averageGasCost
    );
    
    // --- ADMIN FUNCTIONS ---
    
    function setBotDetectionEnabled(bool enabled) external;
    function setEnhancedMevProtectionEnabled(bool enabled) external;
    function setValidationHardeningEnabled(bool enabled) external;
    function activateEmergencyMode(string calldata reason) external;
    function deactivateEmergencyMode() external;
}