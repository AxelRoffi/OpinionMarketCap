// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionMarket.sol";
import {OpinionMarketErrors} from "./OpinionMarketErrors.sol";

contract OpinionMarketV2 is OpinionMarket {
    // Storage gap for future upgrades
    uint256[50] private __gap;
    using SafeERC20 for IERC20;

    // Keep the existing implementation but update it for compatibility
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external override nonReentrant whenNotPaused {
        _checkAndUpdateTradesInBlock();
        _checkTradeAllowed(opinionId);

        Opinion storage opinion = opinions[opinionId];
        if (!opinion.isActive)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.OPINION_NOT_ACTIVE
            );
        if (opinion.currentAnswerOwner == msg.sender)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.SAME_OWNER);

        bytes memory answerBytes = bytes(answer);
        if (answerBytes.length == 0)
            revert OpinionMarketErrors.ERR(OpinionMarketErrors.EMPTY_STRING);
        if (answerBytes.length > MAX_ANSWER_LENGTH)
            revert OpinionMarketErrors.ERR(
                OpinionMarketErrors.INVALID_ANSWER_LENGTH
            );

        // Use the stored next price instead of calculating it on the fly
        uint256 price = opinion.nextPrice;

        // If nextPrice is 0 (for older opinions before this update),
        // calculate it using the current price
        if (price == 0) {
            price = _calculateNextPrice(opinion.lastPrice);
        }

        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price)
            revert OpinionMarketErrors.ERR_DATA(
                OpinionMarketErrors.INSUFFICIENT_ALLOWANCE,
                price,
                allowance
            );

        // Calculate standard fees
        (uint256 platformFee, uint256 creatorFee) = CalculationLibrary
            .calculateFees(price, platformFeePercent, creatorFeePercent);
        uint256 ownerAmount = price - platformFee - creatorFee;

        // Apply MEV penalty for rapid trading within window
        uint256 lastTradeTime = userLastTradeTime[msg.sender][opinionId];

        if (
            lastTradeTime > 0 &&
            block.timestamp - lastTradeTime < rapidTradeWindow
        ) {
            // Calculate potential profit & redirect to platform
            uint256 lastTradePrice = userLastTradePrice[msg.sender][opinionId];

            if (lastTradePrice > 0 && ownerAmount > lastTradePrice) {
                uint256 potentialProfit = ownerAmount - lastTradePrice;
                platformFee += potentialProfit;
                ownerAmount -= potentialProfit;
            } else {
                // If no profit, still apply a higher fee to discourage MEV
                uint256 mevPenalty = (price * 20) / 100; // 20% penalty
                if (mevPenalty > ownerAmount) {
                    mevPenalty = ownerAmount / 2; // Ensure some payment to previous owner
                }
                platformFee += mevPenalty;
                ownerAmount -= mevPenalty;
            }
        }

        // Update last trade info for future checks
        userLastTradeTime[msg.sender][opinionId] = block.timestamp;
        userLastTradePrice[msg.sender][opinionId] = ownerAmount;

        address creator = opinion.creator;
        address currentAnswerOwner = opinion.currentAnswerOwner;

        // Always accumulate fees - regardless of whether it's the same owner
        accumulatedFees[creator] += creatorFee;
        accumulatedFees[currentAnswerOwner] += ownerAmount;
        totalAccumulatedFees += creatorFee + ownerAmount;

        // Record answer history
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
        opinion.currentAnswerOwner = msg.sender; // Always update owner, even if it's the same person
        opinion.lastPrice = price;
        opinion.totalVolume += price;

        // Calculate and store the next price for future answers
        opinion.nextPrice = _calculateNextPrice(price);

        // Token transfers
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        usdcToken.safeTransfer(owner(), platformFee);

        emit FeesAccumulated(creator, creatorFee);
        emit FeesAccumulated(currentAnswerOwner, ownerAmount);
        emit FeesDistributed(
            opinionId,
            platformFee,
            creatorFee,
            ownerAmount,
            currentAnswerOwner
        );
        emit AnswerSubmitted(opinionId, answer, msg.sender, price);
    }
}
