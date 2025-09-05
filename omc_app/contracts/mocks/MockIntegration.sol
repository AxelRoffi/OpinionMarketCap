// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockIntegration {
    // Rate limiting configuration
    uint256 public maxTradesPerBlock;
    uint32 public rapidTradeWindow;
    uint8 public mevPenaltyPercent;

    // Token for testing fee distributions
    IERC20 public token;

    // Rate limiting state
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;

    // MEV protection state
    mapping(address => mapping(uint256 => uint32)) public userLastTradeTime;

    // Fee accumulation tracking
    mapping(address => uint256) public accumulatedFees;
    uint256 public platformFees;

    // Empty constructor to avoid parameter issues
    constructor() {}

    // -- Rate limiting checks -- //

    function checkAndUpdateTradesInBlock() internal {
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert("MaxTradesPerBlockExceeded");
            }
        }
    }

    function checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert("OneTradePerBlock");
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    // -- Simulated operations -- //

    function simulateCreateOpinion(
        string calldata question,
        string calldata answer
    ) external {
        // Check trade limits
        checkAndUpdateTradesInBlock();

        // Record as initial trade for the new opinion ID
        uint256 newOpinionId = block.timestamp; // Just a dummy ID
        userLastTradeBlock[msg.sender][newOpinionId] = block.number;

        // Update MEV tracking
        userLastTradeTime[msg.sender][newOpinionId] = uint32(block.timestamp);
    }

    function simulateSubmitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external {
        // Check rate limits
        checkAndUpdateTradesInBlock();
        checkTradeAllowed(opinionId);

        // Update MEV tracking
        userLastTradeTime[msg.sender][opinionId] = uint32(block.timestamp);
    }

    function simulatePoolContribution(uint256 poolId, uint256 amount) external {
        // Count as a regular trade for rate limiting
        checkAndUpdateTradesInBlock();
    }

    function simulateRapidTradeWithFees(
        uint256 opinionId,
        string calldata answer,
        uint256 price,
        address creator,
        address previousOwner
    ) external {
        // Check rate limits
        checkAndUpdateTradesInBlock();
        checkTradeAllowed(opinionId);

        // Timestamps for MEV calculation
        uint32 lastTradeTime = userLastTradeTime[previousOwner][opinionId];
        uint32 currentTime = uint32(block.timestamp);

        // Calculate standard fees
        uint256 platformFee = (price * 2) / 100; // 2%
        uint256 creatorFee = (price * 3) / 100; // 3%
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Apply MEV penalty if rapid trade
        if (
            lastTradeTime > 0 &&
            (currentTime - lastTradeTime) < rapidTradeWindow
        ) {
            // Calculate penalty based on elapsed time
            uint256 timeElapsed = currentTime - lastTradeTime;
            uint256 penaltyFactor = ((rapidTradeWindow - timeElapsed) * 100) /
                rapidTradeWindow;
            uint256 penalty = (price * mevPenaltyPercent * penaltyFactor) /
                10000;

            // Adjust fees
            platformFee += penalty;
            ownerAmount -= penalty;
        }

        // Distribute fees
        platformFees += platformFee;
        accumulatedFees[creator] += creatorFee;
        accumulatedFees[previousOwner] += ownerAmount;

        // Update MEV tracking for future trades
        userLastTradeTime[msg.sender][opinionId] = currentTime;
    }

    // -- Admin functions -- //

    function setToken(address _token) external {
        token = IERC20(_token);
    }

    function setMaxTradesPerBlock(uint256 _maxTradesPerBlock) external {
        maxTradesPerBlock = _maxTradesPerBlock;
    }

    function setRapidTradeWindow(uint32 _rapidTradeWindow) external {
        rapidTradeWindow = _rapidTradeWindow;
    }

    function setMEVPenaltyPercent(uint8 _mevPenaltyPercent) external {
        mevPenaltyPercent = _mevPenaltyPercent;
    }

    // -- View functions -- //

    function getAccumulatedFees(address user) external view returns (uint256) {
        return accumulatedFees[user];
    }

    function getPlatformFees() external view returns (uint256) {
        return platformFees;
    }
}
