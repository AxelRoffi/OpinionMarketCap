// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleSoloTimelock
 * @dev Ultra-simple timelock for solo developers
 * NO MULTISIG - just adds delays to admin functions for security
 */
library SimpleSoloTimelock {
    
    // ═══════════════════════════════════════════════════════════════
    // SIMPLE TIMELOCK CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public constant ADMIN_FUNCTION_DELAY = 24 hours;     // Parameter changes
    uint256 public constant UPGRADE_DELAY = 72 hours;           // Contract upgrades
    uint256 public constant GRACE_PERIOD = 7 days;              // Actions expire after this
    
    // ═══════════════════════════════════════════════════════════════
    // DATA STRUCTURES
    // ═══════════════════════════════════════════════════════════════
    
    struct ScheduledAction {
        uint256 executeAfter;       // When action can be executed
        bool executed;              // Whether action was executed
        bool cancelled;             // Whether action was cancelled
        bytes data;                 // Function call data
        address target;             // Target contract (usually address(this))
        string description;         // Human readable description
    }
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    event ActionScheduled(
        bytes32 indexed actionId,
        uint256 executeAfter,
        string description
    );
    
    event ActionExecuted(
        bytes32 indexed actionId,
        string description
    );
    
    event ActionCancelled(
        bytes32 indexed actionId,
        string reason
    );
    
    // ═══════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Schedules an admin function with delay
     * @param actionId Unique identifier for the action
     * @param delay Delay in seconds (24h for admin, 72h for upgrades)
     * @param data Function call data to execute later
     * @param description Human readable description
     * @param scheduledActions Storage mapping for scheduled actions
     */
    function scheduleAction(
        bytes32 actionId,
        uint256 delay,
        bytes memory data,
        string memory description,
        mapping(bytes32 => ScheduledAction) storage scheduledActions
    ) internal {
        require(scheduledActions[actionId].executeAfter == 0, "Action already scheduled");
        
        uint256 executeAfter = block.timestamp + delay;
        
        scheduledActions[actionId] = ScheduledAction({
            executeAfter: executeAfter,
            executed: false,
            cancelled: false,
            data: data,
            target: address(this),
            description: description
        });
        
        emit ActionScheduled(actionId, executeAfter, description);
    }
    
    /**
     * @dev Executes a scheduled action after delay
     * @param actionId Action identifier
     * @param scheduledActions Storage mapping for scheduled actions
     * @return success Whether execution succeeded
     * @return result Return data from function call
     */
    function executeAction(
        bytes32 actionId,
        mapping(bytes32 => ScheduledAction) storage scheduledActions
    ) internal returns (bool success, bytes memory result) {
        ScheduledAction storage action = scheduledActions[actionId];
        
        require(action.executeAfter != 0, "Action not scheduled");
        require(!action.executed, "Action already executed");
        require(!action.cancelled, "Action cancelled");
        require(block.timestamp >= action.executeAfter, "Timelock not expired");
        require(block.timestamp <= action.executeAfter + GRACE_PERIOD, "Action expired");
        
        // Mark as executed first (reentrancy protection)
        action.executed = true;
        
        // Execute the action
        (success, result) = action.target.call(action.data);
        
        if (success) {
            emit ActionExecuted(actionId, action.description);
        }
        
        return (success, result);
    }
    
    /**
     * @dev Cancels a scheduled action
     * @param actionId Action identifier
     * @param reason Reason for cancellation
     * @param scheduledActions Storage mapping for scheduled actions
     */
    function cancelAction(
        bytes32 actionId,
        string memory reason,
        mapping(bytes32 => ScheduledAction) storage scheduledActions
    ) internal {
        ScheduledAction storage action = scheduledActions[actionId];
        
        require(action.executeAfter != 0, "Action not scheduled");
        require(!action.executed, "Action already executed");
        require(!action.cancelled, "Action already cancelled");
        
        action.cancelled = true;
        
        emit ActionCancelled(actionId, reason);
    }
    
    /**
     * @dev Generates a unique action ID
     * @param functionSelector Function selector (e.g., bytes4(keccak256("setMinimumPrice(uint256)")))
     * @param params Encoded parameters
     * @return actionId Unique identifier for this action
     */
    function generateActionId(
        bytes4 functionSelector,
        bytes memory params
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            functionSelector,
            params,
            block.timestamp,
            block.number
        ));
    }
    
    /**
     * @dev Gets action details
     * @param actionId Action identifier
     * @param scheduledActions Storage mapping for scheduled actions
     * @return action The scheduled action details
     */
    function getAction(
        bytes32 actionId,
        mapping(bytes32 => ScheduledAction) storage scheduledActions
    ) internal view returns (ScheduledAction memory) {
        return scheduledActions[actionId];
    }
    
    /**
     * @dev Checks if action can be executed
     * @param actionId Action identifier
     * @param scheduledActions Storage mapping for scheduled actions
     * @return canExecute Whether action is ready to execute
     * @return timeRemaining Seconds until action can be executed (0 if ready)
     */
    function canExecuteAction(
        bytes32 actionId,
        mapping(bytes32 => ScheduledAction) storage scheduledActions
    ) internal view returns (bool canExecute, uint256 timeRemaining) {
        ScheduledAction storage action = scheduledActions[actionId];
        
        if (action.executeAfter == 0 || action.executed || action.cancelled) {
            return (false, 0);
        }
        
        if (block.timestamp >= action.executeAfter + GRACE_PERIOD) {
            return (false, 0); // Expired
        }
        
        if (block.timestamp >= action.executeAfter) {
            return (true, 0);
        }
        
        return (false, action.executeAfter - block.timestamp);
    }
}

