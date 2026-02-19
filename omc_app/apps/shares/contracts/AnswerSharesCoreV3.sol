// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AnswerSharesCoreV3
 * @dev Pump.fun-style bonding curve for opinion trading
 * @notice UUPS Upgradeable with exponential early pricing
 *
 * V3 Features:
 * - Exponential early pricing (10x at $0 pool → 1x at $50 pool)
 * - Proposer gets 10x shares (50 shares for $5 stake)
 * - King of the Hill: #1 answer holders earn 0.5% of all trading
 * - Dynamic answer limits (base 7, +1 per $50 volume, max 25)
 * - Graduation events at $500 market cap
 * - Leader change events for flip tracking
 *
 * Fee Structure (3% total):
 * - 2.0% → Platform treasury
 * - 0.5% → Question creator (claimable)
 * - 0.5% → King of the Hill holders (claimable)
 */
contract AnswerSharesCoreV3 is
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
        string category;
        address creator;
        address owner;
        uint48 createdAt;
        bool isActive;
        uint256 totalVolume;
        uint96 salePrice;
        uint256 leadingAnswerId;  // V3: Track current #1 for king fees
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string text;
        string description;
        string link;
        address proposer;
        uint128 totalShares;
        uint128 poolValue;
        uint48 createdAt;
        bool isActive;
        bool isFlagged;
        bool hasGraduated;  // V3: Track graduation status
    }

    struct Position {
        uint128 shares;
        uint128 costBasis;
        uint96 kingFeesClaimed;  // V3: Track claimed king fees per position
    }

    // === STATE VARIABLES ===

    IERC20 public usdcToken;
    address public treasury;

    uint256 public nextQuestionId;
    uint256 public nextAnswerId;

    // Core storage
    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(uint256 => uint256[]) public questionAnswerIds;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(uint256 => address[]) internal answerHolders;
    mapping(uint256 => mapping(address => bool)) internal isHolder;

    // Anti-spam: duplicate detection
    mapping(uint256 => mapping(bytes32 => bool)) public answerTextExists;

    // === FEE ACCUMULATION ===
    mapping(address => uint96) public accumulatedFees;      // Question creator fees
    uint96 public totalAccumulatedFees;

    // === V3: KING OF THE HILL FEES ===
    mapping(uint256 => uint96) public kingFeePool;          // questionId => accumulated king fees
    mapping(uint256 => uint96) public kingFeesPerShare;     // answerId => cumulative fees per share (scaled by 1e12)

    // === CONFIGURATION ===

    uint96 public questionCreationFee;
    uint96 public answerProposalStake;
    uint16 public platformFeeBps;       // 2% = 200 bps
    uint16 public creatorFeeBps;        // 0.5% = 50 bps
    uint16 public kingFeeBps;           // V3: 0.5% = 50 bps

    // V3: Dynamic answer limits (admin configurable)
    uint8 public baseAnswerLimit;       // Default: 7
    uint256 public volumePerSlot;       // Default: $50 = 50e6
    uint8 public maxAnswerLimit;        // Default: 25

    // V3: Exponential curve parameters
    uint256 public bootstrapThreshold;  // Default: $50 = 50e6
    uint256 public maxMultiplier;       // Default: 10

    // V3: King flip hysteresis (anti-flip-flop)
    uint16 public kingFlipThresholdBps; // Default: 500 = 5% (must exceed by 5% to flip)

    // V3: Graduation threshold (configurable)
    uint256 public graduationThreshold; // Default: $500 = 500e6

    // === CONSTANTS ===

    uint256 public constant SHARES_DECIMALS = 100;
    uint256 public constant MIN_POOL_RESERVE = 1e6;
    uint256 public constant MIN_SHARES_RESERVE = 1;
    uint256 public constant MAX_FEE_BPS = 1000;
    uint256 public constant MAX_QUESTION_FEE = 100e6;
    uint256 public constant MAX_PROPOSAL_STAKE = 1000e6;
    uint128 public constant MAX_POOL_VALUE = type(uint128).max / 2;
    uint128 public constant MAX_TOTAL_SHARES = type(uint128).max / 2;
    uint256 public constant KING_FEE_PRECISION = 1e12;      // V3: Precision for king fee calculations
    uint16 public constant MAX_FLIP_THRESHOLD_BPS = 2000;   // V3: Max 20% flip threshold

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
        uint256 newPrice,
        uint256 newPoolValue,
        uint256 newTotalShares
    );

    event SharesSold(
        uint256 indexed answerId,
        address indexed seller,
        uint256 shares,
        uint256 returnAmount,
        uint256 newPrice
    );

    // V3: New events
    event AnswerGraduated(
        uint256 indexed answerId,
        uint256 indexed questionId,
        uint256 marketCap
    );

    event LeaderChanged(
        uint256 indexed questionId,
        uint256 indexed newLeaderId,
        uint256 indexed oldLeaderId,
        uint256 newLeaderMarketCap
    );

    event KingFeesDistributed(
        uint256 indexed questionId,
        uint256 indexed answerId,
        uint96 amount
    );

    event KingFeesClaimed(
        uint256 indexed answerId,
        address indexed user,
        uint96 amount
    );

    event AnswerDeactivated(uint256 indexed answerId, address indexed moderator);
    event AnswerReactivated(uint256 indexed answerId, address indexed moderator);
    event AnswerFlagged(uint256 indexed answerId, address indexed moderator, string reason);
    event QuestionDeactivated(uint256 indexed questionId, address indexed moderator);
    event QuestionReactivated(uint256 indexed questionId, address indexed moderator);

    // Admin events
    event FeesUpdated(uint16 platformFeeBps, uint16 creatorFeeBps, uint16 kingFeeBps);
    event QuestionCreationFeeUpdated(uint96 oldFee, uint96 newFee);
    event AnswerProposalStakeUpdated(uint96 oldStake, uint96 newStake);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DynamicLimitsUpdated(uint8 baseLimit, uint256 volumePerSlot, uint8 maxLimit);
    event ExponentialParamsUpdated(uint256 bootstrapThreshold, uint256 maxMultiplier);
    event KingFlipThresholdUpdated(uint16 oldBps, uint16 newBps);
    event GraduationThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    // Fee claiming events
    event FeesAccumulated(address indexed recipient, uint96 amount, uint96 newTotal);
    event FeesClaimed(address indexed user, uint96 amount);

    // Question ownership event
    event QuestionOwnershipTransferred(uint256 indexed questionId, address indexed from, address indexed to);

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
    error NotTheQuestionOwner();
    error SelfTransferNotAllowed();
    error InvalidDynamicLimits();
    error InvalidExponentialParams();
    error InvalidFlipThreshold();
    error InvalidGraduationThreshold();

    // === INITIALIZATION ===

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract (called once on deployment)
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
        questionCreationFee = 5e6;          // $5 USDC
        answerProposalStake = 5e6;          // $5 USDC
        platformFeeBps = 200;               // 2% → treasury
        creatorFeeBps = 50;                 // 0.5% → question creator
        kingFeeBps = 50;                    // 0.5% → king of the hill

        // V3: Dynamic answer limits
        baseAnswerLimit = 7;
        volumePerSlot = 50e6;               // +1 slot per $50
        maxAnswerLimit = 25;

        // V3: Exponential curve
        bootstrapThreshold = 50e6;          // $50
        maxMultiplier = 10;                 // 10x at $0

        // V3: King flip hysteresis
        kingFlipThresholdBps = 500;         // 5% threshold to flip #1
        graduationThreshold = 500e6;        // $500 graduation milestone

        nextQuestionId = 1;
        nextAnswerId = 1;
    }

    /**
     * @notice Reinitializer for upgrading from V2 to V3
     */
    function initializeV3() public reinitializer(3) {
        // Set new V3 parameters (keep existing values for backwards compat)
        kingFeeBps = 50;                    // 0.5%
        baseAnswerLimit = 7;
        volumePerSlot = 50e6;
        maxAnswerLimit = 25;
        bootstrapThreshold = 50e6;
        maxMultiplier = 10;

        // V3: King flip hysteresis
        kingFlipThresholdBps = 500;         // 5% threshold to flip #1
        graduationThreshold = 500e6;        // $500 graduation milestone

        // Update fees
        platformFeeBps = 200;               // 2%
        questionCreationFee = 5e6;          // $5 USDC
    }

    // === CORE FUNCTIONS ===

    /**
     * @notice Get dynamic max answers for a question based on volume
     */
    function getMaxAnswersForQuestion(uint256 questionId) public view returns (uint8) {
        uint256 volume = questions[questionId].totalVolume;
        uint8 bonus = uint8(volume / volumePerSlot);
        uint8 total = baseAnswerLimit + bonus;
        return total > maxAnswerLimit ? maxAnswerLimit : total;
    }

    /**
     * @notice Create a new question (without initial answer)
     */
    function createQuestion(
        string calldata text,
        string calldata category
    ) external nonReentrant whenNotPaused returns (uint256 questionId) {
        if (bytes(text).length < 5) revert TextTooShort();
        if (bytes(text).length > 100) revert TextTooLong();
        if (bytes(category).length > 50) revert TextTooLong();

        if (questionCreationFee > 0) {
            usdcToken.safeTransferFrom(msg.sender, treasury, questionCreationFee);
        }

        questionId = nextQuestionId++;
        questions[questionId] = Question({
            id: questionId,
            text: text,
            category: category,
            creator: msg.sender,
            owner: msg.sender,
            createdAt: uint48(block.timestamp),
            isActive: true,
            totalVolume: 0,
            salePrice: 0,
            leadingAnswerId: 0
        });

        emit QuestionCreated(questionId, msg.sender, text, category);
    }

    /**
     * @notice Create a question with an initial answer (recommended)
     * @dev Proposer gets 10x shares due to exponential curve at $0 pool
     */
    function createQuestionWithAnswer(
        string calldata questionText,
        string calldata category,
        string calldata answerText,
        string calldata answerDescription,
        string calldata answerLink
    ) external nonReentrant whenNotPaused returns (uint256 questionId, uint256 answerId) {
        if (bytes(questionText).length < 5) revert TextTooShort();
        if (bytes(questionText).length > 100) revert TextTooLong();
        if (bytes(category).length > 50) revert TextTooLong();
        if (bytes(answerText).length < 1) revert TextTooShort();
        if (bytes(answerText).length > 60) revert TextTooLong();
        if (bytes(answerDescription).length > 280) revert TextTooLong();
        if (bytes(answerLink).length > 200) revert TextTooLong();

        uint256 totalCost = uint256(questionCreationFee) + uint256(answerProposalStake);
        usdcToken.safeTransferFrom(msg.sender, address(this), totalCost);

        if (questionCreationFee > 0) {
            usdcToken.safeTransfer(treasury, questionCreationFee);
        }

        // Create question
        questionId = nextQuestionId++;

        // Create answer first to get answerId for leading
        answerId = nextAnswerId++;

        questions[questionId] = Question({
            id: questionId,
            text: questionText,
            category: category,
            creator: msg.sender,
            owner: msg.sender,
            createdAt: uint48(block.timestamp),
            isActive: true,
            totalVolume: 0,
            salePrice: 0,
            leadingAnswerId: answerId  // First answer is automatically #1
        });

        bytes32 textHash = keccak256(abi.encodePacked(_toLowerCase(answerText)));
        answerTextExists[questionId][textHash] = true;

        // V3: Proposer gets 10x shares (exponential at $0 pool)
        uint128 initialShares = uint128((answerProposalStake * maxMultiplier * SHARES_DECIMALS) / 1e6);

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
            isFlagged: false,
            hasGraduated: false
        });

        questionAnswerIds[questionId].push(answerId);

        positions[answerId][msg.sender] = Position({
            shares: initialShares,
            costBasis: uint128(answerProposalStake),
            kingFeesClaimed: 0
        });

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
     * @dev Proposer gets 10x shares due to exponential curve at $0 pool
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

        // V3: Dynamic answer limit based on volume
        if (questionAnswerIds[questionId].length >= getMaxAnswersForQuestion(questionId)) {
            revert MaxAnswersReached();
        }

        if (bytes(answerText).length < 1) revert TextTooShort();
        if (bytes(answerText).length > 60) revert TextTooLong();
        if (bytes(description).length > 280) revert TextTooLong();
        if (bytes(link).length > 200) revert TextTooLong();

        bytes32 textHash = keccak256(abi.encodePacked(_toLowerCase(answerText)));
        if (answerTextExists[questionId][textHash]) revert DuplicateAnswer();
        answerTextExists[questionId][textHash] = true;

        usdcToken.safeTransferFrom(msg.sender, address(this), answerProposalStake);

        answerId = nextAnswerId++;

        // V3: Proposer gets 10x shares (exponential at $0 pool)
        uint128 initialShares = uint128((answerProposalStake * maxMultiplier * SHARES_DECIMALS) / 1e6);

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
            isFlagged: false,
            hasGraduated: false
        });

        questionAnswerIds[questionId].push(answerId);

        positions[answerId][msg.sender] = Position({
            shares: initialShares,
            costBasis: uint128(answerProposalStake),
            kingFeesClaimed: 0
        });

        answerHolders[answerId].push(msg.sender);
        isHolder[answerId][msg.sender] = true;

        emit AnswerProposed(answerId, questionId, msg.sender, answerText, description, link, initialShares);
    }

    /**
     * @notice Buy shares in an answer with exponential early pricing
     */
    function buyShares(
        uint256 answerId,
        uint256 usdcAmount,
        uint256 minSharesOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 sharesBought) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (usdcAmount == 0) revert ZeroAmount();

        Answer storage answer = answers[answerId];
        if (answer.id == 0) revert AnswerNotFound();
        if (!answer.isActive) revert AnswerNotActive();

        Question storage question = questions[answer.questionId];

        // Calculate fees (3% total: 2% platform, 0.5% creator, 0.5% king)
        uint256 platformFee = (usdcAmount * platformFeeBps) / 10000;
        uint256 creatorFee = (usdcAmount * creatorFeeBps) / 10000;
        uint256 kingFee = (usdcAmount * kingFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee + kingFee;
        uint256 amountAfterFee = usdcAmount - totalFee;

        // V3: Calculate shares with exponential curve
        sharesBought = _calculateSharesForAmount(answer.poolValue, answer.totalShares, amountAfterFee);

        if (sharesBought < minSharesOut) revert SlippageExceeded();

        uint256 newPoolValue = uint256(answer.poolValue) + amountAfterFee;
        uint256 newTotalShares = uint256(answer.totalShares) + sharesBought;
        if (newPoolValue > MAX_POOL_VALUE) revert PoolOverflow();
        if (newTotalShares > MAX_TOTAL_SHARES) revert SharesOverflow();

        // Transfer USDC
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Platform fee to treasury
        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        // Creator fee accumulation
        if (creatorFee > 0) {
            accumulatedFees[question.owner] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(question.owner, uint96(creatorFee), accumulatedFees[question.owner]);
        }

        // V3: King fee distribution to current #1 answer
        if (kingFee > 0 && question.leadingAnswerId > 0) {
            Answer storage leader = answers[question.leadingAnswerId];
            if (leader.totalShares > 0) {
                // Add to per-share accumulator for the leading answer
                kingFeesPerShare[question.leadingAnswerId] += uint96((kingFee * KING_FEE_PRECISION) / leader.totalShares);
                kingFeePool[answer.questionId] += uint96(kingFee);
                emit KingFeesDistributed(answer.questionId, question.leadingAnswerId, uint96(kingFee));
            }
        }

        // Update answer state
        answer.poolValue = uint128(newPoolValue);
        answer.totalShares = uint128(newTotalShares);

        // Update question volume
        question.totalVolume += usdcAmount;

        // Update user position
        Position storage pos = positions[answerId][msg.sender];

        // V3: Claim any pending king fees before updating shares
        _claimKingFeesInternal(answerId, msg.sender);

        pos.shares += uint128(sharesBought);
        pos.costBasis += uint128(usdcAmount);

        // Track new holder
        if (!isHolder[answerId][msg.sender]) {
            answerHolders[answerId].push(msg.sender);
            isHolder[answerId][msg.sender] = true;
        }

        // V3: Check for graduation
        if (!answer.hasGraduated && answer.poolValue >= graduationThreshold) {
            answer.hasGraduated = true;
            emit AnswerGraduated(answerId, answer.questionId, answer.poolValue);
        }

        // V3: Check for leader change with hysteresis
        // Must exceed current leader by kingFlipThresholdBps (5%) to become new king
        uint256 oldLeaderId = question.leadingAnswerId;
        if (oldLeaderId == 0) {
            // First answer with pool value becomes leader
            question.leadingAnswerId = answerId;
            emit LeaderChanged(answer.questionId, answerId, 0, answer.poolValue);
        } else if (oldLeaderId != answerId) {
            uint256 leaderPool = answers[oldLeaderId].poolValue;
            // Threshold: must exceed leader by X%
            uint256 threshold = leaderPool + (leaderPool * kingFlipThresholdBps) / 10000;
            if (answer.poolValue > threshold) {
                question.leadingAnswerId = answerId;
                emit LeaderChanged(answer.questionId, answerId, oldLeaderId, answer.poolValue);
            }
        }

        uint256 newPrice = getSharePrice(answerId);
        emit SharesBought(answerId, msg.sender, sharesBought, usdcAmount, newPrice, newPoolValue, newTotalShares);
    }

    /**
     * @notice Sell shares in an answer
     */
    function sellShares(
        uint256 answerId,
        uint256 shareAmount,
        uint256 minUsdcOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 usdcReturned) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (shareAmount == 0) revert ZeroAmount();

        Answer storage answer = answers[answerId];
        if (answer.id == 0) revert AnswerNotFound();

        Position storage pos = positions[answerId][msg.sender];
        if (pos.shares < shareAmount) revert InsufficientShares();

        if (answer.totalShares - shareAmount < MIN_SHARES_RESERVE) revert SharesReserveViolation();

        // V3: Claim any pending king fees before selling
        _claimKingFeesInternal(answerId, msg.sender);

        uint256 grossReturn = _calculateReturnForShares(answer.poolValue, answer.totalShares, shareAmount);

        if (answer.poolValue - grossReturn < MIN_POOL_RESERVE) revert PoolReserveViolation();

        // Calculate fees (3% total)
        Question storage question = questions[answer.questionId];
        uint256 platformFee = (grossReturn * platformFeeBps) / 10000;
        uint256 creatorFee = (grossReturn * creatorFeeBps) / 10000;
        uint256 kingFee = (grossReturn * kingFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee + kingFee;
        usdcReturned = grossReturn - totalFee;

        if (usdcReturned < minUsdcOut) revert SlippageExceeded();

        // Update answer state
        answer.poolValue -= uint128(grossReturn);
        answer.totalShares -= uint128(shareAmount);

        // Update question volume
        question.totalVolume += grossReturn;

        // Update user position
        uint256 costBasisReduction = (uint256(pos.costBasis) * shareAmount) / pos.shares;
        pos.shares -= uint128(shareAmount);
        pos.costBasis -= uint128(costBasisReduction);

        // Transfer USDC to seller
        usdcToken.safeTransfer(msg.sender, usdcReturned);

        // Platform fee to treasury
        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        // Creator fee accumulation
        if (creatorFee > 0) {
            accumulatedFees[question.owner] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(question.owner, uint96(creatorFee), accumulatedFees[question.owner]);
        }

        // V3: King fee distribution
        if (kingFee > 0 && question.leadingAnswerId > 0) {
            Answer storage leader = answers[question.leadingAnswerId];
            if (leader.totalShares > 0) {
                kingFeesPerShare[question.leadingAnswerId] += uint96((kingFee * KING_FEE_PRECISION) / leader.totalShares);
                kingFeePool[answer.questionId] += uint96(kingFee);
                emit KingFeesDistributed(answer.questionId, question.leadingAnswerId, uint96(kingFee));
            }
        }

        // V3: Update leader if needed
        _updateLeaderAfterSell(answer.questionId);

        uint256 newPrice = getSharePrice(answerId);
        emit SharesSold(answerId, msg.sender, shareAmount, usdcReturned, newPrice);
    }

    // === V3: KING FEE CLAIMING ===

    /**
     * @notice Claim king fees for a specific answer position
     */
    function claimKingFees(uint256 answerId) external nonReentrant whenNotPaused {
        _claimKingFeesInternal(answerId, msg.sender);
    }

    /**
     * @notice Get pending king fees for a user's position
     */
    function getPendingKingFees(uint256 answerId, address user) public view returns (uint96) {
        Position storage pos = positions[answerId][user];
        if (pos.shares == 0) return 0;

        uint96 currentFeesPerShare = kingFeesPerShare[answerId];
        uint96 claimedFeesPerShare = pos.kingFeesClaimed;

        if (currentFeesPerShare <= claimedFeesPerShare) return 0;

        uint96 pendingPerShare = currentFeesPerShare - claimedFeesPerShare;
        return uint96((uint256(pos.shares) * pendingPerShare) / KING_FEE_PRECISION);
    }

    function _claimKingFeesInternal(uint256 answerId, address user) internal {
        uint96 pending = getPendingKingFees(answerId, user);
        if (pending == 0) return;

        Position storage pos = positions[answerId][user];
        pos.kingFeesClaimed = kingFeesPerShare[answerId];

        // Safely decrease king fee pool (handle rounding)
        Answer storage answer = answers[answerId];
        uint96 pool = kingFeePool[answer.questionId];
        kingFeePool[answer.questionId] = pool >= pending ? pool - pending : 0;

        usdcToken.safeTransfer(user, pending);
        emit KingFeesClaimed(answerId, user, pending);
    }

    /**
     * @notice Update leader after a sell, applying hysteresis
     */
    function _updateLeaderAfterSell(uint256 questionId) internal {
        Question storage q = questions[questionId];
        uint256[] storage aids = questionAnswerIds[questionId];
        uint256 oldLead = q.leadingAnswerId;
        uint256 oldPool = oldLead > 0 && answers[oldLead].isActive ? answers[oldLead].poolValue : 0;
        uint256 threshold = oldPool + (oldPool * kingFlipThresholdBps) / 10000;

        uint256 best = 0;
        uint256 bestPool = 0;
        for (uint256 i = 0; i < aids.length; i++) {
            Answer storage a = answers[aids[i]];
            if (a.isActive && a.poolValue > bestPool) {
                bestPool = a.poolValue;
                best = aids[i];
            }
        }

        // Flip only if: no leader, leader inactive, or challenger exceeds threshold
        if (best != oldLead && (oldPool == 0 || bestPool > threshold)) {
            q.leadingAnswerId = best;
            emit LeaderChanged(questionId, best, oldLead, bestPool);
        }
    }

    // === V3: EXPONENTIAL PRICING ===

    /**
     * @notice Calculate shares for a given USDC amount with exponential early pricing
     * @dev First $50 in pool gets 10x → 1x multiplier
     */
    function _calculateSharesForAmount(
        uint256 poolValue,
        uint256 totalShares,
        uint256 usdcAmount
    ) internal view returns (uint256 sharesOut) {
        // EXPONENTIAL PHASE: Pool < bootstrapThreshold ($50)
        if (poolValue < bootstrapThreshold) {
            // Multiplier: maxMultiplier at $0, 1 at threshold
            // multiplier = (threshold - pool) * (maxMult - 1) / threshold + 1
            uint256 remaining = bootstrapThreshold - poolValue;
            uint256 multiplier = (remaining * (maxMultiplier - 1)) / bootstrapThreshold + 1;

            // How much of this buy is in exponential phase
            uint256 exponentialAmount = usdcAmount;
            if (poolValue + usdcAmount > bootstrapThreshold) {
                exponentialAmount = bootstrapThreshold - poolValue;
            }

            // Exponential shares (with multiplier)
            sharesOut = (exponentialAmount * multiplier * SHARES_DECIMALS) / 1e6;

            // Linear portion (if buy crosses threshold)
            uint256 linearAmount = usdcAmount - exponentialAmount;
            if (linearAmount > 0 && totalShares + sharesOut > 0) {
                uint256 newPool = poolValue + exponentialAmount;
                uint256 newShares = totalShares + sharesOut;
                sharesOut += (linearAmount * newShares) / newPool;
            }
        }
        // LINEAR PHASE: Pool >= threshold
        else {
            if (totalShares == 0) {
                // Edge case: shouldn't happen, but handle gracefully
                sharesOut = (usdcAmount * SHARES_DECIMALS) / 1e6;
            } else {
                sharesOut = (usdcAmount * totalShares) / poolValue;
            }
        }
    }

    function _calculateReturnForShares(
        uint256 poolValue,
        uint256 totalShares,
        uint256 shareAmount
    ) internal pure returns (uint256) {
        return (shareAmount * poolValue) / totalShares;
    }

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

    // === VIEW FUNCTIONS ===

    function getSharePrice(uint256 answerId) public view returns (uint256 pricePerShare) {
        Answer storage answer = answers[answerId];
        if (answer.totalShares == 0) {
            return 1e12;
        }
        return (uint256(answer.poolValue) * 1e6 * SHARES_DECIMALS) / answer.totalShares;
    }

    function getLeadingAnswer(uint256 questionId) public view returns (uint256 leadingAnswerId, uint256 marketCap) {
        if (questions[questionId].id == 0) revert QuestionNotFound();

        leadingAnswerId = questions[questionId].leadingAnswerId;
        if (leadingAnswerId > 0) {
            marketCap = answers[leadingAnswerId].poolValue;
        }
    }

    function getQuestionAnswers(uint256 questionId) external view returns (uint256[] memory) {
        return questionAnswerIds[questionId];
    }

    function getAnswerCount(uint256 questionId) external view returns (uint256) {
        return questionAnswerIds[questionId].length;
    }

    function getUserPosition(uint256 answerId, address user) public view returns (
        uint256 shares,
        uint256 currentValue,
        uint256 costBasis,
        int256 profitLoss,
        uint96 pendingKingFees
    ) {
        Position storage pos = positions[answerId][user];
        shares = pos.shares;
        costBasis = pos.costBasis;
        pendingKingFees = getPendingKingFees(answerId, user);

        if (shares > 0) {
            currentValue = (shares * getSharePrice(answerId)) / (1e6 * SHARES_DECIMALS);
            profitLoss = int256(currentValue) - int256(costBasis);
        }
    }

    function getAnswer(uint256 answerId) external view returns (
        uint256 id, uint256 questionId, string memory text, string memory description,
        string memory link, address proposer, uint256 totalShares, uint256 poolValue,
        uint256 pricePerShare, uint48 createdAt, bool isActive, bool isFlagged, bool hasGraduated
    ) {
        Answer storage a = answers[answerId];
        return (a.id, a.questionId, a.text, a.description, a.link, a.proposer,
            a.totalShares, a.poolValue, getSharePrice(answerId), a.createdAt, a.isActive, a.isFlagged, a.hasGraduated);
    }

    function getQuestion(uint256 questionId) external view returns (
        uint256 id, string memory text, string memory category, address creator, address owner,
        uint48 createdAt, bool isActive, uint256 totalVolume, uint256 answerCount, uint96 salePrice, uint256 leadingAnswerId
    ) {
        Question storage q = questions[questionId];
        return (q.id, q.text, q.category, q.creator, q.owner, q.createdAt, q.isActive,
            q.totalVolume, questionAnswerIds[questionId].length, q.salePrice, q.leadingAnswerId);
    }

    function getHolderCount(uint256 answerId) external view returns (uint256) {
        return answerHolders[answerId].length;
    }

    function getAccumulatedFees(address user) external view returns (uint96 amount) {
        return accumulatedFees[user];
    }

    function getTotalAccumulatedFees() external view returns (uint96) {
        return totalAccumulatedFees;
    }

    // === FEE CLAIMING ===

    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint96 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        usdcToken.safeTransfer(msg.sender, amount);
        emit FeesClaimed(msg.sender, amount);
    }

    // === QUESTION OWNERSHIP ===

    function transferQuestionOwnership(uint256 questionId, address newOwner) external nonReentrant whenNotPaused {
        if (newOwner == address(0)) revert InvalidAddress();

        Question storage question = questions[questionId];
        if (question.id == 0) revert QuestionNotFound();
        if (question.owner != msg.sender) revert NotTheQuestionOwner();
        if (newOwner == msg.sender) revert SelfTransferNotAllowed();

        address previousOwner = question.owner;
        question.owner = newOwner;
        question.salePrice = 0;

        emit QuestionOwnershipTransferred(questionId, previousOwner, newOwner);
    }

    // === MODERATOR FUNCTIONS ===

    function deactivateAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isActive = false;
        emit AnswerDeactivated(answerId, msg.sender);
    }

    function reactivateAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isActive = true;
        emit AnswerReactivated(answerId, msg.sender);
    }

    function flagAnswer(uint256 answerId, string calldata reason) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isFlagged = true;
        emit AnswerFlagged(answerId, msg.sender, reason);
    }

    function unflagAnswer(uint256 answerId) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isFlagged = false;
    }

    function deactivateQuestion(uint256 questionId) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = false;
        emit QuestionDeactivated(questionId, msg.sender);
    }

    function reactivateQuestion(uint256 questionId) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = true;
        emit QuestionReactivated(questionId, msg.sender);
    }

    // === ADMIN FUNCTIONS ===

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

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

    function setFees(
        uint16 _platformFeeBps,
        uint16 _creatorFeeBps,
        uint16 _kingFeeBps
    ) external onlyRole(ADMIN_ROLE) {
        if (_platformFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_creatorFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_kingFeeBps > MAX_FEE_BPS) revert FeeTooHigh();

        emit FeesUpdated(_platformFeeBps, _creatorFeeBps, _kingFeeBps);
        platformFeeBps = _platformFeeBps;
        creatorFeeBps = _creatorFeeBps;
        kingFeeBps = _kingFeeBps;
    }

    function setQuestionCreationFee(uint96 _fee) external onlyRole(ADMIN_ROLE) {
        if (_fee > MAX_QUESTION_FEE) revert FeeTooHigh();

        emit QuestionCreationFeeUpdated(questionCreationFee, _fee);
        questionCreationFee = _fee;
    }

    function setAnswerProposalStake(uint96 _stake) external onlyRole(ADMIN_ROLE) {
        if (_stake < 1e6) revert StakeTooLow();
        if (_stake > MAX_PROPOSAL_STAKE) revert StakeTooHigh();

        emit AnswerProposalStakeUpdated(answerProposalStake, _stake);
        answerProposalStake = _stake;
    }

    /**
     * @notice Update dynamic answer limit parameters
     */
    function setDynamicLimits(
        uint8 _baseLimit,
        uint256 _volumePerSlot,
        uint8 _maxLimit
    ) external onlyRole(ADMIN_ROLE) {
        if (_baseLimit < 1 || _baseLimit > _maxLimit) revert InvalidDynamicLimits();
        if (_maxLimit > 100) revert InvalidDynamicLimits();
        if (_volumePerSlot == 0) revert InvalidDynamicLimits();

        emit DynamicLimitsUpdated(_baseLimit, _volumePerSlot, _maxLimit);
        baseAnswerLimit = _baseLimit;
        volumePerSlot = _volumePerSlot;
        maxAnswerLimit = _maxLimit;
    }

    /**
     * @notice Update exponential curve parameters
     */
    function setExponentialParams(
        uint256 _bootstrapThreshold,
        uint256 _maxMultiplier
    ) external onlyRole(ADMIN_ROLE) {
        if (_bootstrapThreshold == 0) revert InvalidExponentialParams();
        if (_maxMultiplier < 1 || _maxMultiplier > 100) revert InvalidExponentialParams();

        emit ExponentialParamsUpdated(_bootstrapThreshold, _maxMultiplier);
        bootstrapThreshold = _bootstrapThreshold;
        maxMultiplier = _maxMultiplier;
    }

    /**
     * @notice Update king flip threshold (hysteresis)
     * @param _bps Basis points (500 = 5%)
     */
    function setKingFlipThreshold(uint16 _bps) external onlyRole(ADMIN_ROLE) {
        if (_bps > MAX_FLIP_THRESHOLD_BPS) revert InvalidFlipThreshold();

        emit KingFlipThresholdUpdated(kingFlipThresholdBps, _bps);
        kingFlipThresholdBps = _bps;
    }

    /**
     * @notice Update graduation threshold
     * @param _threshold Graduation market cap in USDC (6 decimals)
     */
    function setGraduationThreshold(uint256 _threshold) external onlyRole(ADMIN_ROLE) {
        if (_threshold == 0) revert InvalidGraduationThreshold();

        emit GraduationThresholdUpdated(graduationThreshold, _threshold);
        graduationThreshold = _threshold;
    }

    function setTreasury(address _treasury) external onlyRole(TREASURY_ROLE) {
        if (_treasury == address(0)) revert InvalidAddress();

        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function transferFullAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newAdmin == address(0)) revert InvalidAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _grantRole(ADMIN_ROLE, newAdmin);
        _grantRole(MODERATOR_ROLE, newAdmin);
        _grantRole(TREASURY_ROLE, newAdmin);

        _revokeRole(TREASURY_ROLE, msg.sender);
        _revokeRole(MODERATOR_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // === UUPS UPGRADE ===

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    function version() external pure returns (string memory) {
        return "3.0.0";  // V3: Pump.fun style with exponential curve + king fees
    }

    function getSharesDecimals() external pure returns (uint256) {
        return SHARES_DECIMALS;
    }
}
