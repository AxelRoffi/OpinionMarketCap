// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Custom errors for gas efficiency
error QuestionEmpty();
error QuestionTooLong(uint256 length);
error AnswerEmpty();
error AnswerTooLong(uint256 length);
error DescriptionTooLong(uint256 length);
error TooManyCategories(uint256 count);
error CategoryEmpty();
error PriceRange(uint256 price, uint256 min, uint256 max);
error InsufficientAllowance(uint256 need, uint256 have);
error InsufficientBalance(uint256 need, uint256 have);
error OpinionNotFound(uint256 id);
error OpinionNotActive(uint256 id);
error SameOwner();
error PoolNotFound(uint256 id);
error PoolNotActive(uint256 id);
error DeadlineExpired(uint256 deadline, uint256 current);
error DeadlineTooSoon(uint256 deadline, uint256 current);
error NoContribution();
error PoolAlreadyExecuted(uint256 id);
error NoFeesToClaim();

contract FixedOpinionMarket is
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
    
    // Constants for validation
    uint256 public constant MIN_PRICE = 2e6;      // 2 USDC
    uint256 public constant MAX_PRICE = 100e6;    // 100 USDC
    uint256 public constant MAX_QUESTION = 100;   // chars
    uint256 public constant MAX_ANSWER = 100;     // chars
    uint256 public constant MAX_DESCRIPTION = 120; // chars
    uint256 public constant MAX_CATEGORIES = 3;    // count
    
    struct Opinion {
        address creator;
        address currentOwner;
        string question;
        string currentAnswer;
        string description;
        uint96 lastPrice;
        uint96 nextPrice;
        bool isActive;
        uint96 salePrice;
        string[] categories;
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
    event PoolExecuted(uint256 indexed poolId, uint256 opinionId);
    event FeesDistributed(address indexed recipient, uint96 amount);

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

    // ============ OPINION FUNCTIONS ============
    
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata categories
    ) external nonReentrant whenNotPaused {
        // Input validation with custom errors
        if (bytes(question).length == 0) revert QuestionEmpty();
        if (bytes(question).length > MAX_QUESTION) revert QuestionTooLong(bytes(question).length);
        if (bytes(answer).length == 0) revert AnswerEmpty();
        if (bytes(answer).length > MAX_ANSWER) revert AnswerTooLong(bytes(answer).length);
        if (bytes(description).length > MAX_DESCRIPTION) revert DescriptionTooLong(bytes(description).length);
        if (categories.length == 0 || categories.length > MAX_CATEGORIES) revert TooManyCategories(categories.length);
        
        // Validate categories
        for (uint i = 0; i < categories.length; i++) {
            if (bytes(categories[i]).length == 0) revert CategoryEmpty();
        }
        
        if (initialPrice < MIN_PRICE || initialPrice > MAX_PRICE) {
            revert PriceRange(initialPrice, MIN_PRICE, MAX_PRICE);
        }
        
        // Check USDC allowance and balance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialPrice) revert InsufficientAllowance(initialPrice, allowance);
        
        uint256 balance = usdcToken.balanceOf(msg.sender);
        if (balance < initialPrice) revert InsufficientBalance(initialPrice, balance);
        
        // Create opinion
        uint256 opinionId = nextOpinionId++;
        
        opinions[opinionId] = Opinion({
            creator: msg.sender,
            currentOwner: msg.sender,
            question: question,
            currentAnswer: answer,
            description: description,
            lastPrice: initialPrice,
            nextPrice: _calculateNextPrice(initialPrice),
            isActive: true,
            salePrice: 0,
            categories: categories
        });
        
        // Transfer payment
        usdcToken.safeTransferFrom(msg.sender, treasury, initialPrice);
        
        emit OpinionCreated(opinionId, msg.sender, question, initialPrice);
    }

    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external nonReentrant whenNotPaused {
        // Validation
        Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound(opinionId);
        if (!opinion.isActive) revert OpinionNotActive(opinionId);
        if (opinion.currentOwner == msg.sender) revert SameOwner();
        if (bytes(answer).length == 0) revert AnswerEmpty();
        if (bytes(answer).length > MAX_ANSWER) revert AnswerTooLong(bytes(answer).length);
        
        uint96 price = opinion.nextPrice;
        
        // Check USDC
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < price) revert InsufficientAllowance(price, allowance);
        
        uint256 balance = usdcToken.balanceOf(msg.sender);
        if (balance < price) revert InsufficientBalance(price, balance);
        
        // Calculate fees: 2% platform, 3% creator, 95% owner
        uint96 platformFee = (price * 2) / 100;
        uint96 creatorFee = (price * 3) / 100;
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
        emit FeesDistributed(opinion.creator, creatorFee);
        emit FeesDistributed(opinion.currentOwner, ownerAmount);
    }

    // ============ POOL FUNCTIONS ============
    
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint96 initialContribution
    ) external nonReentrant whenNotPaused {
        // Validation
        Opinion storage opinion = opinions[opinionId];
        if (opinion.creator == address(0)) revert OpinionNotFound(opinionId);
        if (!opinion.isActive) revert OpinionNotActive(opinionId);
        if (deadline <= block.timestamp) revert DeadlineTooSoon(deadline, block.timestamp);
        if (bytes(proposedAnswer).length == 0) revert AnswerEmpty();
        if (bytes(proposedAnswer).length > MAX_ANSWER) revert AnswerTooLong(bytes(proposedAnswer).length);
        if (initialContribution == 0) revert InsufficientBalance(1, 0);
        
        // Check USDC
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < initialContribution) revert InsufficientAllowance(initialContribution, allowance);
        
        uint256 balance = usdcToken.balanceOf(msg.sender);
        if (balance < initialContribution) revert InsufficientBalance(initialContribution, balance);
        
        // Create pool
        uint256 poolId = nextPoolId++;
        uint96 targetAmount = opinion.nextPrice;
        
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
        
        // Auto-execute if target reached
        if (initialContribution >= targetAmount) {
            _executePool(poolId);
        }
        
        emit PoolCreated(poolId, opinionId, proposedAnswer);
        emit PoolContribution(poolId, msg.sender, initialContribution);
    }

    function contributeToPool(uint256 poolId, uint96 amount) external nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];
        if (pool.creator == address(0)) revert PoolNotFound(poolId);
        if (pool.executed) revert PoolAlreadyExecuted(poolId);
        if (pool.expired) revert PoolNotActive(poolId);
        if (block.timestamp >= pool.deadline) revert DeadlineExpired(pool.deadline, block.timestamp);
        if (amount == 0) revert InsufficientBalance(1, 0);
        
        // Check USDC
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < amount) revert InsufficientAllowance(amount, allowance);
        
        uint256 balance = usdcToken.balanceOf(msg.sender);
        if (balance < amount) revert InsufficientBalance(amount, balance);
        
        pool.totalContributed += amount;
        poolContributions[poolId][msg.sender] += amount;
        
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Auto-execute if target reached
        if (pool.totalContributed >= pool.targetAmount) {
            _executePool(poolId);
        }
        
        emit PoolContribution(poolId, msg.sender, amount);
    }

    function _executePool(uint256 poolId) internal {
        Pool storage pool = pools[poolId];
        Opinion storage opinion = opinions[pool.opinionId];
        
        pool.executed = true;
        
        // Calculate fees same as submitAnswer
        uint96 price = pool.targetAmount;
        uint96 platformFee = (price * 2) / 100;
        uint96 creatorFee = (price * 3) / 100;
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
        
        emit PoolExecuted(poolId, pool.opinionId);
        emit AnswerSubmitted(pool.opinionId, address(this), pool.proposedAnswer, price);
    }

    function withdrawFromExpiredPool(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        if (pool.creator == address(0)) revert PoolNotFound(poolId);
        if (block.timestamp < pool.deadline) revert DeadlineTooSoon(pool.deadline, block.timestamp);
        if (pool.executed) revert PoolAlreadyExecuted(poolId);
        
        uint96 userContribution = poolContributions[poolId][msg.sender];
        if (userContribution == 0) revert NoContribution();
        
        poolContributions[poolId][msg.sender] = 0;
        pool.expired = true;
        
        usdcToken.safeTransfer(msg.sender, userContribution);
    }

    // ============ FEE FUNCTIONS ============
    
    function claimFees() external nonReentrant {
        uint96 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();
        
        accumulatedFees[msg.sender] = 0;
        usdcToken.safeTransfer(msg.sender, amount);
        
        emit FeesDistributed(msg.sender, amount);
    }

    // ============ INTERNAL FUNCTIONS ============
    
    function _calculateNextPrice(uint96 currentPrice) internal pure returns (uint96) {
        return (currentPrice * 130) / 100; // 30% increase
    }

    // ============ VIEW FUNCTIONS ============
    
    function getOpinion(uint256 opinionId) external view returns (Opinion memory) {
        return opinions[opinionId];
    }
    
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    function getUserContribution(uint256 poolId, address user) external view returns (uint96) {
        return poolContributions[poolId][user];
    }

    function getAccumulatedFees(address user) external view returns (uint96) {
        return accumulatedFees[user];
    }

    // ============ ADMIN FUNCTIONS ============
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        treasury = newTreasury;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyRole(ADMIN_ROLE) {
        IERC20(token).safeTransfer(treasury, amount);
    }
}