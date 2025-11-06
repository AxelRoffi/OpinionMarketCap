// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title TimelockSecurity
 * @dev Solo developer security solution with time delays for critical functions
 */
contract TimelockSecurity is AccessControlUpgradeable, PausableUpgradeable {
    
    bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");
    
    struct ScheduledAction {
        uint256 executeAfter;
        bool executed;
        bytes data;
        address target;
        uint256 value;
    }
    
    mapping(bytes32 => ScheduledAction) public scheduledActions;
    
    // Different delay periods for different action types
    uint256 public constant EMERGENCY_DELAY = 0; // Immediate
    uint256 public constant PARAMETER_DELAY = 24 hours;
    uint256 public constant TREASURY_DELAY = 48 hours;
    uint256 public constant UPGRADE_DELAY = 72 hours;
    uint256 public constant GRACE_PERIOD = 7 days;
    
    // Emergency pause settings
    uint256 public pausedAt;
    uint256 public constant AUTO_UNPAUSE_DELAY = 24 hours;
    
    event ActionScheduled(bytes32 indexed actionId, uint256 executeAfter, string actionType);
    event ActionExecuted(bytes32 indexed actionId, address indexed executor);
    event ActionCancelled(bytes32 indexed actionId, address indexed canceller);
    event EmergencyPauseActivated(address indexed by, uint256 timestamp);
    event AutoUnpauseScheduled(uint256 unperseAt);
    
    modifier onlyAfterTimelock(bytes32 actionId) {
        ScheduledAction storage action = scheduledActions[actionId];
        require(action.executeAfter != 0, "Action not scheduled");
        require(block.timestamp >= action.executeAfter, "Timelock not expired");
        require(block.timestamp <= action.executeAfter + GRACE_PERIOD, "Action expired");
        require(!action.executed, "Action already executed");
        _;
        action.executed = true;
        emit ActionExecuted(actionId, msg.sender);
    }
    
    /**
     * @dev Initialize the timelock security system
     */
    function __TimelockSecurity_init(address admin) internal onlyInitializing {
        __AccessControl_init();
        __Pausable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TIMELOCK_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Schedule a parameter change with 24-hour delay
     */
    function scheduleParameterChange(
        string memory paramName,
        uint256 newValue,
        bytes calldata data
    ) external onlyRole(TIMELOCK_ADMIN_ROLE) {
        bytes32 actionId = keccak256(abi.encodePacked("param", paramName, block.timestamp));
        
        scheduledActions[actionId] = ScheduledAction({
            executeAfter: block.timestamp + PARAMETER_DELAY,
            executed: false,
            data: data,
            target: address(this),
            value: 0
        });
        
        emit ActionScheduled(actionId, block.timestamp + PARAMETER_DELAY, "parameter");
    }
    
    /**
     * @dev Schedule a treasury change with 48-hour delay
     */
    function scheduleTreasuryChange(
        address newTreasury,
        bytes calldata data
    ) external onlyRole(TIMELOCK_ADMIN_ROLE) {
        bytes32 actionId = keccak256(abi.encodePacked("treasury", newTreasury, block.timestamp));
        
        scheduledActions[actionId] = ScheduledAction({
            executeAfter: block.timestamp + TREASURY_DELAY,
            executed: false,
            data: data,
            target: address(this),
            value: 0
        });
        
        emit ActionScheduled(actionId, block.timestamp + TREASURY_DELAY, "treasury");
    }
    
    /**
     * @dev Schedule an upgrade with 72-hour delay
     */
    function scheduleUpgrade(
        address newImplementation,
        bytes calldata data
    ) external onlyRole(TIMELOCK_ADMIN_ROLE) {
        bytes32 actionId = keccak256(abi.encodePacked("upgrade", newImplementation, block.timestamp));
        
        scheduledActions[actionId] = ScheduledAction({
            executeAfter: block.timestamp + UPGRADE_DELAY,
            executed: false,
            data: data,
            target: address(this),
            value: 0
        });
        
        emit ActionScheduled(actionId, block.timestamp + UPGRADE_DELAY, "upgrade");
    }
    
    /**
     * @dev Execute a scheduled action after timelock expires
     */
    function executeScheduledAction(bytes32 actionId) 
        external 
        onlyRole(TIMELOCK_ADMIN_ROLE)
        onlyAfterTimelock(actionId) 
    {
        ScheduledAction storage action = scheduledActions[actionId];
        
        (bool success, bytes memory result) = action.target.call{value: action.value}(action.data);
        require(success, "Action execution failed");
        
        emit ActionExecuted(actionId, msg.sender);
    }
    
    /**
     * @dev Cancel a scheduled action before execution
     */
    function cancelScheduledAction(bytes32 actionId) 
        external 
        onlyRole(TIMELOCK_ADMIN_ROLE) 
    {
        require(scheduledActions[actionId].executeAfter != 0, "Action not scheduled");
        require(!scheduledActions[actionId].executed, "Action already executed");
        
        delete scheduledActions[actionId];
        emit ActionCancelled(actionId, msg.sender);
    }
    
    /**
     * @dev Emergency pause - can be done immediately
     */
    function emergencyPause() external onlyRole(TIMELOCK_ADMIN_ROLE) {
        _pause();
        pausedAt = block.timestamp;
        
        emit EmergencyPauseActivated(msg.sender, block.timestamp);
        emit AutoUnpauseScheduled(block.timestamp + AUTO_UNPAUSE_DELAY);
    }
    
    /**
     * @dev Manual unpause (admin can unpause anytime)
     */
    function unpause() external onlyRole(TIMELOCK_ADMIN_ROLE) {
        _unpause();
        pausedAt = 0;
    }
    
    /**
     * @dev Auto-unpause after 24 hours (anyone can call)
     */
    function autoUnpause() external {
        require(paused(), "Contract not paused");
        require(pausedAt != 0, "No pause timestamp");
        require(block.timestamp >= pausedAt + AUTO_UNPAUSE_DELAY, "Auto-unpause delay not met");
        
        _unpause();
        pausedAt = 0;
    }
    
    /**
     * @dev Get scheduled action details
     */
    function getScheduledAction(bytes32 actionId) 
        external 
        view 
        returns (
            uint256 executeAfter,
            bool executed,
            bytes memory data,
            address target,
            uint256 value
        ) 
    {
        ScheduledAction storage action = scheduledActions[actionId];
        return (
            action.executeAfter,
            action.executed,
            action.data,
            action.target,
            action.value
        );
    }
    
    /**
     * @dev Check if action can be executed
     */
    function canExecuteAction(bytes32 actionId) external view returns (bool) {
        ScheduledAction storage action = scheduledActions[actionId];
        return (
            action.executeAfter != 0 &&
            !action.executed &&
            block.timestamp >= action.executeAfter &&
            block.timestamp <= action.executeAfter + GRACE_PERIOD
        );
    }
    
    /**
     * @dev Get time remaining until action can be executed
     */
    function getTimeUntilExecution(bytes32 actionId) external view returns (uint256) {
        ScheduledAction storage action = scheduledActions[actionId];
        if (action.executeAfter == 0 || action.executed) return 0;
        if (block.timestamp >= action.executeAfter) return 0;
        return action.executeAfter - block.timestamp;
    }
}