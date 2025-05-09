// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPoolExpiryWithdrawalTester
 * @dev A simplified mock contract for testing pool expiry and withdrawal functionality
 */
contract MockPoolExpiryWithdrawalTester {
    struct PoolInfo {
        uint256 id;
        uint256 opinionId;
        string proposedAnswer;
        address creator;
        uint256 totalAmount;
        uint256 deadline;
        uint8 status; // 0: Active, 1: Executed, 2: Expired, 3: Extended
        string name;
        string ipfsHash;
    }

    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    // Configuration
    uint256 public constant TARGET_PRICE = 200 * 10 ** 6; // 200 USDC

    // Storage
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => Contribution[]) public poolContributions;
    mapping(uint256 => mapping(address => uint256)) public contributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => mapping(address => bool)) public hasWithdrawn;
    mapping(uint256 => uint256) public totalWithdrawn;
    uint256 public poolCount;

    // Events
    event PoolExpired(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint256 totalAmount,
        uint256 contributorCount,
        uint256 timestamp
    );

    event PoolAction(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed actor,
        uint256 amount,
        string answer
    );

    event PoolRefund(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    // Constructor with pre-populated pools and contributions
    constructor() {
        // Setup pool count
        poolCount = 6;

        // Active pool (not yet expired)
        pools[0] = PoolInfo({
            id: 0,
            opinionId: 1,
            proposedAnswer: "Active Pool Answer",
            creator: address(1),
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: block.timestamp + 7 days,
            status: 0, // Active
            name: "Active Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Pool that will expire soon
        pools[1] = PoolInfo({
            id: 1,
            opinionId: 1,
            proposedAnswer: "Almost Expired Pool Answer",
            creator: address(1),
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: block.timestamp + 1 hours, // Will expire soon
            status: 0, // Active but about to expire
            name: "Almost Expired Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Already expired pool but not marked yet
        pools[2] = PoolInfo({
            id: 2,
            opinionId: 1,
            proposedAnswer: "Expired But Not Marked Pool Answer",
            creator: address(1),
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: block.timestamp - 1 days, // Already past deadline
            status: 0, // Still active but should be expired
            name: "Expired Not Marked Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Already marked as expired pool
        pools[3] = PoolInfo({
            id: 3,
            opinionId: 1,
            proposedAnswer: "Marked Expired Pool Answer",
            creator: address(1),
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: block.timestamp - 2 days, // Past deadline
            status: 2, // Already marked as expired
            name: "Marked Expired Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Executed pool
        pools[4] = PoolInfo({
            id: 4,
            opinionId: 1,
            proposedAnswer: "Executed Pool Answer",
            creator: address(1),
            totalAmount: TARGET_PRICE, // Fully funded
            deadline: block.timestamp + 7 days,
            status: 1, // Executed
            name: "Executed Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Extended pool
        pools[5] = PoolInfo({
            id: 5,
            opinionId: 1,
            proposedAnswer: "Extended Pool Answer",
            creator: address(1),
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: block.timestamp + 14 days, // Extended deadline
            status: 3, // Extended
            name: "Extended Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Add contributors for expired pools
        // For pool 2 (expired but not marked)
        poolContributors[2].push(address(1));
        poolContributors[2].push(address(2));
        poolContributors[2].push(address(3));
        contributionAmounts[2][address(1)] = 50 * 10 ** 6; // 50 USDC
        contributionAmounts[2][address(2)] = 30 * 10 ** 6; // 30 USDC
        contributionAmounts[2][address(3)] = 20 * 10 ** 6; // 20 USDC

        // For pool 3 (marked as expired)
        poolContributors[3].push(address(1));
        poolContributors[3].push(address(2));
        contributionAmounts[3][address(1)] = 60 * 10 ** 6; // 60 USDC
        contributionAmounts[3][address(2)] = 40 * 10 ** 6; // 40 USDC
    }

    // Errors
    error PoolNotFound(uint256 poolId);
    error PoolNotExpired(uint256 poolId, uint256 deadline);
    error PoolNotActive(uint256 poolId, uint8 status);
    error NoContribution(uint256 poolId, address user);
    error AlreadyWithdrawn(uint256 poolId, address user);
    error WithdrawalFailed(uint256 poolId, address user);
    error TimeManipulationFailed();

    /**
     * @dev Check if a pool has expired and update its status if needed
     * @param poolId The ID of the pool to check
     * @return True if the pool is now expired, false otherwise
     */
    function checkPoolExpiry(uint256 poolId) external returns (bool) {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // If pool is already expired or executed, return its status
        if (pool.status == 2) {
            // Already expired
            return true;
        }

        if (pool.status != 0) {
            // Not active
            return false;
        }

        // Check if deadline has passed
        if (block.timestamp > pool.deadline) {
            // Mark as expired
            pool.status = 2; // Expired

            // Emit events
            emit PoolExpired(
                poolId,
                pool.opinionId,
                pool.totalAmount,
                poolContributors[poolId].length,
                block.timestamp
            );

            emit PoolAction(
                poolId,
                pool.opinionId,
                3, // expire action type
                address(this),
                pool.totalAmount,
                ""
            );

            return true;
        }

        return false;
    }

    /**
     * @dev Allows a contributor to withdraw their funds from an expired pool
     * @param poolId The ID of the pool
     */
    function withdrawFromExpiredPool(uint256 poolId) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Check that pool is expired
        if (pool.status != 2) {
            // Not expired
            // Auto-check expiry if deadline has passed
            if (block.timestamp > pool.deadline && pool.status == 0) {
                pool.status = 2; // Mark as expired

                emit PoolExpired(
                    poolId,
                    pool.opinionId,
                    pool.totalAmount,
                    poolContributors[poolId].length,
                    block.timestamp
                );

                emit PoolAction(
                    poolId,
                    pool.opinionId,
                    3, // expire action type
                    address(this),
                    pool.totalAmount,
                    ""
                );
            } else {
                revert PoolNotExpired(poolId, pool.deadline);
            }
        }

        // Check user has contributed
        uint256 contribution = contributionAmounts[poolId][msg.sender];
        if (contribution == 0) {
            revert NoContribution(poolId, msg.sender);
        }

        // Check user hasn't already withdrawn
        if (hasWithdrawn[poolId][msg.sender]) {
            revert AlreadyWithdrawn(poolId, msg.sender);
        }

        // Mark as withdrawn
        hasWithdrawn[poolId][msg.sender] = true;
        totalWithdrawn[poolId] += contribution;

        // In real contract, we would transfer funds here

        // Emit events
        emit PoolRefund(poolId, msg.sender, contribution, block.timestamp);

        emit PoolAction(
            poolId,
            pool.opinionId,
            5, // withdraw action type
            msg.sender,
            contribution,
            ""
        );
    }

    /**
     * @dev Extends the deadline of a pool
     * @param poolId The ID of the pool
     * @param newDeadline The new deadline
     */
    function extendPoolDeadline(uint256 poolId, uint256 newDeadline) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Only active or expired pools can be extended
        if (pool.status != 0 && pool.status != 2) {
            revert PoolNotActive(poolId, pool.status);
        }

        // Ensure new deadline is later than current one
        if (newDeadline <= pool.deadline) {
            revert("New deadline must be later");
        }

        // Update pool deadline and status
        pool.deadline = newDeadline;
        pool.status = 3; // Extended

        // Emit events
        emit PoolAction(
            poolId,
            pool.opinionId,
            4, // extend action type
            msg.sender,
            0,
            ""
        );
    }

    /**
     * @dev Helper function to add contributions for testing purposes
     * @param poolId The ID of the pool
     * @param contributor The contributor address
     * @param amount The contribution amount
     */
    function addContributionForTesting(
        uint256 poolId,
        address contributor,
        uint256 amount
    ) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        // Add contributor if not already present
        bool found = false;
        for (uint256 i = 0; i < poolContributors[poolId].length; i++) {
            if (poolContributors[poolId][i] == contributor) {
                found = true;
                break;
            }
        }

        if (!found) {
            poolContributors[poolId].push(contributor);
        }

        // Add contribution amount
        contributionAmounts[poolId][contributor] += amount;
    }

    /**
     * @dev Force time advancement for testing (not a real function, just for testing)
     * @param secondsToAdd Number of seconds to advance time
     */
    function advanceTime(uint256 secondsToAdd) external {
        // This is just a mock function to simulate time passing
        // In a real test, you would use hardhat's time manipulation
    }

    /**
     * @dev Get pool details
     */
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

        // Always return TARGET_PRICE as the goal
        currentPrice = TARGET_PRICE;

        // Calculate remaining amount
        if (info.totalAmount >= TARGET_PRICE) {
            remainingAmount = 0;
        } else {
            remainingAmount = TARGET_PRICE - info.totalAmount;
        }

        // Calculate time remaining
        if (block.timestamp >= info.deadline) {
            timeRemaining = 0;
        } else {
            timeRemaining = info.deadline - block.timestamp;
        }

        return (info, currentPrice, remainingAmount, timeRemaining);
    }

    /**
     * @dev Get pool contributors
     */
    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory) {
        return poolContributors[poolId];
    }

    /**
     * @dev Get contribution amount for a user
     */
    function getContributionAmount(
        uint256 poolId,
        address user
    ) external view returns (uint256) {
        return contributionAmounts[poolId][user];
    }

    /**
     * @dev Check if a user has withdrawn from a pool
     */
    function hasUserWithdrawn(
        uint256 poolId,
        address user
    ) external view returns (bool) {
        return hasWithdrawn[poolId][user];
    }

    /**
     * @dev Get total amount withdrawn from a pool
     */
    function getTotalWithdrawn(uint256 poolId) external view returns (uint256) {
        return totalWithdrawn[poolId];
    }
}
