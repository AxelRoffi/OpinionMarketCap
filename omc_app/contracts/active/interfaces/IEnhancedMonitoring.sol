// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IEnhancedMonitoring
 * @dev Enhanced monitoring events for hybrid onchain/offchain observability
 * 
 * HYBRID ARCHITECTURE DESIGN:
 * - Critical events onchain for transparency + audit trail
 * - Rich context for backend analytics processing
 * - Gas-optimized with strategic event placement
 * - Future-proof structure for dashboard integration
 */
interface IEnhancedMonitoring {

    // === 🔥 CRITICAL ONCHAIN EVENTS (Gas Priority) ===
    
    /**
     * @dev Market regime transition event - CRITICAL for price transparency
     * Emitted when opinion activity level changes (COLD/WARM/HOT)
     * Backend Use: Real-time trading regime detection, price prediction analytics
     * @param opinionId Opinion identifier
     * @param fromLevel Previous activity level (0=COLD, 1=WARM, 2=HOT)
     * @param toLevel New activity level (0=COLD, 1=WARM, 2=HOT)
     * @param triggerType What triggered the change (0=time, 1=volume, 2=user_count, 3=admin)
     * @param timestamp When transition occurred
     * @param context Additional context (trading volume, user count, etc.)
     */
    event MarketRegimeChanged(
        uint256 indexed opinionId,
        uint8 fromLevel,
        uint8 toLevel,
        uint8 triggerType,
        uint256 timestamp,
        uint256 context
    );
    
    /**
     * @dev MEV protection trigger event - CRITICAL for security transparency
     * Emitted when MEV protection activates with penalty details
     * Backend Use: MEV pattern analysis, security dashboard alerts
     * @param user User affected by MEV protection
     * @param opinionId Opinion being traded
     * @param riskLevel MEV risk level (0=NONE, 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL, 5=BLOCKED)
     * @param penaltyType Type of penalty (0=none, 1=fee_increase, 2=cooldown, 3=block)
     * @param penaltyAmount Penalty amount or cooldown seconds
     * @param reason Short reason code for penalty
     */
    event MevProtectionTriggered(
        address indexed user,
        uint256 indexed opinionId,
        uint8 riskLevel,
        uint8 penaltyType,
        uint256 penaltyAmount,
        bytes32 reason
    );
    
    /**
     * @dev System performance monitoring event - CRITICAL for operational health
     * Emitted on significant system events for real-time monitoring
     * Backend Use: Performance dashboards, alert systems, capacity planning
     * @param metricType Type of metric (0=gas_usage, 1=validation_time, 2=error_rate, 3=volume_spike)
     * @param value Metric value
     * @param threshold Warning threshold that was crossed
     * @param component System component affected
     * @param severity Severity level (0=info, 1=warning, 2=critical)
     */
    event SystemPerformanceAlert(
        uint8 indexed metricType,
        uint256 value,
        uint256 threshold,
        bytes32 component,
        uint8 severity
    );
    
    /**
     * @dev Price impact analysis event - CRITICAL for market transparency
     * Emitted when significant price movements occur with analysis context
     * Backend Use: Market manipulation detection, price trend analysis
     * @param opinionId Opinion with price movement
     * @param oldPrice Previous price
     * @param newPrice New price after trade
     * @param impactPercentage Price impact percentage (scaled by 100)
     * @param volumeContext Trading volume context for impact
     * @param trader Address of trader causing impact
     */
    event PriceImpactAnalysis(
        uint256 indexed opinionId,
        uint96 oldPrice,
        uint96 newPrice,
        int256 impactPercentage,
        uint256 volumeContext,
        address indexed trader
    );
    
    /**
     * @dev User behavior pattern event - CRITICAL for anti-abuse transparency
     * Emitted when user behavior analysis detects significant patterns
     * Backend Use: User segmentation, bot detection refinement, behavior analytics
     * @param user User being analyzed
     * @param patternType Pattern detected (0=normal, 1=suspicious, 2=bot_like, 3=whale, 4=coordinated)
     * @param confidence Confidence level (0-100)
     * @param actionTaken Action taken (0=none, 1=flag, 2=penalty, 3=block)
     * @param dataPoints Number of data points used in analysis
     */
    event UserBehaviorPattern(
        address indexed user,
        uint8 patternType,
        uint8 confidence,
        uint8 actionTaken,
        uint32 dataPoints
    );

