// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionExtensionsLibrary
 * @dev Library for managing opinion extension slots (string, number, bool, address)
 */
library OpinionExtensionsLibrary {
    
    /**
     * @dev Validates extension key according to imposed regex pattern
     * OBLIGATOIRE: ^[a-zA-Z0-9_]{1,32}$
     * @param key The extension key to validate
     * @return bool True if key is valid
     */
    function isValidExtensionKey(string memory key) internal pure returns (bool) {
        bytes memory keyBytes = bytes(key);

        // Length check: 1-32 chars
        if (keyBytes.length == 0 || keyBytes.length > 32) return false;

        // Character validation: alphanumeric + underscore only
        for (uint i = 0; i < keyBytes.length; i++) {
            uint8 char = uint8(keyBytes[i]);
            bool isAlpha = (char >= 65 && char <= 90) ||
                (char >= 97 && char <= 122);
            bool isNumeric = (char >= 48 && char <= 57);
            bool isUnderscore = (char == 95);

            if (!isAlpha && !isNumeric && !isUnderscore) return false;
        }

        return true;
    }

    /**
     * @dev Internal function to track extension keys (gas optimized)
     * OBLIGATOIRE: Tracker les keys pour éviter doublons et permettre enumeration
     * @param opinionExtensionKeys Storage reference to extension keys mapping
     * @param opinionId Opinion ID
     * @param key Extension key to track
     */
    function trackExtensionKey(
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 opinionId, 
        string memory key
    ) internal {
        string[] storage keys = opinionExtensionKeys[opinionId];

        // Gas optimization: Use keccak256 for comparison to avoid string copying
        bytes32 keyHash = keccak256(bytes(key));

        // Check if key already exists
        for (uint i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return; // Key already tracked, no need to add
            }
        }

        // Add new key
        keys.push(key);
    }

    /**
     * @dev Sets a string extension for an opinion
     * @param opinionStringExtensions Storage reference to string extensions mapping
     * @param opinionExtensionKeys Storage reference to extension keys mapping
     * @param nextOpinionId Current next opinion ID for validation
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionStringExtension(
        mapping(uint256 => mapping(string => string)) storage opinionStringExtensions,
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        string calldata value
    ) internal {
        // Opinion existence check
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();

        // Key validation
        if (!isValidExtensionKey(key)) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Set extension
        opinionStringExtensions[opinionId][key] = value;

        // Track key (if new)
        trackExtensionKey(opinionExtensionKeys, opinionId, key);

        // Event will be emitted by calling contract
    }

    /**
     * @dev Sets a number extension for an opinion
     */
    function setOpinionNumberExtension(
        mapping(uint256 => mapping(string => uint256)) storage opinionNumberExtensions,
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        uint256 value
    ) internal {
        // Opinion existence check
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();

        // Key validation
        if (!isValidExtensionKey(key)) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Set extension
        opinionNumberExtensions[opinionId][key] = value;

        // Track key (if new)
        trackExtensionKey(opinionExtensionKeys, opinionId, key);

        // Event will be emitted by calling contract
    }

    /**
     * @dev Sets a bool extension for an opinion
     */
    function setOpinionBoolExtension(
        mapping(uint256 => mapping(string => bool)) storage opinionBoolExtensions,
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        bool value
    ) internal {
        // Opinion existence check
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();

        // Key validation
        if (!isValidExtensionKey(key)) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Set extension
        opinionBoolExtensions[opinionId][key] = value;

        // Track key (if new)
        trackExtensionKey(opinionExtensionKeys, opinionId, key);

        // Event will be emitted by calling contract
    }

    /**
     * @dev Sets an address extension for an opinion
     */
    function setOpinionAddressExtension(
        mapping(uint256 => mapping(string => address)) storage opinionAddressExtensions,
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 nextOpinionId,
        uint256 opinionId,
        string calldata key,
        address value
    ) internal {
        // Opinion existence check
        if (opinionId >= nextOpinionId) revert IOpinionMarketErrors.OpinionNotFound();

        // Key validation
        if (!isValidExtensionKey(key)) revert IOpinionMarketErrors.InvalidExtensionKey();

        // Set extension
        opinionAddressExtensions[opinionId][key] = value;

        // Track key (if new)
        trackExtensionKey(opinionExtensionKeys, opinionId, key);

        // Event will be emitted by calling contract
    }

    /**
     * @dev Gets all extensions for an opinion
     * @param opinionStringExtensions Storage reference to string extensions
     * @param opinionNumberExtensions Storage reference to number extensions
     * @param opinionBoolExtensions Storage reference to bool extensions
     * @param opinionAddressExtensions Storage reference to address extensions
     * @param opinionExtensionKeys Storage reference to extension keys
     * @param opinionId Opinion ID
     * @return keys Array of extension keys
     * @return stringValues Array of string values (corresponds to keys)
     * @return numberValues Array of number values (corresponds to keys)
     * @return boolValues Array of bool values (corresponds to keys)
     * @return addressValues Array of address values (corresponds to keys)
     */
    function getOpinionExtensions(
        mapping(uint256 => mapping(string => string)) storage opinionStringExtensions,
        mapping(uint256 => mapping(string => uint256)) storage opinionNumberExtensions,
        mapping(uint256 => mapping(string => bool)) storage opinionBoolExtensions,
        mapping(uint256 => mapping(string => address)) storage opinionAddressExtensions,
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 opinionId
    ) internal view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        keys = opinionExtensionKeys[opinionId];
        uint256 length = keys.length;

        // Initialize arrays
        stringValues = new string[](length);
        numberValues = new uint256[](length);
        boolValues = new bool[](length);
        addressValues = new address[](length);

        // Fill arrays with values for each key
        for (uint256 i = 0; i < length; i++) {
            string memory key = keys[i];
            stringValues[i] = opinionStringExtensions[opinionId][key];
            numberValues[i] = opinionNumberExtensions[opinionId][key];
            boolValues[i] = opinionBoolExtensions[opinionId][key];
            addressValues[i] = opinionAddressExtensions[opinionId][key];
        }

        return (keys, stringValues, numberValues, boolValues, addressValues);
    }

    /**
     * @dev Checks if an opinion has a specific extension key
     * @param opinionExtensionKeys Storage reference to extension keys
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return exists True if the key exists for this opinion
     */
    function hasOpinionExtension(
        mapping(uint256 => string[]) storage opinionExtensionKeys,
        uint256 opinionId,
        string calldata key
    ) internal view returns (bool) {
        string[] memory keys = opinionExtensionKeys[opinionId];
        bytes32 keyHash = keccak256(bytes(key));

        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(keys[i])) == keyHash) {
                return true;
            }
        }

        return false;
    }
}