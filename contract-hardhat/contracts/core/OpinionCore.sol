// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
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
import "./libraries/MevProtection.sol";
import "./libraries/InputValidation.sol";
import "./libraries/MonitoringLibrary.sol";
import "./interfaces/IValidationErrors.sol";
import "./interfaces/IEnhancedMonitoring.sol";

/**
 * @title OpinionCore
 * @dev Core contract for managing opinions, answers, and related functionality
 */
contract OpinionCore is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCore,
    IOpinionMarketEvents,
    IOpinionMarketErrors,
    IValidationErrors,
    IEnhancedMonitoring
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
    uint96 public constant MIN_INITIAL_PRICE = 2_000_000;   // 2 USDC (6 decimals)
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
    mapping(uint256 => mapping(string => string)) public opinionStringExtensions;
    mapping(uint256 => mapping(string => uint256)) public opinionNumberExtensions;  
    mapping(uint256 => mapping(string => bool)) public opinionBoolExtensions;
    mapping(uint256 => mapping(string => address)) public opinionAddressExtensions;

    // OBLIGATOIRE: Tracking des extension keys par opinion
    mapping(uint256 => string[]) public opinionExtensionKeys;

    // Security and rate limiting
    uint256 public maxTradesPerBlock;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;
    
    // 🛡️ Bot detection and anti-bot protection
    mapping(address => PriceCalculator.TraderPattern) private traderPatterns;
    bool public botDetectionEnabled;
    uint256 public botDetectionStartTime;
    
    // 🔥 Enhanced MEV Protection
    mapping(address => MevProtection.MevProfile) private mevProfiles;  // Enhanced MEV protection profiles
    bool public enhancedMevProtectionEnabled;                          // Enhanced MEV protection toggle
    
    // 🔒 Input Validation Hardening
    mapping(uint256 => PriceCalculator.EnhancedActivityData) private activityData;  // Enhanced activity tracking
    bool public validationHardeningEnabled;                           // Validation hardening toggle
    uint256 public emergencyModeTimestamp;                            // Emergency mode activation timestamp
    mapping(bytes32 => uint256) private validationMetrics;            // Validation performance metrics
    
    // 📊 Enhanced Monitoring & Analytics
    mapping(uint256 => MonitoringLibrary.RegimeTracker) private regimeTrackers;    // Market regime tracking per opinion
    mapping(address => uint256) private userLastVolumeCheck;          // Last volume milestone check per user
    mapping(uint8 => uint256) private dailyRevenueTotals;             // Daily revenue totals by source
    bool public enhancedMonitoringEnabled;                            // Enhanced monitoring toggle
    uint256 public lastHealthCheck;                                   // Last operational health check timestamp

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
        categories = ["Crypto", "Politics", "Science", "Technology", "Sports", 
                      "Entertainment", "Culture", "Web", "Social Media", "Other"];
        
        // 📊 Initialize monitoring systems
        enhancedMonitoringEnabled = true;  // Enable monitoring by default
        lastHealthCheck = block.timestamp;
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
     * @param initialPrice The initial price chosen by creator (2-100 USDC)
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
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);

        // 3. Then existing validations - IMPOSED ORDER
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );
        
        // Validate description (optional)
        ValidationLibrary.validateDescription(description);

        // 🚨 CRITICAL: Validate initialPrice range (2-100 USDC inclusive)
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // Check allowance for initialPrice
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

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

        // 🚨 CRITICAL FINANCIAL FLOW: 100% to treasury, NO SPLITS
        usdcToken.safeTransferFrom(
            msg.sender,
            treasury,
            initialPrice
        );

        // 📊 Enhanced Monitoring: Track opinion creation
        if (enhancedMonitoringEnabled) {
            // Track revenue from opinion creation
            dailyRevenueTotals[0] += initialPrice; // opinion_creation source
            
            // Emit revenue analytics
            emit RevenueAnalytics(0, initialPrice, 0, 0, dailyRevenueTotals[0]);
            
            // Check for revenue milestone
            if (MonitoringLibrary.checkRevenueMilestone(dailyRevenueTotals[0])) {
                emit RealTimeAlert(0, 2, bytes32("REVENUE_MILESTONE"), 0, 0);
            }
            
            // Initialize regime tracker for new opinion
            regimeTrackers[opinionId] = MonitoringLibrary.RegimeTracker({
                currentLevel: 0,    // Start as COLD
                previousLevel: 0,
                lastChange: block.timestamp,
                changeCount: 0
            });
            
            // Trigger dashboard update
            emit DashboardUpdateTrigger(0, 0, 0, 2, true); // main dashboard, opinions data, full update, high priority, batchable
        }

        // Emit events
        emit OpinionAction(
            opinionId,
            0,
            question,
            msg.sender,
            initialPrice
        );
        emit OpinionAction(
            opinionId,
            1,
            answer,
            msg.sender,
            initialPrice
        );
    }

    /**
     * @dev Creates a new opinion with IPFS hash and link
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (2-100 USDC)
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
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);

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

        // 🚨 CRITICAL: Validate initialPrice range (2-100 USDC inclusive)
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // Check allowance for initialPrice
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

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

        // 🚨 CRITICAL FINANCIAL FLOW: 100% to treasury, NO SPLITS
        usdcToken.safeTransferFrom(
            msg.sender,
            treasury,
            initialPrice
        );

        // Emit events
        emit OpinionAction(
            opinionId,
            0,
            question,
            msg.sender,
            initialPrice
        );
        emit OpinionAction(
            opinionId,
            1,
            answer,
            msg.sender,
            initialPrice
        );
    }

    /**
     * @dev Submits a new answer to an opinion
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     * @param description The answer description (optional, max 120 chars)
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description
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

        // 📊 Enhanced Monitoring: Track gas usage for price calculation
        MonitoringLibrary.GasTracker memory gasTracker;
        if (enhancedMonitoringEnabled) {
            gasTracker = MonitoringLibrary.startGasTracking(bytes32("submitAnswer"), 150000, 250000);
        }

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
        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;

        // Check if this is a pool-owned answer
        bool answerIsPoolOwned = currentAnswerOwner == address(poolManager);

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
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Calculate and store the next price for future answers
        uint96 oldPrice = opinion.lastPrice;
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        // Token transfers
        usdcToken.safeTransferFrom(msg.sender, address(this), price);

        // 📊 Enhanced Monitoring: Track trading activity and analytics
        if (enhancedMonitoringEnabled) {
            // End gas tracking
            (bool shouldAlertGas, uint256 gasUsed, uint8 severity) = MonitoringLibrary.checkGasUsage(gasTracker);
            if (shouldAlertGas) {
                emit SystemPerformanceAlert(0, gasUsed, gasTracker.warningThreshold, gasTracker.operation, severity);
            }
            
            // Track revenue from trading fees
            dailyRevenueTotals[1] += platformFee; // trading_fees source
            emit RevenueAnalytics(1, platformFee, 0, 0, dailyRevenueTotals[1]);
            
            // Check for price impact analysis
            (bool shouldEmitImpact, int256 impactPercentage) = MonitoringLibrary.shouldEmitPriceImpact(oldPrice, price);
            if (shouldEmitImpact) {
                emit PriceImpactAnalysis(opinionId, oldPrice, price, impactPercentage, opinion.totalVolume, msg.sender);
            }
            
            // Check for market regime changes
            PriceCalculator.ActivityLevel newLevel = PriceCalculator.getActivityLevel(opinionId, activityData);
            MonitoringLibrary.RegimeTracker storage regime = regimeTrackers[opinionId];
            
            uint8 newLevelUint = uint8(newLevel);
            if (newLevelUint != regime.currentLevel) {
                regime.currentLevel = newLevelUint;
                if (MonitoringLibrary.checkRegimeChange(regime)) {
                    emit MarketRegimeChanged(opinionId, regime.previousLevel, newLevelUint, 1, block.timestamp, opinion.totalVolume);
                }
            }
            
            // Update user engagement tracking (simplified)
            (bool shouldTrack, uint8 frequencyScore) = MonitoringLibrary.shouldTrackEngagement(1, 1);
            if (shouldTrack) {
                emit UserEngagementMetrics(msg.sender, 1, frequencyScore, 85, 1, price);
            }
            
            // Trigger dashboard update
            emit DashboardUpdateTrigger(0, 0, 1, 1, true); // main dashboard, opinions data, partial update, normal priority, batchable
        }

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
        usdcToken.safeTransferFrom(msg.sender, address(this), salePrice);

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
        
        emit TreasuryUpdated(treasury, newTreasury, msg.sender, block.timestamp);
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
        
        emit TreasuryUpdated(oldTreasury, treasury, msg.sender, block.timestamp);
    }

    // --- CATEGORIES MANAGEMENT ---
    /**
     * @dev Adds a new category to available categories
     * @param newCategory The new category to add
     * 🚨 IMPOSED SIGNATURE - DO NOT MODIFY
     */
    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        // Check if category already exists - Gas optimized in creative freedom zone
        bytes32 newCategoryHash = keccak256(bytes(newCategory));
        uint256 length = categories.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (keccak256(bytes(categories[i])) == newCategoryHash) {
                revert CategoryAlreadyExists();
            }
        }
        
        categories.push(newCategory);
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
    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory) {
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
        opinion.nextPrice = uint96(
            _calculateNextPrice(opinionId, initialPrice)
        );
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
        // Call library function
        uint256 newPrice = PriceCalculator.calculateNextPrice(
            opinionId,
            lastPrice,
            minimumPrice,
            absoluteMaxPriceChange,
            nonce++,
            priceMetadata,
            priceHistory
        );

        // Update price history
        _updatePriceHistory(opinionId, newPrice);

        return newPrice;
    }

    /**
     * @dev Estimates a next price based on current price
     */
    function _estimateNextPrice(
        uint256 lastPrice
    ) internal pure returns (uint256) {
        // Simple estimation: 30% increase
        return (lastPrice * 130) / 100;
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
    function isValidExtensionKey(string memory key) internal pure returns (bool) {
        bytes memory keyBytes = bytes(key);
        
        // Length check: 1-32 chars
        if (keyBytes.length == 0 || keyBytes.length > 32) return false;
        
        // Character validation: alphanumeric + underscore only
        for (uint i = 0; i < keyBytes.length; i++) {
            uint8 char = uint8(keyBytes[i]);
            bool isAlpha = (char >= 65 && char <= 90) || (char >= 97 && char <= 122);
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
    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
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
    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific number extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256) {
        return opinionNumberExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific bool extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        return opinionBoolExtensions[opinionId][key];
    }

    /**
     * @dev Gets a specific address extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address) {
        return opinionAddressExtensions[opinionId][key];
    }

    /**
     * @dev Checks if an opinion has a specific extension key
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return exists True if the key exists for this opinion
     */
    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool) {
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
    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }
    
    // === 🛡️ ADMIN CONTROLS FOR BOT DETECTION ===
    
    /**
     * @dev Enables or disables bot detection system
     * @param enabled Whether to enable bot detection
     */
    function setBotDetectionEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        botDetectionEnabled = enabled;
        if (enabled && botDetectionStartTime == 0) {
            botDetectionStartTime = block.timestamp;
        }
        emit BotDetectionToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Gets trader bot detection status and statistics
     * @param trader Trader address to query
     * @return penaltyLevel Current penalty level
     * @return flaggedAsBot Whether trader is flagged as bot
     * @return totalTrades Total trades by trader
     * @return successfulTrades Successful trades count
     * @return successRate Success rate percentage
     * @return suspicionLevel Current suspicion level (0-4)
     */
    function getTraderBotInfo(address trader) external view returns (
        PriceCalculator.BotPenaltyLevel penaltyLevel,
        bool flaggedAsBot,
        uint32 totalTrades,
        uint32 successfulTrades,
        uint256 successRate,
        uint8 suspicionLevel
    ) {
        (penaltyLevel, flaggedAsBot) = PriceCalculator.getTraderBotStatus(trader, traderPatterns);
        (totalTrades, successfulTrades, successRate, suspicionLevel) = PriceCalculator.getTraderStats(trader, traderPatterns);
    }
    
    /**
     * @dev Emergency admin function to manually flag/unflag a trader as bot
     * @param trader Trader address
     * @param flagAsBot Whether to flag as bot
     * @param suspicionLevel Manual suspicion level (0-4)
     */
    function adminFlagTrader(
        address trader,
        bool flagAsBot,
        uint8 suspicionLevel
    ) external onlyRole(ADMIN_ROLE) {
        require(suspicionLevel <= 4, "Invalid suspicion level");
        
        PriceCalculator.TraderPattern storage pattern = traderPatterns[trader];
        pattern.flaggedAsBot = flagAsBot;
        pattern.suspicionLevel = suspicionLevel;
        
        emit AdminTraderFlagged(trader, flagAsBot, suspicionLevel, msg.sender);
    }
    
    /**
     * @dev Emergency admin function to reset trader bot detection data
     * @param trader Trader address
     */
    function adminResetTraderData(address trader) external onlyRole(ADMIN_ROLE) {
        delete traderPatterns[trader];
        emit AdminTraderReset(trader, msg.sender);
    }
    
    /**
     * @dev Gets bot detection system status
     * @return enabled Whether bot detection is enabled
     * @return startTime When bot detection was first enabled
     * @return totalFlaggedTraders Count of flagged traders
     */
    function getBotDetectionStatus() external view returns (
        bool enabled,
        uint256 startTime,
        uint256 totalFlaggedTraders
    ) {
        enabled = botDetectionEnabled;
        startTime = botDetectionStartTime;
        // Note: totalFlaggedTraders would require additional tracking mapping
        totalFlaggedTraders = 0; // Placeholder - would need enumeration
    }
    
    /**
     * @dev Internal function to analyze trader patterns during trades
     * @param trader Trader address
     * @param tradeSuccess Whether trade was successful
     * @param tradeValue Value of the trade
     * @return Current penalty level
     */
    function _analyzeTraderPattern(
        address trader,
        bool tradeSuccess,
        uint256 tradeValue
    ) internal returns (PriceCalculator.BotPenaltyLevel) {
        if (!botDetectionEnabled) {
            return PriceCalculator.BotPenaltyLevel.NONE;
        }
        
        return PriceCalculator.analyzeTraderPattern(
            trader,
            tradeSuccess,
            tradeValue,
            traderPatterns
        );
    }
    
    /**
     * @dev Internal function to apply bot penalties to rewards
     * @param trader Trader address
     * @param baseReward Original reward amount
     * @return Adjusted reward after penalties
     */
    function _applyBotPenalties(
        address trader,
        uint256 baseReward
    ) internal returns (uint256) {
        if (!botDetectionEnabled) {
            return baseReward;
        }
        
        (PriceCalculator.BotPenaltyLevel penaltyLevel,) = PriceCalculator.getTraderBotStatus(trader, traderPatterns);
        return PriceCalculator.applyBotPenalties(trader, penaltyLevel, baseReward);
    }
    
    // === 🔥 ENHANCED MEV PROTECTION CONTROLS ===
    
    /**
     * @dev Enables or disables enhanced MEV protection system
     * @param enabled Whether to enable enhanced MEV protection
     */
    function setEnhancedMevProtectionEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        enhancedMevProtectionEnabled = enabled;
        emit EnhancedMevProtectionToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Gets user's MEV protection profile and risk assessment
     * @param user User address to query
     * @return profile Complete MEV profile data
     */
    function getUserMevProfile(address user) external view returns (MevProtection.MevProfile memory profile) {
        return MevProtection.getMevProfile(user, mevProfiles);
    }
    
    /**
     * @dev Checks if user should be blocked from trading due to MEV risk
     * @param user User address
     * @return blocked Whether user is currently blocked
     * @return reason Human-readable reason for blocking
     */
    function checkMevTradeBlocking(address user) external view returns (bool blocked, string memory reason) {
        if (!enhancedMevProtectionEnabled) {
            return (false, "Enhanced MEV protection disabled");
        }
        
        blocked = MevProtection.shouldBlockTrading(user, mevProfiles);
        
        if (blocked) {
            MevProtection.MevProfile memory profile = MevProtection.getMevProfile(user, mevProfiles);
            if (profile.riskLevel >= uint8(MevProtection.MevRiskLevel.BLOCKED)) {
                reason = "User blocked due to critical MEV risk";
            } else if (MevProtection.isInMevCooldown(user, mevProfiles)) {
                reason = "User in MEV cooldown period";
            } else {
                reason = "MEV trade limit exceeded for current block";
            }
        } else {
            reason = "Trading allowed";
        }
    }
    
    /**
     * @dev Calculates MEV penalty for a trade
     * @param user User address
     * @param tradeValue Trade value
     * @return penaltyMultiplier Penalty multiplier (100 = no penalty, 150 = 50% penalty)
     */
    function calculateMevPenaltyMultiplier(address user, uint256 tradeValue) external view returns (uint256 penaltyMultiplier) {
        if (!enhancedMevProtectionEnabled) {
            return 100; // No penalty if protection disabled
        }
        
        return MevProtection.calculateMevPenalty(user, tradeValue, mevProfiles);
    }
    
    /**
     * @dev Admin function to manually adjust user's MEV risk level
     * @param user User address
     * @param newRiskLevel New risk level (0-5)
     * @param reason Reason for manual adjustment
     */
    function adminSetMevRiskLevel(
        address user,
        uint8 newRiskLevel,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        require(newRiskLevel <= uint8(MevProtection.MevRiskLevel.BLOCKED), "Invalid risk level");
        
        MevProtection.MevProfile storage profile = mevProfiles[user];
        uint8 oldLevel = profile.riskLevel;
        profile.riskLevel = newRiskLevel;
        
        emit AdminMevRiskAdjusted(user, oldLevel, newRiskLevel, reason, msg.sender);
    }
    
    /**
     * @dev Admin function to reset user's MEV protection data
     * @param user User address
     */
    function adminResetMevProfile(address user) external onlyRole(ADMIN_ROLE) {
        delete mevProfiles[user];
        emit AdminMevProfileReset(user, msg.sender);
    }
    
    /**
     * @dev Gets MEV protection system statistics
     * @return enabled Whether enhanced MEV protection is enabled
     * @return totalHighRiskUsers Count of users with HIGH+ risk level
     * @return totalBlockedUsers Count of currently blocked users
     */
    function getMevProtectionStats() external view returns (
        bool enabled,
        uint256 totalHighRiskUsers,
        uint256 totalBlockedUsers
    ) {
        enabled = enhancedMevProtectionEnabled;
        // Note: These counts would require additional enumeration tracking for efficiency
        totalHighRiskUsers = 0; // Placeholder - would need enumeration
        totalBlockedUsers = 0; // Placeholder - would need enumeration
    }
    
    /**
     * @dev Internal function to analyze MEV risk during trades
     * @param user User address
     * @param tradeValue Trade value
     * @param opinionId Opinion being traded
     * @return Current MEV risk level
     */
    function _analyzeMevRisk(
        address user,
        uint256 tradeValue,
        uint256 opinionId
    ) internal returns (MevProtection.MevRiskLevel) {
        if (!enhancedMevProtectionEnabled) {
            return MevProtection.MevRiskLevel.NONE;
        }
        
        return MevProtection.analyzeMevRisk(user, tradeValue, opinionId, mevProfiles);
    }
    
    /**
     * @dev Internal function to update MEV profile after successful trade
     * @param user User address
     * @param opinionId Opinion traded
     * @param tradeValue Trade value
     */
    function _updateMevProfile(
        address user,
        uint256 opinionId,
        uint256 tradeValue
    ) internal {
        if (!enhancedMevProtectionEnabled) {
            return;
        }
        
        MevProtection.updateMevProfile(user, opinionId, tradeValue, mevProfiles);
    }
    
    /**
     * @dev Internal function to apply MEV penalties to amounts
     * @param user User address
     * @param baseAmount Original amount
     * @param tradeValue Trade value
     * @return Adjusted amount after MEV penalties
     */
    function _applyMevPenalties(
        address user,
        uint256 baseAmount,
        uint256 tradeValue
    ) internal view returns (uint256) {
        if (!enhancedMevProtectionEnabled) {
            return baseAmount;
        }
        
        uint256 penaltyMultiplier = MevProtection.calculateMevPenalty(user, tradeValue, mevProfiles);
        return (baseAmount * 100) / penaltyMultiplier; // Inverse calculation for penalty
    }
    
    // === 🔒 INPUT VALIDATION HARDENING CONTROLS ===
    
    /**
     * @dev Enables or disables validation hardening system
     * @param enabled Whether to enable validation hardening
     */
    function setValidationHardeningEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        validationHardeningEnabled = enabled;
        emit ValidationHardeningToggled(enabled, msg.sender);
    }
    
    /**
     * @dev Enhanced opinion creation with comprehensive validation
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description
     * @param initialPrice The initial price chosen by creator
     * @param opinionCategories Categories for the opinion
     */
    function createOpinionHardened(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external nonReentrant whenNotPaused {
        uint256 startGas = gasleft();
        
        if (validationHardeningEnabled) {
            _validateCreateOpinionInputs(question, answer, description, initialPrice, opinionCategories);
        }
        
        // Call original creation logic (reuse existing function)
        _executeOpinionCreation(question, answer, description, initialPrice, opinionCategories);
        
        if (validationHardeningEnabled) {
            _recordValidationMetrics("createOpinion", startGas);
        }
    }
    
    /**
     * @dev Enhanced price calculation with validation hardening
     * @param opinionId Opinion identifier
     * @param lastPrice Previous price
     * @return New calculated price
     */
    function calculateNextPriceHardened(
        uint256 opinionId,
        uint256 lastPrice
    ) external returns (uint256) {
        uint256 startGas = gasleft();
        
        if (validationHardeningEnabled) {
            _validatePriceCalculationInputs(opinionId, lastPrice, msg.sender);
        }
        
        // Check if emergency mode is active
        if (emergencyModeTimestamp > 0 && block.timestamp - emergencyModeTimestamp < 3600) {
            revert SystemInEmergencyMode("Price calculation restricted", emergencyModeTimestamp + 3600);
        }
        
        // Use enhanced price calculation with activity-based triggers
        uint256 newPrice;
        if (validationHardeningEnabled) {
            newPrice = PriceCalculator.calculateNextPriceLight(
                opinionId,
                msg.sender,
                lastPrice,
                minimumPrice,
                absoluteMaxPriceChange,
                nonce++,
                priceMetadata,
                priceHistory,
                activityData
            );
        } else {
            // Fallback to standard calculation
            newPrice = _calculateNextPrice(opinionId, lastPrice);
        }
        
        if (validationHardeningEnabled) {
            _validateCalculatedPrice(opinionId, lastPrice, newPrice);
            _recordValidationMetrics("calculatePrice", startGas);
        }
        
        return newPrice;
    }
    
    /**
     * @dev Gets opinion activity level with validation
     * @param opinionId Opinion identifier
     * @return Activity level (COLD/WARM/HOT)
     */
    function getOpinionActivityLevel(uint256 opinionId) external view returns (PriceCalculator.ActivityLevel) {
        if (validationHardeningEnabled) {
            InputValidation.validateOpinionState(
                opinionId,
                _opinionExists(opinionId),
                opinions[opinionId].isActive,
                opinions[opinionId].lastPrice,
                opinions[opinionId].currentAnswerOwner
            );
        }
        
        return PriceCalculator.getActivityLevel(opinionId, activityData);
    }
    
    /**
     * @dev Gets detailed activity statistics with validation
     * @param opinionId Opinion identifier
     * @return eligibleTransactions Number of eligible transactions
     * @return uniqueUsers Number of unique users
     * @return totalUsers Total user count
     * @return lastReset Last reset timestamp
     * @return activityLevel Current activity level
     * @return isDataValid Whether data passed validation
     */
    function getActivityStatistics(uint256 opinionId) external view returns (
        uint32 eligibleTransactions,
        uint32 uniqueUsers,
        uint32 totalUsers,
        uint256 lastReset,
        PriceCalculator.ActivityLevel activityLevel,
        bool isDataValid
    ) {
        if (validationHardeningEnabled) {
            InputValidation.validateOpinionState(
                opinionId,
                _opinionExists(opinionId),
                opinions[opinionId].isActive,
                opinions[opinionId].lastPrice,
                opinions[opinionId].currentAnswerOwner
            );
        }
        
        (eligibleTransactions, uniqueUsers, totalUsers, lastReset, activityLevel) = 
            PriceCalculator.getActivityStats(opinionId, activityData);
        
        // Validate data consistency
        isDataValid = true;
        if (validationHardeningEnabled) {
            try InputValidation.validateActivityData(opinionId, eligibleTransactions, uniqueUsers, totalUsers, lastReset) {
                isDataValid = true;
            } catch {
                isDataValid = false;
            }
        }
    }
    
    /**
     * @dev Emergency function to activate system protection mode
     * @param reason Reason for emergency activation
     */
    function activateEmergencyMode(string calldata reason) external onlyRole(ADMIN_ROLE) {
        emergencyModeTimestamp = block.timestamp;
        emit EmergencyShutdownTriggered(reason, 50, "Admin review required");
    }
    
    /**
     * @dev Deactivates emergency protection mode
     */
    function deactivateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        emergencyModeTimestamp = 0;
        emit SystemRecovered("Emergency mode deactivated", msg.sender);
    }
    
    /**
     * @dev Gets validation system metrics
     * @return enabled Whether validation hardening is enabled
     * @return emergencyActive Whether emergency mode is active
     * @return totalValidations Total validation operations performed
     * @return averageGasCost Average gas cost for validation
     */
    function getValidationMetrics() external view returns (
        bool enabled,
        bool emergencyActive,
        uint256 totalValidations,
        uint256 averageGasCost
    ) {
        enabled = validationHardeningEnabled;
        emergencyActive = emergencyModeTimestamp > 0 && (block.timestamp - emergencyModeTimestamp < 3600);
        totalValidations = validationMetrics[keccak256("totalValidations")];
        
        uint256 totalGas = validationMetrics[keccak256("totalGasCost")];
        averageGasCost = totalValidations > 0 ? totalGas / totalValidations : 0;
    }
    
    /**
     * @dev Admin function to manually validate and fix opinion state
     * @param opinionId Opinion to validate and fix
     * @return wasCorrupted Whether opinion state was corrupted
     * @return fixedIssues Array of issues that were fixed
     */
    function adminValidateAndFixOpinion(uint256 opinionId) external onlyRole(ADMIN_ROLE) returns (
        bool wasCorrupted,
        string[] memory fixedIssues
    ) {
        string[] memory issues = new string[](5);
        uint256 issueCount = 0;
        wasCorrupted = false;
        
        // Validate and fix basic opinion state
        if (!_opinionExists(opinionId)) {
            issues[issueCount++] = "Opinion does not exist";
            wasCorrupted = true;
        }
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        
        // Validate and fix price bounds
        if (opinion.lastPrice < minimumPrice) {
            opinion.lastPrice = uint96(minimumPrice);
            issues[issueCount++] = "Fixed price below minimum";
            wasCorrupted = true;
        }
        
        if (opinion.lastPrice > 1000000e6) { // $1M max
            opinion.lastPrice = 1000000e6;
            issues[issueCount++] = "Fixed price above maximum";
            wasCorrupted = true;
        }
        
        // Validate and fix owner address
        if (opinion.currentAnswerOwner == address(0)) {
            opinion.currentAnswerOwner = opinion.creator;
            issues[issueCount++] = "Fixed zero owner address";
            wasCorrupted = true;
        }
        
        // Validate and fix activity data
        PriceCalculator.EnhancedActivityData storage data = activityData[opinionId];
        if (data.uniqueUsers > data.eligibleTransactions) {
            data.uniqueUsers = data.eligibleTransactions;
            issues[issueCount++] = "Fixed activity data inconsistency";
            wasCorrupted = true;
        }
        
        // Create fixed issues array with correct size
        fixedIssues = new string[](issueCount);
        for (uint256 i = 0; i < issueCount; i++) {
            fixedIssues[i] = issues[i];
        }
        
        if (wasCorrupted) {
            emit DataCorruptionDetected("opinion_state", 25, "Manual admin fix applied");
        }
    }
    
    // === INTERNAL VALIDATION FUNCTIONS ===
    
    /**
     * @dev Validates opinion creation inputs
     */
    function _validateCreateOpinionInputs(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal view {
        // Validate strings
        InputValidation.validateString(question, MAX_QUESTION_LENGTH, false, "question");
        InputValidation.validateString(answer, MAX_ANSWER_LENGTH, false, "answer");
        InputValidation.validateString(description, 500, true, "description");
        
        // Validate price
        InputValidation.validatePrice(initialPrice, MIN_INITIAL_PRICE, MAX_INITIAL_PRICE);
        
        // Validate categories array
        InputValidation.validateArray(opinionCategories.length, 1, 3, "opinionCategories");
        
        // Validate user
        InputValidation.validateAddress(msg.sender, "creator");
        
        // Check user limits
        InputValidation.validateUserLimits(msg.sender, 0, 10, "daily_opinion_creation");
    }
    
    /**
     * @dev Validates price calculation inputs
     */
    function _validatePriceCalculationInputs(
        uint256 opinionId,
        uint256 lastPrice,
        address user
    ) internal view {
        // Validate opinion exists and is active
        InputValidation.validateOpinionState(
            opinionId,
            _opinionExists(opinionId),
            opinions[opinionId].isActive,
            lastPrice,
            opinions[opinionId].currentAnswerOwner
        );
        
        // Validate price bounds
        InputValidation.validatePrice(lastPrice, minimumPrice, 1000000e6);
        
        // Validate user
        InputValidation.validateAddress(user, "trader");
        
        // Check if in emergency mode
        if (emergencyModeTimestamp > 0 && block.timestamp - emergencyModeTimestamp < 3600) {
            revert SystemInEmergencyMode("Price calculation restricted", emergencyModeTimestamp + 3600);
        }
    }
    
    /**
     * @dev Validates calculated price result
     */
    function _validateCalculatedPrice(
        uint256 opinionId,
        uint256 lastPrice,
        uint256 newPrice
    ) internal view {
        // Validate new price bounds
        InputValidation.validatePrice(newPrice, minimumPrice, 1000000e6);
        
        // Validate price movement is reasonable
        if (lastPrice > 0) {
            int256 movement;
            if (newPrice > lastPrice) {
                movement = int256(((newPrice - lastPrice) * 100) / lastPrice);
            } else {
                movement = -int256(((lastPrice - newPrice) * 100) / lastPrice);
            }
            
            // Check against absolute maximum
            if (movement > int256(absoluteMaxPriceChange) || movement < -int256(absoluteMaxPriceChange)) {
                revert PriceMovementTooExtreme(movement, int256(absoluteMaxPriceChange));
            }
        }
    }
    
    /**
     * @dev Records validation performance metrics
     */
    function _recordValidationMetrics(string memory operation, uint256 startGas) internal {
        uint256 gasUsed = startGas - gasleft();
        bytes32 totalKey = keccak256("totalValidations");
        bytes32 gasKey = keccak256("totalGasCost");
        
        validationMetrics[totalKey]++;
        validationMetrics[gasKey] += gasUsed;
        
        // Emit gas usage warning if excessive
        if (gasUsed > 50000) {
            emit ValidationWarning(operation, gasUsed, "High gas usage detected");
        }
    }
    
    /**
     * @dev Executes opinion creation (extracted for reuse)
     */
    function _executeOpinionCreation(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal {
        // Access control check
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Categories validation
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);

        // Standard validations
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );
        
        ValidationLibrary.validateDescription(description);

        // Price validation
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            "",
            "",
            initialPrice,
            opinionCategories
        );

        // Transfer payment
        usdcToken.safeTransferFrom(
            msg.sender,
            treasury,
            initialPrice
        );

        // Emit events
        emit OpinionAction(
            opinionId,
            0,
            question,
            msg.sender,
            initialPrice
        );
    }
    
    /**
     * @dev Checks if opinion exists
     */
    function _opinionExists(uint256 opinionId) internal view returns (bool) {
        return opinionId > 0 && opinionId < nextOpinionId && opinions[opinionId].creator != address(0);
    }
    
    // === 📊 ENHANCED MONITORING ADMIN CONTROLS ===
    
    /**
     * @dev Enables or disables enhanced monitoring system
     * @param enabled Whether to enable enhanced monitoring
     */
    function setEnhancedMonitoringEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        enhancedMonitoringEnabled = enabled;
        
        if (enabled) {
            // Emit operational health check when monitoring is enabled
            emit OperationalHealth(95, 1, 0, 30, 50, block.timestamp); // Good initial health
        }
        
        emit DashboardUpdateTrigger(1, 0, 3, 2, false); // security dashboard, full update, operational data, high priority, not batchable
    }
    
    /**
     * @dev Performs manual operational health check
     * @return healthScore Overall system health score
     * @return activeUsers Number of recent active users
     * @return processingLoad Current processing load estimate
     */
    function performHealthCheck() external onlyRole(ADMIN_ROLE) returns (uint8 healthScore, uint32 activeUsers, uint8 processingLoad) {
        // Calculate health metrics (simplified implementation)
        healthScore = 90; // Base health score
        
        // Check various system metrics
        if (nextOpinionId > 1000) healthScore += 5; // Good adoption
        if (enhancedMevProtectionEnabled && validationHardeningEnabled) healthScore += 5; // Security systems active
        
        // Estimate active users (simplified)
        activeUsers = uint32(nextOpinionId / 10); // Rough estimate
        
        // Estimate processing load based on recent activity
        processingLoad = 25; // Low load assumption
        
        // Emit health status
        if (enhancedMonitoringEnabled) {
            uint256 componentStatus = healthScore >= 80 ? 7 : 3; // Simple component status
            emit OperationalHealth(healthScore, componentStatus, activeUsers, processingLoad, 25, block.timestamp);
            lastHealthCheck = block.timestamp;
        }
        
        return (healthScore, activeUsers, processingLoad);
    }
    
    /**
     * @dev Gets enhanced monitoring statistics
     * @return enabled Whether enhanced monitoring is enabled
     * @return totalOpinions Total number of opinions created
     * @return todayRevenue Today's total revenue across all sources
     * @return lastHealthTime Last health check timestamp
     */
    function getMonitoringStats() external view returns (
        bool enabled,
        uint256 totalOpinions,
        uint256 todayRevenue,
        uint256 lastHealthTime
    ) {
        enabled = enhancedMonitoringEnabled;
        totalOpinions = nextOpinionId - 1;
        
        // Sum today's revenue across all sources
        todayRevenue = dailyRevenueTotals[0] + dailyRevenueTotals[1] + dailyRevenueTotals[2] + dailyRevenueTotals[3];
        
        lastHealthTime = lastHealthCheck;
    }
    
    /**
     * @dev Gets market regime information for an opinion
     * @param opinionId Opinion identifier
     * @return currentLevel Current activity level (0=COLD, 1=WARM, 2=HOT)
     * @return lastChange Last regime change timestamp
     * @return changeCount Number of regime changes today
     */
    function getMarketRegimeInfo(uint256 opinionId) external view returns (
        uint8 currentLevel,
        uint256 lastChange,
        uint32 changeCount
    ) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        
        MonitoringLibrary.RegimeTracker storage regime = regimeTrackers[opinionId];
        return (regime.currentLevel, regime.lastChange, regime.changeCount);
    }
    
    /**
     * @dev Emergency function to trigger system alert
     * @param alertLevel Alert level (0=info, 1=warning, 2=urgent, 3=critical)
     * @param category Alert category (0=security, 1=performance, 2=financial, 3=operational)
     * @param message Alert message (32 bytes)
     */
    function adminTriggerAlert(
        uint8 alertLevel,
        uint8 category,
        bytes32 message
    ) external onlyRole(ADMIN_ROLE) {
        require(alertLevel <= 3, "Invalid alert level");
        require(category <= 3, "Invalid alert category");
        
        if (enhancedMonitoringEnabled) {
            emit SecurityIncident(category, alertLevel, 1, 0, message);
            
            // Also emit real-time alert for high severity
            if (alertLevel >= 2) {
                emit RealTimeAlert(alertLevel, category, message, alertLevel == 3 ? 2 : 1, 0);
            }
        }
    }
    
    /**
     * @dev Resets daily revenue tracking (should be called daily by automation)
     */
    function resetDailyRevenue() external onlyRole(ADMIN_ROLE) {
        delete dailyRevenueTotals[0]; // opinion_creation
        delete dailyRevenueTotals[1]; // trading_fees
        delete dailyRevenueTotals[2]; // pool_fees
        delete dailyRevenueTotals[3]; // question_sales
        
        if (enhancedMonitoringEnabled) {
            emit DashboardUpdateTrigger(3, 0, 2, 1, false); // financial dashboard, full update, fees data, normal priority
        }
    }
    
    /**
     * @dev Batch trigger dashboard updates for multiple data categories
     * @param dashboardType Dashboard to update
     * @param dataCategories Array of data categories that changed
     * @param priority Update priority
     */
    function batchTriggerDashboardUpdates(
        uint8 dashboardType,
        uint8[] calldata dataCategories,
        uint8 priority
    ) external onlyRole(ADMIN_ROLE) {
        if (!enhancedMonitoringEnabled) return;
        
        bytes32 batchId = keccak256(abi.encodePacked(block.timestamp, msg.sender, dataCategories.length));
        
        // Emit batch summary for efficient processing
        emit BatchOperationSummary(
            dashboardType,
            uint32(dataCategories.length),
            uint32(dataCategories.length), // All successful
            0, // No value for dashboard updates
            5000, // Estimated gas per update
            batchId
        );
        
        // Trigger individual updates
        for (uint256 i = 0; i < dataCategories.length; i++) {
            emit DashboardUpdateTrigger(dashboardType, 1, dataCategories[i], priority, true);
        }
    }
}
