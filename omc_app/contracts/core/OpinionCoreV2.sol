// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionCore.sol";

/**
 * @title OpinionCoreV2
 * @dev Version 2 of OpinionCore with configurable creation fee percentage
 * @notice This version adds configurable creation fee without breaking storage layout
 */
contract OpinionCoreV2 is OpinionCore {
    
    // NEW: Add creation fee percentage at the end of storage layout
    uint256 public creationFeePercentV2;
    
    /**
     * @dev Initialize the new variable during upgrade
     * @notice This function should be called once after upgrade
     */
    function initializeV2() external onlyRole(ADMIN_ROLE) {
        require(creationFeePercentV2 == 0, "Already initialized");
        creationFeePercentV2 = 20; // Set default 20%
    }
    
    /**
     * @dev Sets the creation fee percentage
     * @param _creationFeePercent New creation fee percentage (e.g., 20 for 20%)
     */
    function setCreationFeePercentV2(
        uint256 _creationFeePercent
    ) external onlyRole(ADMIN_ROLE) {
        require(_creationFeePercent <= 100, "Creation fee cannot exceed 100%");
        creationFeePercentV2 = _creationFeePercent;
        emit ParameterUpdated(15, _creationFeePercent); // Use new parameter ID
    }
    
    /**
     * @dev Override createOpinion to use configurable fee percentage
     */
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        // 1. Access control check FIRST
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // 2. Categories validation
        ValidationLibrary.validateOpinionCategories(
            opinionCategories,
            categories,
            maxCategoriesPerOpinion
        );

        // 3. Validation
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            maxQuestionLength,
            maxAnswerLength
        );

        ValidationLibrary.validateDescription(description, maxDescriptionLength);

        // 4. Validate initialPrice range (1-100 USDC inclusive)
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // 5. NEW: Use configurable creation fee percentage
        uint256 feePercent = creationFeePercentV2 > 0 ? creationFeePercentV2 : 20; // Fallback to 20%
        uint96 creationFee = uint96((initialPrice * feePercent) / 100);
        if (creationFee < 5_000_000) { // 5 USDC minimum
            creationFee = 5_000_000;
        }

        // 6. Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert InsufficientAllowance(creationFee, allowance);

        // 7. Create opinion record
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            "",
            "",
            initialPrice,
            opinionCategories
        );

        // 8. Transfer creation fee to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, creationFee);

        // 9. Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }
    
    /**
     * @dev Override createOpinionWithExtras to use configurable fee percentage
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external override nonReentrant whenNotPaused {
        // 1. Access control check FIRST
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // 2. Categories validation
        ValidationLibrary.validateOpinionCategories(
            opinionCategories,
            categories,
            maxCategoriesPerOpinion
        );

        // 3. Validation
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            maxQuestionLength,
            maxAnswerLength
        );

        ValidationLibrary.validateDescription(description, maxDescriptionLength);

        // Validate IPFS hash and link
        bytes memory ipfsHashBytes = bytes(ipfsHash);
        bytes memory linkBytes = bytes(link);

        if (ipfsHashBytes.length > maxIpfsHashLength)
            revert InvalidIpfsHashLength();
        if (linkBytes.length > maxLinkLength) revert InvalidLinkLength();

        // Validate IPFS hash format if not empty
        if (ipfsHashBytes.length > 0) {
            _validateIpfsHash(ipfsHash);
        }

        // 4. Validate initialPrice range
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // 5. NEW: Use configurable creation fee percentage
        uint256 feePercent = creationFeePercentV2 > 0 ? creationFeePercentV2 : 20; // Fallback to 20%
        uint96 creationFee = uint96((initialPrice * feePercent) / 100);
        if (creationFee < 5_000_000) { // 5 USDC minimum
            creationFee = 5_000_000;
        }

        // 6. Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < creationFee)
            revert InsufficientAllowance(creationFee, allowance);

        // 7. Create opinion with extras
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            ipfsHash,
            link,
            initialPrice,
            opinionCategories
        );

        // 8. Transfer creation fee to treasury
        usdcToken.safeTransferFrom(msg.sender, treasury, creationFee);

        // 9. Emit events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }
    
    /**
     * @dev Get current creation fee percentage
     * @return Current fee percentage (e.g., 20 for 20%)
     */
    function getCreationFeePercent() external view returns (uint256) {
        return creationFeePercentV2 > 0 ? creationFeePercentV2 : 20;
    }
}