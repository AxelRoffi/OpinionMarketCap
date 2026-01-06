// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
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
import "./interfaces/IOpinionCoreInternal.sol";
import "./interfaces/IOpinionExtensionsInternal.sol";
import "./interfaces/IOpinionAdminInternal.sol";
import "./structs/OpinionStructs.sol";
import "./libraries/ValidationLibrary.sol";
import "./libraries/PriceCalculator.sol";
import "./interfaces/IValidationErrors.sol";

/**
 * @title OpinionCore
 * @dev Core trading contract for opinions and answers - Size optimized (~16KB)
 */
contract OpinionCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IOpinionCoreInternal,
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
    bytes32 public constant EXTENSION_CONTRACT_ROLE = keccak256("EXTENSION_CONTRACT_ROLE");
    bytes32 public constant ADMIN_CONTRACT_ROLE = keccak256("ADMIN_CONTRACT_ROLE");

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 60;
    uint256 public constant MAX_ANSWER_LENGTH = 60;
    uint256 public constant MAX_LINK_LENGTH = 260;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 68;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 280;
    uint256 public constant MAX_CATEGORIES_PER_OPINION = 3;
    
    // --- INITIAL PRICE RANGE CONSTANTS ---
    uint96 public constant MIN_INITIAL_PRICE = 1_000_000;   // 1 USDC (6 decimals)

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;
    IMonitoringManager public monitoringManager;
    ISecurityManager public securityManager;
    
    // Linked contracts
    IOpinionExtensionsInternal public extensionsContract;
    IOpinionAdminInternal public adminContract;

    uint256 public nextOpinionId;
    
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
    uint96 public maxInitialPrice;

    // Core data structures
    mapping(uint256 => OpinionStructs.Opinion) public opinions;
    mapping(uint256 => OpinionStructs.AnswerHistory[]) public answerHistory;

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

    modifier onlyLinkedContracts() {
        if (!hasRole(EXTENSION_CONTRACT_ROLE, msg.sender) && 
            !hasRole(ADMIN_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, EXTENSION_CONTRACT_ROLE);
        _;
    }

    // --- INITIALIZATION ---
    function initialize(
        address _usdcToken,
        address _opinionMarket,
        address _feeManager,
        address _poolManager,
        address _monitoringManager,
        address _securityManager,
        address _treasury,
        address _extensionsContract,
        address _adminContract
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
            _extensionsContract == address(0) ||
            _adminContract == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
        extensionsContract = IOpinionExtensionsInternal(_extensionsContract);
        adminContract = IOpinionAdminInternal(_adminContract);
        
        // Grant roles to linked contracts
        _grantRole(MARKET_CONTRACT_ROLE, _opinionMarket);
        _grantRole(EXTENSION_CONTRACT_ROLE, _extensionsContract);
        _grantRole(ADMIN_CONTRACT_ROLE, _adminContract);
        
        // Set optional modules (can be zero initially)
        if (_monitoringManager != address(0)) {
            monitoringManager = IMonitoringManager(_monitoringManager);
        }
        if (_securityManager != address(0)) {
            securityManager = ISecurityManager(_securityManager);
        }

        // Initialize parameters
        nextOpinionId = 1;
        maxTradesPerBlock = 0; // No trade limit per block
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 2_000_000; // 2 USDC minimum
        initialAnswerPrice = 1_000_000; // 1 USDC
        absoluteMaxPriceChange = 200; // 200%
        maxInitialPrice = 100_000_000; // 100 USDC
    }

    // --- CORE OPINION FUNCTIONS ---
    
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external nonReentrant whenNotPaused {
        // Access control check
        if (!adminContract.isPublicCreationEnabled() && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Basic validation
        _basicValidation(question, answer, description, initialPrice, opinionCategories);

        // Calculate dynamic creation fee: MAX(1 USDC, 20% of initial price)
        uint96 creationFee = _calculateCreationFee(initialPrice);

        // Check allowance and transfer fee
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee) revert InsufficientAllowance(creationFee, allowance);
        usdcToken.safeTransferFrom(msg.sender, adminContract.getTreasury(), creationFee);

        // Create opinion record
        uint256 opinionId = _createOpinionRecord(question, answer, description, initialPrice);

        // Initialize categories
        extensionsContract.initializeOpinionCategories(opinionId, opinionCategories);

        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionCreated(opinionId, question, answer, msg.sender, initialPrice, block.timestamp);
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external payable nonReentrant whenNotPaused {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // Rate limiting
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        // Validation
        // Validate answer length
        if (bytes(answer).length < 2 || bytes(answer).length > MAX_ANSWER_LENGTH) {
            revert InvalidStringParameter("answer", "Length out of bounds");
        }
        ValidationLibrary.validateDescription(description);
        // Skip ipfs validation for now
        if (bytes(link).length > MAX_LINK_LENGTH) {
            revert InvalidStringParameter("link", "Too long");
        }

        uint96 price = uint96(this.getNextPrice(opinionId));
        
        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        // Calculate fees
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeManager.calculateFeeDistribution(price);

        // Transfer payment
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        
        // Transfer to previous answer owner
        if (ownerAmount > 0) {
            usdcToken.safeTransfer(opinion.currentAnswerOwner, ownerAmount);
        }
        
        // Accumulate fees
        if (creatorFee > 0) {
            feeManager.accumulateFee(opinion.creator, creatorFee);
        }

        // Update opinion state
        _updateOpinionState(opinion, answer, description, link, price, msg.sender);

        // Update price calculation metadata
        _updatePriceMetadata(opinionId, price);

        // Record answer in history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: msg.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        // Track with monitoring manager if available
        // if (address(monitoringManager) != address(0)) {
        //     try monitoringManager.trackAnswerSubmission(opinionId, msg.sender, price) {} catch {}
        // }

        emit OpinionAction(opinionId, 1, answer, msg.sender, price);
        emit OpinionAnswered(opinionId, answer, opinion.currentAnswerOwner, msg.sender, price, block.timestamp);
    }

    // --- QUESTION TRADING FUNCTIONS ---
    
    function listQuestionForSale(uint256 opinionId, uint256 price) external nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, msg.sender, address(0), price);
    }

    function buyQuestion(uint256 opinionId) external nonReentrant whenNotPaused {
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

    function cancelQuestionSale(uint256 opinionId) external nonReentrant whenNotPaused {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, msg.sender, address(0), 0);
    }

    function transferQuestionOwnership(uint256 opinionId, address newOwner) external nonReentrant whenNotPaused {
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.questionOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.questionOwner);
        
        address previousOwner = opinion.questionOwner;
        opinion.questionOwner = newOwner;
        
        // Clear any existing sale listing
        opinion.salePrice = 0;
        
        emit QuestionOwnershipTransferred(opinionId, previousOwner, newOwner);
    }

    function transferAnswerOwnership(uint256 opinionId, address newOwner) external nonReentrant whenNotPaused {
        if (newOwner == address(0)) revert ZeroAddressNotAllowed();
        
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound();
        if (opinion.currentAnswerOwner != msg.sender) revert NotTheOwner(msg.sender, opinion.currentAnswerOwner);
        
        address previousOwner = opinion.currentAnswerOwner;
        opinion.currentAnswerOwner = newOwner;
        
        emit AnswerOwnershipTransferred(opinionId, previousOwner, newOwner, block.timestamp);
    }

    // --- POOL INTEGRATION ---

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price
    ) external onlyPoolManager {
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

    function getAnswerHistory(uint256 opinionId) external view returns (OpinionStructs.AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    function getNextPrice(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        if (opinion.nextPrice == 0) {
            return _estimateNextPrice(opinion.lastPrice);
        }
        return opinion.nextPrice;
    }

    function getOpinionDetails(uint256 opinionId) external view returns (OpinionStructs.Opinion memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId];
    }

    function getTradeCount(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    function getCreatorGain(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].totalVolume;
    }

    function isPoolOwned(uint256 opinionId) external view returns (bool) {
        if (opinionId >= nextOpinionId) return false;
        return hasRole(POOL_MANAGER_ROLE, opinions[opinionId].currentAnswerOwner);
    }

    // --- INTERNAL INTERFACE IMPLEMENTATION ---

    function validateOpinionExists(uint256 opinionId) external view onlyLinkedContracts returns (bool) {
        return opinionId < nextOpinionId && opinions[opinionId].creator != address(0);
    }

    function getNextOpinionId() external view onlyLinkedContracts returns (uint256) {
        return nextOpinionId;
    }

    function updateCoreParameter(uint8 paramType, uint256 value) external onlyLinkedContracts {
        if (paramType == 0) minimumPrice = uint96(value);
        else if (paramType == 1) questionCreationFee = uint96(value);
        else if (paramType == 2) initialAnswerPrice = uint96(value);
        else if (paramType == 3) absoluteMaxPriceChange = value;
        else if (paramType == 4) maxTradesPerBlock = value;
        else if (paramType == 5) maxInitialPrice = uint96(value);
        
        emit ParameterUpdated(paramType, value);
    }

    function updateCoreParameterAddress(uint8 paramType, address value) external onlyLinkedContracts {
        if (paramType == 0) feeManager = IFeeManager(value);
        else if (paramType == 1) poolManager = IPoolManager(value);
        else if (paramType == 2) monitoringManager = IMonitoringManager(value);
        else if (paramType == 3) securityManager = ISecurityManager(value);
    }

    function getOpinionOwner(uint256 opinionId) external view onlyLinkedContracts returns (address) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].questionOwner;
    }

    function getOpinionCreator(uint256 opinionId) external view onlyLinkedContracts returns (address) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinions[opinionId].creator;
    }

    function isOpinionActive(uint256 opinionId) external view onlyLinkedContracts returns (bool) {
        if (opinionId >= nextOpinionId) return false;
        return opinions[opinionId].isActive;
    }

    function isPaused() external view returns (bool) {
        return paused();
    }

    // --- INTERNAL FUNCTIONS ---

    function _calculateCreationFee(uint96 initialPrice) internal pure returns (uint96) {
        uint96 percentageFee = uint96((initialPrice * 20) / 100); // 20% of initial price
        return percentageFee < 2_000_000 ? 2_000_000 : percentageFee; // MIN 2 USDC
    }

    function _basicValidation(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) internal view {
        // Validate categories with extensions contract
        require(extensionsContract.validateCategories(opinionCategories), "Invalid categories");
        
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        ValidationLibrary.validateDescription(description);
        
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > maxInitialPrice) {
            revert InvalidInitialPrice();
        }
    }

    function _validateExtras(string calldata ipfsHash, string calldata link) internal pure {
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);
        
        if (ipfsHashBytes.length > MAX_IPFS_HASH_LENGTH) {
            revert InvalidStringParameter("ipfsHash", "Too long");
        }
        if (linkBytes.length > MAX_LINK_LENGTH) {
            revert InvalidStringParameter("link", "Too long");
        }
    }

    function _createOpinionRecord(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice
    ) internal returns (uint256 opinionId) {
        opinionId = nextOpinionId++;

        OpinionStructs.Opinion storage newOpinion = opinions[opinionId];
        newOpinion.question = question;
        newOpinion.creator = msg.sender;
        newOpinion.questionOwner = msg.sender;
        newOpinion.isActive = true;
        
        newOpinion.currentAnswer = answer;
        newOpinion.currentAnswerDescription = description;
        newOpinion.currentAnswerOwner = msg.sender;
        newOpinion.ipfsHash = "";
        newOpinion.link = "";
        newOpinion.lastPrice = initialPrice;
        newOpinion.nextPrice = uint96(_estimateNextPrice(initialPrice));

        // Initialize answer history
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

    function _updateOpinionState(
        OpinionStructs.Opinion storage opinion,
        string calldata answer,
        string calldata description,
        string calldata link,
        uint96 price,
        address newOwner
    ) internal {
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.currentAnswerOwner = newOwner;
        opinion.link = link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;
        opinion.nextPrice = uint96(_calculateNextPrice(uint256(opinion.lastPrice), price));
    }

    function _estimateNextPrice(uint96 currentPrice) internal view returns (uint256) {
        // Simple estimation without activity data
        uint256 baseIncrease = (currentPrice * 110) / 100; // 10% increase
        if (baseIncrease > currentPrice + (currentPrice * absoluteMaxPriceChange / 100)) {
            return currentPrice + (currentPrice * absoluteMaxPriceChange / 100);
        }
        return baseIncrease;
    }

    function _calculateNextPrice(uint256 opinionId, uint256 currentPrice) internal view returns (uint256) {
        // Simple price calculation for now
        return _estimateNextPrice(uint96(currentPrice));
    }

    function _updatePriceMetadata(uint256 opinionId, uint256 newPrice) internal {
        uint256 metadata = priceMetadata[opinionId];
        metadata = (metadata << 24) | (block.timestamp & ((1 << 24) - 1));
        priceMetadata[opinionId] = metadata;
        
        uint256 history = priceHistory[opinionId];
        history = (history << 80);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function _checkAndUpdateTradesInBlock() internal {
        // Skip rate limiting if maxTradesPerBlock is 0
        if (maxTradesPerBlock == 0) return;
        
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

    // Removed stub functions to save space - functions moved to appropriate contracts

    // --- UUPS UPGRADE AUTHORIZATION ---
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
}