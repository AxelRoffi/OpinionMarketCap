// interfaces/IOpinionCore.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../structs/OpinionStructs.sol";

interface IOpinionCore {
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external;

    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external;

    function submitAnswer(
        uint256 opinionId, 
        string calldata answer,
        string calldata description,
        string calldata link
    ) external;

    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (OpinionStructs.AnswerHistory[] memory);

    function getNextPrice(uint256 opinionId) external view returns (uint256);

    function deactivateOpinion(uint256 opinionId) external;

    function reactivateOpinion(uint256 opinionId) external;

    function moderateAnswer(uint256 opinionId, string calldata reason) external;

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
        string calldata description,
        uint256 price
    ) external;

    // Categories management
    function addCategoryToCategories(string calldata newCategory) external;
    function getAvailableCategories() external view returns (string[] memory);
    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory);
    function getCategoryCount() external view returns (uint256);

    // --- EXTENSION SLOTS INTERFACE - IMPOSED SIGNATURES ---
    function setOpinionStringExtension(
        uint256 opinionId, 
        string calldata key, 
        string calldata value
    ) external;

    function setOpinionNumberExtension(
        uint256 opinionId, 
        string calldata key, 
        uint256 value
    ) external;

    function setOpinionBoolExtension(
        uint256 opinionId, 
        string calldata key, 
        bool value
    ) external;

    function setOpinionAddressExtension(
        uint256 opinionId, 
        string calldata key, 
        address value
    ) external;

    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    );

    // Optional helper functions
    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory);
    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256);
    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool);
    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address);
    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool);
    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256);
}
