// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOpinionCoreV4Min {
    function selfExit(uint256 opinionId) external;
    function reclaimVacantSlot(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external;
    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description,
        string calldata link
    ) external payable;
}

/**
 * @title ReentrantKing
 * @notice Test-only attacker contract. Becomes king of an opinion, then on
 *         receiving USDC during selfExit, attempts to re-enter the same
 *         function (or another nonReentrant function) on OpinionCoreV4.
 *
 *         Used to verify ReentrancyGuard + CEI defeat token-hook reentry.
 *         A successful attack would mean the `reentrySucceeded` flag is set
 *         to true; a defended contract leaves it false (and either swallows
 *         the inner revert or reverts the entire outer tx, depending on
 *         whether onUSDCReceived re-throws).
 */
contract ReentrantKing {
    IOpinionCoreV4Min public immutable core;
    IERC20 public immutable usdc;
    uint256 public opinionId;
    bool public attacking;
    bool public reentrySucceeded;
    bool public reentryReverted;

    enum AttackTarget { SelfExit, Reclaim, SubmitAnswer }
    AttackTarget public target;

    constructor(address _core, address _usdc) {
        core = IOpinionCoreV4Min(_core);
        usdc = IERC20(_usdc);
    }

    function setOpinionId(uint256 _id) external {
        opinionId = _id;
    }

    function setTarget(AttackTarget _t) external {
        target = _t;
    }

    function approveCore(uint256 amount) external {
        usdc.approve(address(core), amount);
    }

    /// @notice Trigger the attack: starts a selfExit and arms the reentry trap.
    function startSelfExit() external {
        attacking = true;
        core.selfExit(opinionId);
        attacking = false;
    }

    /// @notice Hook called by HookableUSDC after every transfer to a contract.
    function onUSDCReceived() external {
        if (!attacking) return;

        if (target == AttackTarget.SelfExit) {
            try core.selfExit(opinionId) {
                reentrySucceeded = true; // BAD — guard failed
            } catch {
                reentryReverted = true;  // GOOD — guard worked
            }
        } else if (target == AttackTarget.Reclaim) {
            try core.reclaimVacantSlot(opinionId, "evil", "evil-desc", "") {
                reentrySucceeded = true;
            } catch {
                reentryReverted = true;
            }
        } else if (target == AttackTarget.SubmitAnswer) {
            try core.submitAnswer(opinionId, "evil", "evil-desc", "") {
                reentrySucceeded = true;
            } catch {
                reentryReverted = true;
            }
        }
    }
}
