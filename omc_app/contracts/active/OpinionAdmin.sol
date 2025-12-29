// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IOpinionAdminInternal.sol";
import "./interfaces/IOpinionCoreInternal.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./interfaces/IFeeManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IMonitoringManager.sol";
import "./interfaces/ISecurityManager.sol";

/**
 * @title OpinionAdmin
 * @dev Administrative functions and parameter management - Size optimized (~6KB)
 */
contract OpinionAdmin is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    IOpinionAdminInternal,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant CORE_CONTRACT_ROLE = keccak256("CORE_CONTRACT_ROLE");

    // --- CONSTANTS ---
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;

    // --- STATE VARIABLES ---
    IOpinionCoreInternal public coreContract;
    IERC20 public usdcToken;
    
    // Treasury management
    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;

    // System settings
    bool public isPublicCreationEnabled;
    uint96 public maxInitialPrice;

    // --- MODIFIERS ---
    modifier onlyCoreContract() {
        if (!hasRole(CORE_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(msg.sender, CORE_CONTRACT_ROLE);
        _;
    }

    // --- INITIALIZATION ---
    function initialize(
        address _coreContract,
        address _usdcToken,
        address _treasury,
        address _admin
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MODERATOR_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _admin);
        _grantRole(CORE_CONTRACT_ROLE, _coreContract);

        coreContract = IOpinionCoreInternal(_coreContract);
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;

        // Initialize settings
        isPublicCreationEnabled = true;
        maxInitialPrice = 100_000_000; // 100 USDC
    }

    // --- PARAMETER MANAGEMENT ---

    function setMinimumPrice(uint96 _minimumPrice) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameter(0, _minimumPrice);
        emit ParameterUpdated(0, _minimumPrice);
    }

    function setQuestionCreationFee(uint96 _questionCreationFee) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameter(1, _questionCreationFee);
        emit ParameterUpdated(1, _questionCreationFee);
    }

    function setInitialAnswerPrice(uint96 _initialAnswerPrice) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameter(2, _initialAnswerPrice);
        emit ParameterUpdated(2, _initialAnswerPrice);
    }

    function setMaxPriceChange(uint256 _maxPriceChange) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameter(3, _maxPriceChange);
        emit ParameterUpdated(3, _maxPriceChange);
    }

    function setMaxTradesPerBlock(uint256 _maxTradesPerBlock) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameter(4, _maxTradesPerBlock);
        emit ParameterUpdated(4, _maxTradesPerBlock);
    }

    function setMaxInitialPrice(uint96 _maxInitialPrice) external onlyRole(ADMIN_ROLE) {
        require(_maxInitialPrice >= 1_000_000, "Below minimum"); // At least 1 USDC
        maxInitialPrice = _maxInitialPrice;
        coreContract.updateCoreParameter(5, _maxInitialPrice);
        emit ParameterUpdated(5, _maxInitialPrice);
    }

    function togglePublicCreation() external onlyRole(ADMIN_ROLE) {
        isPublicCreationEnabled = !isPublicCreationEnabled;
        emit AdminAction(1, msg.sender, bytes32(0), 0);
    }

    // --- CONTRACT MANAGEMENT ---

    function setFeeManager(address _feeManager) external onlyRole(ADMIN_ROLE) {
        require(_feeManager != address(0), "Zero address");
        coreContract.updateCoreParameterAddress(0, _feeManager);
        emit AdminAction(2, msg.sender, bytes32(uint256(uint160(_feeManager))), 0);
    }

    function setPoolManager(address _poolManager) external onlyRole(ADMIN_ROLE) {
        require(_poolManager != address(0), "Zero address");
        coreContract.updateCoreParameterAddress(1, _poolManager);
        emit AdminAction(3, msg.sender, bytes32(uint256(uint160(_poolManager))), 0);
    }

    function setMonitoringManager(address _monitoringManager) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameterAddress(2, _monitoringManager);
        emit AdminAction(4, msg.sender, bytes32(uint256(uint160(_monitoringManager))), 0);
    }

    function setSecurityManager(address _securityManager) external onlyRole(ADMIN_ROLE) {
        coreContract.updateCoreParameterAddress(3, _securityManager);
        emit AdminAction(5, msg.sender, bytes32(uint256(uint160(_securityManager))), 0);
    }

    function grantMarketContractRole(address _contract) external onlyRole(ADMIN_ROLE) {
        // Note: This would need to be implemented in core contract
        emit AdminAction(6, msg.sender, bytes32(uint256(uint160(_contract))), 1);
    }

    function revokeMarketContractRole(address _contract) external onlyRole(ADMIN_ROLE) {
        // Note: This would need to be implemented in core contract
        emit AdminAction(6, msg.sender, bytes32(uint256(uint160(_contract))), 0);
    }

    // --- TREASURY MANAGEMENT ---

    function setTreasury(address _treasury) external onlyRole(TREASURY_ROLE) {
        require(_treasury != address(0), "Zero address");
        
        pendingTreasury = _treasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;
        
        emit AdminAction(10, msg.sender, bytes32(uint256(uint160(_treasury))), treasuryChangeTimestamp);
    }

    function confirmTreasuryChange() external onlyRole(TREASURY_ROLE) {
        require(pendingTreasury != address(0), "No pending change");
        require(block.timestamp >= treasuryChangeTimestamp, "Too early");
        
        address oldTreasury = treasury;
        treasury = pendingTreasury;
        
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;
        
        emit TreasuryUpdated(oldTreasury, treasury, msg.sender, block.timestamp);
    }

    // --- SYSTEM CONTROLS ---

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Zero address");
        
        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // Withdraw ERC20
            IERC20(token).safeTransfer(to, amount);
        }
        
        emit EmergencyWithdrawal(token, to, amount, block.timestamp);
    }

    // --- MODERATION FUNCTIONS (STUBS) ---

    function deactivateOpinion(uint256 opinionId) external onlyRole(MODERATOR_ROLE) {
        // Could implement opinion deactivation logic here
        emit AdminAction(20, msg.sender, bytes32(opinionId), 0);
    }
    
    function reactivateOpinion(uint256 opinionId) external onlyRole(MODERATOR_ROLE) {
        // Could implement opinion reactivation logic here
        emit AdminAction(21, msg.sender, bytes32(opinionId), 1);
    }

    function moderateAnswer(uint256 opinionId, string calldata reason) external onlyRole(MODERATOR_ROLE) {
        // Could implement answer moderation logic here
        emit AnswerModerated(opinionId, msg.sender, address(0), reason, block.timestamp);
    }

    // --- INTERNAL INTERFACE IMPLEMENTATION ---

    function validateAdminAccess(address caller) external view onlyCoreContract returns (bool) {
        return hasRole(ADMIN_ROLE, caller);
    }

    function validateModeratorAccess(address caller) external view onlyCoreContract returns (bool) {
        return hasRole(MODERATOR_ROLE, caller);
    }

    function notifyParameterChange(uint8 paramType, uint256 newValue) external onlyCoreContract {
        emit ParameterUpdated(paramType, newValue);
    }

    function notifyAddressChange(uint8 paramType, address newAddress) external onlyCoreContract {
        emit AdminAction(paramType, msg.sender, bytes32(uint256(uint160(newAddress))), 0);
    }

    function isSystemPaused() external view onlyCoreContract returns (bool) {
        return paused();
    }

    function getTreasury() external view returns (address) {
        return treasury;
    }

    function isPendingTreasuryChange() external view onlyCoreContract returns (bool) {
        return pendingTreasury != address(0);
    }

    // --- VIEW FUNCTIONS ---

    function getSystemStatus() external view returns (
        bool _isPaused,
        bool _isPublicCreationEnabled,
        address _treasury,
        address _pendingTreasury,
        uint256 _treasuryChangeTimestamp
    ) {
        return (
            paused(),
            isPublicCreationEnabled,
            treasury,
            pendingTreasury,
            treasuryChangeTimestamp
        );
    }

    function getMaxInitialPrice() external view returns (uint96) {
        return maxInitialPrice;
    }

    // --- RECEIVE FUNCTION ---
    receive() external payable {
        // Allow contract to receive ETH for emergency operations
    }
}