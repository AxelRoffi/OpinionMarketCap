// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Treasury Timelock Example
 * @dev Practical example showing how treasury timelock works
 */

contract OpinionCoreTreasuryExample {
    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;
    
    mapping(address => uint256) public accumulatedFees;
    
    event TreasuryChangeScheduled(address indexed currentTreasury, address indexed newTreasury, uint256 executeAfter);
    event TreasuryChanged(address indexed oldTreasury, address indexed newTreasury);
    event TreasuryChangeTimelockCancelled(address indexed cancelledTreasury);
    
    modifier onlyAdmin() {
        require(msg.sender == treasury, "Only admin");
        _;
    }
    
    // ========================================
    // IMMEDIATE OPERATIONS (NO DELAYS)
    // ========================================
    
    /**
     * @dev Users pay fees - IMMEDIATE, no timelock
     * This is how your protocol makes money - unaffected by timelock
     */
    function submitAnswer(string memory answer) external payable {
        uint256 fee = msg.value;
        
        // Platform fee goes to treasury immediately
        uint256 platformFee = (fee * 10) / 100;
        accumulatedFees[treasury] += platformFee;
        
        // User gets their answer recorded
        // ... rest of answer submission logic
        
        // 💰 MONEY FLOWS TO TREASURY IMMEDIATELY - NO DELAY
    }
    
    /**
     * @dev Withdraw fees - IMMEDIATE, no timelock  
     * You can access your money anytime
     */
    function withdrawFees() external onlyAdmin {
        uint256 amount = accumulatedFees[treasury];
        require(amount > 0, "No fees to withdraw");
        
        accumulatedFees[treasury] = 0;
        payable(treasury).transfer(amount);
        
        // 💰 YOU GET YOUR MONEY IMMEDIATELY - NO DELAY
    }
    
    /**
     * @dev Emergency pause - IMMEDIATE, no timelock
     * Critical for security
     */
    function emergencyPause() external onlyAdmin {
        // Pause protocol immediately
        // Cancel any pending treasury changes
        if (pendingTreasury != address(0)) {
            emit TreasuryChangeTimelockCancelled(pendingTreasury);
            pendingTreasury = address(0);
            treasuryChangeTimestamp = 0;
        }
        
        // 🚨 EMERGENCY PROTECTION - IMMEDIATE
    }
    
    // ========================================
    // DELAYED OPERATIONS (48 HOUR TIMELOCK)
    // ========================================
    
    /**
     * @dev Schedule treasury change - starts 48-hour countdown
     * This is the ONLY operation that has a delay
     */
    function scheduleTreasuryChange(address newTreasury) external onlyAdmin {
        require(newTreasury != address(0), "Invalid treasury address");
        require(newTreasury != treasury, "Same as current treasury");
        
        pendingTreasury = newTreasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;
        
        emit TreasuryChangeScheduled(treasury, newTreasury, treasuryChangeTimestamp);
        
        // 📢 PUBLIC ANNOUNCEMENT: Treasury will change in 48 hours
        // Community can see this and react if it's malicious
    }
    
    /**
     * @dev Execute treasury change - only after 48-hour delay
     */
    function executeTreasuryChange() external onlyAdmin {
        require(pendingTreasury != address(0), "No treasury change scheduled");
        require(block.timestamp >= treasuryChangeTimestamp, "Timelock not expired");
        
        address oldTreasury = treasury;
        treasury = pendingTreasury;
        
        // Clear pending state
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;
        
        emit TreasuryChanged(oldTreasury, treasury);
        
        // ✅ TREASURY OFFICIALLY CHANGED AFTER 48 HOURS
    }
    
    /**
     * @dev Cancel scheduled treasury change
     * You can cancel anytime before execution
     */
    function cancelTreasuryChange() external onlyAdmin {
        require(pendingTreasury != address(0), "No treasury change scheduled");
        
        emit TreasuryChangeTimelockCancelled(pendingTreasury);
        
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;
        
        // ❌ CANCELLED - Treasury stays the same
    }
    
    // ========================================
    // VIEW FUNCTIONS
    // ========================================
    
    /**
     * @dev Check if treasury change can be executed
     */
    function canExecuteTreasuryChange() external view returns (bool) {
        return (
            pendingTreasury != address(0) && 
            block.timestamp >= treasuryChangeTimestamp
        );
    }
    
    /**
     * @dev Get time remaining until treasury change can be executed
     */
    function getTimeUntilTreasuryChange() external view returns (uint256) {
        if (pendingTreasury == address(0)) return 0;
        if (block.timestamp >= treasuryChangeTimestamp) return 0;
        return treasuryChangeTimestamp - block.timestamp;
    }
    
    /**
     * @dev Get current treasury status
     */
    function getTreasuryStatus() external view returns (
        address currentTreasury,
        address scheduledTreasury,
        uint256 changeExecuteAfter,
        uint256 timeRemaining
    ) {
        currentTreasury = treasury;
        scheduledTreasury = pendingTreasury;
        changeExecuteAfter = treasuryChangeTimestamp;
        
        if (pendingTreasury != address(0) && block.timestamp < treasuryChangeTimestamp) {
            timeRemaining = treasuryChangeTimestamp - block.timestamp;
        } else {
            timeRemaining = 0;
        }
    }
}

// ========================================
// PRACTICAL USAGE EXAMPLES
// ========================================

/*
DAILY OPERATIONS (No delays):
1. Users submit answers and pay fees ✅ Immediate
2. Fees accumulate in treasury ✅ Immediate  
3. You withdraw fees ✅ Immediate
4. You use money for operations ✅ Immediate
5. Emergency pause if needed ✅ Immediate

ADMINISTRATIVE CHANGES (48h delay):
1. Monday 9 AM: scheduleTreasuryChange(newAddress)
2. Tuesday: Community can see the change coming
3. Wednesday 9 AM: executeTreasuryChange()
4. New treasury is now active

SECURITY SCENARIO:
1. Attacker compromises your key
2. Attacker calls scheduleTreasuryChange(attackerAddress)
3. You see the scheduled change in dashboard
4. You call emergencyPause() and cancelTreasuryChange()
5. Crisis avoided!

REVENUE IMPACT:
- ✅ You still collect fees immediately
- ✅ You still withdraw money immediately  
- ✅ You still control treasury operations
- ⏰ Just changing treasury address takes 48 hours

OPERATIONAL IMPACT:
- 99.9% of operations: No change
- 0.1% of operations: 48-hour planning required
*/