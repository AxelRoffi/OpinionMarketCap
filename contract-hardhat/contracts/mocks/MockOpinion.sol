// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockOpinion {
    struct Opinion {
        string question;
        string currentAnswer;
        address creator;
        address questionOwner;
        bool isActive;
        uint256 salePrice;
    }

    mapping(uint256 => Opinion) public opinions;

    // Events
    event QuestionListed(
        uint256 indexed opinionId,
        address indexed seller,
        uint256 price
    );
    event QuestionPurchased(
        uint256 indexed opinionId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event QuestionSaleCancelled(
        uint256 indexed opinionId,
        address indexed seller
    );

    // Setup a test opinion
    function setupTestOpinion(
        uint256 id,
        string memory question,
        string memory answer,
        address creator,
        address owner,
        bool isActive
    ) external {
        opinions[id] = Opinion({
            question: question,
            currentAnswer: answer,
            creator: creator,
            questionOwner: owner,
            isActive: isActive,
            salePrice: 0
        });
    }

    // List a question for sale
    function listQuestionForSale(uint256 opinionId, uint256 price) external {
        Opinion storage opinion = opinions[opinionId];
        require(opinion.creator != address(0), "Opinion does not exist");
        require(opinion.isActive, "Opinion is not active");
        require(opinion.questionOwner == msg.sender, "Not the owner");

        opinion.salePrice = price;

        emit QuestionListed(opinionId, msg.sender, price);
    }

    // Buy a question
    function buyQuestion(uint256 opinionId, address tokenAddress) external {
        Opinion storage opinion = opinions[opinionId];
        require(opinion.creator != address(0), "Opinion does not exist");
        require(opinion.isActive, "Opinion is not active");
        require(opinion.salePrice > 0, "Not for sale");

        uint256 price = opinion.salePrice;
        address seller = opinion.questionOwner;

        // Calculate fees (90% to seller, 10% to platform)
        uint256 sellerAmount = (price * 90) / 100;
        uint256 platformFee = price - sellerAmount;

        // Update ownership and reset sale price
        opinion.questionOwner = msg.sender;
        opinion.salePrice = 0;

        // Handle token transfers
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, seller, sellerAmount);
        token.transferFrom(msg.sender, address(this), platformFee); // Platform fee goes to contract

        emit QuestionPurchased(opinionId, seller, msg.sender, price);
    }

    // Cancel a question sale
    function cancelQuestionSale(uint256 opinionId) external {
        Opinion storage opinion = opinions[opinionId];
        require(opinion.creator != address(0), "Opinion does not exist");
        require(opinion.questionOwner == msg.sender, "Not the owner");

        opinion.salePrice = 0;

        emit QuestionSaleCancelled(opinionId, msg.sender);
    }

    // Get opinion details
    function getOpinion(
        uint256 opinionId
    ) external view returns (Opinion memory) {
        return opinions[opinionId];
    }
}
