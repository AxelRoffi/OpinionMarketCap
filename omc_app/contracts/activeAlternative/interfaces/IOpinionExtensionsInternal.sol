// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOpinionExtensionsInternal
 * @dev Internal interface for extension slots management
 */
interface IOpinionExtensionsInternal {
    // Extension validation
    function validateExtensionAccess(uint256 opinionId, address caller) external view returns (bool);
    
    // Category initialization for new opinions
    function initializeOpinionCategories(uint256 opinionId, string[] memory categories) external;
    
    // Category validation
    function validateCategories(string[] memory categories) external view returns (bool);
    function getCategoriesCount() external view returns (uint256);
}