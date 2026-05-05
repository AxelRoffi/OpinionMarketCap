// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./PoolManager.sol";

/**
 * @notice Minimal interface for the V4-only methods PoolManagerV2 needs.
 * @dev OpinionCore is upgraded to V4 separately; this interface lets V2
 *      call into the new V4 functions without depending on V4's full ABI.
 */
interface IOpinionCoreV4Pool {
    function processPoolStaleExit(uint256 opinionId) external returns (uint96 refundToPool);
    function lastTradeTimestamp(uint256 opinionId) external view returns (uint32);
    function poolCooldown() external view returns (uint32);
    function poolExtendedCooldown() external view returns (uint32);
    function largeHolderThresholdBps() external view returns (uint16);
}

/**
 * @title PoolManagerV2
 * @notice Adds stale-exit dissolution for pool-owned answer slots.
 *
 *         When a pool-owned slot has had no trades for the cooldown window,
 *         contributors may dissolve the pool to recover their pro-rata share
 *         of the locked stake (minus the 20% penalty handled in OpinionCoreV4).
 *
 *         Two trigger paths:
 *           - `triggerLargePoolExit` — any contributor holding ≥ V4's
 *             `largeHolderThresholdBps` of pool funding may trigger after
 *             V4's `poolCooldown` (default 21 days).
 *           - `triggerPoolStaleExit` — ANY contributor may trigger after
 *             V4's `poolExtendedCooldown` (default 35 days).
 *
 *         Dissolution is a single tx that calls
 *         `OpinionCoreV4.processPoolStaleExit(opinionId)`, receives the
 *         refund USDC, and stores the per-pool totals. Contributors then
 *         call `claimStaleRefund` to pull their share — pull pattern
 *         avoids gas-bomb risk from many transfers.
 *
 * @dev Inherits PoolManager V1's full storage layout. New state is appended
 *      at the end. OpenZeppelin's `upgradeProxy` will validate the layout.
 */
