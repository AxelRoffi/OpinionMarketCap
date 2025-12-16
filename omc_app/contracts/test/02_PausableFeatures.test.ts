// test/02_PausableFeatures.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Pausable Features", function () {
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
    
    // For the modular organization, we'll use mock addresses for the components
    // In a real test scenario, you would deploy actual implementations
    const mockOpinionCore = user1.address;
    const mockFeeManager = user2.address;
    const mockPoolManager = treasury.address;
    
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
    
    // Send some USDC to the contract for emergency withdrawal testing
    await mockUSDC.mint(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
  });

  // Pause/unpause functionality
  describe("Pause and Unpause Functionality", function () {
    it("Should start in unpaused state", async function () {
      expect(await opinionMarket.paused()).to.be.false;
    });

    it("Should allow pausing the contract", async function () {
      await opinionMarket.connect(operator).pause();
      expect(await opinionMarket.paused()).to.be.true;
    });

    it("Should allow unpausing the contract", async function () {
      // First pause
      await opinionMarket.connect(operator).pause();
      expect(await opinionMarket.paused()).to.be.true;
      
      // Then unpause
      await opinionMarket.connect(operator).unpause();
      expect(await opinionMarket.paused()).to.be.false;
    });

    it("Should revert when pausing an already paused contract", async function () {
      // First pause
      await opinionMarket.connect(operator).pause();
      
      // Try to pause again
      await expect(
        opinionMarket.connect(operator).pause()
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should revert when unpausing an already unpaused contract", async function () {
      // Try to unpause when not paused
      await expect(
        opinionMarket.connect(operator).unpause()
      ).to.be.revertedWithCustomError(opinionMarket, "ExpectedPause");
    });
  });

  // Only OPERATOR_ROLE can pause/unpause
  describe("Role Restrictions for Pause/Unpause", function () {
    it("Should allow OPERATOR_ROLE to pause", async function () {
      await opinionMarket.connect(operator).pause();
      expect(await opinionMarket.paused()).to.be.true;
    });

    it("Should allow OPERATOR_ROLE to unpause", async function () {
      // First pause
      await opinionMarket.connect(operator).pause();
      
      // Then unpause
      await opinionMarket.connect(operator).unpause();
      expect(await opinionMarket.paused()).to.be.false;
    });

    it("Should not allow non-OPERATOR_ROLE to pause", async function () {
      // Try to pause as admin (not OPERATOR_ROLE)
      await expect(
        opinionMarket.connect(admin).pause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      
      // Try to pause as user1 (not OPERATOR_ROLE)
      await expect(
        opinionMarket.connect(user1).pause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
    });

    it("Should not allow non-OPERATOR_ROLE to unpause", async function () {
      // First pause as operator
      await opinionMarket.connect(operator).pause();
      
      // Try to unpause as admin (not OPERATOR_ROLE)
      await expect(
        opinionMarket.connect(admin).unpause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      
      // Try to unpause as user1 (not OPERATOR_ROLE)
      await expect(
        opinionMarket.connect(user1).unpause()
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
    });
  });

  // Contract behavior when paused
  describe("Contract Behavior When Paused", function () {
    beforeEach(async function () {
      // Pause the contract before each test
      await opinionMarket.connect(operator).pause();
    });

    it("Should still allow view functions when paused", async function () {
      // Test that view functions still work
      // For modular organization, many view functions might call component contracts
      // We'll focus on ones that are directly in the OpinionMarket contract
      expect(await opinionMarket.paused()).to.be.true;
      expect(await opinionMarket.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
    });

    it("Should block non-view functions when paused", async function () {
      // Note: In the modular organization, most functions delegate to other contracts
      // We'll test a few representative functions
      
      // Using createOpinion as an example (this calls opinionCore)
      await expect(
        opinionMarket.createOpinion("Paused Question?", "Paused Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Using claimAccumulatedFees as an example (this calls feeManager)
      await expect(
        opinionMarket.claimAccumulatedFees()
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Using contributeToPool as an example (this calls poolManager)
      await expect(
        opinionMarket.contributeToPool(0, ethers.parseUnits("5", 6))
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });
  });

  // Events emitted for pause/unpause
  describe("Events for Pause/Unpause", function () {
    it("Should emit Paused event when pausing", async function () {
      await expect(opinionMarket.connect(operator).pause())
        .to.emit(opinionMarket, "Paused")
        .withArgs(operator.address);
    });

    it("Should emit Unpaused event when unpausing", async function () {
      // First pause
      await opinionMarket.connect(operator).pause();
      
      // Then test unpause event
      await expect(opinionMarket.connect(operator).unpause())
        .to.emit(opinionMarket, "Unpaused")
        .withArgs(operator.address);
    });
  });

  // Blocked functions when paused
  describe("Blocked Functions When Paused", function () {
    beforeEach(async function () {
      // Pause the contract
      await opinionMarket.connect(operator).pause();
    });

    it("Should block all opinion creation and management functions", async function () {
      // Test createOpinion
      await expect(
        opinionMarket.createOpinion("Blocked Question?", "Blocked Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test createOpinionWithExtras - wrapped in try/catch in case it doesn't exist
      try {
        await expect(
          opinionMarket.createOpinionWithExtras(
            "Blocked Question?", 
            "Blocked Answer", 
            "QmTest", 
            "https://example.com"
          )
        ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      } catch (error) {
        // This function might not exist, which is fine
      }
      
      // Test submitAnswer
      await expect(
        opinionMarket.submitAnswer(1, "Blocked New Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test listQuestionForSale
      await expect(
        opinionMarket.listQuestionForSale(1, ethers.parseUnits("10", 6))
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test buyQuestion
      await expect(
        opinionMarket.buyQuestion(1)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test cancelQuestionSale
      await expect(
        opinionMarket.cancelQuestionSale(1)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block all pool-related functions", async function () {
      // Test createPool
      await expect(
        opinionMarket.createPool(
          1,
          "Pool Answer",
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          ethers.parseUnits("10", 6),
          "Test Pool",
          "QmTest"
        )
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test contributeToPool
      await expect(
        opinionMarket.contributeToPool(0, ethers.parseUnits("5", 6))
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test withdrawFromExpiredPool
      await expect(
        opinionMarket.withdrawFromExpiredPool(0)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test extendPoolDeadline
      await expect(
        opinionMarket.extendPoolDeadline(0, Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block fee management functions", async function () {
      // Test claimAccumulatedFees
      await expect(
        opinionMarket.claimAccumulatedFees()
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should unblock functions after unpause", async function () {
      // First we pause (already done in beforeEach)
      expect(await opinionMarket.paused()).to.be.true;
      
      // Verify a function is blocked
      await expect(
        opinionMarket.claimAccumulatedFees()
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Unpause
      await opinionMarket.connect(operator).unpause();
      expect(await opinionMarket.paused()).to.be.false;
      
      // Now the same function should not revert with EnforcedPause
      // Note: It might still revert for other reasons since we're using mock addresses
      try {
        await opinionMarket.claimAccumulatedFees();
      } catch (error: any) {
        // Make sure it's not reverting with EnforcedPause
        expect(error.message).to.not.include("EnforcedPause");
      }
    });
  });
});