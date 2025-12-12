// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOpinionMarketEvents.sol";
import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionExtensionAdminLib
 * @dev Library for managing opinion extensions and admin functions
 */
library OpinionExtensionAdminLib {
    /**
     * @dev Sets a string extension for an opinion
     * @param stringExtensions The mapping to store string extensions
     * @param extensionKeys The mapping to track extension keys
     * @param nextOpinionId The next opinion ID counter
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionStringExtension(
        mapping(uint256 => mapping(string => string)) storage stringExtensions,
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        string calldata value
    ) internal {
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();
        if (bytes(key).length == 0) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Check if key already exists
        bool keyExists = false;
        string[] storage keys = extensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) {
                keyExists = true;
                break;
            }
        }

        // Add key if it doesn't exist
        if (!keyExists) {
            extensionKeys[opinionId].push(key);
        }

        stringExtensions[opinionId][key] = value;
    }

    /**
     * @dev Sets a number extension for an opinion
     * @param numberExtensions The mapping to store number extensions
     * @param extensionKeys The mapping to track extension keys
     * @param nextOpinionId The next opinion ID counter
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionNumberExtension(
        mapping(uint256 => mapping(string => uint256)) storage numberExtensions,
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        uint256 value
    ) internal {
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();
        if (bytes(key).length == 0) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Check if key already exists
        bool keyExists = false;
        string[] storage keys = extensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) {
                keyExists = true;
                break;
            }
        }

        // Add key if it doesn't exist
        if (!keyExists) {
            extensionKeys[opinionId].push(key);
        }

        numberExtensions[opinionId][key] = value;
    }

    /**
     * @dev Sets a bool extension for an opinion
     * @param boolExtensions The mapping to store bool extensions
     * @param extensionKeys The mapping to track extension keys
     * @param nextOpinionId The next opinion ID counter
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionBoolExtension(
        mapping(uint256 => mapping(string => bool)) storage boolExtensions,
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        bool value
    ) internal {
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();
        if (bytes(key).length == 0) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Check if key already exists
        bool keyExists = false;
        string[] storage keys = extensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) {
                keyExists = true;
                break;
            }
        }

        // Add key if it doesn't exist
        if (!keyExists) {
            extensionKeys[opinionId].push(key);
        }

        boolExtensions[opinionId][key] = value;
    }

    /**
     * @dev Sets an address extension for an opinion
     * @param addressExtensions The mapping to store address extensions
     * @param extensionKeys The mapping to track extension keys
     * @param nextOpinionId The next opinion ID counter
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionAddressExtension(
        mapping(uint256 => mapping(string => address)) storage addressExtensions,
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        address value
    ) internal {
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();
        if (bytes(key).length == 0) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Check if key already exists
        bool keyExists = false;
        string[] storage keys = extensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) {
                keyExists = true;
                break;
            }
        }

        // Add key if it doesn't exist
        if (!keyExists) {
            extensionKeys[opinionId].push(key);
        }

        addressExtensions[opinionId][key] = value;
    }

    /**
     * @dev Gets all extensions for an opinion
     * @param stringExtensions The mapping for string extensions
     * @param numberExtensions The mapping for number extensions
     * @param boolExtensions The mapping for bool extensions
     * @param addressExtensions The mapping for address extensions
     * @param extensionKeys The mapping for extension keys
     * @param opinionId Opinion ID
     */
    function getOpinionExtensions(
        mapping(uint256 => mapping(string => string)) storage stringExtensions,
        mapping(uint256 => mapping(string => uint256)) storage numberExtensions,
        mapping(uint256 => mapping(string => bool)) storage boolExtensions,
        mapping(uint256 => mapping(string => address)) storage addressExtensions,
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 opinionId
    ) internal view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        keys = extensionKeys[opinionId];
        uint256 length = keys.length;
        
        stringValues = new string[](length);
        numberValues = new uint256[](length);
        boolValues = new bool[](length);
        addressValues = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            string memory key = keys[i];
            stringValues[i] = stringExtensions[opinionId][key];
            numberValues[i] = numberExtensions[opinionId][key];
            boolValues[i] = boolExtensions[opinionId][key];
            addressValues[i] = addressExtensions[opinionId][key];
        }
        
        return (keys, stringValues, numberValues, boolValues, addressValues);
    }

    /**
     * @dev Checks if an opinion has a specific extension key
     * @param extensionKeys The mapping for extension keys
     * @param opinionId Opinion ID
     * @param key Extension key to check
     * @return exists True if the key exists
     */
    function hasOpinionExtension(
        mapping(uint256 => string[]) storage extensionKeys,
        uint256 opinionId,
        string calldata key
    ) internal view returns (bool exists) {
        string[] storage keys = extensionKeys[opinionId];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keccak256(bytes(key))) {
                return true;
            }
        }
        return false;
    }
}