// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionMarket.sol";

contract OpinionMarketV2 is OpinionMarket {
    // Storage gap for future upgrades
    uint256[50] private __gap;

    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external override nonReentrant whenNotPaused {
        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();
        if (opinion.isFinal) revert OpinionIsFinal();

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        uint256 price = _calculateNextPrice(opinion.currentPrice);

        // Calculate fees
        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (price * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Process payment and distribute fees
        if (!usdcToken.transferFrom(msg.sender, address(this), price)) {
            revert TransferFailed();
        }

        // Send fees
        if (!usdcToken.transfer(owner(), platformFee)) revert TransferFailed();
        if (!usdcToken.transfer(opinion.creator, creatorFee))
            revert TransferFailed();

        // Send remaining amount to current owner if exists
        if (opinion.currentAnswerOwner != address(0)) {
            if (!usdcToken.transfer(opinion.currentAnswerOwner, ownerAmount))
                revert TransferFailed();
        }

        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            opinion.currentAnswerOwner
        );

        // Update answer history
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: answer,
                owner: msg.sender,
                price: price,
                timestamp: block.timestamp
            })
        );

        // Update opinion state
        opinion.currentAnswer = answer;
        opinion.currentAnswerOwner = msg.sender;
        opinion.currentPrice = price;
        opinion.totalVolume += price;

        emit AnswerSubmitted(opinionId, answer, msg.sender, price);
    }
}
