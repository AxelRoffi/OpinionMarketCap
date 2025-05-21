// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/interfaces/IOpinionMarketErrors.sol";

contract MockRateLimiter is IOpinionMarketErrors {
    // Rate limiting configuration
    uint256 public maxTradesPerBlock;
    uint32 public rapidTradeWindow;
    uint8 public mevPenaltyPercent;

    // Rate limiting state
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;

    // MEV protection state
    mapping(address => mapping(uint256 => uint32)) public userLastTradeTime;
    mapping(address => mapping(uint256 => uint96)) public userLastTradePrice;

    // For testing - mock block number
    uint256 private mockBlockNumber = 1;

    constructor(
        uint256 _maxTradesPerBlock,
        uint32 _rapidTradeWindow,
        uint8 _mevPenaltyPercent
    ) {
        maxTradesPerBlock = _maxTradesPerBlock;
        rapidTradeWindow = _rapidTradeWindow;
        mevPenaltyPercent = _mevPenaltyPercent;
    }

    // -- Core functionality -- //

    function checkAndUpdateTradesInBlock() public {
        if (userLastBlock[msg.sender] != mockBlockNumber) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = mockBlockNumber;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert MaxTradesPerBlockExceeded(
                    userTradesInBlock[msg.sender],
                    maxTradesPerBlock
                );
            }
        }
    }

    function checkTradeAllowed(uint256 opinionId) public {
        if (userLastTradeBlock[msg.sender][opinionId] == mockBlockNumber)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = mockBlockNumber;
    }

    function simulateTrade(uint256 opinionId) external {
        checkAndUpdateTradesInBlock();
        checkTradeAllowed(opinionId);

        // Update MEV tracking data
        userLastTradeTime[msg.sender][opinionId] = uint32(block.timestamp);
        userLastTradePrice[msg.sender][opinionId] = 1_000_000; // Example price (1 USDC)
    }

    function calculateMEVPenalty(
        uint96 price,
        uint96 ownerAmount,
        address trader,
        uint256 opinionId
    )
        external
        view
        returns (uint96 adjustedPlatformFee, uint96 adjustedOwnerAmount)
    {
        // Initial fee distribution (simplified)
        uint96 platformFee = uint96((price * 5) / 100); // 5% platform fee
        adjustedOwnerAmount = ownerAmount;

        uint32 lastTradeTime = userLastTradeTime[trader][opinionId];

        // Skip if not a rapid trade
        if (
            lastTradeTime == 0 ||
            (block.timestamp - lastTradeTime) >= rapidTradeWindow
        ) {
            return (platformFee, adjustedOwnerAmount);
        }

        // Apply MEV penalty (simplified implementation)
        uint256 timeElapsed = block.timestamp - lastTradeTime;
        uint256 penaltyMultiplier = ((rapidTradeWindow - timeElapsed) * 100) /
            rapidTradeWindow;

        uint96 penaltyAmount = uint96(
            (price * mevPenaltyPercent * penaltyMultiplier) / 10000
        );

        // Cap penalty at half of owner amount
        if (penaltyAmount > adjustedOwnerAmount / 2) {
            penaltyAmount = adjustedOwnerAmount / 2;
        }

        adjustedPlatformFee = platformFee + penaltyAmount;
        adjustedOwnerAmount -= penaltyAmount;

        return (adjustedPlatformFee, adjustedOwnerAmount);
    }

    // -- Admin functions -- //

    function setMaxTradesPerBlock(uint256 _maxTradesPerBlock) external {
        maxTradesPerBlock = _maxTradesPerBlock;
    }

    function setRapidTradeWindow(uint32 _rapidTradeWindow) external {
        rapidTradeWindow = _rapidTradeWindow;
    }

    function setMEVPenaltyPercent(uint8 _mevPenaltyPercent) external {
        mevPenaltyPercent = _mevPenaltyPercent;
    }

    // -- Testing helper functions -- //

    // Simulate a new block
    function simulateNewBlock() external {
        mockBlockNumber++;
    }

    // Get current mock block
    function getCurrentBlockForTesting() external view returns (uint256) {
        return mockBlockNumber;
    }

    // Manually set the number of trades in "current block"
    function manuallySetTradesInBlock(uint256 trades) external {
        userLastBlock[msg.sender] = mockBlockNumber;
        userTradesInBlock[msg.sender] = trades;
    }

    // Manually mark an opinion as traded in current block
    function manuallySetLastTradeBlock(uint256 opinionId) external {
        userLastTradeBlock[msg.sender][opinionId] = mockBlockNumber;
    }

    // Test function that just checks max trades and increments
    function checkMaxTradesAndIncrement() external {
        if (userLastBlock[msg.sender] != mockBlockNumber) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = mockBlockNumber;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert MaxTradesPerBlockExceeded(
                    userTradesInBlock[msg.sender],
                    maxTradesPerBlock
                );
            }
        }
    }

    // Test function that just checks if opinion trade is allowed
    function checkOpinionTradeAllowed(uint256 opinionId) external {
        if (userLastTradeBlock[msg.sender][opinionId] == mockBlockNumber)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = mockBlockNumber;
    }

    // -- View functions for testing -- //

    function getUserTradesInBlock(
        address user
    ) external view returns (uint256) {
        return userTradesInBlock[user];
    }

    function getUserLastBlock(address user) external view returns (uint256) {
        return userLastBlock[user];
    }

    function getUserLastTradeBlock(
        address user,
        uint256 opinionId
    ) external view returns (uint256) {
        return userLastTradeBlock[user][opinionId];
    }
}
