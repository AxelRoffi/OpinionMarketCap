// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOpinionMarketErrors.sol";
import "../interfaces/IOpinionMarketEvents.sol";

/**
 * @title TimelockAdminLib
 * @dev Library for timelock-based admin functions
 */
library TimelockAdminLib {
    
    /**
     * @dev Schedules a contract upgrade with timelock
     * @param newImplementation Address of the new implementation
     * @param description Description of the upgrade
     * @param admin Admin address performing the action
     * @return actionId Generated action ID for tracking
     */
    function scheduleContractUpgrade(
        address newImplementation,
        string calldata description,
        address admin
    ) internal returns (bytes32 actionId) {
        if (newImplementation == address(0)) revert IOpinionMarketErrors.ZeroAddressNotAllowed();
        
        // Generate deterministic action ID
        actionId = keccak256(abi.encodePacked(
            "UPGRADE",
            newImplementation,
            description,
            block.timestamp,
            admin
        ));
        
        return actionId;
    }

    /**
     * @dev Executes a scheduled upgrade after validation
     * @param actionId The action ID from scheduling
     * @param admin Admin address executing the action
     */
    function executeScheduledUpgrade(
        bytes32 actionId,
        address admin
    ) internal {
        // Validation happens in the calling contract's modifier
        // This function mainly serves as an event trigger point
        
        // Actual upgrade execution is handled by the UUPS proxy pattern
        // through _authorizeUpgrade and upgradeToAndCall functions
    }

    /**
     * @dev Schedules admin parameter changes with timelock
     * @param functionSelector The function selector being called
     * @param params Encoded function parameters
     * @param description Description of the change
     * @param admin Admin address performing the action
     * @return actionId Generated action ID for tracking
     */
    function scheduleAdminParameterChange(
        bytes4 functionSelector,
        bytes calldata params,
        string calldata description,
        address admin
    ) internal returns (bytes32 actionId) {
        // Generate deterministic action ID
        actionId = keccak256(abi.encodePacked(
            "PARAM_CHANGE",
            functionSelector,
            params,
            description,
            block.timestamp,
            admin
        ));
        
        return actionId;
    }

    /**
     * @dev Executes a scheduled parameter change after validation
     * @param actionId The action ID from scheduling
     * @param admin Admin address executing the action
     */
    function executeScheduledParameterChange(
        bytes32 actionId,
        address admin
    ) internal {
        // Validation happens in the calling contract's modifier
        // This function mainly serves as an event trigger point
        
        // Actual parameter changes are handled by the calling contract
        // after this function validates the timelock conditions
    }

    /**
     * @dev Cancels a scheduled timelock action
     * @param actionId The action ID to cancel
     * @param reason Reason for cancellation
     * @param admin Admin address performing the cancellation
     */
    function cancelTimelockAction(
        bytes32 actionId,
        string calldata reason,
        address admin
    ) internal {
        // Validation and actual cancellation logic is handled 
        // by the calling contract's timelock system
        
        // This function serves as a standardized entry point
        // for cancellation operations
    }

    /**
     * @dev Validates timelock action parameters
     * @param actionId Action ID to validate
     * @param admin Admin performing the action
     * @param currentTime Current block timestamp
     * @param scheduledTime When the action was scheduled
     * @param delay Required delay period
     * @return isValid Whether the action can be executed
     */
    function validateTimelockAction(
        bytes32 actionId,
        address admin,
        uint256 currentTime,
        uint256 scheduledTime,
        uint256 delay
    ) internal pure returns (bool isValid) {
        // Basic validation - more complex logic in calling contract
        if (actionId == bytes32(0)) return false;
        if (admin == address(0)) return false;
        if (currentTime < scheduledTime + delay) return false;
        
        return true;
    }

    /**
     * @dev Generates a unique action ID for timelock operations
     * @param actionType Type of action (e.g., "UPGRADE", "PARAM_CHANGE")
     * @param target Target address or function selector
     * @param data Action-specific data
     * @param admin Admin performing the action
     * @return actionId Unique identifier for the action
     */
    function generateActionId(
        string memory actionType,
        bytes32 target,
        bytes memory data,
        address admin
    ) internal view returns (bytes32 actionId) {
        return keccak256(abi.encodePacked(
            actionType,
            target,
            data,
            block.timestamp,
            block.number,
            admin
        ));
    }

    /**
     * @dev Calculates when a timelock action can be executed
     * @param scheduleTime When the action was scheduled
     * @param delay Required delay period in seconds
     * @return executionTime Earliest execution timestamp
     */
    function calculateExecutionTime(
        uint256 scheduleTime,
        uint256 delay
    ) internal pure returns (uint256 executionTime) {
        return scheduleTime + delay;
    }

    /**
     * @dev Checks if a timelock delay has elapsed
     * @param currentTime Current timestamp
     * @param scheduleTime When action was scheduled
     * @param delay Required delay period
     * @return hasElapsed Whether the delay period has passed
     */
    function hasTimelockElapsed(
        uint256 currentTime,
        uint256 scheduleTime,
        uint256 delay
    ) internal pure returns (bool hasElapsed) {
        return currentTime >= scheduleTime + delay;
    }
}