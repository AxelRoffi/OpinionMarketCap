// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IOpinionAdminInternal
 * @dev Internal interface for admin functions and parameter management
 */
interface IOpinionAdminInternal {
    // Admin validation
    function validateAdminAccess(address caller) external view returns (bool);
    function validateModeratorAccess(address caller) external view returns (bool);
    
    // Parameter notifications
    function notifyParameterChange(uint8 paramType, uint256 newValue) external;
    function notifyAddressChange(uint8 paramType, address newAddress) external;
    
    // System control
    function isSystemPaused() external view returns (bool);
    function isPublicCreationEnabled() external view returns (bool);
    
    // Treasury management
    function getTreasury() external view returns (address);
    function isPendingTreasuryChange() external view returns (bool);
}