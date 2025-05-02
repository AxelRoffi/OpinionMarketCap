// 02_PausableFeatures.test.ts

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket, PriceCalculator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Pausable Features", function () {
  let opinionMarket: any;
  let priceCalculator: PriceCalculator;
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
    
    // Deploy PriceCalculator library
    const PriceCalculatorFactory = await ethers.getContractFactory("PriceCalculator");
    priceCalculator = await PriceCalculatorFactory.deploy() as PriceCalculator;
    
    // Deploy OpinionMarket with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    // Deploy as proxy
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Wait for deployment to complete
    await opinionMarket.waitForDeployment();
    
    // Set up roles for testing
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
    await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
    await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
    
    // Setup for opinion tests
    // Mint and approve USDC for owner
    await mockUSDC.mint(owner.address, ethers.parseUnits("1000", 6));
    await mockUSDC.approve(await opinionMarket.getAddress(), ethers.parseUnits("1000", 6));
    
    // Mint and approve USDC for user1
    await mockUSDC.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDC.connect(user1).approve(await opinionMarket.getAddress(), ethers.parseUnits("1000", 6));
    
    // Create a test opinion for later tests
    await opinionMarket.createOpinion("Test Question?", "Test Answer");
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
      expect(await opinionMarket.getNextPrice(1)).to.be.gt(0);
      expect(await opinionMarket.paused()).to.be.true;
      
      // Additional view function checks
      const answerHistory = await opinionMarket.getAnswerHistory(1);
      expect(answerHistory.length).to.equal(1);
      
      const tradeCount = await opinionMarket.getTradeCount(1);
      expect(tradeCount).to.equal(1);
    });

    it("Should block submitAnswer when paused", async function () {
      await expect(
        opinionMarket.connect(user1).submitAnswer(1, "New Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block createOpinion when paused", async function () {
      await expect(
        opinionMarket.createOpinion("Paused Question?", "Paused Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block createOpinionWithExtras when paused", async function () {
      await expect(
        opinionMarket.createOpinionWithExtras(
          "Paused Question?", 
          "Paused Answer", 
          "QmTest", 
          "https://example.com"
        )
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block claimAccumulatedFees when paused", async function () {
      // First unpause to submit an answer that generates fees
      await opinionMarket.connect(operator).unpause();
      
      // Submit an answer to generate fees
      await opinionMarket.connect(user1).submitAnswer(1, "Fee Answer");
      
      // Pause again
      await opinionMarket.connect(operator).pause();
      
      // Try to claim fees
      await expect(
        opinionMarket.claimAccumulatedFees()
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

  // Emergency withdrawal when paused
  describe("Emergency Withdrawal When Paused", function () {
    beforeEach(async function () {
      // Pause the contract
      await opinionMarket.connect(operator).pause();
      
      // Send some USDC to the contract
      await mockUSDC.mint(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
    });

    it("Should allow owner to perform emergency withdrawal when paused", async function () {
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      // Perform emergency withdrawal as owner
      await opinionMarket.connect(owner).emergencyWithdraw(await mockUSDC.getAddress());
      
      // Check that USDC was transferred to owner
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(ethers.parseUnits("100", 6));
    });

    it("Should allow MODERATOR_ROLE to perform emergency withdrawal when paused", async function () {
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      // Perform emergency withdrawal as moderator
      await opinionMarket.connect(moderator).emergencyWithdraw(await mockUSDC.getAddress());
      
      // Check that USDC was transferred to owner (not moderator)
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(ethers.parseUnits("100", 6));
    });

    it("Should not allow emergency withdrawal when not paused", async function () {
      // Unpause first
      await opinionMarket.connect(operator).unpause();
      
      // Try emergency withdrawal
      await expect(
        opinionMarket.connect(owner).emergencyWithdraw(await mockUSDC.getAddress())
      ).to.be.revertedWithCustomError(opinionMarket, "ExpectedPause");
    });

    it("Should not allow non-owner/non-MODERATOR_ROLE to perform emergency withdrawal", async function () {
      // Try as user1 (not owner or MODERATOR_ROLE)
      await expect(
        opinionMarket.connect(user1).emergencyWithdraw(await mockUSDC.getAddress())
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      
      // Try as admin (not owner or MODERATOR_ROLE)
      await expect(
        opinionMarket.connect(admin).emergencyWithdraw(await mockUSDC.getAddress())
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
    });

    it("Should emit AdminAction event when performing emergency withdrawal", async function () {
      await expect(opinionMarket.connect(owner).emergencyWithdraw(await mockUSDC.getAddress()))
        .to.emit(opinionMarket, "AdminAction")
        .withArgs(0, owner.address, ethers.ZeroHash, ethers.parseUnits("100", 6));
    });
  });

  // Blocked functions when paused
  describe("Blocked Functions When Paused", function () {
    beforeEach(async function () {
      // Pause the contract
      await opinionMarket.connect(operator).pause();
    });

    it("Should block all opinion creation and management functions", async function () {
      // Test createOpinion (already tested above)
      await expect(
        opinionMarket.createOpinion("Blocked Question?", "Blocked Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test submitAnswer (already tested above)
      await expect(
        opinionMarket.connect(user1).submitAnswer(1, "Blocked New Answer")
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test listQuestionForSale
      await expect(
        opinionMarket.listQuestionForSale(1, ethers.parseUnits("10", 6))
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test buyQuestion
      await expect(
        opinionMarket.connect(user1).buyQuestion(1)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block all pool-related functions", async function () {
      // Test createPool
      await expect(
        opinionMarket.connect(user1).createPool(
          1,
          "Pool Answer",
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          ethers.parseUnits("10", 6),
          "Test Pool",
          "QmTest"
        )
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test contributeToPool (assuming a pool exists)
      // Note: We can't create a pool while paused, so this test may need adjustment
      // This is a placeholder test
      await expect(
        opinionMarket.connect(user1).contributeToPool(0, ethers.parseUnits("5", 6))
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
      
      // Test withdrawFromExpiredPool (assuming a pool exists)
      // This is a placeholder test
      await expect(
        opinionMarket.connect(user1).withdrawFromExpiredPool(0)
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should block fee management functions", async function () {
      // Test claimAccumulatedFees (already tested above)
      await expect(
        opinionMarket.claimAccumulatedFees()
      ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should still allow administrative functions when paused", async function () {
      // Test deactivateOpinion (should not be blocked)
      await opinionMarket.connect(moderator).deactivateOpinion(1);
      const deactivatedOpinion = await opinionMarket.opinions(1);
      expect(deactivatedOpinion.isActive).to.be.false;
      
      // Test reactivateOpinion (should not be blocked)
      await opinionMarket.connect(moderator).reactivateOpinion(1);
      const reactivatedOpinion = await opinionMarket.opinions(1);
      expect(reactivatedOpinion.isActive).to.be.true;
      
      // Test setMinimumPrice (should not be blocked)
      await opinionMarket.connect(admin).setMinimumPrice(2_000_000);
      expect(await opinionMarket.minimumPrice()).to.equal(2_000_000);
    });
  });
});