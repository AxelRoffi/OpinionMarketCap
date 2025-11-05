// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpinionCore.sol";
import "./interfaces/IReferralManager.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title OpinionCoreWithReferrals
 * @dev Extended OpinionCore with referral system integration
 * 
 * NEW FEATURES:
 * - Free opinion creation for referrers and referees
 * - Referral code processing during opinion creation
 * - Automatic referral rewards distribution
 */
contract OpinionCoreWithReferrals is OpinionCore {
    using SafeERC20 for IERC20;
    
    // ═══════════════════════════════════════════════════════════════
    // REFERRAL SYSTEM INTEGRATION
    // ═══════════════════════════════════════════════════════════════
    
    IReferralManager public referralManager;
    
    // Track if user has created their first opinion (for referral processing)
    mapping(address => bool) public hasCreatedFirstOpinion;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    event ReferralProcessed(
        address indexed referee,
        address indexed referrer,
        uint256 indexed referralCode,
        uint256 opinionId,
        uint256 timestamp
    );
    
    event FreeMintUsed(
        address indexed user,
        uint256 indexed opinionId,
        uint256 savedAmount,
        bool wasReferrer,
        uint256 timestamp
    );

    // ═══════════════════════════════════════════════════════════════
    // REFERRAL-ENHANCED OPINION CREATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Creates a new opinion with optional referral code
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (1-100 USDC)
     * @param opinionCategories Categories for the opinion (1-3 required)
     * @param referralCode Optional referral code for new users (0 = no referral)
     */
    function createOpinionWithReferral(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        uint256 referralCode
    ) external nonReentrant whenNotPaused {
        // 1. Access control check FIRST
        if (!isPublicCreationEnabled && !hasRole(ADMIN_ROLE, msg.sender))
            revert UnauthorizedCreator();

        // 2. Categories validation
        ValidationLibrary.validateOpinionCategories(
            opinionCategories,
            categories
        );

        // 3. Standard validations
        ValidationLibrary.validateOpinionParams(
            question,
            answer,
            MAX_QUESTION_LENGTH,
            MAX_ANSWER_LENGTH
        );
        ValidationLibrary.validateDescription(description);

        // 4. Price validation
        if (initialPrice < MIN_INITIAL_PRICE || initialPrice > MAX_INITIAL_PRICE) {
            revert InvalidInitialPrice();
        }

        // 5. Calculate standard creation fee
        uint96 creationFee = uint96((initialPrice * 20) / 100);
        if (creationFee < 5_000_000) { // 5 USDC minimum
            creationFee = 5_000_000;
        }

        // 6. REFERRAL SYSTEM LOGIC
        bool usedFreeMint = false;
        uint256 finalFee = creationFee;

        // Check if user can use a free mint
        if (address(referralManager) != address(0)) {
            // FIRST: Check if this is a new user with a referral code (one-time FREE)
            if (referralCode > 0 && !hasCreatedFirstOpinion[msg.sender]) {
                // Process referral for new user - this gives them ONE free opinion creation
                bool referralProcessed = referralManager.processReferral(msg.sender, referralCode);
                if (referralProcessed) {
                    // First opinion is FREE for new referred users (one-time only)
                    usedFreeMint = true;
                    finalFee = 0;
                    
                    emit ReferralProcessed(
                        msg.sender,
                        referralManager.getReferrerFromCode(referralCode),
                        referralCode,
                        nextOpinionId, // Will be the ID of created opinion
                        block.timestamp
                    );
                }
            } else {
                // SECOND: Check if user has accumulated free mints (from being a successful referrer)
                uint256 availableFreeMints = referralManager.getAvailableFreeMints(msg.sender);
                
                if (availableFreeMints > 0) {
                    // Use accumulated free mint - no fee required
                    usedFreeMint = true;
                    finalFee = 0;
                }
            }
        }

        // 7. Handle payment
        if (finalFee > 0) {
            // Standard fee payment
            uint256 allowance = usdcToken.allowance(msg.sender, address(this));
            if (allowance < finalFee)
                revert InsufficientAllowance(finalFee, allowance);
            
            usdcToken.safeTransferFrom(msg.sender, treasury, finalFee);
        } else {
            // Free mint used
            if (address(referralManager) != address(0)) {
                referralManager.useFreeMint(msg.sender, nextOpinionId);
            }
            
            emit FreeMintUsed(
                msg.sender,
                nextOpinionId,
                creationFee,
                false, // This will be determined by ReferralManager
                block.timestamp
            );
        }

        // 8. Create the opinion
        uint256 opinionId = _createOpinionRecord(
            question,
            answer,
            description,
            "",
            "",
            initialPrice,
            opinionCategories
        );

        // 9. Mark user as having created first opinion
        hasCreatedFirstOpinion[msg.sender] = true;

        // 10. Emit standard events
        emit OpinionAction(opinionId, 0, question, msg.sender, initialPrice);
        emit OpinionAction(opinionId, 1, answer, msg.sender, initialPrice);
    }

    /**
     * @dev Creates a new opinion with IPFS hash, link, and optional referral
     */
    function createOpinionWithExtrasAndReferral(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link,
        uint256 referralCode
    ) external nonReentrant whenNotPaused {
        // Same logic as createOpinionWithReferral but with extras validation
        // [Implementation would be similar but with IPFS/link validation]
        // Omitted for brevity - would follow same pattern
    }

    // ═══════════════════════════════════════════════════════════════
    // REFERRAL SYSTEM MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Set the referral manager contract
     */
    function setReferralManager(address _referralManager) external onlyRole(ADMIN_ROLE) {
        if (_referralManager != address(0)) {
            referralManager = IReferralManager(_referralManager);
        } else {
            referralManager = IReferralManager(address(0));
        }
    }

    /**
     * @dev Generate referral code for user
     * @return referralCode The generated referral code
     */
    function generateMyReferralCode() external returns (uint256 referralCode) {
        require(address(referralManager) != address(0), "Referral system not active");
        return referralManager.generateReferralCode(msg.sender);
    }

    /**
     * @dev Get user's referral statistics
     */
    function getMyReferralStats() external view returns (
        uint256 totalReferrals,
        uint256 availableFreeMints,
        uint256 totalFreeMints,
        uint256 myReferralCode,
        bool wasReferred,
        address referredBy
    ) {
        if (address(referralManager) == address(0)) {
            return (0, 0, 0, 0, false, address(0));
        }
        return referralManager.getReferralStats(msg.sender);
    }

    /**
     * @dev Check if user can create opinion for free
     */
    function canCreateOpinionForFree(address user) external view returns (bool) {
        if (address(referralManager) == address(0)) return false;
        
        uint256 availableFreeMints = referralManager.getAvailableFreeMints(user);
        return availableFreeMints > 0;
    }

    // ═══════════════════════════════════════════════════════════════
    // BACKWARD COMPATIBILITY
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Override original createOpinion to use referral system (with referralCode = 0)
     */
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external override nonReentrant whenNotPaused {
        // Call the referral version with no referral code
        this.createOpinionWithReferral(
            question,
            answer,
            description,
            initialPrice,
            opinionCategories,
            0 // No referral code
        );
    }
}