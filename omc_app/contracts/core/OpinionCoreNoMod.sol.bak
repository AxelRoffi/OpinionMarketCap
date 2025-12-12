// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IOpinionCore.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IMonitoringManager.sol";
import "./interfaces/ISecurityManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./structs/OpinionStructs.sol";
import "./libraries/ValidationLibrary.sol";
import "./libraries/PriceCalculator.sol";
import "./interfaces/IValidationErrors.sol";

/**
 * @title OpinionCoreSimplified
 * @dev Simplified core contract for managing opinions, answers, and related functionality
 * Security and monitoring features have been extracted to separate contracts
 */
contract OpinionCoreSimplified is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCore,
    IOpinionMarketEvents,
    IOpinionMarketErrors,
    IValidationErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 52;
    uint256 public constant MAX_ANSWER_LENGTH = 52;
    uint256 public constant MAX_LINK_LENGTH = 260;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 68;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 120;
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;
    
    // --- INITIAL PRICE RANGE CONSTANTS ---
    uint96 public constant MIN_INITIAL_PRICE = 2_000_000;   // 2 USDC (6 decimals)
    uint96 public constant MAX_INITIAL_PRICE = 100_000_000; // 100 USDC (6 decimals)

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;
    IMonitoringManager public monitoringManager;
    ISecurityManager public securityManager;

    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;
    
    bool public isPublicCreationEnabled;
    uint256 public nextOpinionId;
    
    // --- CATEGORIES STORAGE ---
    string[] public categories;

    // --- EXTENSION SLOTS STORAGE ---
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

    // Core data structures
    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;

    // --- INITIALIZATION ---
    function initialize(
        address _usdcToken,
        address _opinionMarket,
        address _feeManager,
        address _poolManager,
        address _monitoringManager,
        address _securityManager,
        address _treasury
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
            _opinionMarket == address(0) ||
            _feeManager == address(0) ||
            _poolManager == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
        treasury = _treasury;
        
        // Grant role to opinion market contract
        _grantRole(MARKET_CONTRACT_ROLE, _opinionMarket);
        
        // Set optional modules (can be zero initially)
        if (_monitoringManager != address(0)) {
            monitoringManager = IMonitoringManager(_monitoringManager);
        }
        if (_securityManager != address(0)) {
            securityManager = ISecurityManager(_securityManager);
        }

        // Initialize parameters
        nextOpinionId = 1;
        isPublicCreationEnabled = false;
        maxTradesPerBlock = 3;
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 5_000_000; // 5 USDC
        initialAnswerPrice = 2_000_000; // 2 USDC
        absoluteMaxPriceChange = 200; // 200%
        
        // Initialize default categories
        categories = ["Crypto", "Politics", "Science", "Technology", "Sports", 
                      "Entertainment", "Culture", "Web", "Social Media", "Other"];
    }

    // --- MODIFIERS ---
    modifier onlyMarketContract() {
        if (!hasRole(MARKET_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, MARKET_CONTRACT_ROLE);
        _;
    }

    modifier onlyPoolManager() {
        if (!hasRole(POOL_MANAGER_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, POOL_MANAGER_ROLE);
        _;
    }

    // --- CORE OPINION FUNCTIONS ---
    
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        // Access control check
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Enhanced validation if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.validateCreateOpinionInputs(
                question, answer, description, initialPrice, opinionCategories, msg.sender
            ) {} catch {
                // Fallback to basic validation if security manager fails
                _basicValidation(question, answer, description, initialPrice, opinionCategories);
            }
        } else {
            _basicValidation(question, answer, description, initialPrice, opinionCategories);
        }

        // Check allowance for initialPrice
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question, answer, description, "", "", initialPrice, opinionCategories
        );

        // Transfer payment to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackOpinionCreation(opinionId, msg.sender, initialPrice) {} catch {}
        }

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        // Access control check
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Enhanced validation if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.validateCreateOpinionInputs(
                question, answer, description, initialPrice, opinionCategories, msg.sender
            ) {} catch {
                _basicValidation(question, answer, description, initialPrice, opinionCategories);
            }
        } else {
            _basicValidation(question, answer, description, initialPrice, opinionCategories);
        }

        // Validate IPFS hash and link
        _validateExtras(ipfsHash, link);

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question, answer, description, ipfsHash, link, initialPrice, opinionCategories
        );

        // Transfer payment to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackOpinionCreation(opinionId, msg.sender, initialPrice) {} catch {}
        }

        // Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

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

        // Basic validation
        _validateAnswerInput(answer, description);

        // Validate link (optional)
        bytes memory linkBytes = bytes(link);
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        // Calculate price
        uint96 price = opinion.nextPrice > 0
            ? opinion.nextPrice
            : uint96(_calculateNextPrice(opinionId, opinion.lastPrice));

        // Check USDC allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        // Security analysis if SecurityManager is available
        if (address(securityManager) != address(0)) {
            // Check MEV risk
            try securityManager.analyzeMevRisk(msg.sender, price, opinionId) {} catch {}
            
            // Analyze bot patterns
            // Note: We can't easily determine trade success here, so we skip bot analysis for now
        }

        // Calculate fees
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeManager
            .calculateFeeDistribution(price);

        // Apply MEV penalty if needed
        (platformFee, ownerAmount) = feeManager.applyMEVPenalty(
            price, ownerAmount, msg.sender, opinionId
        );

        // Get addresses for fee distribution
        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;
        bool answerIsPoolOwned = currentAnswerOwner == address(poolManager);

        // Accumulate fees
        feeManager.accumulateFee(creator, creatorFee);

        if (answerIsPoolOwned) {
            poolManager.distributePoolRewards(opinionId, price, msg.sender);
        } else {
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
        uint96 oldPrice = opinion.lastPrice;
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.link = link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        // Transfer tokens
        usdcToken.safeTransferFrom(msg.sender, address(this), price);

        // Track with monitoring manager if available
        if (address(monitoringManager) != address(0)) {
            try monitoringManager.trackTradingActivity(
                opinionId, msg.sender, price, oldPrice, opinion.nextPrice, platformFee
            ) {} catch {}
        }

        // Update security profiles if SecurityManager is available
        if (address(securityManager) != address(0)) {
            try securityManager.updateMevProfile(msg.sender, opinionId, price) {} catch {}
        }

        // Emit events
        emit FeesAction(opinionId, 0, currentAnswerOwner, price, platformFee, creatorFee, ownerAmount);
        emit OpinionAction(opinionId, 1, answer, msg.sender, price);
    }

    // --- QUESTION TRADING FUNCTIONS ---

    function listQuestionForSale(uint256 opinionId, uint256 price) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    function buyQuestion(uint256 opinionId) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();

        uint96 salePrice = opinion.salePrice;
        if (salePrice == 0) revert NotForSale(opinionId);

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < salePrice) revert InsufficientAllowance(salePrice, allowance);

        address currentOwner = opinion.questionOwner;
        uint96 platformFee = uint96((salePrice * 10) / 100);
        uint96 sellerAmount = salePrice - platformFee;

        opinion.questionOwner = msg.sender;
        opinion.salePrice = 0;

        usdcToken.safeTransferFrom(msg.sender, address(this), salePrice);
        feeManager.accumulateFee(currentOwner, sellerAmount);

        emit QuestionSaleAction(opinionId, 1, currentOwner, msg.sender, salePrice);
    }

    function cancelQuestionSale(uint256 opinionId) external override nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    // --- MODERATION FUNCTIONS ---

    function deactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        opinion.isActive = false;
        emit OpinionAction(opinionId, 2, "", msg.sender, 0);
    }

    function reactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.isActive) revert OpinionAlreadyActive();

        opinion.isActive = true;
        emit OpinionAction(opinionId, 3, "", msg.sender, 0);
    }

    // --- POOL INTEGRATION ---

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external override onlyPoolManager {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: "",
                owner: poolAddress,
                price: uint96(price),
                timestamp: uint32(block.timestamp)
            })
        );

        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = "";
        opinion.currentAnswerOwner = poolAddress;
        opinion.lastPrice = uint96(price);
        opinion.totalVolume += uint96(price);
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        emit OpinionAction(opinionId, 1, answer, address(poolManager), price);
    }

    // --- VIEW FUNCTIONS ---

    function getAnswerHistory(uint256 opinionId) external view override returns (OpinionStructs.AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    function getNextPrice(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        if (opinion.nextPrice == 0) {
            return _estimateNextPrice(opinion.lastPrice);
        }
        return opinion.nextPrice;
    }

    function getOpinionDetails(uint256 opinionId) external view override returns (OpinionStructs.Opinion memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId];
    }

    function getTradeCount(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    function getCreatorGain(uint256 opinionId) external view override returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        
        (, uint96 creatorFeePercent, ) = feeManager.calculateFeeDistribution(1_000_000);
        uint256 creatorFeeRate = creatorFeePercent / 10;
        return (opinion.totalVolume * creatorFeeRate) / 100;
    }

    function isPoolOwned(uint256 opinionId) external view override returns (bool) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].currentAnswerOwner == address(poolManager);
    }

    // --- CATEGORIES FUNCTIONS ---

    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        bytes32 newCategoryHash = keccak256(bytes(newCategory));
        uint256 length = categories.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (keccak256(bytes(categories[i])) == newCategoryHash) {
                revert CategoryAlreadyExists();
            }
        }
        categories.push(newCategory);
    }

    function getAvailableCategories() external view returns (string[] memory) {
        return categories;
    }

    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].categories;
    }

    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    // --- EXTENSION SLOTS FUNCTIONS ---

    function setOpinionStringExtension(uint256 opinionId, string calldata key, string calldata value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionStringExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionStringExtensionSet(opinionId, key, value);
    }

    function setOpinionNumberExtension(uint256 opinionId, string calldata key, uint256 value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionNumberExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionNumberExtensionSet(opinionId, key, value);
    }

    function setOpinionBoolExtension(uint256 opinionId, string calldata key, bool value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionBoolExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionBoolExtensionSet(opinionId, key, value);
    }

    function setOpinionAddressExtension(uint256 opinionId, string calldata key, address value) external onlyRole(ADMIN_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (!isValidExtensionKey(key)) revert InvalidExtensionKey();
        
        opinionAddressExtensions[opinionId][key] = value;
        _trackExtensionKey(opinionId, key);
        emit OpinionAddressExtensionSet(opinionId, key, value);
    }

    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
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
        
        return (keys, stringValues, numberValues, boolValues, addressValues);
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
        string[] memory keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return true;
            }
        }
        return false;
    }

    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    // --- ADMIN FUNCTIONS ---

    function setMinimumPrice(uint96 _minimumPrice) external onlyRole(ADMIN_ROLE) {
        minimumPrice = _minimumPrice;
        emit ParameterUpdated(0, _minimumPrice);
    }

    function setQuestionCreationFee(uint96 _questionCreationFee) external onlyRole(ADMIN_ROLE) {
        questionCreationFee = _questionCreationFee;
        emit ParameterUpdated(6, _questionCreationFee);
    }

    function setInitialAnswerPrice(uint96 _initialAnswerPrice) external onlyRole(ADMIN_ROLE) {
        initialAnswerPrice = _initialAnswerPrice;
        emit ParameterUpdated(7, _initialAnswerPrice);
    }

    function setMaxPriceChange(uint256 _maxPriceChange) external onlyRole(ADMIN_ROLE) {
        absoluteMaxPriceChange = _maxPriceChange;
        emit ParameterUpdated(3, _maxPriceChange);
    }

    function setMaxTradesPerBlock(uint256 _maxTradesPerBlock) external onlyRole(ADMIN_ROLE) {
        maxTradesPerBlock = _maxTradesPerBlock;
        emit ParameterUpdated(4, _maxTradesPerBlock);
    }

    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit AdminAction(1, msg.sender, bytes32(0), 0);
    }

    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        if (_feeManager == address(0)) revert ZeroAddressNotAllowed();
        feeManager = IFeeManager(_feeManager);
    }

    function setPoolManager(address _poolManager) external onlyRole(ADMIN_ROLE) {
        if (_poolManager == address(0)) revert ZeroAddressNotAllowed();
        poolManager = IPoolManager(_poolManager);
    }

    function setMonitoringManager(address _monitoringManager) external onlyRole(ADMIN_ROLE) {
        monitoringManager = IMonitoringManager(_monitoringManager);
    }

    function setSecurityManager(address _securityManager) external onlyRole(ADMIN_ROLE) {
        securityManager = ISecurityManager(_securityManager);
    }

    function grantMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    function revokeMarketContractRole(address contractAddress) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MARKET_CONTRACT_ROLE, contractAddress);
    }

    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddressNotAllowed();
        
        pendingTreasury = newTreasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;
        
        emit TreasuryUpdated(treasury, newTreasury, msg.sender, block.timestamp);
    }

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

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address token) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddressNotAllowed();

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));

        if (token == address(usdcToken)) {
            uint256 totalFees = feeManager.getTotalAccumulatedFees();
            if (balance <= totalFees) revert("Insufficient balance after fees");
            balance -= totalFees;
        }

        tokenContract.safeTransfer(msg.sender, balance);
        emit AdminAction(0, msg.sender, bytes32(0), balance);
    }

    // --- INTERNAL FUNCTIONS ---

    function _basicValidation(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal view {
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        ValidationLibrary.validateDescription(description);
        
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }
    }

    function _validateExtras(string calldata ipfsHash, string calldata link) internal pure {
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > MAX_IPFS_HASH_LENGTH) revert InvalidIpfsHashLength();
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }
    }

    function _validateAnswerInput(string calldata answer, string calldata description) internal pure {
        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH) revert InvalidAnswerLength();
        
        ValidationLibrary.validateDescription(description);
    }

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
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, initialPrice));
        opinion.isActive = true;
        opinion.question = question;
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;
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

    function _validateIpfsHash(string memory _ipfsHash) internal pure {
        bytes memory ipfsHashBytes = bytes(_ipfsHash);

        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert InvalidIpfsHashFormat();
        }
    }

    function _calculateNextPrice(uint256 opinionId, uint256 lastPrice) internal returns (uint256) {
        uint256 newPrice = PriceCalculator.calculateNextPrice(
            opinionId,
            lastPrice,
            minimumPrice,
            absoluteMaxPriceChange,
            nonce++,
            priceMetadata,
            priceHistory
        );

        _updatePriceHistory(opinionId, newPrice);
        return newPrice;
    }

    function _estimateNextPrice(uint256 lastPrice) internal pure returns (uint256) {
        return (lastPrice * 130) / 100;
    }

    function _updatePriceHistory(uint256 opinionId, uint256 newPrice) internal {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        priceMetadata[opinionId] = (block.timestamp << 8) | (count < 3 ? count + 1 : 3);

        uint256 history = priceHistory[opinionId];
        history = (history << 80) & (~uint256(0) << 160);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function _checkAndUpdateTradesInBlock() internal {
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert MaxTradesPerBlockExceeded(userTradesInBlock[msg.sender], maxTradesPerBlock);
            }
        }
    }

    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    function isValidExtensionKey(string memory key) internal pure returns (bool) {
        bytes memory keyBytes = bytes(key);
        
        if (keyBytes.length == 0 || keyBytes.length > 32) return false;
        
        for (uint i = 0; i < keyBytes.length; i++) {
            uint8 char = uint8(keyBytes[i]);
            bool isAlpha = (char >= 65 && char <= 90) || (char >= 97 && char <= 122);
            bool isNumeric = (char >= 48 && char <= 57);
            bool isUnderscore = (char == 95);
            
            if (!isAlpha && !isNumeric && !isUnderscore) return false;
        }
        
        return true;
    }

    function _trackExtensionKey(uint256 opinionId, string memory key) internal {
        string[] storage keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));
        
        for (uint i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return;
            }
        }
        
        keys.push(key);
    }

    /**
     * @dev Moderates an inappropriate answer by reverting to initial answer (simplified version)
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
    }

    // --- MISSING INTERFACE IMPLEMENTATIONS ---
    
    /**
     * @dev Transfer answer ownership (simplified implementation)
     */
    function transferAnswerOwnership(
        uint256 opinionId,
        address newOwner
    ) external override nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.currentAnswerOwner != msg.sender) revert NotAnswerOwner();
        if (newOwner == msg.sender) revert("Cannot transfer to yourself");
        
        address previousOwner = opinion.currentAnswerOwner;
        opinion.currentAnswerOwner = newOwner;
        
        emit AnswerOwnershipTransferred(opinionId, previousOwner, newOwner, block.timestamp);
        emit OpinionAction(opinionId, 5, "", newOwner, 0);
    }

    /**
     * @dev Update opinion (simplified implementation)  
     */
    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator != msg.sender) revert("Only creator can update");
        
        // Basic validation
        if (bytes(question).length > MAX_QUESTION_LENGTH) revert InvalidQuestionLength();
        if (bytes(ipfsHash).length > MAX_IPFS_HASH_LENGTH) revert InvalidIpfsHashLength();
        if (bytes(link).length > MAX_LINK_LENGTH) revert InvalidLinkLength();
        if (opinionCategories.length > MAX_CATEGORIES_PER_OPINION) revert TooManyCategories();
        
        // Update the opinion
        opinion.question = question;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;
        opinion.categories = opinionCategories;
        
        emit OpinionAction(opinionId, 6, question, msg.sender, 0);
    }

    // Events are inherited from IOpinionMarketEvents
}