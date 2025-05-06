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
     */
    function initialize(
        address _usdcToken,
        address _opinionCore,
        address _feeManager,
        address _poolManager
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
            _poolManager == address(0)
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
     * @param initialAnswer The initial answer
     */
    function createOpinion(
        string calldata question,
        string calldata initialAnswer
    ) external nonReentrant whenNotPaused {
        opinionCore.createOpinion(question, initialAnswer);
    }

    /**
     * @dev Creates a new opinion with IPFS hash and link
     * @param question The opinion question
     * @param initialAnswer The initial answer
     * @param ipfsHash The IPFS hash for an image
     * @param link The external URL link
     */
    function createOpinionWithExtras(
        string calldata question,
        string calldata initialAnswer,
        string calldata ipfsHash,
        string calldata link
    ) external nonReentrant whenNotPaused {
        opinionCore.createOpinionWithExtras(
            question,
            initialAnswer,
            ipfsHash,
            link
        );
    }

    /**
     * @dev Submits a new answer to an opinion
     * @param opinionId The ID of the opinion
     * @param answer The new answer
     */
    function submitAnswer(
        uint256 opinionId,
        string calldata answer
    ) external nonReentrant whenNotPaused {
        opinionCore.submitAnswer(opinionId, answer);
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
