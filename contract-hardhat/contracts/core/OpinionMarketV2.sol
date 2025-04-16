// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionMarket.sol";

contract OpinionMarketV2 is OpinionMarket {
    // Storage gap for future upgrades
    uint256[50] private __gap;

    // Keep the existing implementation but update it for compatibility
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external override nonReentrant whenNotPaused {
        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive) revert OpinionNotActive();

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0) revert EmptyString();
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert InvalidAnswerLength();

        uint256 price = _calculateNextPrice(opinion.lastPrice);

        // Calculate fees
        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (price * CREATOR_FEE_PERCENT) / 100;
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Process payment and distribute fees using regular ERC20 methods
        if (!usdcToken.transferFrom(msg.sender, address(this), price)) {
            revert TransferFailed();
        }

        // Send fees
        if (!usdcToken.transfer(owner(), platformFee)) revert TransferFailed();

        // Update for compatibility with the new fee accumulation system
        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;

        // Instead of direct transfer, accumulate fees
        accumulatedFees[creator] += creatorFee;
        if (currentAnswerOwner != address(0)) {
            accumulatedFees[currentAnswerOwner] += ownerAmount;
        }
        totalAccumulatedFees += creatorFee + ownerAmount;

        emit FeesAccumulated(creator, creatorFee);
        if (currentAnswerOwner != address(0)) {
            emit FeesAccumulated(currentAnswerOwner, ownerAmount);
        }

        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentAnswerOwner
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
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Add for compatibility with the Pool feature
        opinion.nextPrice = _calculateNextPrice(price);

        emit AnswerSubmitted(opinionId, answer, msg.sender, price);
    }
}
