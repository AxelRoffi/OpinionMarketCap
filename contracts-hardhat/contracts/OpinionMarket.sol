// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract OpinionMarket is Ownable, ReentrancyGuard, Pausable {
    uint256 public constant EXPIRY_DURATION = 30 days;
    uint256 public constant FINAL_ANSWER_PRICE = 100_000_000 * 10 ** 6; // 100M USDC
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    uint256 public constant MINIMUM_PRICE = 1_000_000; // 1 USDC

    struct Opinion {
        uint256 id;
        string question;
        string currentAnswer;
        address owner;
        uint256 currentPrice;
        bool isActive;
        uint256 lastUpdateTime;
        uint256 totalVolume;
        bool isEngraved;
    }

    mapping(uint256 => Opinion) public opinions;
    uint256 public nextOpinionId = 1;
    IERC20 public wethToken;
    IERC20 public usdcToken;

    event OpinionCreated(
        uint256 indexed id,
        string question,
        uint256 initialPrice,
        address creator
    );
    event AnswerUpdated(
        uint256 indexed id,
        string newAnswer,
        address newOwner,
        uint256 price
    );
    event OpinionEngraved(
        uint256 indexed id,
        string finalAnswer,
        address finalOwner
    );

    error InvalidPrice();
    error OpinionNotActive();
    error InsufficientAllowance();
    error TransferFailed();
    error InvalidToken();
    error OpinionEngravedError();
    error OpinionExpiredError();

    constructor() Ownable(msg.sender) {}

    function configureTokens(
        address _wethToken,
        address _usdcToken
    ) external onlyOwner {
        if (_wethToken == address(0) || _usdcToken == address(0))
            revert InvalidToken();
        wethToken = IERC20(_wethToken);
        usdcToken = IERC20(_usdcToken);
    }

    function createOpinion(
        string calldata question,
        uint256 initialPrice
    ) external onlyOwner whenNotPaused {
        if (initialPrice < MINIMUM_PRICE) revert InvalidPrice();

        opinions[nextOpinionId] = Opinion({
            id: nextOpinionId,
            question: question,
            currentAnswer: "",
            owner: address(0),
            currentPrice: initialPrice,
            isActive: true,
            lastUpdateTime: block.timestamp,
            totalVolume: 0,
            isEngraved: false
        });

        emit OpinionCreated(nextOpinionId, question, initialPrice, msg.sender);
        nextOpinionId++;
    }

    function calculateNewPrice(
        uint256 currentPrice
    ) internal view returns (uint256) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    currentPrice
                )
            )
        ) % 100;

        // 10% chance of loss (-10% to -5%)
        if (rand < 10) {
            uint256 loss = 5 + (rand % 6);
            return currentPrice - ((currentPrice * loss) / 100);
        }
        // 20% chance of high gain (31% to 45%)
        else if (rand >= 80) {
            uint256 highGain = 31 + (rand % 15);
            return currentPrice + ((currentPrice * highGain) / 100);
        }
        // 70% chance of normal gain (0% to 30%)
        else {
            uint256 normalGain = rand % 31;
            return currentPrice + ((currentPrice * normalGain) / 100);
        }
    }

    function buyAnswer(
        uint256 opinionId,
        string calldata newAnswer,
        address paymentToken
    ) external nonReentrant whenNotPaused {
        Opinion storage opinion = opinions[opinionId];

        // Check expiry first
        if (block.timestamp > opinion.lastUpdateTime + EXPIRY_DURATION) {
            opinions[opinionId].isEngraved = true;
            emit OpinionEngraved(
                opinionId,
                opinion.currentAnswer,
                opinion.owner
            );
            revert OpinionExpiredError();
        }

        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.isEngraved) revert OpinionEngravedError();

        IERC20 token = paymentToken == address(wethToken)
            ? wethToken
            : usdcToken;
        uint256 allowance = token.allowance(msg.sender, address(this));
        uint256 price;
        bool isFinalAnswer = false;

        if (allowance == FINAL_ANSWER_PRICE) {
            price = FINAL_ANSWER_PRICE;
            isFinalAnswer = true;
        } else {
            price = calculateNewPrice(opinion.currentPrice);
            if (allowance < price) revert InsufficientAllowance();
        }

        if (!token.transferFrom(msg.sender, address(this), price))
            revert TransferFailed();

        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 ownerAmount = price - platformFee;

        if (opinion.owner != address(0)) {
            if (!token.transfer(opinion.owner, ownerAmount))
                revert TransferFailed();
        } else {
            if (!token.transfer(owner(), ownerAmount)) revert TransferFailed();
        }

        opinion.currentPrice = price;
        opinion.currentAnswer = newAnswer;
        opinion.owner = msg.sender;
        opinion.totalVolume += price;
        opinion.lastUpdateTime = block.timestamp;

        if (isFinalAnswer) {
            opinion.isEngraved = true;
            emit OpinionEngraved(opinionId, newAnswer, msg.sender);
        }

        emit AnswerUpdated(opinionId, newAnswer, msg.sender, price);
    }

    function withdrawPlatformFees(
        address token,
        address to
    ) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (!IERC20(token).transfer(to, balance)) revert TransferFailed();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
