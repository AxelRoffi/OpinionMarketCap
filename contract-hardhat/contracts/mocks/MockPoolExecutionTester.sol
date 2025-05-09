// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPoolExecutionTester
 * @dev A simplified mock contract for testing pool execution functionality
 */
contract MockPoolExecutionTester {
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

    struct Opinion {
        string question;
        string currentAnswer;
        address owner;
        uint256 lastPrice;
        address creator;
    }

    // Configuration
    uint256 public constant TARGET_PRICE = 200 * 10 ** 6; // 200 USDC

    // Storage
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => Contribution[]) public poolContributions;
    mapping(uint256 => mapping(address => uint256)) public contributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => Opinion) public opinions;
    uint256 public poolCount;
    bool public executeManually = false;

    // Events
    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 targetPrice,
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

    event OpinionUpdated(
        uint256 indexed opinionId,
        string oldAnswer,
        string newAnswer,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );

    event ExecutionFailed(uint256 indexed poolId, string reason);

    // Constructor with pre-populated pools and opinions
    constructor() {
        // Create an opinion
        opinions[1] = Opinion({
            question: "Test Question?",
            currentAnswer: "Initial Answer",
            owner: address(1),
            lastPrice: 100 * 10 ** 6,
            creator: address(1)
        });

        // Setup pool count
        poolCount = 4;

        // Ready to execute pool
        pools[0] = PoolInfo({
            id: 0,
            opinionId: 1,
            proposedAnswer: "Ready Pool Answer",
            creator: address(1),
            totalAmount: TARGET_PRICE,
            deadline: block.timestamp + 7 days,
            status: 0, // Active and ready to execute
            name: "Ready Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Almost ready pool
        pools[1] = PoolInfo({
            id: 1,
            opinionId: 1,
            proposedAnswer: "Almost Ready Pool Answer",
            creator: address(1),
            totalAmount: TARGET_PRICE - 10 * 10 ** 6, // 10 USDC short
            deadline: block.timestamp + 7 days,
            status: 0, // Active but needs more funds
            name: "Almost Ready Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Already executed pool
        pools[2] = PoolInfo({
            id: 2,
            opinionId: 1,
            proposedAnswer: "Executed Pool Answer",
            creator: address(1),
            totalAmount: TARGET_PRICE,
            deadline: block.timestamp + 7 days,
            status: 1, // Already executed
            name: "Executed Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Expired pool
        pools[3] = PoolInfo({
            id: 3,
            opinionId: 1,
            proposedAnswer: "Expired Pool Answer",
            creator: address(1),
            totalAmount: TARGET_PRICE - 50 * 10 ** 6, // 50 USDC short
            deadline: block.timestamp - 1 days,
            status: 2, // Expired
            name: "Expired Pool",
            ipfsHash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
        });

        // Add some contributors for tests
        poolContributors[0].push(address(1));
        poolContributors[0].push(address(2));
        contributionAmounts[0][address(1)] = 150 * 10 ** 6;
        contributionAmounts[0][address(2)] = 50 * 10 ** 6;
    }

    // Errors
    error PoolNotFound(uint256 poolId);
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolInsufficientFunds(uint256 current, uint256 required);
    error OpinionNotFound(uint256 opinionId);
    error PoolAlreadyExecuted(uint256 poolId);
    error ExecutionBlocked(string reason);
    error UnauthorizedExecution(address caller);

    /**
     * @dev Execute a pool if it has sufficient funds
     * @param poolId The ID of the pool to execute
     */
    function executePool(uint256 poolId) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Check pool is active
        if (pool.status != 0) {
            revert PoolNotActive(poolId, pool.status);
        }

        // Check sufficient funds
        if (pool.totalAmount < TARGET_PRICE) {
            revert PoolInsufficientFunds(pool.totalAmount, TARGET_PRICE);
        }

        // Check the opinion exists
        if (pool.opinionId == 0 || pool.opinionId >= 10) {
            revert OpinionNotFound(pool.opinionId);
        }

        // Execute the pool
        _executePool(poolId);
    }

    /**
     * @dev Contribute to a pool and auto-execute if it reaches the target
     * @param poolId The ID of the pool
     * @param amount The amount to contribute
     */
    function contributeAndExecute(uint256 poolId, uint256 amount) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Check pool is active
        if (pool.status != 0) {
            revert PoolNotActive(poolId, pool.status);
        }

        // Update pool funds
        pool.totalAmount += amount;

        // Update contributor data
        if (contributionAmounts[poolId][msg.sender] == 0) {
            poolContributors[poolId].push(msg.sender);
        }
        contributionAmounts[poolId][msg.sender] += amount;

        // Check if pool is now fully funded
        if (pool.totalAmount >= TARGET_PRICE && !executeManually) {
            _executePool(poolId);
        }
    }

    /**
     * @dev Toggle manual execution mode
     */
    function setExecuteManually(bool _executeManually) external {
        executeManually = _executeManually;
    }

    /**
     * @dev Set a block for execution testing
     */
    function setExecutionBlock(string calldata reason) external {
        require(bytes(reason).length > 0, "Reason required");

        // This sets a flag to simulate blocked execution for testing
        executeManually = true;
    }

    /**
     * @dev Internal function to execute a pool
     */
    function _executePool(uint256 poolId) internal {
        PoolInfo storage pool = pools[poolId];
        Opinion storage opinion = opinions[pool.opinionId];

        // Save old values for event
        string memory oldAnswer = opinion.currentAnswer;
        address oldOwner = opinion.owner;

        // Update opinion
        opinion.currentAnswer = pool.proposedAnswer;
        opinion.owner = address(this); // PoolManager becomes the owner
        opinion.lastPrice = uint256(pool.totalAmount);

        // Update pool status
        pool.status = 1; // Executed

        // Emit events
        emit PoolExecuted(
            poolId,
            pool.opinionId,
            pool.proposedAnswer,
            pool.totalAmount,
            block.timestamp
        );

        emit PoolAction(
            poolId,
            pool.opinionId,
            2, // execute
            address(this),
            pool.totalAmount,
            pool.proposedAnswer
        );

        emit OpinionUpdated(
            pool.opinionId,
            oldAnswer,
            pool.proposedAnswer,
            oldOwner,
            address(this),
            pool.totalAmount
        );
    }

    /**
     * @dev Simulate an execution failure
     */
    function executePoolWithFailure(uint256 poolId) external {
        if (poolId >= poolCount) {
            revert PoolNotFound(poolId);
        }

        PoolInfo storage pool = pools[poolId];

        // Try to execute but emit failure
        emit ExecutionFailed(poolId, "Simulated execution failure");

        // Do not actually execute or change status
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
     * @dev Get opinion details
     */
    function getOpinionDetails(
        uint256 opinionId
    ) external view returns (Opinion memory) {
        return opinions[opinionId];
    }
}
