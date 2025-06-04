// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TreasurySecure
 * @dev Ultra-simple but bulletproof treasury security for solo-dev operations
 * ONE withdrawal function for all amounts (1K to 1M USDC) with 72h timelock
 * Emergency freeze capability + large withdrawal monitoring
 */
contract TreasurySecure is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    // === ROLE DEFINITIONS ===
    
    /**
     * @dev Treasury admin role - can propose and execute withdrawals
     * Should be assigned to the main admin wallet
     */
    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");
    
    /**
     * @dev Emergency role - can freeze/unfreeze treasury
     * Should be assigned to backup admin wallet for emergency situations
     */
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // === CONFIGURATION CONSTANTS ===
    
    uint256 public constant WITHDRAWAL_TIMELOCK = 72 hours;    // Universal timelock for ALL withdrawals
    uint256 public constant ALERT_THRESHOLD = 10_000 * 1e6;   // 10K USDC alert threshold (no blocking)
    uint256 public constant FREEZE_DURATION = 24 hours;       // Auto-unfreeze after 24h
    uint256 public constant MAX_WITHDRAWAL = 1_000_000 * 1e6; // 1M USDC maximum single withdrawal

    // === STATE VARIABLES ===
    
    IERC20 public usdcToken;                                   // USDC token contract
    bool public treasuryFrozen;                                // Emergency freeze state
    uint256 public freezeEndTime;                              // Auto-unfreeze timestamp
    uint256 public proposalCounter;                            // Sequential proposal IDs
    
    // === WITHDRAWAL PROPOSAL STRUCTURE ===
    
    struct WithdrawalProposal {
        uint256 amount;                 // Withdrawal amount
        address recipient;              // Recipient address
        uint256 proposedTime;           // When proposal was created
        uint256 executeTime;            // When proposal can be executed (proposedTime + timelock)
        bool executed;                  // Whether proposal has been executed
        bool cancelled;                 // Whether proposal has been cancelled
        string description;             // Optional description for audit trail
    }
    
    mapping(uint256 => WithdrawalProposal) public proposals;   // Proposal ID → Proposal data
    
    // === EVENTS ===
    
    /**
     * @dev Emitted when a withdrawal is proposed
     * @param proposalId Unique proposal identifier
     * @param amount Withdrawal amount
     * @param recipient Recipient address
     * @param executeTime When the proposal can be executed
     * @param description Optional description
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
     * @param proposalId Proposal identifier
     * @param amount Large withdrawal amount
     * @param alert Alert message for monitoring
     */
    event LargeWithdrawalProposed(
        uint256 indexed proposalId,
        uint256 amount,
        string alert
    );
    
    /**
     * @dev Emitted when a withdrawal is executed
     * @param proposalId Proposal identifier
     * @param amount Executed amount
     * @param recipient Recipient address
     */
    event WithdrawalExecuted(
        uint256 indexed proposalId,
        uint256 amount,
        address indexed recipient
    );
    
    /**
     * @dev Emitted when a withdrawal proposal is cancelled
     * @param proposalId Proposal identifier
     * @param reason Cancellation reason
     */
    event WithdrawalCancelled(
        uint256 indexed proposalId,
        string reason
    );
    
    /**
     * @dev Emitted when treasury is frozen for emergency
     * @param reason Freeze reason
     * @param freezeEndTime When auto-unfreeze occurs
     */
    event TreasuryFrozen(
        string reason,
        uint256 freezeEndTime
    );
    
    /**
     * @dev Emitted when treasury is unfrozen
     * @param isAutomatic Whether unfreeze was automatic or manual
     */
    event TreasuryUnfrozen(
        bool isAutomatic
    );
    
    /**
     * @dev Emitted for treasury balance updates
     * @param oldBalance Previous balance
     * @param newBalance New balance
     * @param operation Operation that caused the change
     */
    event TreasuryBalanceChanged(
        uint256 oldBalance,
        uint256 newBalance,
        string operation
    );

    // === ERRORS ===
    
    error TreasuryFrozenError(string reason, uint256 unfreezeTime);
    error ProposalNotFound(uint256 proposalId);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalCancelled(uint256 proposalId);
    error TimelockNotExpired(uint256 proposalId, uint256 timeRemaining);
    error InvalidAmount(uint256 amount, uint256 max);
    error InvalidRecipient(address recipient);
    error InsufficientTreasuryBalance(uint256 requested, uint256 available);
    error ProposalAlreadyCancelled(uint256 proposalId);

    // === INITIALIZATION ===
    
    /**
     * @dev Initializes the treasury security contract
     * @param _usdcToken USDC token contract address
     * @param _treasuryAdmin Primary treasury admin
     * @param _emergencyAdmin Emergency admin (can be same as treasury admin)
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
        proposalCounter = 1; // Start from 1 for easier tracking
    }

    // === MODIFIERS ===
    
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

    // === CORE WITHDRAWAL FUNCTIONS ===
    
    /**
     * @dev Proposes a withdrawal (universal function for all amounts)
     * @param amount Amount to withdraw (1K to 1M USDC supported)
     * @param recipient Recipient address
     * @param description Optional description for audit trail
     * @return proposalId Unique proposal identifier
     */
    function proposeWithdrawal(
        uint256 amount,
        address recipient,
        string calldata description
    ) external onlyRole(TREASURY_ADMIN_ROLE) notFrozen returns (uint256 proposalId) {
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

        // Large withdrawal alert (no blocking, just monitoring)
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
     * @dev Executes a withdrawal after timelock expires
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

        // Check current balance (may have changed since proposal)
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
        emit TreasuryBalanceChanged(oldBalance, newBalance, "Withdrawal executed");
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

        // Validate proposal exists
        if (proposal.proposedTime == 0) {
            revert ProposalNotFound(proposalId);
        }

        // Check if already executed
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }

        // Check if already cancelled
        if (proposal.cancelled) {
            revert ProposalAlreadyCancelled(proposalId);
        }

        // Cancel proposal
        proposal.cancelled = true;

        emit WithdrawalCancelled(proposalId, reason);
    }

    // === EMERGENCY CONTROLS ===

    /**
     * @dev Freezes all treasury operations immediately
     * @param reason Reason for emergency freeze
     */
    function emergencyFreeze(string calldata reason) external onlyRole(EMERGENCY_ROLE) {
        treasuryFrozen = true;
        freezeEndTime = block.timestamp + FREEZE_DURATION;

        emit TreasuryFrozen(reason, freezeEndTime);
    }

    /**
     * @dev Manually unfreezes treasury (before auto-unfreeze)
     */
    function manualUnfreeze() external onlyRole(EMERGENCY_ROLE) {
        require(treasuryFrozen, "Treasury not frozen");

        treasuryFrozen = false;
        freezeEndTime = 0;

        emit TreasuryUnfrozen(false); // false = manual unfreeze
    }

    /**
     * @dev Internal function for automatic unfreeze
     */
    function _autoUnfreeze() internal {
        treasuryFrozen = false;
        freezeEndTime = 0;

        emit TreasuryUnfrozen(true); // true = automatic unfreeze
    }

    // === VIEW FUNCTIONS ===

    /**
     * @dev Gets detailed proposal information
     * @param proposalId Proposal identifier
     * @return Proposal details
     */
    function getProposal(uint256 proposalId) external view returns (WithdrawalProposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Gets proposal status information
     * @param proposalId Proposal identifier
     * @return isPending Whether proposal is pending execution
     * @return isExecutable Whether proposal can be executed now
     * @return timeRemaining Seconds remaining until executable
     */
    function getProposalStatus(uint256 proposalId) external view returns (
        bool isPending,
        bool isExecutable,
        uint256 timeRemaining
    ) {
        WithdrawalProposal storage proposal = proposals[proposalId];

        if (proposal.proposedTime == 0 || proposal.executed || proposal.cancelled) {
            return (false, false, 0);
        }

        isPending = true;
        
        if (block.timestamp >= proposal.executeTime) {
            isExecutable = true;
            timeRemaining = 0;
        } else {
            isExecutable = false;
            timeRemaining = proposal.executeTime - block.timestamp;
        }
    }

    /**
     * @dev Gets all pending proposals (gas-efficient view)
     * @return pendingIds Array of pending proposal IDs
     */
    function getPendingProposals() external view returns (uint256[] memory pendingIds) {
        // Count pending proposals
        uint256 count = 0;
        for (uint256 i = 1; i < proposalCounter; i++) {
            WithdrawalProposal storage proposal = proposals[i];
            if (proposal.proposedTime > 0 && !proposal.executed && !proposal.cancelled) {
                count++;
            }
        }

        // Build array
        pendingIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < proposalCounter; i++) {
            WithdrawalProposal storage proposal = proposals[i];
            if (proposal.proposedTime > 0 && !proposal.executed && !proposal.cancelled) {
                pendingIds[index++] = i;
            }
        }
    }

    /**
     * @dev Gets treasury status summary
     * @return balance Current USDC balance
     * @return isFrozen Whether treasury is frozen
     * @return freezeTimeRemaining Seconds until auto-unfreeze (0 if not frozen)
     * @return pendingProposalsCount Number of pending proposals
     * @return nextProposalId Next proposal ID that will be assigned
     */
    function getTreasuryStatus() external view returns (
        uint256 balance,
        bool isFrozen,
        uint256 freezeTimeRemaining,
        uint256 pendingProposalsCount,
        uint256 nextProposalId
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
    }

    /**
     * @dev Checks if treasury will auto-unfreeze soon
     * @return willAutoUnfreeze Whether auto-unfreeze will occur
     * @return autoUnfreezeTime When auto-unfreeze will occur
     */
    function getAutoUnfreezeInfo() external view returns (bool willAutoUnfreeze, uint256 autoUnfreezeTime) {
        willAutoUnfreeze = treasuryFrozen && freezeEndTime > 0;
        autoUnfreezeTime = freezeEndTime;
    }

    // === ADMIN UTILITIES ===

    /**
     * @dev Emergency function to receive USDC (for manual deposits)
     * Can be called by treasury admin to add funds
     */
    function depositUSDC(uint256 amount) external onlyRole(TREASURY_ADMIN_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 oldBalance = usdcToken.balanceOf(address(this));
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 newBalance = usdcToken.balanceOf(address(this));

        emit TreasuryBalanceChanged(oldBalance, newBalance, "Manual deposit");
    }

    /**
     * @dev Gets configuration constants for external reference
     * @return withdrawalTimelock Timelock duration in seconds
     * @return alertThreshold Large withdrawal alert threshold
     * @return freezeDuration Auto-unfreeze duration
     * @return maxWithdrawal Maximum single withdrawal amount
     */
    function getConfiguration() external pure returns (
        uint256 withdrawalTimelock,
        uint256 alertThreshold,
        uint256 freezeDuration,
        uint256 maxWithdrawal
    ) {
        return (WITHDRAWAL_TIMELOCK, ALERT_THRESHOLD, FREEZE_DURATION, MAX_WITHDRAWAL);
    }

    /**
     * @dev Pauses all contract operations (emergency only)
     * Different from freeze - pauses ALL functions including view functions
     */
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses contract operations
     */
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
}