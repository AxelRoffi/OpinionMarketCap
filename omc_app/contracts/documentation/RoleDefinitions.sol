// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Role Definitions for the OpinionMarket System
 * @dev This file is for documentation purposes only, it is not deployed
 */
interface IRoleDocumentation {
    /**
     * OpinionCore:
     * - ADMIN_ROLE = keccak256("ADMIN_ROLE")
     *   General administration role, can modify parameters and roles
     *
     * - MODERATOR_ROLE = keccak256("MODERATOR_ROLE")
     *   Can moderate opinions (deactivation/reactivation)
     *
     * - MARKET_CONTRACT_ROLE = keccak256("MARKET_CONTRACT_ROLE")
     *   Reserved for the OpinionMarket contract, allows it to interact with OpinionCore
     *
     * - POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE")
     *   Reserved for the PoolManager contract, allows it to update opinions
     *
     * FeeManager:
     * - ADMIN_ROLE = keccak256("ADMIN_ROLE")
     *   Administration of the fee system, can modify parameters
     *
     * - TREASURY_ROLE = keccak256("TREASURY_ROLE")
     *   Can withdraw accumulated platform fees
     *
     * - CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE")
     *   Reserved for the OpinionCore contract, can accumulate fees and update MEV data
     *
     * PoolManager:
     * - ADMIN_ROLE = keccak256("ADMIN_ROLE")
     *   Pool administration, can modify parameters
     *
     * - MODERATOR_ROLE = keccak256("MODERATOR_ROLE")
     *   Can manage pools (extension, cancellation, etc.)
     *
     * OpinionMarket:
     * - ADMIN_ROLE = keccak256("ADMIN_ROLE")
     *   General administration, can update contract addresses
     *
     * - MODERATOR_ROLE = keccak256("MODERATOR_ROLE")
     *   Can moderate opinions and pools
     *
     * - OPERATOR_ROLE = keccak256("OPERATOR_ROLE")
     *   Can pause/unpause contracts in case of emergency
     *
     * - TREASURY_ROLE = keccak256("TREASURY_ROLE")
     *   Can withdraw platform funds
     */
}
