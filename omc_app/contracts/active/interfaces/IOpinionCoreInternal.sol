// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IOpinionCoreInternal
 * @dev Internal interface for communication between Opinion contracts
 */
interface IOpinionCoreInternal {
    // Core validation functions
    function validateOpinionExists(uint256 opinionId) external view returns (bool);
    function getNextOpinionId() external view returns (uint256);
    
    // Parameter updates from admin contract
    function updateCoreParameter(uint8 paramType, uint256 value) external;
    function updateCoreParameterAddress(uint8 paramType, address value) external;
    
    // Core opinion data access
    function getOpinionOwner(uint256 opinionId) external view returns (address);
    function getOpinionCreator(uint256 opinionId) external view returns (address);
    function isOpinionActive(uint256 opinionId) external view returns (bool);
    
    // System status
    function isPaused() external view returns (bool);
}