    // === 💡 BUSINESS INTELLIGENCE EVENTS (Analytics Priority) ===
    
    /**
     * @dev Trading volume milestone event - for business KPI tracking
     * Emitted when volume milestones are reached for opinions or system
     * Backend Use: Business dashboards, milestone tracking, growth analytics
     * @param scope Scope of milestone (0=opinion, 1=daily, 2=weekly, 3=total)
     * @param identifier Opinion ID or 0 for system-wide
     * @param milestone Milestone value reached
     * @param timeToReach Time taken to reach milestone (seconds)
     * @param previousMilestone Previous milestone value
     */
    event VolumeMilestone(
        uint8 indexed scope,
        uint256 identifier,
        uint256 milestone,
        uint256 timeToReach,
        uint256 previousMilestone
    );
    
    /**
     * @dev User engagement analytics event - for user behavior insights
     * Emitted periodically to track user engagement patterns
     * Backend Use: User retention analysis, engagement optimization
     * @param user User address
     * @param engagementType Type of engagement (0=opinion_creation, 1=trading, 2=pool_participation)
     * @param frequency Frequency score (0-100)
     * @param quality Quality score (0-100)
     * @param streak Current engagement streak (days)
     * @param totalValue Total value of user's activity
     */
    event UserEngagementMetrics(
        address indexed user,
        uint8 engagementType,
        uint8 frequency,
        uint8 quality,
        uint32 streak,
        uint256 totalValue
    );
    
    /**
     * @dev Market efficiency metrics event - for market health monitoring
     * Emitted to track market efficiency and pricing accuracy
     * Backend Use: Market efficiency dashboards, pricing algorithm optimization
     * @param opinionId Opinion being analyzed
     * @param efficiencyScore Market efficiency score (0-100)
     * @param priceDiscovery Price discovery effectiveness (0-100)
     * @param liquidityDepth Liquidity depth indicator
     * @param volatility Volatility measure
     * @param participantDiversity Number of unique participants
     */
    event MarketEfficiencyMetrics(
        uint256 indexed opinionId,
        uint8 efficiencyScore,
        uint8 priceDiscovery,
        uint32 liquidityDepth,
        uint32 volatility,
        uint32 participantDiversity
    );

    // === 🎯 ADMIN DASHBOARD EVENTS (Operational Priority) ===
    
    /**
     * @dev Revenue analytics event - for financial dashboard
     * Emitted to track revenue generation across different sources
     * Backend Use: Revenue dashboards, financial planning, fee optimization
     * @param source Revenue source (0=opinion_creation, 1=trading_fees, 2=pool_fees, 3=question_sales)
     * @param amount Revenue amount
     * @param feeType Fee type breakdown (0=platform, 1=creator, 2=other)
     * @param timeframe Timeframe for aggregation (0=transaction, 1=hour, 2=day)
     * @param cumulativeTotal Cumulative total for this source
     */
    event RevenueAnalytics(
        uint8 indexed source,
        uint256 amount,
        uint8 feeType,
        uint8 timeframe,
        uint256 cumulativeTotal
    );
    
    /**
     * @dev Security incident event - for security dashboard monitoring
     * Emitted when security systems detect potential incidents
     * Backend Use: Security dashboards, incident response, threat analysis
     * @param incidentType Type of security incident (0=attempted_exploit, 1=unusual_pattern, 2=rate_limit, 3=validation_fail)
     * @param severity Incident severity (0=low, 1=medium, 2=high, 3=critical)
     * @param affected Number of affected entities (users/opinions/etc.)
     * @param mitigationApplied Mitigation applied (0=none, 1=rate_limit, 2=block, 3=pause)
     * @param details Incident details hash for investigation
     */
    event SecurityIncident(
        uint8 indexed incidentType,
        uint8 severity,
        uint32 affected,
        uint8 mitigationApplied,
        bytes32 details
    );
    
