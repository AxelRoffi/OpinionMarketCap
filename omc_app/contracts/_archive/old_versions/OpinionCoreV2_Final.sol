// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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

/**
 * @title OpinionCoreV2_FullFeatures
 * @dev Full-featured version of OpinionCore, compatible with MinimalOpinionCore storage layout.
 * Includes all 50 functions: Moderation, Pools, Trading, Extensions, etc.
 */
contract OpinionCoreV2_Final is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCore,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- EVENTS (Defined locally to avoid interface conflicts) ---
    event OpinionCreatedLocal(
        uint256 indexed opinionId,
        string question,
        string initialAnswer,
        address indexed creator,
        uint256 initialPrice,
        uint256 timestamp
    );

    event OpinionAnsweredLocal(
        uint256 indexed opinionId,
        string answer,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 price,
        uint256 timestamp
    );

    event OpinionStatusChanged(
        uint256 indexed opinionId,
        bool isActive,
        address indexed moderator,
        uint256 timestamp
    );

    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed account,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    event QuestionSaleAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event AnswerModerated(
        uint256 indexed opinionId,
        address indexed moderatedUser,
        address indexed newOwner,
        string reason,
        uint256 timestamp
    );

    event AnswerOwnershipTransferred(
        uint256 indexed opinionId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event OpinionStringExtensionSet(uint256 indexed opinionId, string key, string value);
    
    event ParameterUpdated(uint8 indexed paramId, uint256 value);
    event AdminAction(uint8 indexed actionType, address indexed account, bytes32 data, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury, address indexed admin, uint256 timestamp);

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    // --- CONSTANTS ---
    uint256 public constant CREATION_FEE = 1_000_000; // 1 USDC (Legacy V1 constant)
    uint256 public constant MIN_ANSWER_PRICE = 1_000_000; // 1 USDC (Legacy V1 constant)
    
    // V2 Constants
    uint256 public constant MAX_QUESTION_LENGTH = 100; // V1 was 100
    uint256 public constant MAX_ANSWER_LENGTH = 100; // V1 was 100
    uint256 public constant MAX_LINK_LENGTH = 260;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 68;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 120;
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;
    uint96 public constant MIN_INITIAL_PRICE = 1_000_000;   // 1 USDC
    uint96 public constant MAX_INITIAL_PRICE = 100_000_000; // 100 USDC
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;

    // --- STORAGE LAYOUT (MUST MATCH MINIMAL V1 EXACTLY FIRST) ---
    
    IERC20 public usdcToken;
    address public feeManagerAddress; // Renamed to avoid conflict with interface, but storage slot is same
    address public treasury;
    uint256 public nextOpinionId;
    
    // Extended Opinion Struct (V1 fields + V2 fields)
    struct Opinion {
        // --- V1 Fields (DO NOT TOUCH ORDER) ---
        string question;
        string currentAnswer;
        address creator;
        address currentOwner; // Maps to currentAnswerOwner
        uint256 nextPrice;
        uint256 totalVolume;
        bool isActive;
        
        // --- V2 New Fields (Appended) ---
        address questionOwner;
        uint96 salePrice;
        uint96 lastPrice;
        string currentAnswerDescription;
        string link;
        string[] categories;
        string ipfsHash;
        string description;
    }
    
    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => uint256) public answerCount;

    // --- NEW STORAGE (Replacing __gap from V1) ---
    
    IPoolManager public poolManager;
    IMonitoringManager public monitoringManager;
    ISecurityManager public securityManager;
    
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    
    bool public isPublicCreationEnabled;
    uint256 public maxTradesPerBlock;
    
    // Mappings
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;
    
    // Categories
    string[] public categories;
    
    // Extensions (Simplified to string only for space)
    mapping(uint256 => mapping(string => string)) public opinionStringExtensions;
    mapping(uint256 => string[]) public opinionExtensionKeys;
    
    // Config
    uint96 public minimumPrice;
    uint96 public questionCreationFee;
    uint96 public initialAnswerPrice;
    uint256 public absoluteMaxPriceChange;

    // Price calculation state
    uint256 private nonce;
    mapping(uint256 => uint256) private priceMetadata;
    mapping(uint256 => uint256) private priceHistory;
    
    // Remaining gap (48 - 20 used = 28)
    uint256[28] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize V2 (Re-initializer)
     */
    function initializeV2(
        address _poolManager,
        address _monitoringManager,
        address _securityManager
    ) public reinitializer(2) {
        __Pausable_init();
        
        poolManager = IPoolManager(_poolManager);
        if (_monitoringManager != address(0)) monitoringManager = IMonitoringManager(_monitoringManager);
        if (_securityManager != address(0)) securityManager = ISecurityManager(_securityManager);
        
        _grantRole(MODERATOR_ROLE, msg.sender);
        
        // Initialize V2 defaults
        isPublicCreationEnabled = true;
        maxTradesPerBlock = 3;
        minimumPrice = 1_000_000;
        questionCreationFee = 5_000_000;
        initialAnswerPrice = 2_000_000;
        absoluteMaxPriceChange = 200;
        
        // Default categories
        categories = ["Crypto", "Politics", "Science", "Technology", "Sports", "Entertainment", "Other"];
    }

    // --- CORE FUNCTIONS (V2 Implementation) ---

    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        _createOpinionInternal(question, answer, description, "", "", initialPrice, opinionCategories);
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
        _createOpinionInternal(question, answer, description, ipfsHash, link, initialPrice, opinionCategories);
    }

    function _createOpinionInternal(
        string calldata question,
        string calldata answer,
        string calldata description,
        string memory ipfsHash,
        string memory link,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal {
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender)) revert UnauthorizedCreator();
        
        // Validation
        ValidationLibrary.validateOpinionCategories(opinionCategories, categories);
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        if (initialPrice < MIN_INITIAL_PRICE) revert InvalidInitialPrice();

        // Payment
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);

        uint256 opinionId = nextOpinionId++;
        
        // Create Opinion (V1 + V2 fields)
        Opinion storage op = opinions[opinionId];
        op.question = question;
        op.currentAnswer = answer;
        op.creator = msg.sender;
        op.currentOwner = msg.sender;
        op.nextPrice = uint96(_calculateNextPrice(opinionId, initialPrice));
        op.totalVolume = 0;
        op.isActive = true;
        
        // V2 fields
        op.questionOwner = msg.sender;
        op.lastPrice = initialPrice;
        op.currentAnswerDescription = description;
        op.link = link;
        op.categories = opinionCategories;
        op.ipfsHash = ipfsHash;
        op.description = description;

        emit OpinionCreatedLocal(opinionId, question, answer, msg.sender, initialPrice, block.timestamp);
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        require(op.isActive, "Not active");
        require(op.currentOwner != msg.sender, "Same owner");
        
        uint256 price = op.nextPrice;
        
        // Payment
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        
        // Fees
        IFeeManager feeMgr = IFeeManager(feeManagerAddress);
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeMgr.calculateFeeDistribution(uint96(price));
        
        feeMgr.accumulateFee(op.creator, creatorFee);
        
        if (op.currentOwner == address(poolManager)) {
            poolManager.distributePoolRewards(opinionId, price, msg.sender);
        } else {
            feeMgr.accumulateFee(op.currentOwner, ownerAmount);
        }
        
        // Update State
        op.currentAnswer = answer;
        op.currentOwner = msg.sender;
        op.totalVolume += price;
        op.lastPrice = uint96(price);
        op.nextPrice = uint96(_calculateNextPrice(opinionId, price));
        
        // V2 fields
        op.currentAnswerDescription = description;
        op.link = link;
        
        // History
        answerHistory[opinionId].push(OpinionStructs.AnswerHistory({
            answer: answer,
            description: description,
            owner: msg.sender,
            price: uint96(price),
            timestamp: uint32(block.timestamp)
        }));
        
        answerCount[opinionId]++;
        
        emit OpinionAnsweredLocal(opinionId, answer, op.currentOwner, msg.sender, price, block.timestamp);
    }

    // --- TRADING ---

    function listQuestionForSale(uint256 opinionId, uint256 price) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        require(op.questionOwner == msg.sender, "Not owner");
        op.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    function buyQuestion(uint256 opinionId) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        uint256 price = op.salePrice;
        require(price > 0, "Not for sale");
        
        address seller = op.questionOwner;
        
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        
        uint256 fee = (price * 10) / 100;
        uint256 sellerAmount = price - fee;
        
        IFeeManager(feeManagerAddress).accumulateFee(seller, uint96(sellerAmount));
        
        op.questionOwner = msg.sender;
        op.salePrice = 0;
        
        emit QuestionSaleAction(opinionId, 1, seller, msg.sender, price);
    }

    function cancelQuestionSale(uint256 opinionId) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        require(op.questionOwner == msg.sender, "Not owner");
        op.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    function moderateAnswer(uint256 opinionId, string calldata reason) external override onlyRole(MODERATOR_ROLE) {
        Opinion storage op = opinions[opinionId];
        require(op.isActive, "Not active");
        
        address oldOwner = op.currentOwner;
        op.currentOwner = op.creator; // Revert to creator
        op.currentAnswer = "Content Moderated";
        op.currentAnswerDescription = reason;
        
        emit AnswerModerated(opinionId, oldOwner, op.creator, reason, block.timestamp);
    }

    function transferAnswerOwnership(uint256 opinionId, address newOwner) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        require(op.currentOwner == msg.sender, "Not owner");
        require(newOwner != address(0), "Zero address");
        
        op.currentOwner = newOwner;
        emit AnswerOwnershipTransferred(opinionId, msg.sender, newOwner, block.timestamp);
    }

    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        Opinion storage op = opinions[opinionId];
        require(op.creator == msg.sender, "Not creator");
        
        op.question = question;
        op.ipfsHash = ipfsHash;
        op.link = link;
        op.categories = opinionCategories;
        
        // Re-emit creation event for update
        emit OpinionCreatedLocal(opinionId, question, op.currentAnswer, msg.sender, 0, block.timestamp);
    }

    // --- MODERATION ---

    function deactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        opinions[opinionId].isActive = false;
        emit OpinionStatusChanged(opinionId, false, msg.sender, block.timestamp);
    }

    function reactivateOpinion(uint256 opinionId) external override onlyRole(MODERATOR_ROLE) {
        opinions[opinionId].isActive = true;
        emit OpinionStatusChanged(opinionId, true, msg.sender, block.timestamp);
    }

    // --- POOL INTEGRATION ---

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external override onlyRole(POOL_MANAGER_ROLE) {
        Opinion storage op = opinions[opinionId];
        require(op.isActive, "Not active");
        
        address previousOwner = op.currentOwner;
        
        op.currentAnswer = answer;
        op.currentOwner = poolAddress;
        op.totalVolume += price;
        op.lastPrice = uint96(price);
        op.nextPrice = uint96(_calculateNextPrice(opinionId, price));
        
        answerHistory[opinionId].push(OpinionStructs.AnswerHistory({
            answer: answer,
            description: "Pool Execution",
            owner: poolAddress,
            price: uint96(price),
            timestamp: uint32(block.timestamp)
        }));
        
        emit OpinionAnsweredLocal(opinionId, answer, previousOwner, poolAddress, price, block.timestamp);
    }

    // --- VIEW FUNCTIONS ---

    function getOpinionDetails(uint256 opinionId) external view override returns (OpinionStructs.Opinion memory) {
        Opinion storage op = opinions[opinionId];
        return OpinionStructs.Opinion({
            creator: op.creator,
            questionOwner: op.questionOwner,
            lastPrice: op.lastPrice,
            nextPrice: uint96(op.nextPrice),
            salePrice: op.salePrice,
            isActive: op.isActive,
            question: op.question,
            currentAnswer: op.currentAnswer,
            currentAnswerDescription: op.currentAnswerDescription,
            currentAnswerOwner: op.currentOwner,
            link: op.link,
            ipfsHash: op.ipfsHash,
            totalVolume: uint96(op.totalVolume),
            categories: op.categories
        });
    }

    function getAnswerHistory(uint256 opinionId) external view override returns (OpinionStructs.AnswerHistory[] memory) {
        return answerHistory[opinionId];
    }

    function getNextPrice(uint256 opinionId) external view override returns (uint256) {
        return opinions[opinionId].nextPrice;
    }

    function getTradeCount(uint256 opinionId) external view override returns (uint256) {
        return answerCount[opinionId];
    }

    function getCreatorGain(uint256 opinionId) external view override returns (uint256) {
        // Simplified calculation
        return (opinions[opinionId].totalVolume * 1) / 100; 
    }

    function isPoolOwned(uint256 opinionId) external view override returns (bool) {
        return opinions[opinionId].currentOwner == address(poolManager);
    }

    // --- CATEGORIES ---

    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        categories.push(newCategory);
    }

    function getAvailableCategories() external view returns (string[] memory) {
        return categories;
    }

    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory) {
        return opinions[opinionId].categories;
    }

    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    // --- EXTENSIONS (Full Interface Implementation) ---

    function setOpinionStringExtension(uint256 opinionId, string calldata key, string calldata value) external override onlyRole(ADMIN_ROLE) {
        opinionStringExtensions[opinionId][key] = value;
        opinionExtensionKeys[opinionId].push(key);
        emit OpinionStringExtensionSet(opinionId, key, value);
    }

    // Stubs for other types to save space (we only use string extensions in V2)
    function setOpinionNumberExtension(uint256, string calldata, uint256) external override onlyRole(ADMIN_ROLE) { revert("Not supported in V2"); }
    function setOpinionBoolExtension(uint256, string calldata, bool) external override onlyRole(ADMIN_ROLE) { revert("Not supported in V2"); }
    function setOpinionAddressExtension(uint256, string calldata, address) external override onlyRole(ADMIN_ROLE) { revert("Not supported in V2"); }

    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view override returns (string memory) {
        return opinionStringExtensions[opinionId][key];
    }

    function getOpinionNumberExtension(uint256, string calldata) external view override returns (uint256) { return 0; }
    function getOpinionBoolExtension(uint256, string calldata) external view override returns (bool) { return false; }
    function getOpinionAddressExtension(uint256, string calldata) external view override returns (address) { return address(0); }

    function hasOpinionExtension(uint256 opinionId, string calldata key) external view override returns (bool) {
        bytes32 keyHash = keccak256(bytes(key));
        string[] memory keys = opinionExtensionKeys[opinionId];
        for(uint i=0; i<keys.length; i++) {
            if(keccak256(bytes(keys[i])) == keyHash) return true;
        }
        return false;
    }

    function getOpinionExtensionCount(uint256 opinionId) external view override returns (uint256) {
        return opinionExtensionKeys[opinionId].length;
    }

    function getOpinionExtensions(uint256 opinionId) external view override returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        keys = opinionExtensionKeys[opinionId];
        stringValues = new string[](keys.length);
        numberValues = new uint256[](keys.length);
        boolValues = new bool[](keys.length);
        addressValues = new address[](keys.length);
        
        for(uint i=0; i<keys.length; i++) {
            stringValues[i] = opinionStringExtensions[opinionId][keys[i]];
        }
        return (keys, stringValues, numberValues, boolValues, addressValues);
    }

    // --- ADMIN ---

    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        feeManagerAddress = _feeManager;
    }

    function setPoolManager(address _poolManager) external onlyRole(ADMIN_ROLE) {
        poolManager = IPoolManager(_poolManager);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // --- INTERNAL HELPERS ---

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

    function _updatePriceHistory(uint256 opinionId, uint256 newPrice) internal {
        uint256 meta = priceMetadata[opinionId];
        uint8 count = uint8(meta);

        priceMetadata[opinionId] = (block.timestamp << 8) | (count < 3 ? count + 1 : 3);

        uint256 history = priceHistory[opinionId];
        history = (history << 80) & (~uint256(0) << 160);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function version() external pure virtual returns (string memory) {
        return "2.0.0";
    }
}