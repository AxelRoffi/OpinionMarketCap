// PoolManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IPoolManager.sol";
import "./interfaces/IOpinionCore.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./structs/PoolStructs.sol";
import "./libraries/PoolLibrary.sol";
import "./libraries/ValidationLibrary.sol";

/**
 * @title PoolManager
 * @dev Manages pools for collective funding of answer changes
 */
contract PoolManager is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    IPoolManager,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- STATE VARIABLES ---
    // Core references
    IOpinionCore public opinionCore;
    IFeeManager public feeManager;
    IERC20 public usdcToken;

    // Pool configuration
    uint96 public poolCreationFee;
    uint96 public poolContributionFee;
    uint32 public minPoolDuration;
    uint32 public maxPoolDuration;

    // Constants
    uint256 public constant MAX_POOL_NAME_LENGTH = 30;
    uint256 public constant MAX_IPFS_HASH_LENGTH = 64;

    // Pool storage
    uint256 public poolCount;
    mapping(uint256 => PoolStructs.PoolInfo) public pools;
    mapping(uint256 => PoolStructs.PoolContribution[])
        private poolContributions;
    mapping(uint256 => mapping(address => uint96))
        public poolContributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => uint256[]) public opinionPools;
    mapping(address => uint256[]) public userPools;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the pool manager
     */
    function initialize(
        address _opinionCore,
        address _feeManager,
        address _usdcToken,
        address _admin
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        // Set contract references
        ValidationLibrary.validateAddress(_opinionCore);
        ValidationLibrary.validateAddress(_feeManager);
        ValidationLibrary.validateAddress(_usdcToken);
        ValidationLibrary.validateAddress(_admin);

        opinionCore = IOpinionCore(_opinionCore);
        feeManager = IFeeManager(_feeManager);
        usdcToken = IERC20(_usdcToken);

        // Set initial configuration
        poolCreationFee = 50 * 10 ** 6; // 50 USDC
        poolContributionFee = 1 * 10 ** 6; // 1 USDC
        minPoolDuration = 1 days;
        maxPoolDuration = 30 days;

        // Setup access control
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MODERATOR_ROLE, _admin);
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
    ) external override nonReentrant {
        // Get current answer
        OpinionStructs.Opinion memory opinion = opinionCore.getOpinionDetails(
            opinionId
        );

        // Validate parameters
        PoolStructs.PoolCreationParams memory params = PoolStructs
            .PoolCreationParams({
                opinionId: opinionId,
                proposedAnswer: proposedAnswer,
                deadline: uint32(deadline),
                initialContribution: uint96(initialContribution),
                name: name,
                ipfsHash: ipfsHash
            });

        PoolLibrary.validatePoolCreationParams(
            params,
            minPoolDuration,
            maxPoolDuration,
            1_000_000, // Minimum 1 USDC
            block.timestamp,
            MAX_POOL_NAME_LENGTH,
            50, // Max answer length from opinion core
            MAX_POOL_NAME_LENGTH,
            MAX_IPFS_HASH_LENGTH,
            opinion.currentAnswer
        );

        // Calculate total required amount
        uint96 totalRequired = poolCreationFee + uint96(initialContribution);

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
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Process the creation fee
        feeManager.handlePoolCreationFee(opinionId, poolId, poolCreationFee);

        // Emit creation event
        emit PoolCreated(
            poolId,
            opinionId,
            proposedAnswer,
            msg.sender,
            initialContribution,
            deadline,
            name,
            block.timestamp
        );
    }

    /**
     * @dev Allows users to contribute to an existing pool
     */
    function contributeToPool(
        uint256 poolId,
        uint256 amount
    ) external override nonReentrant {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Validate pool is active
        if (pool.status != PoolStructs.PoolStatus.Active)
            revert PoolNotActive(poolId, uint8(pool.status));

        // Check deadline
        if (block.timestamp > pool.deadline)
            revert PoolDeadlinePassed(poolId, pool.deadline);

        // Calculate target price
        uint256 opinionId = pool.opinionId;
        uint96 targetPrice = uint96(opinionCore.getNextPrice(opinionId));

        // Check if pool already has enough funds
        if (pool.totalAmount >= targetPrice) revert PoolAlreadyFunded(poolId);

        // Calculate maximum allowed contribution
        uint96 maxAllowed = targetPrice - pool.totalAmount;

        // Adjust contribution if needed
        uint96 actualAmount = amount > maxAllowed ? maxAllowed : uint96(amount);

        // Ensure non-zero contribution
        if (actualAmount == 0) revert PoolContributionTooLow(actualAmount, 1);

        // Calculate total with fee
        uint96 totalRequired = actualAmount + poolContributionFee;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalRequired)
            revert InsufficientAllowance(totalRequired, allowance);

        // Update pool state
        _updatePoolForContribution(poolId, actualAmount);

        // Transfer funds
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Handle fee
        feeManager.handleContributionFee(
            opinionId,
            poolId,
            poolContributionFee
        );

        // Emit contribution event
        emit PoolContribution(
            poolId,
            opinionId,
            msg.sender,
            actualAmount,
            pool.totalAmount,
            block.timestamp
        );

        // Check if pool is ready to execute
        _checkAndExecutePoolIfReady(poolId);
    }

    /**
     * @dev Allows contributor to withdraw from an expired pool
     */
    function withdrawFromExpiredPool(
        uint256 poolId
    ) external override nonReentrant {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Check if already expired or needs to be marked
        bool isExpired = pool.status == PoolStructs.PoolStatus.Expired;
        if (!isExpired) {
            // If not already marked, check if it should be
            isExpired = block.timestamp > pool.deadline;

            if (isExpired) {
                // Update status if expired
                pool.status = PoolStructs.PoolStatus.Expired;

                // Emit expiry event
                emit PoolExpired(
                    poolId,
                    pool.opinionId,
                    pool.totalAmount,
                    poolContributors[poolId].length,
                    block.timestamp
                );
            }
        }

        // Only allow withdrawals from expired pools
        if (!isExpired) revert PoolNotExpired(poolId, pool.deadline);

        // Check user contribution
        uint96 userContribution = poolContributionAmounts[poolId][msg.sender];
        if (userContribution == 0)
            revert PoolNoContribution(poolId, msg.sender);

        // Reset contribution before transfer
        poolContributionAmounts[poolId][msg.sender] = 0;

        // Transfer funds back to contributor
        usdcToken.safeTransfer(msg.sender, userContribution);

        // Emit refund event
        emit PoolRefund(poolId, msg.sender, userContribution, block.timestamp);
    }

    /**
     * @dev Extends the deadline of a pool
     */
    function extendPoolDeadline(
        uint256 poolId,
        uint256 newDeadline
    ) external override nonReentrant {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Ensure pool can be extended
        bool canExtend = pool.status == PoolStructs.PoolStatus.Active ||
            (pool.status == PoolStructs.PoolStatus.Expired &&
                block.timestamp <= pool.deadline + 7 days);

        if (!canExtend) revert("Pool cannot be extended");

        // Validate new deadline
        if (newDeadline <= pool.deadline) revert("New deadline must be later");

        if (newDeadline > block.timestamp + maxPoolDuration)
            revert PoolDeadlineTooLong(uint256(newDeadline), maxPoolDuration);

        // Update pool deadline and status
        pool.deadline = uint32(newDeadline);
        pool.status = PoolStructs.PoolStatus.Extended;

        // Emit deadline extension event
        emit PoolExtended(
            poolId,
            pool.opinionId,
            msg.sender,
            newDeadline,
            block.timestamp
        );
    }

    /**
     * @dev Checks if a pool has expired and updates its status
     */
    function checkPoolExpiry(uint256 poolId) external override returns (bool) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Only check active pools
        if (pool.status != PoolStructs.PoolStatus.Active) {
            return pool.status == PoolStructs.PoolStatus.Expired;
        }

        // Check if deadline has passed
        if (block.timestamp > pool.deadline) {
            pool.status = PoolStructs.PoolStatus.Expired;

            // Emit expiry event
            emit PoolExpired(
                poolId,
                pool.opinionId,
                pool.totalAmount,
                poolContributors[poolId].length,
                block.timestamp
            );

            return true;
        }

        return false;
    }

    /**
     * @dev Distributes rewards when a pool-owned answer is purchased
     */
    function distributePoolRewards(
        uint256 opinionId,
        uint256 purchasePrice,
        address buyer
    ) external override {
        // Only allow calls from the Opinion Core contract
        require(msg.sender == address(opinionCore), "Unauthorized caller");

        // Find the pool that owns this answer
        uint256[] memory poolsForOpinion = opinionPools[opinionId];
        uint256 ownerPoolId;
        bool foundPool = false;

        for (uint256 i = 0; i < poolsForOpinion.length; i++) {
            uint256 poolId = poolsForOpinion[i];
            PoolStructs.PoolInfo storage pool = pools[poolId];

            // Check if this pool owns the answer (is executed and has matching answer)
            if (pool.status == PoolStructs.PoolStatus.Executed) {
                OpinionStructs.Opinion memory opinion = opinionCore
                    .getOpinionDetails(opinionId);
                if (
                    keccak256(bytes(pool.proposedAnswer)) ==
                    keccak256(bytes(opinion.currentAnswer))
                ) {
                    ownerPoolId = poolId;
                    foundPool = true;
                    break;
                }
            }
        }

        if (!foundPool) return;

        // Calculate reward amount (after platform and creator fees)
        (uint96 platformFee, uint96 creatorFee, ) = feeManager
            .calculateFeeDistribution(purchasePrice);
        uint96 rewardAmount = uint96(purchasePrice) - platformFee - creatorFee;

        // Get pool contributors and distribute rewards
        address[] memory contributors = poolContributors[ownerPoolId];
        uint96 totalContributed = pools[ownerPoolId].totalAmount;

        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint96 contribution = poolContributionAmounts[ownerPoolId][
                contributor
            ];

            if (contribution > 0) {
                // Calculate contributor's share
                uint256 sharePercent = (uint256(contribution) * 100) /
                    totalContributed;
                uint96 reward = uint96(
                    (uint256(rewardAmount) * sharePercent) / 100
                );

                // Accumulate reward
                feeManager.accumulateFee(contributor, reward);

                // Emit reward event
                emit PoolRewardDistributed(
                    ownerPoolId,
                    opinionId,
                    contributor,
                    contribution,
                    sharePercent,
                    reward,
                    block.timestamp
                );
            }
        }
    }

    /**
     * @dev Executes a pool if ready (reached target price)
     */
    function executePoolIfReady(
        uint256 poolId,
        uint256 opinionId
    ) external override {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        // Only allow calls from within contract or Opinion Core
        require(
            msg.sender == address(this) || msg.sender == address(opinionCore),
            "Unauthorized caller"
        );

        _checkAndExecutePoolIfReady(poolId);
    }

    /**
     * @dev Returns detailed information about a pool
     */
    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        override
        returns (
            PoolStructs.PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        )
    {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        info = pools[poolId];

        // Get target price
        currentPrice = opinionCore.getNextPrice(info.opinionId);

        // Calculate remaining amount needed
        if (info.totalAmount >= currentPrice) {
            remainingAmount = 0;
        } else {
            remainingAmount = currentPrice - info.totalAmount;
        }

        // Calculate time remaining
        if (block.timestamp >= info.deadline) {
            timeRemaining = 0;
        } else {
            timeRemaining = info.deadline - block.timestamp;
        }
    }

    /**
     * @dev Returns all contributor addresses for a pool
     */
    function getPoolContributors(
        uint256 poolId
    ) external view override returns (address[] memory) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);
        return poolContributors[poolId];
    }

    /**
     * @dev Returns all pools for a specific opinion
     */
    function getOpinionPools(
        uint256 opinionId
    ) external view override returns (uint256[] memory) {
        return opinionPools[opinionId];
    }

    /**
     * @dev Returns reward information for a pool
     */
    function getPoolRewardInfo(
        uint256 poolId
    )
        external
        view
        override
        returns (
            address[] memory contributors,
            uint96[] memory amounts,
            uint96 totalAmount
        )
    {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        contributors = poolContributors[poolId];
        amounts = new uint96[](contributors.length);

        for (uint256 i = 0; i < contributors.length; i++) {
            amounts[i] = poolContributionAmounts[poolId][contributors[i]];
        }

        totalAmount = pools[poolId].totalAmount;
    }

    // --- INTERNAL FUNCTIONS ---

    /**
     * @dev Creates a new pool record
     */
    function _createPoolRecord(
        uint256 opinionId,
        string memory proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string memory name,
        string memory ipfsHash
    ) internal returns (uint256) {
        uint256 poolId = poolCount++;
        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Initialize pool
        pool.id = poolId;
        pool.opinionId = opinionId;
        pool.proposedAnswer = proposedAnswer;
        pool.totalAmount = uint96(initialContribution);
        pool.deadline = uint32(deadline);
        pool.creator = msg.sender;
        pool.status = PoolStructs.PoolStatus.Active;
        pool.name = name;
        pool.ipfsHash = ipfsHash;

        // Track initial contribution
        poolContributions[poolId].push(
            PoolStructs.PoolContribution({
                contributor: msg.sender,
                amount: uint96(initialContribution),
                timestamp: uint32(block.timestamp)
            })
        );

        poolContributionAmounts[poolId][msg.sender] = uint96(
            initialContribution
        );
        poolContributors[poolId].push(msg.sender);

        // Update mappings
        opinionPools[opinionId].push(poolId);
        userPools[msg.sender].push(poolId);

        return poolId;
    }

    /**
     * @dev Updates pool state for a contribution
     */
    function _updatePoolForContribution(
        uint256 poolId,
        uint96 amount
    ) internal {
        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Update pool state
        if (poolContributionAmounts[poolId][msg.sender] == 0) {
            // First contribution from this user
            poolContributors[poolId].push(msg.sender);
            userPools[msg.sender].push(poolId);
        }

        // Record contribution
        poolContributions[poolId].push(
            PoolStructs.PoolContribution({
                contributor: msg.sender,
                amount: amount,
                timestamp: uint32(block.timestamp)
            })
        );

        poolContributionAmounts[poolId][msg.sender] += amount;
        pool.totalAmount += amount;
    }

    /**
     * @dev Checks if pool has reached target price and executes if so
     */
    function _checkAndExecutePoolIfReady(uint256 poolId) internal {
        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Only execute active pools
        if (pool.status != PoolStructs.PoolStatus.Active) {
            return;
        }

        uint256 opinionId = pool.opinionId;
        uint96 targetPrice = uint96(opinionCore.getNextPrice(opinionId));

        // Execute if enough funds
        if (pool.totalAmount >= targetPrice) {
            _executePool(poolId, opinionId, targetPrice);
        }
    }

    /**
     * @dev Executes a pool when it has reached the target price
     */
    function _executePool(
        uint256 poolId,
        uint256 opinionId,
        uint96 targetPrice
    ) internal {
        PoolStructs.PoolInfo storage pool = pools[poolId];

        // Double-check status
        if (pool.status != PoolStructs.PoolStatus.Active)
            revert PoolNotActive(poolId, uint8(pool.status));

        // Double-check funds
        if (pool.totalAmount < targetPrice)
            revert PoolInsufficientFunds(pool.totalAmount, targetPrice);

        // Get current answer owner before execution
        OpinionStructs.Opinion memory opinion = opinionCore.getOpinionDetails(
            opinionId
        );
        address currentOwner = opinion.currentAnswerOwner;

        // Update opinion through core contract
        opinionCore.updateOpinionOnPoolExecution(
            opinionId,
            pool.proposedAnswer,
            targetPrice
        );

        // Update pool status
        pool.status = PoolStructs.PoolStatus.Executed;

        // Emit execution event
        emit PoolExecuted(
            poolId,
            opinionId,
            pool.proposedAnswer,
            targetPrice,
            block.timestamp
        );
    }

    // --- ADMIN FUNCTIONS ---

    /**
     * @dev Sets pool creation fee
     */
    function setPoolCreationFee(uint96 newFee) external onlyRole(ADMIN_ROLE) {
        poolCreationFee = newFee;
        emit ParameterUpdated(
            8,
            poolCreationFee,
            newFee,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Sets pool contribution fee
     */
    function setPoolContributionFee(
        uint96 newFee
    ) external onlyRole(ADMIN_ROLE) {
        poolContributionFee = newFee;
        emit ParameterUpdated(
            9,
            poolContributionFee,
            newFee,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Sets minimum pool duration
     */
    function setMinPoolDuration(
        uint32 newDuration
    ) external onlyRole(ADMIN_ROLE) {
        minPoolDuration = newDuration;
        emit ParameterUpdated(
            10,
            minPoolDuration,
            newDuration,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Sets maximum pool duration
     */
    function setMaxPoolDuration(
        uint32 newDuration
    ) external onlyRole(ADMIN_ROLE) {
        maxPoolDuration = newDuration;
        emit ParameterUpdated(
            11,
            maxPoolDuration,
            newDuration,
            msg.sender,
            block.timestamp
        );
    }
}
