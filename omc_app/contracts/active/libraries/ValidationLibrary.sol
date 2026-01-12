// libraries/ValidationLibrary.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

library ValidationLibrary {
    // Validate opinion creation parameters
    function validateOpinionParams(
        string memory question,
        string memory initialAnswer,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength
    ) public pure {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length < 2 || answerBytes.length < 2)
            revert("Minimum 2 characters required");
        if (questionBytes.length > maxQuestionLength)
            revert("Question too long");
        if (answerBytes.length > maxAnswerLength) revert("Answer too long");
    }

    // Validate parameter update with bounds
    function validateParameterUpdate(
        uint256 value,
        uint256 maxValue,
        uint256 lastUpdateTime,
        uint256 cooldownPeriod,
        uint256 blockTimestamp
    ) public pure {
        // Check value is within bounds
        if (value > maxValue) revert("Value exceeds maximum");

        // Check cooldown period has elapsed
        if (lastUpdateTime + cooldownPeriod > blockTimestamp)
            revert("Cooldown not elapsed");
    }

    // Check if address is valid (non-zero)
    function validateAddress(address addr) public pure {
        if (addr == address(0)) revert("Zero address not allowed");
    }

    // Validate transaction rate limit
    function validateRateLimit(
        uint256 userLastBlock,
        uint256 userTradesInBlock,
        uint256 maxTradesPerBlock,
        uint256 blockNumber
    ) public pure returns (uint256 newTradesInBlock) {
        if (userLastBlock != blockNumber) {
            // First trade in this block
            return 1;
        } else {
            // Increment trade count
            newTradesInBlock = userTradesInBlock + 1;

            // Check if exceeds limit
            if (newTradesInBlock > maxTradesPerBlock)
                revert("Max trades per block exceeded");

            return newTradesInBlock;
        }
    }

    /**
     * @dev Validates answer description (optional, configurable max chars)
     * @param description Answer description (can be empty string)
     * @param maxLength Maximum allowed length for description
     */
    function validateDescription(string memory description, uint256 maxLength) public pure {
        bytes memory descriptionBytes = bytes(description);
        
        // If description is provided, must be at least 2 characters
        if (descriptionBytes.length > 0 && descriptionBytes.length < 2) {
            revert("Description minimum 2 characters");
        }
        // Check maximum length
        if (descriptionBytes.length > maxLength) revert("Description too long");
    }

    /**
     * @dev Validates answer description (backward compatibility - deprecated)
     * @param description Answer description (can be empty string)
     */
    function validateDescription(string memory description) public pure {
        bytes memory descriptionBytes = bytes(description);
        
        // If description is provided, must be at least 2 characters
        if (descriptionBytes.length > 0 && descriptionBytes.length < 2) {
            revert("Description minimum 2 characters");
        }
        // Check maximum length
        if (descriptionBytes.length > 120) revert("Description too long");
    }

    /**
     * @dev Validates opinion categories against available categories (configurable max)
     * @param userCategories Categories selected by user 
     * @param availableCategories Global available categories array
     * @param maxCategoriesAllowed Maximum number of categories allowed per opinion
     */
    function validateOpinionCategories(
        string[] memory userCategories,
        string[] storage availableCategories,
        uint256 maxCategoriesAllowed
    ) public view {
        uint256 userLength = userCategories.length;
        
        // 1. Length validation
        if (userLength == 0) revert("NoCategoryProvided");
        if (userLength > maxCategoriesAllowed) revert("TooManyCategories");
        
        // 2. Duplicate check - OPTIMIZED for gas in creative freedom zone
        for (uint256 i = 0; i < userLength; i++) {
            for (uint256 j = i + 1; j < userLength; j++) {
                if (keccak256(bytes(userCategories[i])) == keccak256(bytes(userCategories[j]))) {
                    revert("DuplicateCategory");
                }
            }
        }
        
        // 3. Existence check - OPTIMIZED for gas in creative freedom zone
        uint256 availableLength = availableCategories.length;
        for (uint256 i = 0; i < userLength; i++) {
            bool found = false;
            bytes32 userCatHash = keccak256(bytes(userCategories[i]));
            
            for (uint256 j = 0; j < availableLength; j++) {
                if (userCatHash == keccak256(bytes(availableCategories[j]))) {
                    found = true;
                    break; // Gas optimization: early exit
                }
            }
            
            if (!found) revert("InvalidCategory");
        }
    }

    /**
     * @dev Validates opinion categories against available categories (backward compatibility)
     * @param userCategories Categories selected by user (1-3 required)
     * @param availableCategories Global available categories array
     * 🚨 IMPOSED SIGNATURE - DO NOT MODIFY
     */
    function validateOpinionCategories(
        string[] memory userCategories,
        string[] storage availableCategories
    ) public view {
        uint256 userLength = userCategories.length;
        
        // 1. Length validation - IMPOSED ORDER
        if (userLength == 0) revert("NoCategoryProvided");
        if (userLength > 3) revert("TooManyCategories");
        
        // 2. Duplicate check - OPTIMIZED for gas in creative freedom zone
        for (uint256 i = 0; i < userLength; i++) {
            for (uint256 j = i + 1; j < userLength; j++) {
                if (keccak256(bytes(userCategories[i])) == keccak256(bytes(userCategories[j]))) {
                    revert("DuplicateCategory");
                }
            }
        }
        
        // 3. Existence check - OPTIMIZED for gas in creative freedom zone
        uint256 availableLength = availableCategories.length;
        for (uint256 i = 0; i < userLength; i++) {
            bool found = false;
            bytes32 userCatHash = keccak256(bytes(userCategories[i]));
            
            for (uint256 j = 0; j < availableLength; j++) {
                if (userCatHash == keccak256(bytes(availableCategories[j]))) {
                    found = true;
                    break; // Gas optimization: early exit
                }
            }
            
            if (!found) revert("InvalidCategory");
        }
    }
}
