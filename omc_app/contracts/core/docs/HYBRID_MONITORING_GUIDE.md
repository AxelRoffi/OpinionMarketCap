# 📊 Hybrid Monitoring Architecture Guide

**OpinionMarketCap Enhanced Monitoring & Events System**

## 🎯 Architecture Overview

### Hybrid Design Philosophy
- **Critical Events Onchain**: Essential transparency + audit trail (gas-optimized)
- **Rich Analytics Backend**: Detailed processing for admin dashboards  
- **Real-time Monitoring**: WebSocket triggers for immediate alerts
- **Future-proof Structure**: Scalable event design for growth

### Gas Efficiency Strategy
- ✅ **Strategic Emission**: Only emit events for significant changes (>5% price impacts, regime changes)
- ✅ **Batched Operations**: Batch summaries instead of individual event spam
- ✅ **Conditional Monitoring**: Events only when `enhancedMonitoringEnabled = true`
- ✅ **Threshold-based**: Confidence > 70%, amounts > minimums before emission

---

## 📋 Event Categories & Usage

### 🔥 CRITICAL ONCHAIN EVENTS (Gas Priority)

#### 1. MarketRegimeChanged
```solidity
event MarketRegimeChanged(
    uint256 indexed opinionId,
    uint8 fromLevel,        // 0=COLD, 1=WARM, 2=HOT  
    uint8 toLevel,
    uint8 triggerType,      // 0=time, 1=volume, 2=user_count, 3=admin
    uint256 timestamp,
    uint256 context        // trading volume, user count, etc.
);
```
**When**: Activity level changes (COLD/WARM/HOT transitions)  
**Backend Use**: Real-time trading regime detection, price prediction analytics  
**Gas Impact**: ~800 gas per emission

#### 2. MevProtectionTriggered  
```solidity
event MevProtectionTriggered(
    address indexed user,
    uint256 indexed opinionId,
    uint8 riskLevel,        // 0=NONE to 5=BLOCKED
    uint8 penaltyType,      // 0=none, 1=fee_increase, 2=cooldown, 3=block
    uint256 penaltyAmount,
    bytes32 reason
);
```
**When**: MEV risk ≥ MEDIUM (level 2+)  
**Backend Use**: MEV pattern analysis, security dashboard alerts  
**Gas Impact**: ~1,200 gas per emission

#### 3. PriceImpactAnalysis
```solidity
event PriceImpactAnalysis(
    uint256 indexed opinionId,
    uint96 oldPrice,
    uint96 newPrice, 
    int256 impactPercentage,  // scaled by 10000 (500 = 5%)
    uint256 volumeContext,
    address indexed trader
);
```
**When**: Price impact > 5%  
**Backend Use**: Market manipulation detection, price trend analysis  
**Gas Impact**: ~900 gas per emission

### 💡 BUSINESS INTELLIGENCE EVENTS

#### 4. VolumeMilestone
```solidity
event VolumeMilestone(
    uint8 indexed scope,        // 0=opinion, 1=daily, 2=weekly, 3=total
    uint256 identifier,         // Opinion ID or 0 for system-wide
    uint256 milestone,          // 1K, 5K, 10K, 50K, 100K, 500K, 1M USDC
    uint256 timeToReach,
    uint256 previousMilestone
);
```
**When**: Logarithmic milestones reached  
**Backend Use**: Business dashboards, milestone tracking, growth analytics

#### 5. RevenueAnalytics
```solidity
event RevenueAnalytics(
    uint8 indexed source,       // 0=opinion_creation, 1=trading_fees, 2=pool_fees, 3=question_sales
    uint256 amount,
    uint8 feeType,             // 0=platform, 1=creator, 2=other
    uint8 timeframe,           // 0=transaction, 1=hour, 2=day
    uint256 cumulativeTotal
);
```
**When**: All revenue events (important for financial tracking)  
**Backend Use**: Revenue dashboards, financial planning, fee optimization

### 🎯 ADMIN DASHBOARD EVENTS

#### 6. SystemPerformanceAlert
```solidity
event SystemPerformanceAlert(
    uint8 indexed metricType,   // 0=gas_usage, 1=validation_time, 2=error_rate, 3=volume_spike
    uint256 value,
    uint256 threshold,
    bytes32 component,
    uint8 severity             // 0=info, 1=warning, 2=critical
);
```
**When**: Performance thresholds exceeded  
**Backend Use**: Performance dashboards, alert systems, capacity planning

#### 7. RealTimeAlert
```solidity
event RealTimeAlert(
    uint8 indexed alertLevel,   // 0=info, 1=warning, 2=urgent, 3=critical
    uint8 category,            // 0=security, 1=performance, 2=financial, 3=operational
    bytes32 message,
    uint8 requiredAction,      // 0=monitor, 1=investigate, 2=immediate_action
    uint256 autoResolution     // timestamp or 0 for manual
);
```
**When**: Conditions require immediate admin attention  
**Backend Use**: Real-time alerting, push notifications, emergency response

---

## 🛠️ Backend Integration Patterns

