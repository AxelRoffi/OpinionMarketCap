// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../structs/OpinionStructs.sol";
import "../libraries/ValidationLibrary.sol";
import "../libraries/OpinionPricingLibrary.sol";
import "../libraries/OpinionModerationLibrary.sol";
import "../interfaces/IFeeManager.sol";
import "../interfaces/IPoolManager.sol";
import "../interfaces/IOpinionMarketEvents.sol";
import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionTradingLib
 * @dev Library for handling opinion trading logic to reduce OpinionCore contract size
 */
library OpinionTradingLib {
    using SafeERC20 for IERC20;

    // Events to match OpinionCore
    event FeesAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed user,
        uint256 amount,
        uint256 platformFee,
        uint256 creatorFee,
        uint256 ownerAmount
    );

    event OpinionAction(
        uint256 indexed opinionId,
        uint8 actionType,
        string data,
        address indexed actor,
        uint256 value
    );

    event QuestionSaleAction(
        uint256 indexed opinionId,
        uint8 actionType,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );

    struct TradingContext {
        address sender;
        IERC20 usdcToken;
        IFeeManager feeManager;
        IPoolManager poolManager;
        address treasury;
        uint96 minimumPrice;
        uint256 absoluteMaxPriceChange;
        uint256 maxAnswerLength;
        uint256 maxDescriptionLength;
        uint256 maxLinkLength;
        uint256 maxTradesPerBlock;
    }

    struct AnswerParams {
        uint256 opinionId;
        string answer;
        string description;
        string link;
    }

    /**
     * @dev Handles submitting a new answer
     */
    function submitAnswer(
        AnswerParams memory params,
        TradingContext memory ctx,
        OpinionStructs.Opinion storage opinion,
        mapping(uint256 => OpinionStructs.AnswerHistory[]) storage answerHistory,
        mapping(address => uint256) storage userLastBlock,
        mapping(address => uint256) storage userTradesInBlock,
        mapping(address => mapping(uint256 => uint256)) storage userLastTradeBlock,
        mapping(uint256 => address[]) storage opinionTraders,
        mapping(uint256 => mapping(address => bool)) storage hasTraded,
        mapping(uint256 => uint256) storage lastCompetitionReset,
        uint256 nonce,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) public returns (uint256 nextNonce) {
        // 1. Rate limiting checks
        OpinionModerationLibrary.checkAndUpdateTradesInBlock(
            userLastBlock,
            userTradesInBlock,
            ctx.maxTradesPerBlock,
            ctx.sender
        );
        OpinionModerationLibrary.checkTradeAllowed(
            userLastTradeBlock,
            ctx.sender,
            params.opinionId
        );

        // 2. Opinion state checks
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();
        if (!opinion.isActive) revert IOpinionMarketErrors.OpinionNotActive();
        if (opinion.currentAnswerOwner == ctx.sender) revert IOpinionMarketErrors.SameOwner();

        // 3. Validation
        if (bytes(params.answer).length < 2) revert("Minimum 2 characters required");
        if (bytes(params.answer).length > ctx.maxAnswerLength)
            revert IOpinionMarketErrors.InvalidAnswerLength();
        
        ValidationLibrary.validateDescription(params.description, ctx.maxDescriptionLength);
        
        if (bytes(params.link).length > ctx.maxLinkLength) 
            revert IOpinionMarketErrors.InvalidLinkLength();

        // 4. Price calculation
        uint96 price = uint96(OpinionPricingLibrary.getEffectiveNextPrice(
            opinion.nextPrice,
            opinion.lastPrice,
            ctx.minimumPrice
        ));

        // 5. Allowance check
        uint256 allowance = ctx.usdcToken.allowance(ctx.sender, address(this));
        if (allowance < price) revert IOpinionMarketErrors.InsufficientAllowance(price, allowance);

        // 6. Fee calculation
        (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount) = ctx.feeManager
            .calculateFeeDistribution(price);

        // MEV Penalty check
        (platformFee, ownerAmount) = ctx.feeManager.applyMEVPenalty(
            price,
            ownerAmount,
            ctx.sender,
            params.opinionId
        );

        // 7. Fee Distribution
        address creator = opinion.questionOwner;
        address currentAnswerOwner = opinion.currentAnswerOwner;
        bool answerIsPoolOwned = currentAnswerOwner == address(ctx.poolManager);

        // Transfer platform fee to treasury
        ctx.usdcToken.safeTransferFrom(ctx.sender, ctx.treasury, platformFee);

        // Transfer user fees to FeeManager
        uint96 totalUserFees = creatorFee;
        if (!answerIsPoolOwned) {
            totalUserFees += ownerAmount;
        }
        if (totalUserFees > 0) {
            ctx.usdcToken.safeTransferFrom(ctx.sender, address(ctx.feeManager), totalUserFees);
        }

        // Accumulate fees
        ctx.feeManager.accumulateFee(creator, creatorFee);

        if (answerIsPoolOwned) {
            ctx.poolManager.distributePoolRewards(params.opinionId, price, ctx.sender);
        } else {
            ctx.feeManager.accumulateFee(currentAnswerOwner, ownerAmount);
        }

        // 8. Update State
        answerHistory[params.opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: params.answer,
                description: params.description,
                owner: ctx.sender,
                price: price,
                timestamp: uint32(block.timestamp)
            })
        );

        opinion.currentAnswer = params.answer;
        opinion.currentAnswerDescription = params.description;
        opinion.currentAnswerOwner = ctx.sender;
        opinion.link = params.link;
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Update competition tracking
        OpinionModerationLibrary.updateCompetitionTracking(
            opinionTraders,
            hasTraded,
            lastCompetitionReset,
            params.opinionId,
            ctx.sender
        );

        // Calculate next price
        opinion.nextPrice = uint96(OpinionPricingLibrary.calculateNextPrice(
            opinionTraders,
            params.opinionId,
            price,
            ctx.minimumPrice,
            ctx.absoluteMaxPriceChange,
            nonce,
            priceMetadata,
            priceHistory
        ));
        nextNonce = nonce + 1;

        emit FeesAction(
            params.opinionId,
            0,
            currentAnswerOwner,
            price,
            platformFee,
            creatorFee,
            ownerAmount
        );
        
        emit OpinionAction(params.opinionId, 1, params.answer, ctx.sender, price);
        
        return nextNonce;
    }

    /**
     * @dev Handles buying a question
     */
    function buyQuestion(
        uint256 opinionId,
        TradingContext memory ctx,
        OpinionStructs.Opinion storage opinion
    ) public {
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();

        uint96 salePrice = opinion.salePrice;
        if (salePrice == 0) revert IOpinionMarketErrors.NotForSale(opinionId);

        uint256 allowance = ctx.usdcToken.allowance(ctx.sender, address(this));
        if (allowance < salePrice)
            revert IOpinionMarketErrors.InsufficientAllowance(salePrice, allowance);

        address currentOwner = opinion.questionOwner;

        // Calculate fees (90% seller, 10% platform)
        uint96 platformFee = uint96((salePrice * 10) / 100);
        uint96 sellerAmount = salePrice - platformFee;

        // Update ownership
        opinion.questionOwner = ctx.sender;
        opinion.salePrice = 0;

        // Transfers
        ctx.usdcToken.safeTransferFrom(ctx.sender, ctx.treasury, platformFee);
        ctx.usdcToken.safeTransferFrom(ctx.sender, address(ctx.feeManager), sellerAmount);

        // Accumulate fees
        ctx.feeManager.accumulateFee(currentOwner, sellerAmount);

        emit QuestionSaleAction(
            opinionId,
            1,
            currentOwner,
            ctx.sender,
            salePrice
        );
    }

    /**
     * @dev Places a question for sale
     */
    function listQuestionForSale(
        uint256 opinionId,
        uint256 price,
        address sender,
        OpinionStructs.Opinion storage opinion
    ) public {
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();

        if (opinion.questionOwner != sender)
            revert IOpinionMarketErrors.NotTheOwner(sender, opinion.questionOwner);

        opinion.salePrice = uint96(price);
        emit QuestionSaleAction(opinionId, 0, sender, address(0), price);
    }

    /**
     * @dev Cancels a question sale
     */
    function cancelQuestionSale(
        uint256 opinionId,
        address sender,
        OpinionStructs.Opinion storage opinion
    ) public {
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();

        if (opinion.questionOwner != sender)
            revert IOpinionMarketErrors.NotTheOwner(sender, opinion.questionOwner);

        opinion.salePrice = 0;
        emit QuestionSaleAction(opinionId, 2, sender, address(0), 0);
    }
}
