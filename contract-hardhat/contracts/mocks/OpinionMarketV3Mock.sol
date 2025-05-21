// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/OpinionMarket.sol";

/**
 * @title OpinionMarketV3Mock
 * @dev Simplified mock implementation for upgradeability testing
 */
contract OpinionMarketV3Mock is OpinionMarket {
    // V2 features
    string private newFeature;

    // V3 new storage variable
    mapping(address => bool) private premiumUsers;

    // No initializer function - we'll skip initialization for testing purposes
    // This avoids the issues with calling parent initializers

    /**
     * @dev Returns the contract version
     * @return version string
     */
    function getVersion() public pure returns (string memory) {
        return "v3";
    }

    /**
     * @dev Example of a new function added in V2 (carried over)
     * @return success boolean
     */
    function newV2Function() public pure returns (bool) {
        return true;
    }

    /**
     * @dev Returns the value of the new feature variable (carried over from V2)
     * @return newFeature string
     */
    function getNewFeature() public view returns (string memory) {
        // Check if newFeature is empty using bytes length instead of string comparison
        return
            bytes(newFeature).length == 0
                ? "This is a new feature in V2"
                : newFeature;
    }

    /**
     * @dev Sets a user as premium (V3 feature)
     * @param user Address of the user to set as premium
     */
    function setPremiumUser(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        premiumUsers[user] = true;
    }

    /**
     * @dev Checks if a user is premium (V3 feature)
     * @param user Address of the user to check
     * @return isPremium boolean representing if the user is premium
     */
    function isPremiumUser(address user) public view returns (bool) {
        return premiumUsers[user];
    }
}
