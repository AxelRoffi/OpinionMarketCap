// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../structs/OpinionStructs.sol";
import "../libraries/ValidationLibrary.sol";
import "../libraries/OpinionPricingLibrary.sol";
import "../libraries/OpinionModerationLibrary.sol";
import "../interfaces/IOpinionMarketEvents.sol";
import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionCreationLib
 * @dev Library for handling opinion creation logic to reduce OpinionCore contract size
 */
library OpinionCreationLib {
    using SafeERC20 for IERC20;

    // Events to match OpinionCore
    event OpinionAction(
        uint256 indexed opinionId,
        uint8 actionType,
        string data,
        address indexed actor,
        uint256 value
    );

    struct CreationParams {
        string question;
        string answer;
        string description;
        string ipfsHash;
        string link;
        uint96 initialPrice;
        string[] categories;
    }

    struct Context {
        address sender;
        IERC20 usdcToken;
        address treasury;
        uint256 creationFeePercent;
        bool isPublicCreationEnabled;
        bool isAdmin;
        uint256 maxCategoriesPerOpinion;
        uint256 maxQuestionLength;
        uint256 maxAnswerLength;
        uint256 maxDescriptionLength;
        uint256 maxIpfsHashLength;
        uint256 maxLinkLength;
    }

    /**
     * @dev Validates and processes opinion creation
     */
    function validateAndProcessCreation(
        CreationParams memory params,
        Context memory ctx,
        string[] storage validCategories
    ) public {
        // 1. Access control check
        if (!ctx.isPublicCreationEnabled && !ctx.isAdmin) {
            revert IOpinionMarketErrors.UnauthorizedCreator();
        }

        // 2. Categories validation
        ValidationLibrary.validateOpinionCategories(
            params.categories,
            validCategories,
            ctx.maxCategoriesPerOpinion
        );

        // 3. Params validation
        ValidationLibrary.validateOpinionParams(
            params.question,
            params.answer,
            ctx.maxQuestionLength,
            ctx.maxAnswerLength
        );

        // Validate description
        ValidationLibrary.validateDescription(params.description, ctx.maxDescriptionLength);

        // Validate IPFS hash and link if present
        if (bytes(params.ipfsHash).length > 0) {
            if (bytes(params.ipfsHash).length > ctx.maxIpfsHashLength)
                revert IOpinionMarketErrors.InvalidIpfsHashLength();
            OpinionModerationLibrary.validateIpfsHash(params.ipfsHash);
        }

        if (bytes(params.link).length > 0) {
            if (bytes(params.link).length > ctx.maxLinkLength)
                revert IOpinionMarketErrors.InvalidLinkLength();
        }

        // Validate initialPrice range
        if (params.initialPrice < 1_000_000 || params.initialPrice > 100_000_000) {
            revert IOpinionMarketErrors.InvalidInitialPrice();
        }

        // Calculate creation fee: MAX(1 USDC, 20% of initial price)
        uint96 creationFee = OpinionPricingLibrary.calculateCreationFee(
            params.initialPrice,
            20, // 20% of initial price
            1_000_000 // 1 USDC minimum
        );

        // Check allowance
        uint256 allowance = ctx.usdcToken.allowance(ctx.sender, address(this));
        if (allowance < creationFee) {
            revert IOpinionMarketErrors.InsufficientAllowance(creationFee, allowance);
        }

        // Transfer creation fee to treasury
        ctx.usdcToken.safeTransferFrom(ctx.sender, ctx.treasury, creationFee);
    }

    /**
     * @dev Creates the opinion record in storage
     */
    function createOpinionRecord(
        mapping(uint256 => OpinionStructs.Opinion) storage opinions,
        uint256 opinionId,
        CreationParams memory params,
        address creator
    ) public {
        OpinionStructs.Opinion storage opinion = opinions[opinionId];
        
        opinion.creator = creator;
        opinion.question = params.question;
        opinion.currentAnswer = params.answer;
        opinion.currentAnswerDescription = params.description;
        opinion.currentAnswerOwner = creator;
        opinion.questionOwner = creator;
        opinion.ipfsHash = params.ipfsHash;
        opinion.link = params.link;
        opinion.nextPrice = params.initialPrice;
        opinion.lastPrice = 0;
        opinion.totalVolume = 0;
        opinion.isActive = true;
        opinion.categories = params.categories;

        // Emit events
        emit OpinionAction(opinionId, 0, params.question, creator, params.initialPrice);
        emit OpinionAction(opinionId, 1, params.answer, creator, params.initialPrice);
    }
}
