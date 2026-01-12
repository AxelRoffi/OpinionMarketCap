// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MonitoringLibrary
 * @dev Gas-optimized monitoring utilities for hybrid onchain/offchain observability
 * 
 * DESIGN PRINCIPLES:
 * - Strategic event emission (not every operation)
 * - Gas-efficient monitoring patterns
 * - Rich context for backend analytics
 * - Future-proof event structure
 */
library MonitoringLibrary {

    // === 📊 PERFORMANCE TRACKING ===
    
    /**
     * @dev Tracks gas usage thresholds for performance monitoring
     */
    struct GasTracker {
        uint256 startGas;
        uint256 warningThreshold;
        uint256 criticalThreshold;
        bytes32 operation;
    }
    
    /**
     * @dev Market regime tracking for activity level changes
     */
    struct RegimeTracker {
        uint8 currentLevel;    // Current activity level (0=COLD, 1=WARM, 2=HOT)
        uint8 previousLevel;   // Previous activity level
        uint256 lastChange;    // Last regime change timestamp
        uint32 changeCount;    // Number of regime changes today
    }
    
    // === 🔥 MONITORING UTILITY FUNCTIONS ===
    
    /**
     * @dev Checks if regime change should be emitted and updates tracking
     * STRATEGIC: Only emit when actual regime change occurs
     * @param regime Current regime tracking data
     * @return shouldEmit Whether regime change event should be emitted
     */
    function checkRegimeChange(
        RegimeTracker storage regime
    ) internal returns (bool shouldEmit) {
        // Only emit if regime actually changed
        if (regime.currentLevel != regime.previousLevel) {
            // Update tracking
            regime.previousLevel = regime.currentLevel;
            regime.lastChange = block.timestamp;
            regime.changeCount++;
            return true;
        }
        return false;
    }
    
    /**
     * @dev Checks if MEV protection event should be emitted
     * @param riskLevel MEV risk level (0-5)
     * @return shouldEmit Whether MEV protection event should be emitted
     */
    function shouldEmitMevProtection(uint8 riskLevel) internal pure returns (bool shouldEmit) {
        // Only emit if significant MEV risk detected (MEDIUM or higher)
        return riskLevel >= 2;
    }
    
    /**
     * @dev Checks if price impact analysis should be emitted
     * @param oldPrice Previous price
     * @param newPrice New price
     * @return shouldEmit Whether price impact event should be emitted
     * @return impactPercentage Price impact percentage (scaled by 10000)
     */
    function shouldEmitPriceImpact(
        uint96 oldPrice,
        uint96 newPrice
    ) internal pure returns (bool shouldEmit, int256 impactPercentage) {
        // Calculate impact percentage (scaled by 10000)
        if (oldPrice > 0) {
            if (newPrice > oldPrice) {
                uint256 increase = ((uint256(newPrice) - uint256(oldPrice)) * 10000) / uint256(oldPrice);
                impactPercentage = int256(increase);
            } else {
                uint256 decrease = ((uint256(oldPrice) - uint256(newPrice)) * 10000) / uint256(oldPrice);
                impactPercentage = -int256(decrease);
            }
            
            // Only emit for significant price impacts (> 5% = 500 scaled)
            shouldEmit = impactPercentage > 500 || impactPercentage < -500;
        } else {
            shouldEmit = false;
            impactPercentage = 0;
        }
    }
    
    /**
     * @dev Checks if user behavior pattern should be emitted
     * @param confidence Confidence level (0-100)
     * @param actionTaken Action taken based on pattern
     * @return shouldEmit Whether behavior pattern event should be emitted
     */
    function shouldEmitUserBehavior(
        uint8 confidence,
        uint8 actionTaken
    ) internal pure returns (bool shouldEmit) {
        // Only emit for high-confidence patterns or when action is taken
        return confidence >= 70 || actionTaken > 0;
    }
    
    // === 💡 BUSINESS INTELLIGENCE FUNCTIONS ===
    
    /**
     * @dev Checks if volume milestone was reached
     * @param currentVolume Current volume value
     * @param lastMilestone Last milestone reached
     * @return newMilestone New milestone reached (0 if none)
     */
    function checkVolumeMilestone(
        uint256 currentVolume,
        uint256 lastMilestone
    ) internal pure returns (uint256 newMilestone) {
        // Define logarithmic milestones: 1K, 5K, 10K, 50K, 100K, 500K, 1M, etc.
        uint256[10] memory milestones;
        milestones[0] = 1_000 * 1e6;      // 1K USDC
        milestones[1] = 5_000 * 1e6;      // 5K USDC
        milestones[2] = 10_000 * 1e6;     // 10K USDC
        milestones[3] = 50_000 * 1e6;     // 50K USDC
        milestones[4] = 100_000 * 1e6;    // 100K USDC
        milestones[5] = 500_000 * 1e6;    // 500K USDC
        milestones[6] = 1_000_000 * 1e6;  // 1M USDC
        milestones[7] = 5_000_000 * 1e6;  // 5M USDC
        milestones[8] = 10_000_000 * 1e6; // 10M USDC
        milestones[9] = 50_000_000 * 1e6; // 50M USDC
        
        // Find next milestone
        for (uint256 i = 0; i < milestones.length; i++) {
            if (currentVolume >= milestones[i] && lastMilestone < milestones[i]) {
                return milestones[i];
            }
        }
        
        return 0; // No new milestone
    }
    
    /**
     * @dev Checks if user engagement should be tracked
     * @param activityCount Recent activity count
     * @param streakDays Current streak in days
     * @return shouldTrack Whether engagement should be tracked
     * @return frequencyScore Calculated frequency score
     */
    function shouldTrackEngagement(
        uint32 activityCount,
        uint32 streakDays
    ) internal pure returns (bool shouldTrack, uint8 frequencyScore) {
        // Calculate frequency score based on activity
        frequencyScore = activityCount > 10 ? 100 : uint8((activityCount * 10));
        
        // Only track if user is active (frequency > 10) or streak > 3 days
        shouldTrack = frequencyScore > 10 || streakDays > 3;
    }
    
    // === 🎯 PERFORMANCE MONITORING FUNCTIONS ===
    
    /**
     * @dev Starts gas tracking for performance monitoring
     * @param operation Operation being tracked
     * @param warningThreshold Gas warning threshold
     * @param criticalThreshold Gas critical threshold
     * @return Gas tracker instance
     */
    function startGasTracking(
        bytes32 operation,
        uint256 warningThreshold,
        uint256 criticalThreshold
    ) internal view returns (GasTracker memory) {
        return GasTracker({
            startGas: gasleft(),
            warningThreshold: warningThreshold,
            criticalThreshold: criticalThreshold,
            operation: operation
        });
    }
    
    /**
     * @dev Checks if gas usage alert should be emitted
     * @param tracker Gas tracker from startGasTracking
     * @return shouldAlert Whether performance alert should be emitted
     * @return gasUsed Amount of gas used
     * @return severity Alert severity (1=warning, 2=critical)
     */
    function checkGasUsage(GasTracker memory tracker) internal view returns (
        bool shouldAlert,
        uint256 gasUsed,
        uint8 severity
    ) {
        gasUsed = tracker.startGas - gasleft();
        
        // Check thresholds
        if (gasUsed >= tracker.criticalThreshold) {
            return (true, gasUsed, 2); // critical
        } else if (gasUsed >= tracker.warningThreshold) {
            return (true, gasUsed, 1); // warning
        }
        
        return (false, gasUsed, 0); // no alert
    }
    
    /**
     * @dev Calculates market efficiency score based on various factors
     * @param priceVolatility Price volatility measure
     * @param participantCount Number of participants
     * @param tradingVolume Trading volume
     * @param timeWindow Time window for analysis
     * @return Efficiency score (0-100)
     */
    function calculateMarketEfficiency(
        uint32 priceVolatility,
        uint32 participantCount,
        uint256 tradingVolume,
        uint256 timeWindow
    ) internal pure returns (uint8) {
        // Simple efficiency calculation (can be made more sophisticated)
        uint256 efficiencyScore = 50; // Base score
        
        // More participants = higher efficiency
        if (participantCount > 10) efficiencyScore += 20;
        else if (participantCount > 5) efficiencyScore += 10;
        
        // Lower volatility = higher efficiency (up to a point)
        if (priceVolatility < 1000) efficiencyScore += 20; // < 10% volatility
        else if (priceVolatility < 2000) efficiencyScore += 10; // < 20% volatility
        
        // Higher volume relative to time = higher efficiency
        if (timeWindow > 0) {
            uint256 volumePerHour = tradingVolume / (timeWindow / 3600);
            if (volumePerHour > 1000 * 1e6) efficiencyScore += 10; // > 1K USDC/hour
        }
        
        return uint8(efficiencyScore > 100 ? 100 : efficiencyScore);
    }
    
    /**
     * @dev Generates hash for event correlation
     * @param eventType Type of event
     * @param participant Primary participant address
     * @param identifier Primary identifier (opinion ID, etc.)
     * @return Event hash for correlation
     */
    function generateEventHash(
        bytes32 eventType,
        address participant,
        uint256 identifier
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            eventType,
            participant,
            identifier,
            block.timestamp,
            block.number
        ));
    }
    
    /**
     * @dev Calculates system health score
     * @param totalOpinions Total opinions created
     * @param securityEnabled Whether security systems are active
     * @return healthScore Overall health score (0-100)
     */
    function calculateHealthScore(
        uint256 totalOpinions,
        bool securityEnabled
    ) internal pure returns (uint8) {
        uint256 healthScore = 70; // Base health score
        
        // Good adoption indicators
        if (totalOpinions > 1000) healthScore += 15;
        else if (totalOpinions > 100) healthScore += 10;
        else if (totalOpinions > 10) healthScore += 5;
        
        // Security systems active
        if (securityEnabled) healthScore += 15;
        
        return uint8(healthScore > 100 ? 100 : healthScore);
    }
    
    /**
     * @dev Checks if daily revenue milestone reached
     * @param newTotal New revenue total
     * @return shouldAlert Whether revenue milestone alert should be emitted
     */
    function checkRevenueMilestone(uint256 newTotal) internal pure returns (bool shouldAlert) {
        // Check if daily revenue milestone reached (every 1K USDC)
        return newTotal > 0 && (newTotal % (1000 * 1e6)) == 0;
    }
}