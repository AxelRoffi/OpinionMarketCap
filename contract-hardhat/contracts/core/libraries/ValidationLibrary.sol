// libraries/ValidationLibrary.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ValidationLibrary {
    // Validate opinion creation parameters
    function validateOpinionParams(
        string memory question,
        string memory initialAnswer,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength
    ) internal pure {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length == 0 || answerBytes.length == 0)
            revert("Empty string");
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
    ) internal pure {
        // Check value is within bounds
        if (value > maxValue) revert("Value exceeds maximum");

        // Check cooldown period has elapsed
        if (lastUpdateTime + cooldownPeriod > blockTimestamp)
            revert("Cooldown not elapsed");
    }

    // Check if address is valid (non-zero)
    function validateAddress(address addr) internal pure {
        if (addr == address(0)) revert("Zero address not allowed");
    }

    // Validate transaction rate limit
    function validateRateLimit(
        uint256 userLastBlock,
        uint256 userTradesInBlock,
        uint256 maxTradesPerBlock,
        uint256 blockNumber
    ) internal pure returns (uint256 newTradesInBlock) {
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
}
