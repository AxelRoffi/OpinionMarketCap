// libraries/PoolLibrary.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../structs/PoolStructs.sol";

library PoolLibrary {
    // Validate pool creation parameters
    function validatePoolCreationParams(
        PoolStructs.PoolCreationParams memory params,
        uint32 minPoolDuration,
        uint32 maxPoolDuration,
        uint96 minimumContribution,
        uint256 blockTimestamp,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength,
        uint256 maxPoolNameLength,
        uint256 maxIpfsHashLength,
        string memory currentAnswer
    ) internal pure {
        // Validate proposed answer
        bytes memory answerBytes = bytes(params.proposedAnswer);
        if (answerBytes.length == 0) revert("Empty answer");
        if (answerBytes.length > maxAnswerLength) revert("Answer too long");

        // Check that proposed answer is different from current
        if (keccak256(bytes(currentAnswer)) == keccak256(answerBytes))
            revert("Same answer as current");

        // Validate deadline
        if (params.deadline <= blockTimestamp + minPoolDuration)
            revert("Deadline too short");
        if (params.deadline > blockTimestamp + maxPoolDuration)
            revert("Deadline too long");

        // Validate initial contribution
        if (params.initialContribution < minimumContribution)
            revert("Contribution too low");

        // Validate pool name
        if (bytes(params.name).length > maxPoolNameLength)
            revert("Pool name too long");

        // Validate IPFS hash if provided
        validateIpfsHash(params.ipfsHash, maxIpfsHashLength);
    }

    // Validate IPFS hash
    function validateIpfsHash(
        string memory ipfsHash,
        uint256 maxLength
    ) internal pure {
        bytes memory ipfsHashBytes = bytes(ipfsHash);

        // Skip if empty
        if (ipfsHashBytes.length == 0) return;

        if (ipfsHashBytes.length > maxLength) revert("IPFS hash too long");

        // Check format
        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert("Invalid IPFS hash format");
        }
    }

    // Calculate pool funding status
    function calculatePoolFundingStatus(
        uint96 poolTotalAmount,
        uint96 targetPrice
    ) internal pure returns (bool isFullyFunded, uint96 remainingAmount) {
        isFullyFunded = poolTotalAmount >= targetPrice;
        remainingAmount = isFullyFunded ? 0 : targetPrice - poolTotalAmount;

        return (isFullyFunded, remainingAmount);
    }

    // Check if pool is expired
    function isPoolExpired(
        uint32 deadline,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        return blockTimestamp > deadline;
    }
}
