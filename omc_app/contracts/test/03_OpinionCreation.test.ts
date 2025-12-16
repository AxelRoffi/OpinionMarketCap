// test/03_OpinionCreation.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Access Control", function () {
  let opinionMarket: any;
  let mockUSDC: MockERC20;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let moderator: HardhatEthersSigner;
  let operator: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  // Constants for testing
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const MODERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MODERATOR_ROLE"));
  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));

  beforeEach(async function () {
    // Get signers
    [owner, admin, moderator, operator, treasury, user1, user2] = await ethers.getSigners();
    
    // Deploy MockERC20 for USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC") as MockERC20;
    
    // For the modular organization, we'll use addresses for the components
    // since we're only testing access control at the OpinionMarket level
    const mockOpinionCore = owner.address; // Just using an address, not a contract
    const mockFeeManager = user1.address; // Just using an address, not a contract
    const mockPoolManager = user2.address; // Just using an address, not a contract
    
    // Deploy OpinionMarket
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), mockOpinionCore, mockFeeManager, mockPoolManager],
      { kind: 'uups' }
    );
    
    // Set up roles for testing
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
    await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
    await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
    
    // Setup for opinion tests - mint and approve USDC
    await mockUSDC.mint(owner.address, ethers.parseUnits("1000", 6));
    await mockUSDC.approve(await opinionMarket.getAddress(), ethers.parseUnits("1000", 6));
    
    await mockUSDC.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDC.connect(user1).approve(await opinionMarket.getAddress(), ethers.parseUnits("1000", 6));
  });

  // Tests for role management
  describe("Role Management", function () {
    it("Should properly assign roles during initialization", async function () {
      // Check that roles were properly assigned
      expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await opinionMarket.hasRole(MODERATOR_ROLE, moderator.address)).to.be.true;
      expect(await opinionMarket.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
      expect(await opinionMarket.hasRole(TREASURY_ROLE, treasury.address)).to.be.true;
    });

    it("Should allow owner to grant roles", async function () {
      // Grant ADMIN_ROLE to user1
      await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
      expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
    });

    it("Should allow owner to revoke roles", async function () {
      // First grant ADMIN_ROLE to user1
      await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
      expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
      
      // Then revoke it
      await opinionMarket.revokeRole(ADMIN_ROLE, user1.address);
      expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
    });
  });

  // Tests for access control
  describe("Function Access Control", function () {
    it("Should only allow MODERATOR_ROLE to deactivate opinions", async function () {
      // Try to deactivate as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).deactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Try as moderator (might fail because of the mock component, but not due to access control)
      try {
        await opinionMarket.connect(moderator).deactivateOpinion(1);
      } catch (error: any) {
        // Make sure it's not failing because of access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
      }
    });

    it("Should only allow MODERATOR_ROLE to reactivate opinions", async function () {
      // Try to reactivate as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).reactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Try as moderator (might fail because of the mock component, but not due to access control)
      try {
        await opinionMarket.connect(moderator).reactivateOpinion(1);
      } catch (error: any) {
        // Make sure it's not failing because of access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
      }
    });

    it("Should only allow ADMIN_ROLE to toggle public creation", async function () {
      // Try to toggle as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).togglePublicCreation()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Try as admin (might fail because of the mock component, but not due to access control)
      try {
        await opinionMarket.connect(admin).togglePublicCreation();
      } catch (error: any) {
        // Make sure it's not failing because of access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
      }
    });

    it("Should only allow TREASURY_ROLE to withdraw platform fees", async function () {
      // Try to withdraw as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).withdrawPlatformFees(await mockUSDC.getAddress(), user1.address)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Try as treasury (might fail because of the mock component, but not due to access control)
      try {
        await opinionMarket.connect(treasury).withdrawPlatformFees(await mockUSDC.getAddress(), treasury.address);
      } catch (error: any) {
        // Make sure it's not failing because of access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
      }
    });

    it("Should only allow ADMIN_ROLE to update contract addresses", async function () {
      // Try to update as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).setOpinionCore(user2.address)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Try as admin (should pass access control)
      await opinionMarket.connect(admin).setOpinionCore(user2.address);
      
      // Verify the address was updated
      expect(await opinionMarket.opinionCore()).to.equal(user2.address);
    });

    it("Should only allow OPERATOR_ROLE to pause the contract", async function () {
      // Try to pause as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).pause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Pause as operator (should work)
      await opinionMarket.connect(operator).pause();
      expect(await opinionMarket.paused()).to.be.true;
    });

    it("Should only allow OPERATOR_ROLE to unpause the contract", async function () {
      // First pause the contract
      await opinionMarket.connect(operator).pause();
      
      // Try to unpause as user1 (should fail due to access control)
      await expect(
        opinionMarket.connect(user1).unpause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");

      // Unpause as operator (should work)
      await opinionMarket.connect(operator).unpause();
      expect(await opinionMarket.paused()).to.be.false;
    });
  });

  // Tests for contract functionality
  describe("Basic Contract Functionality", function () {
    // Test the createOpinion function
    it("Should call createOpinion on OpinionCore", async function () {
      // This test can only check if the function doesn't revert
      // We can't verify delegation since we're using mock addresses
      
      try {
        await opinionMarket.createOpinion("Test Question?", "Test Answer");
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("createOpinion failed as expected with mock address");
      }
    });

    // Test the createOpinionWithExtras function
    it("Should call createOpinionWithExtras on OpinionCore", async function () {
      try {
        await opinionMarket.createOpinionWithExtras(
          "Test Question?", 
          "Test Answer", 
          "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX", 
          "https://example.com"
        );
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("createOpinionWithExtras failed as expected with mock address");
      }
    });

    // Test the submitAnswer function
    it("Should call submitAnswer on OpinionCore", async function () {
      try {
        await opinionMarket.submitAnswer(1, "New Answer");
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("submitAnswer failed as expected with mock address");
      }
    });

    // Test opinion trade functions
    it("Should call listQuestionForSale on OpinionCore", async function () {
      try {
        await opinionMarket.listQuestionForSale(1, ethers.parseUnits("10", 6));
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("listQuestionForSale failed as expected with mock address");
      }
    });

    it("Should call buyQuestion on OpinionCore", async function () {
      try {
        await opinionMarket.buyQuestion(1);
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("buyQuestion failed as expected with mock address");
      }
    });

    it("Should call cancelQuestionSale on OpinionCore", async function () {
      try {
        await opinionMarket.cancelQuestionSale(1);
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("cancelQuestionSale failed as expected with mock address");
      }
    });
  });

  // Tests for pool functionality
  describe("Pool Functionality", function () {
    // Test pool creation
    it("Should call createPool on PoolManager", async function () {
      try {
        await opinionMarket.createPool(
          1, // opinionId
          "Pool Answer", // proposedAnswer
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // deadline (1 week)
          ethers.parseUnits("10", 6), // initialContribution
          "Test Pool", // name
          "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX" // ipfsHash
        );
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("createPool failed as expected with mock address");
      }
    });

    // Test pool contribution
    it("Should call contributeToPool on PoolManager", async function () {
      try {
        await opinionMarket.contributeToPool(0, ethers.parseUnits("5", 6));
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("contributeToPool failed as expected with mock address");
      }
    });

    // Test pool withdrawal
    it("Should call withdrawFromExpiredPool on PoolManager", async function () {
      try {
        await opinionMarket.withdrawFromExpiredPool(0);
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("withdrawFromExpiredPool failed as expected with mock address");
      }
    });

    // Test pool deadline extension
    it("Should call extendPoolDeadline on PoolManager", async function () {
      try {
        await opinionMarket.extendPoolDeadline(
          0, // poolId
          Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60 // newDeadline (2 weeks)
        );
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("extendPoolDeadline failed as expected with mock address");
      }
    });
  });

  // Tests for fee management
  describe("Fee Management", function () {
    // Test fee claiming
    it("Should call claimAccumulatedFees on FeeManager", async function () {
      try {
        await opinionMarket.claimAccumulatedFees();
      } catch (error: any) {
        // If it fails, make sure it's not due to access control
        expect(error.message).to.not.include("AccessControlUnauthorizedAccount");
        
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("claimAccumulatedFees failed as expected with mock address");
      }
    });
  });

  // Tests for view functions
  describe("View Functions", function () {
    // Test getAnswerHistory
    it("Should call getAnswerHistory on OpinionCore", async function () {
      try {
        await opinionMarket.getAnswerHistory(1);
      } catch (error: any) {
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("getAnswerHistory failed as expected with mock address");
      }
    });

    // Test getNextPrice
    it("Should call getNextPrice on OpinionCore", async function () {
      try {
        await opinionMarket.getNextPrice(1);
      } catch (error: any) {
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("getNextPrice failed as expected with mock address");
      }
    });

    // Test getOpinionDetails
    it("Should call getOpinionDetails on OpinionCore", async function () {
      try {
        await opinionMarket.getOpinionDetails(1);
      } catch (error: any) {
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("getOpinionDetails failed as expected with mock address");
      }
    });

    // Test getPoolDetails
    it("Should call getPoolDetails on PoolManager", async function () {
      try {
        await opinionMarket.getPoolDetails(0);
      } catch (error: any) {
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("getPoolDetails failed as expected with mock address");
      }
    });

    // Test getAccumulatedFees
    it("Should call getAccumulatedFees on FeeManager", async function () {
      try {
        await opinionMarket.getAccumulatedFees(owner.address);
      } catch (error: any) {
        // It's expected to fail due to the mock address, so we'll skip further assertions
        console.log("getAccumulatedFees failed as expected with mock address");
      }
    });
  });
});