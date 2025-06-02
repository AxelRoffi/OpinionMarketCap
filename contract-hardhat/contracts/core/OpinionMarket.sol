// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IOpinionCore.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./structs/OpinionStructs.sol";
import "./structs/PoolStructs.sol";

/**
 * @title OpinionMarket
 * @dev Main entry point for the OpinionMarket system, coordinating between specialized contracts
 */
contract OpinionMarket is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // --- STATE VARIABLES ---
    IOpinionCore public opinionCore;
    IFeeManager public feeManager;
    IPoolManager public poolManager;
    IERC20 public usdcToken;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // --- INITIALIZATION ---
    /**
     * @dev Initializes the contract with required dependencies
     * @param _usdcToken Address of the USDC token contract
     * @param _opinionCore Address of the OpinionCore contract
     * @param _feeManager Address of the FeeManager contract
     * @param _poolManager Address of the PoolManager contract
     * @param _treasury Address of the treasury that receives platform fees
     */
    function initialize(
        address _usdcToken,
        address _opinionCore,
        address _feeManager,
        address _poolManager,
        address _treasury
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        // Validate addresses
        if (
            _usdcToken == address(0) ||
            _opinionCore == address(0) ||
            _feeManager == address(0) ||
            _poolManager == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddressNotAllowed();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);

        // Set contracts
        usdcToken = IERC20(_usdcToken);
        opinionCore = IOpinionCore(_opinionCore);
        feeManager = IFeeManager(_feeManager);
        poolManager = IPoolManager(_poolManager);
    }

    // --- UPGRADE AUTHORIZATION ---
    /**
     * @dev Authorizes contract upgrades, restricted to admin
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(ADMIN_ROLE) {}

    // --- OPINION FUNCTIONS ---
    /**
     * @dev Creates a new opinion
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (2-100 USDC)
     * @param opinionCategories Categories for the opinion (1-3 required)
     */
    function createOpinion(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories
    ) external nonReentrant whenNotPaused {
        opinionCore.createOpinion(question, answer, description, initialPrice, opinionCategories);
    }

    /**
     * @dev Creates a new opinion with IPFS hash and link
     * @param question The opinion question
     * @param answer The initial answer
     * @param description The answer description (optional, max 120 chars)
     * @param initialPrice The initial price chosen by creator (2-100 USDC)
     * @param opinionCategories Categories for the opinion (1-3 required)
     * @param ipfsHash The IPFS hash for an image
     * @param link The external URL link
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata answer,
        string calldata description,
        uint96 initialPrice,
        string[] calldata opinionCategories,
        string calldata ipfsHash,
        string calldata link
    ) external nonReentrant whenNotPaused {
        opinionCore.createOpinionWithExtras(
            question,
            answer,
            description,
            initialPrice,
            opinionCategories,
            ipfsHash,
            link
        );
    }

    /**
     * @dev Submits a new answer to an opinion
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     * @param description The answer description (optional, max 120 chars)
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer,
        string calldata description
    ) external nonReentrant whenNotPaused {
        opinionCore.submitAnswer(opinionId, answer, description);
    }

    /**
     * @dev Places a question for sale
     * @param opinionId The ID of the opinion
     * @param price The sale price
     */
    function listQuestionForSale(
        uint256 opinionId,
        uint256 price
    ) external nonReentrant whenNotPaused {
        opinionCore.listQuestionForSale(opinionId, price);
    }

    /**
     * @dev Buys a question that is for sale
     * @param opinionId The ID of the opinion
     */
    function buyQuestion(
        uint256 opinionId
    ) external nonReentrant whenNotPaused {
        opinionCore.buyQuestion(opinionId);
    }

    /**
     * @dev Cancels a question sale
     * @param opinionId The ID of the opinion
     */
    function cancelQuestionSale(
        uint256 opinionId
    ) external nonReentrant whenNotPaused {
        opinionCore.cancelQuestionSale(opinionId);
    }

    /**
     * @dev Deactivates an opinion
     * @param opinionId The ID of the opinion to deactivate
     */
    function deactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        opinionCore.deactivateOpinion(opinionId);
    }

    /**
     * @dev Reactivates a previously deactivated opinion
     * @param opinionId The ID of the opinion to reactivate
     */
    function reactivateOpinion(
        uint256 opinionId
    ) external onlyRole(MODERATOR_ROLE) {
        opinionCore.reactivateOpinion(opinionId);
    }

    // --- CATEGORIES FUNCTIONS ---
    /**
     * @dev Adds a new category to available categories
     * @param newCategory The new category to add
     */
    function addCategoryToCategories(string calldata newCategory) external onlyRole(ADMIN_ROLE) {
        opinionCore.addCategoryToCategories(newCategory);
    }

    /**
     * @dev Returns all available categories
     * @return Array of available category strings
     */
    function getAvailableCategories() external view returns (string[] memory) {
        return opinionCore.getAvailableCategories();
    }

    /**
     * @dev Returns categories for a specific opinion
     * @param opinionId The opinion ID
     * @return Array of category strings for the opinion
     */
    function getOpinionCategories(uint256 opinionId) external view returns (string[] memory) {
        return opinionCore.getOpinionCategories(opinionId);
    }

    // --- EXTENSION SLOTS FUNCTIONS ---

    /**
     * @dev Sets a string extension for an opinion (admin only)
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionStringExtension(
        uint256 opinionId, 
        string calldata key, 
        string calldata value
    ) external onlyRole(ADMIN_ROLE) {
        opinionCore.setOpinionStringExtension(opinionId, key, value);
    }

    /**
     * @dev Sets a number extension for an opinion (admin only)
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionNumberExtension(
        uint256 opinionId, 
        string calldata key, 
        uint256 value
    ) external onlyRole(ADMIN_ROLE) {
        opinionCore.setOpinionNumberExtension(opinionId, key, value);
    }

    /**
     * @dev Sets a bool extension for an opinion (admin only)
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionBoolExtension(
        uint256 opinionId, 
        string calldata key, 
        bool value
    ) external onlyRole(ADMIN_ROLE) {
        opinionCore.setOpinionBoolExtension(opinionId, key, value);
    }

    /**
     * @dev Sets an address extension for an opinion (admin only)
     * @param opinionId Opinion ID
     * @param key Extension key
     * @param value Extension value
     */
    function setOpinionAddressExtension(
        uint256 opinionId, 
        string calldata key, 
        address value
    ) external onlyRole(ADMIN_ROLE) {
        opinionCore.setOpinionAddressExtension(opinionId, key, value);
    }

    /**
     * @dev Gets all extensions for an opinion
     * @param opinionId Opinion ID
     * @return keys Array of extension keys
     * @return stringValues Array of string values
     * @return numberValues Array of number values
     * @return boolValues Array of bool values
     * @return addressValues Array of address values
     */
    function getOpinionExtensions(uint256 opinionId) external view returns (
        string[] memory keys,
        string[] memory stringValues,
        uint256[] memory numberValues,
        bool[] memory boolValues,
        address[] memory addressValues
    ) {
        return opinionCore.getOpinionExtensions(opinionId);
    }

    /**
     * @dev Gets a specific string extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionStringExtension(uint256 opinionId, string calldata key) external view returns (string memory) {
        return opinionCore.getOpinionStringExtension(opinionId, key);
    }

    /**
     * @dev Gets a specific number extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionNumberExtension(uint256 opinionId, string calldata key) external view returns (uint256) {
        return opinionCore.getOpinionNumberExtension(opinionId, key);
    }

    /**
     * @dev Gets a specific bool extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionBoolExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        return opinionCore.getOpinionBoolExtension(opinionId, key);
    }

    /**
     * @dev Gets a specific address extension for an opinion
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return value Extension value
     */
    function getOpinionAddressExtension(uint256 opinionId, string calldata key) external view returns (address) {
        return opinionCore.getOpinionAddressExtension(opinionId, key);
    }

    /**
     * @dev Checks if an opinion has a specific extension key
     * @param opinionId Opinion ID
     * @param key Extension key
     * @return exists True if the key exists
     */
    function hasOpinionExtension(uint256 opinionId, string calldata key) external view returns (bool) {
        return opinionCore.hasOpinionExtension(opinionId, key);
    }

    /**
     * @dev Gets the number of extensions for an opinion
     * @param opinionId Opinion ID
     * @return count Number of extensions
     */
    function getOpinionExtensionCount(uint256 opinionId) external view returns (uint256) {
        return opinionCore.getOpinionExtensionCount(opinionId);
    }

    /**
     * @dev Returns the total number of available categories
     * @return The count of available categories
     */
    function getCategoryCount() external view returns (uint256) {
        return opinionCore.getCategoryCount();
    }

    // --- POOL FUNCTIONS ---
    /**
     * @dev Creates a new pool
     * @param opinionId The ID of the opinion
     * @param proposedAnswer The proposed answer
     * @param deadline The pool deadline
     * @param initialContribution The initial contribution
     * @param name The pool name
     * @param ipfsHash The IPFS hash for an image
     */
    function createPool(
        uint256 opinionId,
        string calldata proposedAnswer,
        uint256 deadline,
        uint256 initialContribution,
        string calldata name,
        string calldata ipfsHash
    ) external nonReentrant whenNotPaused {
        poolManager.createPool(
            opinionId,
            proposedAnswer,
            deadline,
            initialContribution,
            name,
            ipfsHash
        );
    }

    /**
     * @dev Contributes to a pool
     * @param poolId The ID of the pool
     * @param amount The contribution amount
     */
    function contributeToPool(
        uint256 poolId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        poolManager.contributeToPool(poolId, amount);
    }

    /**
     * @dev Withdraws funds from an expired pool
     * @param poolId The ID of the pool
     */
    function withdrawFromExpiredPool(
        uint256 poolId
    ) external nonReentrant whenNotPaused {
        poolManager.withdrawFromExpiredPool(poolId);
    }

    /**
     * @dev Extends a pool deadline
     * @param poolId The ID of the pool
     * @param newDeadline The new deadline
     */
    function extendPoolDeadline(
        uint256 poolId,
        uint256 newDeadline
    ) external nonReentrant whenNotPaused {
        poolManager.extendPoolDeadline(poolId, newDeadline);
    }

    /**
     * @dev Allows contributor to withdraw early from pool with 20% penalty (SECURITY FIX)
     * @param poolId Pool ID to withdraw from
     */
    function withdrawFromPoolEarly(uint256 poolId) external nonReentrant whenNotPaused {
        poolManager.withdrawFromPoolEarly(poolId);
    }

    /**
     * @dev Preview early withdrawal amounts for a user (SECURITY FIX)
     * @param poolId Pool ID
     * @param user User address
     * @return userContribution Current user contribution
     * @return penalty Total penalty amount (20% - enhanced)
     * @return userWillReceive Amount user will receive (80%)
     * @return canWithdraw Whether withdrawal is currently possible
     */
    function getEarlyWithdrawalPreview(uint256 poolId, address user) external view returns (
        uint96 userContribution,
        uint96 penalty,
        uint96 userWillReceive,
        bool canWithdraw
    ) {
        return poolManager.getEarlyWithdrawalPreview(poolId, user);
    }

    /**
     * @dev Get detailed penalty breakdown for early withdrawal (SECURITY FIX)
     * @param poolId Pool ID  
     * @param user User address
     * @return userContribution Current user contribution
     * @return totalPenalty Total penalty (20% - enhanced)
     * @return treasuryReceives Treasury receives (100% of penalty)
     * @return userReceives Amount user receives (80%)
     */
    function getEarlyWithdrawalBreakdown(uint256 poolId, address user) external view returns (
        uint96 userContribution,
        uint96 totalPenalty,
        uint96 treasuryReceives,
        uint96 userReceives
    ) {
        return poolManager.getEarlyWithdrawalBreakdown(poolId, user);
    }

    /**
     * @dev Check if early withdrawal is possible for a user
     * @param poolId Pool ID
     * @param user User address
     * @return possible Whether early withdrawal is possible
     * @return reason Reason if not possible (0=possible, 1=invalid_pool, 2=not_active, 3=deadline_passed, 4=no_contribution)
     */
    function canWithdrawEarly(uint256 poolId, address user) external view returns (bool possible, uint8 reason) {
        return poolManager.canWithdrawEarly(poolId, user);
    }

    // --- FEE FUNCTIONS ---
    /**
     * @dev Allows users to claim their accumulated fees
     */
    function claimAccumulatedFees() external nonReentrant whenNotPaused {
        feeManager.claimAccumulatedFees();
    }

    /**
     * @dev Withdraws platform fees, restricted to TREASURY_ROLE
     * @param token Token to withdraw
     * @param recipient Address to send tokens to
     */
    function withdrawPlatformFees(
        address token,
        address recipient
    ) external nonReentrant onlyRole(TREASURY_ROLE) {
        feeManager.withdrawPlatformFees(token, recipient);
    }

    // --- VIEW FUNCTIONS ---
    /**
     * @dev Returns the answer history for an opinion
     * @param opinionId The ID of the opinion
     * @return History array of answers
     */
    function getAnswerHistory(
        uint256 opinionId
    ) external view returns (OpinionStructs.AnswerHistory[] memory) {
        return opinionCore.getAnswerHistory(opinionId);
    }

    /**
     * @dev Returns the next price for submitting an answer
     * @param opinionId The ID of the opinion
     * @return The next price
     */
    function getNextPrice(uint256 opinionId) external view returns (uint256) {
        return opinionCore.getNextPrice(opinionId);
    }

    /**
     * @dev Returns detailed information about an opinion
     * @param opinionId The ID of the opinion
     * @return Opinion details
     */
    function getOpinionDetails(
        uint256 opinionId
    ) external view returns (OpinionStructs.Opinion memory) {
        return opinionCore.getOpinionDetails(opinionId);
    }

    /**
     * @dev Returns detailed information about a pool
     * @param poolId The ID of the pool
     * @return info Pool details
     * @return currentPrice Current price to execute the pool
     * @return remainingAmount Amount needed to reach execution price
     * @return timeRemaining Time until pool expiration
     */
    function getPoolDetails(
        uint256 poolId
    )
        external
        view
        returns (
            PoolStructs.PoolInfo memory info,
            uint256 currentPrice,
            uint256 remainingAmount,
            uint256 timeRemaining
        )
    {
        return poolManager.getPoolDetails(poolId);
    }

    /**
     * @dev Returns all contributor addresses for a pool
     * @param poolId The ID of the pool
     * @return Array of contributor addresses
     */
    function getPoolContributors(
        uint256 poolId
    ) external view returns (address[] memory) {
        return poolManager.getPoolContributors(poolId);
    }

    /**
     * @dev Returns accumulated fees for a user
     * @param user User address
     * @return Accumulated fees
     */
    function getAccumulatedFees(address user) external view returns (uint96) {
        return feeManager.getAccumulatedFees(user);
    }

    /**
     * @dev Returns total accumulated fees
     * @return Total accumulated fees
     */
    function getTotalAccumulatedFees() external view returns (uint96) {
        return feeManager.getTotalAccumulatedFees();
    }

    // --- ADMIN FUNCTIONS ---
    /**
     * @dev Updates the OpinionCore contract address
     * @param _opinionCore New OpinionCore address
     */
    function setOpinionCore(
        address _opinionCore
    ) external onlyRole(ADMIN_ROLE) {
        if (_opinionCore == address(0)) revert ZeroAddressNotAllowed();
        opinionCore = IOpinionCore(_opinionCore);
        emit ContractAddressUpdated(0, _opinionCore);
    }

    /**
     * @dev Updates the FeeManager contract address
     * @param _feeManager New FeeManager address
     */
    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        if (_feeManager == address(0)) revert ZeroAddressNotAllowed();
        feeManager = IFeeManager(_feeManager);
        emit ContractAddressUpdated(1, _feeManager);
    }

    /**
     * @dev Updates the PoolManager contract address
     * @param _poolManager New PoolManager address
     */
    function setPoolManager(
        address _poolManager
    ) external onlyRole(ADMIN_ROLE) {
        if (_poolManager == address(0)) revert ZeroAddressNotAllowed();
        poolManager = IPoolManager(_poolManager);
        emit ContractAddressUpdated(2, _poolManager);
    }

    /**
     * @dev Toggles public creation of opinions
     */
    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        // Call the OpinionCore contract
        (bool success, ) = address(opinionCore).call(
            abi.encodeWithSignature("togglePublicCreation()")
        );
        require(success, "Failed to toggle public creation");
    }

    // --- TREASURY MANAGEMENT ---
    /**
     * @dev Sets a new treasury address with timelock protection in OpinionCore
     * @param newTreasury The new treasury address to set after timelock
     */
    function setTreasuryOpinionCore(address newTreasury) external onlyRole(ADMIN_ROLE) {
        (bool success, ) = address(opinionCore).call(
            abi.encodeWithSignature("setTreasury(address)", newTreasury)
        );
        require(success, "Failed to set treasury in OpinionCore");
    }

    /**
     * @dev Confirms the treasury change after timelock period in OpinionCore
     */
    function confirmTreasuryChangeOpinionCore() external onlyRole(ADMIN_ROLE) {
        (bool success, ) = address(opinionCore).call(
            abi.encodeWithSignature("confirmTreasuryChange()")
        );
        require(success, "Failed to confirm treasury change in OpinionCore");
    }

    /**
     * @dev Sets a new treasury address with timelock protection in FeeManager
     * @param newTreasury The new treasury address to set after timelock
     */
    function setTreasuryFeeManager(address newTreasury) external onlyRole(ADMIN_ROLE) {
        (bool success, ) = address(feeManager).call(
            abi.encodeWithSignature("setTreasury(address)", newTreasury)
        );
        require(success, "Failed to set treasury in FeeManager");
    }

    /**
     * @dev Confirms the treasury change after timelock period in FeeManager
     */
    function confirmTreasuryChangeFeeManager() external onlyRole(ADMIN_ROLE) {
        (bool success, ) = address(feeManager).call(
            abi.encodeWithSignature("confirmTreasuryChange()")
        );
        require(success, "Failed to confirm treasury change in FeeManager");
    }

    /**
     * @dev Pauses all contracts
     */
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();

        // Try to pause all component contracts
        (bool success1, ) = address(opinionCore).call(
            abi.encodeWithSignature("pause()")
        );
        (bool success2, ) = address(feeManager).call(
            abi.encodeWithSignature("pause()")
        );
        (bool success3, ) = address(poolManager).call(
            abi.encodeWithSignature("pause()")
        );

        // Continue even if some fail (they might not all have pause functionality)
    }

    /**
     * @dev Unpauses all contracts
     */
    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();

        // Try to unpause all component contracts
        (bool success1, ) = address(opinionCore).call(
            abi.encodeWithSignature("unpause()")
        );
        (bool success2, ) = address(feeManager).call(
            abi.encodeWithSignature("unpause()")
        );
        (bool success3, ) = address(poolManager).call(
            abi.encodeWithSignature("unpause()")
        );

        // Continue even if some fail
    }

    /**
     * @dev Emergency withdraw from all contracts
     * @param token Token to withdraw
     */
    function emergencyWithdraw(
        address token
    ) external nonReentrant whenPaused onlyRole(ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddressNotAllowed();

        // Withdraw from OpinionCore
        (bool success1, ) = address(opinionCore).call(
            abi.encodeWithSignature("emergencyWithdraw(address)", token)
        );

        // Withdraw from FeeManager
        (bool success2, ) = address(feeManager).call(
            abi.encodeWithSignature("emergencyWithdraw(address)", token)
        );

        // Withdraw from PoolManager
        (bool success3, ) = address(poolManager).call(
            abi.encodeWithSignature("emergencyWithdraw(address)", token)
        );

        // Withdraw from this contract
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        if (balance > 0) {
            tokenContract.safeTransfer(msg.sender, balance);
        }

        emit AdminAction(0, msg.sender, bytes32(0), balance);
    }
}
