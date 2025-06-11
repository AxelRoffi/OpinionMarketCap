// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PoolOpinionMarket.sol";
import {OpinionMarketErrors} from "./OpinionMarketErrors.sol";

contract PoolOpinionMarketV2 is PoolOpinionMarket {
    // Storage gap for future upgrades
    uint256[50] private __gap;
    using SafeERC20 for IERC20;

    // Keep the existing implementation but update it for compatibility
    function contributeToPool(
        uint256 poolId,
        uint256 amount
    ) external override nonReentrant whenNotPaused {
        // Validation (with potentially lower minimum)
        uint256 actualAmount = _validatePoolContribution(poolId, amount);

        // Add contribution fee
        uint256 totalRequired = actualAmount + poolContributionFee;

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < totalRequired)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.INSUFFICIENT_ALLOWANCE,
                totalRequired,
                allowance
            );

        // Update pool state and get opinion ID
        uint256 opinionId = _updatePoolForContribution(poolId, actualAmount);

        // Transfer funds (including contribution fee)
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Handle the fee distribution among three parties
        _handleContributionFee(opinionId, poolId, poolContributionFee);

        // Check if pool has reached target price and execute if so
        _checkAndExecutePoolIfReady(poolId, opinionId);
    }
}
