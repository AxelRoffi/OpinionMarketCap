// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SimpleMockSecurity is AccessControl {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Security parameters
    uint8 public platformFeePercent = 2; // 2%
    uint256 public minimumPrice = 1_000_000; // 1 USDC
    uint256 public maxPriceChange = 200; // 200%

    // Token
    IERC20 public token;

    // Tracking
    mapping(address => uint256) public accumulatedFees;
    uint256 public totalAccumulatedFees;

    // Pausable state
    bool public paused = false;

    // Constructor has no arguments to avoid Ethers.js issues
    constructor() {
        // Setup initial roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // Set token after deployment
    function setToken(address _token) external onlyRole(ADMIN_ROLE) {
        token = IERC20(_token);
    }

    // Pausable modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    // Basic functions

    function simulateAccumulatedFees(
        address user,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        accumulatedFees[user] += amount;
        totalAccumulatedFees += amount;
    }

    function getNextPrice(uint256) external view returns (uint256) {
        return minimumPrice * 2;
    }

    // Security features to test

    function setPlatformFeePercent(
        uint8 _platformFeePercent
    ) external onlyRole(ADMIN_ROLE) {
        require(_platformFeePercent <= 10, "Fee too high");
        platformFeePercent = _platformFeePercent;
    }

    function pause() external onlyRole(OPERATOR_ROLE) {
        paused = true;
    }

    function unpause() external onlyRole(OPERATOR_ROLE) {
        paused = false;
    }

    function emergencyWithdraw(
        address _token
    ) external whenPaused onlyRole(ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(_token);
        uint256 balance = tokenContract.balanceOf(address(this));

        // Don't withdraw accumulated fees that belong to users
        if (_token == address(token)) {
            if (balance <= totalAccumulatedFees) {
                revert("No funds to withdraw");
            }
            balance -= totalAccumulatedFees;
        }

        tokenContract.transfer(msg.sender, balance);
    }

    // Minimal reentrancy protection (using a state variable instead of a modifier)
    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    function vulnerableFunction(
        address _token,
        uint256 _amount
    ) external nonReentrant {
        IERC20(_token).transfer(msg.sender, _amount);
    }

    function executeExternalCall(
        address target,
        bytes calldata data
    ) external onlyRole(ADMIN_ROLE) {
        (bool success, ) = target.call(data);
        require(success, "External call failed");
    }
}
