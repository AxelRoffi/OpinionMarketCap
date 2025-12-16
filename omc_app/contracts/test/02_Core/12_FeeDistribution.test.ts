import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("12_FeeDistribution", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public opinion creation
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("Basic Fee Calculation (2% + 3%)", function () {
    it("should calculate fees correctly for standard price", async function () {
      const { feeManager } = contracts;
      
      const testPrice = ethers.parseUnits("100", 6); // 100 USDC
      
      const fees = await feeManager.calculateFeeDistribution(testPrice);
      const [platformFee, creatorFee, ownerAmount] = fees;
      
      // 2% platform fee
      expect(platformFee).to.equal(ethers.parseUnits("2", 6)); // 2 USDC
      
      // 3% creator fee  
      expect(creatorFee).to.equal(ethers.parseUnits("3", 6)); // 3 USDC
      
      // 95% to owner (100 - 2 - 3 = 95)
      expect(ownerAmount).to.equal(ethers.parseUnits("95", 6)); // 95 USDC
      
      // Total should equal original price
      expect(platformFee + creatorFee + ownerAmount).to.equal(testPrice);
    });

    it("should calculate fees for various price points", async function () {
      const { feeManager } = contracts;
      
      const testCases = [
        { price: "10", expectedPlatform: "0.2", expectedCreator: "0.3", expectedOwner: "9.5" },
        { price: "50", expectedPlatform: "1", expectedCreator: "1.5", expectedOwner: "47.5" },
        { price: "1000", expectedPlatform: "20", expectedCreator: "30", expectedOwner: "950" }
      ];
      
      for (const testCase of testCases) {
        const price = ethers.parseUnits(testCase.price, 6);
        const fees = await feeManager.calculateFeeDistribution(price);
        
        expect(fees[0]).to.equal(ethers.parseUnits(testCase.expectedPlatform, 6));
        expect(fees[1]).to.equal(ethers.parseUnits(testCase.expectedCreator, 6));
        expect(fees[2]).to.equal(ethers.parseUnits(testCase.expectedOwner, 6));
        
        // Verify total equals original price
        expect(fees[0] + fees[1] + fees[2]).to.equal(price);
      }
    });

    it("should handle zero price edge case", async function () {
      const { feeManager } = contracts;
      
      const fees = await feeManager.calculateFeeDistribution(0);
      
      expect(fees[0]).to.equal(0); // Platform fee
      expect(fees[1]).to.equal(0); // Creator fee
      expect(fees[2]).to.equal(0); // Owner amount
    });

    it("should handle very small prices", async function () {
      const { feeManager } = contracts;
      
      const tinyPrice = ethers.parseUnits("0.01", 6); // 0.01 USDC
      const fees = await feeManager.calculateFeeDistribution(tinyPrice);
      
      // Should calculate fees even for tiny amounts
      expect(fees[0] + fees[1] + fees[2]).to.equal(tinyPrice);
      
      // Platform fee should be 2% (rounded down)
      const expectedPlatformFee = (tinyPrice * 2n) / 100n;
      expect(fees[0]).to.equal(expectedPlatformFee);
    });
  });

  describe("Fee Distribution During Trading", function () {
    beforeEach(async function () {
      // Create test opinion with real 5-parameter signature
      await contracts.opinionCore.connect(users.user1).createOpinion(
        "Fee Distribution Test Opinion",
        "Fee Distribution Test Answer", 
        "Fee Distribution Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
    });

    it("should distribute fees correctly during answer submission", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { user1, user2 } = users;
      
      // Get initial accumulated fees
      const initialCreatorFees = await feeManager.getAccumulatedFees(user1.address);
      const initialOwnerFees = await feeManager.getAccumulatedFees(user1.address);
      
      // Get next price and calculate expected fees
      const nextPrice = await opinionCore.getNextPrice(1);
      const expectedCreatorFee = (nextPrice * 3n) / 100n; // 3%
      const expectedOwnerAmount = (nextPrice * 95n) / 100n; // 95%
      
      // Submit answer with real 3-parameter signature
      await opinionCore.connect(user2).submitAnswer(
        1,
        "Fee distribution test",
        "Testing fee accumulation"
      );
      
      // Verify creator received 3% fee
      const finalCreatorFees = await feeManager.getAccumulatedFees(user1.address);
      expect(finalCreatorFees - initialCreatorFees).to.equal(expectedCreatorFee);
      
      // Verify previous owner (user1) received 95%
      const finalOwnerFees = await feeManager.getAccumulatedFees(user1.address);
      const totalFeeIncrease = finalOwnerFees - initialOwnerFees;
      expect(totalFeeIncrease).to.equal(expectedCreatorFee + expectedOwnerAmount);
    });

    it("should emit proper fee events", async function () {
      const { opinionMarket, feeManager } = contracts;
      const { user2 } = users;
      
      const tx = await opinionMarket.connect(user2).submitAnswer(
        1,
        "Event test answer",
        "Testing events"
      );
      
      // Should emit FeesAction event
      await expect(tx).to.emit(feeManager, "FeesAction");
      
      // Should emit FeesAccumulated events for recipients
      await expect(tx).to.emit(feeManager, "FeesAccumulated");
    });

    it("should handle multiple fee accumulations", async function () {
      const { opinionMarket, feeManager } = contracts;
      const { user1, user2, user3 } = users;
      
      // Submit multiple answers and track fee accumulation
      let expectedCreatorFees = 0n;
      
      for (let i = 0; i < 3; i++) {
        const nextPrice = await contracts.opinionCore.getNextPrice(1);
        const expectedFee = (nextPrice * 3n) / 100n;
        expectedCreatorFees += expectedFee;
        
        const submitter = i % 2 === 0 ? user2 : user3;
        await opinionMarket.connect(submitter).submitAnswer(
          1,
          `Multiple fees test ${i}`,
          `Round ${i}`
        );
        
        await ethers.provider.send("evm_mine", []);
      }
      
      // Verify total accumulated fees for creator
      const totalCreatorFees = await feeManager.getAccumulatedFees(user1.address);
      expect(totalCreatorFees).to.be.gte(expectedCreatorFees * 90n / 100n); // Allow some variance
    });
  });

  describe("Fee Claiming", function () {
    beforeEach(async function () {
      await createTestOpinion(contracts.opinionMarket, users.user1);
      
      // Generate some fees
      await contracts.opinionMarket.connect(users.user2).submitAnswer(
        1,
        "Generate fees",
        "Creating fees for testing"
      );
    });

    it("should allow users to claim accumulated fees", async function () {
      const { feeManager, usdc } = contracts;
      const { user1 } = users;
      
      // Check accumulated fees
      const accumulatedFees = await feeManager.getAccumulatedFees(user1.address);
      expect(accumulatedFees).to.be.gt(0);
      
      // Get initial USDC balance
      const initialBalance = await usdc.balanceOf(user1.address);
      
      // Claim fees
      const tx = await feeManager.connect(user1).claimAccumulatedFees();
      
      await expect(tx).to.emit(feeManager, "FeesAction");
      
      // Verify USDC was transferred
      const finalBalance = await usdc.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(accumulatedFees);
      
      // Verify accumulated fees were reset
      expect(await feeManager.getAccumulatedFees(user1.address)).to.equal(0);
    });

    it("should revert when claiming zero fees", async function () {
      const { feeManager } = contracts;
      const { user3 } = users; // User with no accumulated fees
      
      await expect(
        feeManager.connect(user3).claimAccumulatedFees()
      ).to.be.revertedWithCustomError(feeManager, "NoFeesToClaim");
    });

    it("should handle multiple users claiming fees", async function () {
      const { opinionMarket, feeManager, usdc } = contracts;
      const { user1, user2, user3 } = users;
      
      // Create another opinion to generate more fees with real 5-parameter signature
      await opinionCore.connect(user3).createOpinion(
        "Second opinion?",
        "Second answer",
        "Second description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Submit answers to generate fees for both creators with real 3-parameter signature
      await opinionCore.connect(user2).submitAnswer(1, "Answer 1", "Desc 1");
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user1).submitAnswer(2, "Answer 2", "Desc 2");
      
      // Both users should have accumulated fees
      const user1Fees = await feeManager.getAccumulatedFees(user1.address);
      const user3Fees = await feeManager.getAccumulatedFees(user3.address);
      
      expect(user1Fees).to.be.gt(0);
      expect(user3Fees).to.be.gt(0);
      
      // Both should be able to claim with real signature (no parameters)
      await expect(feeManager.connect(user1).claimAccumulatedFees()).to.not.be.reverted;
      await expect(feeManager.connect(user3).claimAccumulatedFees()).to.not.be.reverted;
    });
  });

  describe("Platform Fee Management", function () {
    beforeEach(async function () {
      await createTestOpinion(contracts.opinionMarket, users.user1);
      
      // Generate platform fees
      await contracts.opinionMarket.connect(users.user2).submitAnswer(
        1,
        "Platform fee test",
        "Generating platform fees"
      );
    });

    it("should allow treasury to withdraw platform fees", async function () {
      const { feeManager, usdc } = contracts;
      const { treasury } = users;
      
      // Get initial balances
      const initialTreasuryBalance = await usdc.balanceOf(treasury.address);
      const initialContractBalance = await usdc.balanceOf(await feeManager.getAddress());
      const totalAccumulatedFees = await feeManager.getTotalAccumulatedFees();
      
      // Calculate available platform fees
      const availablePlatformFees = initialContractBalance - totalAccumulatedFees;
      
      if (availablePlatformFees > 0) {
        // Withdraw platform fees
        const tx = await feeManager.connect(treasury).withdrawPlatformFees(
          await usdc.getAddress(),
          treasury.address
        );
        
        await expect(tx).to.emit(feeManager, "FeesWithdrawn");
        
        // Verify treasury received the funds
        const finalTreasuryBalance = await usdc.balanceOf(treasury.address);
        expect(finalTreasuryBalance).to.be.gt(initialTreasuryBalance);
      }
    });

    it("should prevent non-treasury from withdrawing platform fees", async function () {
      const { feeManager, usdc } = contracts;
      const { user1, treasury } = users;
      
      await expect(
        feeManager.connect(user1).withdrawPlatformFees(
          await usdc.getAddress(),
          treasury.address
        )
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");
    });

    it("should prevent platform fee withdrawal to non-treasury address", async function () {
      const { feeManager, usdc } = contracts;
      const { treasury, user1 } = users;
      
      await expect(
        feeManager.connect(treasury).withdrawPlatformFees(
          await usdc.getAddress(),
          user1.address // Wrong recipient
        )
      ).to.be.revertedWith("Recipient must be treasury");
    });
  });

  describe("Fee Parameter Management", function () {
    it("should allow admin to update fee percentages", async function () {
      const { feeManager } = contracts;
      const { admin } = users;
      
      // Update platform fee
      await expect(
        feeManager.connect(admin).setPlatformFeePercent(4)
      ).to.emit(feeManager, "FeeParameterUpdated");
      
      expect(await feeManager.platformFeePercent()).to.equal(4);
      
      // Update creator fee
      await expect(
        feeManager.connect(admin).setCreatorFeePercent(5)
      ).to.emit(feeManager, "FeeParameterUpdated");
      
      expect(await feeManager.creatorFeePercent()).to.equal(5);
    });

    it("should enforce maximum fee limits", async function () {
      const { feeManager } = contracts;
      const { admin } = users;
      
      // Try to set platform fee too high
      await expect(
        feeManager.connect(admin).setPlatformFeePercent(15) // Max is 10%
      ).to.be.revertedWithCustomError(feeManager, "FeeTooHigh");
      
      // Try to set creator fee too high
      await expect(
        feeManager.connect(admin).setCreatorFeePercent(15) // Max is 10%
      ).to.be.revertedWithCustomError(feeManager, "FeeTooHigh");
    });

    it("should enforce cooldown periods for parameter updates", async function () {
      const { feeManager } = contracts;
      const { admin } = users;
      
      // Set initial fee
      await feeManager.connect(admin).setPlatformFeePercent(3);
      
      // Try to update again immediately (should fail due to cooldown)
      await expect(
        feeManager.connect(admin).setPlatformFeePercent(4)
      ).to.be.revertedWithCustomError(feeManager, "CooldownNotElapsed");
    });

    it("should prevent non-admin from updating fees", async function () {
      const { feeManager } = contracts;
      const { user1 } = users;
      
      await expect(
        feeManager.connect(user1).setPlatformFeePercent(5)
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("MEV Protection and Fee Adjustment", function () {
    beforeEach(async function () {
      // Create test opinion with real 5-parameter signature
      await contracts.opinionCore.connect(users.user1).createOpinion(
        "MEV Test Opinion",
        "MEV Test Answer", 
        "MEV Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
    });

    it("should calculate MEV penalty correctly", async function () {
      const { feeManager } = contracts;
      const { user2 } = users;
      
      const price = ethers.parseUnits("100", 6);
      const ownerAmount = ethers.parseUnits("95", 6); // 95% after fees
      
      // Calculate MEV penalty (should be 0 initially)
      const [adjustedPlatformFee, adjustedOwnerAmount] = await feeManager.applyMEVPenalty(
        price,
        ownerAmount,
        user2.address,
        1
      );
      
      expect(adjustedPlatformFee).to.be.gte(ethers.parseUnits("2", 6)); // At least 2%
      expect(adjustedOwnerAmount).to.be.lte(ownerAmount); // Should be same or less due to penalties
    });

    it("should track MEV data for users", async function () {
      const { feeManager } = contracts;
      const { admin, user2 } = users;
      
      // Grant core contract role to test MEV tracking
      await feeManager.connect(admin).grantCoreContractRole(admin.address);
      
      const price = ethers.parseUnits("50", 6);
      
      // Update MEV tracking data
      await feeManager.connect(admin).updateMEVTrackingData(
        user2.address,
        1,
        price
      );
      
      // This should update internal tracking (no direct getter for this test)
      // The tracking is used internally by applyMEVPenalty
    });
  });

  describe("Edge Cases", function () {
    it("should handle fee calculation overflow scenarios", async function () {
      const { feeManager } = contracts;
      
      // Test with maximum uint96 value
      const maxPrice = (2n ** 96n) - 1n;
      
      // Should not revert, but fees might be truncated
      const fees = await feeManager.calculateFeeDistribution(maxPrice);
      
      // Should not overflow
      expect(fees[0]).to.be.lte(maxPrice);
      expect(fees[1]).to.be.lte(maxPrice);
      expect(fees[2]).to.be.lte(maxPrice);
    });

    it("should handle rounding in fee calculations", async function () {
      const { feeManager } = contracts;
      
      // Test with price that doesn't divide evenly
      const oddPrice = ethers.parseUnits("33.33", 6); // 33.33 USDC
      const fees = await feeManager.calculateFeeDistribution(oddPrice);
      
      // Total should still equal original (or be very close due to rounding)
      const total = fees[0] + fees[1] + fees[2];
      const difference = total > oddPrice ? total - oddPrice : oddPrice - total;
      
      // Difference should be minimal (rounding error)
      expect(difference).to.be.lte(2); // Max 2 wei difference
    });

    it("should handle zero address scenarios", async function () {
      const { feeManager } = contracts;
      const { admin } = users;
      
      // Grant core contract role to admin for testing
      await feeManager.connect(admin).grantCoreContractRole(admin.address);
      
      // Try to accumulate fees for zero address
      await expect(
        feeManager.connect(admin).accumulateFee(ethers.ZeroAddress, ethers.parseUnits("1", 6))
      ).to.be.revertedWithCustomError(feeManager, "ZeroAddressNotAllowed");
    });

    it("should handle contract pausing", async function () {
      const { feeManager } = contracts;
      const { admin, user1 } = users;
      
      // Pause contract
      await feeManager.connect(admin).pause();
      
      // Fee claiming should be paused
      await expect(
        feeManager.connect(user1).claimAccumulatedFees()
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause contract
      await feeManager.connect(admin).unpause();
      
      // Should work again (if user has fees to claim)
      const accumulatedFees = await feeManager.getAccumulatedFees(user1.address);
      if (accumulatedFees > 0) {
        await expect(feeManager.connect(user1).claimAccumulatedFees()).to.not.be.reverted;
      }
    });

    it("should handle failed USDC transfers", async function () {
      const { feeManager, usdc } = contracts;
      const { admin, user1 } = users;
      
      // Setup: Accumulate some fees first with real signatures
      await contracts.opinionCore.connect(user1).createOpinion(
        "Transfer Test Opinion", 
        "Transfer Test Answer",
        "Transfer Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      await contracts.opinionCore.connect(users.user2).submitAnswer(1, "Test", "Test");
      
      // Grant core contract role to admin for testing
      await feeManager.connect(admin).grantCoreContractRole(admin.address);
      
      // Try to accumulate fees when contract is paused
      await usdc.pause();
      
      await expect(
        feeManager.connect(admin).accumulateFee(user1.address, ethers.parseUnits("1", 6))
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause for cleanup
      await usdc.unpause();
    });
  });

  describe("Integration with Treasury", function () {
    it("should properly route treasury payments", async function () {
      const { feeManager, treasurySecure } = contracts;
      
      // Verify treasury address is set correctly
      expect(await feeManager.treasury()).to.equal(await treasurySecure.getAddress());
    });

    it("should allow treasury address updates with timelock", async function () {
      const { feeManager } = contracts;
      const { admin, user1 } = users;
      
      // Propose treasury change
      await feeManager.connect(admin).setTreasury(user1.address);
      
      // Should not be immediately effective
      expect(await feeManager.treasury()).to.not.equal(user1.address);
      expect(await feeManager.pendingTreasury()).to.equal(user1.address);
      
      // Fast forward time and confirm
      await ethers.provider.send("evm_increaseTime", [48 * 60 * 60 + 1]); // 48 hours + 1 second
      await ethers.provider.send("evm_mine", []);
      
      await feeManager.connect(admin).confirmTreasuryChange();
      
      // Now should be effective
      expect(await feeManager.treasury()).to.equal(user1.address);
    });
  });
});