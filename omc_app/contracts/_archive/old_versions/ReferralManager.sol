// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title ReferralManager
 * @dev Manages referral system for free opinion creation
 * 
 * FEATURES:
 * - Generate unique referral codes
 * - Track referral relationships
 * - Provide free mints for both referrer and referee
 * - Anti-abuse mechanisms (one referral per address pair)
 */
contract ReferralManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    // ═══════════════════════════════════════════════════════════════
    // ROLES
    // ═══════════════════════════════════════════════════════════════
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPINION_CONTRACT_ROLE = keccak256("OPINION_CONTRACT_ROLE");

    // ═══════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════

    struct ReferralData {
        address referrer;           // Who made the referral
        uint256 timestamp;          // When referral was created
        bool referrerRewardClaimed; // Has referrer used their free mint
        bool refereeRewardClaimed;  // Has referee used their free mint
        uint256 referralCode;       // Unique referral code used
    }

    struct ReferrerStats {
        uint256 totalReferrals;     // Total successful referrals
        uint256 availableFreeMints; // Unclaimed free mints
        uint256 totalFreeMints;     // Total free mints earned
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    // Referral tracking
    mapping(address => ReferrerStats) public referrerStats;
    mapping(address => ReferralData) public refereeData;
    mapping(uint256 => address) public referralCodeToReferrer;
    mapping(address => uint256) public referrerToCode;
    
    // Anti-abuse: prevent same address pair from referring multiple times
    mapping(address => mapping(address => bool)) public hasReferred;
    
    // Configuration
    uint256 public nextReferralCode;
    bool public referralSystemEnabled;
    uint256 public maxFreeMints; // Max accumulated free mints per user
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event ReferralCreated(
        address indexed referrer,
        address indexed referee,
        uint256 indexed referralCode,
        uint256 timestamp
    );

    event FreeMintUsed(
        address indexed user,
        uint256 indexed opinionId,
        bool isReferrer,
        uint256 timestamp
    );

    event ReferralCodeGenerated(
        address indexed user,
        uint256 indexed referralCode,
        uint256 timestamp
    );

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function initialize(address admin) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        nextReferralCode = 100000; // Start with 6-digit codes
        referralSystemEnabled = true;
        maxFreeMints = 4; // Max 4 accumulated free mints (reasonable limit)
    }

    // ═══════════════════════════════════════════════════════════════
    // REFERRAL CODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Generate a referral code for a user
     * @param user Address to generate code for
     * @return referralCode The generated referral code
     */
    function generateReferralCode(address user) external returns (uint256 referralCode) {
        require(user != address(0), "Invalid address");
        require(referralSystemEnabled, "Referral system disabled");
        
        // Check if user already has a code
        if (referrerToCode[user] != 0) {
            return referrerToCode[user];
        }
        
        referralCode = nextReferralCode++;
        
        referralCodeToReferrer[referralCode] = user;
        referrerToCode[user] = referralCode;
        
        emit ReferralCodeGenerated(user, referralCode, block.timestamp);
        
        return referralCode;
    }

    // ═══════════════════════════════════════════════════════════════
    // REFERRAL TRACKING
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Process a referral when new user creates first opinion
     * @param referee New user address
     * @param referralCode Referral code used
     */
    function processReferral(
        address referee,
        uint256 referralCode
    ) external nonReentrant returns (bool success) {
        require(referralSystemEnabled, "Referral system disabled");
        require(referee != address(0), "Invalid referee");
        
        address referrer = referralCodeToReferrer[referralCode];
        require(referrer != address(0), "Invalid referral code");
        require(referrer != referee, "Cannot refer yourself");
        require(!hasReferred[referrer][referee], "Already referred this user");
        require(refereeData[referee].referrer == address(0), "User already referred");
        
        // Record the referral
        refereeData[referee] = ReferralData({
            referrer: referrer,
            timestamp: block.timestamp,
            referrerRewardClaimed: false,
            refereeRewardClaimed: false,
            referralCode: referralCode
        });
        
        // Update referrer stats (always track the referral)
        ReferrerStats storage stats = referrerStats[referrer];
        stats.totalReferrals++;
        
        // Grant free mints to referrer ONLY if they haven't hit the 4-mint cap
        // But the referral is still valid for the referee regardless!
        if (stats.availableFreeMints < maxFreeMints) {
            stats.availableFreeMints++;
            stats.totalFreeMints++;
        }
        // Note: Even if referrer doesn't get free mint, referee still gets theirs!
        
        // Mark this referral pair as used
        hasReferred[referrer][referee] = true;
        
        emit ReferralCreated(referrer, referee, referralCode, block.timestamp);
        
        return true; // Always return true - referral is processed for referee
    }

    // ═══════════════════════════════════════════════════════════════
    // FREE MINT SYSTEM
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Check if user has free mints available
     * @param user Address to check
     * @return available Number of free mints available
     */
    function getAvailableFreeMints(address user) external view returns (uint256 available) {
        // Check referrer free mints
        available = referrerStats[user].availableFreeMints;
        
        // Check referee free mint (one-time)
        ReferralData storage data = refereeData[user];
        if (data.referrer != address(0) && !data.refereeRewardClaimed) {
            available += 1;
        }
        
        return available;
    }

    /**
     * @dev Use a free mint (called by OpinionCore)
     * @param user Address using the free mint
     * @param opinionId Opinion ID being created
     * @return success Whether free mint was successfully used
     */
    function useFreeMint(
        address user,
        uint256 opinionId
    ) external onlyRole(OPINION_CONTRACT_ROLE) returns (bool success) {
        // Try to use referee free mint FIRST (one-time only for new users)
        ReferralData storage data = refereeData[user];
        if (data.referrer != address(0) && !data.refereeRewardClaimed) {
            data.refereeRewardClaimed = true;
            emit FreeMintUsed(user, opinionId, false, block.timestamp);
            return true;
        }
        
        // Try to use referrer free mint (accumulated from successful referrals)
        ReferrerStats storage stats = referrerStats[user];
        if (stats.availableFreeMints > 0) {
            stats.availableFreeMints--;
            emit FreeMintUsed(user, opinionId, true, block.timestamp);
            return true;
        }
        
        return false; // No free mints available
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Get referral statistics for a user
     */
    function getReferralStats(address user) external view returns (
        uint256 totalReferrals,
        uint256 availableFreeMints,
        uint256 totalFreeMints,
        uint256 referralCode,
        bool isReferred,
        address referredBy
    ) {
        ReferrerStats storage stats = referrerStats[user];
        ReferralData storage data = refereeData[user];
        
        return (
            stats.totalReferrals,
            stats.availableFreeMints,
            stats.totalFreeMints,
            referrerToCode[user],
            data.referrer != address(0),
            data.referrer
        );
    }

    /**
     * @dev Get referrer address from referral code
     */
    function getReferrerFromCode(uint256 referralCode) external view returns (address) {
        return referralCodeToReferrer[referralCode];
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Toggle referral system on/off
     */
    function setReferralSystemEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        referralSystemEnabled = enabled;
    }

    /**
     * @dev Set maximum free mints per user
     */
    function setMaxFreeMints(uint256 _maxFreeMints) external onlyRole(ADMIN_ROLE) {
        maxFreeMints = _maxFreeMints;
    }

    /**
     * @dev Grant opinion contract role to OpinionCore
     */
    function grantOpinionContractRole(address opinionContract) external onlyRole(ADMIN_ROLE) {
        _grantRole(OPINION_CONTRACT_ROLE, opinionContract);
    }

    /**
     * @dev Emergency: manually add free mints to user (for promotions)
     */
    function emergencyGrantFreeMints(
        address user,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        ReferrerStats storage stats = referrerStats[user];
        stats.availableFreeMints += amount;
        stats.totalFreeMints += amount;
    }

    // ═══════════════════════════════════════════════════════════════
    // UPGRADE AUTHORIZATION
    // ═══════════════════════════════════════════════════════════════

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
}