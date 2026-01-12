// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "./interfaces/IFeeManager.sol";
import "./interfaces/IOpinionMarketEvents.sol";
import "./interfaces/IOpinionMarketErrors.sol";
import "./structs/OpinionStructs.sol";
import "./libraries/FeeCalculator.sol";

/**
 * @title FeeManager
 * @dev Manages all fee-related operations including calculation, accumulation, and distribution
 */
contract FeeManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IFeeManager,
    IOpinionMarketEvents,
    IOpinionMarketErrors
{
    using SafeERC20 for IERC20;

    // --- ROLES ---
    /**
     * @dev Administrative role for the fee system
     * Accounts with this role can:
     * - Update fee percentages and parameters
     * - Configure cooldown periods for withdrawals
     * - Set MEV protection parameters
     * - Update price impact thresholds
     * - Configure any fee-related system settings
     * - Grant or revoke other roles in this contract
     */
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev Treasury operations role
     * Accounts with this role can:
     * - Withdraw accumulated protocol fees to the treasury
     * - View fee statistics and accumulated amounts
     * - Cannot modify fee parameters (requires ADMIN_ROLE)
     * - Typically assigned to multi-sig wallet or DAO treasury
     */
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /**
     * @dev Role exclusively for the OpinionCore contract
     * This role allows OpinionCore to:
     * - Register fees collected from opinion creation
     * - Register fees collected from opinion interactions
     * - Update MEV protection data
     * - Access fee calculation functions
     * - Cannot withdraw funds (requires TREASURY_ROLE)
     * - Should ONLY be granted to the OpinionCore contract address
     */
    bytes32 public constant CORE_CONTRACT_ROLE =
        keccak256("CORE_CONTRACT_ROLE");

    // --- STATE VARIABLES ---
    IERC20 public usdcToken;
    address public treasury;
    address public pendingTreasury;
    uint256 public treasuryChangeTimestamp;
    uint256 public constant TREASURY_CHANGE_DELAY = 48 hours;

    // Fee parameters
    uint8 public platformFeePercent;
    uint8 public creatorFeePercent;
    uint8 public mevPenaltyPercent;
    uint32 public rapidTradeWindow;

    // Fee accumulation tracking
    mapping(address => uint96) public accumulatedFees;
    uint96 public totalAccumulatedFees;

    // MEV protection tracking
    mapping(address => mapping(uint256 => uint32)) public userLastTradeTime;
    mapping(address => mapping(uint256 => uint96)) public userLastTradePrice;

    // Parameter update cooldowns
    mapping(uint8 => uint32) public lastParameterUpdate;
    uint32 public parameterUpdateCooldown;

    // Maximum parameter values
    uint8 public constant MAX_PLATFORM_FEE_PERCENT = 10;
    uint8 public constant MAX_CREATOR_FEE_PERCENT = 10;
    uint8 public constant MAX_MEV_PENALTY_PERCENT = 50;
    uint32 public constant MAX_RAPID_TRADE_WINDOW = 5 minutes;

    // --- EVENTS ---
    event FeeParameterUpdated(uint8 paramId, uint256 newValue);
    event FeesAccumulated(
        address indexed recipient,
        uint96 amount,
        uint96 newTotal
    );
    event FeesWithdrawn(
        address indexed token,
        address indexed recipient,
        uint96 amount
    );

    // --- INITIALIZATION ---
    /**
     * @dev Initializes the contract with default fee parameters
     * @param _usdcToken Address of the USDC token contract
     */

    /**
     * @dev Initializes the contract with default fee parameters
     * @param _usdcToken Address of the USDC token contract
     * @param _treasury Address of the treasury that receives platform fees
     */
    function initialize(
        address _usdcToken,
        address _treasury // 🆕 NOUVEAU PARAMÈTRE
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);

        // Initialize fee parameters
        platformFeePercent = 2; // 2%
        creatorFeePercent = 3; // 3%
        mevPenaltyPercent = 0; // 0% - MEV protection disabled
        rapidTradeWindow = 30 seconds;
        parameterUpdateCooldown = 1 days;

        // Set USDC token and treasury
        if (_usdcToken == address(0) || _treasury == address(0))
            revert ZeroAddressNotAllowed();

        usdcToken = IERC20(_usdcToken);
        treasury = _treasury; // 🆕 SET TREASURY
    }

    // --- MODIFIER ---
    /**
     * @dev Ensures only approved contracts can call certain functions
     */
    modifier onlyCoreContract() {
        if (!hasRole(CORE_CONTRACT_ROLE, msg.sender))
            revert AccessControlUnauthorizedAccount(
                msg.sender,
                CORE_CONTRACT_ROLE
            );
        _;
    }

    // --- EXTERNAL FUNCTIONS ---
    /**
     * @dev Accumulates fees for a recipient
     * @param recipient Address to accumulate fees for
     * @param amount Amount of fees to accumulate
     */
    function accumulateFee(
        address recipient,
        uint96 amount
    ) external override onlyCoreContract {
        if (recipient == address(0)) revert ZeroAddressNotAllowed();
        if (amount == 0) return;

        accumulatedFees[recipient] += amount;
        totalAccumulatedFees += amount;

        emit FeesAccumulated(recipient, amount, accumulatedFees[recipient]);
        emit FeesAction(0, 1, recipient, amount, 0, 0, 0);
    }

    /**
     * @dev Allows users to claim their accumulated fees
     */
    function claimAccumulatedFees()
        external
        override
        nonReentrant
        whenNotPaused
    {
        uint96 amount = accumulatedFees[msg.sender];
        if (amount == 0) revert NoFeesToClaim();

        // Reset fees before transfer (checks-effects-interactions pattern)
        accumulatedFees[msg.sender] = 0;
        totalAccumulatedFees -= amount;

        // Transfer fees
        usdcToken.safeTransfer(msg.sender, amount);

        emit FeesAction(0, 2, msg.sender, amount, 0, 0, 0);
    }

    /**
     * @dev Sets a new treasury address with timelock protection
     * @param newTreasury The new treasury address to set after timelock
     */
    function setTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddressNotAllowed();
        
        pendingTreasury = newTreasury;
        treasuryChangeTimestamp = block.timestamp + TREASURY_CHANGE_DELAY;
        
        emit TreasuryUpdated(treasury, newTreasury, msg.sender, block.timestamp);
    }

    /**
     * @dev Confirms the treasury change after timelock period has elapsed
     */
    function confirmTreasuryChange() external onlyRole(ADMIN_ROLE) {
        if (block.timestamp < treasuryChangeTimestamp) 
            revert("Treasury: Timelock not elapsed");
        if (pendingTreasury == address(0)) 
            revert("Treasury: No pending treasury");
        
        address oldTreasury = treasury;
        treasury = pendingTreasury;
        pendingTreasury = address(0);
        treasuryChangeTimestamp = 0;
        
        emit TreasuryUpdated(oldTreasury, treasury, msg.sender, block.timestamp);
    }

    /**
     * @dev Withdraws platform fees, restricted to TREASURY_ROLE
     * @param token Token to withdraw
     * @param recipient Address to send tokens to (must be treasury)
     */
    function withdrawPlatformFees(
        address token,
        address recipient
    ) external override nonReentrant onlyRole(TREASURY_ROLE) {
        if (token == address(0) || recipient == address(0))
            revert ZeroAddressNotAllowed();
        if (recipient != treasury) 
            revert("Recipient must be treasury");

        IERC20 tokenContract = IERC20(token);
        uint96 balance = uint96(tokenContract.balanceOf(address(this)));

        // Don't withdraw accumulated fees that belong to users
        if (token == address(usdcToken)) {
            if (balance <= totalAccumulatedFees)
                revert("No platform fees to withdraw");
            balance -= totalAccumulatedFees;
        }

        tokenContract.safeTransfer(recipient, balance);

        emit FeesWithdrawn(token, recipient, balance);
        emit AdminAction(0, msg.sender, bytes32(0), balance);
    }

    /**
     * @dev Calculates fees for a given price
     * @param price Price to calculate fees for
     * @return FeeDistribution struct with fee breakdown
     */
    function calculateFees(
        uint256 price
    ) external view override returns (OpinionStructs.FeeDistribution memory) {
        FeeCalculator.FeeParams memory params = FeeCalculator.FeeParams({
            platformFeePercent: platformFeePercent,
            creatorFeePercent: creatorFeePercent,
            mevPenaltyPercent: mevPenaltyPercent,
            rapidTradeWindow: rapidTradeWindow
        });

        return FeeCalculator.calculateFees(price, params);
    }

    /**
     * @dev Calculates fee distribution for a given price
     * @param price Price to calculate fee distribution for
     * @return platformFee Platform fee amount
     * @return creatorFee Creator fee amount
     * @return ownerAmount Owner amount
     */
    function calculateFeeDistribution(
        uint256 price
    )
        external
        view
        override
        returns (uint96 platformFee, uint96 creatorFee, uint96 ownerAmount)
    {
        FeeCalculator.FeeParams memory params = FeeCalculator.FeeParams({
            platformFeePercent: platformFeePercent,
            creatorFeePercent: creatorFeePercent,
            mevPenaltyPercent: mevPenaltyPercent,
            rapidTradeWindow: rapidTradeWindow
        });

        OpinionStructs.FeeDistribution memory fees = FeeCalculator
            .calculateFees(price, params);
        return (fees.platformFee, fees.creatorFee, fees.ownerAmount);
    }

    /**
     * @dev Applies MEV penalty to fees
     * @param price Transaction price
     * @param ownerAmount Initial owner amount
     * @param trader Trader address
     * @param opinionId Opinion ID
     * @return adjustedPlatformFee Adjusted platform fee
     * @return adjustedOwnerAmount Adjusted owner amount
     */
    function applyMEVPenalty(
        uint96 price,
        uint96 ownerAmount,
        address trader,
        uint256 opinionId
    )
        external
        view
        override
        returns (uint96 adjustedPlatformFee, uint96 adjustedOwnerAmount)
    {
        // Calculate standard fees
        uint96 platformFee = uint96((price * platformFeePercent) / 100);
        uint96 creatorFee = uint96((price * creatorFeePercent) / 100);

        // Create the fee distribution structure
        OpinionStructs.FeeDistribution memory fees = OpinionStructs
            .FeeDistribution({
                platformFee: platformFee,
                creatorFee: creatorFee,
                ownerAmount: ownerAmount
            });

        // Setup fee parameters
        FeeCalculator.FeeParams memory params = FeeCalculator.FeeParams({
            platformFeePercent: platformFeePercent,
            creatorFeePercent: creatorFeePercent,
            mevPenaltyPercent: mevPenaltyPercent,
            rapidTradeWindow: rapidTradeWindow
        });

        // Apply MEV penalty
        uint256 lastTradeTime = userLastTradeTime[trader][opinionId];
        uint96 lastTradePrice = userLastTradePrice[trader][opinionId];

        fees = FeeCalculator.applyMEVPenalty(
            fees,
            price,
            lastTradeTime,
            block.timestamp,
            lastTradePrice,
            params
        );

        return (fees.platformFee, fees.ownerAmount);
    }

    /**
     * @dev Handles pool creation fee
     * @param opinionId Opinion ID
     * @param poolId Pool ID
     * @param fee Fee amount
     */
    function handlePoolCreationFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external override onlyCoreContract {
        // Split creation fee equally between platform and opinion creator
        uint96 platformShare = fee / 2;
        uint96 creatorShare = fee - platformShare;

        address opinionCreator = getCreatorForOpinion(opinionId);

        // Transfer platform share (kept in contract)
        // Platform share will be withdrawn later by treasury

        // Accumulate creator share
        if (opinionCreator != address(0)) {
            accumulatedFees[opinionCreator] += creatorShare;
            totalAccumulatedFees += creatorShare;

            emit FeesAccumulated(
                opinionCreator,
                creatorShare,
                accumulatedFees[opinionCreator]
            );
            emit FeesAction(0, 1, opinionCreator, creatorShare, 0, 0, 0);
        }
    }

    /**
     * @dev Handles contribution fee
     * @param opinionId Opinion ID
     * @param poolId Pool ID
     * @param fee Fee amount
     */
    function handleContributionFee(
        uint256 opinionId,
        uint256 poolId,
        uint96 fee
    ) external override onlyCoreContract {
        // Get the opinion creator and pool creator
        address questionCreator = getCreatorForOpinion(opinionId);
        address poolCreator = getCreatorForPool(poolId);

        // Calculate shares (equally split three ways)
        uint96 platformShare = fee / 3;
        uint96 questionCreatorShare = fee / 3;
        uint96 poolCreatorShare = fee - platformShare - questionCreatorShare; // Handle any rounding

        // Transfer platform share (kept in contract)
        // Platform share will be withdrawn later by treasury

        // Accumulate creator fees
        if (questionCreator != address(0)) {
            accumulatedFees[questionCreator] += questionCreatorShare;
            totalAccumulatedFees += questionCreatorShare;

            emit FeesAccumulated(
                questionCreator,
                questionCreatorShare,
                accumulatedFees[questionCreator]
            );
            emit FeesAction(
                0,
                1,
                questionCreator,
                questionCreatorShare,
                0,
                0,
                0
            );
        }

        if (poolCreator != address(0)) {
            accumulatedFees[poolCreator] += poolCreatorShare;
            totalAccumulatedFees += poolCreatorShare;

            emit FeesAccumulated(
                poolCreator,
                poolCreatorShare,
                accumulatedFees[poolCreator]
            );
            emit FeesAction(0, 1, poolCreator, poolCreatorShare, 0, 0, 0);
        }
    }

    /**
     * @dev Returns total accumulated fees
     * @return Total accumulated fees
     */
    function getTotalAccumulatedFees() external view override returns (uint96) {
        return totalAccumulatedFees;
    }

    /**
     * @dev Returns accumulated fees for a user
     * @param user User address
     * @return Accumulated fees
     */
    function getAccumulatedFees(
        address user
    ) external view override returns (uint96) {
        return accumulatedFees[user];
    }

    // --- ADMIN FUNCTIONS ---

    /**
     * @dev Updates platform fee percentage
     * @param newFeePercent New platform fee percentage
     */
    function setPlatformFeePercent(
        uint8 newFeePercent
    ) external onlyRole(ADMIN_ROLE) {
        if (newFeePercent > MAX_PLATFORM_FEE_PERCENT)
            revert FeeTooHigh(0, newFeePercent, MAX_PLATFORM_FEE_PERCENT);

        // Check cooldown period
        if (block.timestamp < lastParameterUpdate[0] + parameterUpdateCooldown)
            revert CooldownNotElapsed(
                0,
                lastParameterUpdate[0] + parameterUpdateCooldown
            );

        platformFeePercent = newFeePercent;
        lastParameterUpdate[0] = uint32(block.timestamp);

        emit FeeParameterUpdated(0, newFeePercent);
        emit ParameterUpdated(1, newFeePercent);
    }

    /**
     * @dev Updates creator fee percentage
     * @param newFeePercent New creator fee percentage
     */
    function setCreatorFeePercent(
        uint8 newFeePercent
    ) external onlyRole(ADMIN_ROLE) {
        if (newFeePercent > MAX_CREATOR_FEE_PERCENT)
            revert FeeTooHigh(1, newFeePercent, MAX_CREATOR_FEE_PERCENT);

        // Check cooldown period
        if (block.timestamp < lastParameterUpdate[1] + parameterUpdateCooldown)
            revert CooldownNotElapsed(
                1,
                lastParameterUpdate[1] + parameterUpdateCooldown
            );

        creatorFeePercent = newFeePercent;
        lastParameterUpdate[1] = uint32(block.timestamp);

        emit FeeParameterUpdated(1, newFeePercent);
        emit ParameterUpdated(2, newFeePercent);
    }

    /**
     * @dev Updates MEV penalty percentage
     * @param newPenaltyPercent New MEV penalty percentage
     */
    function setMEVPenaltyPercent(
        uint8 newPenaltyPercent
    ) external onlyRole(ADMIN_ROLE) {
        if (newPenaltyPercent > MAX_MEV_PENALTY_PERCENT)
            revert FeeTooHigh(2, newPenaltyPercent, MAX_MEV_PENALTY_PERCENT);

        // Check cooldown period
        if (block.timestamp < lastParameterUpdate[2] + parameterUpdateCooldown)
            revert CooldownNotElapsed(
                2,
                lastParameterUpdate[2] + parameterUpdateCooldown
            );

        mevPenaltyPercent = newPenaltyPercent;
        lastParameterUpdate[2] = uint32(block.timestamp);

        emit FeeParameterUpdated(2, newPenaltyPercent);
    }

    /**
     * @dev Updates rapid trade window
     * @param newWindow New rapid trade window
     */
    function setRapidTradeWindow(
        uint32 newWindow
    ) external onlyRole(ADMIN_ROLE) {
        if (newWindow > MAX_RAPID_TRADE_WINDOW)
            revert MaxParameterValueExceeded(
                3,
                newWindow,
                MAX_RAPID_TRADE_WINDOW
            );

        // Check cooldown period
        if (block.timestamp < lastParameterUpdate[3] + parameterUpdateCooldown)
            revert CooldownNotElapsed(
                3,
                lastParameterUpdate[3] + parameterUpdateCooldown
            );

        rapidTradeWindow = newWindow;
        lastParameterUpdate[3] = uint32(block.timestamp);

        emit FeeParameterUpdated(3, newWindow);
        emit ParameterUpdated(5, newWindow);
    }

    /**
     * @dev Updates parameter update cooldown
     * @param newCooldown New parameter update cooldown
     */
    function setParameterUpdateCooldown(
        uint32 newCooldown
    ) external onlyRole(ADMIN_ROLE) {
        parameterUpdateCooldown = newCooldown;
        emit FeeParameterUpdated(4, newCooldown);
    }

    /**
     * @dev Updates MEV tracking data
     * @param trader Trader address
     * @param opinionId Opinion ID
     * @param price Transaction price
     */
    function updateMEVTrackingData(
        address trader,
        uint256 opinionId,
        uint96 price
    ) external onlyCoreContract {
        userLastTradeTime[trader][opinionId] = uint32(block.timestamp);
        userLastTradePrice[trader][opinionId] = price;
    }

    /**
     * @dev Grants CORE_CONTRACT_ROLE to an address
     * @param contractAddress Address to grant role to
     */
    function grantCoreContractRole(
        address contractAddress
    ) external onlyRole(ADMIN_ROLE) {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(CORE_CONTRACT_ROLE, contractAddress);
    }

    /**
     * @dev Revokes CORE_CONTRACT_ROLE from an address
     * @param contractAddress Address to revoke role from
     */
    function revokeCoreContractRole(
        address contractAddress
    ) external onlyRole(ADMIN_ROLE) {
        _revokeRole(CORE_CONTRACT_ROLE, contractAddress);
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // --- INTERNAL FUNCTIONS ---

    /**
     * @dev Gets the creator for an opinion
     * @param opinionId Opinion ID
     * @return Address of the creator
     */
    function getCreatorForOpinion(
        uint256 opinionId
    ) internal view returns (address) {
        // This would be implemented by calling the Opinion core contract
        // For now, return zero address
        return address(0);
    }

    /**
     * @dev Gets the creator for a pool
     * @param poolId Pool ID
     * @return Address of the creator
     */
    function getCreatorForPool(uint256 poolId) internal view returns (address) {
        // This would be implemented by calling the Pool manager contract
        // For now, return zero address
        return address(0);
    }

    // --- UUPS UPGRADE AUTHORIZATION ---
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // --- ADMIN TRANSFER ---
    function transferFullAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _grantRole(ADMIN_ROLE, newAdmin);
        _grantRole(TREASURY_ROLE, newAdmin);
        _revokeRole(TREASURY_ROLE, msg.sender);
        _revokeRole(ADMIN_ROLE, msg.sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
