// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol"; // Changed from security/
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol"; //
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IOpinionCore.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./structs/OpinionStructs.sol";
import "./libraries/ValidationLibrary.sol";
import "./libraries/PriceCalculator.sol";

/**
 * @title OpinionCore
 * @dev Core contract for managing opinions, answers, and related functionality
 */
contract OpinionCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCore,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    /**
     * @dev Administrative role for the core opinion system
     * Accounts with this role can:
     * - Update opinion creation price parameters
     * - Configure interaction price dynamics
     * - Set opinion and interaction cost limits
     * - Manage fee distribution parameters
     * - Update contract addresses for integrations (FeeManager, PoolManager)
     * - Configure security parameters and thresholds
     * - Pause/unpause specific core functionalities
     * - Grant or revoke any roles in this contract
     * - Update protocol-level settings and protocol upgrade parameters
     * - Typically assigned to a multi-sig wallet or governance contract
     */
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev Content moderation role
     * Accounts with this role can:
     * - Deactivate harmful or inappropriate opinions
     * - Reactivate previously deactivated opinions
     * - Flag opinions for review
     * - Cannot create/modify opinions or change parameters (requires ADMIN_ROLE)
     * - Only handles content moderation functions
     * - Typically assigned to trusted community moderators
     */
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    /**
     * @dev Role exclusively for the OpinionMarket contract
     * This role allows OpinionMarket to:
     * - Create new opinions on behalf of users
     * - Facilitate user interactions with opinions
     * - Query opinion information and prices
     * - Execute price updates based on interactions
     * - Cannot modify system parameters (requires ADMIN_ROLE)
     * - Cannot moderate content (requires MODERATOR_ROLE)
     * - Should ONLY be granted to the OpinionMarket contract address
     * - Serves as the primary entry point for user operations
     */
    bytes32 public constant MARKET_CONTRACT_ROLE =
        keccak256("MARKET_CONTRACT_ROLE");

    /**
     * @dev Role exclusively for the PoolManager contract
     * This role allows PoolManager to:
     * - Update opinions through pool-based operations
     * - Query opinion data needed for pool management
     * - Execute collective opinion interactions via pools
     * - Register pool contributions affecting opinion prices
     * - Cannot create new opinions (requires MARKET_CONTRACT_ROLE)
     * - Cannot modify system parameters (requires ADMIN_ROLE)
     * - Should ONLY be granted to the PoolManager contract address
     * - Facilitates collective opinion interactions via pool mechanisms
     */
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 52;
    uint256 public constant MAX_ANSWER_LENGTH = 52;
    uint256 public constant MAX_LINK_LENGTH = 260;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 68;

    // --- INITIAL PRICE RANGE CONSTANTS ---
    uint96 public constant MIN_INITIAL_PRICE = 1_000_000; // 1 USDC (6 decimals)
    uint96 public constant MAX_INITIAL_PRICE = 100_000_000; // 100 USDC (6 decimals)

    // --- DESCRIPTION LENGTH CONSTANT ---
    uint256 public constant MAX_DESCRIPTION_LENGTH = 120;

    // --- CATEGORIES CONSTANTS ---
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;

    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;

    bool public isPublicCreationEnabled;
    uint256 public nextOpinionId;

    // --- CATEGORIES STORAGE ---
    string[] public categories;

    // --- EXTENSION SLOTS STORAGE - IMPOSED MAPPINGS ---
    // OBLIGATOIRE: Utiliser mappings séparés (pas de modification struct Opinion)
    mapping(uint256 => mapping(string => string))
        public opinionStringExtensions;
    mapping(uint256 => mapping(string => uint256))
        public opinionNumberExtensions;
    mapping(uint256 => mapping(string => bool)) public opinionBoolExtensions;
    mapping(uint256 => mapping(string => address))
        public opinionAddressExtensions;

    // OBLIGATOIRE: Tracking des extension keys par opinion
    mapping(uint256 => string[]) public opinionExtensionKeys;

    // Security and rate limiting
    uint256 public maxTradesPerBlock;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;

    // Price calculation
    uint256 private nonce;
    mapping(uint256 => uint256) private priceMetadata;
    mapping(uint256 => uint256) private priceHistory;

    // Configurable parameters
    uint96 public minimumPrice;
    uint96 public questionCreationFee;
    uint96 public initialAnswerPrice;
    uint256 public absoluteMaxPriceChange;

    // Core data structures
    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;
    
    // Competition tracking for auction dynamics (ADDED AT END FOR UPGRADE SAFETY)
    mapping(uint256 => address[]) private opinionTraders; // Track unique traders per opinion
    mapping(uint256 => mapping(address => bool)) private hasTraded; // Track if address has traded this opinion
    mapping(uint256 => uint256) private lastCompetitionReset; // Track when competition data was last reset

    // --- INITIALIZATION ---
    /**
     * @dev Initializes the contract with required dependencies and parameters
     * @param _usdcToken Address of the USDC token contract
     * @param _feeManager Address of the FeeManager contract
     * @param _poolManager Address of the PoolManager contract
     */
    function initialize(
        address _usdcToken,
        address _feeManager,
        address _poolManager,
        address _treasury // 🆕 NO
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);

        // Set external contracts
        if (
            _usdcToken == address(0) ||
            _feeManager == address(0) ||
            _poolManager == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
        treasury = _treasury;

        // Initialize parameters
        nextOpinionId = 1;
        isPublicCreationEnabled = false;
        maxTradesPerBlock = 3;
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 1_000_000; // 1 USDC
        initialAnswerPrice = 2_000_000; // 2 USDC
        absoluteMaxPriceChange = 200; // 200%

        // 🚨 IMPOSED: Initialize default categories - EXACT LIST REQUIRED
        categories = [
            "Crypto",
            "Politics",
            "Science",
            "Technology",
            "Sports",
            "Entertainment",
            "Culture",
            "Web",
            "Social Media",
            "Other"
        ];
    }

    // --- MODIFIERS ---
    /**
     * @dev Ensures only approved market contract can call certain functions
     */
    modifier onlyMarketContract() {
        if (!hasRole(MARKET_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(
                msg.sender,
                MARKET_CONTRACT_ROLE
            );
        _;
    }

    /**
     * @dev Ensures only approved pool manager can call certain functions
     */
    modifier onlyPoolManager() {
        if (!hasRole(POOL_MANAGER_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(
                msg.sender,
                POOL_MANAGER_ROLE
            );
        _;
    }

    /**
     * @dev Creates a new opinion
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (1-100 USDC)
     * @param opinionCategories Categories for the opinion (1-3 required)
     */
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        // 1. Access control check FIRST - IMPOSED ORDER
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // 2. Categories validation BEFORE other validations - IMPOSED ORDER
        ValidationLibrary.validateOpinionCategories(
            opinionCategories,
            categories
        );

        // 3. Then existing validations - IMPOSED ORDER
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );

        // Validate description (optional)
        ValidationLibrary.validateDescription(description);

        // 🚨 CRITICAL: Validate initialPrice range (1-100 USDC inclusive)
        if (
            initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE
        ) {
            revert InvalidInitialPrice();
        }

        // Calculate creation fee: 20% of initialPrice with 5 USDC minimum
        uint96 creationFee = uint96((initialPrice * 20) / 100);
        if (creationFee < 5_000_000) { // 5 USDC minimum
            creationFee = 5_000_000;
        }

        // Check allowance for creation fee (not full initialPrice)
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert InsufficientAllowance(creationFee, allowance);

        // Create opinion record with user-chosen initialPrice
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            "",
            "",
            initialPrice,
            opinionCategories
        );

        // 🚨 NEW FINANCIAL FLOW: Only charge creation fee to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, creationFee);

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    /**
     * @dev Creates a new opinion with IPFS hash and link
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (1-100 USDC)
     * @param opinionCategories Categories for the opinion (1-3 required)
     * @param ipfsHash The IPFS hash for an image
     * @param link The external URL link
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        // 1. Access control check FIRST - IMPOSED ORDER
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // 2. Categories validation BEFORE other validations - IMPOSED ORDER
        ValidationLibrary.validateOpinionCategories(
            opinionCategories,
            categories
        );

        // 3. Then existing validations - IMPOSED ORDER
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );

        // Validate description (optional)
        ValidationLibrary.validateDescription(description);

        // Validate IPFS hash and link
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > MAX_IPFS_HASH_LENGTH)
            revert InvalidIpfsHashLength();
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        // Validate IPFS hash format if not empty
        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }

        // 🚨 CRITICAL: Validate initialPrice range (1-100 USDC inclusive)
        if (
            initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE
        ) {
            revert InvalidInitialPrice();
        }

        // Calculate creation fee: 20% of initialPrice with 5 USDC minimum
        uint96 creationFee = uint96((initialPrice * 20) / 100);
        if (creationFee < 5_000_000) { // 5 USDC minimum
            creationFee = 5_000_000;
        }

        // Check allowance for creation fee (not full initialPrice)
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert InsufficientAllowance(creationFee, allowance);

        // Create opinion with user-chosen initialPrice
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            ipfsHash,
            link,
            initialPrice,
            opinionCategories
        );

        // 🚨 NEW FINANCIAL FLOW: Only charge creation fee to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, creationFee);

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    /**
     * @dev Submits a new answer to an opinion
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     * @param description The answer description (optional, max 120 chars)
     * @param link The external URL link (optional, max 260 chars)
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.currentAnswerOwner == msg.sender) revert SameOwner();

        // Validate answer
        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        // Validate description (optional)
        ValidationLibrary.validateDescription(description);

        // Validate link (optional)
        bytes memory linkBytes = bytes(link);
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        // Use the stored next price or calculate it
        uint96 price = opinion.nextPrice > 0
            ? opinion.nextPrice
            : uint96(_calculateNextPrice(opinionId, opinion.lastPrice));

        // Check USDC allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        // Calculate standard fees
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeManager
            .calculateFeeDistribution(price);

        // Check if MEV penalty applies and adjust fees
        (platformFee, ownerAmount) = feeManager.applyMEVPenalty(
            price,
            ownerAmount,
            msg.sender,
            opinionId
        );

        // Update MEV tracking data in FeeManager
        // NOTE: This is done via FeeManager to keep all MEV-related logic there
        // In a real implementation we'd need proper permissions

        // Gather important addresses for fee distribution
        // 🔧 CRITICAL FIX: Use questionOwner (current owner) instead of creator (original creator)
        address creator = opinion.questionOwner;  // This ensures fees go to current owner after transfers
        address currentAnswerOwner = opinion.currentAnswerOwner;

        // Check if this is a pool-owned answer
        bool answerIsPoolOwned = currentAnswerOwner == address(poolManager);

        // 🚀 SIMPLIFIED: Send platform fees directly to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, platformFee);

        // 🔧 FIX: Transfer user fees to FeeManager before accumulating
        uint96 totalUserFees = creatorFee;
        if (!answerIsPoolOwned) {
            totalUserFees += ownerAmount;
        }
        if (totalUserFees > 0) {
            usdcToken.safeTransferFrom(msg.sender, address(feeManager), totalUserFees);
        }

        // Accumulate fees for creator and owner
        feeManager.accumulateFee(creator, creatorFee);

        // For pool-owned answers, distribute rewards through poolManager
        if (answerIsPoolOwned) {
            poolManager.distributePoolRewards(opinionId, price, msg.sender);
        } else {
            // For regular answers, accumulate to the current owner
            feeManager.accumulateFee(currentAnswerOwner, ownerAmount);
        }

        // Record answer history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.link = link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Calculate and store the next price for future answers
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        // Token transfers - remaining amount after platform fee already sent to treasury
        uint96 remainingAmount = price - platformFee;
        usdcToken.safeTransferFrom(msg.sender, address(this), remainingAmount);

        // Emit events
        emit FeesAction(
            opinionId,
            0,
            currentAnswerOwner,
            price,
            platformFee,
            creatorFee,
            ownerAmount
        );
        emit OpinionAction(opinionId, 1, answer, msg.sender, price);
    }

    /**
     * @dev Places a question for sale
     * @param opinionId The ID of the opinion
     * @param price The sale price
     */
    function listQuestionForSale(
        uint256 opinionId,
        uint256 price
    ) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();

        // Only the current owner can sell
        if (opinion.questionOwner != msg.sender)
            revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    /**
     * @dev Buys a question that is for sale
     * @param opinionId The ID of the opinion
     */
    function buyQuestion(
        uint256 opinionId
    ) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();

        // Check if for sale
        uint96 salePrice = opinion.salePrice;
        if (salePrice == 0) revert NotForSale(opinionId);

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < salePrice)
            revert InsufficientAllowance(salePrice, allowance);

        // Get current owner
        address currentOwner = opinion.questionOwner;

        // Calculate fees (90% seller, 10% platform)
        uint96 platformFee = uint96((salePrice * 10) / 100);
        uint96 sellerAmount = salePrice - platformFee;

        // Update ownership
        opinion.questionOwner = msg.sender;
        opinion.salePrice = 0; // No longer for sale

        // Handle transfers
        // 🚀 SIMPLIFIED: Send platform fees directly to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, platformFee);
        // 🔧 FIX: Transfer seller amount to FeeManager, not to this contract
        usdcToken.safeTransferFrom(msg.sender, address(feeManager), sellerAmount);

        // Accumulate fees for seller
        feeManager.accumulateFee(currentOwner, sellerAmount);

        emit QuestionSaleAction(
            opinionId,
            1,
            currentOwner,
            msg.sender,
            salePrice
        );
    }

    /**
     * @dev Cancels a question sale
     * @param opinionId The ID of the opinion
     */
    function cancelQuestionSale(
        uint256 opinionId
    ) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();

        // Only the current owner can cancel
        if (opinion.questionOwner != msg.sender)
            revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    /**
     * @dev Deactivates an opinion
     * @param opinionId The ID of the opinion to deactivate
     */
    function deactivateOpinion(
        uint256 opinionId
    ) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        opinion.isActive = false;
        emit OpinionAction(opinionId, 2, "", msg.sender, 0);
    }

    /**
     * @dev Reactivates a previously deactivated opinion
     * @param opinionId The ID of the opinion to reactivate
     */
    function reactivateOpinion(
        uint256 opinionId
    ) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.isActive) revert OpinionAlreadyActive();

        opinion.isActive = true;
        emit OpinionAction(opinionId, 3, "", msg.sender, 0);
    }

    /**
     * @dev Moderates an inappropriate answer by reverting to initial answer
     * @param opinionId The ID of the opinion
     * @param reason The reason for moderation
     */
    function moderateAnswer(
        uint256 opinionId,
        string calldata reason
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();
        
        // Can't moderate if creator is still the current owner (no inappropriate answer)
        if (opinion.currentAnswerOwner == opinion.creator) {
            revert("No answer to moderate");
        }

        address previousOwner = opinion.currentAnswerOwner;
        
        // Get initial answer from first entry in history
        OpinionStructs.AnswerHistory[] storage history = answerHistory[opinionId];
        require(history.length > 0, "No initial answer found");
        
        string memory initialAnswer = history[0].answer;
        string memory initialDescription = history[0].description;
        
        // Record moderation in history before reverting
        history.push(OpinionStructs.AnswerHistory({
            answer: "[MODERATED]",
            description: reason,
            owner: previousOwner,
            price: opinion.nextPrice,
            timestamp: uint32(block.timestamp)
        }));
        
        // Revert to initial answer and creator ownership
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerDescription = initialDescription;
        opinion.currentAnswerOwner = opinion.creator;
        // Keep current price (fair for next trader)
        
        // Emit moderation event
        emit AnswerModerated(
            opinionId,
            previousOwner,
            opinion.creator,
            reason,
            block.timestamp
        );
        
        // Emit standard opinion action for consistency
        emit OpinionAction(opinionId, 4, reason, msg.sender, 0); // 4 = moderate action
    }

    /**
     * @dev Returns the answer history for an opinion
     * @param opinionId The ID of the opinion
     * @return History array of answers
     */
    function getAnswerHistory(
        uint256 opinionId
    ) external view override returns (OpinionStructs.AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    /**
     * @dev Returns the next price for submitting an answer
     * @param opinionId The ID of the opinion
     * @return The next price
     */
    function getNextPrice(
        uint256 opinionId
    ) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // If nextPrice is 0 (for older opinions), return an estimate
        if (opinion.nextPrice == 0) {
            return _estimateNextPrice(opinion.lastPrice);
        }

        return opinion.nextPrice;
    }

    /**
     * @dev Returns detailed information about an opinion
     * @param opinionId The ID of the opinion
     * @return Opinion details
     */
    function getOpinionDetails(
        uint256 opinionId
    ) external view override returns (OpinionStructs.Opinion memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId];
    }

    /**
     * @dev Returns the number of trades for an opinion
     * @param opinionId The ID of the opinion
     * @return Number of trades
     */
    function getTradeCount(
        uint256 opinionId
    ) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    /**
     * @dev Returns total creator gain for an opinion
     * @param opinionId The ID of the opinion
     * @return Total creator gain
     */
    function getCreatorGain(
        uint256 opinionId
    ) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];

        // Use FeeManager to calculate the total creator fees
        (, uint96 creatorFeePercent, ) = feeManager.calculateFeeDistribution(
            1_000_000
        ); // Use 1 USDC as base
        uint256 creatorFeeRate = creatorFeePercent / 10; // Convert to percentage (e.g., 3%)

        return (opinion.totalVolume * creatorFeeRate) / 100;
    }

    /**
     * @dev Checks if an opinion's answer is owned by a pool
     * @param opinionId The ID of the opinion
     * @return Whether the answer is pool-owned
     */
    function isPoolOwned(
        uint256 opinionId
    ) external view override returns (bool) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].currentAnswerOwner == address(poolManager);
    }

    /**
     * @dev Updates an opinion when a pool executes
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     * @param description The answer description
     * @param price The price paid
     */
    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        uint256 price
    ) external override onlyPoolManager {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // Record answer history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: address(poolManager),
                price: uint96(price),
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = address(poolManager); // PoolManager becomes the owner
        opinion.lastPrice = uint96(price);
        opinion.totalVolume += uint96(price);

        // Calculate and store the next price for future answers
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        emit OpinionAction(opinionId, 1, answer, address(poolManager), price);
    }

    // --- ADMIN FUNCTIONS ---
    /**
     * @dev Sets the minimum price
     * @param _minimumPrice New minimum price
     */
    function setMinimumPrice(
        uint96 _minimumPrice
    ) external onlyRole(ADMIN_ROLE) {
        minimumPrice = _minimumPrice;
        emit ParameterUpdated(0, _minimumPrice);
    }

    /**
     * @dev Sets the question creation fee
     * @param _questionCreationFee New question creation fee
     */
    function setQuestionCreationFee(
        uint96 _questionCreationFee
    ) external onlyRole(ADMIN_ROLE) {
        questionCreationFee = _questionCreationFee;
        emit ParameterUpdated(6, _questionCreationFee);
    }

    /**
     * @dev Sets the initial answer price
     * @param _initialAnswerPrice New initial answer price
     */
    function setInitialAnswerPrice(
        uint96 _initialAnswerPrice
    ) external onlyRole(ADMIN_ROLE) {
        initialAnswerPrice = _initialAnswerPrice;
        emit ParameterUpdated(7, _initialAnswerPrice);
    }

    /**
     * @dev Sets the maximum price change percentage
     * @param _maxPriceChange New maximum price change percentage
     */
    function setMaxPriceChange(
        uint256 _maxPriceChange
    ) external onlyRole(ADMIN_ROLE) {
        absoluteMaxPriceChange = _maxPriceChange;
        emit ParameterUpdated(3, _maxPriceChange);
    }

    /**
     * @dev Sets the maximum trades per block
     * @param _maxTradesPerBlock New maximum trades per block
     */
    function setMaxTradesPerBlock(
        uint256 _maxTradesPerBlock
    ) external onlyRole(ADMIN_ROLE) {
        maxTradesPerBlock = _maxTradesPerBlock;
        emit ParameterUpdated(4, _maxTradesPerBlock);
    }

    /**
     * @dev Toggles public creation of opinions
     */
    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit AdminAction(1, msg.sender, bytes32(0), 0);
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Sets the FeeManager contract address
     */
    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        if (_feeManager == address(0)) revert ZeroAddressNotAllowed();
        feeManager = IFeeManager(_feeManager);
    }

    /**
     * @dev Sets the PoolManager contract address
     */
    function setPoolManager(
        address _poolManager
    ) external onlyRole(ADMIN_ROLE) {
        if (_poolManager == address(0)) revert ZeroAddressNotAllowed();
        poolManager = IPoolManager(_poolManager);
    }

    /**
     * @dev Grants MARKET_CONTRACT_ROLE to an address
     */
    function grantMarketContractRole(
        address contractAddress
    ) external onlyRole(ADMIN_ROLE) {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    /**
     * @dev Revokes MARKET_CONTRACT_ROLE from an address
     */
    function revokeMarketContractRole(
        address contractAddress
    ) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    /**
     * @dev Sets a new treasury address with timelock protection
     * @param newTreasury The new treasury address to set after timelock
     */
    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddressNotAllowed();

        pendingTreasury = newTreasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;

        emit TreasuryUpdated(
            treasury,
            newTreasury,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Confirms the treasury change after timelock period has elapsed
     */
    function confirmTreasuryChange() external onlyRole(ADMIN_ROLE) {
        if (block.timestamp < treasuryChangeTimestamp)
            revert("Treasury: Timelock not elapsed");
        if (pendingTreasury == address(0))
            revert("Treasury: No pending treasury");

        address oldTreasury = treasury;
        treasury = pendingTreasury;
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;

        emit TreasuryUpdated(
            oldTreasury,
            treasury,
            msg.sender,
            block.timestamp
        );
    }

    // --- CATEGORIES MANAGEMENT ---
    /**
     * @dev Adds a new category to available categories
     * @param newCategory The new category to add
     * 🚨 IMPOSED SIGNATURE - DO NOT MODIFY
     */
    function addCategoryToCategories(
        string calldata newCategory
    ) external onlyRole(ADMIN_ROLE) {
        // Check if category already exists - Gas optimized in creative freedom zone
        bytes32 newCategoryHash = keccak256(bytes(newCategory));
        uint256 length = categories.length;

        for (uint256 i = 0; i < length; i++) {
            if (keccak256(bytes(categories[i])) == newCategoryHash) {
                revert CategoryAlreadyExists();
            }
        }

        categories.push(newCategory);
        emit CategoryAction(0, categories.length - 1, newCategory, msg.sender, 0);
    }

    /**
     * @dev Add multiple new categories in batch - for major category expansion
     * @param newCategories Array of new categories to add
     */
    function addMultipleCategories(
        string[] calldata newCategories
    ) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < newCategories.length; i++) {
            // Check if category already exists
            bytes32 newCategoryHash = keccak256(bytes(newCategories[i]));
            uint256 length = categories.length;
            bool exists = false;

            for (uint256 j = 0; j < length; j++) {
                if (keccak256(bytes(categories[j])) == newCategoryHash) {
                    exists = true;
                    break;
                }
            }

            // Only add if doesn't exist
            if (!exists) {
                categories.push(newCategories[i]);
                emit CategoryAction(0, categories.length - 1, newCategories[i], msg.sender, 0);
            }
        }
    }

    // --- VIEW FUNCTIONS FOR CATEGORIES (Creative Freedom Zone) ---
    /**
     * @dev Returns all available categories
     * @return Array of available category strings
     */
    function getAvailableCategories() external view returns (string[] memory) {
        return categories;
    }

    /**
     * @dev Returns categories for a specific opinion
     * @param opinionId The opinion ID
     * @return Array of category strings for the opinion
     */
    function getOpinionCategories(
        uint256 opinionId
    ) external view returns (string[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].categories;
    }

    /**
     * @dev Returns the total number of available categories
     * @return The count of available categories
     */
    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    // --- INTERNAL FUNCTIONS ---
    /**
     * @dev Creates a new opinion record
     */
    function _createOpinionRecord(
        string memory question,
        string memory answer,
        string memory description,
        string memory ipfsHash,
        string memory link,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal returns (uint256) {
        uint256 opinionId = nextOpinionId++;
        OpinionStructs.Opinion storage opinion = opinions[opinionId];

        opinion.creator = msg.sender;
        opinion.questionOwner = msg.sender;
        opinion.lastPrice = initialPrice;
        // ✅ FIX: nextPrice should equal initialPrice at creation
        // The pricing algorithm only applies AFTER the first sale
        opinion.nextPrice = initialPrice;
        opinion.isActive = true;
        opinion.question = question;
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;

        // 🚨 IMPOSED: Store categories - AFTER existing fields
        opinion.categories = opinionCategories;

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: initialPrice,
                timestamp: uint32(block.timestamp)
            })
        );

        return opinionId;
    }

    /**
     * @dev Validates an IPFS hash
     */
    function _validateIpfsHash(string memory _ipfsHash) internal pure {
        bytes memory ipfsHashBytes = bytes(_ipfsHash);

        // Check that it's either a valid CIDv0 (starts with "Qm" and is 46 chars long)
        // or a valid CIDv1 (starts with "b" and has a proper length)
        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert InvalidIpfsHashFormat();
        }
    }

    /**
     * @dev Calculates the next price for an opinion
     */
    function _calculateNextPrice(
        uint256 opinionId,
        uint256 lastPrice
    ) internal returns (uint256) {
        // 🎯 COMPETITION-AWARE PRICING: Detect auction dynamics for fair pricing
        
        // Track this trader as participating in this opinion
        _updateCompetitionTracking(opinionId, msg.sender);
        
        // Check if there's competitive trading (2+ unique traders)
        bool isCompetitive = _hasCompetitiveTrading(opinionId);
        
        uint256 newPrice;
        
        if (isCompetitive) {
            // 🏆 COMPETITIVE AUCTION: Minimum growth floor when 2+ traders compete
            // This ensures auction-style price increases, not decreases
            uint256 randomSeed = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                opinionId,
                lastPrice,
                nonce++
            )));
            
            // Guaranteed minimum 8-12% increase for competitive scenarios
            uint256 increasePercent = 8 + (randomSeed % 5); // 8%, 9%, 10%, 11%, or 12%
            uint256 increase = (lastPrice * increasePercent) / 100;
            newPrice = lastPrice + increase;
            
        } else {
            // 📊 MARKET REGIME PRICING: Use complex market simulation for non-competitive scenarios
            // This allows for price volatility when there's no active competition
            newPrice = PriceCalculator.calculateNextPrice(
                opinionId,
                lastPrice,
                minimumPrice,
                absoluteMaxPriceChange,
                nonce++,
                priceMetadata,
                priceHistory
            );
        }

        // Apply global safety limits
        uint256 maxAllowedPrice = lastPrice + ((lastPrice * absoluteMaxPriceChange) / 100);
        if (newPrice > maxAllowedPrice) {
            newPrice = maxAllowedPrice;
        }

        // Ensure minimum price floor
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }

        // Update price history
        _updatePriceHistory(opinionId, newPrice);

        return newPrice;
    }

    /**
     * @dev Estimates a next price based on current price
     */
    function _estimateNextPrice(uint256 currentPrice) internal view returns (uint256) {
        // Simple estimation: increase by 10-30% or use minimum price
        uint256 increase = (currentPrice * (10 + (block.timestamp % 20))) / 100;
        uint256 newPrice = currentPrice + increase;
        
        // Ensure it's at least the minimum price
        if (newPrice < minimumPrice) {
            newPrice = minimumPrice;
        }
        
        return newPrice;
    }

    /**
     * @dev Updates price history
     */
    function _updatePriceHistory(uint256 opinionId, uint256 newPrice) internal {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        // Store timestamp in upper bits
        priceMetadata[opinionId] =
            (block.timestamp << 8) |
            (count < 3 ? count + 1 : 3);

        // Shift prices and add new one
        uint256 history = priceHistory[opinionId];
        history = (history << 80) & (~uint256(0) << 160);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    /**
     * @dev Updates competition tracking for auction dynamics detection
     * @param opinionId The opinion being traded
     * @param trader The current trader address
     */
    function _updateCompetitionTracking(uint256 opinionId, address trader) internal {
        // Reset competition data every 24 hours to prevent stale data
        if (block.timestamp - lastCompetitionReset[opinionId] > 86400) {
            _resetCompetitionData(opinionId);
        }
        
        // Add trader to opinion if not already tracked
        if (!hasTraded[opinionId][trader]) {
            opinionTraders[opinionId].push(trader);
            hasTraded[opinionId][trader] = true;
        }
    }
    
    /**
     * @dev Checks if there's competitive trading (2+ unique traders) for an opinion
     * @param opinionId The opinion to check
     * @return True if 2 or more unique traders are competing
     */
    function _hasCompetitiveTrading(uint256 opinionId) internal view returns (bool) {
        return opinionTraders[opinionId].length >= 2;
    }
    
    /**
     * @dev Resets competition tracking data for an opinion
     * @param opinionId The opinion to reset
     */
    function _resetCompetitionData(uint256 opinionId) internal {
        // Clear the traders array
        address[] storage traders = opinionTraders[opinionId];
        for (uint256 i = 0; i < traders.length; i++) {
            hasTraded[opinionId][traders[i]] = false;
        }
        delete opinionTraders[opinionId];
        lastCompetitionReset[opinionId] = block.timestamp;
    }

    /**
     * @dev Gets competition status for an opinion (view function for monitoring)
     * @param opinionId The opinion to check
     * @return isCompetitive Whether competition is currently active
     * @return traderCount Number of unique traders competing
     * @return traders Array of trader addresses
     */
    function getCompetitionStatus(uint256 opinionId) external view returns (
        bool isCompetitive, 
        uint256 traderCount, 
        address[] memory traders
    ) {
        isCompetitive = _hasCompetitiveTrading(opinionId);
        traderCount = opinionTraders[opinionId].length;
        traders = opinionTraders[opinionId];
    }

    /**
     * @dev Checks and updates the number of trades per block per user
     */
    function _checkAndUpdateTradesInBlock() internal {
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
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

    /**
     * @dev Prevents trading the same opinion multiple times in one block
     * @param opinionId The ID of the opinion
     */
    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    /**
     * @dev Withdraws tokens in an emergency
     * @param token The token to withdraw
     */
    function emergencyWithdraw(
        address token
    ) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddressNotAllowed();

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));

        // Don't withdraw accumulated fees
        if (token == address(usdcToken)) {
            uint256 totalFees = feeManager.getTotalAccumulatedFees();
            if (balance <= totalFees) revert("Insufficient balance after fees");
            balance -= totalFees;
        }

        tokenContract.safeTransfer(msg.sender, balance);
        emit AdminAction(0, msg.sender, bytes32(0), balance);
    }

    // --- EXTENSION SLOTS FUNCTIONS - IMPOSED SIGNATURES ---

    /**
     * @dev Validates extension key according to imposed regex pattern
     * OBLIGATOIRE: ^[a-zA-Z0-9_]{1,32}$
     * @param key The extension key to validate
     * @return bool True if key is valid
     */
    function isValidExtensionKey(
        string memory key
    ) internal pure returns (bool) {
        bytes memory keyBytes = bytes(key);

        // Length check: 1-32 chars
        if (keyBytes.length == 0 || keyBytes.length > 32) return false;

        // Character validation: alphanumeric + underscore only
        for (uint i = 0; i < keyBytes.length; i++) {
            uint8 char = uint8(keyBytes[i]);
            bool isAlpha = (char >= 65 && char <= 90) ||
                (char >= 97 && char <= 122);
            bool isNumeric = (char >= 48 && char <= 57);
            bool isUnderscore = (char == 95);

            if (!isAlpha && !isNumeric && !isUnderscore) return false;
        }

        return true;
    }

    /**
     * @dev Internal function to track extension keys (gas optimized)
     * OBLIGATOIRE: Tracker les keys pour éviter doublons et permettre enumeration
     * @param opinionId Opinion ID
     * @param key Extension key to track
     */
    function _trackExtensionKey(uint256 opinionId, string memory key) internal {
        string[] storage keys = opinionExtensionKeys[opinionId];

        // Gas optimization: Use keccak256 for comparison to avoid string copying
        bytes32 keyHash = keccak256(bytes(key));

        // Check if key already exists
        for (uint i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return; // Key already tracked, no need to add
            }
        }

        // Add new key
        keys.push(key);
    }

    /**
     * @dev Sets a string extension for an opinion
     * OBLIGATOIRE: Cette signature exacte pour admin functions
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionStringExtension(
        uint256 opinionId,
        string calldata key,
        string calldata value
    ) external onlyRole(ADMIN_ROLE) {
        // 1. Access control FIRST (handled by onlyRole(ADMIN_ROLE))

        // 2. Opinion existence check
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        // 3. Key validation
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();

        // 4. Set extension
        opinionStringExtensions[opinionId][key] = value;

        // 5. Track key (if new)
        _trackExtensionKey(opinionId, key);

        // 6. Emit event
        emit OpinionStringExtensionSet(opinionId, key, value);
    }

    /**
     * @dev Sets a number extension for an opinion
     * OBLIGATOIRE: Cette signature exacte pour admin functions
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionNumberExtension(
        uint256 opinionId,
        string calldata key,
        uint256 value
    ) external onlyRole(ADMIN_ROLE) {
        // 1. Access control FIRST (handled by onlyRole(ADMIN_ROLE))

        // 2. Opinion existence check
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        // 3. Key validation
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();

        // 4. Set extension
        opinionNumberExtensions[opinionId][key] = value;

        // 5. Track key (if new)
        _trackExtensionKey(opinionId, key);

        // 6. Emit event
        emit OpinionNumberExtensionSet(opinionId, key, value);
    }

    /**
     * @dev Sets a bool extension for an opinion
     * OBLIGATOIRE: Cette signature exacte pour admin functions
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionBoolExtension(
        uint256 opinionId,
        string calldata key,
        bool value
    ) external onlyRole(ADMIN_ROLE) {
        // 1. Access control FIRST (handled by onlyRole(ADMIN_ROLE))

        // 2. Opinion existence check
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        // 3. Key validation
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();

        // 4. Set extension
        opinionBoolExtensions[opinionId][key] = value;

        // 5. Track key (if new)
        _trackExtensionKey(opinionId, key);

        // 6. Emit event
        emit OpinionBoolExtensionSet(opinionId, key, value);
    }

    /**
     * @dev Sets an address extension for an opinion
     * OBLIGATOIRE: Cette signature exacte pour admin functions
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionAddressExtension(
        uint256 opinionId,
        string calldata key,
        address value
    ) external onlyRole(ADMIN_ROLE) {
        // 1. Access control FIRST (handled by onlyRole(ADMIN_ROLE))

        // 2. Opinion existence check
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        // 3. Key validation
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();

        // 4. Set extension
        opinionAddressExtensions[opinionId][key] = value;

        // 5. Track key (if new)
        _trackExtensionKey(opinionId, key);

        // 6. Emit event
        emit OpinionAddressExtensionSet(opinionId, key, value);
    }

    /**
     * @dev Gets all extensions for an opinion
     * OBLIGATOIRE: View function signature
     * @param opinionId Opinion ID
     * @return keys Array of extension keys
     * @return stringValues Array of string values (corresponds to keys)
     * @return numberValues Array of number values (corresponds to keys)
     * @return boolValues Array of bool values (corresponds to keys)
     * @return addressValues Array of address values (corresponds to keys)
     */
    function getOpinionExtensions(
        uint256 opinionId
    )
        external
        view
        returns (
            string[] memory keys,
            string[] memory stringValues,
            uint256[] memory numberValues,
            bool[] memory boolValues,
            address[] memory addressValues
        )
    {
        keys = opinionExtensionKeys[opinionId];
        uint256 length = keys.length;

        // Initialize arrays
        stringValues = new string[](length);
        numberValues = new uint256[](length);
        boolValues = new bool[](length);
        addressValues = new address[](length);

        // Fill arrays with values for each key
        for (uint256 i = 0; i < length; i++) {
            string memory key = keys[i];
            stringValues[i] = opinionStringExtensions[opinionId][key];
            numberValues[i] = opinionNumberExtensions[opinionId][key];
            boolValues[i] = opinionBoolExtensions[opinionId][key];
            addressValues[i] = opinionAddressExtensions[opinionId][key];
        }

        return (keys, stringValues, numberValues, boolValues, addressValues);
    }

    // --- OPTIONAL HELPER FUNCTIONS (CREATIVE FREEDOM ZONE) ---

    /**
     * @dev Gets a specific string extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionStringExtension(
        uint256 opinionId,
        string calldata key
    ) external view returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific number extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionNumberExtension(
        uint256 opinionId,
        string calldata key
    ) external view returns (uint256) {
        return opinionNumberExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific bool extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionBoolExtension(
        uint256 opinionId,
        string calldata key
    ) external view returns (bool) {
        return opinionBoolExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific address extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionAddressExtension(
        uint256 opinionId,
        string calldata key
    ) external view returns (address) {
        return opinionAddressExtensions[opinionId][key];
    }

    /**
     * @dev Checks if an opinion has a specific extension key
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return exists True if the key exists for this opinion
     */
    function hasOpinionExtension(
        uint256 opinionId,
        string calldata key
    ) external view returns (bool) {
        string[] memory keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));

        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Gets the number of extensions for an opinion
     * @param opinionId Opinion ID
     * @return count Number of extensions
     */
    function getOpinionExtensionCount(
        uint256 opinionId
    ) external view returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    /**
     * @dev Authorize upgrade (required for UUPS proxy pattern)
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
}
