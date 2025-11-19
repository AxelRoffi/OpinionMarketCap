// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionAdminLibrary
 * @dev Library for administrative functions and parameter management
 */
library OpinionAdminLibrary {

    /**
     * @dev Sets configurable parameters with validation
     * @param paramType Parameter type identifier
     * @param value New parameter value
     */
    function setParameter(
        uint8 paramType,
        uint256 value,
        uint96 minimumPrice,
        uint96 questionCreationFee,
        uint96 initialAnswerPrice,
        uint256 absoluteMaxPriceChange,
        uint256 maxTradesPerBlock,
        uint256 creationFeePercent,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength,
        uint256 maxLinkLength,
        uint256 maxIpfsHashLength,
        uint256 maxDescriptionLength,
        uint256 maxCategoriesPerOpinion
    ) internal pure returns (
        uint96 newMinimumPrice,
        uint96 newQuestionCreationFee,
        uint96 newInitialAnswerPrice,
        uint256 newAbsoluteMaxPriceChange,
        uint256 newMaxTradesPerBlock,
        uint256 newCreationFeePercent,
        uint256 newMaxQuestionLength,
        uint256 newMaxAnswerLength,
        uint256 newMaxLinkLength,
        uint256 newMaxIpfsHashLength,
        uint256 newMaxDescriptionLength,
        uint256 newMaxCategoriesPerOpinion
    ) {
        // Initialize with current values
        newMinimumPrice = minimumPrice;
        newQuestionCreationFee = questionCreationFee;
        newInitialAnswerPrice = initialAnswerPrice;
        newAbsoluteMaxPriceChange = absoluteMaxPriceChange;
        newMaxTradesPerBlock = maxTradesPerBlock;
        newCreationFeePercent = creationFeePercent;
        newMaxQuestionLength = maxQuestionLength;
        newMaxAnswerLength = maxAnswerLength;
        newMaxLinkLength = maxLinkLength;
        newMaxIpfsHashLength = maxIpfsHashLength;
        newMaxDescriptionLength = maxDescriptionLength;
        newMaxCategoriesPerOpinion = maxCategoriesPerOpinion;

        if (paramType == 0) {
            newMinimumPrice = uint96(value);
        } else if (paramType == 6) {
            newQuestionCreationFee = uint96(value);
        } else if (paramType == 7) {
            newInitialAnswerPrice = uint96(value);
        } else if (paramType == 3) {
            newAbsoluteMaxPriceChange = value;
        } else if (paramType == 4) {
            newMaxTradesPerBlock = value;
        } else if (paramType == 14) {
            require(value <= 100, "Creation fee cannot exceed 100%");
            newCreationFeePercent = value;
        } else if (paramType == 8) {
            require(value >= 2 && value <= 500, "Invalid question length");
            newMaxQuestionLength = value;
        } else if (paramType == 9) {
            require(value >= 2 && value <= 500, "Invalid answer length");
            newMaxAnswerLength = value;
        } else if (paramType == 10) {
            require(value > 0 && value <= 2000, "Invalid link length");
            newMaxLinkLength = value;
        } else if (paramType == 11) {
            require(value > 0 && value <= 200, "Invalid IPFS hash length");
            newMaxIpfsHashLength = value;
        } else if (paramType == 12) {
            require(value >= 2 && value <= 1000, "Invalid description length");
            newMaxDescriptionLength = value;
        } else if (paramType == 13) {
            require(value > 0 && value <= 10, "Invalid max categories");
            newMaxCategoriesPerOpinion = value;
        }
    }

    /**
     * @dev Validates treasury change with timelock
     * @param currentTime Current block timestamp
     * @param treasuryChangeTimestamp Scheduled change timestamp
     * @param pendingTreasury Pending treasury address
     */
    function validateTreasuryChange(
        uint256 currentTime,
        uint256 treasuryChangeTimestamp,
        address pendingTreasury
    ) internal pure {
        if (currentTime < treasuryChangeTimestamp)
            revert("Treasury: Timelock not elapsed");
        if (pendingTreasury == address(0))
            revert("Treasury: No pending treasury");
    }

    /**
     * @dev Adds a new category with duplicate checking
     * @param categories Current categories array
     * @param newCategory The new category to add
     * @return success Whether the category was added (false if already exists)
     */
    function addCategory(
        string[] storage categories,
        string calldata newCategory
    ) internal returns (bool success) {
        // Check if category already exists
        bytes32 newCategoryHash = keccak256(bytes(newCategory));
        uint256 length = categories.length;

        for (uint256 i = 0; i < length; i++) {
            if (keccak256(bytes(categories[i])) == newCategoryHash) {
                revert IOpinionMarketErrors.CategoryAlreadyExists();
            }
        }

        categories.push(newCategory);
        return true;
    }

    /**
     * @dev Adds multiple categories in batch
     * @param categories Current categories array
     * @param newCategories Array of new categories to add
     * @return addedCount Number of categories actually added (excluding duplicates)
     */
    function addMultipleCategories(
        string[] storage categories,
        string[] calldata newCategories
    ) internal returns (uint256 addedCount) {
        for (uint256 i = 0; i < newCategories.length; i++) {
            // Check if category already exists
            bytes32 newCategoryHash = keccak256(bytes(newCategories[i]));
            uint256 length = categories.length;
            bool exists = false;

            for (uint256 j = 0; j < length; j++) {
                if (keccak256(bytes(categories[j])) == newCategoryHash) {
                    exists = true;
                    break;
                }
            }

            // Only add if doesn't exist
            if (!exists) {
                categories.push(newCategories[i]);
                addedCount++;
            }
        }
    }

    /**
     * @dev Validates admin parameter ranges
     * @param paramType Parameter type
     * @param value Parameter value
     */
    function validateParameterRange(uint8 paramType, uint256 value) internal pure {
        if (paramType == 14) { // creationFeePercent
            require(value <= 100, "Creation fee cannot exceed 100%");
        } else if (paramType == 8) { // maxQuestionLength
            require(value >= 2 && value <= 500, "Invalid question length");
        } else if (paramType == 9) { // maxAnswerLength
            require(value >= 2 && value <= 500, "Invalid answer length");
        } else if (paramType == 10) { // maxLinkLength
            require(value > 0 && value <= 2000, "Invalid link length");
        } else if (paramType == 11) { // maxIpfsHashLength
            require(value > 0 && value <= 200, "Invalid IPFS hash length");
        } else if (paramType == 12) { // maxDescriptionLength
            require(value >= 2 && value <= 1000, "Invalid description length");
        } else if (paramType == 13) { // maxCategoriesPerOpinion
            require(value > 0 && value <= 10, "Invalid max categories");
        }
    }

    /**
     * @dev Calculates treasury change delay timestamp
     * @param currentTime Current timestamp
     * @param delay Delay in seconds (typically 48 hours)
     * @return changeTimestamp When the change can be executed
     */
    function calculateTreasuryChangeTimestamp(
        uint256 currentTime,
        uint256 delay
    ) internal pure returns (uint256 changeTimestamp) {
        return currentTime + delay;
    }

    /**
     * @dev Emits parameter updated event
     * @param paramType Parameter type identifier
     * @param value New parameter value
     */
    // Parameter update event emitted by calling contract

    /**
     * @dev Emits category action event
     * @param actionType Action type (0 = add)
     * @param categoryIndex Index of the category
     * @param category Category string
     * @param admin Admin address performing the action
     */
    // Category action event emitted by calling contract

    /**
     * @dev Emits treasury updated event
     * @param oldTreasury Previous treasury address
     * @param newTreasury New treasury address
     * @param admin Admin performing the change
     * @param timestamp When the change occurred
     */
    // Treasury update event emitted by calling contract

    /**
     * @dev Emits admin action event
     * @param actionType Type of admin action
     * @param admin Admin performing the action
     * @param data Additional data
     * @param value Numeric value associated with action
     */
    // Admin action event emitted by calling contract
}