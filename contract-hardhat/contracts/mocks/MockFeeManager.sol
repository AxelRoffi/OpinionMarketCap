// contracts/mocks/MockFeeManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockFeeManager {
    // Define structs directly in the contract
    struct FeeDistribution {
        uint96 platformFee;
        uint96 creatorFee;
        uint96 ownerAmount;
    }

    mapping(address => uint96) public accumulatedFees;
    uint96 public totalAccumulatedFees;

    uint8 public platformFeePercent = 2; // 2%
    uint8 public creatorFeePercent = 3; // 3%

    // Events for testing
    event FeeAccumulated(address indexed user, uint96 amount, uint96 newTotal);
    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed account,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    function accumulateFee(address recipient, uint96 amount) external {
        accumulatedFees[recipient] += amount;
        totalAccumulatedFees += amount;

        emit FeeAccumulated(recipient, amount, accumulatedFees[recipient]);
        emit FeesAction(0, 1, recipient, amount, 0, 0, 0);
    }

    // Additional methods...

    function getAccumulatedFees(address user) external view returns (uint96) {
        return accumulatedFees[user];
    }
}
