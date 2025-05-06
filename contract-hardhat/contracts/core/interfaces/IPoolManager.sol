// interfaces/IPoolManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../structs/PoolStructs.sol";

interface IPoolManager {
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) external;

    function contributeToPool(uint256 poolId, uint256 amount) external;

    function withdrawFromExpiredPool(uint256 poolId) external;

    function extendPoolDeadline(uint256 poolId, uint256 newDeadline) external;

    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            PoolStructs.PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        );

    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory);

    function checkPoolExpiry(uint256 poolId) external returns (bool);

    function getOpinionPools(
        uint256 opinionId
    ) external view returns (uint256[] memory);

    function distributePoolRewards(
        uint256 opinionId,
        uint256 purchasePrice,
        address buyer
    ) external;

    function executePoolIfReady(uint256 poolId, uint256 opinionId) external;

    function getPoolRewardInfo(
        uint256 poolId
    )
        external
        view
        returns (
            address[] memory contributors,
            uint96[] memory amounts,
            uint96 totalAmount
        );
}
