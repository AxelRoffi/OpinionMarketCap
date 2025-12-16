import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("01_AccessControl - Real Access Control Validation", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
  });

  describe("Admin Functions", function () {
    it("should restrict setMinimumPrice to ADMIN_ROLE", async function () {
      const { opinionCore } = contracts;
      const { user1 } = users;

      // User without ADMIN_ROLE should not be able to set minimum price
      await expect(
        opinionCore.connect(user1).setParameter(0, ethers.parseUnits("2", 6))
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // Owner (with ADMIN_ROLE) should be able to set minimum price
      await expect(
        opinionCore.connect(users.owner).setParameter(0, ethers.parseUnits("2", 6))
      ).to.not.be.reverted;

      expect(await opinionCore.minimumPrice()).to.equal(ethers.parseUnits("2", 6));
    });

    it("should restrict togglePublicCreation to ADMIN_ROLE", async function () {
      const { opinionCore } = contracts;
      const { user1 } = users;

      // User without ADMIN_ROLE should not be able to toggle public creation
      await expect(
        opinionCore.connect(user1).togglePublicCreation()
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // Owner (with ADMIN_ROLE) should be able to toggle public creation
      const initialStatus = await opinionCore.isPublicCreationEnabled();
      await expect(
        opinionCore.connect(users.owner).togglePublicCreation()
      ).to.not.be.reverted;

      expect(await opinionCore.isPublicCreationEnabled()).to.not.equal(initialStatus);
    });

    it("should restrict setMaxPriceChange to ADMIN_ROLE", async function () {
      const { opinionCore } = contracts;
      const { user1 } = users;

      // User without ADMIN_ROLE should not be able to set max price change
      await expect(
        opinionCore.connect(user1).setParameter(3, 150)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // Owner (with ADMIN_ROLE) should be able to set max price change
      await expect(
        opinionCore.connect(users.owner).setParameter(3, 150)
      ).to.not.be.reverted;

      expect(await opinionCore.absoluteMaxPriceChange()).to.equal(150);
    });

    it("should revert unauthorized admin access", async function () {
      const { opinionCore, feeManager } = contracts;
      const { user1, user2 } = users;

      // Test multiple admin functions with unauthorized users
      await expect(
        opinionCore.connect(user1).setParameter(3, 200)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      await expect(
        feeManager.connect(user2).setPlatformFeePercent(30) // 30% (uint8)
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");

      await expect(
        opinionCore.connect(user1).pause()
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Moderator Functions", function () {
    beforeEach(async function () {
      // Grant MODERATOR_ROLE to user1 for testing
      const moderatorRole = await contracts.opinionCore.MODERATOR_ROLE();
      await contracts.opinionCore.connect(users.owner).grantRole(moderatorRole, users.user1.address);
      
      // Enable public creation and create an opinion for testing
      await contracts.opinionCore.connect(users.owner).togglePublicCreation();
      await contracts.opinionCore.connect(users.creator).createOpinion(
        "Test Opinion for Moderation",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Crypto"]
      );
    });

    it("should restrict deactivateOpinion to MODERATOR_ROLE", async function () {
      const { opinionCore } = contracts;
      const { user2 } = users;

      // User without MODERATOR_ROLE should not be able to deactivate opinion
      await expect(
        opinionCore.connect(user2).deactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // User1 (with MODERATOR_ROLE) should be able to deactivate opinion
      await expect(
        opinionCore.connect(users.user1).deactivateOpinion(1)
      ).to.not.be.reverted;
    });

    it("should restrict reactivateOpinion to MODERATOR_ROLE", async function () {
      const { opinionCore } = contracts;
      const { user2 } = users;

      // First deactivate the opinion
      await opinionCore.connect(users.user1).deactivateOpinion(1);

      // User without MODERATOR_ROLE should not be able to reactivate opinion
      await expect(
        opinionCore.connect(user2).reactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // User1 (with MODERATOR_ROLE) should be able to reactivate opinion
      await expect(
        opinionCore.connect(users.user1).reactivateOpinion(1)
      ).to.not.be.reverted;
    });

    it("should revert unauthorized moderator access", async function () {
      const { opinionCore } = contracts;
      const { user3 } = users;

      // User without MODERATOR_ROLE should not be able to perform moderation actions
      await expect(
        opinionCore.connect(user3).deactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      await expect(
        opinionCore.connect(user3).reactivateOpinion(1)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Treasury Functions", function () {
    beforeEach(async function () {
      // Setup some fees to test withdrawal
      await contracts.opinionCore.connect(users.owner).togglePublicCreation();
      
      // Create multiple opinions to generate platform fees
      for (let i = 0; i < 3; i++) {
        await contracts.opinionCore.connect(users.creator).createOpinion(
          `Test Opinion ${i}`,
          `Answer ${i}`,
          `Description ${i}`,
          ethers.parseUnits("5", 6),
          ["Technology"]
        );
      }
    });

    it("should restrict withdrawPlatformFees to treasury", async function () {
      const { feeManager } = contracts;
      const { user1 } = users;

      // Check that there are accumulated platform fees
      const platformFees = await feeManager.platformFeesAccumulated();
      expect(platformFees).to.be.gt(0);

      // User without treasury access should not be able to withdraw
      await expect(
        feeManager.connect(user1).withdrawPlatformFees(ethers.parseUnits("1", 6))
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");

      // Treasury should be able to withdraw (owner has treasury role by default)
      await expect(
        feeManager.connect(users.owner).withdrawPlatformFees(ethers.parseUnits("1", 6))
      ).to.not.be.reverted;
    });

    it("should restrict treasury management to ADMIN_ROLE", async function () {
      const { feeManager } = contracts;
      const { user1 } = users;

      // User without ADMIN_ROLE should not be able to update treasury
      await expect(
        feeManager.connect(user1).setTreasury(user1.address)
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");

      // Owner (with admin privileges) should be able to update treasury
      await expect(
        feeManager.connect(users.owner).setTreasury(users.user2.address)
      ).to.not.be.reverted;
    });

    it("should revert unauthorized treasury access", async function () {
      const { feeManager } = contracts;
      const { user2, user3 } = users;

      // Multiple users without treasury access should be rejected
      await expect(
        feeManager.connect(user2).withdrawPlatformFees(ethers.parseUnits("0.5", 6))
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");

      await expect(
        feeManager.connect(user3).withdrawPlatformFees(ethers.parseUnits("0.1", 6))
      ).to.be.revertedWithCustomError(feeManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Role Management", function () {
    it("should allow role transfers by admin", async function () {
      const { opinionCore } = contracts;
      const { user1 } = users;

      const adminRole = await opinionCore.ADMIN_ROLE();
      const moderatorRole = await opinionCore.MODERATOR_ROLE();

      // Admin should be able to grant roles
      await expect(
        opinionCore.connect(users.owner).grantRole(adminRole, user1.address)
      ).to.not.be.reverted;

      await expect(
        opinionCore.connect(users.owner).grantRole(moderatorRole, user1.address)
      ).to.not.be.reverted;

      // Verify roles are granted
      expect(await opinionCore.hasRole(adminRole, user1.address)).to.be.true;
      expect(await opinionCore.hasRole(moderatorRole, user1.address)).to.be.true;

      // Admin should be able to revoke roles
      await expect(
        opinionCore.connect(users.owner).revokeRole(moderatorRole, user1.address)
      ).to.not.be.reverted;

      expect(await opinionCore.hasRole(moderatorRole, user1.address)).to.be.false;
    });

    it("should prevent non-admin role assignments", async function () {
      const { opinionCore } = contracts;
      const { user1, user2 } = users;

      const adminRole = await opinionCore.ADMIN_ROLE();
      const moderatorRole = await opinionCore.MODERATOR_ROLE();

      // User without admin role should not be able to grant roles
      await expect(
        opinionCore.connect(user1).grantRole(adminRole, user2.address)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      await expect(
        opinionCore.connect(user1).grantRole(moderatorRole, user2.address)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");

      // User should not be able to revoke roles either
      await expect(
        opinionCore.connect(user1).revokeRole(adminRole, users.owner.address)
      ).to.be.revertedWithCustomError(opinionCore, "AccessControlUnauthorizedAccount");
    });

    it("should handle multiple role assignments", async function () {
      const { opinionCore, feeManager } = contracts;
      const { user1 } = users;

      const adminRole = await opinionCore.ADMIN_ROLE();
      const moderatorRole = await opinionCore.MODERATOR_ROLE();
      const treasuryRole = await feeManager.TREASURY_ROLE();

      // Grant multiple roles to the same user
      await opinionCore.connect(users.owner).grantRole(adminRole, user1.address);
      await opinionCore.connect(users.owner).grantRole(moderatorRole, user1.address);
      await feeManager.connect(users.owner).grantRole(treasuryRole, user1.address);

      // Verify all roles are assigned
      expect(await opinionCore.hasRole(adminRole, user1.address)).to.be.true;
      expect(await opinionCore.hasRole(moderatorRole, user1.address)).to.be.true;
      expect(await feeManager.hasRole(treasuryRole, user1.address)).to.be.true;

      // User should be able to perform functions from all roles
      await expect(
        opinionCore.connect(user1).setParameter(0, ethers.parseUnits("1.5", 6))
      ).to.not.be.reverted;

      // Create an opinion to test moderation
      await opinionCore.connect(users.owner).togglePublicCreation();
      await opinionCore.connect(users.creator).createOpinion(
        "Multi-role Test",
        "Test Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Politics"]
      );

      await expect(
        opinionCore.connect(user1).deactivateOpinion(1)
      ).to.not.be.reverted;
    });
  });

  describe("Cross-Contract Role Integration", function () {
    it("should maintain role consistency across contracts", async function () {
      const { opinionMarket, opinionCore, feeManager, poolManager } = contracts;
      const { owner } = users;

      // Owner should have admin roles across all contracts
      const adminRole = await opinionCore.ADMIN_ROLE();
      const defaultAdminRole = await opinionMarket.DEFAULT_ADMIN_ROLE();

      expect(await opinionMarket.hasRole(defaultAdminRole, owner.address)).to.be.true;
      expect(await opinionCore.hasRole(defaultAdminRole, owner.address)).to.be.true;
      expect(await feeManager.hasRole(defaultAdminRole, owner.address)).to.be.true;
      expect(await poolManager.hasRole(defaultAdminRole, owner.address)).to.be.true;

      expect(await opinionCore.hasRole(adminRole, owner.address)).to.be.true;
    });

    it("should enforce contract-specific role restrictions", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;

      const marketRole = await opinionCore.MARKET_CONTRACT_ROLE();
      
      // Only OpinionMarket contract should have MARKET_CONTRACT_ROLE
      expect(await opinionCore.hasRole(marketRole, await opinionMarket.getAddress())).to.be.true;
      expect(await opinionCore.hasRole(marketRole, user1.address)).to.be.false;

      // This test validates that only the market contract has the market role
      // Regular users cannot call market-specific functions
      expect(await opinionCore.hasRole(marketRole, user1.address)).to.be.false;
    });
  });
});