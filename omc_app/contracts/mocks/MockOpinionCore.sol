// contracts/mocks/MockOpinionCore.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockOpinionCore {
    // Define structs directly in the contract
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

    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => AnswerHistory[]) public answerHistory;
    uint256 public nextOpinionId = 1;

    // Events for testing
    event OpinionCreated(
        uint256 indexed opinionId,
        string question,
        string initialAnswer,
        address creator
    );
    event OpinionAnswered(
        uint256 indexed opinionId,
        string answer,
        address indexed owner
    );
    event OpinionStatusChanged(uint256 indexed opinionId, bool isActive);

    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external {
        uint256 opinionId = nextOpinionId++;

        opinions[opinionId] = Opinion({
            lastPrice: uint96(10 * 10 ** 6), // 10 USDC
            nextPrice: uint96(12 * 10 ** 6), // 12 USDC
            totalVolume: uint96(10 * 10 ** 6),
            salePrice: 0, // Not for sale initially
            creator: msg.sender,
            questionOwner: msg.sender,
            currentAnswerOwner: msg.sender,
            isActive: true,
            question: question,
            currentAnswer: initialAnswer,
            ipfsHash: "",
            link: ""
        });

        // Create initial answer history
        answerHistory[opinionId].push(
            AnswerHistory({
                answer: initialAnswer,
                owner: msg.sender,
                price: uint96(10 * 10 ** 6),
                timestamp: uint32(block.timestamp)
            })
        );

        emit OpinionCreated(opinionId, question, initialAnswer, msg.sender);
    }

    // Additional methods...

    function deactivateOpinion(uint256 opinionId) external {
        require(opinions[opinionId].creator != address(0), "Opinion not found");
        opinions[opinionId].isActive = false;
        emit OpinionStatusChanged(opinionId, false);
    }

    function getOpinionDetails(
        uint256 opinionId
    ) external view returns (Opinion memory) {
        return opinions[opinionId];
    }
}
