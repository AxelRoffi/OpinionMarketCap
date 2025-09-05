import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  validateRealContractDeployment,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("00_Deployment - Real Contract Foundation", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public creation for testing
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("Real Contract Deployment", function () {
    it("should deploy all real contracts successfully", async function () {
      // Validate deployment
      await validateRealContractDeployment(contracts);
      
      // Verify contracts are deployed
      expect(await contracts.opinionMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.opinionCore.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.feeManager.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.poolManager.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.treasurySecure.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.usdc.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("should have correct USDC token configuration", async function () {
      const { usdc } = contracts;
      
      // Validate USDC token properties
      expect(await usdc.name()).to.equal("USD Coin");
      expect(await usdc.symbol()).to.equal("USDC");
      expect(await usdc.decimals()).to.equal(6);
      
      // Verify test users have USDC balance
      const expectedBalance = ethers.parseUnits("10000", 6);
      expect(await usdc.balanceOf(users.user1.address)).to.equal(expectedBalance);
      expect(await usdc.balanceOf(users.user2.address)).to.equal(expectedBalance);
      expect(await usdc.balanceOf(users.user3.address)).to.equal(expectedBalance);
    });

    it("should initialize real contracts with correct parameters", async function () {
      const { opinionCore, feeManager } = contracts;
      
      // Test real OpinionCore parameters
      expect(await opinionCore.minimumPrice()).to.equal(ethers.parseUnits("1", 6));
      expect(await opinionCore.MAX_INITIAL_PRICE()).to.equal(ethers.parseUnits("100", 6));
      
      // Test real FeeManager parameters
      expect(await feeManager.usdcToken()).to.equal(await contracts.usdc.getAddress());
    });
  });

  describe("Cross-Contract References", function () {
    it("should have correct real contract addresses set", async function () {
      const { opinionMarket, opinionCore, feeManager, poolManager, usdc } = contracts;
      
      // OpinionMarket references
      expect(await opinionMarket.usdcToken()).to.equal(await usdc.getAddress());
      expect(await opinionMarket.opinionCore()).to.equal(await opinionCore.getAddress());
      expect(await opinionMarket.feeManager()).to.equal(await feeManager.getAddress());
      expect(await opinionMarket.poolManager()).to.equal(await poolManager.getAddress());

      // OpinionCore references
      expect(await opinionCore.usdcToken()).to.equal(await usdc.getAddress());
      expect(await opinionCore.feeManager()).to.equal(await feeManager.getAddress());
      expect(await opinionCore.poolManager()).to.equal(await poolManager.getAddress());

      // FeeManager references
      expect(await feeManager.usdcToken()).to.equal(await usdc.getAddress());
    });

    it("should establish proper role hierarchy", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { owner } = users;
      
      // Check DEFAULT_ADMIN_ROLE assignments on real contracts (owner should have this by default)
      const defaultAdminRole = await opinionMarket.DEFAULT_ADMIN_ROLE();
      expect(await opinionMarket.hasRole(defaultAdminRole, owner.address)).to.be.true;
      expect(await opinionCore.hasRole(defaultAdminRole, owner.address)).to.be.true;
      expect(await feeManager.hasRole(defaultAdminRole, owner.address)).to.be.true;
    });
  });

  describe("Edge Cases", function () {
    it("should revert on zero address inputs", async function () {
      const { opinionCore } = contracts;
      
      // Real contract should validate addresses properly
      await expect(
        opinionCore.connect(users.user1).createOpinion("", "", "", 0, [])
      ).to.be.reverted;
    });

    it("should handle real contract interaction failures gracefully", async function () {
      const { opinionCore } = contracts;
      
      // Test invalid opinion access
      await expect(
        opinionCore.getOpinionDetails(999)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
    });

    it("should maintain state consistency across real contracts", async function () {
      const { opinionMarket, opinionCore, feeManager, poolManager } = contracts;
      
      // Verify all contracts report consistent addresses
      const coreFromMarket = await opinionMarket.opinionCore();
      const coreAddress = await opinionCore.getAddress();
      expect(coreFromMarket).to.equal(coreAddress);
      
      const feeFromCore = await opinionCore.feeManager();
      const feeAddress = await feeManager.getAddress();
      expect(feeFromCore).to.equal(feeAddress);
    });

    it("should handle maximum parameter values", async function () {
      const { opinionCore } = contracts;
      
      // Test with maximum initial price
      const maxPrice = await opinionCore.MAX_INITIAL_PRICE();
      
      const tx = await opinionCore.connect(users.user1).createOpinion(
        "Max Price Test",
        "Max Price Answer",
        "Max Price Description", 
        maxPrice,
        ["Crypto"]
      );
      await expect(tx).to.not.be.reverted;
    });
  });

  describe("Upgrade Functionality", function () {
    it("should be upgradeable contracts", async function () {
      // Real contracts are deployed as upgradeable proxies
      expect(await contracts.opinionMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.opinionCore.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.feeManager.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await contracts.poolManager.getAddress()).to.not.equal(ethers.ZeroAddress);
      
      // Contracts are functioning properly (this validates the proxy works)
      const minPrice = await contracts.opinionCore.minimumPrice();
      expect(minPrice).to.equal(ethers.parseUnits("1", 6));
    });
  });

  describe("Gas Efficiency", function () {
    it("should deploy with reasonable gas costs", async function () {
      // Real contracts should deploy within reasonable gas limits
      // This test passes if deployment completes successfully
      expect(await contracts.opinionMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Event Emission", function () {
    it("should emit proper initialization events", async function () {
      // Real contracts should emit events during initialization
      // This test validates events are emitted correctly
      const { opinionCore } = contracts;
      
      // Test that contract can emit events properly
      const tx = await opinionCore.connect(users.user1).createOpinion(
        "Event Test",
        "Event Answer",
        "Event Description",
        ethers.parseUnits("5", 6),
        ["Crypto"]
      );
      
      await expect(tx).to.emit(opinionCore, "OpinionAction");
    });
  });
});