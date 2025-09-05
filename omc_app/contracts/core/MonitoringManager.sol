// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IEnhancedMonitoring.sol";
import "./libraries/MonitoringLibrary.sol";

/**
 * @title MonitoringManager
 * @dev Dedicated contract for analytics, monitoring and dashboard management
 * Extracted from OpinionCore to reduce contract size
 */
contract MonitoringManager is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IEnhancedMonitoring
{
    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE");
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");

    // --- STATE VARIABLES ---
    bool public enhancedMonitoringEnabled;
    uint256 public lastHealthCheck;
    
    // Revenue tracking by source (0=opinion_creation, 1=trading_fees, 2=pool_fees, 3=question_sales)
    mapping(uint8 => uint256) public dailyRevenueTotals;
    
    // Market regime tracking per opinion
    mapping(uint256 => MonitoringLibrary.RegimeTracker) public regimeTrackers;
    
    // User engagement tracking
    mapping(address => uint256) public userLastVolumeCheck;
    
    // System metrics
    mapping(bytes32 => uint256) public systemMetrics;
    
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
        
        // Grant role to opinion core to track activities
        if (_opinionCore != address(0)) {
            _grantRole(CORE_CONTRACT_ROLE, _opinionCore);
        }
        
        enhancedMonitoringEnabled = true;
        lastHealthCheck = block.timestamp;
    }
    
    // --- MODIFIER ---
    modifier onlyCoreContract() {
        require(hasRole(CORE_CONTRACT_ROLE, msg.sender), "Only core contract");
        _;
    }
    
    modifier onlyMarketContract() {
        require(hasRole(MARKET_CONTRACT_ROLE, msg.sender), "Only market contract");
        _;
    }
    
    // --- CORE MONITORING FUNCTIONS ---
    
    /**
     * @dev Track opinion creation analytics
     * @param opinionId Opinion identifier
     * @param creator Opinion creator
     * @param initialPrice Initial price paid
     */
    function trackOpinionCreation(
        uint256 opinionId,
        address creator,
        uint256 initialPrice
    ) external onlyCoreContract {
        if (!enhancedMonitoringEnabled) return;
        
        // Track revenue from opinion creation
        dailyRevenueTotals[0] += initialPrice; // opinion_creation source
        
        // Emit revenue analytics
        emit RevenueAnalytics(0, initialPrice, 0, 0, dailyRevenueTotals[0]);
        
        // Check for revenue milestone
        if (MonitoringLibrary.checkRevenueMilestone(dailyRevenueTotals[0])) {
            emit RealTimeAlert(0, 2, bytes32("REVENUE_MILESTONE"), 0, 0);
        }
        
        // Initialize regime tracker for new opinion
        regimeTrackers[opinionId] = MonitoringLibrary.RegimeTracker({
            currentLevel: 0,    // Start as COLD
            previousLevel: 0,
            lastChange: block.timestamp,
            changeCount: 0
        });
        
        // Trigger dashboard update
        emit DashboardUpdateTrigger(0, 0, 0, 2, true); // main dashboard, opinions data, full update, high priority, batchable
    }
    
    /**
     * @dev Track trading activity and analytics
     * @param opinionId Opinion identifier
     * @param trader Trader address
     * @param tradeValue Trade value
     * @param oldPrice Previous price
     * @param newPrice New price after trade
     * @param platformFee Platform fee collected
     */
    function trackTradingActivity(
        uint256 opinionId,
        address trader,
        uint256 tradeValue,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 platformFee
    ) external onlyCoreContract {
        if (!enhancedMonitoringEnabled) return;
        
        // Track revenue from trading fees
        dailyRevenueTotals[1] += platformFee; // trading_fees source
        emit RevenueAnalytics(1, platformFee, 0, 0, dailyRevenueTotals[1]);
        
        // Check for price impact analysis
        (bool shouldEmitImpact, int256 impactPercentage) = MonitoringLibrary.shouldEmitPriceImpact(uint96(oldPrice), uint96(newPrice));
        if (shouldEmitImpact) {
            emit PriceImpactAnalysis(opinionId, uint96(oldPrice), uint96(newPrice), impactPercentage, tradeValue, trader);
        }
        
        // Update user engagement tracking
        (bool shouldTrack, uint8 frequencyScore) = MonitoringLibrary.shouldTrackEngagement(1, 1);
        if (shouldTrack) {
            emit UserEngagementMetrics(trader, 1, frequencyScore, 85, 1, tradeValue);
        }
        
        // Trigger dashboard update
        emit DashboardUpdateTrigger(0, 0, 1, 1, true); // main dashboard, opinions data, partial update, normal priority, batchable
    }
    
    /**
     * @dev Track market regime changes for an opinion
     * @param opinionId Opinion identifier
     * @param newLevel New activity level (0=COLD, 1=WARM, 2=HOT)
     * @param totalVolume Total opinion volume
     */
    function trackRegimeChange(
        uint256 opinionId,
        uint8 newLevel,
        uint256 totalVolume
    ) external onlyCoreContract {
        if (!enhancedMonitoringEnabled) return;
        
        MonitoringLibrary.RegimeTracker storage regime = regimeTrackers[opinionId];
        
        if (newLevel != regime.currentLevel) {
            regime.previousLevel = regime.currentLevel;
            regime.currentLevel = newLevel;
            
            if (MonitoringLibrary.checkRegimeChange(regime)) {
                emit MarketRegimeChanged(opinionId, regime.previousLevel, newLevel, 1, block.timestamp, totalVolume);
                regime.lastChange = block.timestamp;
                regime.changeCount++;
            }
        }
    }
    
    /**
     * @dev Track gas usage for performance monitoring
     * @param operation Operation identifier
     * @param gasUsed Amount of gas consumed
     * @param gasLimit Expected gas limit
     */
    function trackGasUsage(
        bytes32 operation,
        uint256 gasUsed,
        uint256 gasLimit
    ) external onlyMarketContract {
        if (!enhancedMonitoringEnabled) return;
        
        MonitoringLibrary.GasTracker memory gasTracker = MonitoringLibrary.GasTracker({
            operation: operation,
            startGas: gasLimit,
            warningThreshold: gasLimit * 80 / 100, // 80% threshold
            criticalThreshold: gasLimit * 95 / 100  // 95% threshold
        });
        
        (bool shouldAlertGas, , uint8 severity) = MonitoringLibrary.checkGasUsage(gasTracker);
        if (shouldAlertGas) {
            emit SystemPerformanceAlert(0, gasUsed, gasTracker.warningThreshold, operation, severity);
        }
    }
    
    // --- ADMIN FUNCTIONS ---
    
    /**
     * @dev Enables or disables enhanced monitoring system
     * @param enabled Whether to enable enhanced monitoring
     */
    function setEnhancedMonitoringEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        enhancedMonitoringEnabled = enabled;
        
        if (enabled) {
            // Emit operational health check when monitoring is enabled
            emit OperationalHealth(95, 1, 0, 30, 50, block.timestamp); // Good initial health
        }
        
        emit DashboardUpdateTrigger(1, 0, 3, 2, false); // security dashboard, full update, operational data, high priority, not batchable
    }
    
    /**
     * @dev Performs manual operational health check
     * @return healthScore Overall system health score
     * @return activeUsers Number of recent active users
     * @return processingLoad Current processing load estimate
     */
    function performHealthCheck() external onlyRole(ADMIN_ROLE) returns (uint8 healthScore, uint32 activeUsers, uint8 processingLoad) {
        // Calculate health metrics (simplified implementation)
        healthScore = 90; // Base health score
        
        // Check various system metrics
        uint256 totalRevenue = dailyRevenueTotals[0] + dailyRevenueTotals[1] + dailyRevenueTotals[2] + dailyRevenueTotals[3];
        if (totalRevenue > 1000e6) healthScore += 5; // Good adoption ($1000+ revenue)
        if (enhancedMonitoringEnabled) healthScore += 5; // Monitoring active
        
        // Estimate active users (simplified)
        activeUsers = uint32(totalRevenue / 10e6); // Rough estimate based on revenue
        
        // Estimate processing load based on recent activity
        processingLoad = 25; // Low load assumption
        
        // Emit health status
        if (enhancedMonitoringEnabled) {
            uint256 componentStatus = healthScore >= 80 ? 7 : 3; // Simple component status
            emit OperationalHealth(healthScore, componentStatus, activeUsers, processingLoad, 25, block.timestamp);
            lastHealthCheck = block.timestamp;
        }
        
        return (healthScore, activeUsers, processingLoad);
    }
    
    /**
     * @dev Emergency function to trigger system alert
     * @param alertLevel Alert level (0=info, 1=warning, 2=urgent, 3=critical)
     * @param category Alert category (0=security, 1=performance, 2=financial, 3=operational)
     * @param message Alert message (32 bytes)
     */
    function adminTriggerAlert(
        uint8 alertLevel,
        uint8 category,
        bytes32 message
    ) external onlyRole(ADMIN_ROLE) {
        require(alertLevel <= 3, "Invalid alert level");
        require(category <= 3, "Invalid alert category");
        
        if (enhancedMonitoringEnabled) {
            emit SecurityIncident(category, alertLevel, 1, 0, message);
            
            // Also emit real-time alert for high severity
            if (alertLevel >= 2) {
                emit RealTimeAlert(alertLevel, category, message, alertLevel == 3 ? 2 : 1, 0);
            }
        }
    }
    
    /**
     * @dev Resets daily revenue tracking (should be called daily by automation)
     */
    function resetDailyRevenue() external onlyRole(ADMIN_ROLE) {
        delete dailyRevenueTotals[0]; // opinion_creation
        delete dailyRevenueTotals[1]; // trading_fees
        delete dailyRevenueTotals[2]; // pool_fees
        delete dailyRevenueTotals[3]; // question_sales
        
        if (enhancedMonitoringEnabled) {
            emit DashboardUpdateTrigger(3, 0, 2, 1, false); // financial dashboard, full update, fees data, normal priority
        }
    }
    
    /**
     * @dev Batch trigger dashboard updates for multiple data categories
     * @param dashboardType Dashboard to update
     * @param dataCategories Array of data categories that changed
     * @param priority Update priority
     */
    function batchTriggerDashboardUpdates(
        uint8 dashboardType,
        uint8[] calldata dataCategories,
        uint8 priority
    ) external onlyRole(ADMIN_ROLE) {
        if (!enhancedMonitoringEnabled) return;
        
        bytes32 batchId = keccak256(abi.encodePacked(block.timestamp, msg.sender, dataCategories.length));
        
        // Emit batch summary for efficient processing
        emit BatchOperationSummary(
            dashboardType,
            uint32(dataCategories.length),
            uint32(dataCategories.length), // All successful
            0, // No value for dashboard updates
            5000, // Estimated gas per update
            batchId
        );
        
        // Trigger individual updates
        for (uint256 i = 0; i < dataCategories.length; i++) {
            emit DashboardUpdateTrigger(dashboardType, 1, dataCategories[i], priority, true);
        }
    }
    
    // --- VIEW FUNCTIONS ---
    
    /**
     * @dev Gets enhanced monitoring statistics
     * @return enabled Whether enhanced monitoring is enabled
     * @return todayRevenue Today's total revenue across all sources
     * @return lastHealthTime Last health check timestamp
     */
    function getMonitoringStats() external view returns (
        bool enabled,
        uint256 todayRevenue,
        uint256 lastHealthTime
    ) {
        enabled = enhancedMonitoringEnabled;
        
        // Sum today's revenue across all sources
        todayRevenue = dailyRevenueTotals[0] + dailyRevenueTotals[1] + dailyRevenueTotals[2] + dailyRevenueTotals[3];
        
        lastHealthTime = lastHealthCheck;
    }
    
    /**
     * @dev Gets market regime information for an opinion
     * @param opinionId Opinion identifier
     * @return currentLevel Current activity level (0=COLD, 1=WARM, 2=HOT)
     * @return lastChange Last regime change timestamp
     * @return changeCount Number of regime changes today
     */
    function getMarketRegimeInfo(uint256 opinionId) external view returns (
        uint8 currentLevel,
        uint256 lastChange,
        uint32 changeCount
    ) {
        MonitoringLibrary.RegimeTracker storage regime = regimeTrackers[opinionId];
        return (regime.currentLevel, regime.lastChange, regime.changeCount);
    }
    
    /**
     * @dev Gets daily revenue by source
     * @param source Revenue source (0=opinion_creation, 1=trading_fees, 2=pool_fees, 3=question_sales)
     * @return revenue Revenue amount for the source
     */
    function getDailyRevenue(uint8 source) external view returns (uint256 revenue) {
        require(source <= 3, "Invalid revenue source");
        return dailyRevenueTotals[source];
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