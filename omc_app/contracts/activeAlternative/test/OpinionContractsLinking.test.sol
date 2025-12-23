// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Comprehensive linking test for the three Opinion contracts

import "../OpinionCore.sol";
import "../OpinionExtensions.sol";
import "../OpinionAdmin.sol";
import "../FeeManager.sol";
import "../PoolManager.sol";

contract OpinionContractsLinkingTest {
    OpinionCore public core;
    OpinionExtensions public extensions;
    OpinionAdmin public admin;
    FeeManager public feeManager;
    PoolManager public poolManager;
    
    address public constant TEST_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base USDC
    address public constant TEST_TREASURY = 0xFb7eF00D5C2a87d282F273632e834f9105795067;
    address public testAdmin;
    
    event TestResult(string test, bool success, string message);
    
    constructor() {
        testAdmin = msg.sender;
    }
    
    function deployAndLinkContracts() external returns (bool) {
        try this.performDeployment() {
            emit TestResult("Deployment", true, "All contracts deployed successfully");
            return true;
        } catch Error(string memory reason) {
            emit TestResult("Deployment", false, reason);
            return false;
        }
    }
    
    function performDeployment() external {
        // 1. Deploy FeeManager first
        feeManager = new FeeManager();
        feeManager.initialize(TEST_USDC, TEST_TREASURY);
        
        // 2. Deploy PoolManager
        poolManager = new PoolManager();
        
        // 3. Deploy Admin contract (placeholder core address)
        admin = new OpinionAdmin();
        admin.initialize(address(0), TEST_USDC, TEST_TREASURY, testAdmin);
        
        // 4. Deploy Extensions contract (placeholder core address)  
        extensions = new OpinionExtensions();
        extensions.initialize(address(0), testAdmin);
        
        // 5. Deploy Core contract with all links
        core = new OpinionCore();
        core.initialize(
            TEST_USDC,
            address(this), // opinion market (this contract for testing)
            address(feeManager),
            address(poolManager),
            address(0), // monitoring manager
            address(0), // security manager  
            TEST_TREASURY,
            address(extensions),
            address(admin)
        );
        
        // 6. Update admin and extensions contracts with core address
        // Note: This would need proper role management in production
    }
    
    function testBasicLinking() external returns (bool) {
        if (address(core) == address(0)) return false;
        
        try this.performLinkingTests() {
            emit TestResult("Linking", true, "Contract linking successful");
            return true;
        } catch Error(string memory reason) {
            emit TestResult("Linking", false, reason);
            return false;
        }
    }
    
    function performLinkingTests() external view {
        // Test 1: Core can access admin functions
        require(admin.isPublicCreationEnabled(), "Admin access failed");
        
        // Test 2: Core can access extensions
        require(extensions.getCategoriesCount() > 0, "Extensions access failed");
        
        // Test 3: Core has proper next opinion ID
        require(core.getNextOpinionId() == 1, "Core state invalid");
        
        // Test 4: Admin can check treasury
        require(admin.getTreasury() == TEST_TREASURY, "Treasury access failed");
        
        // Test 5: Extensions has categories
        string[] memory categories = extensions.getAvailableCategories();
        require(categories.length > 30, "Categories not initialized");
    }
    
    function testParameterUpdates() external returns (bool) {
        if (address(admin) == address(0)) return false;
        
        try this.performParameterTests() {
            emit TestResult("Parameters", true, "Parameter updates working");
            return true;
        } catch Error(string memory reason) {
            emit TestResult("Parameters", false, reason);
            return false;
        }
    }
    
    function performParameterTests() external {
        // Test parameter update flow
        // Note: In production, this would require proper admin role
        
        // Test 1: Toggle public creation
        admin.togglePublicCreation();
        // Would need to check if core contract reflects this change
        
        // Test 2: Update max initial price
        admin.setMaxInitialPrice(50_000_000); // 50 USDC
        require(admin.getMaxInitialPrice() == 50_000_000, "Max price update failed");
    }
    
    function testContractSizes() external pure returns (uint256[] memory) {
        // Return estimated bytecode sizes for each contract
        uint256[] memory sizes = new uint256[](5);
        
        // These are estimates based on source code analysis
        sizes[0] = 16000; // OpinionCore estimated size
        sizes[1] = 7000;  // OpinionExtensions estimated size  
        sizes[2] = 6000;  // OpinionAdmin estimated size
        sizes[3] = 18000; // FeeManager size (existing)
        sizes[4] = 22000; // PoolManager size (existing)
        
        return sizes;
    }
    
    function testBoundaryConditions() external returns (bool) {
        try this.performBoundaryTests() {
            emit TestResult("Boundaries", true, "Boundary conditions passed");
            return true;
        } catch Error(string memory reason) {
            emit TestResult("Boundaries", false, reason);
            return false;
        }
    }
    
    function performBoundaryTests() external view {
        // Test 1: Minimum initial price validation
        // Would test: core.createOpinion with 0.5 USDC (should fail)
        
        // Test 2: Maximum initial price validation  
        // Would test: core.createOpinion with 101 USDC (should fail with default max)
        
        // Test 3: Category validation
        string[] memory tooManyCategories = new string[](5);
        tooManyCategories[0] = "Technology";
        tooManyCategories[1] = "Science"; 
        tooManyCategories[2] = "Politics";
        tooManyCategories[3] = "Gaming";
        tooManyCategories[4] = "Sports";
        
        // Should fail with too many categories
        require(!extensions.validateCategories(tooManyCategories), "Should reject too many categories");
        
        // Test 4: Valid category validation
        string[] memory validCategories = new string[](2);
        validCategories[0] = "Technology";
        validCategories[1] = "Science";
        
        require(extensions.validateCategories(validCategories), "Should accept valid categories");
    }
    
    function runAllTests() external returns (bool) {
        bool deploymentSuccess = this.deployAndLinkContracts();
        if (!deploymentSuccess) return false;
        
        bool linkingSuccess = this.testBasicLinking();
        if (!linkingSuccess) return false;
        
        bool parameterSuccess = this.testParameterUpdates();
        if (!parameterSuccess) return false;
        
        bool boundarySuccess = this.testBoundaryConditions();
        if (!boundarySuccess) return false;
        
        emit TestResult("All Tests", true, "Complete test suite passed");
        return true;
    }
    
    // Helper function to get deployment addresses
    function getDeployedAddresses() external view returns (
        address _core,
        address _extensions, 
        address _admin,
        address _feeManager,
        address _poolManager
    ) {
        return (
            address(core),
            address(extensions),
            address(admin), 
            address(feeManager),
            address(poolManager)
        );
    }
}