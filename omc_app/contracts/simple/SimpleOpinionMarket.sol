// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleOpinionMarket is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IERC20 public usdcToken;
    address public treasury;
    uint256 public nextOpinionId;
    uint256 public nextPoolId;
    
    struct Opinion {
        address creator;
        address currentOwner;
        string question;
        string currentAnswer;
        uint96 lastPrice;
        uint96 nextPrice;
        bool isActive;
        uint96 salePrice;
    }
    
    struct Pool {
        uint256 opinionId;
        address creator;
        string proposedAnswer;
        uint256 deadline;
        uint96 totalContributed;
        uint96 targetAmount;
        bool executed;
        bool expired;
    }
    
    mapping(uint256 => Opinion) public opinions;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => uint96)) public poolContributions;
    mapping(address => uint96) public accumulatedFees;

    event OpinionCreated(uint256 indexed opinionId, address creator, string question, uint96 price);
    event AnswerSubmitted(uint256 indexed opinionId, address submitter, string answer, uint96 price);
    event PoolCreated(uint256 indexed poolId, uint256 opinionId, string proposedAnswer);
    event PoolContribution(uint256 indexed poolId, address contributor, uint96 amount);

    function initialize(address _usdcToken, address _treasury) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
        nextOpinionId = 1;
        nextPoolId = 1;
    }

    function _authorizeUpgrade(address) internal override onlyRole(ADMIN_ROLE) {}

    // Create opinion - costs initial price
    function createOpinion(
        string calldata question,
        string calldata answer,
        uint96 initialPrice
    ) external nonReentrant whenNotPaused {
        require(bytes(question).length > 0 && bytes(question).length <= 100, "Invalid question");
        require(bytes(answer).length > 0 && bytes(answer).length <= 100, "Invalid answer");
        require(initialPrice >= 2e6 && initialPrice <= 100e6, "Price must be 2-100 USDC");
        
        uint256 opinionId = nextOpinionId++;
        
        opinions[opinionId] = Opinion({
            creator: msg.sender,
            currentOwner: msg.sender,
            question: question,
            currentAnswer: answer,
            lastPrice: initialPrice,
            nextPrice: _calculateNextPrice(initialPrice),
            isActive: true,
            salePrice: 0
        });
        
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);
        
        emit OpinionCreated(opinionId, msg.sender, question, initialPrice);
    }

    // Submit new answer - costs next price
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external nonReentrant whenNotPaused {
        Opinion storage opinion = opinions[opinionId];
        require(opinion.isActive, "Opinion not active");
        require(opinion.currentOwner != msg.sender, "Already own this opinion");
        require(bytes(answer).length > 0 && bytes(answer).length <= 100, "Invalid answer");
        
        uint96 price = opinion.nextPrice;
        
        // Calculate fees: 5% platform, 5% to creator, 90% to current owner
        uint96 platformFee = price * 5 / 100;
        uint96 creatorFee = price * 5 / 100;
        uint96 ownerAmount = price - platformFee - creatorFee;
        
        // Transfer payment
        usdcToken.safeTransferFrom(msg.sender, address(this), price);
        
        // Distribute fees
        accumulatedFees[opinion.creator] += creatorFee;
        accumulatedFees[opinion.currentOwner] += ownerAmount;
        usdcToken.safeTransfer(treasury, platformFee);
        
        // Update opinion
        opinion.currentOwner = msg.sender;
        opinion.currentAnswer = answer;
        opinion.lastPrice = price;
        opinion.nextPrice = _calculateNextPrice(price);
        
        emit AnswerSubmitted(opinionId, msg.sender, answer, price);
    }

    // Create pool for collective funding
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint96 initialContribution
    ) external nonReentrant whenNotPaused {
        require(opinions[opinionId].isActive, "Opinion not active");
        require(deadline > block.timestamp, "Invalid deadline");
        require(initialContribution > 0, "Must contribute");
        
        uint256 poolId = nextPoolId++;
        uint96 targetAmount = opinions[opinionId].nextPrice;
        
        pools[poolId] = Pool({
            opinionId: opinionId,
            creator: msg.sender,
            proposedAnswer: proposedAnswer,
            deadline: deadline,
            totalContributed: initialContribution,
            targetAmount: targetAmount,
            executed: false,
            expired: false
        });
        
        poolContributions[poolId][msg.sender] = initialContribution;
        usdcToken.safeTransferFrom(msg.sender, address(this), initialContribution);
        
        emit PoolCreated(poolId, opinionId, proposedAnswer);
        emit PoolContribution(poolId, msg.sender, initialContribution);
    }

    // Contribute to existing pool
    function contributeToPool(uint256 poolId, uint96 amount) external nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];
        require(!pool.executed && !pool.expired, "Pool not active");
        require(block.timestamp < pool.deadline, "Pool expired");
        require(amount > 0, "Must contribute");
        
        pool.totalContributed += amount;
        poolContributions[poolId][msg.sender] += amount;
        
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Auto-execute if target reached
        if (pool.totalContributed >= pool.targetAmount) {
            _executePool(poolId);
        }
        
        emit PoolContribution(poolId, msg.sender, amount);
    }

    // Execute pool if target reached
    function _executePool(uint256 poolId) internal {
        Pool storage pool = pools[poolId];
        Opinion storage opinion = opinions[pool.opinionId];
        
        pool.executed = true;
        
        // Calculate fees same as submitAnswer
        uint96 price = pool.targetAmount;
        uint96 platformFee = price * 5 / 100;
        uint96 creatorFee = price * 5 / 100;
        uint96 ownerAmount = price - platformFee - creatorFee;
        
        // Distribute fees
        accumulatedFees[opinion.creator] += creatorFee;
        accumulatedFees[opinion.currentOwner] += ownerAmount;
        usdcToken.safeTransfer(treasury, platformFee);
        
        // Update opinion
        opinion.currentOwner = address(this); // Pool owns it
        opinion.currentAnswer = pool.proposedAnswer;
        opinion.lastPrice = price;
        opinion.nextPrice = _calculateNextPrice(price);
        
        emit AnswerSubmitted(pool.opinionId, address(this), pool.proposedAnswer, price);
    }

    // Withdraw from expired pool
    function withdrawFromExpiredPool(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        require(block.timestamp >= pool.deadline, "Pool not expired");
        require(!pool.executed, "Pool was executed");
        
        uint96 userContribution = poolContributions[poolId][msg.sender];
        require(userContribution > 0, "No contribution");
        
        poolContributions[poolId][msg.sender] = 0;
        pool.expired = true;
        
        usdcToken.safeTransfer(msg.sender, userContribution);
    }

    // Claim accumulated fees
    function claimFees() external nonReentrant {
        uint96 amount = accumulatedFees[msg.sender];
        require(amount > 0, "No fees to claim");
        
        accumulatedFees[msg.sender] = 0;
        usdcToken.safeTransfer(msg.sender, amount);
    }

    // Simple price calculation - 30% increase
    function _calculateNextPrice(uint96 currentPrice) internal pure returns (uint96) {
        return currentPrice * 130 / 100;
    }

    // View functions
    function getOpinion(uint256 opinionId) external view returns (Opinion memory) {
        return opinions[opinionId];
    }
    
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    function getUserContribution(uint256 poolId, address user) external view returns (uint96) {
        return poolContributions[poolId][user];
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        treasury = newTreasury;
    }
}