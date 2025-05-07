// contracts/mocks/MockPoolManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockPoolManager {
    // Define enums and structs directly in the contract
    enum PoolStatus {
        Active,
        Executed,
        Expired,
        Extended
    }

    struct PoolInfo {
        uint256 id;
        uint256 opinionId;
        string proposedAnswer;
        uint96 totalAmount;
        uint32 deadline;
        address creator;
        PoolStatus status;
        string name;
        string ipfsHash;
    }

    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => uint256[]) public opinionPools;
    uint256 public poolCount;

    // Events for testing
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        address indexed creator
    );

    // Implementation methods...

    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        )
    {
        info = pools[poolId];
        currentPrice = 10 * 10 ** 6; // 10 USDC mock price

        if (info.totalAmount >= currentPrice) {
            remainingAmount = 0;
        } else {
            remainingAmount = currentPrice - info.totalAmount;
        }

        if (block.timestamp >= info.deadline) {
            timeRemaining = 0;
        } else {
            timeRemaining = info.deadline - block.timestamp;
        }

        return (info, currentPrice, remainingAmount, timeRemaining);
    }
}
