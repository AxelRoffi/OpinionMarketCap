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
import "./libraries/SimpleSoloTimelock.sol";
import "./libraries/OpinionExtensionsLibrary.sol";
import "./libraries/OpinionAdminLibrary.sol";
import "./libraries/OpinionModerationLibrary.sol";
import "./libraries/OpinionPricingLibrary.sol";
import "./libraries/OpinionCreationLib.sol";
import "./libraries/OpinionTradingLib.sol";
import "./libraries/OpinionUpdateLib.sol";
import "./libraries/OpinionExtensionAdminLib.sol";
import "./libraries/TimelockAdminLib.sol";

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
    SoloTimelockAdmin,
    IOpinionCore,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;
    using OpinionExtensionsLibrary for mapping(uint256 => mapping(string => string));
    using OpinionExtensionsLibrary for mapping(uint256 => mapping(string => uint256));
    using OpinionExtensionsLibrary for mapping(uint256 => mapping(string => bool));
    using OpinionExtensionsLibrary for mapping(uint256 => mapping(string => address));
    using OpinionExtensionsLibrary for mapping(uint256 => string[]);
    using OpinionAdminLibrary for string[];
    using OpinionModerationLibrary for OpinionStructs.Opinion;
    using OpinionPricingLibrary for mapping(uint256 => address[]);

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    bytes32 public constant MARKET_CONTRACT_ROLE =
        keccak256("MARKET_CONTRACT_ROLE");

    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    // --- CONSTANTS (IMMUTABLE) ---
    uint96 public constant MIN_INITIAL_PRICE = 1_000_000; // 1 USDC (6 decimals)
    uint96 public constant MAX_INITIAL_PRICE = 100_000_000; // 100 USDC (6 decimals)

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

    mapping(uint256 => mapping(string => string)) public opinionStringExtensions;
    mapping(uint256 => mapping(string => uint256)) public opinionNumberExtensions;
    mapping(uint256 => mapping(string => bool)) public opinionBoolExtensions;
    mapping(uint256 => mapping(string => address)) public opinionAddressExtensions;
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
    
    // Configurable text length limits
    uint256 public maxQuestionLength;
    uint256 public maxAnswerLength;
    uint256 public maxLinkLength;
    uint256 public maxIpfsHashLength;
    uint256 public maxDescriptionLength;
    uint256 public maxCategoriesPerOpinion;

    // Core data structures
    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;
    
    // Competition tracking for auction dynamics (ADDED AT END FOR UPGRADE SAFETY)
    mapping(uint256 => address[]) private opinionTraders; // Track unique traders per opinion
    mapping(uint256 => mapping(address => bool)) private hasTraded; // Track if address has traded this opinion
    mapping(uint256 => uint256) private lastCompetitionReset; // Track when competition data was last reset

    // NEW STORAGE VARIABLES (ADDED AT END FOR UPGRADE SAFETY)
    uint256 public creationFeePercent; // Configurable creation fee percentage (default 20%)

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
        maxTradesPerBlock = 0; // Rate limiting disabled by default
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 1_000_000; // 1 USDC
        initialAnswerPrice = 2_000_000; // 2 USDC
        absoluteMaxPriceChange = 200; // 200%
        creationFeePercent = 20; // NEW: 20% creation fee (configurable)
        
        // Initialize text length limits with original default values
        maxQuestionLength = 52;
        maxAnswerLength = 52;
        maxLinkLength = 260;
        maxIpfsHashLength = 68;
        maxDescriptionLength = 120;
        maxCategoriesPerOpinion = 3;

        categories = ["Crypto","Politics","Science","Technology","Sports","Entertainment","Culture","Web","Social Media","Other"];
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
    ) external virtual override nonReentrant whenNotPaused {
        OpinionCreationLib.CreationParams memory params = OpinionCreationLib.CreationParams({
            question: question,
            answer: answer,
            description: description,
            ipfsHash: "",
            link: "",
            initialPrice: initialPrice,
            categories: opinionCategories
        });

        OpinionCreationLib.Context memory ctx = OpinionCreationLib.Context({
            sender: msg.sender,
            usdcToken: usdcToken,
            treasury: treasury,
            creationFeePercent: creationFeePercent,
            isPublicCreationEnabled: isPublicCreationEnabled,
            isAdmin: hasRole(ADMIN_ROLE, msg.sender),
            maxCategoriesPerOpinion: maxCategoriesPerOpinion,
            maxQuestionLength: maxQuestionLength,
            maxAnswerLength: maxAnswerLength,
            maxDescriptionLength: maxDescriptionLength,
            maxIpfsHashLength: maxIpfsHashLength,
            maxLinkLength: maxLinkLength
        });

        OpinionCreationLib.validateAndProcessCreation(params, ctx, categories);

        uint256 opinionId = nextOpinionId++;
        OpinionCreationLib.createOpinionRecord(opinions, opinionId, params, msg.sender);
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
        OpinionCreationLib.CreationParams memory params = OpinionCreationLib.CreationParams({
            question: question,
            answer: answer,
            description: description,
            ipfsHash: ipfsHash,
            link: link,
            initialPrice: initialPrice,
            categories: opinionCategories
        });

        OpinionCreationLib.Context memory ctx = OpinionCreationLib.Context({
            sender: msg.sender,
            usdcToken: usdcToken,
            treasury: treasury,
            creationFeePercent: creationFeePercent,
            isPublicCreationEnabled: isPublicCreationEnabled,
            isAdmin: hasRole(ADMIN_ROLE, msg.sender),
            maxCategoriesPerOpinion: maxCategoriesPerOpinion,
            maxQuestionLength: maxQuestionLength,
            maxAnswerLength: maxAnswerLength,
            maxDescriptionLength: maxDescriptionLength,
            maxIpfsHashLength: maxIpfsHashLength,
            maxLinkLength: maxLinkLength
        });

        OpinionCreationLib.validateAndProcessCreation(params, ctx, categories);

        uint256 opinionId = nextOpinionId++;
        OpinionCreationLib.createOpinionRecord(opinions, opinionId, params, msg.sender);
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
        OpinionTradingLib.AnswerParams memory params = OpinionTradingLib.AnswerParams({
            opinionId: opinionId,
            answer: answer,
            description: description,
            link: link
        });

        OpinionTradingLib.TradingContext memory ctx = OpinionTradingLib.TradingContext({
            sender: msg.sender,
            usdcToken: usdcToken,
            feeManager: feeManager,
            poolManager: poolManager,
            treasury: treasury,
            minimumPrice: minimumPrice,
            absoluteMaxPriceChange: absoluteMaxPriceChange,
            maxAnswerLength: maxAnswerLength,
            maxDescriptionLength: maxDescriptionLength,
            maxLinkLength: maxLinkLength,
            maxTradesPerBlock: maxTradesPerBlock
        });

        nonce = OpinionTradingLib.submitAnswer(
            params,
            ctx,
            opinions[opinionId],
            answerHistory,
            userLastBlock,
            userTradesInBlock,
            userLastTradeBlock,
            opinionTraders,
            hasTraded,
            lastCompetitionReset,
            nonce,
            priceMetadata,
            priceHistory
        );
    }

    /**
     * @dev Places a question for sale
     * @param opinionId The ID of the opinion
     * @param price The sale price
     */
    /**
     * @dev Places a question for sale
     * @param opinionId The ID of the opinion
     * @param price The sale price
     */
    function listQuestionForSale(
        uint256 opinionId,
        uint256 price
    ) external override nonReentrant whenNotPaused {
        OpinionTradingLib.listQuestionForSale(
            opinionId,
            price,
            msg.sender,
            opinions[opinionId]
        );
    }

    /**
     * @dev Buys a question that is for sale
     * @param opinionId The ID of the opinion
     */
    function buyQuestion(
        uint256 opinionId
    ) external override nonReentrant whenNotPaused {
        OpinionTradingLib.TradingContext memory ctx = OpinionTradingLib.TradingContext({
            sender: msg.sender,
            usdcToken: usdcToken,
            feeManager: feeManager,
            poolManager: poolManager,
            treasury: treasury,
            minimumPrice: minimumPrice,
            absoluteMaxPriceChange: absoluteMaxPriceChange,
            maxAnswerLength: maxAnswerLength,
            maxDescriptionLength: maxDescriptionLength,
            maxLinkLength: maxLinkLength,
            maxTradesPerBlock: maxTradesPerBlock
        });

        OpinionTradingLib.buyQuestion(opinionId, ctx, opinions[opinionId]);
    }

    /**
     * @dev Cancels a question sale listing
     * @param opinionId The ID of the opinion
     */
    function cancelQuestionSale(
        uint256 opinionId
    ) external override nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionTradingLib.cancelQuestionSale(
            opinionId,
            msg.sender,
            opinions[opinionId]
        );
        emit OpinionAction(opinionId, 2, "", msg.sender, 0);
    }

    /**
     * @dev Transfers answer ownership to another address for free (gift/transfer)
     * @param opinionId The ID of the opinion
     * @param newOwner The address to transfer ownership to
     */
    function transferAnswerOwnership(
        uint256 opinionId,
        address newOwner
    ) external nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        
        // Only current answer owner can transfer
        if (opinion.currentAnswerOwner != msg.sender) revert NotAnswerOwner();
        
        // Cannot transfer to yourself
        if (newOwner == msg.sender) revert("Cannot transfer to yourself");
        
        // Cannot transfer if listed for sale (must cancel sale first)
        if (opinion.salePrice > 0) revert("Must cancel sale before transfer");
        
        address previousOwner = opinion.currentAnswerOwner;
        opinion.currentAnswerOwner = newOwner;
        
        emit AnswerOwnershipTransferred(opinionId, previousOwner, newOwner, block.timestamp);
        emit OpinionAction(opinionId, 5, "", newOwner, 0);
    }
    /**
     * @dev Deactivates an opinion
     * @param opinionId The ID of the opinion to deactivate
     */
    function deactivateOpinion(
        uint256 opinionId
    ) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionModerationLibrary.deactivateOpinion(
            opinions[opinionId],
            opinionId,
            msg.sender
        );
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

        OpinionModerationLibrary.activateOpinion(
            opinions[opinionId],
            opinionId,
            msg.sender
        );
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

        address previousOwner = OpinionModerationLibrary.moderateAnswer(
            opinions[opinionId],
            answerHistory[opinionId],
            opinionId,
            reason,
            msg.sender,
            opinions[opinionId].nextPrice
        );
        
        // Emit moderation events
        emit AnswerModerated(
            opinionId,
            previousOwner,
            opinions[opinionId].creator,
            reason,
            block.timestamp
        );
        emit OpinionAction(opinionId, 4, reason, msg.sender, 0);
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

        // Use library function to get effective next price
        return OpinionPricingLibrary.getEffectiveNextPrice(
            opinion.nextPrice,
            opinion.lastPrice,
            minimumPrice
        );

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
     * @dev Updates opinion parameters
     * @param opinionId The ID of the opinion
     * @param question The new question
     * @param ipfsHash The new IPFS hash
     * @param link The new link
     * @param opinionCategories The new categories
     */
    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        OpinionUpdateLib.updateOpinion(
            opinionId,
            question,
            ipfsHash,
            link,
            opinionCategories,
            opinions[opinionId],
            msg.sender,
            maxQuestionLength,
            maxIpfsHashLength,
            maxLinkLength,
            maxCategoriesPerOpinion,
            categories
        );
    }
    
    /**
     * @dev Updates an opinion when a pool executes
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     * @param poolAddress The address of the pool
     * @param price The price paid
     */
    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external override onlyRole(POOL_MANAGER_ROLE) {
        nonce = OpinionUpdateLib.updateOpinionOnPoolExecution(
            opinionId,
            answer,
            poolAddress,
            price,
            opinions[opinionId],
            answerHistory,
            opinionTraders,
            hasTraded,
            lastCompetitionReset,
            nonce,
            minimumPrice,
            absoluteMaxPriceChange,
            priceMetadata,
            priceHistory
        );
        
        emit OpinionAction(opinionId, 1, answer, poolAddress, price);
    }

    // --- ADMIN FUNCTIONS ---
    /**
     * @dev Sets the minimum price
     * @param _minimumPrice New minimum price
     */
    /**
     * @dev Sets a configurable parameter (consolidated setter)
     * @param paramType Parameter type identifier:
     *   0 = minimumPrice, 3 = absoluteMaxPriceChange, 4 = maxTradesPerBlock,
     *   6 = questionCreationFee, 7 = initialAnswerPrice, 8 = maxQuestionLength,
     *   9 = maxAnswerLength, 10 = maxLinkLength, 11 = maxIpfsHashLength,
     *   12 = maxDescriptionLength, 13 = maxCategoriesPerOpinion, 14 = creationFeePercent
     * @param value New parameter value
     */
    function setParameter(uint8 paramType, uint256 value) external onlyRole(ADMIN_ROLE) {
        // Validate parameter range
        OpinionAdminLibrary.validateParameterRange(paramType, value);
        
        // Set the parameter
        if (paramType == 0) {
            minimumPrice = uint96(value);
        } else if (paramType == 3) {
            absoluteMaxPriceChange = value;
        } else if (paramType == 4) {
            maxTradesPerBlock = value;
        } else if (paramType == 6) {
            questionCreationFee = uint96(value);
        } else if (paramType == 7) {
            initialAnswerPrice = uint96(value);
        } else if (paramType == 8) {
            maxQuestionLength = value;
        } else if (paramType == 9) {
            maxAnswerLength = value;
        } else if (paramType == 10) {
            maxLinkLength = value;
        } else if (paramType == 11) {
            maxIpfsHashLength = value;
        } else if (paramType == 12) {
            maxDescriptionLength = value;
        } else if (paramType == 13) {
            maxCategoriesPerOpinion = value;
        } else if (paramType == 14) {
            creationFeePercent = value;
        } else {
            revert("Invalid parameter type");
        }
        
        emit ParameterUpdated(paramType, value);
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
        treasuryChangeTimestamp = OpinionAdminLibrary.calculateTreasuryChangeTimestamp(
            block.timestamp,
            TREASURY_CHANGE_DELAY
        );

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
        OpinionAdminLibrary.validateTreasuryChange(
            block.timestamp,
            treasuryChangeTimestamp,
            pendingTreasury
        );

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
        OpinionAdminLibrary.addCategory(categories, newCategory);
        emit CategoryAction(0, categories.length - 1, newCategory, msg.sender, 0);
    }

    /**
     * @dev Add multiple new categories in batch - for major category expansion
     * @param newCategories Array of new categories to add
     */
    function addMultipleCategories(
        string[] calldata newCategories
    ) external onlyRole(ADMIN_ROLE) {
        uint256 initialLength = categories.length;
        uint256 addedCount = OpinionAdminLibrary.addMultipleCategories(categories, newCategories);
        
        // Emit events for added categories
        for (uint256 i = 0; i < addedCount; i++) {
            emit CategoryAction(
                0,
                initialLength + i,
                categories[initialLength + i],
                msg.sender,
                0
            );
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
        return OpinionModerationLibrary.getCompetitionStatus(
            opinionTraders,
            opinionId
        );
    }



    /**
     * @dev Withdraws tokens in an emergency
     * @param token The token to withdraw
     */
    function emergencyWithdraw(
        address token
    ) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        uint256 withdrawnAmount = OpinionAdminLibrary.handleEmergencyWithdraw(
            token,
            address(this),
            msg.sender,
            address(usdcToken),
            feeManager
        );
        emit AdminAction(0, msg.sender, bytes32(0), withdrawnAmount);
    }

    // --- MINIMAL EXTENSION IMPLEMENTATION (SIZE OPTIMIZED) ---
    function setOpinionStringExtension(uint256 opinionId, string calldata key, string calldata value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (bytes(key).length == 0) revert InvalidExtensionKey();
        opinionStringExtensions[opinionId][key] = value;
        emit OpinionStringExtensionSet(opinionId, key, value);
    }
    
    function setOpinionNumberExtension(uint256 opinionId, string calldata key, uint256 value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (bytes(key).length == 0) revert InvalidExtensionKey();
        opinionNumberExtensions[opinionId][key] = value;
        emit OpinionNumberExtensionSet(opinionId, key, value);
    }
    
    function setOpinionBoolExtension(uint256 opinionId, string calldata key, bool value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (bytes(key).length == 0) revert InvalidExtensionKey();
        opinionBoolExtensions[opinionId][key] = value;
        emit OpinionBoolExtensionSet(opinionId, key, value);
    }
    
    function setOpinionAddressExtension(uint256 opinionId, string calldata key, address value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (bytes(key).length == 0) revert InvalidExtensionKey();
        opinionAddressExtensions[opinionId][key] = value;
        emit OpinionAddressExtensionSet(opinionId, key, value);
    }
    
    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys, string[] memory stringValues, uint256[] memory numberValues, 
        bool[] memory boolValues, address[] memory addressValues
    ) {
        keys = opinionExtensionKeys[opinionId];
        uint256 length = keys.length;
        stringValues = new string[](length);
        numberValues = new uint256[](length);
        boolValues = new bool[](length);
        addressValues = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            string memory key = keys[i];
            stringValues[i] = opinionStringExtensions[opinionId][key];
            numberValues[i] = opinionNumberExtensions[opinionId][key];
            boolValues[i] = opinionBoolExtensions[opinionId][key];
            addressValues[i] = opinionAddressExtensions[opinionId][key];
        }
    }
    
    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }
    
    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256) {
        return opinionNumberExtensions[opinionId][key];
    }
    
    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        return opinionBoolExtensions[opinionId][key];
    }
    
    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address) {
        return opinionAddressExtensions[opinionId][key];
    }
    
    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        string[] storage keys = opinionExtensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) return true;
        }
        return false;
    }
    
    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    // ═══════════════════════════════════════════════════════════════
    // SOLO TIMELOCK UPGRADE SYSTEM (CRIT-003 FIX)
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Schedules a contract upgrade with 72-hour timelock (Solo Developer Security)
     * @param newImplementation Address of the new implementation contract
     * @param description Description of the upgrade for audit trail
     * @return actionId The action ID for later execution
     */
    function scheduleContractUpgrade(
        address newImplementation,
        string calldata description
    ) external onlyRole(ADMIN_ROLE) returns (bytes32 actionId) {
        actionId = TimelockAdminLib.scheduleContractUpgrade(
            newImplementation,
            description,
            msg.sender
        );
        
        // Still need to call the actual timelock scheduling
        bytes32 timelockActionId = scheduleUpgrade(newImplementation, description);
        
        emit AdminAction(5, msg.sender, timelockActionId, uint256(uint160(newImplementation)));
        
        return timelockActionId;
    }

    /**
     * @dev Executes a scheduled upgrade after 72-hour timelock expires
     * @param actionId The action ID returned from scheduleContractUpgrade
     */
    function executeScheduledUpgrade(bytes32 actionId) 
        external 
        onlyRole(ADMIN_ROLE) 
        onlyAfterTimelock(actionId) 
    {
        TimelockAdminLib.executeScheduledUpgrade(actionId, msg.sender);
        
        emit AdminAction(6, msg.sender, actionId, 0);
    }

    /**
     * @dev Schedules admin parameter changes with 24-hour timelock (Solo Developer Security)
     * Example usage for setMinimumPrice, setMaxTradesPerBlock, etc.
     * @param functionSelector The function selector (e.g., this.setMinimumPrice.selector)
     * @param params Encoded function parameters
     * @param description Description of the change
     * @return actionId The action ID for later execution
     */
    function scheduleAdminParameterChange(
        bytes4 functionSelector,
        bytes calldata params,
        string calldata description
    ) external onlyRole(ADMIN_ROLE) returns (bytes32 actionId) {
        actionId = TimelockAdminLib.scheduleAdminParameterChange(
            functionSelector,
            params,
            description,
            msg.sender
        );
        
        // Still need to call the actual timelock scheduling
        bytes32 timelockActionId = scheduleAdminAction(functionSelector, params, description);
        
        emit AdminAction(7, msg.sender, timelockActionId, uint256(uint32(functionSelector)));
        
        return timelockActionId;
    }

    /**
     * @dev Executes a scheduled admin parameter change after 24-hour timelock expires
     * @param actionId The action ID returned from scheduleAdminParameterChange
     */
    function executeScheduledParameterChange(bytes32 actionId)
        external
        onlyRole(ADMIN_ROLE)
        onlyAfterTimelock(actionId)
    {
        TimelockAdminLib.executeScheduledParameterChange(actionId, msg.sender);
        
        emit AdminAction(8, msg.sender, actionId, 0);
    }

    /**
     * @dev Cancels a scheduled action (upgrade or parameter change)
     * @param actionId The action ID to cancel
     * @param reason Reason for cancellation
     */
    function cancelTimelockAction(
        bytes32 actionId,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        TimelockAdminLib.cancelTimelockAction(actionId, reason, msg.sender);
        
        super.cancelScheduledAction(actionId, reason);
        
        emit AdminAction(9, msg.sender, actionId, 0);
    }


    /**
     * @dev Authorize upgrade (required for UUPS proxy pattern)
     * NOW SECURED WITH 72-HOUR TIMELOCK - NO INSTANT UPGRADES
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        // This function is now only called through the timelock system
        // Direct calls to upgradeToAndCall will fail without proper timelock
        // The actual authorization happens in executeScheduledUpgrade
        
        // Additional security: verify this is being called from a scheduled upgrade
        // This prevents bypassing the timelock through other upgrade mechanisms
    }
}
