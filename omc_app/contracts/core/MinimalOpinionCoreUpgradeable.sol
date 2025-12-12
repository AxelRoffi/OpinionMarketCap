// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MinimalOpinionCoreUpgradeable
 * @dev Ultra-minimal upgradeable version focused on core functionality only
 * Designed to be under 10KB for guaranteed mainnet deployment and verification
 * Supports UUPS upgrade pattern for progressive feature enhancement
 */
contract MinimalOpinionCoreUpgradeable is 
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable 
{
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Core state
    IERC20 public usdcToken;
    address public feeManager;
    address public treasury;
    
    uint256 public nextOpinionId;
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
    event OpinionDeactivated(uint256 indexed id);

    /**
     * @dev Storage gap for future upgrades
     * Reserves 50 storage slots for future versions
     */
    uint256[48] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _usdcToken USDC token address
     * @param _feeManager Fee manager address
     * @param _treasury Treasury address
     */
    function initialize(
        address _usdcToken,
        address _feeManager,
        address _treasury
    ) public initializer {
        require(_usdcToken != address(0), "Invalid USDC");
        require(_feeManager != address(0), "Invalid FeeManager");
        require(_treasury != address(0), "Invalid Treasury");
        
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        usdcToken = IERC20(_usdcToken);
        feeManager = _feeManager;
        treasury = _treasury;
        nextOpinionId = 1;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new opinion - SIMPLIFIED
     * @param question The opinion question
     * @param answer The initial answer
     * @return opinionId The ID of the created opinion
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
     * @param opinionId The opinion ID
     * @param answer The new answer
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
     * @param opinionId The opinion ID
     * @return question The opinion question
     * @return currentAnswer The current answer
     * @return creator The creator address
     * @return currentOwner The current owner address
     * @return nextPrice The next price
     * @return totalVolume The total volume
     * @return isActive Whether the opinion is active
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
     * @param opinionId The opinion ID to deactivate
     */
    function deactivateOpinion(uint256 opinionId) external onlyRole(ADMIN_ROLE) {
        opinions[opinionId].isActive = false;
        emit OpinionDeactivated(opinionId);
    }

    /**
     * @dev Grant admin role
     * @param account The account to grant admin role
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

    /**
     * @dev Authorize upgrade (UUPS pattern)
     * @param newImplementation The new implementation address
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(ADMIN_ROLE) 
    {
        // Only admin can upgrade
    }

    /**
     * @dev Get contract version
     * @return version The contract version
     */
    function version() external pure virtual returns (string memory) {
        return "1.0.0";
    }
}
