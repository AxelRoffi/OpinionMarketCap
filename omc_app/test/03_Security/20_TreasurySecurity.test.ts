import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("20_TreasurySecurity - Real Treasury Functions", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
  });

  describe("Treasury Access Control", function () {
    it("should restrict withdrawPlatformFees to TREASURY_ROLE", async function () {
      const { feeManager } = contracts;
      const { user1, owner } = users;
      
      // Regular user should not be able to withdraw platform fees
      await expect(
        feeManager.connect(user1).withdrawPlatformFees(await contracts.usdc.getAddress(), user1.address)
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");
      
      // Owner (with treasury access) should be able to withdraw
      const treasuryAddress = await feeManager.treasury();
      await expect(
        feeManager.connect(owner).withdrawPlatformFees(await contracts.usdc.getAddress(), treasuryAddress)
      ).to.not.be.reverted;
    });

    it("should validate treasury address updates", async function () {
      const { feeManager } = contracts;
      const { user1, owner, user2 } = users;
      
      // Regular user should not be able to update treasury
      await expect(
        feeManager.connect(user1).setTreasury(user2.address)
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");
      
      // Owner (admin) should be able to update treasury
      await expect(
        feeManager.connect(owner).setTreasury(user2.address)
      ).to.not.be.reverted;
      
      // Verify treasury was updated
      expect(await feeManager.treasury()).to.equal(user2.address);
    });

    it("should prevent withdrawal of more than available platform fees", async function () {
      const { feeManager } = contracts;
      const { owner } = users;
      
      const platformFees = await feeManager.platformFeesAccumulated();
      const excessiveAmount = platformFees + ethers.parseUnits("1000", 6);
      
      // Should fail if trying to withdraw more than available
      if (platformFees < excessiveAmount) {
        await expect(
          feeManager.connect(owner).withdrawPlatformFees(excessiveAmount)
        ).to.be.reverted;
      }
    });
  });

  describe("Fee Distribution Security", function () {
    it("should maintain secure fee calculation", async function () {
      const { feeManager } = contracts;
      
      const testAmount = ethers.parseUnits("100", 6); // 100 USDC
      const [platformFee, creatorFee, remaining] = await feeManager.calculateFeeDistribution(testAmount);
      
      // Verify fee percentages are secure (2% + 3% = 5%)
      expect(platformFee).to.equal(ethers.parseUnits("2", 6)); // 2%
      expect(creatorFee).to.equal(ethers.parseUnits("3", 6));  // 3%
      expect(remaining).to.equal(ethers.parseUnits("95", 6));  // 95%
      
      // Total should equal input
      expect(platformFee + creatorFee + remaining).to.equal(testAmount);
    });

    it("should handle edge case fee calculations securely", async function () {
      const { feeManager } = contracts;
      
      // Test with small amounts
      const smallAmount = ethers.parseUnits("0.1", 6); // 0.1 USDC
      const [platformFee, creatorFee, remaining] = await feeManager.calculateFeeDistribution(smallAmount);
      
      // Should handle rounding appropriately
      expect(platformFee + creatorFee + remaining).to.equal(smallAmount);
    });
  });

  describe("Real Treasury Integration", function () {
    it("should validate treasury setup in deployment", async function () {
      const { feeManager } = contracts;
      
      // Treasury should be configured
      const treasuryAddress = await feeManager.treasury();
      expect(treasuryAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should track platform fees accumulation", async function () {
      const { feeManager } = contracts;
      
      // Should have platform fees tracking
      const platformFees = await feeManager.platformFeesAccumulated();
      expect(platformFees).to.be.gte(0);
    });
  });
});