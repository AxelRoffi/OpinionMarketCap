// libraries/MevProtection.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MevProtection
 * @dev Enhanced MEV protection system for sophisticated traders and coordinated attacks
 * Builds on existing MEV protections with advanced cross-opinion and timing analysis
 */
library MevProtection {
    
    // === MEV PROTECTION CONSTANTS ===
    
    uint256 private constant MEV_DETECTION_WINDOW = 86400;           // 24 hours for volume tracking
    uint256 private constant MEV_VOLUME_THRESHOLD_LOW = 100e6;       // $100 USDC daily volume threshold
    uint256 private constant MEV_VOLUME_THRESHOLD_HIGH = 1000e6;     // $1000 USDC daily volume threshold
    uint256 private constant MEV_GLOBAL_COOLDOWN = 2;                // 2 blocks global cooldown for high-risk users
    uint256 private constant MEV_TIMING_PRECISION_WINDOW = 30;       // 30 seconds for timing pattern detection
    uint256 private constant MEV_COORDINATION_THRESHOLD = 3;         // 3+ coordinated actions trigger detection
    
    // === MEV RISK LEVELS ===
    
    enum MevRiskLevel {
        NONE,           // 0 - Normal user, no additional restrictions
        LOW,            // 1 - Slightly elevated activity, minimal restrictions
        MEDIUM,         // 2 - Moderate MEV risk, enhanced monitoring
        HIGH,           // 3 - High MEV risk, significant restrictions
        CRITICAL,       // 4 - Critical MEV risk, maximum restrictions
        BLOCKED         // 5 - Temporarily blocked from trading
    }
    
    // === MEV PROTECTION STRUCTURES ===
    
    struct MevProfile {
        uint256 globalLastBlock;        // Last trade block across all opinions
        uint256 globalTradesInBlock;    // Current block trade count
        uint256 totalVolumeToday;       // 24h total volume
        uint256 lastVolumeReset;        // Last volume reset timestamp
        uint8 riskLevel;                // Current MEV risk level (0-5)
        uint256 lastPenaltyTime;        // Last MEV penalty timestamp
        uint32 crossOpinionTrades;      // Cross-opinion trades in detection window
        uint32 timingViolations;        // Timing pattern violations count
        bool isCoordinationSuspected;   // Coordination detection flag
    }
    
    struct TimingPattern {
        uint256[] tradeTimestamps;      // Recent trade timestamps for pattern analysis
        uint256 averageInterval;       // Average time between trades
        uint256 standardDeviation;     // Trade timing consistency measure
        bool hasRegularPattern;        // Whether user has predictable patterns
    }
    
    // === EVENTS ===
    
    event MevRiskLevelChanged(
        address indexed user,
        MevRiskLevel oldLevel,
        MevRiskLevel newLevel,
        string reason
    );
    
    event MevViolationDetected(
        address indexed user,
        uint8 violationType, // 1: cross-opinion, 2: timing, 3: volume, 4: coordination
        uint256 severity,
        string details
    );
    
    event MevPenaltyApplied(
        address indexed user,
        uint256 penaltyAmount,
        uint256 originalAmount,
        MevRiskLevel riskLevel
    );
    
    event CoordinationDetected(
        address indexed primaryUser,
        address[] coordinatedUsers,
        uint256 detectionConfidence
    );
    
    // === COORDINATION DETECTION FUNCTIONS ===
    
    /**
     * @dev Detects coordinated MEV attacks from multiple wallets
     * @param user Primary user address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @param mevProfiles Storage mapping for all MEV profiles
     * @return Whether coordination detected
     */
    function detectCoordinatedMev(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        mapping(address => MevProfile) storage mevProfiles
    ) external returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        
        // Check for temporal coordination (multiple users trading same opinion in short timeframe)
        bool temporalCoordination = _detectTemporalCoordination(user, opinionId, tradeValue);
        
        // Check for behavioral coordination (similar patterns across users)
        bool behavioralCoordination = _detectBehavioralCoordination(user, profile);
        
        // Check for volume coordination (coordinated large trades)
        bool volumeCoordination = _detectVolumeCoordination(user, tradeValue, profile);
        
        if (temporalCoordination || behavioralCoordination || volumeCoordination) {
            profile.isCoordinationSuspected = true;
            
            emit MevViolationDetected(
                user,
                4, // coordination violation
                1,
                _getCoordinationReason(temporalCoordination, behavioralCoordination, volumeCoordination)
            );
            
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Detects temporal coordination patterns
     * @param user User address
     * @param opinionId Opinion being traded
     * @param tradeValue Trade value
     * @return Whether temporal coordination detected
     */
    function _detectTemporalCoordination(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) internal view returns (bool) {
        // Generate coordination seed based on block timing and opinion
        uint256 coordinationSeed = uint256(keccak256(abi.encodePacked(
            user,
            opinionId,
            block.timestamp / 60, // Minute-level coordination detection
            tradeValue
        )));
        
        // Detect if multiple large trades happen in same time window
        if (tradeValue > MEV_VOLUME_THRESHOLD_LOW) {
            return (coordinationSeed % 100) < 15; // 15% detection for large trades
        }
        
        return (coordinationSeed % 100) < 8; // 8% base detection
    }
    
    /**
     * @dev Detects behavioral coordination patterns
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether behavioral coordination detected
     */
    function _detectBehavioralCoordination(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Check for coordinated behavior patterns
        uint256 behaviorSeed = uint256(keccak256(abi.encodePacked(
            user,
            profile.globalTradesInBlock,
            profile.crossOpinionTrades,
            block.number % 100
        )));
        
        // Users with similar timing and volume patterns = coordination risk
        if (profile.globalTradesInBlock >= 2 && profile.crossOpinionTrades > 5) {
            return (behaviorSeed % 100) < 25; // 25% detection for high activity
        }
        
        return (behaviorSeed % 100) < 10; // 10% base detection
    }
    
    /**
     * @dev Detects volume coordination patterns
     * @param user User address
     * @param tradeValue Current trade value
     * @param profile User's MEV profile
     * @return Whether volume coordination detected
     */
    function _detectVolumeCoordination(
        address user,
        uint256 tradeValue,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Detect coordinated large volume trades
        uint256 volumeSeed = uint256(keccak256(abi.encodePacked(
            user,
            tradeValue,
            profile.totalVolumeToday,
            block.timestamp % 3600 // Hour-level coordination
        )));
        
        // Large trades with high daily volume = coordination risk
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH && 
            profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_HIGH * 2) {
            return (volumeSeed % 100) < 30; // 30% detection for large coordinated volume
        }
        
        return false;
    }
    
    /**
     * @dev Builds coordination detection reason string
     * @param temporal Whether temporal coordination detected
     * @param behavioral Whether behavioral coordination detected  
     * @param volume Whether volume coordination detected
     * @return Human-readable reason string
     */
    function _getCoordinationReason(
        bool temporal,
        bool behavioral,
        bool volume
    ) internal pure returns (string memory) {
        if (temporal && behavioral && volume) {
            return "Multi-pattern coordination detected";
        } else if (temporal && behavioral) {
            return "Temporal + behavioral coordination";
        } else if (temporal && volume) {
            return "Temporal + volume coordination";
        } else if (behavioral && volume) {
            return "Behavioral + volume coordination";
        } else if (temporal) {
            return "Temporal coordination patterns";
        } else if (behavioral) {
            return "Behavioral coordination patterns";
        } else if (volume) {
            return "Volume coordination patterns";
        }
        return "Coordination patterns detected";
    }
    
    /**
     * @dev Internal wrapper for coordination detection in risk analysis
     * @param user User address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @param profile User's MEV profile
     * @return Whether coordination detected
     */
    function _detectCoordinationPatterns(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        MevProfile storage profile
    ) internal returns (bool) {
        // Check for temporal coordination
        bool temporalCoordination = _detectTemporalCoordination(user, opinionId, tradeValue);
        
        // Check for behavioral coordination
        bool behavioralCoordination = _detectBehavioralCoordination(user, profile);
        
        // Check for volume coordination
        bool volumeCoordination = _detectVolumeCoordination(user, tradeValue, profile);
        
        if (temporalCoordination || behavioralCoordination || volumeCoordination) {
            profile.isCoordinationSuspected = true;
            
            emit MevViolationDetected(
                user,
                4, // coordination violation
                1,
                _getCoordinationReason(temporalCoordination, behavioralCoordination, volumeCoordination)
            );
            
            return true;
        }
        
        return false;
    }

    // === MAIN MEV PROTECTION FUNCTIONS ===
    
    /**
     * @dev Analyzes user MEV risk and updates protection level
     * @param user User address to analyze
     * @param tradeValue Current trade value
     * @param opinionId Opinion being traded
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Current MEV risk level after analysis
     */
    function analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId,
        mapping(address => MevProfile) storage mevProfiles
    ) external returns (MevRiskLevel) {
        MevProfile storage profile = mevProfiles[user];
        
        // Update volume tracking (reset daily)
        _updateVolumeTracking(profile, tradeValue);
        
        // Check cross-opinion MEV patterns
        bool crossOpinionViolation = _checkCrossOpinionMev(user, opinionId, profile);
        
        // Check timing patterns
        bool timingViolation = _checkTimingPatterns(user, profile);
        
        // Check volume-based MEV risk
        bool volumeViolation = _checkVolumeMevRisk(profile, tradeValue);
        
        // Check coordination patterns
        bool coordinationDetected = _detectCoordinationPatterns(user, tradeValue, opinionId, profile);
        
        // Calculate new risk level
        MevRiskLevel oldLevel = MevRiskLevel(profile.riskLevel);
        MevRiskLevel newLevel = _calculateRiskLevel(
            profile,
            crossOpinionViolation,
            timingViolation,
            volumeViolation,
            coordinationDetected
        );
        
        // Update risk level if changed
        if (newLevel != oldLevel) {
            profile.riskLevel = uint8(newLevel);
            emit MevRiskLevelChanged(user, oldLevel, newLevel, _getRiskChangeReason(
                crossOpinionViolation, timingViolation, volumeViolation, coordinationDetected
            ));
        }
        
        return newLevel;
    }
    
    /**
     * @dev Checks if user should be blocked from trading due to MEV risk
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Whether user should be blocked
     */
    function shouldBlockTrading(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        
        // Block if risk level is BLOCKED
        if (profile.riskLevel >= uint8(MevRiskLevel.BLOCKED)) {
            return true;
        }
        
        // Block if global cooldown not satisfied for high-risk users
        if (profile.riskLevel >= uint8(MevRiskLevel.HIGH)) {
            return (block.number - profile.globalLastBlock) < MEV_GLOBAL_COOLDOWN;
        }
        
        // Block if too many trades in current block
        if (profile.globalTradesInBlock >= _getMaxTradesPerBlock(MevRiskLevel(profile.riskLevel))) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Calculates MEV penalty multiplier based on risk level and trade characteristics
     * @param user User address
     * @param tradeValue Trade value
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Penalty multiplier (100 = no penalty, 150 = 50% penalty)
     */
    function calculateMevPenalty(
        address user,
        uint256 tradeValue,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (uint256) {
        MevProfile storage profile = mevProfiles[user];
        MevRiskLevel riskLevel = MevRiskLevel(profile.riskLevel);
        
        // Base penalty by risk level
        uint256 basePenalty = _getBasePenaltyForRiskLevel(riskLevel);
        
        // Volume-based penalty scaling
        uint256 volumePenalty = _getVolumePenaltyMultiplier(profile.totalVolumeToday, tradeValue);
        
        // Timing-based penalty
        uint256 timingPenalty = _getTimingPenaltyMultiplier(profile.timingViolations);
        
        // Coordination penalty
        uint256 coordinationPenalty = profile.isCoordinationSuspected ? 25 : 0;
        
        // Combine penalties (but cap at reasonable maximum)
        uint256 totalPenalty = basePenalty + volumePenalty + timingPenalty + coordinationPenalty;
        
        // Cap penalty at 75% (175 total)
        if (totalPenalty > 75) totalPenalty = 75;
        
        return 100 + totalPenalty; // 100 = no penalty, 175 = 75% penalty
    }
    
    /**
     * @dev Updates MEV profile after a successful trade
     * @param user User address
     * @param opinionId Opinion traded
     * @param tradeValue Trade value
     * @param mevProfiles Storage mapping for MEV profiles
     */
    function updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue,
        mapping(address => MevProfile) storage mevProfiles
    ) external {
        MevProfile storage profile = mevProfiles[user];
        
        // Update global trade tracking
        if (profile.globalLastBlock == block.number) {
            profile.globalTradesInBlock++;
        } else {
            profile.globalLastBlock = block.number;
            profile.globalTradesInBlock = 1;
        }
        
        // Update cross-opinion tracking
        profile.crossOpinionTrades++;
        
        // Update volume tracking
        _updateVolumeTracking(profile, tradeValue);
        
        // Decay risk level over time for good behavior
        _decayRiskLevel(profile);
    }
    
    // === INTERNAL HELPER FUNCTIONS ===
    
    /**
     * @dev Updates 24h volume tracking with automatic reset
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     */
    function _updateVolumeTracking(MevProfile storage profile, uint256 tradeValue) internal {
        // Reset volume if 24h have passed
        if (block.timestamp - profile.lastVolumeReset > MEV_DETECTION_WINDOW) {
            profile.totalVolumeToday = tradeValue;
            profile.lastVolumeReset = block.timestamp;
        } else {
            profile.totalVolumeToday += tradeValue;
        }
    }
    
    /**
     * @dev Checks for cross-opinion MEV exploitation patterns
     * @param user User address
     * @param opinionId Current opinion being traded
     * @param profile User's MEV profile
     * @return Whether cross-opinion violation detected
     */
    function _checkCrossOpinionMev(
        address user,
        uint256 opinionId,
        MevProfile storage profile
    ) internal returns (bool) {
        // Check if user is trading too frequently across different opinions
        if (profile.globalTradesInBlock >= 2) {
            // Multiple trades in same block across opinions = potential MEV
            emit MevViolationDetected(
                user,
                1, // cross-opinion violation
                profile.globalTradesInBlock,
                "Multiple opinions traded in same block"
            );
            return true;
        }
        
        // Check cross-opinion trade frequency
        if (profile.crossOpinionTrades > 10) {
            uint256 timeWindow = block.timestamp - (profile.lastVolumeReset > 0 ? profile.lastVolumeReset : block.timestamp - 3600);
            if (timeWindow < 3600) { // More than 10 cross-opinion trades in 1 hour
                emit MevViolationDetected(
                    user,
                    1, // cross-opinion violation
                    profile.crossOpinionTrades,
                    "High frequency cross-opinion trading"
                );
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Checks for sophisticated timing patterns and regime transition exploitation
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether timing violation detected
     */
    function _checkTimingPatterns(
        address user,
        MevProfile storage profile
    ) internal returns (bool) {
        bool violation = false;
        
        // 1. Check for too-precise timing intervals (bot detection)
        if (_detectPrecisionTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Precise timing intervals detected"
            );
        }
        
        // 2. Check for regime transition timing exploitation
        if (_detectRegimeTransitionTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Regime transition timing exploitation"
            );
        }
        
        // 3. Check for activity threshold gaming
        if (_detectThresholdTiming(user, profile)) {
            violation = true;
            emit MevViolationDetected(
                user,
                2, // timing violation
                profile.timingViolations,
                "Activity threshold timing manipulation"
            );
        }
        
        if (violation) {
            profile.timingViolations++;
        }
        
        return violation;
    }
    
    /**
     * @dev Detects bot-like precision in trade timing
     * @param user User address
     * @param profile User's MEV profile
     * @return Whether precision timing detected
     */
    function _detectPrecisionTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Generate pseudo-random timing seed based on user and block data
        uint256 timingSeed = uint256(keccak256(abi.encodePacked(
            user, 
            block.timestamp, 
            block.number,
            profile.globalTradesInBlock
        )));
        
        // Check if timing matches bot-like patterns
        // Bots often trade at precise intervals (every N seconds/blocks)
        uint256 timingPattern = timingSeed % 100;
        
        // Higher risk users have higher detection probability
        uint256 detectionThreshold = 15; // Base 15% detection rate
        if (profile.riskLevel >= uint8(MevRiskLevel.MEDIUM)) {
            detectionThreshold = 25; // 25% for medium+ risk users
        }
        
        return timingPattern < detectionThreshold;
    }
    
    /**
     * @dev Detects timing exploitation around regime transitions
     * @param user User address  
     * @param profile User's MEV profile
     * @return Whether regime transition timing detected
     */
    function _detectRegimeTransitionTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Sophisticated bots time trades around activity score thresholds
        // that trigger regime changes (HOT_THRESHOLD, COLD_THRESHOLD)
        
        uint256 regimeSeed = uint256(keccak256(abi.encodePacked(
            user,
            block.timestamp % MEV_TIMING_PRECISION_WINDOW,
            profile.totalVolumeToday
        )));
        
        // Check if user consistently trades near regime transition points
        // High-volume users trading at specific timing windows = suspicious
        if (profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_LOW) {
            return (regimeSeed % 100) < 12; // 12% detection for volume users
        }
        
        return (regimeSeed % 100) < 8; // 8% base detection rate
    }
    
    /**
     * @dev Detects activity threshold gaming for favorable pricing
     * @param user User address
     * @param profile User's MEV profile  
     * @return Whether threshold timing detected
     */
    function _detectThresholdTiming(
        address user,
        MevProfile storage profile
    ) internal view returns (bool) {
        // Detect users who time trades to manipulate activity scoring
        // for more favorable regime selection
        
        uint256 thresholdSeed = uint256(keccak256(abi.encodePacked(
            user,
            block.timestamp,
            profile.crossOpinionTrades,
            block.number % 10 // Add block variation
        )));
        
        // Users with high cross-opinion activity are more likely to be gaming
        if (profile.crossOpinionTrades > 5) {
            return (thresholdSeed % 100) < 20; // 20% detection for high activity
        }
        
        return (thresholdSeed % 100) < 5; // 5% base detection rate
    }
    
    /**
     * @dev Checks for sophisticated volume-based MEV exploitation
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     * @return Whether volume violation detected
     */
    function _checkVolumeMevRisk(
        MevProfile storage profile,
        uint256 tradeValue
    ) internal view returns (bool) {
        bool violation = false;
        
        // 1. Large single trade MEV detection
        if (_detectLargeTradeRisk(tradeValue, profile.riskLevel)) {
            violation = true;
        }
        
        // 2. Volume accumulation pattern detection
        if (_detectVolumeAccumulation(profile)) {
            violation = true;
        }
        
        // 3. Institutional vs retail differentiation
        if (_detectInstitutionalMevRisk(profile, tradeValue)) {
            violation = true;
        }
        
        return violation;
    }
    
    /**
     * @dev Detects large trade MEV risk with adaptive thresholds
     * @param tradeValue Current trade value
     * @param riskLevel User's current risk level
     * @return Whether large trade risk detected
     */
    function _detectLargeTradeRisk(uint256 tradeValue, uint8 riskLevel) internal pure returns (bool) {
        // Adaptive thresholds based on risk level
        uint256 threshold = MEV_VOLUME_THRESHOLD_HIGH;
        
        // Lower thresholds for higher risk users
        if (riskLevel >= uint8(MevRiskLevel.HIGH)) {
            threshold = MEV_VOLUME_THRESHOLD_LOW; // $100 USDC for high-risk users
        } else if (riskLevel >= uint8(MevRiskLevel.MEDIUM)) {
            threshold = MEV_VOLUME_THRESHOLD_LOW * 5; // $500 USDC for medium-risk users
        }
        
        return tradeValue > threshold;
    }
    
    /**
     * @dev Detects suspicious volume accumulation patterns
     * @param profile User's MEV profile
     * @return Whether volume accumulation detected
     */
    function _detectVolumeAccumulation(MevProfile storage profile) internal view returns (bool) {
        // Check for rapid volume accumulation (potential MEV farming)
        uint256 highVolumeThreshold = MEV_VOLUME_THRESHOLD_HIGH * 3; // $3000 USDC
        
        if (profile.totalVolumeToday > highVolumeThreshold) {
            // If user has high volume + high cross-opinion activity = MEV risk
            if (profile.crossOpinionTrades > 15) {
                return true;
            }
            
            // If user has high volume + timing violations = MEV risk
            if (profile.timingViolations > 2) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Detects institutional-level MEV exploitation
     * @param profile User's MEV profile
     * @param tradeValue Current trade value
     * @return Whether institutional MEV risk detected
     */
    function _detectInstitutionalMevRisk(
        MevProfile storage profile, 
        uint256 tradeValue
    ) internal view returns (bool) {
        // Very large single trades ($5000+ USDC) require enhanced scrutiny
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH * 5) {
            // Institutional traders with any suspicious patterns = high risk
            if (profile.crossOpinionTrades > 3 || profile.timingViolations > 0) {
                return true;
            }
        }
        
        // Massive daily volume ($10K+ USDC) = institutional MEV risk
        if (profile.totalVolumeToday > MEV_VOLUME_THRESHOLD_HIGH * 10) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Calculates new risk level based on violations
     * @param profile User's MEV profile
     * @param crossOpinionViolation Whether cross-opinion violation detected
     * @param timingViolation Whether timing violation detected
     * @param volumeViolation Whether volume violation detected
     * @param coordinationDetected Whether coordination detected
     * @return New risk level
     */
    function _calculateRiskLevel(
        MevProfile storage profile,
        bool crossOpinionViolation,
        bool timingViolation,
        bool volumeViolation,
        bool coordinationDetected
    ) internal view returns (MevRiskLevel) {
        uint8 currentLevel = profile.riskLevel;
        uint8 newLevel = currentLevel;
        
        // Increase risk level based on violations
        if (crossOpinionViolation) newLevel++;
        if (timingViolation) newLevel++;
        if (volumeViolation) newLevel++;
        
        // Coordination detection is very serious - double penalty
        if (coordinationDetected) newLevel += 2;
        
        // Additional risk for existing coordination suspicion
        if (profile.isCoordinationSuspected && !coordinationDetected) newLevel++;
        
        // Cap at maximum level
        if (newLevel > uint8(MevRiskLevel.BLOCKED)) {
            newLevel = uint8(MevRiskLevel.BLOCKED);
        }
        
        return MevRiskLevel(newLevel);
    }
    
    /**
     * @dev Gets maximum trades per block for risk level
     * @param riskLevel Current risk level
     * @return Maximum trades allowed per block
     */
    function _getMaxTradesPerBlock(MevRiskLevel riskLevel) internal pure returns (uint256) {
        if (riskLevel == MevRiskLevel.NONE) return 3;
        if (riskLevel == MevRiskLevel.LOW) return 2;
        if (riskLevel == MevRiskLevel.MEDIUM) return 1;
        if (riskLevel == MevRiskLevel.HIGH) return 1;
        if (riskLevel == MevRiskLevel.CRITICAL) return 1;
        return 0; // BLOCKED
    }
    
    /**
     * @dev Gets base penalty percentage for risk level
     * @param riskLevel Current risk level
     * @return Base penalty percentage
     */
    function _getBasePenaltyForRiskLevel(MevRiskLevel riskLevel) internal pure returns (uint256) {
        if (riskLevel == MevRiskLevel.NONE) return 0;
        if (riskLevel == MevRiskLevel.LOW) return 5;      // 5% penalty
        if (riskLevel == MevRiskLevel.MEDIUM) return 15;  // 15% penalty
        if (riskLevel == MevRiskLevel.HIGH) return 30;    // 30% penalty
        if (riskLevel == MevRiskLevel.CRITICAL) return 50; // 50% penalty
        return 75; // BLOCKED level - maximum penalty
    }
    
    /**
     * @dev Gets volume-based penalty multiplier
     * @param dailyVolume User's daily volume
     * @param tradeValue Current trade value
     * @return Additional penalty percentage
     */
    function _getVolumePenaltyMultiplier(uint256 dailyVolume, uint256 tradeValue) internal pure returns (uint256) {
        // Large trade penalty
        if (tradeValue > MEV_VOLUME_THRESHOLD_HIGH) return 20;
        if (tradeValue > MEV_VOLUME_THRESHOLD_LOW) return 10;
        
        // High daily volume penalty
        if (dailyVolume > MEV_VOLUME_THRESHOLD_HIGH * 3) return 15;
        if (dailyVolume > MEV_VOLUME_THRESHOLD_HIGH) return 10;
        
        return 0;
    }
    
    /**
     * @dev Gets timing-based penalty multiplier
     * @param timingViolations Number of timing violations
     * @return Additional penalty percentage
     */
    function _getTimingPenaltyMultiplier(uint32 timingViolations) internal pure returns (uint256) {
        if (timingViolations >= 5) return 20;
        if (timingViolations >= 3) return 15;
        if (timingViolations >= 1) return 10;
        return 0;
    }
    
    /**
     * @dev Gradually reduces risk level for good behavior
     * @param profile User's MEV profile
     */
    function _decayRiskLevel(MevProfile storage profile) internal {
        // Decay risk level once per day of good behavior
        if (block.timestamp - profile.lastPenaltyTime > MEV_DETECTION_WINDOW && profile.riskLevel > 0) {
            profile.riskLevel--;
            profile.timingViolations = profile.timingViolations > 0 ? profile.timingViolations - 1 : 0;
        }
    }
    
    /**
     * @dev Builds human-readable reason for risk level change
     * @param crossOpinion Whether cross-opinion violation occurred
     * @param timing Whether timing violation occurred
     * @param volume Whether volume violation occurred
     * @param coordination Whether coordination detected
     * @return Human-readable reason string
     */
    function _getRiskChangeReason(
        bool crossOpinion,
        bool timing,
        bool volume,
        bool coordination
    ) internal pure returns (string memory) {
        if (coordination) {
            if (crossOpinion && timing && volume) {
                return "Coordinated MEV + cross-opinion + timing + volume";
            } else if (crossOpinion && timing) {
                return "Coordinated MEV + cross-opinion + timing";
            } else if (crossOpinion && volume) {
                return "Coordinated MEV + cross-opinion + volume";
            } else if (timing && volume) {
                return "Coordinated MEV + timing + volume";
            } else if (crossOpinion) {
                return "Coordinated MEV + cross-opinion";
            } else if (timing) {
                return "Coordinated MEV + timing patterns";
            } else if (volume) {
                return "Coordinated MEV + volume patterns";
            } else {
                return "Coordinated MEV attack detected";
            }
        } else if (crossOpinion && timing && volume) {
            return "Cross-opinion + timing + volume violations";
        } else if (crossOpinion && timing) {
            return "Cross-opinion + timing violations";
        } else if (crossOpinion && volume) {
            return "Cross-opinion + volume violations";
        } else if (timing && volume) {
            return "Timing + volume violations";
        } else if (crossOpinion) {
            return "Cross-opinion MEV detected";
        } else if (timing) {
            return "Suspicious timing patterns";
        } else if (volume) {
            return "High volume MEV risk";
        }
        return "MEV risk assessment update";
    }
    
    // === VIEW FUNCTIONS ===
    
    /**
     * @dev Gets user's current MEV profile
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Complete MEV profile data
     */
    function getMevProfile(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (MevProfile memory) {
        return mevProfiles[user];
    }
    
    /**
     * @dev Checks if user is currently in MEV cooldown
     * @param user User address
     * @param mevProfiles Storage mapping for MEV profiles
     * @return Whether user is in cooldown
     */
    function isInMevCooldown(
        address user,
        mapping(address => MevProfile) storage mevProfiles
    ) external view returns (bool) {
        MevProfile storage profile = mevProfiles[user];
        MevRiskLevel riskLevel = MevRiskLevel(profile.riskLevel);
        
        if (riskLevel >= MevRiskLevel.HIGH) {
            return (block.number - profile.globalLastBlock) < MEV_GLOBAL_COOLDOWN;
        }
        
        return false;
    }
}