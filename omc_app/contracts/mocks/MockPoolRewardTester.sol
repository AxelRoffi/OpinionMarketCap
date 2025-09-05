// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPoolRewardTester
 * @dev A simplified mock contract for testing pool reward distribution functionality
 */
contract MockPoolRewardTester {
    struct PoolInfo {
        uint256 id;
        uint256 opinionId;
        string proposedAnswer;
        uint96 totalAmount;
        uint32 deadline;
        address creator;
        uint8 status; // 0: Active, 1: Executed, 2: Expired, 3: Extended
        string name;
    }

    // Configuration
    uint8 public platformFeePercent = 2; // 2%
    uint8 public creatorFeePercent = 3; // 3%

    // Storage
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => mapping(address => uint96)) public poolContributions;
    mapping(uint256 => address[]) public poolContributors;
    mapping(address => uint96) public accumulatedRewards;
    mapping(uint256 => uint96) public poolRewardsPaid;
    mapping(uint256 => mapping(address => uint96))
        public contributorRewardsPaid;

    // Events
    event PoolRewardDistributed(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed contributor,
        uint96 contributionAmount,
        uint96 sharePercentage,
        uint96 rewardAmount,
        uint32 timestamp
    );

    event RewardsClaimed(address indexed user, uint96 amount, uint32 timestamp);

    // Constructor with pre-populated pools and contributions
    constructor() {
        // Setup executed pool with multiple contributors
        pools[0] = PoolInfo({
            id: 0,
            opinionId: 1,
            proposedAnswer: "Pool Answer",
            totalAmount: 100 * 10 ** 6, // 100 USDC
            deadline: uint32(block.timestamp + 1 days),
            creator: address(1),
            status: 1, // Executed
            name: "Test Pool"
        });

        // Add contributors with different contribution amounts
        poolContributors[0].push(address(1)); // 50 USDC (50%)
        poolContributors[0].push(address(2)); // 30 USDC (30%)
        poolContributors[0].push(address(3)); // 20 USDC (20%)

        poolContributions[0][address(1)] = 50 * 10 ** 6;
        poolContributions[0][address(2)] = 30 * 10 ** 6;
        poolContributions[0][address(3)] = 20 * 10 ** 6;

        // Setup another executed pool with more complex contributions
        pools[1] = PoolInfo({
            id: 1,
            opinionId: 2,
            proposedAnswer: "Complex Pool Answer",
            totalAmount: 123 * 10 ** 6, // 123 USDC (odd number for rounding tests)
            deadline: uint32(block.timestamp + 1 days),
            creator: address(1),
            status: 1, // Executed
            name: "Complex Pool"
        });

        // Add 5 contributors with different amounts
        poolContributors[1].push(address(1)); // 50 USDC (40.65%)
        poolContributors[1].push(address(2)); // 30 USDC (24.39%)
        poolContributors[1].push(address(3)); // 20 USDC (16.26%)
        poolContributors[1].push(address(4)); // 13 USDC (10.57%)
        poolContributors[1].push(address(5)); // 10 USDC (8.13%)

        poolContributions[1][address(1)] = 50 * 10 ** 6;
        poolContributions[1][address(2)] = 30 * 10 ** 6;
        poolContributions[1][address(3)] = 20 * 10 ** 6;
        poolContributions[1][address(4)] = 13 * 10 ** 6;
        poolContributions[1][address(5)] = 10 * 10 ** 6;

        // Setup a simplified version of the micro pool with just 2 small contributions
        pools[2] = PoolInfo({
            id: 2,
            opinionId: 3,
            proposedAnswer: "Micro Pool Answer",
            totalAmount: 10 * 10 ** 5, // 1 USDC
            deadline: uint32(block.timestamp + 1 days),
            creator: address(1),
            status: 1, // Executed
            name: "Micro Pool"
        });

        // Just 2 contributors with tiny amounts to avoid overflow
        poolContributors[2].push(address(1));
        poolContributors[2].push(address(2));
        poolContributions[2][address(1)] = 5 * 10 ** 5; // 0.5 USDC
        poolContributions[2][address(2)] = 5 * 10 ** 5; // 0.5 USDC
    }

    // Errors
    error PoolNotFound(uint256 poolId);
    error PoolNotExecuted(uint256 poolId);
    error NoRewardsToClaim();
    error ContributorNotFound(uint256 poolId, address contributor);

    /**
     * @dev Distributes rewards when a pool-owned answer is purchased
     * @param poolId The ID of the pool
     * @param purchaseAmount Amount paid for the answer
     * @param buyer Address of the buyer (for event purposes)
     */
    function distributePoolRewards(
        uint256 poolId,
        uint96 purchaseAmount,
        address buyer
    ) external {
        if (poolId >= 3) revert PoolNotFound(poolId);

        PoolInfo storage pool = pools[poolId];

        // Ensure pool is executed
        if (pool.status != 1) revert PoolNotExecuted(poolId);

        // Calculate reward amount after platform and creator fees
        uint96 platformFee = uint96(
            (purchaseAmount * platformFeePercent) / 100
        );
        uint96 creatorFee = uint96((purchaseAmount * creatorFeePercent) / 100);
        uint96 rewardAmount = purchaseAmount - platformFee - creatorFee;

        // Get pool contributors
        address[] memory contributors = poolContributors[poolId];
        uint96 totalContributed = pool.totalAmount;
        uint96 distributedSoFar = 0;

        // Distribute rewards to all contributors except the last one
        for (uint256 i = 0; i < contributors.length - 1; i++) {
            address contributor = contributors[i];
            uint96 contribution = poolContributions[poolId][contributor];

            if (contribution > 0) {
                // Calculate contributor's share (scaled by 10000 for precision)
                uint256 sharePercent = (uint256(contribution) * 10000) /
                    totalContributed;
                uint96 contributorReward = uint96(
                    (uint256(rewardAmount) * sharePercent) / 10000
                );

                // Update tracking
                accumulatedRewards[contributor] += contributorReward;
                contributorRewardsPaid[poolId][
                    contributor
                ] += contributorReward;
                distributedSoFar += contributorReward;

                // Scale share percent to normal percentage for event
                uint96 sharePercentageForEvent = uint96(sharePercent / 100); // Convert to percentage

                // Emit event
                emit PoolRewardDistributed(
                    poolId,
                    pool.opinionId,
                    contributor,
                    contribution,
                    sharePercentageForEvent,
                    contributorReward,
                    uint32(block.timestamp)
                );
            }
        }

        // Last contributor gets remainder to avoid rounding issues
        if (contributors.length > 0) {
            address lastContributor = contributors[contributors.length - 1];
            uint96 contribution = poolContributions[poolId][lastContributor];

            if (contribution > 0) {
                // Calculate remaining reward
                uint96 lastContributorReward = rewardAmount - distributedSoFar;

                // Update tracking
                accumulatedRewards[lastContributor] += lastContributorReward;
                contributorRewardsPaid[poolId][
                    lastContributor
                ] += lastContributorReward;

                // Calculate share percentage for event
                uint256 sharePercent = (uint256(contribution) * 10000) /
                    totalContributed;
                uint96 sharePercentageForEvent = uint96(sharePercent / 100);

                // Emit event
                emit PoolRewardDistributed(
                    poolId,
                    pool.opinionId,
                    lastContributor,
                    contribution,
                    sharePercentageForEvent,
                    lastContributorReward,
                    uint32(block.timestamp)
                );
            }
        }

        // Update total rewards paid for this pool
        poolRewardsPaid[poolId] += rewardAmount;
    }

    /**
     * @dev Claims accumulated rewards
     */
    function claimRewards() external {
        uint96 rewardAmount = accumulatedRewards[msg.sender];
        if (rewardAmount == 0) revert NoRewardsToClaim();

        // Reset rewards before transfer (following checks-effects-interactions)
        accumulatedRewards[msg.sender] = 0;

        // In a real contract, we would transfer tokens here

        emit RewardsClaimed(msg.sender, rewardAmount, uint32(block.timestamp));
    }

    /**
     * @dev Get accumulated rewards for a user
     */
    function getAccumulatedRewards(
        address user
    ) external view returns (uint96) {
        return accumulatedRewards[user];
    }

    /**
     * @dev Get rewards paid from a pool to a contributor
     */
    function getContributorRewardsPaid(
        uint256 poolId,
        address contributor
    ) external view returns (uint96) {
        return contributorRewardsPaid[poolId][contributor];
    }

    /**
     * @dev Get total rewards paid from a pool
     */
    function getPoolRewardsPaid(uint256 poolId) external view returns (uint96) {
        return poolRewardsPaid[poolId];
    }

    /**
     * @dev Get pool contribution amount for a user
     */
    function getContribution(
        uint256 poolId,
        address contributor
    ) external view returns (uint96) {
        return poolContributions[poolId][contributor];
    }

    /**
     * @dev Get share percentage for a contributor (in basis points - 1% = 100)
     */
    function getContributorShareBps(
        uint256 poolId,
        address contributor
    ) external view returns (uint256) {
        PoolInfo storage pool = pools[poolId];
        uint96 contribution = poolContributions[poolId][contributor];

        if (contribution == 0) revert ContributorNotFound(poolId, contributor);

        return (uint256(contribution) * 10000) / pool.totalAmount;
    }

    /**
     * @dev Utility function to get fee amounts for a purchase
     */
    function calculateFees(
        uint96 purchaseAmount
    )
        external
        view
        returns (uint96 platformFee, uint96 creatorFee, uint96 rewardAmount)
    {
        platformFee = uint96((purchaseAmount * platformFeePercent) / 100);
        creatorFee = uint96((purchaseAmount * creatorFeePercent) / 100);
        rewardAmount = purchaseAmount - platformFee - creatorFee;

        return (platformFee, creatorFee, rewardAmount);
    }

    /**
     * @dev Helper function to set pool status for testing
     */
    function setPoolStatus(uint256 poolId, uint8 status) external {
        if (poolId >= 3) revert PoolNotFound(poolId);
        pools[poolId].status = status;
    }
}
