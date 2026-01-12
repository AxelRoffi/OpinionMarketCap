// interfaces/IFeeManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../structs/OpinionStructs.sol";

interface IFeeManager {
    function accumulateFee(address recipient, uint96 amount) external;

    function claimAccumulatedFees() external;

    function withdrawPlatformFees(address token, address recipient) external;

    function getTotalAccumulatedFees() external view returns (uint96);

    function getAccumulatedFees(address user) external view returns (uint96);

    function calculateFees(
        uint256 price
    ) external view returns (OpinionStructs.FeeDistribution memory);

    function calculateFeeDistribution(
        uint256 price
    )
        external
        view
        returns (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount);

    function handlePoolCreationFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external;

    function handleContributionFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external;

    function applyMEVPenalty(
        uint96 price,
        uint96 ownerAmount,
        address trader,
        uint256 opinionId
    )
        external
        view
        returns (uint96 adjustedPlatformFee, uint96 adjustedOwnerAmount);
}
