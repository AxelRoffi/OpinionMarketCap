// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TreasurySecureEnhanced
 * @dev Enhanced treasury security with instant daily limits for solo developers
 * 
 * FEATURES:
 * - ≤ $1,000 USDC: Instant withdrawal (daily limit)
 * - > $1,000 USDC: 72-hour timelock delay
 * - Emergency freeze capability
 * - Full audit trail for all withdrawals
 */
contract TreasurySecureEnhanced is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════
    // ROLE DEFINITIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Treasury admin role - can propose/execute withdrawals and manage daily limits
     */
    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");
    
    /**
     * @dev Emergency role - can freeze/unfreeze treasury
     */
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    uint256 public constant WITHDRAWAL_TIMELOCK = 72 hours;           // Timelock for large withdrawals
    uint256 public constant INSTANT_WITHDRAWAL_LIMIT = 1_000 * 1e6;  // 1K USDC daily instant limit
    uint256 public constant ALERT_THRESHOLD = 10_000 * 1e6;          // 10K USDC alert threshold
    uint256 public constant FREEZE_DURATION = 24 hours;              // Auto-unfreeze after 24h
    uint256 public constant MAX_WITHDRAWAL = 1_000_000 * 1e6;        // 1M USDC maximum single withdrawal
    uint256 public constant DAILY_RESET_PERIOD = 24 hours;           // Daily limit reset period

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════
    
    IERC20 public usdcToken;                                          // USDC token contract
    bool public treasuryFrozen;                                       // Emergency freeze state
    uint256 public freezeEndTime;                                     // Auto-unfreeze timestamp
    uint256 public proposalCounter;                                   // Sequential proposal IDs
    
    // Daily instant withdrawal tracking
    mapping(address => uint256) public dailyWithdrawn;               // Amount withdrawn today per user
    mapping(address => uint256) public lastWithdrawalReset;          // Last reset timestamp per user
    uint256 public totalInstantWithdrawnToday;                       // Total instant withdrawals today
    uint256 public lastGlobalReset;                                  // Last global reset timestamp

    // ═══════════════════════════════════════════════════════════════
    // WITHDRAWAL PROPOSAL STRUCTURE (For Large Amounts)
    // ═══════════════════════════════════════════════════════════════
    
    struct WithdrawalProposal {
        uint256 amount;                 // Withdrawal amount
        address recipient;              // Recipient address
        uint256 proposedTime;           // When proposal was created
        uint256 executeTime;            // When proposal can be executed
        bool executed;                  // Whether proposal has been executed
        bool cancelled;                 // Whether proposal has been cancelled
        string description;             // Optional description for audit trail
    }
    
    mapping(uint256 => WithdrawalProposal) public proposals;          // Proposal ID → Proposal data

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Emitted when an instant withdrawal is executed
     */
    event InstantWithdrawalExecuted(
        address indexed recipient,
        uint256 amount,
        string description,
        uint256 remainingDailyLimit
    );
    
    /**
     * @dev Emitted when daily limit is exceeded and proposal is created
     */
    event DailyLimitExceeded(
        address indexed user,
        uint256 attemptedAmount,
        uint256 instantAmount,
        uint256 proposalAmount,
        uint256 proposalId
    );
    
    /**
     * @dev Emitted when a large withdrawal is proposed
     */
    event WithdrawalProposed(
        uint256 indexed proposalId,
        uint256 amount,
        address indexed recipient,
        uint256 executeTime,
        string description
    );
    
    /**
     * @dev Emitted for large withdrawal proposals (>10K USDC)
     */
    event LargeWithdrawalProposed(
        uint256 indexed proposalId,
        uint256 amount,
        string alert
    );
    
    /**
     * @dev Emitted when a withdrawal is executed
     */
    event WithdrawalExecuted(
        uint256 indexed proposalId,
        uint256 amount,
        address indexed recipient
    );
    
    /**
     * @dev Emitted when a withdrawal proposal is cancelled
     */
    event WithdrawalCancelled(
        uint256 indexed proposalId,
        string reason
    );
    
    /**
     * @dev Emitted when treasury is frozen for emergency
     */
    event TreasuryFrozen(
        string reason,
        uint256 freezeEndTime
    );
    
    /**
     * @dev Emitted when treasury is unfrozen
     */
    event TreasuryUnfrozen(
        bool isAutomatic
    );
    
    /**
     * @dev Emitted for treasury balance updates
     */
    event TreasuryBalanceChanged(
        uint256 oldBalance,
        uint256 newBalance,
        string operation
    );

    /**
     * @dev Emitted when daily limits are reset
     */
    event DailyLimitsReset(
        address indexed user,
        uint256 previousWithdrawn,
        uint256 resetTime
    );

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════
    
    error TreasuryFrozenError(string reason, uint256 unfreezeTime);
    error ProposalNotFound(uint256 proposalId);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalCancelled(uint256 proposalId);
    error TimelockNotExpired(uint256 proposalId, uint256 timeRemaining);
    error InvalidAmount(uint256 amount, uint256 max);
    error InvalidRecipient(address recipient);
    error InsufficientTreasuryBalance(uint256 requested, uint256 available);
    error ProposalAlreadyCancelled(uint256 proposalId);
    error DailyLimitExceededError(uint256 requested, uint256 available);

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Initializes the enhanced treasury security contract
     */
    function initialize(
        address _usdcToken,
        address _treasuryAdmin,
        address _emergencyAdmin
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Validate inputs
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_treasuryAdmin != address(0), "Invalid treasury admin address");
        require(_emergencyAdmin != address(0), "Invalid emergency admin address");

        // Set token
        usdcToken = IERC20(_usdcToken);

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _treasuryAdmin);
        _grantRole(TREASURY_ADMIN_ROLE, _treasuryAdmin);
        _grantRole(EMERGENCY_ROLE, _emergencyAdmin);

        // Initialize state
        treasuryFrozen = false;
        proposalCounter = 1;
        lastGlobalReset = block.timestamp;
    }

    // ═══════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Ensures treasury is not frozen
     */
    modifier notFrozen() {
        // Check if auto-unfreeze should occur
        if (treasuryFrozen && block.timestamp >= freezeEndTime) {
            _autoUnfreeze();
        }
        
        if (treasuryFrozen) {
            revert TreasuryFrozenError("Treasury operations frozen", freezeEndTime);
        }
        _;
    }

    /**
     * @dev Updates daily limits if needed
     */
    modifier updateDailyLimits() {
        _updateDailyLimits(msg.sender);
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    // INSTANT WITHDRAWAL FUNCTIONS (≤ $1,000 USDC)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Executes instant withdrawal if within daily limits
     * @param amount Amount to withdraw (max 1K USDC per day)
     * @param recipient Recipient address
     * @param description Description for audit trail
     */
    function instantWithdrawal(
        uint256 amount,
        address recipient,
        string calldata description
    ) external onlyRole(TREASURY_ADMIN_ROLE) notFrozen updateDailyLimits nonReentrant {
        
        // Validate inputs
        if (amount == 0 || amount > MAX_WITHDRAWAL) {
            revert InvalidAmount(amount, MAX_WITHDRAWAL);
        }
        if (recipient == address(0)) {
            revert InvalidRecipient(recipient);
        }

        // Check treasury balance
        uint256 balance = usdcToken.balanceOf(address(this));
        if (amount > balance) {
            revert InsufficientTreasuryBalance(amount, balance);
        }

        // Check daily limit
        uint256 remainingLimit = getRemainingDailyLimit(msg.sender);
        if (amount > remainingLimit) {
            revert DailyLimitExceededError(amount, remainingLimit);
        }

        // Update daily tracking
        dailyWithdrawn[msg.sender] += amount;
        totalInstantWithdrawnToday += amount;

        // Execute transfer
        uint256 oldBalance = balance;
        usdcToken.safeTransfer(recipient, amount);
        uint256 newBalance = usdcToken.balanceOf(address(this));

        // Calculate new remaining limit
        uint256 newRemainingLimit = getRemainingDailyLimit(msg.sender);

        // Emit events
        emit InstantWithdrawalExecuted(recipient, amount, description, newRemainingLimit);
        emit TreasuryBalanceChanged(oldBalance, newBalance, "Instant withdrawal");
    }

    /**
     * @dev Smart withdrawal - uses instant if possible, creates proposal if needed
     * @param amount Amount to withdraw
     * @param recipient Recipient address  
     * @param description Description for audit trail
     * @return wasInstant Whether withdrawal was executed instantly
     * @return proposalId Proposal ID if created (0 if instant)
     */
    function smartWithdrawal(
        uint256 amount,
        address recipient,
        string calldata description
    ) external onlyRole(TREASURY_ADMIN_ROLE) notFrozen updateDailyLimits nonReentrant 
       returns (bool wasInstant, uint256 proposalId) {
        
        // Validate inputs
        if (amount == 0 || amount > MAX_WITHDRAWAL) {
            revert InvalidAmount(amount, MAX_WITHDRAWAL);
        }
        if (recipient == address(0)) {
            revert InvalidRecipient(recipient);
        }

        // Check treasury balance
        uint256 balance = usdcToken.balanceOf(address(this));
        if (amount > balance) {
            revert InsufficientTreasuryBalance(amount, balance);
        }

        uint256 remainingLimit = getRemainingDailyLimit(msg.sender);

        if (amount <= remainingLimit) {
            // Can do instant withdrawal
            dailyWithdrawn[msg.sender] += amount;
            totalInstantWithdrawnToday += amount;

            // Execute transfer
            uint256 oldBalance = balance;
            usdcToken.safeTransfer(recipient, amount);
            uint256 newBalance = usdcToken.balanceOf(address(this));

            uint256 newRemainingLimit = getRemainingDailyLimit(msg.sender);
            emit InstantWithdrawalExecuted(recipient, amount, description, newRemainingLimit);
            emit TreasuryBalanceChanged(oldBalance, newBalance, "Smart instant withdrawal");

            return (true, 0);

        } else {
            // Need to create proposal for full amount
            proposalId = _createWithdrawalProposal(amount, recipient, description);
            
            emit DailyLimitExceeded(
                msg.sender,
                amount,
                0, // No instant amount
                amount, // Full amount in proposal
                proposalId
            );

            return (false, proposalId);
        }
    }

    /**
     * @dev Hybrid withdrawal - instant up to limit, proposal for remainder
     * @param amount Total amount to withdraw
     * @param recipient Recipient address
     * @param description Description for audit trail
     * @return instantAmount Amount withdrawn instantly
     * @return proposalId Proposal ID for remainder (0 if no remainder)
     */
    function hybridWithdrawal(
        uint256 amount,
        address recipient,
        string calldata description
    ) external onlyRole(TREASURY_ADMIN_ROLE) notFrozen updateDailyLimits nonReentrant
       returns (uint256 instantAmount, uint256 proposalId) {
        
        // Validate inputs
        if (amount == 0 || amount > MAX_WITHDRAWAL) {
            revert InvalidAmount(amount, MAX_WITHDRAWAL);
        }
        if (recipient == address(0)) {
            revert InvalidRecipient(recipient);
        }

        // Check treasury balance
        uint256 balance = usdcToken.balanceOf(address(this));
        if (amount > balance) {
            revert InsufficientTreasuryBalance(amount, balance);
        }

        uint256 remainingLimit = getRemainingDailyLimit(msg.sender);
        
        if (remainingLimit > 0 && amount > remainingLimit) {
            // Partial instant withdrawal
            instantAmount = remainingLimit;
            uint256 proposalAmount = amount - remainingLimit;

            // Execute instant part
            dailyWithdrawn[msg.sender] += instantAmount;
            totalInstantWithdrawnToday += instantAmount;

            uint256 oldBalance = balance;
            usdcToken.safeTransfer(recipient, instantAmount);
            uint256 newBalance = usdcToken.balanceOf(address(this));

            // Create proposal for remainder
            proposalId = _createWithdrawalProposal(proposalAmount, recipient, description);

            emit InstantWithdrawalExecuted(recipient, instantAmount, description, 0);
            emit TreasuryBalanceChanged(oldBalance, newBalance, "Hybrid instant withdrawal");
            emit DailyLimitExceeded(msg.sender, amount, instantAmount, proposalAmount, proposalId);

            return (instantAmount, proposalId);

        } else if (amount <= remainingLimit) {
            // Full instant withdrawal - implement directly to avoid recursion
            dailyWithdrawn[msg.sender] += amount;
            totalInstantWithdrawnToday += amount;

            // Execute transfer
            uint256 oldBalance = balance;
            usdcToken.safeTransfer(recipient, amount);
            uint256 newBalance = usdcToken.balanceOf(address(this));

            uint256 newRemainingLimit = getRemainingDailyLimit(msg.sender);
            emit InstantWithdrawalExecuted(recipient, amount, description, newRemainingLimit);
            emit TreasuryBalanceChanged(oldBalance, newBalance, "Hybrid full instant withdrawal");

            return (amount, 0);

        } else {
            // Full proposal (no daily limit available)
            proposalId = _createWithdrawalProposal(amount, recipient, description);
            emit DailyLimitExceeded(msg.sender, amount, 0, amount, proposalId);
            return (0, proposalId);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PROPOSAL SYSTEM (Large Amounts > Daily Limit)
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Creates a withdrawal proposal with 72-hour timelock
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     * @param description Description for audit trail
     * @return proposalId Unique proposal identifier
     */
    function _createWithdrawalProposal(
        uint256 amount,
        address recipient,
        string memory description
    ) internal returns (uint256 proposalId) {
        
        // Create proposal
        proposalId = proposalCounter++;
        uint256 executeTime = block.timestamp + WITHDRAWAL_TIMELOCK;
        
        proposals[proposalId] = WithdrawalProposal({
            amount: amount,
            recipient: recipient,
            proposedTime: block.timestamp,
            executeTime: executeTime,
            executed: false,
            cancelled: false,
            description: description
        });

        // Emit events
        emit WithdrawalProposed(proposalId, amount, recipient, executeTime, description);

        // Large withdrawal alert
        if (amount >= ALERT_THRESHOLD) {
            emit LargeWithdrawalProposed(
                proposalId,
                amount,
                "ALERT: Large withdrawal proposed - requires attention"
            );
        }

        return proposalId;
    }

    /**
     * @dev Executes a withdrawal proposal after timelock expires
     * @param proposalId Proposal identifier to execute
     */
    function executeWithdrawal(uint256 proposalId) external onlyRole(TREASURY_ADMIN_ROLE) notFrozen nonReentrant {
        WithdrawalProposal storage proposal = proposals[proposalId];

        // Validate proposal exists
        if (proposal.proposedTime == 0) {
            revert ProposalNotFound(proposalId);
        }

        // Check if already executed
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }

        // Check if cancelled
        if (proposal.cancelled) {
            revert ProposalCancelled(proposalId);
        }

        // Check timelock
        if (block.timestamp < proposal.executeTime) {
            uint256 timeRemaining = proposal.executeTime - block.timestamp;
            revert TimelockNotExpired(proposalId, timeRemaining);
        }

        // Check current balance
        uint256 currentBalance = usdcToken.balanceOf(address(this));
        if (proposal.amount > currentBalance) {
            revert InsufficientTreasuryBalance(proposal.amount, currentBalance);
        }

        // Mark as executed
        proposal.executed = true;

        // Execute transfer
        uint256 oldBalance = currentBalance;
        usdcToken.safeTransfer(proposal.recipient, proposal.amount);
        uint256 newBalance = usdcToken.balanceOf(address(this));

        // Emit events
        emit WithdrawalExecuted(proposalId, proposal.amount, proposal.recipient);
        emit TreasuryBalanceChanged(oldBalance, newBalance, "Proposal withdrawal executed");
    }

    /**
     * @dev Cancels a pending withdrawal proposal
     * @param proposalId Proposal identifier to cancel
     * @param reason Cancellation reason
     */
    function cancelWithdrawal(
        uint256 proposalId,
        string calldata reason
    ) external onlyRole(TREASURY_ADMIN_ROLE) {
        WithdrawalProposal storage proposal = proposals[proposalId];

        if (proposal.proposedTime == 0) {
            revert ProposalNotFound(proposalId);
        }

        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }

        if (proposal.cancelled) {
            revert ProposalAlreadyCancelled(proposalId);
        }

        // Cancel proposal
        proposal.cancelled = true;

        emit WithdrawalCancelled(proposalId, reason);
    }

    // ═══════════════════════════════════════════════════════════════
    // DAILY LIMIT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Updates daily limits if 24 hours have passed
     * @param user User to update limits for
     */
    function _updateDailyLimits(address user) internal {
        // Update user's daily limit
        if (block.timestamp >= lastWithdrawalReset[user] + DAILY_RESET_PERIOD) {
            uint256 previousWithdrawn = dailyWithdrawn[user];
            dailyWithdrawn[user] = 0;
            lastWithdrawalReset[user] = block.timestamp;
            
            if (previousWithdrawn > 0) {
                emit DailyLimitsReset(user, previousWithdrawn, block.timestamp);
            }
        }

        // Update global daily tracking
        if (block.timestamp >= lastGlobalReset + DAILY_RESET_PERIOD) {
            totalInstantWithdrawnToday = 0;
            lastGlobalReset = block.timestamp;
        }
    }

    /**
     * @dev Gets remaining daily withdrawal limit for user
     * @param user User address
     * @return remaining Remaining daily limit in USDC (6 decimals)
     */
    function getRemainingDailyLimit(address user) public view returns (uint256 remaining) {
        // Check if daily limit should be reset
        if (block.timestamp >= lastWithdrawalReset[user] + DAILY_RESET_PERIOD) {
            return INSTANT_WITHDRAWAL_LIMIT;
        }

        uint256 withdrawn = dailyWithdrawn[user];
        if (withdrawn >= INSTANT_WITHDRAWAL_LIMIT) {
            return 0;
        }

        return INSTANT_WITHDRAWAL_LIMIT - withdrawn;
    }

    // ═══════════════════════════════════════════════════════════════
    // EMERGENCY CONTROLS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Freezes all treasury operations immediately
     */
    function emergencyFreeze(string calldata reason) external onlyRole(EMERGENCY_ROLE) {
        treasuryFrozen = true;
        freezeEndTime = block.timestamp + FREEZE_DURATION;

        emit TreasuryFrozen(reason, freezeEndTime);
    }

    /**
     * @dev Manually unfreezes treasury
     */
    function manualUnfreeze() external onlyRole(EMERGENCY_ROLE) {
        require(treasuryFrozen, "Treasury not frozen");

        treasuryFrozen = false;
        freezeEndTime = 0;

        emit TreasuryUnfrozen(false);
    }

    /**
     * @dev Internal function for automatic unfreeze
     */
    function _autoUnfreeze() internal {
        treasuryFrozen = false;
        freezeEndTime = 0;

        emit TreasuryUnfrozen(true);
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Gets detailed proposal information
     */
    function getProposal(uint256 proposalId) external view returns (WithdrawalProposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Gets user's daily withdrawal status
     */
    function getDailyWithdrawalStatus(address user) external view returns (
        uint256 dailyLimit,
        uint256 withdrawn,
        uint256 remaining,
        uint256 resetTime
    ) {
        dailyLimit = INSTANT_WITHDRAWAL_LIMIT;
        withdrawn = dailyWithdrawn[user];
        remaining = getRemainingDailyLimit(user);
        resetTime = lastWithdrawalReset[user] + DAILY_RESET_PERIOD;
        
        return (dailyLimit, withdrawn, remaining, resetTime);
    }

    /**
     * @dev Gets treasury status summary
     */
    function getTreasuryStatus() external view returns (
        uint256 balance,
        bool isFrozen,
        uint256 freezeTimeRemaining,
        uint256 pendingProposalsCount,
        uint256 nextProposalId,
        uint256 totalInstantToday
    ) {
        balance = usdcToken.balanceOf(address(this));
        isFrozen = treasuryFrozen;
        
        if (isFrozen && block.timestamp < freezeEndTime) {
            freezeTimeRemaining = freezeEndTime - block.timestamp;
        } else {
            freezeTimeRemaining = 0;
        }

        // Count pending proposals
        for (uint256 i = 1; i < proposalCounter; i++) {
            WithdrawalProposal storage proposal = proposals[i];
            if (proposal.proposedTime > 0 && !proposal.executed && !proposal.cancelled) {
                pendingProposalsCount++;
            }
        }

        nextProposalId = proposalCounter;
        totalInstantToday = totalInstantWithdrawnToday;

        return (balance, isFrozen, freezeTimeRemaining, pendingProposalsCount, nextProposalId, totalInstantToday);
    }

    /**
     * @dev Admin utility to deposit USDC
     */
    function depositUSDC(uint256 amount) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 oldBalance = usdcToken.balanceOf(address(this));
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 newBalance = usdcToken.balanceOf(address(this));

        emit TreasuryBalanceChanged(oldBalance, newBalance, "Manual deposit");
    }

    /**
     * @dev Emergency pause all functions
     */
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /**
     * @dev Emergency unpause all functions
     */
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
}