// FILEPATH: contracts/mocks/OpinionMarketV2Mock.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/OpinionMarket.sol";

/**
 * @title OpinionMarketV2Mock
 * @dev Simplified mock implementation for upgradeability testing
 */
contract OpinionMarketV2Mock is OpinionMarket {
    // New storage variable - must be added at the end to maintain storage layout
    string private newFeature;

    // No initializer function - we'll skip initialization for testing purposes
    // This avoids the issues with calling parent initializers

    /**
     * @dev Returns the contract version
     * @return version string
     */
    function getVersion() public pure returns (string memory) {
        return "v2";
    }

    /**
     * @dev Example of a new function added in V2
     * @return success boolean
     */
    function newV2Function() public pure returns (bool) {
        return true;
    }

    /**
     * @dev Returns the value of the new feature variable
     * @return newFeature string
     */
    function getNewFeature() public view returns (string memory) {
        // Check if newFeature is empty using bytes length instead of string comparison
        return
            bytes(newFeature).length == 0
                ? "This is a new feature in V2"
                : newFeature;
    }
}
