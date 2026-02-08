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
 * @title AnswerSharesCoreV2
 * @dev Core trading contract for Answer Shares model (Bonding Curve)
 * @notice V2 adds enhanced events for frontend analytics + question marketplace
 *
 * NEW IN V2:
 * - Enhanced trade events with fee breakdown
 * - Leader change events for real-time updates
 * - Question marketplace (list/buy/transfer questions)
 * - Category support for questions
 * - Price milestone events for gamification
 * - Holder tracking events
 */
contract AnswerSharesCoreV2 is
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
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant EXTENSION_CONTRACT_ROLE = keccak256("EXTENSION_CONTRACT_ROLE");
    bytes32 public constant ADMIN_CONTRACT_ROLE = keccak256("ADMIN_CONTRACT_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // === STRUCTS ===

    struct Question {
        uint256 id;
        string text;
        string description;
        address creator;          // Current owner (receives creator fees)
        address originalCreator;  // Original creator (never changes)
        uint48 createdAt;
        bool isActive;
        uint256 totalVolume;
        string[] categories;      // V2: Category tags
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string text;
        address proposer;
        uint128 totalShares;
        uint128 poolValue;
        uint48 createdAt;
        bool isActive;
        bool isFlagged;
        uint256 tradeCount;       // V2: Number of trades
        uint256 allTimeHigh;      // V2: Highest price ever reached
    }

    struct Position {
        uint128 shares;
        uint128 costBasis;
    }

    // V2: Question marketplace listing
    struct QuestionListing {
        uint256 price;            // 0 = not listed
        uint48 listedAt;
    }

    // === STATE VARIABLES ===

    IERC20 public usdcToken;
    address public treasury;

    uint256 public nextQuestionId;
    uint256 public nextAnswerId;

    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(uint256 => uint256[]) public questionAnswerIds;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(uint256 => address[]) internal answerHolders;
    mapping(uint256 => mapping(address => bool)) internal isHolder;
    mapping(uint256 => mapping(bytes32 => bool)) public answerTextExists;

    // Fee accumulation
    mapping(address => uint96) public accumulatedFees;
    uint96 public totalAccumulatedFees;

    // V2: Question marketplace
    mapping(uint256 => QuestionListing) public questionListings;

    // V2: Leading answer cache (for event emission)
    mapping(uint256 => uint256) public currentLeader;  // questionId => answerId

    // V2: Global stats
    uint256 public totalQuestions;
    uint256 public totalAnswers;
    uint256 public totalTrades;
    uint256 public totalVolumeAllTime;

    // V2: Valid categories
    mapping(string => bool) public validCategories;
    string[] public categoryList;

    // === CONFIGURATION ===

    uint96 public questionCreationFee;
    uint96 public answerProposalStake;
    uint16 public platformFeeBps;
    uint16 public creatorFeeBps;
    uint8 public maxAnswersPerQuestion;
    uint8 public maxCategoriesPerQuestion;  // V2

    // === CONSTANTS ===

    uint256 public constant MIN_POOL_RESERVE = 1e6;
    uint256 public constant MIN_SHARES_RESERVE = 1;
    uint256 public constant MAX_FEE_BPS = 1000;
    uint256 public constant MAX_QUESTION_FEE = 100e6;
    uint256 public constant MAX_PROPOSAL_STAKE = 1000e6;
    uint128 public constant MAX_POOL_VALUE = type(uint128).max / 2;
    uint128 public constant MAX_TOTAL_SHARES = type(uint128).max / 2;

    // V2: Price milestones for events (in USDC, 6 decimals)
    uint256 public constant MILESTONE_10 = 10e6;    // $10
    uint256 public constant MILESTONE_100 = 100e6;  // $100
    uint256 public constant MILESTONE_1K = 1000e6;  // $1,000
    uint256 public constant MILESTONE_10K = 10000e6; // $10,000

    // ============================================================
    //                         EVENTS
    // ============================================================

    // === CORE TRADING EVENTS ===

    /// @notice Emitted when a new question is created
    event QuestionCreated(
        uint256 indexed questionId,
        address indexed creator,
        string text,
        string description,
        string[] categories,
        uint256 creationFee
    );

    /// @notice Emitted when a new answer is proposed
    event AnswerProposed(
        uint256 indexed answerId,
        uint256 indexed questionId,
        address indexed proposer,
        string text,
        uint256 initialShares,
        uint256 initialPrice,
        uint256 stake
    );

    /// @notice Emitted when shares are bought (enhanced with fee breakdown)
    event SharesBought(
        uint256 indexed answerId,
        address indexed buyer,
        uint256 shares,
        uint256 usdcSpent,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 newPrice,
        uint256 newPoolValue,
        uint256 newTotalShares
    );

    /// @notice Emitted when shares are sold (enhanced with fee breakdown)
    event SharesSold(
        uint256 indexed answerId,
        address indexed seller,
        uint256 shares,
        uint256 usdcReceived,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 newPrice,
        uint256 newPoolValue,
        uint256 newTotalShares
    );

    // === LEADERSHIP EVENTS ===

    /// @notice Emitted when a new answer becomes the leader for a question
    event LeaderChanged(
        uint256 indexed questionId,
        uint256 indexed newLeaderId,
        uint256 indexed previousLeaderId,
        uint256 newLeaderMarketCap,
        uint256 previousLeaderMarketCap
    );

    // === MILESTONE EVENTS (for gamification/notifications) ===

    /// @notice Emitted when an answer reaches a price milestone
    event PriceMilestoneReached(
        uint256 indexed answerId,
        uint256 indexed questionId,
        uint256 milestone,       // 10, 100, 1000, 10000 (in dollars)
        uint256 actualPrice,
        uint256 timestamp
    );

    /// @notice Emitted when an answer reaches a new all-time high
    event NewAllTimeHigh(
        uint256 indexed answerId,
        uint256 indexed questionId,
        uint256 newATH,
        uint256 previousATH,
        uint256 timestamp
    );

    /// @notice Emitted when an answer reaches holder count milestones
    event HolderMilestoneReached(
        uint256 indexed answerId,
        uint256 holderCount,     // 10, 50, 100, 500, 1000
        uint256 timestamp
    );

    // === HOLDER TRACKING EVENTS ===

    /// @notice Emitted when someone becomes a new holder
    event NewHolder(
        uint256 indexed answerId,
        address indexed holder,
        uint256 shares,
        uint256 totalHolders
    );

    /// @notice Emitted when someone exits completely (sells all shares)
    event HolderExited(
        uint256 indexed answerId,
        address indexed holder,
        uint256 sharesSold,
        uint256 usdcReceived,
        uint256 totalHolders
    );

    // === QUESTION MARKETPLACE EVENTS ===

    /// @notice Emitted when a question is listed for sale
    event QuestionListed(
        uint256 indexed questionId,
        address indexed seller,
        uint256 price,
        uint256 accumulatedRoyalties
    );

    /// @notice Emitted when a question listing is cancelled
    event QuestionListingCancelled(
        uint256 indexed questionId,
        address indexed seller
    );

    /// @notice Emitted when a question is bought
    event QuestionBought(
        uint256 indexed questionId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 accumulatedVolume
    );

    /// @notice Emitted when question ownership is transferred (free transfer)
    event QuestionTransferred(
        uint256 indexed questionId,
        address indexed from,
        address indexed to
    );

    // === FEE EVENTS ===

    /// @notice Emitted when creator fees are accumulated
    event FeesAccumulated(
        address indexed recipient,
        uint256 indexed questionId,
        uint96 amount,
        uint96 newTotal,
        string feeType  // "trade" or "creation"
    );

    /// @notice Emitted when fees are claimed
    event FeesClaimed(
        address indexed user,
        uint96 amount,
        uint256 timestamp
    );

    // === MODERATION EVENTS ===

    event AnswerDeactivated(uint256 indexed answerId, address indexed moderator, string reason);
    event AnswerReactivated(uint256 indexed answerId, address indexed moderator);
    event AnswerFlagged(uint256 indexed answerId, address indexed moderator, string reason);
    event AnswerUnflagged(uint256 indexed answerId, address indexed moderator);
    event QuestionDeactivated(uint256 indexed questionId, address indexed moderator, string reason);
    event QuestionReactivated(uint256 indexed questionId, address indexed moderator);

    // === ADMIN EVENTS ===

    event FeesUpdated(uint16 platformFeeBps, uint16 creatorFeeBps);
    event QuestionCreationFeeUpdated(uint96 oldFee, uint96 newFee);
    event AnswerProposalStakeUpdated(uint96 oldStake, uint96 newStake);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event MaxAnswersUpdated(uint8 oldMax, uint8 newMax);
    event MaxCategoriesUpdated(uint8 oldMax, uint8 newMax);
    event CategoryAdded(string category, uint256 totalCategories);
    event CategoryRemoved(string category, uint256 totalCategories);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);
    event ContractPaused(address indexed admin, uint256 timestamp);
    event ContractUnpaused(address indexed admin, uint256 timestamp);

    // === GLOBAL STATS EVENTS ===

    /// @notice Emitted periodically or on demand for indexers
    event GlobalStatsSnapshot(
        uint256 totalQuestions,
        uint256 totalAnswers,
        uint256 totalTrades,
        uint256 totalVolume,
        uint256 totalAccumulatedFees,
        uint256 timestamp
    );

    // ============================================================
    //                         ERRORS
    // ============================================================

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
    error NotQuestionOwner();
    error QuestionNotListed();
    error QuestionAlreadyListed();
    error InsufficientPayment();
    error InvalidCategory();
    error TooManyCategories();
    error CategoryAlreadyExists();
    error CategoryNotFound();

    // ============================================================
    //                      INITIALIZATION
    // ============================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

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

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MODERATOR_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _admin);

        questionCreationFee = 2e6;
        answerProposalStake = 5e6;
        platformFeeBps = 150;
        creatorFeeBps = 50;
        maxAnswersPerQuestion = 10;
        maxCategoriesPerQuestion = 3;

        nextQuestionId = 1;
        nextAnswerId = 1;

        // Initialize default categories
        _addCategory("Crypto");
        _addCategory("DeFi");
        _addCategory("NFTs");
        _addCategory("Gaming");
        _addCategory("AI");
        _addCategory("Technology");
        _addCategory("Politics");
        _addCategory("Sports");
        _addCategory("Entertainment");
        _addCategory("Business");
    }

    // ============================================================
    //                      CORE FUNCTIONS
    // ============================================================

    function createQuestion(
        string calldata text,
        string calldata description,
        string[] calldata categories
    ) external nonReentrant whenNotPaused returns (uint256 questionId) {
        if (bytes(text).length < 5) revert TextTooShort();
        if (bytes(text).length > 100) revert TextTooLong();
        if (bytes(description).length > 280) revert TextTooLong();
        if (categories.length > maxCategoriesPerQuestion) revert TooManyCategories();

        // Validate categories
        for (uint256 i = 0; i < categories.length; i++) {
            if (!validCategories[categories[i]]) revert InvalidCategory();
        }

        if (questionCreationFee > 0) {
            usdcToken.safeTransferFrom(msg.sender, treasury, questionCreationFee);
        }

        questionId = nextQuestionId++;
        totalQuestions++;

        Question storage q = questions[questionId];
        q.id = questionId;
        q.text = text;
        q.description = description;
        q.creator = msg.sender;
        q.originalCreator = msg.sender;
        q.createdAt = uint48(block.timestamp);
        q.isActive = true;
        q.categories = categories;

        emit QuestionCreated(questionId, msg.sender, text, description, categories, questionCreationFee);
    }

    function proposeAnswer(
        uint256 questionId,
        string calldata answerText
    ) external nonReentrant whenNotPaused returns (uint256 answerId) {
        Question storage question = questions[questionId];
        if (question.id == 0) revert QuestionNotFound();
        if (!question.isActive) revert QuestionNotActive();
        if (questionAnswerIds[questionId].length >= maxAnswersPerQuestion) revert MaxAnswersReached();

        if (bytes(answerText).length < 1) revert TextTooShort();
        if (bytes(answerText).length > 60) revert TextTooLong();

        bytes32 textHash = keccak256(abi.encodePacked(_toLowerCase(answerText)));
        if (answerTextExists[questionId][textHash]) revert DuplicateAnswer();
        answerTextExists[questionId][textHash] = true;

        usdcToken.safeTransferFrom(msg.sender, address(this), answerProposalStake);

        answerId = nextAnswerId++;
        totalAnswers++;

        uint128 initialShares = uint128(answerProposalStake / 1e6);
        uint256 initialPrice = 1e6; // $1.00

        Answer storage answer = answers[answerId];
        answer.id = answerId;
        answer.questionId = questionId;
        answer.text = answerText;
        answer.proposer = msg.sender;
        answer.totalShares = initialShares;
        answer.poolValue = uint128(answerProposalStake);
        answer.createdAt = uint48(block.timestamp);
        answer.isActive = true;
        answer.tradeCount = 0;
        answer.allTimeHigh = initialPrice;

        questionAnswerIds[questionId].push(answerId);

        positions[answerId][msg.sender] = Position({
            shares: initialShares,
            costBasis: uint128(answerProposalStake)
        });

        answerHolders[answerId].push(msg.sender);
        isHolder[answerId][msg.sender] = true;

        // Check if this is the new leader
        _checkAndUpdateLeader(questionId, answerId);

        emit AnswerProposed(answerId, questionId, msg.sender, answerText, initialShares, initialPrice, answerProposalStake);
        emit NewHolder(answerId, msg.sender, initialShares, 1);
    }

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

        uint256 platformFee = (usdcAmount * platformFeeBps) / 10000;
        uint256 creatorFee = (usdcAmount * creatorFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee;
        uint256 amountAfterFee = usdcAmount - totalFee;

        sharesBought = _calculateSharesForAmount(answer.poolValue, answer.totalShares, amountAfterFee);

        if (sharesBought < minSharesOut) revert SlippageExceeded();

        uint256 newPoolValue = uint256(answer.poolValue) + amountAfterFee;
        uint256 newTotalShares = uint256(answer.totalShares) + sharesBought;
        if (newPoolValue > MAX_POOL_VALUE) revert PoolOverflow();
        if (newTotalShares > MAX_TOTAL_SHARES) revert SharesOverflow();

        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        if (creatorFee > 0) {
            address questionCreator = questions[answer.questionId].creator;
            accumulatedFees[questionCreator] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(questionCreator, answer.questionId, uint96(creatorFee), accumulatedFees[questionCreator], "trade");
        }

        uint256 oldPrice = getSharePrice(answerId);

        answer.poolValue = uint128(newPoolValue);
        answer.totalShares = uint128(newTotalShares);
        answer.tradeCount++;
        totalTrades++;

        questions[answer.questionId].totalVolume += usdcAmount;
        totalVolumeAllTime += usdcAmount;

        bool wasNewHolder = !isHolder[answerId][msg.sender];
        Position storage pos = positions[answerId][msg.sender];
        pos.shares += uint128(sharesBought);
        pos.costBasis += uint128(usdcAmount);

        if (wasNewHolder) {
            answerHolders[answerId].push(msg.sender);
            isHolder[answerId][msg.sender] = true;
            uint256 holderCount = answerHolders[answerId].length;
            emit NewHolder(answerId, msg.sender, sharesBought, holderCount);
            _checkHolderMilestone(answerId, holderCount);
        }

        uint256 newPrice = getSharePrice(answerId);

        // Check for ATH
        if (newPrice > answer.allTimeHigh) {
            uint256 previousATH = answer.allTimeHigh;
            answer.allTimeHigh = newPrice;
            emit NewAllTimeHigh(answerId, answer.questionId, newPrice, previousATH, block.timestamp);
        }

        // Check for price milestones
        _checkPriceMilestones(answerId, answer.questionId, oldPrice, newPrice);

        // Check for leader change
        _checkAndUpdateLeader(answer.questionId, answerId);

        emit SharesBought(answerId, msg.sender, sharesBought, usdcAmount, platformFee, creatorFee, newPrice, newPoolValue, newTotalShares);
    }

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

        uint256 grossReturn = _calculateReturnForShares(answer.poolValue, answer.totalShares, shareAmount);

        if (answer.poolValue - grossReturn < MIN_POOL_RESERVE) revert PoolReserveViolation();

        uint256 platformFee = (grossReturn * platformFeeBps) / 10000;
        uint256 creatorFee = (grossReturn * creatorFeeBps) / 10000;
        uint256 totalFee = platformFee + creatorFee;
        usdcReturned = grossReturn - totalFee;

        if (usdcReturned < minUsdcOut) revert SlippageExceeded();

        uint256 newPoolValue = answer.poolValue - grossReturn;
        uint256 newTotalShares = answer.totalShares - shareAmount;

        answer.poolValue = uint128(newPoolValue);
        answer.totalShares = uint128(newTotalShares);
        answer.tradeCount++;
        totalTrades++;

        uint256 costBasisReduction = (uint256(pos.costBasis) * shareAmount) / pos.shares;
        pos.shares -= uint128(shareAmount);
        pos.costBasis -= uint128(costBasisReduction);

        bool isExiting = pos.shares == 0;
        uint256 holderCount = answerHolders[answerId].length;

        usdcToken.safeTransfer(msg.sender, usdcReturned);

        if (platformFee > 0) {
            usdcToken.safeTransfer(treasury, platformFee);
        }

        if (creatorFee > 0) {
            address questionCreator = questions[answer.questionId].creator;
            accumulatedFees[questionCreator] += uint96(creatorFee);
            totalAccumulatedFees += uint96(creatorFee);
            emit FeesAccumulated(questionCreator, answer.questionId, uint96(creatorFee), accumulatedFees[questionCreator], "trade");
        }

        uint256 newPrice = getSharePrice(answerId);

        emit SharesSold(answerId, msg.sender, shareAmount, usdcReturned, platformFee, creatorFee, newPrice, newPoolValue, newTotalShares);

        if (isExiting) {
            emit HolderExited(answerId, msg.sender, shareAmount, usdcReturned, holderCount - 1);
            // Note: We don't remove from answerHolders to preserve holder history
        }

        // Check for leader change after sell
        _checkAndUpdateLeader(answer.questionId, answerId);
    }

    // ============================================================
    //                   QUESTION MARKETPLACE
    // ============================================================

    /// @notice List a question for sale
    function listQuestion(uint256 questionId, uint256 price) external nonReentrant whenNotPaused {
        Question storage q = questions[questionId];
        if (q.id == 0) revert QuestionNotFound();
        if (q.creator != msg.sender) revert NotQuestionOwner();
        if (questionListings[questionId].price > 0) revert QuestionAlreadyListed();
        if (price == 0) revert ZeroAmount();

        questionListings[questionId] = QuestionListing({
            price: price,
            listedAt: uint48(block.timestamp)
        });

        emit QuestionListed(questionId, msg.sender, price, q.totalVolume);
    }

    /// @notice Cancel question listing
    function cancelQuestionListing(uint256 questionId) external nonReentrant {
        Question storage q = questions[questionId];
        if (q.id == 0) revert QuestionNotFound();
        if (q.creator != msg.sender) revert NotQuestionOwner();
        if (questionListings[questionId].price == 0) revert QuestionNotListed();

        delete questionListings[questionId];

        emit QuestionListingCancelled(questionId, msg.sender);
    }

    /// @notice Buy a listed question
    function buyQuestion(uint256 questionId) external nonReentrant whenNotPaused {
        Question storage q = questions[questionId];
        if (q.id == 0) revert QuestionNotFound();

        QuestionListing memory listing = questionListings[questionId];
        if (listing.price == 0) revert QuestionNotListed();

        address seller = q.creator;

        // Transfer payment to seller
        usdcToken.safeTransferFrom(msg.sender, seller, listing.price);

        // Transfer ownership
        q.creator = msg.sender;
        delete questionListings[questionId];

        emit QuestionBought(questionId, msg.sender, seller, listing.price, q.totalVolume);
    }

    /// @notice Transfer question ownership for free
    function transferQuestion(uint256 questionId, address to) external nonReentrant {
        if (to == address(0)) revert InvalidAddress();

        Question storage q = questions[questionId];
        if (q.id == 0) revert QuestionNotFound();
        if (q.creator != msg.sender) revert NotQuestionOwner();

        // Cancel any existing listing
        if (questionListings[questionId].price > 0) {
            delete questionListings[questionId];
            emit QuestionListingCancelled(questionId, msg.sender);
        }

        address previousOwner = q.creator;
        q.creator = to;

        emit QuestionTransferred(questionId, previousOwner, to);
    }

    // ============================================================
    //                      VIEW FUNCTIONS
    // ============================================================

    function getSharePrice(uint256 answerId) public view returns (uint256 pricePerShare) {
        Answer storage answer = answers[answerId];
        if (answer.totalShares == 0) {
            return 1e6;
        }
        return (uint256(answer.poolValue) * 1e6) / answer.totalShares;
    }

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
        int256 profitLoss
    ) {
        Position storage pos = positions[answerId][user];
        shares = pos.shares;
        costBasis = pos.costBasis;
        if (shares > 0) {
            currentValue = (shares * getSharePrice(answerId)) / 1e6;
            profitLoss = int256(currentValue) - int256(costBasis);
        }
    }

    function getAnswer(uint256 answerId) external view returns (
        uint256 id,
        uint256 questionId,
        string memory text,
        address proposer,
        uint256 totalShares,
        uint256 poolValue,
        uint256 pricePerShare,
        uint48 createdAt,
        bool isActive,
        bool isFlagged,
        uint256 tradeCount,
        uint256 allTimeHigh
    ) {
        Answer storage answer = answers[answerId];
        return (
            answer.id,
            answer.questionId,
            answer.text,
            answer.proposer,
            answer.totalShares,
            answer.poolValue,
            getSharePrice(answerId),
            answer.createdAt,
            answer.isActive,
            answer.isFlagged,
            answer.tradeCount,
            answer.allTimeHigh
        );
    }

    function getQuestion(uint256 questionId) external view returns (
        uint256 id,
        string memory text,
        string memory description,
        address creator,
        address originalCreator,
        uint48 createdAt,
        bool isActive,
        uint256 totalVolume,
        uint256 answerCount,
        string[] memory categories,
        uint256 listingPrice
    ) {
        Question storage question = questions[questionId];
        return (
            question.id,
            question.text,
            question.description,
            question.creator,
            question.originalCreator,
            question.createdAt,
            question.isActive,
            question.totalVolume,
            questionAnswerIds[questionId].length,
            question.categories,
            questionListings[questionId].price
        );
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

    function getGlobalStats() external view returns (
        uint256 _totalQuestions,
        uint256 _totalAnswers,
        uint256 _totalTrades,
        uint256 _totalVolume,
        uint96 _totalAccumulatedFees
    ) {
        return (totalQuestions, totalAnswers, totalTrades, totalVolumeAllTime, totalAccumulatedFees);
    }

    function getCategoryList() external view returns (string[] memory) {
        return categoryList;
    }

    // ============================================================
    //                      FEE CLAIMING
    // ============================================================

    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint96 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        usdcToken.safeTransfer(msg.sender, amount);

        emit FeesClaimed(msg.sender, amount, block.timestamp);
    }

    // ============================================================
    //                   INTERNAL FUNCTIONS
    // ============================================================

    function _calculateSharesForAmount(
        uint256 poolValue,
        uint256 totalShares,
        uint256 usdcAmount
    ) internal pure returns (uint256) {
        if (totalShares == 0) {
            return usdcAmount / 1e6;
        }
        return (usdcAmount * totalShares) / poolValue;
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

    function _checkAndUpdateLeader(uint256 questionId, uint256 potentialNewLeader) internal {
        (uint256 actualLeader, uint256 leaderMarketCap) = getLeadingAnswer(questionId);

        uint256 previousLeader = currentLeader[questionId];

        if (actualLeader != previousLeader && actualLeader != 0) {
            uint256 previousMarketCap = 0;
            if (previousLeader != 0) {
                previousMarketCap = answers[previousLeader].poolValue;
            }

            currentLeader[questionId] = actualLeader;

            emit LeaderChanged(
                questionId,
                actualLeader,
                previousLeader,
                leaderMarketCap,
                previousMarketCap
            );
        }
    }

    function _checkPriceMilestones(uint256 answerId, uint256 questionId, uint256 oldPrice, uint256 newPrice) internal {
        // Check each milestone
        if (oldPrice < MILESTONE_10 && newPrice >= MILESTONE_10) {
            emit PriceMilestoneReached(answerId, questionId, 10, newPrice, block.timestamp);
        }
        if (oldPrice < MILESTONE_100 && newPrice >= MILESTONE_100) {
            emit PriceMilestoneReached(answerId, questionId, 100, newPrice, block.timestamp);
        }
        if (oldPrice < MILESTONE_1K && newPrice >= MILESTONE_1K) {
            emit PriceMilestoneReached(answerId, questionId, 1000, newPrice, block.timestamp);
        }
        if (oldPrice < MILESTONE_10K && newPrice >= MILESTONE_10K) {
            emit PriceMilestoneReached(answerId, questionId, 10000, newPrice, block.timestamp);
        }
    }

    function _checkHolderMilestone(uint256 answerId, uint256 holderCount) internal {
        if (holderCount == 10 || holderCount == 50 || holderCount == 100 || holderCount == 500 || holderCount == 1000) {
            emit HolderMilestoneReached(answerId, holderCount, block.timestamp);
        }
    }

    function _addCategory(string memory category) internal {
        validCategories[category] = true;
        categoryList.push(category);
    }

    // ============================================================
    //                   MODERATOR FUNCTIONS
    // ============================================================

    function deactivateAnswer(uint256 answerId, string calldata reason) external onlyRole(MODERATOR_ROLE) {
        if (answers[answerId].id == 0) revert AnswerNotFound();
        answers[answerId].isActive = false;
        emit AnswerDeactivated(answerId, msg.sender, reason);
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
        emit AnswerUnflagged(answerId, msg.sender);
    }

    function deactivateQuestion(uint256 questionId, string calldata reason) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = false;
        emit QuestionDeactivated(questionId, msg.sender, reason);
    }

    function reactivateQuestion(uint256 questionId) external onlyRole(MODERATOR_ROLE) {
        if (questions[questionId].id == 0) revert QuestionNotFound();
        questions[questionId].isActive = true;
        emit QuestionReactivated(questionId, msg.sender);
    }

    // ============================================================
    //                     ADMIN FUNCTIONS
    // ============================================================

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        if (!paused()) revert NotPaused();
        if (to == address(0)) revert InvalidAddress();
        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(token, to, amount);
    }

    function setFees(uint16 _platformFeeBps, uint16 _creatorFeeBps) external onlyRole(ADMIN_ROLE) {
        if (_platformFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_creatorFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeesUpdated(_platformFeeBps, _creatorFeeBps);
        platformFeeBps = _platformFeeBps;
        creatorFeeBps = _creatorFeeBps;
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

    function setMaxAnswersPerQuestion(uint8 _max) external onlyRole(ADMIN_ROLE) {
        if (_max < 2 || _max > 50) revert InvalidMaxAnswers();
        emit MaxAnswersUpdated(maxAnswersPerQuestion, _max);
        maxAnswersPerQuestion = _max;
    }

    function setMaxCategoriesPerQuestion(uint8 _max) external onlyRole(ADMIN_ROLE) {
        emit MaxCategoriesUpdated(maxCategoriesPerQuestion, _max);
        maxCategoriesPerQuestion = _max;
    }

    function addCategory(string calldata category) external onlyRole(ADMIN_ROLE) {
        if (validCategories[category]) revert CategoryAlreadyExists();
        _addCategory(category);
        emit CategoryAdded(category, categoryList.length);
    }

    function removeCategory(string calldata category) external onlyRole(ADMIN_ROLE) {
        if (!validCategories[category]) revert CategoryNotFound();
        validCategories[category] = false;
        emit CategoryRemoved(category, categoryList.length);
    }

    function setTreasury(address _treasury) external onlyRole(TREASURY_ROLE) {
        if (_treasury == address(0)) revert InvalidAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function emitGlobalStatsSnapshot() external {
        emit GlobalStatsSnapshot(
            totalQuestions,
            totalAnswers,
            totalTrades,
            totalVolumeAllTime,
            totalAccumulatedFees,
            block.timestamp
        );
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

    // ============================================================
    //                      UUPS UPGRADE
    // ============================================================

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
