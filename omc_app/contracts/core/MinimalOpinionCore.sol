// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MinimalOpinionCore
 * @dev Ultra-minimal version focused on core functionality only
 * Designed to be under 20KB for guaranteed mainnet deployment
 */
contract MinimalOpinionCore is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Core state
    IERC20 public immutable usdcToken;
    address public immutable feeManager;
    address public treasury;
    
    uint256 public nextOpinionId = 1;
    uint256 public constant CREATION_FEE = 1_000_000; // 1 USDC
    uint256 public constant MIN_ANSWER_PRICE = 1_000_000; // 1 USDC
    
    // Simple opinion structure
    struct Opinion {
        string question;
        string currentAnswer;
        address creator;
        address currentOwner;
        uint256 nextPrice;
        uint256 totalVolume;
        bool isActive;
    }
    
    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => uint256) public answerCount;
    
    // Events
    event OpinionCreated(uint256 indexed id, address indexed creator, string question);
    event AnswerSubmitted(uint256 indexed id, address indexed submitter, string answer, uint256 price);
    event FeesCollected(uint256 amount, address to);

    constructor(
        address _usdcToken,
        address _feeManager,
        address _treasury
    ) {
        require(_usdcToken != address(0), "Invalid USDC");
        require(_feeManager != address(0), "Invalid FeeManager");
        require(_treasury != address(0), "Invalid Treasury");
        
        usdcToken = IERC20(_usdcToken);
        feeManager = _feeManager;
        treasury = _treasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new opinion - SIMPLIFIED
     */
    function createOpinion(
        string calldata question,
        string calldata answer
    ) external nonReentrant returns (uint256) {
        require(bytes(question).length > 0 && bytes(question).length <= 100, "Invalid question");
        require(bytes(answer).length > 0 && bytes(answer).length <= 100, "Invalid answer");
        
        // Collect creation fee
        usdcToken.safeTransferFrom(msg.sender, treasury, CREATION_FEE);
        
        uint256 opinionId = nextOpinionId++;
        
        opinions[opinionId] = Opinion({
            question: question,
            currentAnswer: answer,
            creator: msg.sender,
            currentOwner: msg.sender,
            nextPrice: MIN_ANSWER_PRICE,
            totalVolume: 0,
            isActive: true
        });
        
        emit OpinionCreated(opinionId, msg.sender, question);
        return opinionId;
    }

    /**
     * @dev Submit new answer - SIMPLIFIED pricing
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external nonReentrant {
        Opinion storage opinion = opinions[opinionId];
        require(opinion.isActive, "Not active");
        require(bytes(answer).length > 0 && bytes(answer).length <= 100, "Invalid answer");
        
        uint256 price = opinion.nextPrice;
        require(price >= MIN_ANSWER_PRICE, "Price too low");
        
        // Transfer payment to previous owner
        address previousOwner = opinion.currentOwner;
        usdcToken.safeTransferFrom(msg.sender, previousOwner, price);
        
        // Update opinion
        opinion.currentAnswer = answer;
        opinion.currentOwner = msg.sender;
        opinion.totalVolume += price;
        
        // Simple price increase: +50% each time
        opinion.nextPrice = (price * 150) / 100;
        
        // Track answer count
        answerCount[opinionId]++;
        
        emit AnswerSubmitted(opinionId, msg.sender, answer, price);
    }

    /**
     * @dev Get opinion details
     */
    function getOpinion(uint256 opinionId) external view returns (
        string memory question,
        string memory currentAnswer,
        address creator,
        address currentOwner,
        uint256 nextPrice,
        uint256 totalVolume,
        bool isActive
    ) {
        Opinion memory opinion = opinions[opinionId];
        return (
            opinion.question,
            opinion.currentAnswer,
            opinion.creator,
            opinion.currentOwner,
            opinion.nextPrice,
            opinion.totalVolume,
            opinion.isActive
        );
    }

    /**
     * @dev Deactivate opinion (admin only)
     */
    function deactivateOpinion(uint256 opinionId) external onlyRole(ADMIN_ROLE) {
        opinions[opinionId].isActive = false;
    }

    /**
     * @dev Grant admin role
     */
    function grantAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = usdcToken.balanceOf(address(this));
        if (balance > 0) {
            usdcToken.safeTransfer(treasury, balance);
            emit FeesCollected(balance, treasury);
        }
    }
}