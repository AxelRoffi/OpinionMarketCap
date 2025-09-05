// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimplePoolManager {
    uint256 public poolId;
    uint256 public opinionId;
    uint256 public totalAmount;
    uint256 public deadline;
    uint256 public targetPrice;
    uint8 public status; // 0: Active, 1: Executed, 2: Expired

    constructor() {
        poolId = 0;
        status = 0;
    }

    function createPool(
        uint256 _opinionId,
        uint256 _deadline,
        uint256 _amount
    ) external {
        poolId = 1; // Always set to 1 for simplicity
        opinionId = _opinionId;
        deadline = _deadline;
        totalAmount = _amount;
        status = 0; // Active
    }

    function addContribution(uint256 _amount) external {
        totalAmount += _amount;
    }

    function setTargetPrice(uint256 _targetPrice) external {
        targetPrice = _targetPrice;
    }

    function executePool() external {
        if (totalAmount >= targetPrice) {
            status = 1; // Executed
        }
    }

    function getPoolDetails()
        external
        view
        returns (uint256, uint256, uint256)
    {
        return (opinionId, deadline, totalAmount);
    }

    function getPoolStatus() external view returns (uint8) {
        return status;
    }
}