/**
 * @title SoloTimelockAdmin  
 * @dev Mixin contract for adding simple timelock to admin functions
 */
abstract contract SoloTimelockAdmin {
    
    // Storage for scheduled actions
    mapping(bytes32 => SimpleSoloTimelock.ScheduledAction) internal _scheduledActions;
    
    // ═══════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Modifier that requires function to be executed through timelock
     * @param actionId The action ID for this function call
     */
    modifier onlyAfterTimelock(bytes32 actionId) {
        (bool success, bytes memory result) = SimpleSoloTimelock.executeAction(actionId, _scheduledActions);
        require(success, "Timelock execution failed");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // TIMELOCK MANAGEMENT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Schedules an admin function for execution after delay
     * @param functionSelector Function to schedule (e.g., this.setMinimumPrice.selector)
     * @param params Encoded function parameters
     * @param description Human readable description
     * @return actionId The action ID for later execution
     */
    function scheduleAdminAction(
        bytes4 functionSelector,
        bytes memory params,
        string memory description
    ) internal returns (bytes32 actionId) {
        actionId = SimpleSoloTimelock.generateActionId(functionSelector, params);
        bytes memory data = abi.encodePacked(functionSelector, params);
        
        SimpleSoloTimelock.scheduleAction(
            actionId,
            SimpleSoloTimelock.ADMIN_FUNCTION_DELAY,
            data,
            description,
            _scheduledActions
        );
        
        return actionId;
    }
    
    /**
     * @dev Schedules an upgrade for execution after delay
     * @param newImplementation New contract implementation
     * @param description Description of the upgrade
     * @return actionId The action ID for later execution
     */
    function scheduleUpgrade(
        address newImplementation,
        string memory description
    ) internal returns (bytes32 actionId) {
        bytes memory params = abi.encode(newImplementation);
        actionId = SimpleSoloTimelock.generateActionId(bytes4(keccak256("_upgradeTo(address)")), params);
        bytes memory data = abi.encodeWithSignature("_upgradeTo(address)", newImplementation);
        
        SimpleSoloTimelock.scheduleAction(
            actionId,
            SimpleSoloTimelock.UPGRADE_DELAY,
            data,
            description,
            _scheduledActions
        );
        
        return actionId;
    }
    
    /**
     * @dev Cancels a scheduled action
     * @param actionId Action to cancel
     * @param reason Reason for cancellation
     */
    function cancelScheduledAction(bytes32 actionId, string memory reason) internal {
        SimpleSoloTimelock.cancelAction(actionId, reason, _scheduledActions);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Gets details of a scheduled action
     */
    function getScheduledAction(bytes32 actionId) 
        external 
        view 
        returns (SimpleSoloTimelock.ScheduledAction memory) 
    {
        return SimpleSoloTimelock.getAction(actionId, _scheduledActions);
    }
    
    /**
     * @dev Checks if action can be executed
     */
    function canExecuteScheduledAction(bytes32 actionId) 
        external 
        view 
        returns (bool canExecute, uint256 timeRemaining) 
    {
        return SimpleSoloTimelock.canExecuteAction(actionId, _scheduledActions);
    }
}