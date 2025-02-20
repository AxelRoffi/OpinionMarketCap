// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OpinionMarket is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    // Put this at the very top of the contract body
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _usdcToken) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);

        usdcToken = IERC20(_usdcToken);
        nextOpinionId = 1;
    }

    function grantRole(
        bytes32 role,
        address account
    ) public virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit RoleGranted(role, account);
    }

    function revokeRole(
        bytes32 role,
        address account
    ) public virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleRevoked(role, account);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // Constants
    // Constants - Removed expiry-related constants
    uint256 public constant MAX_QUESTION_LENGTH = 50;
    uint256 public constant MAX_ANSWER_LENGTH = 40;
    uint256 public constant MINIMUM_PRICE = 1_000_000; // 1 USDC
    uint256 public constant FINAL_ANSWER_PRICE = 1_000_000_000_000_000; // 1000M USDC
    uint256 public constant PLATFORM_FEE_PERCENT = 2; // 2%
    uint256 public constant CREATOR_FEE_PERCENT = 3; // 3%
    uint256 public constant MIN_BLOCKS_BETWEEN_PRICES = 1;
    uint256 public constant ABSOLUTE_MAX_PRICE_CHANGE = 200; // 200%

    // State variables
    bool public isPublicCreationEnabled;
    uint256 public nextOpinionId;
    IERC20 public usdcToken;
    uint256 private nonce;
    mapping(address => uint256) public accumulatedFees;
    mapping(uint256 => uint256) private lastPriceBlock;
    uint256 public totalAccumulatedFees;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    struct Opinion {
        uint256 id;
        string question;
        address creator;
        uint256 currentPrice;
        bool isActive;
        // Answer management fields
        string currentAnswer;
        address currentAnswerOwner;
        uint256 totalVolume;
        bool isFinal;
    }

    error ContractPaused();
    error ContractNotPaused();
    error WithdrawalFailed();

    // Answer history struct
    struct AnswerHistory {
        string answer;
        address owner;
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => AnswerHistory[]) public answerHistory;

    // Custom errors - Removed expiry-related errors
    error EmptyString();
    error InvalidQuestionLength();
    error InvalidAnswerLength();
    error InvalidPrice();
    error UnauthorizedCreator();
    error OpinionNotActive();
    error OpinionIsFinal();
    error TransferFailed();
    error OpinionNotFound();
    error InsufficientAllowance(uint256 required, uint256 provided);
    //error MaxTradesPerBlockExceeded(uint256 opinionId);
    error OneTradePerBlock();
    error AlreadyTradedInBlock();
    error PriceChangeExceedsLimit(uint256 increase, uint256 limit);

    // Events - Removed expiry-related events
    event OpinionCreated(
        uint256 indexed id,
        string question,
        uint256 initialPrice,
        address creator
    );
    event PublicCreationToggled(bool isEnabled);
    event AnswerSubmitted(
        uint256 indexed opinionId,
        string answer,
        address owner,
        uint256 price
    );
    event FinalAnswerSubmitted(
        uint256 indexed opinionId,
        string answer,
        address owner
    );
    event OpinionDeactivated(uint256 indexed opinionId);
    event FeesDistributed(
        uint256 indexed opinionId,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount,
        address currentOwner
    );
    event TradeAttempt(
        address user,
        uint256 opinionId,
        uint256 currentBlock,
        uint256 lastRecordedBlock
    );
    event EmergencyWithdraw(address token, uint256 amount, uint256 timestamp);
    event USDCApprovalUpdated(address indexed user, uint256 amount);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event FeesAccumulated(address indexed user, uint256 amount);
    event FeesClaimed(address indexed user, uint256 amount);

    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    function approveUSDC(uint256 amount) external {
        require(
            usdcToken.approve(address(this), amount),
            "USDC approval failed"
        );
        emit USDCApprovalUpdated(msg.sender, amount);
    }

    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint256 amount = accumulatedFees[msg.sender];
        require(amount > 0, "No fees to claim");

        // Update state before transfer (CEI pattern)
        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        // Transfer fees
        usdcToken.safeTransfer(msg.sender, amount);

        emit FeesClaimed(msg.sender, amount);
    }

    function createOpinion(
        string calldata question,
        string calldata initialAnswer,
        uint256 initialPrice
    ) external whenNotPaused {
        // Access control
        if (!isPublicCreationEnabled && msg.sender != owner()) {
            revert UnauthorizedCreator();
        }

        // Validation
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);
        if (questionBytes.length == 0 || answerBytes.length == 0)
            revert EmptyString();
        if (questionBytes.length > MAX_QUESTION_LENGTH)
            revert InvalidQuestionLength();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();
        if (initialPrice < MINIMUM_PRICE) revert InvalidPrice();

        // Handle USDC transfer
        if (!usdcToken.transferFrom(msg.sender, address(this), initialPrice)) {
            revert TransferFailed();
        }

        // Calculate and distribute fees
        uint256 platformFee = (initialPrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (initialPrice * CREATOR_FEE_PERCENT) / 100;

        if (!usdcToken.transfer(owner(), platformFee)) revert TransferFailed();
        if (!usdcToken.transfer(msg.sender, creatorFee))
            revert TransferFailed();

        // Create opinion
        uint256 opinionId = nextOpinionId++;
        Opinion storage opinion = opinions[opinionId];

        // Set all opinion fields
        opinion.id = opinionId;
        opinion.question = question;
        opinion.creator = msg.sender;
        opinion.currentPrice = initialPrice;
        opinion.isActive = true;
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.isFinal = false;

        // Record initial answer
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: initialAnswer,
                owner: msg.sender,
                price: initialPrice,
                timestamp: block.timestamp
            })
        );

        // Emit events
        emit OpinionCreated(opinionId, question, initialPrice, msg.sender);
        emit AnswerSubmitted(
            opinionId,
            initialAnswer,
            msg.sender,
            initialPrice
        );
        emit FeesDistributed(opinionId, platformFee, creatorFee, 0, address(0));
    }

    function deactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        Opinion storage opinion = opinions[opinionId];
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        opinion.isActive = false;
        emit OpinionDeactivated(opinionId);
    }

    function emergencyWithdraw(
        address token
    ) external onlyRole(MODERATOR_ROLE) onlyOwner nonReentrant whenPaused {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));

        try tokenContract.transfer(owner(), balance) returns (bool success) {
            if (!success) revert WithdrawalFailed();
            emit EmergencyWithdraw(token, balance, block.timestamp);
        } catch {
            revert WithdrawalFailed();
        }
    }

    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number) {
            revert OneTradePerBlock();
        }
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external virtual nonReentrant whenNotPaused {
        _checkTradeAllowed(opinionId);
        // Cache opinion storage pointer - reduces SLOADs
        Opinion storage opinion = opinions[opinionId];

        // Rest of the function stays exactly the same
        address currentAnswerOwner = opinion.currentAnswerOwner;
        address creator = opinion.creator;

        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.isFinal) revert OpinionIsFinal();

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        uint256 currentPrice = opinion.currentPrice;
        uint256 price = _calculateNextPrice(currentPrice);

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) {
            revert InsufficientAllowance(price, allowance);
        }

        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (price * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = price - platformFee - creatorFee;

        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        usdcToken.safeTransfer(owner(), platformFee);

        if (creator != address(0)) {
            accumulatedFees[creator] += creatorFee;
            totalAccumulatedFees += creatorFee;
            emit FeesAccumulated(creator, creatorFee);
        }

        if (currentAnswerOwner != address(0)) {
            accumulatedFees[currentAnswerOwner] += ownerAmount;
            totalAccumulatedFees += ownerAmount;
            emit FeesAccumulated(currentAnswerOwner, ownerAmount);
        }

        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentAnswerOwner
        );

        answerHistory[opinionId].push(
            AnswerHistory({
                answer: answer,
                owner: msg.sender,
                price: price,
                timestamp: block.timestamp
            })
        );

        uint256 newTotalVolume = opinion.totalVolume + price;

        opinion.currentAnswer = answer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.currentPrice = price;
        opinion.totalVolume = newTotalVolume;

        emit AnswerSubmitted(opinionId, answer, msg.sender, price);
    }

    function submitFinalAnswer(
        uint256 opinionId,
        string calldata answer
    ) external nonReentrant whenNotPaused {
        _checkTradeAllowed(opinionId);
        Opinion storage opinion = opinions[opinionId];

        address currentAnswerOwner = opinion.currentAnswerOwner;
        address creator = opinion.creator;

        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.isFinal) revert OpinionIsFinal();

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        uint256 platformFee = (FINAL_ANSWER_PRICE * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (FINAL_ANSWER_PRICE * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = FINAL_ANSWER_PRICE - platformFee - creatorFee;

        usdcToken.safeTransferFrom(
            msg.sender,
            address(this),
            FINAL_ANSWER_PRICE
        );
        usdcToken.safeTransfer(owner(), platformFee);

        if (creator != address(0)) {
            accumulatedFees[creator] += creatorFee;
            totalAccumulatedFees += creatorFee;
            emit FeesAccumulated(creator, creatorFee);
        }

        if (currentAnswerOwner != address(0)) {
            accumulatedFees[currentAnswerOwner] += ownerAmount;
            totalAccumulatedFees += ownerAmount;
            emit FeesAccumulated(currentAnswerOwner, ownerAmount);
        }

        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentAnswerOwner
        );

        uint256 newTotalVolume = opinion.totalVolume + FINAL_ANSWER_PRICE;

        answerHistory[opinionId].push(
            AnswerHistory({
                answer: answer,
                owner: msg.sender,
                price: FINAL_ANSWER_PRICE,
                timestamp: block.timestamp
            })
        );

        opinion.currentAnswer = answer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.currentPrice = FINAL_ANSWER_PRICE;
        opinion.totalVolume = newTotalVolume;
        opinion.isFinal = true;

        emit FinalAnswerSubmitted(opinionId, answer, msg.sender);
    }

    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit PublicCreationToggled(isPublicCreationEnabled);
    }

    function _validatePriceChange(
        uint256 currentPrice,
        uint256 newPrice
    ) internal pure {
        if (newPrice > currentPrice) {
            uint256 increase = ((newPrice - currentPrice) * 100) / currentPrice;
            if (increase > ABSOLUTE_MAX_PRICE_CHANGE) {
                revert PriceChangeExceedsLimit(
                    increase,
                    ABSOLUTE_MAX_PRICE_CHANGE
                );
            }
        }
    }

    function _calculateNextPrice(
        uint256 currentPrice
    ) internal returns (uint256) {
        bytes32 randomness = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                nonce++,
                blockhash(block.number - 1),
                gasleft(),
                tx.gasprice,
                address(this).balance,
                block.number,
                tx.origin,
                address(this)
            )
        );

        uint256 randomFactor = uint256(randomness) % 1000;
        int256 adjustment;

        if (randomFactor < 200) {
            adjustment = -20 + int256(randomFactor % 20);
        } else if (randomFactor < 700) {
            adjustment = 10 + int256(randomFactor % 15);
        } else {
            adjustment = 25 + int256(randomFactor % 75);
        }

        uint256 newPrice = (currentPrice * uint256(100 + adjustment)) / 100;
        newPrice = newPrice < MINIMUM_PRICE ? MINIMUM_PRICE : newPrice;

        // Validation supplémentaire
        _validatePriceChange(currentPrice, newPrice);

        return newPrice;
    }
    // View functions
    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (AnswerHistory[] memory) {
        return answerHistory[opinionId];
    }

    function calculateFreeExpiredPrice(
        uint256 opinionId
    ) public view returns (uint256) {
        Opinion storage opinion = opinions[opinionId];
        return opinion.currentPrice * 4; // 4x the last price
    }

    function hasRole(
        bytes32 role,
        address account
    ) public view virtual override returns (bool) {
        return super.hasRole(role, account);
    }
}