contract PoolManagerV2 is PoolManager {
    using SafeERC20 for IERC20;

    // ════════════════════════════════════════════════════════════════════
    // ─── V2 STATE (APPENDED ONLY) ──────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    struct StaleExit {
        bool dissolved;                   // true after the trigger executes
        uint96 totalRefund;                // 80% of pool's locked stake, USDC held by V2 awaiting claims
        uint96 totalEligibleContribution;  // snapshot of pool.totalAmount at trigger time
        uint32 dissolvedAt;                // timestamp of dissolution (for events / UI)
    }

    /// @notice Per-pool dissolution record. dissolved=false → pool not yet stale-exited.
    mapping(uint256 => StaleExit) public staleExits;

    /// @notice Per-pool, per-contributor: has the user already pulled their refund?
    mapping(uint256 => mapping(address => bool)) public hasClaimedStaleRefund;

    /// @notice Master kill-switch. Defaults FALSE; admin enables after V4 + V2 are healthy.
    bool public stalePoolExitEnabled;

    /// @dev Reserved slots for V3+ additions to PoolManager.
    uint256[40] private __gapV2;

    // ════════════════════════════════════════════════════════════════════
    // ─── V2 EVENTS ─────────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    event PoolStaleExitTriggered(
        uint256 indexed poolId,
        uint256 indexed opinionId,
        address indexed triggeredBy,
        uint96 totalRefund,
        uint96 totalEligibleContribution,
        bool wasLargeHolder,
        uint32 timestamp
    );

    event StaleRefundClaimed(
        uint256 indexed poolId,
        address indexed contributor,
        uint96 contribution,
        uint96 refund
    );

    event StalePoolExitToggled(bool enabled);

    // ════════════════════════════════════════════════════════════════════
    // ─── V2 ERRORS ─────────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    error StalePoolExitDisabled();
    error PoolNotExecuted();
    error AlreadyDissolved();
    error CooldownNotMet(uint256 remainingSeconds);
    error NotALargeHolder(uint96 contribution, uint96 threshold);
    error NoContribution();
    error AlreadyClaimed();
    error PoolNotDissolved();

    // ════════════════════════════════════════════════════════════════════
    // ─── V2 INITIALIZER (single-use reinitializer) ─────────────────────
    // ════════════════════════════════════════════════════════════════════

    function initializeV2() public reinitializer(2) onlyRole(ADMIN_ROLE) {
        stalePoolExitEnabled = false;
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── TRIGGER FUNCTIONS ─────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Large-holder dissolution trigger.
     *         Caller must be a contributor with ≥ V4's `largeHolderThresholdBps`
     *         share of the pool's total funding. Available after V4's
     *         `poolCooldown` (default 21 days) of no trade.
     */
    function triggerLargePoolExit(uint256 poolId) external nonReentrant {
        _checkTriggerPreconditions(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];
        IOpinionCoreV4Pool core = IOpinionCoreV4Pool(address(opinionCore));

        // Cooldown check — short window for large holders
        uint256 cooldownEnd = uint256(core.lastTradeTimestamp(pool.opinionId)) + core.poolCooldown();
        if (block.timestamp < cooldownEnd) revert CooldownNotMet(cooldownEnd - block.timestamp);

        // Caller must be a contributor with ≥ threshold share
        uint96 callerContribution = poolContributionAmounts[poolId][msg.sender];
        if (callerContribution == 0) revert NoContribution();

        uint16 thresholdBps = core.largeHolderThresholdBps();
        // share-bps = (contribution * 10000) / totalAmount; check >= thresholdBps
        // To avoid div by zero, totalAmount must be > 0 (a pool with 0 total can't be Executed)
        uint96 thresholdAmount = uint96((uint256(pool.totalAmount) * thresholdBps) / 10000);
        if (callerContribution < thresholdAmount) {
            revert NotALargeHolder(callerContribution, thresholdAmount);
        }

        _executeStaleExit(poolId, true);
    }

    /**
     * @notice Anyone-can-trigger dissolution.
     *         No size threshold; available after V4's `poolExtendedCooldown`
     *         (default 35 days) of no trade. The caller must still be a
     *         contributor (no random outsiders).
     */
    function triggerPoolStaleExit(uint256 poolId) external nonReentrant {
        _checkTriggerPreconditions(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];
        IOpinionCoreV4Pool core = IOpinionCoreV4Pool(address(opinionCore));

        // Cooldown check — extended window
        uint256 cooldownEnd =
            uint256(core.lastTradeTimestamp(pool.opinionId)) + core.poolExtendedCooldown();
        if (block.timestamp < cooldownEnd) revert CooldownNotMet(cooldownEnd - block.timestamp);

        // Must be a contributor
        if (poolContributionAmounts[poolId][msg.sender] == 0) revert NoContribution();

        _executeStaleExit(poolId, false);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── CLAIM (pull pattern) ──────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Contributor pulls their pro-rata share of a dissolved pool.
     * @dev Pro-rata: `(contribution / totalEligibleContribution) * totalRefund`.
     *      Multiplication-before-division for precision.
     */
    function claimStaleRefund(uint256 poolId) external nonReentrant {
        StaleExit storage data = staleExits[poolId];
        if (!data.dissolved) revert PoolNotDissolved();
        if (hasClaimedStaleRefund[poolId][msg.sender]) revert AlreadyClaimed();

        uint96 contribution = poolContributionAmounts[poolId][msg.sender];
        if (contribution == 0) revert NoContribution();

        uint96 refund = uint96(
            (uint256(contribution) * uint256(data.totalRefund)) / uint256(data.totalEligibleContribution)
        );

        // ─── EFFECTS ────────────────────────────────────────────────────
        hasClaimedStaleRefund[poolId][msg.sender] = true;

        // ─── INTERACTIONS ───────────────────────────────────────────────
        if (refund > 0) {
            usdcToken.safeTransfer(msg.sender, refund);
        }

        emit StaleRefundClaimed(poolId, msg.sender, contribution, refund);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── ADMIN ─────────────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    function setStalePoolExitEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        stalePoolExitEnabled = enabled;
        emit StalePoolExitToggled(enabled);
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── VIEW HELPERS ──────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @notice Quote the refund a contributor would receive once they claim.
     *         Returns 0 if the pool isn't dissolved or the user has no contribution.
     */
    function pendingStaleRefund(uint256 poolId, address contributor) external view returns (uint96) {
        StaleExit storage data = staleExits[poolId];
        if (!data.dissolved || hasClaimedStaleRefund[poolId][contributor]) return 0;

        uint96 contribution = poolContributionAmounts[poolId][contributor];
        if (contribution == 0 || data.totalEligibleContribution == 0) return 0;

        return uint96(
            (uint256(contribution) * uint256(data.totalRefund)) / uint256(data.totalEligibleContribution)
        );
    }

    // ════════════════════════════════════════════════════════════════════
    // ─── INTERNAL ──────────────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════

    /**
     * @dev Common precondition checks shared by both trigger paths.
     */
    function _checkTriggerPreconditions(uint256 poolId) internal view {
        if (!stalePoolExitEnabled) revert StalePoolExitDisabled();
        if (poolId >= poolCount) revert PoolInvalidPoolId(poolId);

        PoolStructs.PoolInfo storage pool = pools[poolId];
        // Pool must have actually become king (Executed status)
        if (pool.status != PoolStructs.PoolStatus.Executed) revert PoolNotExecuted();

        // Cannot dissolve twice
        if (staleExits[poolId].dissolved) revert AlreadyDissolved();
    }

    /**
     * @dev Performs the dissolution: calls into V4 to get the refund,
     *      records totals, marks the pool dissolved.
     *      Strict CEI: state is set BEFORE the external V4 call writes the
     *      refund USDC to this contract; the call itself is the interaction.
     */
    function _executeStaleExit(uint256 poolId, bool wasLargeHolder) internal {
        PoolStructs.PoolInfo storage pool = pools[poolId];
        uint256 opinionId = pool.opinionId;
        uint96 totalContribution = pool.totalAmount;

        // ─── EFFECTS (mark dissolved BEFORE the external call) ──────────
        // We set `dissolved = true` here so a malicious V4 implementation
        // cannot re-enter back into a trigger to double-dissolve.
        StaleExit storage data = staleExits[poolId];
        data.dissolved = true;
        data.dissolvedAt = uint32(block.timestamp);
        data.totalEligibleContribution = totalContribution;

        // ─── INTERACTION (V4 call returns the refund USDC to this contract) ──
        uint96 refund = IOpinionCoreV4Pool(address(opinionCore)).processPoolStaleExit(opinionId);

        // ─── EFFECTS (record refund actually received) ──────────────────
        data.totalRefund = refund;

        emit PoolStaleExitTriggered(
            poolId,
            opinionId,
            msg.sender,
            refund,
            totalContribution,
            wasLargeHolder,
            uint32(block.timestamp)
        );
    }
}
