// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ValidationLib {
    struct ValidationResult {
        bool isValid;
        uint8 errorCode;
    }

    function validateIpfsHash(
        string memory ipfsHash,
        uint256 maxIpfsHashLength
    ) internal pure returns (ValidationResult memory) {
        bytes memory ipfsHashBytes = bytes(ipfsHash);

        if (ipfsHashBytes.length > maxIpfsHashLength)
            return ValidationResult(false, 1); // Too long

        // Only validate format if not empty
        if (ipfsHashBytes.length > 0) {
            // Check that it's either a valid CIDv0 (starts with "Qm" and is 46 chars long)
            // or a valid CIDv1 (starts with "b" and has a proper length)
            bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
                ipfsHashBytes[0] == "Q" &&
                ipfsHashBytes[1] == "m";

            bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
                ipfsHashBytes[0] == "b";

            if (!isValidCIDv0 && !isValidCIDv1) {
                return ValidationResult(false, 2); // Invalid format
            }
        }

        return ValidationResult(true, 0);
    }

    function validateBasicOpinionParams(
        string memory question,
        string memory initialAnswer,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength
    ) internal pure returns (ValidationResult memory) {
        bytes memory questionBytes = bytes(question);
        bytes memory answerBytes = bytes(initialAnswer);

        if (questionBytes.length == 0 || answerBytes.length == 0)
            return ValidationResult(false, 1); // Empty string
        if (questionBytes.length > maxQuestionLength)
            return ValidationResult(false, 2); // Invalid question length
        if (answerBytes.length > maxAnswerLength)
            return ValidationResult(false, 3); // Invalid answer length

        return ValidationResult(true, 0);
    }

    function validateFullOpinionParams(
        string memory question,
        string memory initialAnswer,
        string memory ipfsHash,
        string memory link,
        uint256 maxQuestionLength,
        uint256 maxAnswerLength,
        uint256 maxIpfsHashLength,
        uint256 maxLinkLength
    ) internal pure returns (ValidationResult memory) {
        // First validate basic parameters
        ValidationResult memory basicResult = validateBasicOpinionParams(
            question,
            initialAnswer,
            maxQuestionLength,
            maxAnswerLength
        );

        if (!basicResult.isValid) return basicResult;

        // Then validate IPFS hash and link
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > maxIpfsHashLength)
            return ValidationResult(false, 4); // Invalid IPFS hash length

        if (linkBytes.length > maxLinkLength) return ValidationResult(false, 5); // Invalid link length

        // Validate IPFS hash format if not empty
        if (ipfsHashBytes.length > 0) {
            ValidationResult memory ipfsResult = validateIpfsHash(
                ipfsHash,
                maxIpfsHashLength
            );
            if (!ipfsResult.isValid) return ValidationResult(false, 6); // Invalid IPFS hash format
        }

        return ValidationResult(true, 0);
    }

    function validatePriceChange(
        uint256 lastPrice,
        uint256 newPrice,
        uint256 absoluteMaxPriceChange
    ) internal pure returns (ValidationResult memory) {
        if (newPrice > lastPrice) {
            uint256 increase = ((newPrice - lastPrice) * 100) / lastPrice;
            if (increase > absoluteMaxPriceChange) {
                return ValidationResult(false, 1); // Price change exceeds limit
            }
        }
        return ValidationResult(true, 0);
    }
}
