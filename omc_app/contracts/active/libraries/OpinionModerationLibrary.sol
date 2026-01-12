// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../interfaces/IOpinionMarketErrors.sol";
import "../structs/OpinionStructs.sol";

/**
 * @title OpinionModerationLibrary
 * @dev Library for content moderation, rate limiting, and security functions
 */
library OpinionModerationLibrary {

    /**
     * @dev Moderates an inappropriate answer by reverting to initial answer
     * @param opinion Storage reference to the opinion
     * @param answerHistory Storage reference to answer history
     * @param opinionId The ID of the opinion
     * @param reason The reason for moderation
     * @param moderator Address of the moderator
     * @param nextPrice Current next price for the opinion
     * @return previousOwner Address of the answer owner being moderated
     */
    function moderateAnswer(
        OpinionStructs.Opinion storage opinion,
        OpinionStructs.AnswerHistory[] storage answerHistory,
        uint256 opinionId,
        string calldata reason,
        address moderator,
        uint96 nextPrice
    ) internal returns (address previousOwner) {
        if (!opinion.isActive) revert IOpinionMarketErrors.OpinionNotActive();
        
        // Can't moderate if creator is still the current owner (no inappropriate answer)
        if (opinion.currentAnswerOwner == opinion.creator) {
            revert("No answer to moderate");
        }

        previousOwner = opinion.currentAnswerOwner;
        
        // Get initial answer from first entry in history
        require(answerHistory.length > 0, "No initial answer found");
        
        string memory initialAnswer = answerHistory[0].answer;
        string memory initialDescription = answerHistory[0].description;
        
        // Record moderation in history before reverting
        answerHistory.push(OpinionStructs.AnswerHistory({
            answer: "[MODERATED]",
            description: reason,
            owner: previousOwner,
            price: nextPrice,
            timestamp: uint32(block.timestamp)
        }));
        
        // Revert to initial answer and creator ownership
        opinion.currentAnswer = initialAnswer;
        opinion.currentAnswerDescription = initialDescription;
        opinion.currentAnswerOwner = opinion.creator;
        // Keep current price (fair for next trader)
        
        // Events will be emitted by calling contract
    }

    /**
     * @dev Checks and updates the number of trades per block per user
     * @param userLastBlock Storage mapping for user's last block
     * @param userTradesInBlock Storage mapping for trades in current block
     * @param maxTradesPerBlock Maximum trades allowed per block (0 = disabled)
     * @param user User address
     */
    function checkAndUpdateTradesInBlock(
        mapping(address => uint256) storage userLastBlock,
        mapping(address => uint256) storage userTradesInBlock,
        uint256 maxTradesPerBlock,
        address user
    ) internal {
        // Skip rate limiting if maxTradesPerBlock is set to 0
        if (maxTradesPerBlock == 0) {
            return;
        }
        
        if (userLastBlock[user] != block.number) {
            userTradesInBlock[user] = 1;
            userLastBlock[user] = block.number;
        } else {
            userTradesInBlock[user]++;
            if (userTradesInBlock[user] > maxTradesPerBlock) {
                revert IOpinionMarketErrors.MaxTradesPerBlockExceeded(
                    userTradesInBlock[user],
                    maxTradesPerBlock
                );
            }
        }
    }

    /**
     * @dev Prevents trading the same opinion multiple times in one block
     * @param userLastTradeBlock Storage mapping for user's last trade block per opinion
     * @param user User address
     * @param opinionId The ID of the opinion
     */
    function checkTradeAllowed(
        mapping(address => mapping(uint256 => uint256)) storage userLastTradeBlock,
        address user,
        uint256 opinionId
    ) internal {
        if (userLastTradeBlock[user][opinionId] == block.number)
            revert IOpinionMarketErrors.OneTradePerBlock();
        userLastTradeBlock[user][opinionId] = block.number;
    }

    /**
     * @dev Updates competition tracking for auction dynamics detection
     * @param opinionTraders Storage mapping of traders per opinion
     * @param hasTraded Storage mapping of whether address has traded this opinion
     * @param lastCompetitionReset Storage mapping of last competition reset time
     * @param opinionId The opinion being traded
     * @param trader The current trader address
     */
    function updateCompetitionTracking(
        mapping(uint256 => address[]) storage opinionTraders,
        mapping(uint256 => mapping(address => bool)) storage hasTraded,
        mapping(uint256 => uint256) storage lastCompetitionReset,
        uint256 opinionId,
        address trader
    ) internal {
        // Reset competition data every 24 hours to prevent stale data
        if (block.timestamp - lastCompetitionReset[opinionId] > 86400) {
            resetCompetitionData(opinionTraders, hasTraded, lastCompetitionReset, opinionId);
        }
        
        // Add trader to opinion if not already tracked
        if (!hasTraded[opinionId][trader]) {
            opinionTraders[opinionId].push(trader);
            hasTraded[opinionId][trader] = true;
        }
    }

    /**
     * @dev Checks if there's competitive trading (2+ unique traders) for an opinion
     * @param opinionTraders Storage mapping of traders per opinion
     * @param opinionId The opinion to check
     * @return True if 2 or more unique traders are competing
     */
    function hasCompetitiveTrading(
        mapping(uint256 => address[]) storage opinionTraders,
        uint256 opinionId
    ) internal view returns (bool) {
        return opinionTraders[opinionId].length >= 2;
    }

    /**
     * @dev Resets competition tracking data for an opinion
     * @param opinionTraders Storage mapping of traders per opinion
     * @param hasTraded Storage mapping of whether address has traded this opinion
     * @param lastCompetitionReset Storage mapping of last competition reset time
     * @param opinionId The opinion to reset
     */
    function resetCompetitionData(
        mapping(uint256 => address[]) storage opinionTraders,
        mapping(uint256 => mapping(address => bool)) storage hasTraded,
        mapping(uint256 => uint256) storage lastCompetitionReset,
        uint256 opinionId
    ) internal {
        // Clear the traders array
        address[] storage traders = opinionTraders[opinionId];
        for (uint256 i = 0; i < traders.length; i++) {
            hasTraded[opinionId][traders[i]] = false;
        }
        delete opinionTraders[opinionId];
        lastCompetitionReset[opinionId] = block.timestamp;
    }

    /**
     * @dev Gets competition status for an opinion (view function for monitoring)
     * @param opinionTraders Storage mapping of traders per opinion
     * @param opinionId The opinion to check
     * @return isCompetitive Whether competition is currently active
     * @return traderCount Number of unique traders competing
     * @return traders Array of trader addresses
     */
    function getCompetitionStatus(
        mapping(uint256 => address[]) storage opinionTraders,
        uint256 opinionId
    ) internal view returns (
        bool isCompetitive, 
        uint256 traderCount, 
        address[] memory traders
    ) {
        isCompetitive = hasCompetitiveTrading(opinionTraders, opinionId);
        traderCount = opinionTraders[opinionId].length;
        traders = opinionTraders[opinionId];
    }

    /**
     * @dev Activates an opinion
     * @param opinion Storage reference to the opinion
     * @param opinionId The opinion ID
     * @param moderator Address of the moderator
     */
    function activateOpinion(
        OpinionStructs.Opinion storage opinion,
        uint256 opinionId,
        address moderator
    ) internal {
        if (opinion.isActive) revert IOpinionMarketErrors.OpinionAlreadyActive();
        
        opinion.isActive = true;
        // Event will be emitted by calling contract
    }

    /**
     * @dev Deactivates an opinion
     * @param opinion Storage reference to the opinion
     * @param opinionId The opinion ID
     * @param moderator Address of the moderator
     */
    function deactivateOpinion(
        OpinionStructs.Opinion storage opinion,
        uint256 opinionId,
        address moderator
    ) internal {
        if (!opinion.isActive) revert IOpinionMarketErrors.OpinionNotActive();
        
        opinion.isActive = false;
        // Event will be emitted by calling contract
    }

    /**
     * @dev Validates IPFS hash format
     * @param ipfsHash The IPFS hash to validate
     */
    function validateIpfsHash(string memory ipfsHash) internal pure {
        bytes memory ipfsHashBytes = bytes(ipfsHash);

        // Check that it's either a valid CIDv0 (starts with "Qm" and is 46 chars long)
        // or a valid CIDv1 (starts with "b" and has a proper length)
        bool isValidCIDv0 = ipfsHashBytes.length == 46 &&
            ipfsHashBytes[0] == "Q" &&
            ipfsHashBytes[1] == "m";

        bool isValidCIDv1 = ipfsHashBytes.length >= 48 &&
            ipfsHashBytes[0] == "b";

        if (!isValidCIDv0 && !isValidCIDv1) {
            revert IOpinionMarketErrors.InvalidIpfsHashFormat();
        }
    }
}