// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPoolTester
 * @dev A simplified mock contract for testing pool creation functionality
 */
contract MockPoolTester {
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

    // Configuration
    uint256 public poolCreationFee = 50 * 10 ** 6; // 50 USDC
    uint256 public minPoolDuration = 24 * 60 * 60; // 1 day
    uint256 public maxPoolDuration = 30 * 24 * 60 * 60; // 30 days
    uint256 public maxPoolNameLength = 30;
    uint256 public minContribution = 1 * 10 ** 6; // 1 USDC

    // Storage
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => uint256[]) public opinionPools;
    uint256 public poolCount;

    // Events
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        address indexed creator,
        uint256 initialContribution,
        uint256 deadline,
        string name,
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

    // Constructor
    constructor() {
        poolCount = 0;
    }

    // Errors
    error DeadlineTooShort(uint256 provided, uint256 required);
    error DeadlineTooLong(uint256 provided, uint256 maximum);
    error ContributionTooLow(uint256 provided, uint256 required);
    error InvalidIPFSHash(string provided);
    error PoolNameTooLong(uint256 provided, uint256 maximum);
    error SameAsCurrentAnswer(string answer);

    // Create a pool - no real dependencies, just validate and store
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) external returns (uint256) {
        // Basic validations
        if (deadline < block.timestamp + minPoolDuration) {
            revert DeadlineTooShort(
                deadline,
                block.timestamp + minPoolDuration
            );
        }

        if (deadline > block.timestamp + maxPoolDuration) {
            revert DeadlineTooLong(deadline, block.timestamp + maxPoolDuration);
        }

        if (initialContribution < minContribution) {
            revert ContributionTooLow(initialContribution, minContribution);
        }

        if (bytes(name).length > maxPoolNameLength) {
            revert PoolNameTooLong(bytes(name).length, maxPoolNameLength);
        }

        // Validate IPFS hash
        if (bytes(ipfsHash).length > 0) {
            bool isValidCIDv0 = bytes(ipfsHash).length == 46 &&
                bytes(ipfsHash)[0] == "Q" &&
                bytes(ipfsHash)[1] == "m";

            bool isValidCIDv1 = bytes(ipfsHash).length >= 48 &&
                bytes(ipfsHash)[0] == "b";

            if (!isValidCIDv0 && !isValidCIDv1) {
                revert InvalidIPFSHash(ipfsHash);
            }
        }

        // For simplicity, mock the current answer check
        if (
            keccak256(bytes(proposedAnswer)) ==
            keccak256(bytes("Initial Answer"))
        ) {
            revert SameAsCurrentAnswer(proposedAnswer);
        }

        // Create pool
        uint256 poolId = poolCount++;

        pools[poolId] = PoolInfo({
            id: poolId,
            opinionId: opinionId,
            proposedAnswer: proposedAnswer,
            creator: msg.sender,
            totalAmount: initialContribution,
            deadline: deadline,
            status: 0, // Active
            name: name,
            ipfsHash: ipfsHash
        });

        // Track pool by opinion
        opinionPools[opinionId].push(poolId);

        // Emit events
        emit PoolCreated(
            poolId,
            opinionId,
            proposedAnswer,
            msg.sender,
            initialContribution,
            deadline,
            name,
            block.timestamp
        );

        emit PoolAction(
            poolId,
            opinionId,
            0, // create
            msg.sender,
            initialContribution,
            proposedAnswer
        );

        return poolId;
    }

    // Get pool details
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

    // Get pools for an opinion
    function getOpinionPools(
        uint256 opinionId
    ) external view returns (uint256[] memory) {
        return opinionPools[opinionId];
    }

    // Change pool creation fee (for testing)
    function setPoolCreationFee(uint256 newFee) external {
        poolCreationFee = newFee;
    }
}