    /**
     * @dev Operational health event - for system status monitoring
     * Emitted to track overall system operational status
     * Backend Use: Health dashboards, uptime monitoring, capacity planning
     * @param healthScore Overall system health score (0-100)
     * @param componentStatus Status of system components (bitfield)
     * @param activeUsers Number of active users
     * @param processingLoad Current processing load (0-100)
     * @param errorRate Current error rate (per 10000)
     * @param timestamp Status timestamp
     */
    event OperationalHealth(
        uint8 healthScore,
        uint256 componentStatus,
        uint32 activeUsers,
        uint8 processingLoad,
        uint16 errorRate,
        uint256 timestamp
    );

    // === 📊 EVENT ENRICHMENT PATTERNS ===
    
    /**
     * @dev Context enrichment event - for detailed analytics
     * Emitted alongside major events to provide rich context for backend processing
     * Backend Use: Event correlation, advanced analytics, machine learning features
     * @param primaryEventHash Hash of the primary event this enriches
     * @param contextType Type of context (0=user_history, 1=market_conditions, 2=system_state, 3=external_factors)
     * @param dataHash Hash of enrichment data (for off-chain correlation)
     * @param importance Importance score for analytics prioritization (0-100)
     */
    event ContextEnrichment(
        bytes32 indexed primaryEventHash,
        uint8 contextType,
        bytes32 dataHash,
        uint8 importance
    );
    
    /**
     * @dev Batch operation summary event - for efficient bulk monitoring
     * Emitted to summarize batch operations without individual event spam
     * Backend Use: Batch processing analytics, system efficiency monitoring
     * @param operationType Type of batch operation (0=opinion_updates, 1=fee_distributions, 2=pool_operations)
     * @param itemCount Number of items processed in batch
     * @param successCount Number of successful operations
     * @param totalValue Total value processed in batch
     * @param avgGasPerItem Average gas used per item
     * @param batchId Unique identifier for batch correlation
     */
    event BatchOperationSummary(
        uint8 indexed operationType,
        uint32 itemCount,
        uint32 successCount,
        uint256 totalValue,
        uint32 avgGasPerItem,
        bytes32 batchId
    );

    // === 🔄 REAL-TIME MONITORING TRIGGERS ===
    
    /**
     * @dev Real-time alert trigger event - for immediate attention needs
     * Emitted when conditions require immediate admin attention
     * Backend Use: Real-time alerting, push notifications, emergency response
     * @param alertLevel Alert level (0=info, 1=warning, 2=urgent, 3=critical)
     * @param category Alert category (0=security, 1=performance, 2=financial, 3=operational)
     * @param message Short alert message
     * @param requiredAction Required action type (0=monitor, 1=investigate, 2=immediate_action)
     * @param autoResolution Auto-resolution timestamp (0 if manual resolution required)
     */
    event RealTimeAlert(
        uint8 indexed alertLevel,
        uint8 category,
        bytes32 message,
        uint8 requiredAction,
        uint256 autoResolution
    );
    
    /**
     * @dev Dashboard update trigger event - for UI refresh coordination
     * Emitted when dashboards should refresh specific data views
     * Backend Use: Dashboard synchronization, selective UI updates, WebSocket triggers
     * @param dashboardType Dashboard that needs updating (0=main, 1=security, 2=analytics, 3=financial)
     * @param updateScope Scope of update needed (0=full, 1=partial, 2=single_metric)
     * @param dataCategory Category of data changed (0=opinions, 1=users, 2=fees, 3=security)
     * @param priority Update priority (0=low, 1=normal, 2=high, 3=immediate)
     * @param batchable Whether update can be batched with others
     */
    event DashboardUpdateTrigger(
        uint8 indexed dashboardType,
        uint8 updateScope,
        uint8 dataCategory,
        uint8 priority,
        bool batchable
    );
}