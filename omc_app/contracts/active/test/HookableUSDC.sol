// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title HookableUSDC
 * @notice Test-only ERC20 that calls `onUSDCReceived()` on a contract recipient
 *         after every successful transfer. Used to simulate ERC777-style
 *         token hooks for reentrancy testing.
 *
 *         Real Base USDC has no such hook — this exists purely to validate
 *         that OpinionCoreV4's `nonReentrant` + CEI ordering would defeat
 *         a hypothetical token-hook attack vector.
 */
contract HookableUSDC is ERC20 {
    bool public hookEnabled;

    constructor() ERC20("Hookable USDC", "hUSDC") {
        hookEnabled = true;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @dev Toggle the hook for tests that need a vanilla transfer.
    function setHookEnabled(bool enabled) external {
        hookEnabled = enabled;
    }

    /**
     * @dev OpenZeppelin v5 single-entrypoint for transfers/mints/burns.
     *      We trigger the recipient hook AFTER the balance update, mirroring
     *      what an ERC777-style token would do. Hook failures are swallowed
     *      so non-attacker recipients (EOAs, FeeManager, treasury) aren't
     *      blocked.
     */
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (hookEnabled && to != address(0) && to.code.length > 0) {
            (bool ok, ) = to.call(abi.encodeWithSignature("onUSDCReceived()"));
            ok; // ignore — purely defensive
        }
    }
}