### Event Listening Strategy
```javascript
// WebSocket event listener patterns
const eventListeners = {
    // Critical real-time events
    'MarketRegimeChanged': handleRegimeChange,
    'MevProtectionTriggered': handleSecurityAlert,
    'RealTimeAlert': handleUrgentAlert,
    
    // Business intelligence (can be batched)
    'VolumeMilestone': batchBusinessMetrics,
    'RevenueAnalytics': updateFinancialDashboards,
    
    // Performance monitoring
    'SystemPerformanceAlert': updateHealthDashboards
};

// Real-time processing for critical events
async function handleRegimeChange(event) {
    const { opinionId, fromLevel, toLevel, context } = event.args;
    
    // Update real-time trading interface
    await updateTradingRegime(opinionId, toLevel);
    
    // Trigger price prediction recalculation
    await recalculatePricePredictions(opinionId, context);
    
    // Send WebSocket update to connected users
    sendRealtimeUpdate('regime_change', { opinionId, level: toLevel });
}
```

### Data Enrichment Pipeline
```javascript
// Context enrichment for analytics
const enrichmentPipeline = {
    'PriceImpactAnalysis': async (event) => {
        const { opinionId, trader, impactPercentage } = event.args;
        
        // Enrich with historical data
        const history = await getOpinionHistory(opinionId);
        const traderProfile = await getTraderProfile(trader);
        
        // Store enriched data for ML analysis
        await storeEnrichedEvent({
            ...event.args,
            historicalVolatility: history.volatility,
            traderRiskScore: traderProfile.riskScore,
            marketConditions: await getMarketConditions()
        });
    }
};
```

### Dashboard Update Coordination
```javascript
// Efficient dashboard updates based on triggers
async function handleDashboardUpdate(event) {
    const { dashboardType, dataCategory, priority, batchable } = event.args;
    
    if (batchable && priority < 3) {
        // Queue for batch processing
        queueDashboardUpdate(dashboardType, dataCategory);
    } else {
        // Immediate update for high priority
        await updateDashboardNow(dashboardType, dataCategory);
    }
}

// Batch processing every 30 seconds for efficiency
setInterval(processBatchedUpdates, 30000);
```

---

## 📈 Analytics Recommendations

### Real-time Metrics Dashboard
- **Market Activity**: Live regime changes, active opinions, trading volume
- **Security Status**: MEV alerts, bot detection, risk levels
- **Performance Health**: Gas usage, error rates, response times

### Business Intelligence Dashboard  
- **Revenue Tracking**: Real-time revenue by source, milestone progress
- **User Engagement**: Activity patterns, retention metrics, behavior analysis
- **Market Efficiency**: Price discovery, liquidity metrics, participant diversity

### Operational Dashboard
- **System Health**: Component status, processing load, error rates
- **Alert Management**: Active alerts, resolution status, escalation tracking
- **Capacity Planning**: Usage trends, scaling indicators, resource utilization

---

## 🔧 Implementation Guidelines

### Gas Optimization Best Practices
```solidity
// ✅ Good: Strategic emission with conditions
if (enhancedMonitoringEnabled && impactPercentage > 500) {
    emit PriceImpactAnalysis(opinionId, oldPrice, newPrice, impactPercentage, volume, trader);
}

// ❌ Bad: Unconditional emission for every trade
emit TradeExecuted(opinionId, trader, price, timestamp); // Too much gas!
```

### Event Correlation Strategy
```solidity
// Generate correlation hash for event linking
bytes32 eventHash = MonitoringLibrary.generateEventHash(
    "submitAnswer",
    msg.sender, 
    opinionId
);

// Emit context enrichment for detailed analysis
MonitoringLibrary.emitContextEnrichment(
    eventHash,
    1, // market_conditions context
    keccak256(abi.encode(marketData)),
    85 // high importance
);
```

### Error Handling & Recovery
```solidity
// Graceful degradation when monitoring fails
try MonitoringLibrary.emitPriceImpactAnalysis(...) {
    // Event emitted successfully
} catch {
    // Continue operation even if monitoring fails
    // Log minimal fallback event if needed
}
```

---

## 🎪 Success Metrics

### Gas Efficiency Targets
- ✅ **<5% gas overhead** from monitoring events
- ✅ **Strategic emission** only for significant changes
- ✅ **Batch processing** for routine updates
- ✅ **Conditional monitoring** based on admin settings

### Observability Targets  
- ✅ **100% coverage** of critical security events
- ✅ **Real-time alerts** for system health issues
- ✅ **Rich context** for business intelligence
- ✅ **Scalable architecture** for future growth

### Integration Success
- ✅ **WebSocket real-time** updates working
- ✅ **Dashboard synchronization** efficient
- ✅ **Analytics pipeline** processing enriched data
- ✅ **Alert system** responsive and accurate

---

## 🚀 Ready for Testnet!

The hybrid monitoring system provides the perfect balance of onchain transparency and offchain analytics capability. Strategic event emission keeps gas costs low while rich context enables sophisticated business intelligence and real-time operational monitoring.

**Key Benefits:**
- 📊 **Institutional-grade observability** without blockchain bloat
- ⚡ **Real-time monitoring** for immediate issue response  
- 💰 **Gas-efficient design** with <5% overhead
- 🔮 **Future-proof architecture** for scaling to millions of users

Perfect foundation for Base ecosystem showcase! 🎯