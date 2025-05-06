// structs/OpinionStructs.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library OpinionStructs {
    struct Opinion {
        uint96 lastPrice;
        uint96 nextPrice;
        uint96 totalVolume;
        uint96 salePrice;
        address creator;
        address questionOwner;
        address currentAnswerOwner;
        bool isActive;
        string question;
        string currentAnswer;
        string ipfsHash;
        string link;
    }

    struct AnswerHistory {
        string answer;
        address owner;
        uint96 price;
        uint32 timestamp;
    }

    struct TradeParams {
        uint256 opinionId;
        uint96 price;
        string answer;
        address trader;
        uint32 timestamp;
    }

    struct FeeDistribution {
        uint96 platformFee;
        uint96 creatorFee;
        uint96 ownerAmount;
    }
}
