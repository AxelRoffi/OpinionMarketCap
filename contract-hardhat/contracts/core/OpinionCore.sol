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
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
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

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    IFeeManager public feeManager;
    IPoolManager public poolManager;

    bool public isPublicCreationEnabled;
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
        address _poolManager
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
            _poolManager == address(0)
        ) revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);

        // Initialize parameters
        nextOpinionId = 1;
        isPublicCreationEnabled = false;
        maxTradesPerBlock = 3;
        minimumPrice = 1_000_000; // 1 USDC (6 decimals)
        questionCreationFee = 1_000_000; // 1 USDC
        initialAnswerPrice = 2_000_000; // 2 USDC
        absoluteMaxPriceChange = 200; // 200%
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

    // --- EXTERNAL FUNCTIONS ---
    /**
     * @dev Creates a new opinion
     * @param question The opinion question
     * @param initialAnswer The initial answer
     */
    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external override nonReentrant whenNotPaused {
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Validate basic parameters
        ValidationLibrary.validateOpinionParams(
            question,
            initialAnswer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < questionCreationFee)
            revert InsufficientAllowance(questionCreationFee, allowance);

        // Create opinion with empty ipfsHash and link
        uint256 opinionId = _createOpinionRecord(
            question,
            initialAnswer,
            "",
            "",
            initialAnswerPrice
        );

        // Handle transfers - just the creation fee
        usdcToken.safeTransferFrom(
            msg.sender,
            address(this),
            questionCreationFee
        );

        // Send creation fee to the dao/platform
        address treasury = hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
            ? msg.sender
            : _msgSender();
        usdcToken.safeTransfer(treasury, questionCreationFee);

        // Emit events
        emit OpinionAction(
            opinionId,
            0,
            question,
            msg.sender,
            initialAnswerPrice
        );
        emit OpinionAction(
            opinionId,
            1,
            initialAnswer,
            msg.sender,
            initialAnswerPrice
        );
    }

    /**
     * @dev Creates a new opinion with IPFS hash and link
     * @param question The opinion question
     * @param initialAnswer The initial answer
     * @param ipfsHash The IPFS hash for an image
     * @param link The external URL link
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata initialAnswer,
        string calldata ipfsHash,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // Validate parameters
        ValidationLibrary.validateOpinionParams(
            question,
            initialAnswer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );

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

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialAnswerPrice)
            revert InsufficientAllowance(initialAnswerPrice, allowance);

        // Calculate fees using FeeManager
        OpinionStructs.FeeDistribution memory fees = feeManager.calculateFees(
            initialAnswerPrice
        );

        // Create opinion
        uint256 opinionId = _createOpinionRecord(
            question,
            initialAnswer,
            ipfsHash,
            link,
            initialAnswerPrice
        );

        // Handle transfers
        usdcToken.safeTransferFrom(
            msg.sender,
            address(this),
            initialAnswerPrice
        );

        // Distribution of fees
        // Platform fee (keep in contract for now)
        // Creator fees accumulated
        feeManager.accumulateFee(msg.sender, fees.creatorFee);

        // Emit events
        emit OpinionAction(
            opinionId,
            0,
            question,
            msg.sender,
            initialAnswerPrice
        );
        emit OpinionAction(
            opinionId,
            1,
            initialAnswer,
            msg.sender,
            initialAnswerPrice
        );
        emit FeesAction(
            opinionId,
            0,
            address(0),
            initialAnswerPrice,
            fees.platformFee,
            fees.creatorFee,
            fees.ownerAmount
        );
    }

    /**
     * @dev Submits a new answer to an opinion
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
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
                owner: msg.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Calculate and store the next price for future answers
        opinion.nextPrice = uint96(_calculateNextPrice(opinionId, price));

        // Token transfers
        usdcToken.safeTransferFrom(msg.sender, address(this), price);

        // No direct transfer here. Fees will be claimed separately.

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
     * @param price The price paid
     */
    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        uint256 price
    ) external override onlyPoolManager {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // Record answer history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                owner: address(poolManager),
                price: uint96(price),
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
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

    // --- INTERNAL FUNCTIONS ---
    /**
     * @dev Creates a new opinion record
     */
    function _createOpinionRecord(
        string memory question,
        string memory initialAnswer,
        string memory ipfsHash,
        string memory link,
        uint96 initialPrice
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
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: initialAnswer,
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
}
