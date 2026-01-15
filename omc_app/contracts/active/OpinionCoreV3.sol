// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

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
 * @title OpinionCoreV3
 * @dev Core trading contract - UPGRADED VERSION WITH DYNAMIC PRICING
 *
 * V3 Changes:
 * - Integrated PriceCalculator library for dynamic market regime pricing
 * - 4 market regimes: CONSOLIDATION, BULLISH_TRENDING, MILD_CORRECTION, PARABOLIC
 * - Price changes now range from -20% to +80% based on market conditions
 * - Activity-based regime selection (cold/warm/hot topics)
 * - Anti-bot protection and volatility damping
 *
 * V2 Changes (inherited):
 * - Fixed fee transfer: fees now properly sent to FeeManager
 * - Added pause()/unpause() admin functions
 * - Added emergencyWithdraw() function
 * - Added rescueStuckFees() to recover fees from V1
 */
contract OpinionCoreV3 is
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

    // Price calculation - used by PriceCalculator library
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

    // --- V3 EVENTS ---
    event PriceCalculated(uint256 indexed opinionId, uint256 oldPrice, uint256 newPrice, uint256 nonce);

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
        if (bytes(answer).length < 2 || bytes(answer).length > MAX_ANSWER_LENGTH) {
            revert InvalidStringParameter("answer", "Length out of bounds");
        }
        ValidationLibrary.validateDescription(description);
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

        // Transfer to previous answer owner (95%)
        if (ownerAmount > 0) {
            usdcToken.safeTransfer(opinion.currentAnswerOwner, ownerAmount);
        }

        // Transfer fees to FeeManager (5% = 2% platform + 3% creator)
        uint96 totalFees = platformFee + creatorFee;
        if (totalFees > 0) {
            usdcToken.safeTransfer(address(feeManager), totalFees);
        }

        // Record creator fee in FeeManager for claiming
        if (creatorFee > 0) {
            feeManager.accumulateFee(opinion.creator, creatorFee);
        }

        // Update opinion state with dynamic pricing
        _updateOpinionState(opinion, opinionId, answer, description, link, price, msg.sender);

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

        // V3: Use dynamic pricing from PriceCalculator
        opinion.nextPrice = uint96(_calculateNextPriceDynamic(opinionId, price));

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
            return _estimateNextPriceView(opinion.lastPrice);
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

    // --- V3 VIEW FUNCTIONS ---

    /**
     * @dev Get current nonce for price calculation entropy
     */
    function getPriceNonce() external view returns (uint256) {
        return nonce;
    }

    /**
     * @dev Get price metadata for an opinion (used by PriceCalculator)
     */
    function getPriceMetadata(uint256 opinionId) external view returns (uint256) {
        return priceMetadata[opinionId];
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
        require(extensionsContract.validateCategories(opinionCategories), "Invalid categories");
        ValidationLibrary.validateOpinionParams(question, answer, MAX_QUESTION_LENGTH, MAX_ANSWER_LENGTH);
        ValidationLibrary.validateDescription(description);

        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > maxInitialPrice) {
            revert InvalidInitialPrice();
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

        // V3: Use dynamic pricing for initial nextPrice estimation
        newOpinion.nextPrice = uint96(_estimateNextPriceView(initialPrice));

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
        uint256 opinionId,
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

        // V3: Use PriceCalculator for dynamic next price
        opinion.nextPrice = uint96(_calculateNextPriceDynamic(opinionId, price));

        emit PriceCalculated(opinionId, price, opinion.nextPrice, nonce);
    }

    /**
     * @dev V3: Calculate next price using PriceCalculator with market regimes
     * Uses 4 market regimes with activity-based selection:
     * - CONSOLIDATION (25%): -10% to +15%
     * - BULLISH_TRENDING (60%): +5% to +40%
     * - MILD_CORRECTION (15%): -20% to +5%
     * - PARABOLIC (2%): +40% to +80%
     */
    function _calculateNextPriceDynamic(uint256 opinionId, uint256 currentPrice) internal returns (uint256) {
        // Increment nonce for entropy
        nonce++;

        // Use PriceCalculator library for dynamic market simulation
        uint256 newPrice = PriceCalculator.calculateNextPrice(
            opinionId,
            currentPrice,
            minimumPrice,
            absoluteMaxPriceChange,
            nonce,
            priceMetadata,
            priceHistory
        );

        return newPrice;
    }

    /**
     * @dev V3: View-only estimation for getNextPrice (cannot use PriceCalculator as it's not view)
     * Returns a reasonable estimate based on current activity
     */
    function _estimateNextPriceView(uint96 currentPrice) internal view returns (uint256) {
        // For view functions, we use a simplified estimation
        // The actual dynamic calculation happens in _calculateNextPriceDynamic

        // Check activity level from metadata
        uint256 meta = priceMetadata[0]; // Use opinion 0 as proxy or could be passed
        uint8 tradeCount = uint8(meta);

        // Activity-based estimation:
        // - Cold (< 5 trades): Conservative +10%
        // - Warm (5-15 trades): Moderate +15%
        // - Hot (> 15 trades): Bullish +25%
        uint256 increasePercent;
        if (tradeCount < 5) {
            increasePercent = 10; // Cold: 10% increase
        } else if (tradeCount < 15) {
            increasePercent = 15; // Warm: 15% increase
        } else {
            increasePercent = 25; // Hot: 25% increase
        }

        uint256 baseIncrease = (currentPrice * (100 + increasePercent)) / 100;

        // Cap at maximum price change
        uint256 maxAllowed = currentPrice + (currentPrice * absoluteMaxPriceChange / 100);
        if (baseIncrease > maxAllowed) {
            return maxAllowed;
        }

        // Ensure minimum price
        if (baseIncrease < minimumPrice) {
            return minimumPrice;
        }

        return baseIncrease;
    }

    function _updatePriceMetadata(uint256 opinionId, uint256 newPrice) internal {
        // Update trade count and timestamp in metadata
        uint256 metadata = priceMetadata[opinionId];
        uint8 tradeCount = uint8(metadata);

        // Increment trade count (max 255)
        if (tradeCount < 255) {
            tradeCount++;
        }

        // Pack: tradeCount (8 bits) | timestamp (24 bits) | reserved
        metadata = uint256(tradeCount) | (block.timestamp << 8);
        priceMetadata[opinionId] = metadata;

        // Update price history (stores last 3 prices in 80-bit slots)
        uint256 history = priceHistory[opinionId];
        history = (history << 80);
        history |= (newPrice & ((1 << 80) - 1));
        priceHistory[opinionId] = history;
    }

    function _checkAndUpdateTradesInBlock() internal {
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

    // --- V2/V3 ADMIN FUNCTIONS ---

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    function emergencyWithdraw(address token, address to, uint256 amount) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Zero address");

        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit EmergencyWithdrawal(token, to, amount, block.timestamp);
    }

    function rescueStuckFees() external onlyRole(ADMIN_ROLE) {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No fees to rescue");

        usdcToken.safeTransfer(address(feeManager), balance);

        emit EmergencyWithdrawal(address(usdcToken), address(feeManager), balance, block.timestamp);
    }

    // --- UUPS UPGRADE AUTHORIZATION ---
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // --- ADMIN TRANSFER ---
    function transferFullAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _grantRole(ADMIN_ROLE, newAdmin);
        _grantRole(MODERATOR_ROLE, newAdmin);
        _revokeRole(MODERATOR_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
