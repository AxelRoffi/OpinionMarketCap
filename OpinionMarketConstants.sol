// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OpinionMarket
 * @dev A decentralized platform for exchanging opinions, where users can buy the right to answer questions.
 * The contract is UUPS upgradeable, uses role-based access control, and includes security and gas optimizations.
 */
contract OpinionMarket is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // --- CONSTANTS ---
    uint256 public constant MAX_QUESTION_LENGTH = 50;
    uint256 public constant MAX_ANSWER_LENGTH = 40;
    uint256 public constant MINIMUM_PRICE = 1_000_000; // 1 USDC (6 decimals)
    uint256 public constant PLATFORM_FEE_PERCENT = 2; // 2%
    uint256 public constant CREATOR_FEE_PERCENT = 3; // 3%
    uint256 public constant ABSOLUTE_MAX_PRICE_CHANGE = 200; // 200%
    uint256 public constant MAX_TRADES_PER_BLOCK = 3;
    uint256 public constant RAPID_TRADE_WINDOW = 30 seconds; // Short window for MEV protection
    uint256 public constant MAX_LINK_LENGTH = 256;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 64;
    uint256 public constant QUESTION_CREATION_FEE = 1_000_000; // 1 USDC (6 decimals)
    uint256 public constant INITIAL_ANSWER_PRICE = 2_000_000; // 2 USDC (6 decimals)

    // --- POOL CONSTANTS ---
    uint256 public constant MAX_POOL_NAME_LENGTH = 30;
    uint256 public constant POOL_CREATION_FEE = 50 * 10 ** 6; // 50 USDC
    uint256 public constant POOL_CONTRIBUTION_FEE = 1 * 10 ** 6; // 1 USDC
    uint256 public constant MIN_POOL_DURATION = 1 days;
    uint256 public constant MAX_POOL_DURATION = 30 days;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // --- STATE VARIABLES ---
    bool public isPublicCreationEnabled; // Toggle for public opinion creation
    uint256 public nextOpinionId; // Tracks next opinion ID
    IERC20 public usdcToken; // USDC token for payments
    uint256 private nonce; // Nonce for random number generation
    mapping(address => uint256) public accumulatedFees; // Accumulated fees per user
    uint256 public totalAccumulatedFees; // Total fees accumulated
    mapping(address => uint256) private userLastBlock; // Last block a user traded
    mapping(address => uint256) private userTradesInBlock; // Trades per user in current block
    mapping(address => mapping(uint256 => uint256)) private userLastTradeBlock; // Last trade block per user per opinion
    mapping(address => mapping(uint256 => uint256)) private userLastTradeTime;
    mapping(address => mapping(uint256 => uint256)) private userLastTradePrice;

    // --- POOL STATE VARIABLES ---
    uint256 public poolCount;
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => PoolContribution[]) private poolContributions;
    mapping(uint256 => mapping(address => uint256))
        public poolContributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => uint256[]) public opinionPools;
    mapping(address => uint256[]) public userPools;

    // --- STRUCTS ---
    struct Opinion {
        uint256 id; // Unique opinion ID
        string question; // Opinion question (max 50 chars)
        address creator; // Opinion creator
        uint256 lastPrice; // Current price to submit an answer
        uint256 nextPrice; // Next price for submitting an answer
        bool isActive; // Opinion status
        string currentAnswer; // Current answer (max 40 chars)
        address currentAnswerOwner; // Owner of current answer
        uint256 totalVolume; // Total volume of trades
        string ipfsHash; // IPFS hash pointing to an image (max 64 chars)
        string link; // Associated URL (max 256 chars)
    }

    struct AnswerHistory {
        string answer; // Historical answer
        address owner; // Answer owner
        uint256 price; // Price paid
        uint256 timestamp; // Submission timestamp
    }

    enum PoolStatus {
        Active,
        Executed,
        Expired,
        Extended
    }

    struct PoolInfo {
        uint256 id; // Unique pool ID
        uint256 opinionId; // Opinion this pool is for
        string proposedAnswer; // Answer the pool is proposing
        uint256 totalAmount; // Total USDC contributed
        uint256 deadline; // Timestamp when pool expires
        address creator; // Pool creator
        PoolStatus status; // Current pool status
        string name; // Pool name (max 30 chars)
        string ipfsHash; // Pool image IPFS hash
    }

    struct PoolContribution {
        address contributor;
        uint256 amount;
    }

    // --- MAPPINGS ---
    mapping(uint256 => Opinion) public opinions; // Opinion ID to Opinion data
    mapping(uint256 => AnswerHistory[]) public answerHistory; // Opinion ID to answer history

    // --- ERRORS ---
    error ContractPaused();
    error ContractNotPaused();
    error WithdrawalFailed();
    error EmptyString();
    error InvalidQuestionLength();
    error InvalidAnswerLength();
    error InvalidPrice();
    error UnauthorizedCreator();
    error OpinionNotActive();
    error TransferFailed();
    error OpinionNotFound();
    error InsufficientAllowance(uint256 required, uint256 provided);
    error OneTradePerBlock();
    error PriceChangeExceedsLimit(uint256 increase, uint256 limit);
    error MaxTradesPerBlockExceeded(uint256 current, uint256 max);
    error NoFeesToClaim();
    error InvalidLinkLength();
    error InvalidIpfsHashLength();
    error InvalidIpfsHashFormat();
    error OpinionAlreadyActive();
    error SameOwner();

    // --- POOL ERRORS ---
    error PoolInvalidOpinionId(uint256 opinionId);
    error PoolSameAnswerAsCurrentAnswer(uint256 opinionId, string answer);
    error PoolDeadlineTooShort(uint256 deadline, uint256 minDuration);
    error PoolDeadlineTooLong(uint256 deadline, uint256 maxDuration);
    error PoolInitialContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInvalidProposedAnswer();
    error PoolInvalidPoolId(uint256 poolId);
    error PoolNotActive(uint256 poolId, uint8 status);
    error PoolDeadlinePassed(uint256 poolId, uint256 deadline);
    error PoolContributionTooLow(uint256 provided, uint256 minimum);
    error PoolInsufficientFunds(uint256 current, uint256 target);
    error PoolExecutionFailed(uint256 poolId);
    error PoolAlreadyExecuted(uint256 poolId);
    error PoolNoContribution(uint256 poolId, address user);
    error PoolNotExpired(uint256 poolId, uint256 deadline);
    error PoolAlreadyRefunded(uint256 poolId, address user);
    error PoolInvalidNameLength();
    error PoolAlreadyFunded(uint256 poolId);

    // --- EVENTS ---
    event OpinionCreated(
        uint256 indexed id,
        string question,
        uint256 initialPrice,
        address creator,
        string ipfsHash,
        string link
    );
    event PublicCreationToggled(bool isEnabled);
    event AnswerSubmitted(
        uint256 indexed opinionId,
        string answer,
        address owner,
        uint256 price
    );
    event OpinionDeactivated(uint256 indexed opinionId);
    event FeesDistributed(
        uint256 indexed opinionId,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount,
        address currentOwner
    );
    event EmergencyWithdraw(address token, uint256 amount, uint256 timestamp);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event FeesAccumulated(address indexed user, uint256 amount);
    event FeesClaimed(address indexed user, uint256 amount);
    event OpinionReactivated(uint256 indexed opinionId);

    // --- POOL EVENTS ---
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 initialContribution,
        address creator,
        uint256 deadline,
        string name,
        string ipfsHash
    );
    event PoolContributed(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address contributor,
        uint256 amount,
        uint256 newTotalAmount
    );
    event PoolExecuted(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        string proposedAnswer,
        uint256 priceAtExecution
    );
    event PoolAnswerPurchased(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address newOwner,
        uint256 purchasePrice,
        uint256 totalRewardAmount
    );
    event PoolCreatorBadgeAwarded(
        address indexed creator,
        uint256 indexed poolId
    );

    event PoolExpired(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        uint256 totalAmount,
        uint256 contributorCount
    );

    event PoolExtended(
        uint256 indexed poolId,
        uint256 newDeadline,
        address extender
    );

    event PoolRefundIssued(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount
    );

    event PoolRewardDistributed(
        uint256 indexed poolId,
        address indexed contributor,
        uint256 contributionAmount,
        uint256 sharePercentage,
        uint256 rewardAmount
    );

    // --- INITIALIZATION ---
    /**
     * @dev Initializes the contract with the USDC token address and sets up roles.
     * @param _usdcToken Address of the USDC token contract.
     */
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

        nextOpinionId = 1;
    }

    // --- UPGRADE AUTHORIZATION ---
    /**
     * @dev Authorizes contract upgrades, restricted to the owner.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // --- ROLE MANAGEMENT ---
    /**
     * @dev Grants a role to an account, restricted to DEFAULT_ADMIN_ROLE.
     */
    function grantRole(
        bytes32 role,
        address account
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit RoleGranted(role, account);
    }

    /**
     * @dev Revokes a role from an account, restricted to DEFAULT_ADMIN_ROLE.
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleRevoked(role, account);
    }

    // --- CORE MECHANICS ---

    /**
     * @dev Internal implementation of opinion creation
     * @dev Creates a new opinion with a question, initial answer, IPFS hash, and link.
     * @param question The opinion question.
     * @param initialAnswer The initial answer.
     * @param ipfsHash The IPFS hash for an image.
     * @param link The external URL link.
     */
    /**
     *
     */

    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external whenNotPaused {
        if (!isPublicCreationEnabled && msg.sender != owner())
            revert UnauthorizedCreator();

        // Validate basic parameters
        _validateBasicOpinionParams(question, initialAnswer);

        // Set creation fee and initial price
        uint256 creationFee = QUESTION_CREATION_FEE;
        uint256 initialPrice = INITIAL_ANSWER_PRICE;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert InsufficientAllowance(creationFee, allowance);

        // Calculate fees
        (uint256 platformFee, uint256 creatorFee) = _calculateFees(
            initialPrice
        );

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

    /**
     * @dev Creates a new opinion with a question, initial answer, IPFS hash, and link.
     * @param question The opinion question.
     * @param initialAnswer The initial answer.
     * @param ipfsHash The IPFS hash for an image.
     * @param link The external URL link.
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata initialAnswer,
        string calldata ipfsHash,
        string calldata link
    ) public whenNotPaused {
        if (!isPublicCreationEnabled && msg.sender != owner())
            revert UnauthorizedCreator();

        // Validate parameters
        _validateFullOpinionParams(question, initialAnswer, ipfsHash, link);

        // Set creation fee and initial price
        uint256 initialPrice = MINIMUM_PRICE;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice)
            revert InsufficientAllowance(initialPrice, allowance);

        // Calculate fees
        (uint256 platformFee, uint256 creatorFee) = _calculateFees(
            initialPrice
        );

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

    /**
     * @dev Creates a new pool to collectively fund an answer change
     */
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) external nonReentrant whenNotPaused {
        // Validate parameters
        _validatePoolCreationParams(
            opinionId,
            proposedAnswer,
            deadline,
            initialContribution,
            name,
            ipfsHash
        );

        // Calculate total required amount
        uint256 totalRequired = POOL_CREATION_FEE + initialContribution;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalRequired)
            revert InsufficientAllowance(totalRequired, allowance);

        // Create the pool and get pool ID
        uint256 poolId = _createPoolRecord(
            opinionId,
            proposedAnswer,
            deadline,
            initialContribution,
            name,
            ipfsHash
        );

        // Handle funds transfer
        _handlePoolCreationFunds(
            opinionId,
            poolId,
            totalRequired,
            initialContribution
        );
    }

    /**
     * @dev Allows users to contribute to an existing pool
     */
    function contributeToPool(
        uint256 poolId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        // Validation (with potentially lower minimum)
        uint256 actualAmount = _validatePoolContribution(poolId, amount);

        // Add contribution fee
        uint256 totalRequired = actualAmount + POOL_CONTRIBUTION_FEE;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalRequired)
            revert InsufficientAllowance(totalRequired, allowance);

        // Update pool state and get opinion ID
        uint256 opinionId = _updatePoolForContribution(poolId, actualAmount);

        // Transfer funds (including contribution fee)
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Handle the fee distribution among three parties
        _handleContributionFee(opinionId, poolId, POOL_CONTRIBUTION_FEE);

        // Check if pool has reached target price and execute if so
        _checkAndExecutePoolIfReady(poolId, opinionId);
    }

    function _handleContributionFee(
        uint256 opinionId,
        uint256 poolId,
        uint256 fee
    ) internal {
        // Get the opinion creator and pool creator
        address questionCreator = opinions[opinionId].creator;
        address poolCreator = pools[poolId].creator;

        // Calculate shares (equally split three ways)
        uint256 platformShare = fee / 3;
        uint256 questionCreatorShare = fee / 3;
        uint256 poolCreatorShare = fee - platformShare - questionCreatorShare; // Handle any rounding

        // Transfer platform share
        usdcToken.safeTransfer(owner(), platformShare);

        // Accumulate creator fees
        accumulatedFees[questionCreator] += questionCreatorShare;
        accumulatedFees[poolCreator] += poolCreatorShare;
        totalAccumulatedFees += questionCreatorShare + poolCreatorShare;

        // Emit events
        emit FeesAccumulated(questionCreator, questionCreatorShare);
        emit FeesAccumulated(poolCreator, poolCreatorShare);
    }

    /**
     * @dev Internal function to execute a pool when target price is reached
     */
    function _executePool(uint256 poolId) internal {
        // Get pool and validate status
        PoolInfo storage pool = pools[poolId];
        if (pool.status != PoolStatus.Active)
            revert PoolNotActive(poolId, uint8(pool.status));

        // Get opinion details
        uint256 opinionId = pool.opinionId;
        Opinion storage opinion = opinions[opinionId];

        // Calculate execution price and validate funds
        uint256 targetPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : _calculateNextPrice(opinion.lastPrice);
        if (pool.totalAmount < targetPrice)
            revert PoolInsufficientFunds(pool.totalAmount, targetPrice);

        // Process the execution
        _processPoolExecution(poolId, opinionId, targetPrice);
    }

    /**
     * @dev Process the actual pool execution
     */
    function _processPoolExecution(
        uint256 poolId,
        uint256 opinionId,
        uint256 targetPrice
    ) internal {
        PoolInfo storage pool = pools[poolId];
        Opinion storage opinion = opinions[opinionId];

        // Calculate fees
        uint256 platformFee = (targetPrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (targetPrice * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = targetPrice - platformFee - creatorFee;

        // Track the current owner to distribute fees
        address currentOwner = opinion.currentAnswerOwner;

        // Update answer history
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: pool.proposedAnswer,
                owner: address(this), // Contract becomes the owner on behalf of the pool
                price: targetPrice,
                timestamp: block.timestamp
            })
        );

        // Update opinion state
        opinion.currentAnswer = pool.proposedAnswer;
        opinion.currentAnswerOwner = address(this); // Contract holds ownership for the pool
        opinion.lastPrice = targetPrice;
        opinion.nextPrice = _calculateNextPrice(targetPrice);
        opinion.totalVolume += targetPrice;

        // Accumulate fees for creator and current owner
        accumulatedFees[opinion.creator] += creatorFee;
        accumulatedFees[currentOwner] += ownerAmount;
        totalAccumulatedFees += creatorFee + ownerAmount;

        // Update pool status
        pool.status = PoolStatus.Executed;

        // Transfer platform fee to owner
        usdcToken.safeTransfer(owner(), platformFee);

        // Emit events
        _emitPoolExecutionEvents(
            poolId,
            opinionId,
            targetPrice,
            platformFee,
            creatorFee,
            ownerAmount,
            currentOwner
        );
    }

    /**
     * @dev Emit all events related to pool execution
     */
    function _emitPoolExecutionEvents(
        uint256 poolId,
        uint256 opinionId,
        uint256 targetPrice,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount,
        address currentOwner
    ) internal {
        PoolInfo storage pool = pools[poolId];

        emit PoolExecuted(poolId, opinionId, pool.proposedAnswer, targetPrice);

        emit AnswerSubmitted(
            opinionId,
            pool.proposedAnswer,
            address(this),
            targetPrice
        );

        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentOwner
        );

        emit FeesAccumulated(opinions[opinionId].creator, creatorFee);
        emit FeesAccumulated(currentOwner, ownerAmount);

        // Award pool creator badge through an event
        emit PoolCreatorBadgeAwarded(pool.creator, poolId);
    }

    /**
     * @dev Checks if a pool has expired and updates its status
     * @param poolId The ID of the pool to check
     * @return Whether the pool is expired
     */
    function checkPoolExpiry(uint256 poolId) public returns (bool) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolInfo storage pool = pools[poolId];

        // Only check active pools
        if (pool.status != PoolStatus.Active) {
            return pool.status == PoolStatus.Expired;
        }

        // Check if deadline has passed
        if (block.timestamp > pool.deadline) {
            pool.status = PoolStatus.Expired;

            emit PoolExpired(
                poolId,
                pool.opinionId,
                pool.totalAmount,
                poolContributors[poolId].length
            );

            return true;
        }

        return false;
    }

    /**
     * @dev Allows contributor to withdraw their funds from an expired pool
     * @param poolId The ID of the expired pool
     */
    function withdrawFromExpiredPool(
        uint256 poolId
    ) external nonReentrant whenNotPaused {
        // Validate pool ID
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        // Get pool information
        PoolInfo storage poolInfo = pools[poolId];

        // Check pool expiry status
        bool isExpired = poolInfo.status == PoolStatus.Expired;
        if (!isExpired) {
            // If not already marked as expired, check if it should be
            isExpired = block.timestamp > poolInfo.deadline;

            if (isExpired) {
                // Update pool status if expired
                poolInfo.status = PoolStatus.Expired;
            }
        }

        // Revert if pool is not expired
        if (!isExpired) revert PoolNotExpired(poolId, poolInfo.deadline);

        // Get user's contribution amount
        uint256 userContribution = poolContributionAmounts[poolId][msg.sender];
        if (userContribution == 0)
            revert PoolNoContribution(poolId, msg.sender);

        // Reset user's contribution before transfer (checks-effects-interactions pattern)
        poolContributionAmounts[poolId][msg.sender] = 0;

        // Transfer funds back to contributor
        usdcToken.safeTransfer(msg.sender, userContribution);

        // Emit refund event
        emit PoolRefundIssued(poolId, msg.sender, userContribution);
    }

    /**
     * @dev Extends the deadline of a pool
     * @param poolId The ID of the pool to extend
     * @param newDeadline The new deadline timestamp
     */
    function extendPoolDeadline(
        uint256 poolId,
        uint256 newDeadline
    ) external nonReentrant whenNotPaused {
        // Validate pool ID
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        // Get pool information
        PoolInfo storage poolInfo = pools[poolId];

        // Ensure pool is still active or recently expired
        require(
            poolInfo.status == PoolStatus.Active ||
                poolInfo.status == PoolStatus.Expired,
            "Pool cannot be extended"
        );

        // Validate new deadline
        require(
            newDeadline > poolInfo.deadline &&
                newDeadline <= block.timestamp + 30 days,
            "Invalid new deadline"
        );

        // Ensure current deadline hasn't passed by too much
        require(
            block.timestamp <= poolInfo.deadline + 7 days,
            "Pool expired too long ago"
        );

        // Update pool deadline and status
        poolInfo.deadline = newDeadline;
        poolInfo.status = PoolStatus.Extended;

        // Emit event for deadline extension
        emit PoolExtended(poolId, newDeadline, msg.sender);
    }

    /**
     * @dev Distributes rewards when a pool-owned answer is purchased
     * This function is called internally from submitAnswer when buying a pool-owned answer
     * @param opinionId The ID of the opinion
     * @param purchasePrice The price paid for the answer
     * @param buyer The address of the buyer
     */
    function _distributePoolRewards(
        uint256 opinionId,
        uint256 purchasePrice,
        address buyer
    ) internal {
        Opinion storage opinion = opinions[opinionId];

        // Check if current owner is this contract (pool owned)
        if (opinion.currentAnswerOwner != address(this)) return;

        // Find the pools that own this opinion's answer
        uint256[] memory poolsForOpinion = opinionPools[opinionId];

        // Find the executed pool that owns this answer
        uint256 ownerPoolId;
        bool foundPool = false;

        for (uint256 i = 0; i < poolsForOpinion.length; i++) {
            uint256 poolId = poolsForOpinion[i];
            PoolInfo storage pool = pools[poolId];

            if (
                pool.status == PoolStatus.Executed &&
                keccak256(bytes(pool.proposedAnswer)) ==
                keccak256(bytes(opinion.currentAnswer))
            ) {
                ownerPoolId = poolId;
                foundPool = true;
                break;
            }
        }

        if (!foundPool) return;

        // Calculate owner amount (after platform and creator fees)
        uint256 platformFee = (purchasePrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (purchasePrice * CREATOR_FEE_PERCENT) / 100;
        uint256 rewardAmount = purchasePrice - platformFee - creatorFee;

        // Get pool contributors and their contribution amounts
        address[] memory contributors = poolContributors[ownerPoolId];
        uint256 totalContributed = pools[ownerPoolId].totalAmount;

        // Distribute rewards proportionally
        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 contribution = poolContributionAmounts[ownerPoolId][
                contributor
            ];

            if (contribution > 0) {
                // Calculate contributor's share
                uint256 share = (contribution * 100) / totalContributed;
                uint256 reward = (rewardAmount * share) / 100;

                // Accumulate reward to contributor
                accumulatedFees[contributor] += reward;
                totalAccumulatedFees += reward;

                emit PoolRewardDistributed(
                    ownerPoolId,
                    contributor,
                    contribution,
                    share,
                    reward
                );
            }
        }

        emit PoolAnswerPurchased(
            ownerPoolId,
            opinionId,
            buyer,
            purchasePrice,
            rewardAmount
        );
    }

    /**
     * @dev Submits a new answer to an opinion, transferring ownership.
     * @param opinionId The ID of the opinion.
     * @param answer The new answer.
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external virtual nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.currentAnswerOwner == msg.sender) revert SameOwner();

        // Check if this is a pool-owned answer
        bool isPoolOwned = opinion.currentAnswerOwner == address(this);

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        // Use the stored next price instead of calculating it on the fly
        uint256 price = opinion.nextPrice;

        // If nextPrice is 0 (for older opinions before this update),
        // calculate it using the current price
        if (price == 0) {
            price = _calculateNextPrice(opinion.lastPrice);
        }

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);

        // Calculate standard fees
        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (price * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Apply MEV penalty for rapid trading within window
        uint256 lastTradeTime = userLastTradeTime[msg.sender][opinionId];

        if (
            lastTradeTime > 0 &&
            block.timestamp - lastTradeTime < RAPID_TRADE_WINDOW
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

        // Handle pool reward distribution if buying from a pool
        if (isPoolOwned) {
            _distributePoolRewards(opinionId, price, msg.sender);
        }

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
    /**
     * @dev Checks and updates the number of trades per block per user.
     */
    function _checkAndUpdateTradesInBlock() internal {
        if (userLastBlock[msg.sender] != block.number) {
            userTradesInBlock[msg.sender] = 1;
            userLastBlock[msg.sender] = block.number;
        } else {
            userTradesInBlock[msg.sender]++;
            if (userTradesInBlock[msg.sender] > MAX_TRADES_PER_BLOCK) {
                revert MaxTradesPerBlockExceeded(
                    userTradesInBlock[msg.sender],
                    MAX_TRADES_PER_BLOCK
                );
            }
        }
    }

    /**
     * @dev Prevents trading the same opinion multiple times in one block.
     * @param opinionId The ID of the opinion.
     */
    function _checkTradeAllowed(uint256 opinionId) internal {
        if (userLastTradeBlock[msg.sender][opinionId] == block.number)
            revert OneTradePerBlock();
        userLastTradeBlock[msg.sender][opinionId] = block.number;
    }

    /**
     * @dev Validates that an IPFS hash is properly formatted.
     * @param _ipfsHash The IPFS hash to validate.
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
     * @dev Validates that price changes do not exceed the maximum allowed.
     */
    function _validatePriceChange(
        uint256 lastPrice,
        uint256 newPrice
    ) internal pure {
        if (newPrice > lastPrice) {
            uint256 increase = ((newPrice - lastPrice) * 100) / lastPrice;
            if (increase > ABSOLUTE_MAX_PRICE_CHANGE) {
                revert PriceChangeExceedsLimit(
                    increase,
                    ABSOLUTE_MAX_PRICE_CHANGE
                );
            }
        }
    }

    /**
     * @dev Validates basic opinion creation parameters (without IPFS hash and link).
     */
    function _validateBasicOpinionParams(
        string memory question,
        string memory initialAnswer
    ) internal pure {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length == 0 || answerBytes.length == 0)
            revert EmptyString();
        if (questionBytes.length > MAX_QUESTION_LENGTH)
            revert InvalidQuestionLength();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();
    }

    /**
     * @dev Validates full opinion creation parameters including IPFS hash and link.
     */
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
            revert InvalidIpfsHashLength();
        if (linkBytes.length > MAX_LINK_LENGTH) revert InvalidLinkLength();

        // Validate IPFS hash format if not empty
        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }
    }

    /**
     * @dev Calculates fees for opinion creation.
     */
    function _calculateFees(
        uint256 price
    ) internal pure returns (uint256 platformFee, uint256 creatorFee) {
        platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        creatorFee = (price * CREATOR_FEE_PERCENT) / 100;
        return (platformFee, creatorFee);
    }

    /**
     * @dev Creates the opinion record in storage.
     */
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
        opinion.lastPrice = initialPrice; // Changed from currentPrice to lastPrice
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

    /**
     * @dev Calculates the next price with a random adjustment (-20% to +99%).
     * @param lastPrice The current price.
     * @return newPrice The calculated next price.
     */
    function _calculateNextPrice(uint256 lastPrice) internal returns (uint256) {
        bytes32 randomness = keccak256(
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
        );

        uint256 randomFactor = uint256(randomness) % 1000;
        int256 adjustment;

        // Revised distribution to target ~10-12% average growth rate
        if (randomFactor < 200) {
            adjustment = -15 + int256(randomFactor % 15); // -15% to -1%
        } else if (randomFactor < 850) {
            adjustment = 5 + int256(randomFactor % 15); // +5% to +19%
        } else if (randomFactor < 990) {
            adjustment = 20 + int256(randomFactor % 30); // +20% to +49%
        } else {
            adjustment = 70 + int256(randomFactor % 30); // +70% to +99%
        }

        uint256 newPrice;
        if (adjustment < 0) {
            // Handle negative adjustment properly
            uint256 reduction = (lastPrice * uint256(-adjustment)) / 100;
            newPrice = lastPrice > reduction
                ? lastPrice - reduction
                : MINIMUM_PRICE;
        } else {
            // Handle positive adjustment
            newPrice = (lastPrice * (100 + uint256(adjustment))) / 100;
        }

        // Ensure price changes for testing
        if (newPrice == lastPrice) {
            newPrice = lastPrice + 1;
        }

        newPrice = newPrice < MINIMUM_PRICE ? MINIMUM_PRICE : newPrice;
        _validatePriceChange(lastPrice, newPrice);
        return newPrice;
    }

    /**
     * @dev Estimates a price based on current price (used for backwards compatibility)
     * @param lastPrice The current price
     * @return An estimated next price
     */
    function _estimateNextPrice(
        uint256 lastPrice
    ) internal pure returns (uint256) {
        // Simple estimation: 30% increase
        return (lastPrice * 130) / 100;
    }

    /**
     * @dev Validates pool creation parameters
     */
    function _validatePoolCreationParams(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) internal view {
        // Validate opinion exists and is active
        if (opinionId >= nextOpinionId) revert PoolInvalidOpinionId(opinionId);
        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // Validate pool name
        if (bytes(name).length > MAX_POOL_NAME_LENGTH)
            revert PoolInvalidNameLength();

        // Validate IPFS hash if provided
        if (bytes(ipfsHash).length > 0) {
            if (bytes(ipfsHash).length > MAX_IPFS_HASH_LENGTH)
                revert InvalidIpfsHashLength();
            _validateIpfsHash(ipfsHash);
        }

        // Validate proposed answer
        bytes memory answerBytes = bytes(proposedAnswer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert PoolInvalidProposedAnswer();

        // Check that proposed answer is different from current
        if (keccak256(bytes(opinion.currentAnswer)) == keccak256(answerBytes))
            revert PoolSameAnswerAsCurrentAnswer(opinionId, proposedAnswer);

        // Validate deadline
        if (deadline <= block.timestamp + MIN_POOL_DURATION)
            revert PoolDeadlineTooShort(deadline, MIN_POOL_DURATION);
        if (deadline > block.timestamp + MAX_POOL_DURATION)
            revert PoolDeadlineTooLong(deadline, MAX_POOL_DURATION);

        // For pool creation, we can use a lower minimum (1 USDC instead of 10)
        // Still prevents completely trivial pool creation while being more reasonable
        uint256 minimumInitialContribution = 1_000_000; // 1 USDC

        // Validate initial contribution
        if (initialContribution < minimumInitialContribution)
            revert PoolInitialContributionTooLow(
                initialContribution,
                minimumInitialContribution
            );
    }

    /**
     * @dev Creates a pool record and assigns ID
     */
    function _createPoolRecord(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) internal returns (uint256) {
        uint256 poolId = poolCount++;
        PoolInfo storage pool = pools[poolId];

        // Basic pool information
        pool.id = poolId;
        pool.opinionId = opinionId;
        pool.proposedAnswer = proposedAnswer;
        pool.deadline = deadline;
        pool.creator = msg.sender;
        pool.status = PoolStatus.Active;
        pool.name = name;
        pool.ipfsHash = ipfsHash;

        // Set initial contribution
        pool.totalAmount = initialContribution;

        // Track contribution
        poolContributions[poolId].push(
            PoolContribution({
                contributor: msg.sender,
                amount: initialContribution
            })
        );
        poolContributionAmounts[poolId][msg.sender] = initialContribution;
        poolContributors[poolId].push(msg.sender);

        // Update mappings
        opinionPools[opinionId].push(poolId);
        userPools[msg.sender].push(poolId);

        return poolId;
    }

    /**
     * @dev Handles fund transfers for pool creation
     */
    function _handlePoolCreationFunds(
        uint256 opinionId,
        uint256 poolId,
        uint256 totalRequired,
        uint256 initialContribution
    ) internal {
        // Get opinion
        Opinion storage opinion = opinions[opinionId];

        // Transfer funds from user
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Split creation fee equally
        uint256 platformShare = POOL_CREATION_FEE / 2;
        uint256 creatorShare = POOL_CREATION_FEE - platformShare;

        // Transfer platform share
        usdcToken.safeTransfer(owner(), platformShare);

        // Accumulate creator share
        accumulatedFees[opinion.creator] += creatorShare;
        totalAccumulatedFees += creatorShare;

        emit FeesAccumulated(opinion.creator, creatorShare);

        // Emit creation event
        emit PoolCreated(
            poolId,
            opinionId,
            pools[poolId].proposedAnswer,
            initialContribution,
            msg.sender,
            pools[poolId].deadline,
            pools[poolId].name,
            pools[poolId].ipfsHash
        );
    }

    /**
     * @dev Validates a pool contribution and returns the adjusted contribution amount if needed
     * @return The actual contribution amount (adjusted if necessary)
     */
    function _validatePoolContribution(
        uint256 poolId,
        uint256 amount
    ) internal view returns (uint256) {
        // Validate pool exists and is active
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolInfo storage pool = pools[poolId];
        if (pool.status != PoolStatus.Active)
            revert PoolNotActive(poolId, uint8(pool.status));

        if (block.timestamp > pool.deadline)
            revert PoolDeadlinePassed(poolId, pool.deadline);

        // Get the opinion and calculate target price
        uint256 opinionId = pool.opinionId;
        Opinion storage opinion = opinions[opinionId];
        uint256 targetPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : _estimateNextPrice(opinion.lastPrice);

        // Check if pool already has enough funds
        if (pool.totalAmount >= targetPrice) revert PoolAlreadyFunded(poolId);

        // Calculate the maximum allowed contribution
        uint256 maxAllowed = targetPrice - pool.totalAmount;

        // If contribution exceeds what's needed, adjust it
        uint256 actualAmount = amount;
        if (amount > maxAllowed) {
            actualAmount = maxAllowed;
        }

        // Ensure non-zero contribution (1 wei minimum)
        // We've removed the MINIMUM_POOL_CONTRIBUTION check here
        // since we'll charge a fee for each contribution instead
        if (actualAmount == 0) revert PoolContributionTooLow(actualAmount, 1);

        // We don't check allowance here anymore since that will be handled
        // in the contributeToPool function where we add the fee

        return actualAmount;
    }

    /**
     * @dev Updates pool state for a contribution
     */
    function _updatePoolForContribution(
        uint256 poolId,
        uint256 amount
    ) internal returns (uint256) {
        PoolInfo storage pool = pools[poolId];

        // Update pool state
        if (poolContributionAmounts[poolId][msg.sender] == 0) {
            // First contribution from this user
            poolContributors[poolId].push(msg.sender);
            userPools[msg.sender].push(poolId);
        }

        poolContributions[poolId].push(
            PoolContribution({contributor: msg.sender, amount: amount})
        );
        poolContributionAmounts[poolId][msg.sender] += amount;
        pool.totalAmount += amount;

        emit PoolContributed(
            poolId,
            pool.opinionId,
            msg.sender,
            amount,
            pool.totalAmount
        );

        return pool.opinionId;
    }

    /**
     * @dev Checks if pool is ready to execute and does so if conditions are met
     */
    function _checkAndExecutePoolIfReady(
        uint256 poolId,
        uint256 opinionId
    ) internal {
        Opinion storage opinion = opinions[opinionId];
        PoolInfo storage pool = pools[poolId];

        // Only execute if pool is active
        if (pool.status != PoolStatus.Active) {
            return;
        }

        uint256 targetPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : _estimateNextPrice(opinion.lastPrice);

        // Only execute if pool has enough funds
        if (pool.totalAmount >= targetPrice) {
            _executePool(poolId);
        }
    }

    /**
     * @dev Allows users to claim their accumulated fees.
     */
    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint256 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        usdcToken.safeTransfer(msg.sender, amount);
        emit FeesClaimed(msg.sender, amount);
    }

    // --- ADMIN FEATURES ---
    /**
     * @dev Pauses the contract, restricted to OPERATOR_ROLE.
     */
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract, restricted to OPERATOR_ROLE.
     */
    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    /**
     * @dev Toggles public creation of opinions, restricted to ADMIN_ROLE.
     */
    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit PublicCreationToggled(isPublicCreationEnabled);
    }

    /**
     * @dev Deactivates an opinion, restricted to MODERATOR_ROLE.
     * @param opinionId The ID of the opinion to deactivate.
     */
    function deactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        opinions[opinionId].isActive = false;
        emit OpinionDeactivated(opinionId);
    }

    /**
     * @dev Reactivates a previously deactivated opinion, restricted to MODERATOR_ROLE.
     * @param opinionId The ID of the opinion to reactivate.
     */
    function reactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();

        Opinion storage opinion = opinions[opinionId];

        // Check if the opinion is already active
        if (opinion.isActive) revert OpinionAlreadyActive();

        // Reactivate the opinion
        opinion.isActive = true;

        emit OpinionReactivated(opinionId);
    }

    /**
     * @dev Withdraws tokens in an emergency, restricted to MODERATOR_ROLE and owner when paused.
     * @param token The token to withdraw.
     */
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
    /**
     *
     * @dev Returns the answer history for an opinion.
     * @param opinionId The ID of the opinion.
     * @return AnswerHistory array.
     */
    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (AnswerHistory[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId];
    }

    /**
     * @dev Returns the number of trades for an opinion.
     * @param opinionId The ID of the opinion.
     * @return Number of trades.
     */
    function getTradeCount(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return answerHistory[opinionId].length;
    }

    /**
     * @dev Returns total creator gain for an opinion.
     * @param opinionId The ID of the opinion.
     * @return Total creator gain in USDC.
     */
    function getCreatorGain(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        Opinion storage opinion = opinions[opinionId];
        // Creator fee is CREATOR_FEE_PERCENT% of the total volume
        return (opinion.totalVolume * CREATOR_FEE_PERCENT) / 100;
    }

    /**
     * @dev Returns the remaining trades a user can make in the current block.
     * @param user The user's address.
     * @return Number of remaining trades.
     */
    function getRemainingBlockTrades(
        address user
    ) external view returns (uint256) {
        if (userLastBlock[user] != block.number) {
            return MAX_TRADES_PER_BLOCK;
        }
        return MAX_TRADES_PER_BLOCK - userTradesInBlock[user];
    }

    /**
     * @dev Returns the exact price required to submit the next answer
     * @param opinionId The ID of the opinion
     * @return The exact price in USDC (6 decimals)
     */
    function getNextPrice(uint256 opinionId) external view returns (uint256) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        // If nextPrice is 0 (for older opinions), return an estimate
        if (opinion.nextPrice == 0) {
            return _estimateNextPrice(opinion.lastPrice);
        }

        return opinion.nextPrice;
    }

    /**
     * @dev Returns all contributor addresses for a pool
     */
    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);
        return poolContributors[poolId];
    }

    /**
     * @dev Returns all pools for a specific opinion
     */
    function getOpinionPools(
        uint256 opinionId
    ) external view returns (uint256[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinionPools[opinionId];
    }

    /**
     * @dev Returns detailed information about a pool
     */
    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        )
    {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        info = pools[poolId];

        Opinion storage opinion = opinions[info.opinionId];
        currentPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : _estimateNextPrice(opinion.lastPrice);

        if (info.totalAmount >= currentPrice) {
            remainingAmount = 0;
        } else {
            remainingAmount = currentPrice - info.totalAmount;
        }

        if (block.timestamp >= info.deadline) {
            timeRemaining = 0;
        } else {
            timeRemaining = info.deadline - block.timestamp;
        }
    }

    // Add a new function to set the USDC token address
    function setUsdcToken(address _usdcToken) external onlyRole(ADMIN_ROLE) {
        require(address(usdcToken) == address(0), "USDC already set");
        require(_usdcToken != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcToken);
    }
}
