// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPoolManager.sol";

/**
 * @title MinimalPoolManager
 * @dev Minimal implementation of IPoolManager that makes submitAnswer work
 * This is a simplified version for testing purposes
 */
contract MinimalPoolManager {
    address public opinionCore;
    
    constructor(address _opinionCore) {
        opinionCore = _opinionCore;
    }
    
    // The only function OpinionCore actually calls in submitAnswer
    function distributePoolRewards(
        uint256 opinionId,
        uint256 purchasePrice,
        address buyer
    ) external {
        // Only allow calls from the Opinion Core contract
        require(msg.sender == opinionCore, "Unauthorized caller");
        
        // For now, just emit an event and do nothing
        // In a full implementation, this would distribute rewards to pool contributors
        emit PoolRewardsDistributed(opinionId, purchasePrice, buyer);
    }
    
    event PoolRewardsDistributed(uint256 indexed opinionId, uint256 purchasePrice, address buyer);
}