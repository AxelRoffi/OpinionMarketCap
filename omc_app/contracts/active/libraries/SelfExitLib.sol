// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../structs/OpinionStructs.sol";
import "../interfaces/IFeeManager.sol";
import "./ValidationLibrary.sol";

/**
 * @title SelfExitLib
 * @notice External library holding heavy V4 self-exit logic, deployed
 *         separately to keep OpinionCoreV4 under the 24KB Base limit.
 * @dev Functions are invoked via DELEGATECALL from OpinionCoreV4, so storage
 *      reads/writes target the caller's slots and `msg.sender` is the
 *      transaction's original sender. Caller is responsible for `nonReentrant`
 *      and `whenNotPaused` modifiers; the library validates business rules
 *      (cooldown, ownership, fees, transfers) under strict CEI ordering.
 *
 *      Each exit-flow function:
 *        1. Validates inputs (revert on bad state).
 *        2. Computes splits with mul-before-div precision.
 *        3. Writes storage (lockedStake = 0, owner = 0, nextPrice = reclaim).
 *        4. Transfers USDC last.
 *        5. Emits events.
 */
library SelfExitLib {
    using SafeERC20 for IERC20;

    uint16 internal constant BPS_DENOMINATOR = 10000;

    struct ExitConfig {
        uint16 exitPenaltyBps;
        uint16 penaltyCreatorShareBps;
        uint16 reclaimDiscountBps;
        uint96 minReclaimPrice;
    }

    // ─── Events (logs land at the caller's address via delegatecall) ───
    event SelfExitTriggered(
        uint256 indexed opinionId,
        address indexed king,
        uint96 stake,
        uint96 refund,
        uint96 penalty,
        uint32 timestamp
    );
    event PenaltyDistributed(
        uint256 indexed opinionId,
        address indexed creator,
        uint96 creatorShare,
        uint96 platformShare
    );
    event SlotVacated(uint256 indexed opinionId, uint96 reclaimPrice);
    event VacantSlotReclaimed(
        uint256 indexed opinionId,
        address indexed claimer,
        uint96 reclaimPrice,
        uint96 newLockedStake,
        uint32 timestamp
    );
    event PoolStaleExitProcessed(
        uint256 indexed opinionId,
        address indexed poolAddress,
        uint96 stake,
        uint96 refundToPool,
        uint96 penalty
    );

    // ─── Errors ─────────────────────────────────────────────────────────
    error CooldownNotMet(uint256 remainingSeconds);
    error LegacyPositionNotEligible();
    error NoLockedStake();
    error SlotNotVacant();
    error InvalidReclaimPrice();
    error InvalidString(string field);

    uint256 internal constant MAX_ANSWER_LENGTH = 60;
    uint256 internal constant MAX_LINK_LENGTH = 260;

    // ─── Internal helpers ───────────────────────────────────────────────

    function _splitStakeForExit(uint96 stake, ExitConfig memory cfg)
        private
        pure
        returns (uint96 refund, uint96 penalty, uint96 creatorShare, uint96 platformShare)
    {
        penalty = uint96((uint256(stake) * cfg.exitPenaltyBps) / BPS_DENOMINATOR);
        refund = stake - penalty;
        creatorShare = uint96((uint256(penalty) * cfg.penaltyCreatorShareBps) / BPS_DENOMINATOR);
        platformShare = penalty - creatorShare;
    }

    function _calculateReclaimPrice(uint96 lastPrice, ExitConfig memory cfg)
        private
        pure
        returns (uint96)
    {
        uint96 discounted = uint96((uint256(lastPrice) * cfg.reclaimDiscountBps) / BPS_DENOMINATOR);
        return discounted < cfg.minReclaimPrice ? cfg.minReclaimPrice : discounted;
    }

    /**
     * @dev Shared executor used by both solo and pool exits. Caller has already
     *      validated authorization, opinion validity, and stake > 0. This handles
     *      cooldown, splits, state writes, transfers, and events.
     */
    function _executeExit(
        mapping(uint256 => OpinionStructs.Opinion) storage opinions,
        mapping(uint256 => uint96) storage lockedStakes,
        IERC20 usdc,
        IFeeManager feeMgr,
        uint256 opinionId,
        address refundRecipient,
        ExitConfig memory cfg
    ) private returns (uint96 stake, uint96 refund, uint96 penalty) {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        stake = lockedStakes[opinionId];

        uint96 creatorShare;
        uint96 platformShare;
        (refund, penalty, creatorShare, platformShare) = _splitStakeForExit(stake, cfg);

        uint96 reclaimPrice = _calculateReclaimPrice(opinion.lastPrice, cfg);
        address creator = opinion.creator;

        // ─── EFFECTS ────────────────────────────────────────────────────
        lockedStakes[opinionId] = 0;
        opinion.currentAnswerOwner = address(0);
        opinion.nextPrice = reclaimPrice;

        // ─── INTERACTIONS ───────────────────────────────────────────────
        if (refund > 0) {
            usdc.safeTransfer(refundRecipient, refund);
        }
        if (penalty > 0) {
            usdc.safeTransfer(address(feeMgr), penalty);
            if (creatorShare > 0) {
                feeMgr.accumulateFee(creator, creatorShare);
            }
        }

        emit PenaltyDistributed(opinionId, creator, creatorShare, platformShare);
        emit SlotVacated(opinionId, reclaimPrice);
    }

    // ─── External entry points (called via delegatecall from V4) ───────

    /**
     * @notice Solo king exits a stale slot.
     * @dev Caller (V4) has already verified: feature enabled, opinion exists/active,
     *      msg.sender == currentAnswerOwner, king is NOT a pool. Library checks:
     *      legacy guard, cooldown, then runs shared executor.
     */
    function processSelfExit(
        mapping(uint256 => OpinionStructs.Opinion) storage opinions,
        mapping(uint256 => uint96) storage lockedStakes,
        mapping(uint256 => uint32) storage timestamps,
        IERC20 usdc,
        IFeeManager feeMgr,
        uint256 opinionId,
        address king,
        uint32 cooldown,
        ExitConfig memory cfg
    ) external returns (uint96 refund) {
        if (lockedStakes[opinionId] == 0) revert LegacyPositionNotEligible();

        uint256 cooldownEnd = uint256(timestamps[opinionId]) + cooldown;
        if (block.timestamp < cooldownEnd) revert CooldownNotMet(cooldownEnd - block.timestamp);

        uint96 stake;
        uint96 penalty;
        (stake, refund, penalty) = _executeExit(opinions, lockedStakes, usdc, feeMgr, opinionId, king, cfg);

        emit SelfExitTriggered(opinionId, king, stake, refund, penalty, uint32(block.timestamp));
    }

    /**
     * @notice Pool dissolution post-cooldown (cooldown checked by PoolManager).
     * @dev Caller has verified king IS a pool. Returns refund to PoolManager
     *      which handles pro-rata distribution to contributors.
     */
    function processPoolExit(
        mapping(uint256 => OpinionStructs.Opinion) storage opinions,
        mapping(uint256 => uint96) storage lockedStakes,
        IERC20 usdc,
        IFeeManager feeMgr,
        uint256 opinionId,
        address poolAddress,
        address poolManager,
        ExitConfig memory cfg
    ) external returns (uint96 refundToPool) {
        if (lockedStakes[opinionId] == 0) revert NoLockedStake();

        uint96 stake;
        uint96 penalty;
        (stake, refundToPool, penalty) = _executeExit(opinions, lockedStakes, usdc, feeMgr, opinionId, poolManager, cfg);

        emit PoolStaleExitProcessed(opinionId, poolAddress, stake, refundToPool, penalty);
    }

    /**
     * @notice Reclaim a vacant slot at the discounted price.
     * @dev Caller has validated: feature enabled, opinion exists/active,
     *      answer/description/link bounds. Library validates vacancy, pulls
     *      payment, splits fees, writes all state (strings + history) except
     *      `nextPrice` (which the caller computes via dynamic pricing).
     * @return reclaimPrice The actual price paid (after min-floor).
     */
    function processVacantReclaim(
        mapping(uint256 => OpinionStructs.Opinion) storage opinions,
        mapping(uint256 => OpinionStructs.AnswerHistory[]) storage answerHistory,
        mapping(uint256 => uint96) storage lockedStakes,
        mapping(uint256 => uint32) storage timestamps,
        IERC20 usdc,
        IFeeManager feeMgr,
        uint256 opinionId,
        address claimer,
        string calldata answer,
        string calldata description,
        string calldata link,
        ExitConfig memory cfg
    ) external returns (uint96 reclaimPrice) {
        // Input validation moved here from caller to save bytecode there.
        if (bytes(answer).length < 2 || bytes(answer).length > MAX_ANSWER_LENGTH) revert InvalidString("answer");
        ValidationLibrary.validateDescription(description);
        if (bytes(link).length > MAX_LINK_LENGTH) revert InvalidString("link");

        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        if (opinion.currentAnswerOwner != address(0)) revert SlotNotVacant();

        reclaimPrice = uint96(opinion.nextPrice);
        if (reclaimPrice < cfg.minReclaimPrice) reclaimPrice = cfg.minReclaimPrice;

        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = feeMgr.calculateFeeDistribution(reclaimPrice);
        if (ownerAmount == 0) revert InvalidReclaimPrice();

        // ─── EFFECTS ────────────────────────────────────────────────────
        lockedStakes[opinionId] = ownerAmount;
        timestamps[opinionId] = uint32(block.timestamp);
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = description;
        opinion.link = link;
        opinion.currentAnswerOwner = claimer;
        opinion.lastPrice = reclaimPrice;
        opinion.totalVolume += reclaimPrice;
        // opinion.nextPrice is written by caller via dynamic pricing.

        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: description,
                owner: claimer,
                price: reclaimPrice,
                timestamp: uint32(block.timestamp)
            })
        );

        // ─── INTERACTIONS ───────────────────────────────────────────────
        usdc.safeTransferFrom(claimer, address(this), reclaimPrice);

        uint96 totalFees = platformFee + creatorFee;
        if (totalFees > 0) usdc.safeTransfer(address(feeMgr), totalFees);
        if (creatorFee > 0) feeMgr.accumulateFee(opinion.creator, creatorFee);

        emit VacantSlotReclaimed(opinionId, claimer, reclaimPrice, ownerAmount, uint32(block.timestamp));
    }
}
