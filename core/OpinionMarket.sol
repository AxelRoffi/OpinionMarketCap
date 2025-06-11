// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Selective imports only for what we need
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {OpinionMarketErrors} from "./OpinionMarketErrors.sol";
import "./PoolLibrary.sol";
import "./CalculationLibrary.sol";
import "./OpinionMarketEvents.sol";
import "./PoolExecutionLibrary.sol";

contract OpinionMarket is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    OpinionMarketEvents
{
    using SafeERC20 for IERC20;
    using PoolLibrary for uint256;
    using CalculationLibrary for uint256;
    using PoolExecutionLibrary for uint256;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 100;
    uint256 public constant MAX_ANSWER_LENGTH = 100;
    uint256 public constant MAX_LINK_LENGTH = 256;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 64;

    // --- STATE VARIABLES  ---

    uint256 public minimumPrice;
    uint256 public platformFeePercent;
    uint256 public creatorFeePercent;
    uint256 public absoluteMaxPriceChange;
    uint256 public maxTradesPerBlock;
    uint256 public rapidTradeWindow;
    uint256 public questionCreationFee;
    uint256 public initialAnswerPrice;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // --- STATE VARIABLES --
    bool public isPublicCreationEnabled;
    uint256 public nextOpinionId;
    IERC20 public usdcToken;
    uint256 private nonce;
    mapping(address => uint256) public accumulatedFees;
    uint256 public totalAccumulatedFees;
    mapping(address => uint256) private userLastBlock;
    mapping(address => uint256) private userTradesInBlock;
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock;
    mapping(address => mapping(uint256 => uint256)) internal userLastTradeTime;
    mapping(address => mapping(uint256 => uint256)) internal userLastTradePrice;

    // --- STRUCTS ---
    struct Opinion {
        uint256 id;
        string question;
        address creator;
        uint256 lastPrice;
        uint256 nextPrice;
        bool isActive;
        string currentAnswer;
        address currentAnswerOwner;
        uint256 totalVolume;
        string ipfsHash;
        string link;
    }

    struct AnswerHistory {
        string answer;
        address owner;
        uint256 price;
        uint256 timestamp;
    }

    // --- MAPPINGS ---
    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => AnswerHistory[]) public answerHistory;

    // --- INITIALIZATION ---
    function initialize(address _usdcToken) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();

        // Explicitly grant all roles to the deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);

        // If USDC address is zero, we'll need to set it later
        if (_usdcToken != address(0)) {
            usdcToken = IERC20(_usdcToken);
        }

        // Initialize configurable values
        minimumPrice = 1_000_000;
        platformFeePercent = 2;
        creatorFeePercent = 3;
        absoluteMaxPriceChange = 200;
        maxTradesPerBlock = 3;
        rapidTradeWindow = 30 seconds;
        questionCreationFee = 1_000_000;
        initialAnswerPrice = 2_000_000;

        nextOpinionId = 1;
    }

    // --- UPGRADE AUTHORIZATION ---
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // --- ROLE MANAGEMENT ---
    function grantRole(
        bytes32 role,
        address account
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit RoleGranted(role, account);
    }

    function revokeRole(
        bytes32 role,
        address account
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleRevoked(role, account);
    }

    // --- SETTER FUNCTIONS FOR CONFIGURABLE PARAMETERS ---
    function setMinimumPrice(uint256 _newPrice) external onlyRole(ADMIN_ROLE) {
        minimumPrice = _newPrice;
        emit MinimumPriceUpdated(_newPrice);
    }

    function setPlatformFeePercent(
        uint256 _newPercent
    ) external onlyRole(ADMIN_ROLE) {
        platformFeePercent = _newPercent;
        emit PlatformFeePercentUpdated(_newPercent);
    }

    function setCreatorFeePercent(
        uint256 _newPercent
    ) external onlyRole(ADMIN_ROLE) {
        creatorFeePercent = _newPercent;
        emit CreatorFeePercentUpdated(_newPercent);
    }

    function setMaxPriceChange(
        uint256 _newPercent
    ) external onlyRole(ADMIN_ROLE) {
        absoluteMaxPriceChange = _newPercent;
        emit MaxPriceChangeUpdated(_newPercent);
    }

    function setMaxTradesPerBlock(
        uint256 _newCount
    ) external onlyRole(ADMIN_ROLE) {
        maxTradesPerBlock = _newCount;
        emit MaxTradesPerBlockUpdated(_newCount);
    }

    function setRapidTradeWindow(
        uint256 _newWindow
    ) external onlyRole(ADMIN_ROLE) {
        rapidTradeWindow = _newWindow;
        emit RapidTradeWindowUpdated(_newWindow);
    }

    function setQuestionCreationFee(
        uint256 _newFee
    ) external onlyRole(ADMIN_ROLE) {
        questionCreationFee = _newFee;
        emit QuestionCreationFeeUpdated(_newFee);
    }

    function setInitialAnswerPrice(
        uint256 _newPrice
    ) external onlyRole(ADMIN_ROLE) {
        initialAnswerPrice = _newPrice;
        emit InitialAnswerPriceUpdated(_newPrice);
    }

    // --- CORE MECHANICS ---
    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external whenNotPaused {
        if (!isPublicCreationEnabled && msg.sender != owner())
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.UNAUTHORIZED_CREATOR
            );

        // Validate basic parameters
        _validateBasicOpinionParams(question, initialAnswer);

        // Set creation fee and initial price
        uint256 creationFee = questionCreationFee;
        uint256 initialPrice = initialAnswerPrice;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.INSUFFICIENT_ALLOWANCE,
                creationFee,
                allowance
            );

        // Calculate fees
        (uint256 platformFee, uint256 creatorFee) = CalculationLibrary
            .calculateFees(initialPrice, platformFeePercent, creatorFeePercent);

        // Create opinion with empty ipfsHash and link
        uint256 opinionId = _createOpinionRecord(
            question,
            initialAnswer,
            "",
            "",
            initialPrice
        );

        // Handle transfers - just the creation fee
        usdcToken.safeTransferFrom(msg.sender, address(this), creationFee);
        usdcToken.safeTransfer(owner(), creationFee);

        // Emit events
        emit OpinionCreated(
            opinionId,
            question,
            initialPrice,
            msg.sender,
            "",
            ""
        );
        emit AnswerSubmitted(
            opinionId,
            initialAnswer,
            msg.sender,
            initialPrice
        );
        emit FeesDistributed(opinionId, platformFee, creatorFee, 0, address(0));
    }

    function createOpinionWithExtras(
        string calldata question,
        string calldata initialAnswer,
        string calldata ipfsHash,
        string calldata link
    ) external whenNotPaused {
        if (!isPublicCreationEnabled && msg.sender != owner())
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.UNAUTHORIZED_CREATOR
            );

        // Validate parameters
        _validateFullOpinionParams(question, initialAnswer, ipfsHash, link);

        // Set creation fee and initial price
        uint256 initialPrice = minimumPrice;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.INSUFFICIENT_ALLOWANCE,
                initialPrice,
                allowance
            );

        // Calculate fees
        (uint256 platformFee, uint256 creatorFee) = CalculationLibrary
            .calculateFees(initialPrice, platformFeePercent, creatorFeePercent);

        // Create opinion
        uint256 opinionId = _createOpinionRecord(
            question,
            initialAnswer,
            ipfsHash,
            link,
            initialPrice
        );

        // Handle transfers
        usdcToken.safeTransferFrom(msg.sender, address(this), initialPrice);
        usdcToken.safeTransfer(owner(), platformFee);
        usdcToken.safeTransfer(msg.sender, creatorFee);

        // Emit events
        emit OpinionCreated(
            opinionId,
            question,
            initialPrice,
            msg.sender,
            ipfsHash,
            link
        );
        emit AnswerSubmitted(
            opinionId,
            initialAnswer,
            msg.sender,
            initialPrice
        );
        emit FeesDistributed(opinionId, platformFee, creatorFee, 0, address(0));
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external virtual nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_ACTIVE
            );
        if (opinion.currentAnswerOwner == msg.sender)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.SAME_OWNER);

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.EMPTY_STRING);
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_ANSWER_LENGTH
            );

        // Use the stored next price instead of calculating it on the fly
        uint256 price = opinion.nextPrice;

        // If nextPrice is 0 (for older opinions before this update),
        // calculate it using the current price
        if (price == 0) {
            price = _calculateNextPrice(opinion.lastPrice);
        }

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.INSUFFICIENT_ALLOWANCE,
                price,
                allowance
            );

        // Calculate standard fees
        (uint256 platformFee, uint256 creatorFee) = CalculationLibrary
            .calculateFees(price, platformFeePercent, creatorFeePercent);
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Apply MEV penalty for rapid trading within window
        uint256 lastTradeTime = userLastTradeTime[msg.sender][opinionId];

        if (
            lastTradeTime > 0 &&
            block.timestamp - lastTradeTime < rapidTradeWindow
        ) {
            // Calculate potential profit & redirect to platform
            uint256 lastTradePrice = userLastTradePrice[msg.sender][opinionId];

            if (lastTradePrice > 0 && ownerAmount > lastTradePrice) {
                uint256 potentialProfit = ownerAmount - lastTradePrice;
                platformFee += potentialProfit;
                ownerAmount -= potentialProfit;
            } else {
                // If no profit, still apply a higher fee to discourage MEV
                uint256 mevPenalty = (price * 20) / 100; // 20% penalty
                if (mevPenalty > ownerAmount) {
                    mevPenalty = ownerAmount / 2; // Ensure some payment to previous owner
                }
                platformFee += mevPenalty;
                ownerAmount -= mevPenalty;
            }
        }

        // Update last trade info for future checks
        userLastTradeTime[msg.sender][opinionId] = block.timestamp;
        userLastTradePrice[msg.sender][opinionId] = ownerAmount;

        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;

        // Always accumulate fees - regardless of whether it's the same owner
        accumulatedFees[creator] += creatorFee;
        accumulatedFees[currentAnswerOwner] += ownerAmount;
        totalAccumulatedFees += creatorFee + ownerAmount;

        // Record answer history
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: answer,
                owner: msg.sender,
                price: price,
                timestamp: block.timestamp
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerOwner = msg.sender; // Always update owner, even if it's the same person
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Calculate and store the next price for future answers
        opinion.nextPrice = _calculateNextPrice(price);

        // Token transfers
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        usdcToken.safeTransfer(owner(), platformFee);

        emit FeesAccumulated(creator, creatorFee);
        emit FeesAccumulated(currentAnswerOwner, ownerAmount);
        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentAnswerOwner
        );
        emit AnswerSubmitted(opinionId, answer, msg.sender, price);
    }

    // --- SECURITY FEATURES ---
    function _checkAndUpdateTradesInBlock() internal {
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > maxTradesPerBlock) {
                revert OpinionMarketErrors.ERR_DATA(
                    OpinionMarketErrors.MAX_TRADES_PER_BLOCK_EXCEEDED,
                    userTradesInBlock[msg.sender],
                    maxTradesPerBlock
                );
            }
        }
    }

    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.ONE_TRADE_PER_BLOCK
            );
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    function _validateIpfsHash(string memory _ipfsHash) internal pure {
        PoolLibrary.validateIpfsHash(_ipfsHash);
    }

    function _validatePriceChange(
        uint256 lastPrice,
        uint256 newPrice
    ) internal view {
        (bool isValid, uint256 increase) = CalculationLibrary
            .validatePriceChange(lastPrice, newPrice, absoluteMaxPriceChange);

        if (!isValid) {
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.PRICE_CHANGE_EXCEEDS_LIMIT,
                increase,
                absoluteMaxPriceChange
            );
        }
    }

    function _validateBasicOpinionParams(
        string memory question,
        string memory initialAnswer
    ) internal pure {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length == 0 || answerBytes.length == 0)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.EMPTY_STRING);
        if (questionBytes.length > MAX_QUESTION_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_QUESTION_LENGTH
            );
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_ANSWER_LENGTH
            );
    }

    function _validateFullOpinionParams(
        string memory question,
        string memory initialAnswer,
        string memory ipfsHash,
        string memory link
    ) internal pure {
        // First validate basic parameters
        _validateBasicOpinionParams(question, initialAnswer);

        // Then validate IPFS hash and link
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > MAX_IPFS_HASH_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_IPFS_HASH_LENGTH
            );
        if (linkBytes.length > MAX_LINK_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_LINK_LENGTH
            );

        // Validate IPFS hash format if not empty
        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }
    }

    function _calculateFees(
        uint256 price
    ) internal view returns (uint256 platformFee, uint256 creatorFee) {
        return
            CalculationLibrary.calculateFees(
                price,
                platformFeePercent,
                creatorFeePercent
            );
    }

    function _createOpinionRecord(
        string memory question,
        string memory initialAnswer,
        string memory ipfsHash,
        string memory link,
        uint256 initialPrice
    ) internal returns (uint256) {
        uint256 opinionId = nextOpinionId++;
        Opinion storage opinion = opinions[opinionId];

        opinion.id = opinionId;
        opinion.question = question;
        opinion.creator = msg.sender;
        opinion.lastPrice = initialPrice;
        opinion.nextPrice = _calculateNextPrice(initialPrice);
        opinion.isActive = true;
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.totalVolume = initialPrice;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;

        answerHistory[opinionId].push(
            AnswerHistory({
                answer: initialAnswer,
                owner: msg.sender,
                price: initialPrice,
                timestamp: block.timestamp
            })
        );

        return opinionId;
    }

    function _calculateNextPrice(uint256 lastPrice) internal returns (uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    nonce++,
                    blockhash(block.number - 1),
                    gasleft(),
                    tx.gasprice,
                    address(this).balance,
                    block.number,
                    tx.origin,
                    address(this)
                )
            )
        );

        return
            CalculationLibrary.calculateNextPrice(
                lastPrice,
                seed,
                minimumPrice,
                absoluteMaxPriceChange
            );
    }

    function _estimateNextPrice(
        uint256 lastPrice
    ) internal pure returns (uint256) {
        return CalculationLibrary.estimateNextPrice(lastPrice);
    }

    // --- ADMIN FEATURES ---
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit PublicCreationToggled(isPublicCreationEnabled);
    }

    function deactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );
        opinions[opinionId].isActive = false;
        emit OpinionDeactivated(opinionId);
    }

    function reactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );

        Opinion storage opinion = opinions[opinionId];

        // Check if the opinion is already active
        if (opinion.isActive)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_ALREADY_ACTIVE
            );

        // Reactivate the opinion
        opinion.isActive = true;

        emit OpinionReactivated(opinionId);
    }

    function emergencyWithdraw(address token) external nonReentrant whenPaused {
        // Check if caller is owner OR has MODERATOR_ROLE
        if (msg.sender != owner() && !hasRole(MODERATOR_ROLE, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, MODERATOR_ROLE);
        }

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        tokenContract.safeTransfer(owner(), balance);
        emit EmergencyWithdraw(token, balance, block.timestamp);
    }

    // --- VIEW FUNCTIONS ---
    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );
        return answerHistory[opinionId];
    }

    function getTradeCount(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );
        return answerHistory[opinionId].length;
    }

    function getCreatorGain(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );
        Opinion storage opinion = opinions[opinionId];
        return (opinion.totalVolume * creatorFeePercent) / 100;
    }

    function getRemainingBlockTrades(
        address user
    ) external view returns (uint256) {
        if (userLastBlock[user] != block.number) {
            return maxTradesPerBlock;
        }
        return maxTradesPerBlock - userTradesInBlock[user];
    }

    function getNextPrice(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_FOUND
            );
        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_ACTIVE
            );

        // If nextPrice is 0 (for older opinions), return an estimate
        if (opinion.nextPrice == 0) {
            return CalculationLibrary.estimateNextPrice(opinion.lastPrice);
        }

        return opinion.nextPrice;
    }

    function setUsdcToken(address _usdcToken) external onlyRole(ADMIN_ROLE) {
        require(address(usdcToken) == address(0), "USDC already set");
        require(_usdcToken != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcToken);
    }
}
