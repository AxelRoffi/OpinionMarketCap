// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPoolContributionTester
 * @dev A simplified mock contract for testing pool contribution functionality
 */
contract MockPoolContributionTester {
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
    uint256 public poolContributionFee = 1 * 10 ** 6; // 1 USDC
    uint256 public minContribution = 1 * 10 ** 6; // 1 USDC

    // Storage
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => Contribution[]) public poolContributions;
    mapping(uint256 => mapping(address => uint256)) public contributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    uint256 public poolCount;

    // Events
    event PoolContribution(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint256 amount,
        uint256 newTotalAmount,
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

    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 targetPrice,
        uint256 timestamp
    );

    // Constructor with pre-populated pools
    constructor() {
        // Create two pools for testing
        poolCount = 2;

        // Active pool
        pools[0] = PoolInfo({
            id: 0,
            opinionId: 1,
            proposedAnswer: "Active Pool Answer",
            creator: address(1),
            totalAmount: 50 * 10 ** 6, // 50 USDC
            deadline: block.timestamp + 7 days,
            status: 0, // Active
            name: "Active Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Expired pool
        pools[1] = PoolInfo({
            id: 1,
            opinionId: 1,
            proposedAnswer: "Expired Pool Answer",
            creator: address(1),
            totalAmount: 50 * 10 ** 6, // 50 USDC
            deadline: block.timestamp - 1 days,
            status: 0, // Active but deadline passed (will be marked as expired)
            name: "Expired Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });
    }

    // Errors
    error PoolNotFound(uint256 poolId);
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolDeadlinePassed(uint256 poolId, uint256 deadline);
    error PoolAlreadyFunded(uint256 poolId);
    error ContributionTooLow(uint256 provided, uint256 required);
    error InsufficientAllowance(uint256 required, uint256 provided);

    /**
     * @dev Contribute to an existing pool
     * @param poolId The ID of the pool
     * @param amount The amount to contribute
     */
    function contributeToPool(uint256 poolId, uint256 amount) external {
        // Check pool exists
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Check pool is active
        if (pool.status != 0) {
            revert PoolNotActive(poolId, pool.status);
        }

        // Check deadline
        if (block.timestamp > pool.deadline) {
            // Mark as expired
            pool.status = 2; // Expired
            revert PoolDeadlinePassed(poolId, pool.deadline);
        }

        // Mock target price calculation - always return 200 USDC
        uint256 targetPrice = 200 * 10 ** 6;

        // Check if pool already has enough funds
        if (pool.totalAmount >= targetPrice) {
            revert PoolAlreadyFunded(poolId);
        }

        // Calculate maximum allowed contribution
        uint256 maxAllowed = targetPrice - pool.totalAmount;
        uint256 actualAmount = amount > maxAllowed ? maxAllowed : amount;

        // Ensure non-zero contribution
        if (actualAmount < minContribution) {
            revert ContributionTooLow(actualAmount, minContribution);
        }

        // Mock token allowance check (in real code this would check the actual allowance)
        uint256 requiredAmount = actualAmount + poolContributionFee;
        uint256 mockAllowance = 1000 * 10 ** 6; // Mock 1000 USDC allowance
        if (mockAllowance < requiredAmount) {
            revert InsufficientAllowance(requiredAmount, mockAllowance);
        }

        // Update pool state
        if (contributionAmounts[poolId][msg.sender] == 0) {
            // First contribution from this user
            poolContributors[poolId].push(msg.sender);
        }

        // Record contribution
        poolContributions[poolId].push(
            Contribution({
                contributor: msg.sender,
                amount: actualAmount,
                timestamp: block.timestamp
            })
        );

        contributionAmounts[poolId][msg.sender] += actualAmount;
        pool.totalAmount += actualAmount;

        // Emit events
        emit PoolContribution(
            poolId,
            pool.opinionId,
            msg.sender,
            actualAmount,
            pool.totalAmount,
            block.timestamp
        );

        emit PoolAction(
            poolId,
            pool.opinionId,
            1, // contribute
            msg.sender,
            actualAmount,
            ""
        );

        // Check if pool is ready to execute
        if (pool.totalAmount >= targetPrice) {
            _executePool(poolId, targetPrice);
        }
    }

    /**
     * @dev Internal function to execute a pool when it has reached the target price
     */
    function _executePool(uint256 poolId, uint256 targetPrice) internal {
        PoolInfo storage pool = pools[poolId];

        // Update pool status
        pool.status = 1; // Executed

        // Emit execution event
        emit PoolExecuted(
            poolId,
            pool.opinionId,
            pool.proposedAnswer,
            targetPrice,
            block.timestamp
        );

        emit PoolAction(
            poolId,
            pool.opinionId,
            2, // execute
            address(this),
            targetPrice,
            pool.proposedAnswer
        );
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

        // Mock price - always return 200 USDC
        currentPrice = 200 * 10 ** 6;

        // Calculate remaining amount
        if (info.totalAmount >= currentPrice) {
            remainingAmount = 0;
        } else {
            remainingAmount = currentPrice - info.totalAmount;
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
     * @dev Check if pool is expired
     */
    function checkPoolExpiry(uint256 poolId) external returns (bool) {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Only check active pools
        if (pool.status != 0) {
            return pool.status == 2; // Is it already expired?
        }

        // Check if deadline has passed
        if (block.timestamp > pool.deadline) {
            pool.status = 2; // Expired
            return true;
        }

        return false;
    }

    /**
     * @dev Set pool contribution fee (for testing)
     */
    function setPoolContributionFee(uint256 newFee) external {
        poolContributionFee = newFee;
    }
}
