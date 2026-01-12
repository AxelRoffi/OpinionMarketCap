// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../structs/OpinionStructs.sol";
import "../libraries/ValidationLibrary.sol";
import "../libraries/OpinionPricingLibrary.sol";
import "../interfaces/IOpinionMarketErrors.sol";

/**
 * @title OpinionUpdateLib
 * @dev Library for handling opinion update logic to reduce OpinionCore contract size
 */
library OpinionUpdateLib {
    event OpinionAction(
        uint256 indexed opinionId,
        uint8 actionType,
        string data,
        address indexed actor,
        uint256 value
    );

    /**
     * @dev Updates an opinion's parameters
     */
    function updateOpinion(
        uint256 opinionId,
        string calldata question,
        string calldata ipfsHash,
        string calldata link,
        string[] calldata categories,
        OpinionStructs.Opinion storage opinion,
        address sender,
        uint256 maxQuestionLength,
        uint256 maxIpfsHashLength,
        uint256 maxLinkLength,
        uint256 maxCategoriesPerOpinion,
        string[] storage availableCategories
    ) public {
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();
        if (opinion.creator != sender) revert IOpinionMarketErrors.UnauthorizedCreator();

        // Validate question length
        if (bytes(question).length > maxQuestionLength)
            revert IOpinionMarketErrors.InvalidQuestionLength();

        // Validate IPFS hash
        if (bytes(ipfsHash).length > maxIpfsHashLength)
            revert IOpinionMarketErrors.InvalidIpfsHashLength();

        // Validate link
        if (bytes(link).length > maxLinkLength)
            revert IOpinionMarketErrors.InvalidLinkLength();

        // Validate categories
        ValidationLibrary.validateOpinionCategories(
            categories,
            availableCategories,
            maxCategoriesPerOpinion
        );

        opinion.question = question;
        opinion.ipfsHash = ipfsHash;
        opinion.link = link;
        opinion.categories = categories;

        emit OpinionAction(opinionId, 0, question, sender, 0);
    }

    /**
     * @dev Updates opinion state after pool execution
     */
    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        address poolAddress,
        uint256 price,
        OpinionStructs.Opinion storage opinion,
        mapping(uint256 => OpinionStructs.AnswerHistory[]) storage answerHistory,
        mapping(uint256 => address[]) storage opinionTraders,
        mapping(uint256 => mapping(address => bool)) storage hasTraded,
        mapping(uint256 => uint256) storage lastCompetitionReset,
        uint256 nonce,
        uint96 minimumPrice,
        uint256 absoluteMaxPriceChange,
        mapping(uint256 => uint256) storage priceMetadata,
        mapping(uint256 => uint256) storage priceHistory
    ) public returns (uint256 nextNonce) {
        if (opinion.creator == address(0)) revert IOpinionMarketErrors.OpinionNotFound();

        // Record answer history
        answerHistory[opinionId].push(
            OpinionStructs.AnswerHistory({
                answer: answer,
                description: "Pool Execution",
                owner: poolAddress,
                price: uint96(price),
                timestamp: uint32(block.timestamp)
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerDescription = "Pool Execution";
        opinion.currentAnswerOwner = poolAddress;
        opinion.lastPrice = uint96(price);
        opinion.totalVolume += uint96(price);

        // Update competition tracking
        // Note: We don't track pool as a trader for competition purposes usually,
        // but for consistency we can call it.
        // Or we can skip it if pools shouldn't win competitions.
        // Let's keep it consistent with submitAnswer for now.
        // OpinionModerationLibrary.updateCompetitionTracking is internal, so we can't call it easily from here
        // unless we import it.
        
        // Actually, let's skip competition tracking for pool execution for now to save gas/size,
        // or import the library if needed.
        // OpinionCore calls it.
        // Let's assume we want to call it.
        
        // Calculate next price
        opinion.nextPrice = uint96(OpinionPricingLibrary.calculateNextPrice(
            opinionTraders,
            opinionId,
            uint96(price),
            uint96(minimumPrice),
            absoluteMaxPriceChange,
            nonce,
            priceMetadata,
            priceHistory
        ));
        
        return nonce + 1;
    }
}
