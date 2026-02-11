// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AnswerSharesCore
 * @dev Core trading contract for Answer Shares model (Bonding Curve)
 * @notice UUPS Upgradeable - Same pattern as OpinionCoreV3
 *
 * Mechanics:
 * - Anyone can create a question (pays creation fee)
 * - Anyone can propose an answer (stakes USDC, becomes first shares)
 * - Anyone can buy/sell shares in any answer (bonding curve pricing)
 * - Leading answer = highest market cap (poolValue)
 * - No resolution - opinions are subjective
 *
 * Security Features:
 * - UUPS Upgradeable with ADMIN_ROLE authorization
 * - ReentrancyGuard on all state-changing functions
 * - Pausable for emergency stops
 * - Overflow protection on all arithmetic
 * - Slippage + deadline protection on trades
 */
contract AnswerSharesCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    // === ROLES ===
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // Contract-to-contract roles (for future modular expansion)
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant EXTENSION_CONTRACT_ROLE = keccak256("EXTENSION_CONTRACT_ROLE");
    bytes32 public constant ADMIN_CONTRACT_ROLE = keccak256("ADMIN_CONTRACT_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // === STRUCTS ===

    struct Question {
        uint256 id;
        string text;
        string category;       // Category for filtering
        address creator;
        uint48 createdAt;
        bool isActive;
        uint256 totalVolume;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string text;
        string description;      // Context/reasoning for this answer
        string link;             // External link (evidence/source)
        address proposer;
        uint128 totalShares;     // Total shares in circulation
        uint128 poolValue;       // USDC backing this answer
        uint48 createdAt;
        bool isActive;
        bool isFlagged;          // Moderation flag (still tradeable, but marked)
    }

    struct Position {
        uint128 shares;          // Shares owned
        uint128 costBasis;       // Total USDC spent (for P&L tracking)
    }

    // === STATE VARIABLES ===

    IERC20 public usdcToken;
    address public treasury;

    uint256 public nextQuestionId;
    uint256 public nextAnswerId;

    // Core storage
    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(uint256 => uint256[]) public questionAnswerIds;      // questionId => answerIds[]
    mapping(uint256 => mapping(address => Position)) public positions;  // answerId => user => Position
    mapping(uint256 => address[]) internal answerHolders;        // answerId => holders[]
    mapping(uint256 => mapping(address => bool)) internal isHolder;  // answerId => user => isHolder

    // Anti-spam: duplicate detection
    mapping(uint256 => mapping(bytes32 => bool)) public answerTextExists;

    // === FEE ACCUMULATION (Claimable Rewards) ===
    mapping(address => uint96) public accumulatedFees;      // User => claimable USDC
    uint96 public totalAccumulatedFees;                     // Total claimable by all users

    // === CONFIGURATION ===

    uint96 public questionCreationFee;      // Fee to create a question
    uint96 public answerProposalStake;      // Stake to propose answer (becomes shares)
    uint16 public platformFeeBps;           // Platform fee in basis points (200 = 2%) → treasury
    uint16 public creatorFeeBps;            // Creator fee in basis points (300 = 3%) → question creator
    uint8 public maxAnswersPerQuestion;     // Max answers per question

    // === CONSTANTS ===

    uint256 public constant SHARES_DECIMALS = 100;       // 2 decimal places (1 share = 100 internally, 4.52 shares = 452)
    uint256 public constant MIN_POOL_RESERVE = 1e6;      // $1 minimum pool (math safety)
    uint256 public constant MIN_SHARES_RESERVE = 1;      // 0.01 share minimum (prevent division by zero)
    uint256 public constant MAX_FEE_BPS = 1000;          // 10% max fee
    uint256 public constant MAX_QUESTION_FEE = 100e6;    // $100 max question fee
    uint256 public constant MAX_PROPOSAL_STAKE = 1000e6; // $1000 max proposal stake
    uint128 public constant MAX_POOL_VALUE = type(uint128).max / 2;  // Overflow protection
    uint128 public constant MAX_TOTAL_SHARES = type(uint128).max / 2;  // Overflow protection

    // === EVENTS ===

    event QuestionCreated(
        uint256 indexed questionId,
        address indexed creator,
        string text,
        string category
    );

    event QuestionCreatedWithAnswer(
        uint256 indexed questionId,
        uint256 indexed answerId,
        address indexed creator,
        string questionText,
        string answerText,
        string answerDescription,
        string answerLink,
        uint256 initialShares
    );

    event AnswerProposed(
        uint256 indexed answerId,
        uint256 indexed questionId,
        address indexed proposer,
        string text,
        string description,
        string link,
        uint256 initialShares
    );

    event SharesBought(
        uint256 indexed answerId,
        address indexed buyer,
        uint256 shares,
        uint256 cost,
        uint256 newPrice
    );

    event SharesSold(
        uint256 indexed answerId,
        address indexed seller,
        uint256 shares,
        uint256 returnAmount,
        uint256 newPrice
    );

    event AnswerDeactivated(uint256 indexed answerId, address indexed moderator);
    event AnswerReactivated(uint256 indexed answerId, address indexed moderator);
    event AnswerFlagged(uint256 indexed answerId, address indexed moderator, string reason);
    event QuestionDeactivated(uint256 indexed questionId, address indexed moderator);
    event QuestionReactivated(uint256 indexed questionId, address indexed moderator);

    // Admin events
    event FeesUpdated(uint16 platformFeeBps, uint16 creatorFeeBps);
    event QuestionCreationFeeUpdated(uint96 oldFee, uint96 newFee);
    event AnswerProposalStakeUpdated(uint96 oldStake, uint96 newStake);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event MaxAnswersUpdated(uint8 oldMax, uint8 newMax);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    // Fee claiming events
    event FeesAccumulated(address indexed recipient, uint96 amount, uint96 newTotal);
    event FeesClaimed(address indexed user, uint96 amount);

    // === ERRORS ===

    error QuestionNotFound();
    error QuestionNotActive();
    error AnswerNotFound();
    error AnswerNotActive();
    error MaxAnswersReached();
    error DuplicateAnswer();
    error InsufficientShares();
    error TextTooShort();
    error TextTooLong();
    error ZeroAmount();
    error SlippageExceeded();
    error DeadlineExpired();
    error PoolReserveViolation();
    error SharesReserveViolation();
    error PoolOverflow();
    error SharesOverflow();
    error InvalidAddress();
    error FeeTooHigh();
    error StakeTooLow();
    error StakeTooHigh();
    error InvalidMaxAnswers();
    error NotPaused();
    error NoFeesToClaim();

    // === INITIALIZATION ===

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract (called once on deployment)
     * @param _usdcToken USDC token address
     * @param _treasury Treasury address for fees
     * @param _admin Admin address
     */
    function initialize(
        address _usdcToken,
        address _treasury,
        address _admin
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        if (_usdcToken == address(0)) revert InvalidAddress();
        if (_treasury == address(0)) revert InvalidAddress();
        if (_admin == address(0)) revert InvalidAddress();

        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MODERATOR_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _admin);

        // Default configuration
        questionCreationFee = 2e6;          // $2 USDC
        answerProposalStake = 5e6;          // $5 USDC
        platformFeeBps = 150;               // 1.5% → treasury
        creatorFeeBps = 50;                 // 0.5% → question creator (claimable)
        maxAnswersPerQuestion = 10;

        nextQuestionId = 1;
        nextAnswerId = 1;
    }

    // === CORE FUNCTIONS ===

    /**
     * @notice Create a new question (without initial answer)
     * @dev Consider using createQuestionWithAnswer() instead to include first answer
     * @param text The question text (5-100 chars)
     * @param category Category for filtering (max 50 chars)
     * @return questionId The ID of the created question
     */
    function createQuestion(
        string calldata text,
        string calldata category
    ) external nonReentrant whenNotPaused returns (uint256 questionId) {
        // Validate text
        if (bytes(text).length < 5) revert TextTooShort();
        if (bytes(text).length > 100) revert TextTooLong();
        if (bytes(category).length > 50) revert TextTooLong();

        // Collect creation fee
        if (questionCreationFee > 0) {
            usdcToken.safeTransferFrom(msg.sender, treasury, questionCreationFee);
        }

        // Create question
        questionId = nextQuestionId++;
        questions[questionId] = Question({
            id: questionId,
            text: text,
            category: category,
            creator: msg.sender,
            createdAt: uint48(block.timestamp),
            isActive: true,
            totalVolume: 0
        });

        emit QuestionCreated(questionId, msg.sender, text, category);
    }

    /**
     * @notice Create a question with an initial answer (recommended)
     * @dev Combines createQuestion + proposeAnswer in one transaction
     * @param questionText The question text (5-100 chars)
     * @param category Category for filtering (max 50 chars)
     * @param answerText The initial answer text (1-60 chars)
     * @param answerDescription Context/reasoning for the answer (max 280 chars)
     * @param answerLink External link for evidence/source (max 200 chars)
     * @return questionId The ID of the created question
     * @return answerId The ID of the created answer
     */
    function createQuestionWithAnswer(
        string calldata questionText,
        string calldata category,
        string calldata answerText,
        string calldata answerDescription,
        string calldata answerLink
    ) external nonReentrant whenNotPaused returns (uint256 questionId, uint256 answerId) {
        // Validate question text
        if (bytes(questionText).length < 5) revert TextTooShort();
        if (bytes(questionText).length > 100) revert TextTooLong();
        if (bytes(category).length > 50) revert TextTooLong();

        // Validate answer
        if (bytes(answerText).length < 1) revert TextTooShort();
        if (bytes(answerText).length > 60) revert TextTooLong();
        if (bytes(answerDescription).length > 280) revert TextTooLong();
        if (bytes(answerLink).length > 200) revert TextTooLong();

        // Calculate total cost: creation fee + proposal stake
        uint256 totalCost = uint256(questionCreationFee) + uint256(answerProposalStake);

        // Transfer total amount from user
        usdcToken.safeTransferFrom(msg.sender, address(this), totalCost);

        // Send creation fee to treasury
        if (questionCreationFee > 0) {
            usdcToken.safeTransfer(treasury, questionCreationFee);
        }

        // Create question
        questionId = nextQuestionId++;
        questions[questionId] = Question({
            id: questionId,
            text: questionText,
            category: category,
            creator: msg.sender,
            createdAt: uint48(block.timestamp),
            isActive: true,
            totalVolume: 0
        });

        // Mark answer text as used (case-insensitive)
        bytes32 textHash = keccak256(abi.encodePacked(_toLowerCase(answerText)));
        answerTextExists[questionId][textHash] = true;

        // Create answer with description and link
        answerId = nextAnswerId++;
        // Initial shares: $5 stake → 5.00 shares → 500 internal units (with 2 decimals)
        uint128 initialShares = uint128((answerProposalStake * SHARES_DECIMALS) / 1e6);

        answers[answerId] = Answer({
            id: answerId,
            questionId: questionId,
            text: answerText,
            description: answerDescription,
            link: answerLink,
            proposer: msg.sender,
            totalShares: initialShares,
            poolValue: uint128(answerProposalStake),
            createdAt: uint48(block.timestamp),
            isActive: true,
            isFlagged: false
        });

        questionAnswerIds[questionId].push(answerId);

        // Give creator their shares
        positions[answerId][msg.sender] = Position({
            shares: initialShares,
            costBasis: uint128(answerProposalStake)
        });

        // Track holder
        answerHolders[answerId].push(msg.sender);
        isHolder[answerId][msg.sender] = true;

        emit QuestionCreatedWithAnswer(
            questionId,
            answerId,
            msg.sender,
            questionText,
            answerText,
            answerDescription,
            answerLink,
            initialShares
        );
    }

    /**
     * @notice Propose a new answer to a question
     * @param questionId The question to answer
     * @param answerText The answer text (1-60 chars)
     * @param description Context/reasoning for this answer (max 280 chars)
     * @param link External link for evidence/source (max 200 chars)
     * @return answerId The ID of the created answer
     */
    function proposeAnswer(
        uint256 questionId,
        string calldata answerText,
        string calldata description,
        string calldata link
    ) external nonReentrant whenNotPaused returns (uint256 answerId) {
        Question storage question = questions[questionId];
        if (question.id == 0) revert QuestionNotFound();
        if (!question.isActive) revert QuestionNotActive();
        if (questionAnswerIds[questionId].length >= maxAnswersPerQuestion) revert MaxAnswersReached();

        // Validate text
        if (bytes(answerText).length < 1) revert TextTooShort();
        if (bytes(answerText).length > 60) revert TextTooLong();
        if (bytes(description).length > 280) revert TextTooLong();
        if (bytes(link).length > 200) revert TextTooLong();

        // Check for duplicates (case-insensitive)
        bytes32 textHash = keccak256(abi.encodePacked(_toLowerCase(answerText)));
        if (answerTextExists[questionId][textHash]) revert DuplicateAnswer();
        answerTextExists[questionId][textHash] = true;

        // Collect stake
        usdcToken.safeTransferFrom(msg.sender, address(this), answerProposalStake);

        // Create answer
        answerId = nextAnswerId++;
        // Initial shares: $5 stake → 5.00 shares → 500 internal units (with 2 decimals)
        uint128 initialShares = uint128((answerProposalStake * SHARES_DECIMALS) / 1e6);

        answers[answerId] = Answer({
            id: answerId,
            questionId: questionId,
            text: answerText,
            description: description,
            link: link,
            proposer: msg.sender,
            totalShares: initialShares,
            poolValue: uint128(answerProposalStake),
            createdAt: uint48(block.timestamp),
            isActive: true,
            isFlagged: false
        });

        questionAnswerIds[questionId].push(answerId);

        // Give proposer their shares
        positions[answerId][msg.sender] = Position({
            shares: initialShares,
            costBasis: uint128(answerProposalStake)
        });

        // Track holder
        answerHolders[answerId].push(msg.sender);
        isHolder[answerId][msg.sender] = true;

        emit AnswerProposed(answerId, questionId, msg.sender, answerText, description, link, initialShares);
    }

    /**
     * @notice Buy shares in an answer
     * @param answerId The answer to buy shares in
     * @param usdcAmount Amount of USDC to spend
     * @param minSharesOut Minimum shares to receive (slippage protection)
     * @param deadline Transaction must execute before this timestamp
     * @return sharesBought Number of shares bought
     */
    function buyShares(
        uint256 answerId,
        uint256 usdcAmount,
        uint256 minSharesOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 sharesBought) {
        // Deadline check
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (usdcAmount == 0) revert ZeroAmount();

        Answer storage answer = answers[answerId];
        if (answer.id == 0) revert AnswerNotFound();
        if (!answer.isActive) revert AnswerNotActive();

        // Calculate fees (platform → treasury, creator → claimable)
        uint256 platformFee = (usdcAmount * platformFeeBps) / 10000;
        uint256 creatorFee = (usdcAmount * creatorFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee;
        uint256 amountAfterFee = usdcAmount - totalFee;

        // Calculate shares to mint (price = poolValue / totalShares)
        sharesBought = _calculateSharesForAmount(answer.poolValue, answer.totalShares, amountAfterFee);

        // Slippage check
        if (sharesBought < minSharesOut) revert SlippageExceeded();

        // Overflow protection
        uint256 newPoolValue = uint256(answer.poolValue) + amountAfterFee;
        uint256 newTotalShares = uint256(answer.totalShares) + sharesBought;
        if (newPoolValue > MAX_POOL_VALUE) revert PoolOverflow();
        if (newTotalShares > MAX_TOTAL_SHARES) revert SharesOverflow();

        // Transfer USDC
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Send platform fee to treasury
        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        // Accumulate creator fee for question creator (claimable)
        if (creatorFee > 0) {
            address questionCreator = questions[answer.questionId].creator;
            accumulatedFees[questionCreator] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(questionCreator, uint96(creatorFee), accumulatedFees[questionCreator]);
        }

        // Update answer state (safe after overflow check)
        answer.poolValue = uint128(newPoolValue);
        answer.totalShares = uint128(newTotalShares);

        // Update question volume
        questions[answer.questionId].totalVolume += usdcAmount;

        // Update user position
        Position storage pos = positions[answerId][msg.sender];
        pos.shares += uint128(sharesBought);
        pos.costBasis += uint128(usdcAmount);

        // Track new holder
        if (!isHolder[answerId][msg.sender]) {
            answerHolders[answerId].push(msg.sender);
            isHolder[answerId][msg.sender] = true;
        }

        uint256 newPrice = getSharePrice(answerId);
        emit SharesBought(answerId, msg.sender, sharesBought, usdcAmount, newPrice);
    }

    /**
     * @notice Sell shares in an answer
     * @dev Can sell even if answer is deactivated (to prevent locked funds)
     * @param answerId The answer to sell shares from
     * @param shareAmount Number of shares to sell
     * @param minUsdcOut Minimum USDC to receive (slippage protection)
     * @param deadline Transaction must execute before this timestamp
     * @return usdcReturned Amount of USDC returned
     */
    function sellShares(
        uint256 answerId,
        uint256 shareAmount,
        uint256 minUsdcOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 usdcReturned) {
        // Deadline check
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (shareAmount == 0) revert ZeroAmount();

        Answer storage answer = answers[answerId];
        if (answer.id == 0) revert AnswerNotFound();
        // NOTE: We allow selling even if answer is deactivated to prevent locked funds

        Position storage pos = positions[answerId][msg.sender];
        if (pos.shares < shareAmount) revert InsufficientShares();

        // Ensure minimum shares remain (prevent division by zero)
        if (answer.totalShares - shareAmount < MIN_SHARES_RESERVE) revert SharesReserveViolation();

        // Calculate return (proportional to pool)
        uint256 grossReturn = _calculateReturnForShares(answer.poolValue, answer.totalShares, shareAmount);

        // Pool reserve check
        if (answer.poolValue - grossReturn < MIN_POOL_RESERVE) revert PoolReserveViolation();

        // Calculate fees (same split as buy: platform → treasury, creator → claimable)
        uint256 platformFee = (grossReturn * platformFeeBps) / 10000;
        uint256 creatorFee = (grossReturn * creatorFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee;
        usdcReturned = grossReturn - totalFee;

        // Slippage check
        if (usdcReturned < minUsdcOut) revert SlippageExceeded();

        // Update answer state
        answer.poolValue -= uint128(grossReturn);
        answer.totalShares -= uint128(shareAmount);

        // Update user position (pro-rata cost basis reduction)
        uint256 costBasisReduction = (uint256(pos.costBasis) * shareAmount) / pos.shares;
        pos.shares -= uint128(shareAmount);
        pos.costBasis -= uint128(costBasisReduction);

        // Transfer USDC to seller
        usdcToken.safeTransfer(msg.sender, usdcReturned);

        // Send platform fee to treasury
        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        // Accumulate creator fee for question creator (claimable)
        if (creatorFee > 0) {
            address questionCreator = questions[answer.questionId].creator;
            accumulatedFees[questionCreator] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(questionCreator, uint96(creatorFee), accumulatedFees[questionCreator]);
        }

        uint256 newPrice = getSharePrice(answerId);
        emit SharesSold(answerId, msg.sender, shareAmount, usdcReturned, newPrice);
    }

    // === VIEW FUNCTIONS ===

    /**
     * @notice Get current share price for an answer
     * @param answerId The answer ID
     * @return pricePerShare Price per share in USDC with 12 decimals (6 USDC + 6 precision)
     * @dev Example: $1.00 = 1e12, $0.50 = 5e11
     */
    function getSharePrice(uint256 answerId) public view returns (uint256 pricePerShare) {
        Answer storage answer = answers[answerId];
        if (answer.totalShares == 0) {
            return 1e12; // Base price: $1.00 (with 12 decimals)
        }
        // Account for SHARES_DECIMALS: totalShares is 100x the display value
        // price = (poolValue * 1e6 * SHARES_DECIMALS) / totalShares
        return (uint256(answer.poolValue) * 1e6 * SHARES_DECIMALS) / answer.totalShares;
    }

    /**
     * @notice Get the leading answer for a question
     * @param questionId The question ID
     * @return leadingAnswerId The answer with highest market cap
     * @return marketCap The market cap of the leading answer
     */
    function getLeadingAnswer(uint256 questionId) public view returns (uint256 leadingAnswerId, uint256 marketCap) {
        if (questions[questionId].id == 0) revert QuestionNotFound();

        uint256[] storage answerIds = questionAnswerIds[questionId];
        for (uint256 i = 0; i < answerIds.length; i++) {
            Answer storage answer = answers[answerIds[i]];
            if (answer.isActive && answer.poolValue > marketCap) {
                marketCap = answer.poolValue;
                leadingAnswerId = answerIds[i];
            }
        }
    }

    /**
     * @notice Get all answers for a question
     * @param questionId The question ID
     * @return Array of answer IDs
     */
    function getQuestionAnswers(uint256 questionId) external view returns (uint256[] memory) {
        return questionAnswerIds[questionId];
    }

    /**
     * @notice Get answer count for a question
     * @param questionId The question ID
     * @return Number of answers
     */
    function getAnswerCount(uint256 questionId) external view returns (uint256) {
        return questionAnswerIds[questionId].length;
    }

    /**
     * @notice Get user position with P&L
     * @param answerId The answer ID
     * @param user The user address
     * @return shares Number of shares owned (in internal units, divide by 100 for display)
     * @return currentValue Current value in USDC (6 decimals)
     * @return costBasis Original cost in USDC (6 decimals)
     * @return profitLoss Profit/loss in USDC (can be negative)
     */
    function getUserPosition(uint256 answerId, address user) public view returns (
        uint256 shares,
        uint256 currentValue,
        uint256 costBasis,
        int256 profitLoss
    ) {
        Position storage pos = positions[answerId][user];
        shares = pos.shares;  // Internal units (divide by SHARES_DECIMALS for display)
        costBasis = pos.costBasis;
        if (shares > 0) {
            // shares are in internal units (100x), price is 1e12
            // currentValue = (shares * price) / (1e12 * SHARES_DECIMALS / 1e6)
            // = (shares * price) / (1e6 * SHARES_DECIMALS)
            currentValue = (shares * getSharePrice(answerId)) / (1e6 * SHARES_DECIMALS);
            profitLoss = int256(currentValue) - int256(costBasis);
        }
    }

    /**
     * @notice Get answer details
     * @param answerId The answer ID
     */
    function getAnswer(uint256 answerId) external view returns (
        uint256 id,
        uint256 questionId,
        string memory text,
        string memory description,
        string memory link,
        address proposer,
        uint256 totalShares,
        uint256 poolValue,
        uint256 pricePerShare,
        uint48 createdAt,
        bool isActive,
        bool isFlagged
    ) {
        Answer storage answer = answers[answerId];
        return (
            answer.id,
            answer.questionId,
            answer.text,
            answer.description,
            answer.link,
            answer.proposer,
            answer.totalShares,
            answer.poolValue,
            getSharePrice(answerId),
            answer.createdAt,
            answer.isActive,
            answer.isFlagged
        );
    }

    /**
     * @notice Get question details
     * @param questionId The question ID
     */
    function getQuestion(uint256 questionId) external view returns (
        uint256 id,
        string memory text,
        string memory category,
        address creator,
        uint48 createdAt,
        bool isActive,
        uint256 totalVolume,
        uint256 answerCount
    ) {
        Question storage question = questions[questionId];
        return (
            question.id,
            question.text,
            question.category,
            question.creator,
            question.createdAt,
            question.isActive,
            question.totalVolume,
            questionAnswerIds[questionId].length
        );
    }

    /**
     * @notice Get holder count for an answer
     * @param answerId The answer ID
     * @return Number of unique holders (may include zero-balance)
     */
    function getHolderCount(uint256 answerId) external view returns (uint256) {
        return answerHolders[answerId].length;
    }

    /**
     * @notice Get accumulated fees for a user (claimable amount)
     * @param user The user address
     * @return amount Claimable USDC amount
     */
    function getAccumulatedFees(address user) external view returns (uint96 amount) {
        return accumulatedFees[user];
    }

    /**
     * @notice Get total accumulated fees across all users
     * @return Total claimable USDC
     */
    function getTotalAccumulatedFees() external view returns (uint96) {
        return totalAccumulatedFees;
    }

    // === FEE CLAIMING ===

    /**
     * @notice Claim accumulated creator fees
     * @dev Question creators earn fees from trading on their questions
     */
    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint96 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        // Reset fees before transfer (checks-effects-interactions)
        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        // Transfer fees to user
        usdcToken.safeTransfer(msg.sender, amount);

        emit FeesClaimed(msg.sender, amount);
    }

    // === INTERNAL FUNCTIONS ===

    /**
     * @notice Calculate shares for a given USDC amount (2 decimal places)
     * @dev Returns shares in internal units (1 share = 100 units)
     * @dev Example: $4.90 at $1/share → 490 internal units (4.90 shares)
     */
    function _calculateSharesForAmount(
        uint256 poolValue,
        uint256 totalShares,
        uint256 usdcAmount
    ) internal pure returns (uint256) {
        if (totalShares == 0) {
            // First purchase: 1.00 share per $1 (with 2 decimals: 100 units per $1)
            return (usdcAmount * SHARES_DECIMALS) / 1e6;
        }
        // shares = (usdcAmount * totalShares) / poolValue
        // totalShares already in decimal units, so result is also in decimal units
        return (usdcAmount * totalShares) / poolValue;
    }

    /**
     * @notice Calculate USDC return for selling shares
     */
    function _calculateReturnForShares(
        uint256 poolValue,
        uint256 totalShares,
        uint256 shareAmount
    ) internal pure returns (uint256) {
        // return = (shareAmount * poolValue) / totalShares
        return (shareAmount * poolValue) / totalShares;
    }

    /**
     * @notice Convert string to lowercase for duplicate detection
     * @dev Gas optimized - operates in place on memory
     */
    function _toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        for (uint256 i = 0; i < bStr.length; i++) {
            uint8 char = uint8(bStr[i]);
            if (char >= 65 && char <= 90) {
                bStr[i] = bytes1(char + 32);
            }
        }
        return str;
    }

    // === MODERATOR FUNCTIONS ===

    /**
     * @notice Deactivate an answer (prevents new buys, allows sells)
     * @param answerId The answer to deactivate
     */
    function deactivateAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isActive = false;
        emit AnswerDeactivated(answerId, msg.sender);
    }

    /**
     * @notice Reactivate a previously deactivated answer
     * @param answerId The answer to reactivate
     */
    function reactivateAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isActive = true;
        emit AnswerReactivated(answerId, msg.sender);
    }

    /**
     * @notice Flag an answer (visible warning, still tradeable)
     * @param answerId The answer to flag
     * @param reason Reason for flagging
     */
    function flagAnswer(uint256 answerId, string calldata reason) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isFlagged = true;
        emit AnswerFlagged(answerId, msg.sender, reason);
    }

    /**
     * @notice Unflag an answer
     * @param answerId The answer to unflag
     */
    function unflagAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isFlagged = false;
    }

    /**
     * @notice Deactivate a question (prevents new answers)
     * @param questionId The question to deactivate
     */
    function deactivateQuestion(uint256 questionId) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = false;
        emit QuestionDeactivated(questionId, msg.sender);
    }

    /**
     * @notice Reactivate a previously deactivated question
     * @param questionId The question to reactivate
     */
    function reactivateQuestion(uint256 questionId) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = true;
        emit QuestionReactivated(questionId, msg.sender);
    }

    // === ADMIN FUNCTIONS ===

    /**
     * @notice Pause the contract (emergency stop)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Emergency withdraw tokens (only when paused)
     * @param token Token address to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        if (!paused()) revert NotPaused();
        if (to == address(0)) revert InvalidAddress();

        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(token, to, amount);
    }

    /**
     * @notice Update platform and creator fees
     * @param _platformFeeBps Platform fee in basis points (goes to treasury)
     * @param _creatorFeeBps Creator fee in basis points (goes to question creator)
     */
    function setFees(
        uint16 _platformFeeBps,
        uint16 _creatorFeeBps
    ) external onlyRole(ADMIN_ROLE) {
        if (_platformFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_creatorFeeBps > MAX_FEE_BPS) revert FeeTooHigh();

        emit FeesUpdated(_platformFeeBps, _creatorFeeBps);
        platformFeeBps = _platformFeeBps;
        creatorFeeBps = _creatorFeeBps;
    }

    /**
     * @notice Update question creation fee
     * @param _fee New fee amount
     */
    function setQuestionCreationFee(uint96 _fee) external onlyRole(ADMIN_ROLE) {
        if (_fee > MAX_QUESTION_FEE) revert FeeTooHigh();

        emit QuestionCreationFeeUpdated(questionCreationFee, _fee);
        questionCreationFee = _fee;
    }

    /**
     * @notice Update answer proposal stake
     * @param _stake New stake amount
     */
    function setAnswerProposalStake(uint96 _stake) external onlyRole(ADMIN_ROLE) {
        if (_stake < 1e6) revert StakeTooLow();
        if (_stake > MAX_PROPOSAL_STAKE) revert StakeTooHigh();

        emit AnswerProposalStakeUpdated(answerProposalStake, _stake);
        answerProposalStake = _stake;
    }

    /**
     * @notice Update max answers per question
     * @param _max New maximum
     */
    function setMaxAnswersPerQuestion(uint8 _max) external onlyRole(ADMIN_ROLE) {
        if (_max < 2 || _max > 50) revert InvalidMaxAnswers();

        emit MaxAnswersUpdated(maxAnswersPerQuestion, _max);
        maxAnswersPerQuestion = _max;
    }

    /**
     * @notice Update treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyRole(TREASURY_ROLE) {
        if (_treasury == address(0)) revert InvalidAddress();

        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    /**
     * @notice Transfer all admin roles to a new address
     * @dev Revokes all roles from caller and grants to new admin
     * @param newAdmin New admin address
     */
    function transferFullAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newAdmin == address(0)) revert InvalidAddress();

        // Grant roles to new admin
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _grantRole(ADMIN_ROLE, newAdmin);
        _grantRole(MODERATOR_ROLE, newAdmin);
        _grantRole(TREASURY_ROLE, newAdmin);

        // Revoke roles from caller (order matters for DEFAULT_ADMIN)
        _revokeRole(TREASURY_ROLE, msg.sender);
        _revokeRole(MODERATOR_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // === UUPS UPGRADE ===

    /**
     * @notice Authorize upgrade (UUPS pattern)
     * @dev Only ADMIN_ROLE can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    /**
     * @notice Get implementation version
     * @return Version string
     */
    function version() external pure returns (string memory) {
        return "2.0.0";  // V2: Added 2 decimal places for shares (Polymarket-style)
    }

    /**
     * @notice Get shares decimals constant
     * @return Number of decimal places for shares (2 = 100)
     */
    function getSharesDecimals() external pure returns (uint256) {
        return SHARES_DECIMALS;
    }
}
