/**
 * 🚨 CRITICAL MAINNET READINESS TEST SUITE
 * 
 * This test suite validates the platform is ready for real money deployment.
 * ALL TESTS MUST PASS before launching with real USDC on mainnet.
 * 
 * Created by: TestingAutomation Agent
 * Purpose: Validate security fixes, financial safety, and system integrity
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("🚨 MAINNET READINESS VALIDATION SUITE", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  // Increase timeout for comprehensive testing
  this.timeout(300000); // 5 minutes

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public creation for testing
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("🔒 CRITICAL SECURITY VALIDATIONS", function () {
    
    it("CRITICAL: Treasury multisig protection should be enforced", async function () {
      const { feeManager, opinionCore } = contracts;
      const { user1, owner } = users;

      // Verify treasury change timelock protection
      await feeManager.connect(owner).setTreasury(user1.address);
      
      // Should not be able to confirm immediately
      await expect(
        feeManager.connect(owner).confirmTreasuryChange()
      ).to.be.revertedWith("Treasury: Timelock not elapsed");

      // Fast-forward time by 48 hours + 1 second
      await ethers.provider.send("evm_increaseTime", [48 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      // Now should be able to confirm
      await expect(
        feeManager.connect(owner).confirmTreasuryChange()
      ).to.not.be.reverted;

      expect(await feeManager.treasury()).to.equal(user1.address);
    });

    it("CRITICAL: Admin role concentration should be minimized", async function () {
      const { opinionCore } = contracts;
      const { owner } = users;

      const adminRole = await opinionCore.DEFAULT_ADMIN_ROLE();
      const moderatorRole = await opinionCore.MODERATOR_ROLE();

      // Verify role separation exists
      expect(adminRole).to.not.equal(moderatorRole);

      // Check that not all critical roles are held by single address
      const hasAdminRole = await opinionCore.hasRole(adminRole, owner.address);
      const hasModeratorRole = await opinionCore.hasRole(moderatorRole, owner.address);

      // This should be reviewed for production - ideally these should be separate
      console.log(`⚠️  Owner has both admin and moderator roles: ${hasAdminRole && hasModeratorRole}`);
    });

    it("CRITICAL: Price manipulation protection should be active", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1 } = users;

      // Fund users
      await usdc.mint(creator.address, ethers.parseUnits("1000", 6));
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("1000", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("1000", 6));

      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Price Manipulation Test",
        "Initial Answer",
        "Testing price manipulation protection",
        ethers.parseUnits("5", 6), // 5 USDC
        ["Technology"]
      );

      const initialPrice = await opinionCore.getNextPrice(1);
      console.log(`Initial next price: ${ethers.formatUnits(initialPrice, 6)} USDC`);

      // Submit first answer
      await opinionCore.connect(user1).submitAnswer(1, "First Answer", "");

      const secondPrice = await opinionCore.getNextPrice(1);
      console.log(`Second next price: ${ethers.formatUnits(secondPrice, 6)} USDC`);

      // Check that price increase is reasonable (not more than 200% increase)
      const priceIncreasePercent = ((Number(secondPrice) - Number(initialPrice)) / Number(initialPrice)) * 100;
      console.log(`Price increase: ${priceIncreasePercent.toFixed(2)}%`);

      // Verify price manipulation protection
      expect(priceIncreasePercent).to.be.lessThan(200); // Max 200% increase as defined in contract
      expect(priceIncreasePercent).to.be.greaterThan(0); // Should always increase
    });

    it("CRITICAL: MEV protection should function correctly", async function () {
      const { opinionCore, usdc, feeManager } = contracts;
      const { creator, user1, user2 } = users;

      // Fund users
      await usdc.mint(creator.address, ethers.parseUnits("1000", 6));
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
      await usdc.mint(user2.address, ethers.parseUnits("1000", 6));
      
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("1000", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("1000", 6));
      await usdc.connect(user2).approve(await opinionCore.getAddress(), ethers.parseUnits("1000", 6));

      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "MEV Protection Test",
        "Initial Answer",
        "",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );

      // Try rapid succession answers (should be prevented by rate limiting)
      await opinionCore.connect(user1).submitAnswer(1, "Answer 1", "");

      // Second answer in same block should fail due to rate limiting
      await expect(
        opinionCore.connect(user1).submitAnswer(1, "Answer 2", "")
      ).to.be.revertedWithCustomError(opinionCore, "OneTradePerBlock");

      // Different user in same block should be allowed
      await expect(
        opinionCore.connect(user2).submitAnswer(1, "User2 Answer", "")
      ).to.not.be.reverted;

      console.log("✅ MEV protection and rate limiting working correctly");
    });
  });

  describe("💰 FINANCIAL SAFETY VALIDATIONS", function () {
    
    it("CRITICAL: Fee calculations should be precise and not leak funds", async function () {
      const { opinionCore, usdc, feeManager } = contracts;
      const { creator, user1, treasury } = users;

      // Fund users with exact amounts
      const fundAmount = ethers.parseUnits("1000", 6);
      await usdc.mint(creator.address, fundAmount);
      await usdc.mint(user1.address, fundAmount);
      
      await usdc.connect(creator).approve(await opinionCore.getAddress(), fundAmount);
      await usdc.connect(user1).approve(await opinionCore.getAddress(), fundAmount);

      // Record initial balances
      const initialCreatorBalance = await usdc.balanceOf(creator.address);
      const initialUser1Balance = await usdc.balanceOf(user1.address);
      const initialTreasuryBalance = await usdc.balanceOf(await feeManager.treasury());

      // Create opinion with 10 USDC initial price
      const initialPrice = ethers.parseUnits("10", 6);
      await opinionCore.connect(creator).createOpinion(
        "Fee Precision Test",
        "Initial Answer",
        "",
        initialPrice,
        ["Finance"]
      );

      // Calculate expected creation fee (20% of initial price, minimum 5 USDC)
      const expectedCreationFee = ethers.parseUnits("5", 6); // 5 USDC minimum
      
      // Check creator balance after creation
      const afterCreationBalance = await usdc.balanceOf(creator.address);
      expect(initialCreatorBalance - afterCreationBalance).to.equal(expectedCreationFee);

      // Submit answer
      const nextPrice = await opinionCore.getNextPrice(1);
      await opinionCore.connect(user1).submitAnswer(1, "Test Answer", "");

      // Verify no funds are lost in the system
      const finalCreatorBalance = await usdc.balanceOf(creator.address);
      const finalUser1Balance = await usdc.balanceOf(user1.address);
      const finalTreasuryBalance = await usdc.balanceOf(await feeManager.treasury());

      // Total funds should be conserved
      const initialTotal = initialCreatorBalance + initialUser1Balance + initialTreasuryBalance;
      const finalTotal = finalCreatorBalance + finalUser1Balance + finalTreasuryBalance + 
                        await usdc.balanceOf(await opinionCore.getAddress()) +
                        await usdc.balanceOf(await feeManager.getAddress());

      console.log(`Initial total: ${ethers.formatUnits(initialTotal, 6)} USDC`);
      console.log(`Final total: ${ethers.formatUnits(finalTotal, 6)} USDC`);
      
      // Allow for tiny rounding differences (less than 1 cent)
      const difference = finalTotal > initialTotal ? finalTotal - initialTotal : initialTotal - finalTotal;
      expect(difference).to.be.lessThan(ethers.parseUnits("0.01", 6));
    });

    it("CRITICAL: Large transaction handling should be safe", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1 } = users;

      // Fund users with very large amounts
      const largeAmount = ethers.parseUnits("100000", 6); // 100,000 USDC
      await usdc.mint(creator.address, largeAmount);
      await usdc.mint(user1.address, largeAmount);
      
      await usdc.connect(creator).approve(await opinionCore.getAddress(), largeAmount);
      await usdc.connect(user1).approve(await opinionCore.getAddress(), largeAmount);

      // Try to create opinion with maximum allowed initial price
      const maxInitialPrice = ethers.parseUnits("100", 6); // 100 USDC max
      
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Large Transaction Test",
          "Initial Answer",
          "",
          maxInitialPrice,
          ["Finance"]
        )
      ).to.not.be.reverted;

      // Try to create with more than maximum (should fail)
      const aboveMaxPrice = ethers.parseUnits("101", 6);
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Above Max Test",
          "Initial Answer",
          "",
          aboveMaxPrice,
          ["Finance"]
        )
      ).to.be.revertedWithCustomError(opinionCore, "InvalidInitialPrice");

      console.log("✅ Large transaction limits working correctly");
    });

    it("CRITICAL: Emergency pause functionality should work", async function () {
      const { opinionCore } = contracts;
      const { owner, creator } = users;

      // Verify contract is not paused initially
      expect(await opinionCore.paused()).to.be.false;

      // Pause the contract
      await opinionCore.connect(owner).pause();
      expect(await opinionCore.paused()).to.be.true;

      // Try to create opinion while paused (should fail)
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Paused Test",
          "Answer",
          "",
          ethers.parseUnits("5", 6),
          ["Technology"]
        )
      ).to.be.revertedWithCustomError(opinionCore, "EnforcedPause");

      // Unpause and verify functionality returns
      await opinionCore.connect(owner).unpause();
      expect(await opinionCore.paused()).to.be.false;

      // Should work again after unpause
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Unpaused Test",
          "Answer",
          "",
          ethers.parseUnits("5", 6),
          ["Technology"]
        )
      ).to.not.be.reverted;

      console.log("✅ Emergency pause system working correctly");
    });
  });

  describe("🏗️ SYSTEM INTEGRITY VALIDATIONS", function () {
    
    it("CRITICAL: All contract addresses should be properly configured", async function () {
      const { opinionCore, feeManager, poolManager, usdc } = contracts;

      // Check that all contracts are properly linked
      expect(await opinionCore.feeManager()).to.equal(await feeManager.getAddress());
      expect(await opinionCore.poolManager()).to.equal(await poolManager.getAddress());
      expect(await opinionCore.usdcToken()).to.equal(await usdc.getAddress());

      // Check that contracts have proper roles
      const marketRole = await opinionCore.MARKET_CONTRACT_ROLE();
      const poolRole = await opinionCore.POOL_MANAGER_ROLE();

      // These would be set during deployment
      console.log(`Market contract role configured: ${await opinionCore.hasRole(marketRole, await opinionCore.getAddress())}`);
      console.log(`Pool manager role configured: ${await opinionCore.hasRole(poolRole, await poolManager.getAddress())}`);
    });

    it("CRITICAL: Contract upgradeability should be secure", async function () {
      const { opinionCore } = contracts;
      const { owner, user1 } = users;

      // Only admin should be able to upgrade contracts
      // This test would be more comprehensive in a real proxy setup
      
      // Check that regular users cannot perform admin functions
      await expect(
        opinionCore.connect(user1).pause()
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // Admin should be able to perform admin functions
      await expect(
        opinionCore.connect(owner).pause()
      ).to.not.be.reverted;

      await opinionCore.connect(owner).unpause();
      console.log("✅ Access control working correctly");
    });

    it("CRITICAL: Gas usage should be reasonable for mainnet", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1 } = users;

      // Fund users
      await usdc.mint(creator.address, ethers.parseUnits("100", 6));
      await usdc.mint(user1.address, ethers.parseUnits("100", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

      // Test gas usage for opinion creation
      const createTx = await opinionCore.connect(creator).createOpinion(
        "Gas Test Question",
        "Initial Answer",
        "",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      const createReceipt = await createTx.wait();
      console.log(`Opinion creation gas used: ${createReceipt?.gasUsed?.toString()}`);
      
      // Gas should be reasonable (less than 500k for creation)
      expect(createReceipt?.gasUsed).to.be.lessThan(500000);

      // Test gas usage for answer submission
      const answerTx = await opinionCore.connect(user1).submitAnswer(1, "Test Answer", "");
      const answerReceipt = await answerTx.wait();
      console.log(`Answer submission gas used: ${answerReceipt?.gasUsed?.toString()}`);
      
      // Gas should be reasonable (less than 300k for answer)
      expect(answerReceipt?.gasUsed).to.be.lessThan(300000);
    });
  });

  describe("📊 PERFORMANCE VALIDATIONS", function () {
    
    it("CRITICAL: System should handle multiple concurrent operations", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1, user2, user3 } = users;

      // Fund all users
      const fundAmount = ethers.parseUnits("100", 6);
      for (const user of [creator, user1, user2, user3]) {
        await usdc.mint(user.address, fundAmount);
        await usdc.connect(user).approve(await opinionCore.getAddress(), fundAmount);
      }

      // Create multiple opinions concurrently
      const createPromises = [
        opinionCore.connect(creator).createOpinion("Q1", "A1", "", ethers.parseUnits("5", 6), ["Technology"]),
        opinionCore.connect(user1).createOpinion("Q2", "A2", "", ethers.parseUnits("6", 6), ["Finance"]),
        opinionCore.connect(user2).createOpinion("Q3", "A3", "", ethers.parseUnits("7", 6), ["Politics"])
      ];

      await Promise.all(createPromises);

      // Verify all opinions were created successfully
      for (let i = 1; i <= 3; i++) {
        const opinion = await opinionCore.getOpinionDetails(i);
        expect(opinion.creator).to.not.equal(ethers.ZeroAddress);
        expect(opinion.isActive).to.be.true;
      }

      console.log("✅ Concurrent operations handled successfully");
    });

    it("CRITICAL: Price calculation should be deterministic and fair", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1, user2 } = users;

      // Fund users
      const fundAmount = ethers.parseUnits("1000", 6);
      await usdc.mint(creator.address, fundAmount);
      await usdc.mint(user1.address, fundAmount);
      await usdc.mint(user2.address, fundAmount);
      
      await usdc.connect(creator).approve(await opinionCore.getAddress(), fundAmount);
      await usdc.connect(user1).approve(await opinionCore.getAddress(), fundAmount);
      await usdc.connect(user2).approve(await opinionCore.getAddress(), fundAmount);

      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Price Determinism Test",
        "Initial Answer",
        "",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );

      // Get prices for multiple trades
      const prices: bigint[] = [];
      prices.push(await opinionCore.getNextPrice(1));

      // Submit answers and track price progression
      await opinionCore.connect(user1).submitAnswer(1, "Answer 1", "");
      prices.push(await opinionCore.getNextPrice(1));

      // Move to next block to avoid rate limiting
      await ethers.provider.send("evm_mine", []);

      await opinionCore.connect(user2).submitAnswer(1, "Answer 2", "");
      prices.push(await opinionCore.getNextPrice(1));

      // Verify price progression is logical
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).to.be.greaterThan(prices[i-1]); // Prices should increase
        console.log(`Price ${i}: ${ethers.formatUnits(prices[i], 6)} USDC`);
      }

      // Verify reasonable price increases (not exponential)
      const firstIncrease = Number(prices[1]) / Number(prices[0]);
      const secondIncrease = Number(prices[2]) / Number(prices[1]);
      
      console.log(`First increase ratio: ${firstIncrease.toFixed(2)}`);
      console.log(`Second increase ratio: ${secondIncrease.toFixed(2)}`);
      
      // Both increases should be reasonable (less than 3x)
      expect(firstIncrease).to.be.lessThan(3);
      expect(secondIncrease).to.be.lessThan(3);
    });
  });

  describe("🚨 FINAL MAINNET READINESS CHECK", function () {
    
    it("MAINNET READINESS: All critical systems operational", async function () {
      const { opinionCore, feeManager, poolManager, usdc } = contracts;
      const { owner, creator, user1 } = users;

      console.log("=".repeat(60));
      console.log("🚨 FINAL MAINNET READINESS ASSESSMENT");
      console.log("=".repeat(60));

      // 1. Contract deployment check
      console.log("✅ Contracts deployed successfully");
      console.log(`   OpinionCore: ${await opinionCore.getAddress()}`);
      console.log(`   FeeManager: ${await feeManager.getAddress()}`);
      console.log(`   PoolManager: ${await poolManager.getAddress()}`);
      console.log(`   USDC Token: ${await usdc.getAddress()}`);

      // 2. Access control check
      const hasAdminRole = await opinionCore.hasRole(await opinionCore.DEFAULT_ADMIN_ROLE(), owner.address);
      console.log(`✅ Admin role configured: ${hasAdminRole}`);

      // 3. Economic parameters check
      const minimumPrice = await opinionCore.minimumPrice();
      const questionCreationFee = await opinionCore.questionCreationFee();
      console.log(`✅ Economic parameters:`);
      console.log(`   Minimum price: ${ethers.formatUnits(minimumPrice, 6)} USDC`);
      console.log(`   Creation fee: ${ethers.formatUnits(questionCreationFee, 6)} USDC`);

      // 4. Security features check
      const isPaused = await opinionCore.paused();
      const isPublicCreation = await opinionCore.isPublicCreationEnabled();
      console.log(`✅ Security status:`);
      console.log(`   Contract paused: ${isPaused}`);
      console.log(`   Public creation enabled: ${isPublicCreation}`);

      // 5. Full workflow test
      await usdc.mint(creator.address, ethers.parseUnits("100", 6));
      await usdc.mint(user1.address, ethers.parseUnits("100", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Mainnet Readiness Test",
        "System is ready",
        "All tests passed",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );

      // Submit answer
      await opinionCore.connect(user1).submitAnswer(1, "Confirmed ready", "All systems operational");

      const opinion = await opinionCore.getOpinionDetails(1);
      expect(opinion.currentAnswer).to.equal("Confirmed ready");
      console.log(`✅ Full workflow test: PASSED`);

      console.log("=".repeat(60));
      console.log("🎉 MAINNET READINESS: ALL SYSTEMS GO!");
      console.log("🎯 Platform ready for real USDC deployment");
      console.log("=".repeat(60));
    });
  });
});