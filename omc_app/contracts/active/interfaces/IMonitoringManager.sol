// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../libraries/MonitoringLibrary.sol";

/**
 * @title IMonitoringManager
 * @dev Interface for the MonitoringManager contract
 */
interface IMonitoringManager {
    // --- CORE MONITORING FUNCTIONS ---
    
    function trackOpinionCreation(
        uint256 opinionId,
        address creator,
        uint256 initialPrice
    ) external;
    
    function trackTradingActivity(
        uint256 opinionId,
        address trader,
        uint256 tradeValue,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 platformFee
    ) external;
    
    function trackRegimeChange(
        uint256 opinionId,
        uint8 newLevel,
        uint256 totalVolume
    ) external;
    
    function trackGasUsage(
        bytes32 operation,
        uint256 gasUsed,
        uint256 gasLimit
    ) external;
    
    // --- VIEW FUNCTIONS ---
    
    function getMonitoringStats() external view returns (
        bool enabled,
        uint256 todayRevenue,
        uint256 lastHealthTime
    );
    
    function getMarketRegimeInfo(uint256 opinionId) external view returns (
        uint8 currentLevel,
        uint256 lastChange,
        uint32 changeCount
    );
    
    function getDailyRevenue(uint8 source) external view returns (uint256 revenue);
    
    // --- ADMIN FUNCTIONS ---
    
    function setEnhancedMonitoringEnabled(bool enabled) external;
    
    function performHealthCheck() external returns (uint8 healthScore, uint32 activeUsers, uint8 processingLoad);
}