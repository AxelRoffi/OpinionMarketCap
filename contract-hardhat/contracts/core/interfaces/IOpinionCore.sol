// interfaces/IOpinionCore.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../structs/OpinionStructs.sol";

interface IOpinionCore {
    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external;

    function createOpinionWithExtras(
        string calldata question,
        string calldata initialAnswer,
        string calldata ipfsHash,
        string calldata link
    ) external;

    function submitAnswer(uint256 opinionId, string calldata answer) external;

    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (OpinionStructs.AnswerHistory[] memory);

    function getNextPrice(uint256 opinionId) external view returns (uint256);

    function deactivateOpinion(uint256 opinionId) external;

    function reactivateOpinion(uint256 opinionId) external;

    function listQuestionForSale(uint256 opinionId, uint256 price) external;

    function buyQuestion(uint256 opinionId) external;

    function cancelQuestionSale(uint256 opinionId) external;

    function getOpinionDetails(
        uint256 opinionId
    ) external view returns (OpinionStructs.Opinion memory);

    function getTradeCount(uint256 opinionId) external view returns (uint256);

    function getCreatorGain(uint256 opinionId) external view returns (uint256);

    function isPoolOwned(uint256 opinionId) external view returns (bool);

    function updateOpinionOnPoolExecution(
        uint256 opinionId,
        string calldata answer,
        uint256 price
    ) external;
}
