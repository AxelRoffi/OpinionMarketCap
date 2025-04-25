// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionMarket.sol";
import "./PoolExecutionLibrary.sol";
import "./PoolLibrary.sol";
import "./CalculationLibrary.sol";

contract PoolOpinionMarket is OpinionMarket {
    using PoolLibrary for uint256;
    using PoolExecutionLibrary for uint256;
    using CalculationLibrary for uint256;
    using SafeERC20 for IERC20;

    uint256 public constant MAX_POOL_NAME_LENGTH = 50;

    // Pool-related state variables
    uint256 public poolCount;
    mapping(uint256 => PoolInfo) public pools;
    mapping(uint256 => PoolContribution[]) private poolContributions;
    mapping(uint256 => mapping(address => uint256))
        public poolContributionAmounts;
    mapping(uint256 => address[]) public poolContributors;
    mapping(uint256 => uint256[]) public opinionPools;
    mapping(address => uint256[]) public userPools;

    // Pool constants
    uint256 public poolCreationFee;
    uint256 public poolContributionFee;
    uint256 public minPoolDuration;
    uint256 public maxPoolDuration;

    // Pool structs
    struct PoolInfo {
        uint256 id;
        uint256 opinionId;
        string proposedAnswer;
        uint256 totalAmount;
        uint256 deadline;
        address creator;
        PoolStatus status;
        string name;
        string ipfsHash;
    }

    struct PoolContribution {
        address contributor;
        uint256 amount;
    }

    enum PoolStatus {
        Active,
        Executed,
        Expired,
        Extended
    }

    function initialize(
        uint256 _poolCreationFee,
        uint256 _poolContributionFee,
        uint256 _minPoolDuration,
        uint256 _maxPoolDuration
    ) public reinitializer(2) {
        poolCreationFee = _poolCreationFee;
        poolContributionFee = _poolContributionFee;
        minPoolDuration = _minPoolDuration;
        maxPoolDuration = _maxPoolDuration;
    }

    function setPoolCreationFee(uint256 _newFee) external onlyRole(ADMIN_ROLE) {
        require(_newFee <= 100_000_000, "Fee too high");
        poolCreationFee = _newFee;
        emit PoolCreationFeeUpdated(_newFee);
    }

    function setPoolContributionFee(
        uint256 _newFee
    ) external onlyRole(ADMIN_ROLE) {
        require(_newFee <= 10_000_000, "Fee too high");
        poolContributionFee = _newFee;
        emit PoolContributionFeeUpdated(_newFee);
    }

    function setMinPoolDuration(
        uint256 _newDuration
    ) external onlyRole(ADMIN_ROLE) {
        require(_newDuration >= 1 hours, "Duration too short");
        require(_newDuration <= 7 days, "Duration too long");
        minPoolDuration = _newDuration;
        emit MinPoolDurationUpdated(_newDuration);
    }

    function setMaxPoolDuration(
        uint256 _newDuration
    ) external onlyRole(ADMIN_ROLE) {
        require(_newDuration >= 7 days, "Duration too short");
        require(_newDuration <= 90 days, "Duration too long");
        maxPoolDuration = _newDuration;
        emit MaxPoolDurationUpdated(_newDuration);
    }

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
        uint256 totalRequired = poolCreationFee + initialContribution;

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

    function contributeToPool(
        uint256 poolId,
        uint256 amount
    ) external virtual nonReentrant whenNotPaused {
        // Validation (with potentially lower minimum)
        uint256 actualAmount = _validatePoolContribution(poolId, amount);

        // Add contribution fee
        uint256 totalRequired = actualAmount + poolContributionFee;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalRequired)
            revert InsufficientAllowance(totalRequired, allowance);

        // Update pool state and get opinion ID
        uint256 opinionId = _updatePoolForContribution(poolId, actualAmount);

        // Transfer funds (including contribution fee)
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Handle the fee distribution among three parties
        _handleContributionFee(opinionId, poolId, poolContributionFee);

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

    function _executePool(uint256 poolId) internal {
        // Get pool and validate status
        PoolInfo storage pool = pools[poolId];

        // Get opinion details
        uint256 opinionId = pool.opinionId;
        Opinion storage opinion = opinions[opinionId];

        // Calculate execution price
        uint256 targetPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : _calculateNextPrice(opinion.lastPrice);

        // Check if pool is ready to execute
        (bool isReady, uint8 errorCode) = PoolExecutionLibrary
            .isPoolReadyToExecute(
                uint8(pool.status),
                pool.totalAmount,
                targetPrice
            );

        if (!isReady) {
            if (errorCode == 1)
                revert PoolNotActive(poolId, uint8(pool.status));
            if (errorCode == 2) revert PoolInsufficientFunds();
        }

        // Process the execution
        _processPoolExecution(poolId, opinionId, targetPrice);
    }

    function _processPoolExecution(
        uint256 poolId,
        uint256 opinionId,
        uint256 targetPrice
    ) internal {
        PoolInfo storage pool = pools[poolId];
        Opinion storage opinion = opinions[opinionId];

        // Calculate fees using library
        (
            uint256 platformFee,
            uint256 creatorFee,
            uint256 ownerAmount
        ) = PoolExecutionLibrary.calculateFees(
                targetPrice,
                platformFeePercent,
                creatorFeePercent
            );

        // Track the current owner to distribute fees
        address currentOwner = opinion.currentAnswerOwner;

        // Update answer history
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: pool.proposedAnswer,
                owner: address(this),
                price: targetPrice,
                timestamp: block.timestamp
            })
        );

        // Update opinion state
        opinion.currentAnswer = pool.proposedAnswer;
        opinion.currentAnswerOwner = address(this);
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

    function checkPoolExpiry(uint256 poolId) public returns (bool) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolInfo storage pool = pools[poolId];

        (bool isExpired, uint8 newStatusValue) = PoolExecutionLibrary
            .checkPoolExpiry(
                uint8(pool.status),
                pool.deadline,
                block.timestamp
            );

        // Update pool status if it has changed to expired
        if (
            newStatusValue != uint8(pool.status) &&
            newStatusValue == uint8(PoolStatus.Expired)
        ) {
            pool.status = PoolStatus(newStatusValue);

            emit PoolExpired(
                poolId,
                pool.opinionId,
                pool.totalAmount,
                poolContributors[poolId].length
            );
        }

        return isExpired;
    }

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

        // Calculate fees using library
        (, , uint256 rewardAmount) = PoolExecutionLibrary.calculateFees(
            purchasePrice,
            platformFeePercent,
            creatorFeePercent
        );

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
                // Calculate contributor's share using library
                (uint256 share, uint256 reward) = PoolExecutionLibrary
                    .calculateContributorReward(
                        contribution,
                        totalContributed,
                        rewardAmount
                    );

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

    function _validatePoolCreationParams(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) internal view {
        Opinion storage opinion = opinions[opinionId];

        PoolLibrary.OpinionData memory opinionData = PoolLibrary.OpinionData({
            isActive: opinion.isActive,
            currentAnswer: opinion.currentAnswer,
            nextPrice: opinion.nextPrice,
            lastPrice: opinion.lastPrice
        });

        PoolLibrary.validatePoolCreationParams(
            opinionId,
            proposedAnswer,
            deadline,
            initialContribution,
            name,
            ipfsHash,
            opinionData,
            nextOpinionId,
            minPoolDuration,
            maxPoolDuration,
            MAX_POOL_NAME_LENGTH,
            MAX_IPFS_HASH_LENGTH,
            MAX_ANSWER_LENGTH
        );
    }

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
        uint256 platformShare = poolCreationFee / 2;
        uint256 creatorShare = poolCreationFee - platformShare;

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

    function _validatePoolContribution(
        uint256 poolId,
        uint256 amount
    ) internal view returns (uint256) {
        PoolInfo storage pool = pools[poolId];
        Opinion storage opinion = opinions[pool.opinionId];

        uint256 targetPrice = opinion.nextPrice > 0
            ? opinion.nextPrice
            : PoolLibrary.estimateNextPrice(opinion.lastPrice);

        return
            PoolLibrary.validatePoolContribution(
                poolId,
                amount,
                uint8(pool.status),
                pool.deadline,
                pool.totalAmount,
                targetPrice,
                poolCount
            );
    }

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
            : CalculationLibrary.estimateNextPrice(opinion.lastPrice);

        // Only execute if pool has enough funds
        if (pool.totalAmount >= targetPrice) {
            _executePool(poolId);
        }
    }

    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        uint256 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        usdcToken.safeTransfer(msg.sender, amount);
        emit FeesClaimed(msg.sender, amount);
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external override nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert("OP_INACT");
        if (opinion.currentAnswerOwner == msg.sender) revert("SAME_OWN");

        // Check if this is a pool-owned answer
        bool isPoolOwned = opinion.currentAnswerOwner == address(this);

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert("EMPTY_STR");
        if (answerBytes.length > MAX_ANSWER_LENGTH) revert("INV_ANS_LEN");

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
        (
            uint256 platformFee,
            uint256 creatorFee,
            uint256 ownerAmount
        ) = PoolExecutionLibrary.calculateFees(
                price,
                platformFeePercent,
                creatorFeePercent
            );

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

    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory) {
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);
        return poolContributors[poolId];
    }

    function getOpinionPools(
        uint256 opinionId
    ) external view returns (uint256[] memory) {
        if (opinionId >= nextOpinionId) revert OpinionNotFound();
        return opinionPools[opinionId];
    }

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
            : CalculationLibrary.estimateNextPrice(opinion.lastPrice);

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
}
