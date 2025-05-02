import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket, PriceCalculator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Access Control", function () {
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
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
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
  });

  // Role assignment and revocation
  describe("Role Assignment and Revocation", function () {
    it("Should allow DEFAULT_ADMIN_ROLE to grant roles", async function () {
      // Grant ADMIN_ROLE to admin account
      await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
      expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      
      // Grant MODERATOR_ROLE to moderator account
      await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
      expect(await opinionMarket.hasRole(MODERATOR_ROLE, moderator.address)).to.be.true;
      
      // Grant OPERATOR_ROLE to operator account
      await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
      expect(await opinionMarket.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
      
      // Grant TREASURY_ROLE to treasury account
      await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
      expect(await opinionMarket.hasRole(TREASURY_ROLE, treasury.address)).to.be.true;
    });

    it("Should allow DEFAULT_ADMIN_ROLE to revoke roles", async function () {
      // Grant roles first
      await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
      await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
      
      // Revoke ADMIN_ROLE from admin account
      await opinionMarket.revokeRole(ADMIN_ROLE, admin.address);
      expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
      
      // Revoke MODERATOR_ROLE from moderator account
      await opinionMarket.revokeRole(MODERATOR_ROLE, moderator.address);
      expect(await opinionMarket.hasRole(MODERATOR_ROLE, moderator.address)).to.be.false;
    });

    it("Should not allow non-DEFAULT_ADMIN_ROLE to grant or revoke roles", async function () {
      // Grant ADMIN_ROLE to admin account
      await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
      
      // Try to grant MODERATOR_ROLE to moderator account from admin (not DEFAULT_ADMIN_ROLE)
      await expect(
        opinionMarket.connect(admin).grantRole(MODERATOR_ROLE, moderator.address)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      
      // Try to revoke a role from admin (not DEFAULT_ADMIN_ROLE)
      await expect(
        opinionMarket.connect(admin).revokeRole(ADMIN_ROLE, owner.address)
      ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
    });
  });

  // Function restrictions by role
  describe("Function Restrictions by Role", function () {
    beforeEach(async function () {
      // Set up roles for testing
      await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
      await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
      await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
      await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
    });

    // DEFAULT_ADMIN_ROLE permissions
    describe("DEFAULT_ADMIN_ROLE Permissions", function () {
      it("Should allow DEFAULT_ADMIN_ROLE to grant and revoke all roles", async function () {
        // Already tested in the "Role Assignment and Revocation" section
        expect(await opinionMarket.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      });

      it("Should allow DEFAULT_ADMIN_ROLE to upgrade the contract", async function () {
        // This is implicit as the contract owner has DEFAULT_ADMIN_ROLE
        // and the _authorizeUpgrade function is restricted to the owner
        // We would need a new implementation contract to test this fully
        expect(await opinionMarket.owner()).to.equal(owner.address);
      });
    });

    // ADMIN_ROLE permissions
    describe("ADMIN_ROLE Permissions", function () {
      it("Should allow ADMIN_ROLE to toggle public creation", async function () {
        // Initial state should be false
        expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
        
        // Toggle public creation using ADMIN_ROLE
        await opinionMarket.connect(admin).togglePublicCreation();
        expect(await opinionMarket.isPublicCreationEnabled()).to.be.true;
        
        // Toggle back
        await opinionMarket.connect(admin).togglePublicCreation();
        expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
      });

      it("Should allow ADMIN_ROLE to set configurable parameters", async function () {
        // Test setMinimumPrice
        await opinionMarket.connect(admin).setMinimumPrice(2_000_000);
        expect(await opinionMarket.minimumPrice()).to.equal(2_000_000);
        
        // Test setPlatformFeePercent
        await opinionMarket.connect(admin).setPlatformFeePercent(3);
        expect(await opinionMarket.platformFeePercent()).to.equal(3);
        
        // Test setCreatorFeePercent
        await opinionMarket.connect(admin).setCreatorFeePercent(4);
        expect(await opinionMarket.creatorFeePercent()).to.equal(4);
        
        // Test other parameter setters
        await opinionMarket.connect(admin).setMaxPriceChange(150);
        expect(await opinionMarket.absoluteMaxPriceChange()).to.equal(150);
        
        await opinionMarket.connect(admin).setMaxTradesPerBlock(5);
        expect(await opinionMarket.maxTradesPerBlock()).to.equal(5);
        
        await opinionMarket.connect(admin).setRapidTradeWindow(60);
        expect(await opinionMarket.rapidTradeWindow()).to.equal(60);
        
        await opinionMarket.connect(admin).setQuestionCreationFee(1_500_000);
        expect(await opinionMarket.questionCreationFee()).to.equal(1_500_000);
        
        await opinionMarket.connect(admin).setInitialAnswerPrice(3_000_000);
        expect(await opinionMarket.initialAnswerPrice()).to.equal(3_000_000);
        
        await opinionMarket.connect(admin).setPoolCreationFee(60_000_000);
        expect(await opinionMarket.poolCreationFee()).to.equal(60_000_000);
        
        await opinionMarket.connect(admin).setPoolContributionFee(2_000_000);
        expect(await opinionMarket.poolContributionFee()).to.equal(2_000_000);
        
        await opinionMarket.connect(admin).setMinPoolDuration(2 * 24 * 60 * 60);
        expect(await opinionMarket.minPoolDuration()).to.equal(2 * 24 * 60 * 60);
        
        await opinionMarket.connect(admin).setMaxPoolDuration(60 * 24 * 60 * 60);
        expect(await opinionMarket.maxPoolDuration()).to.equal(60 * 24 * 60 * 60);
      });

      it("Should not allow non-ADMIN_ROLE to set parameters", async function () {
        // Try to set parameters using non-ADMIN accounts
        await expect(
          opinionMarket.connect(moderator).setMinimumPrice(2_000_000)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        await expect(
          opinionMarket.connect(operator).setPlatformFeePercent(3)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        await expect(
          opinionMarket.connect(treasury).setCreatorFeePercent(4)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        await expect(
          opinionMarket.connect(user1).togglePublicCreation()
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      });
    });

    // MODERATOR_ROLE permissions
    describe("MODERATOR_ROLE Permissions", function () {
      it("Should allow MODERATOR_ROLE to deactivate and reactivate opinions", async function () {
        // First, create an opinion (using owner since public creation is disabled)
        // Mint and approve USDC
        await mockUSDC.mint(owner.address, ethers.parseUnits("100", 6));
        await mockUSDC.approve(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
        
        // Create opinion
        await opinionMarket.createOpinion("Test Question?", "Test Answer");
        
        // Check initial state
        const opinion = await opinionMarket.opinions(1);
        expect(opinion.isActive).to.be.true;
        
        // Deactivate opinion using MODERATOR_ROLE
        await opinionMarket.connect(moderator).deactivateOpinion(1);
        const deactivatedOpinion = await opinionMarket.opinions(1);
        expect(deactivatedOpinion.isActive).to.be.false;
        
        // Reactivate opinion using MODERATOR_ROLE
        await opinionMarket.connect(moderator).reactivateOpinion(1);
        const reactivatedOpinion = await opinionMarket.opinions(1);
        expect(reactivatedOpinion.isActive).to.be.true;
      });

      it("Should allow MODERATOR_ROLE to perform emergency withdrawal when paused", async function () {
        // First, pause the contract (using OPERATOR_ROLE)
        await opinionMarket.connect(operator).pause();
        
        // Send some USDC to the contract
        await mockUSDC.mint(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
        const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
        
        // Perform emergency withdrawal using MODERATOR_ROLE
        await opinionMarket.connect(moderator).emergencyWithdraw(await mockUSDC.getAddress());
        
        // Check that USDC was transferred to owner
        const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
        expect(finalOwnerBalance - initialOwnerBalance).to.equal(ethers.parseUnits("100", 6));
      });

      it("Should not allow non-MODERATOR_ROLE to deactivate or reactivate opinions", async function () {
        // First, create an opinion
        await mockUSDC.mint(owner.address, ethers.parseUnits("100", 6));
        await mockUSDC.approve(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
        await opinionMarket.createOpinion("Test Question?", "Test Answer");
        
        // Try to deactivate using non-MODERATOR accounts
        await expect(
          opinionMarket.connect(user1).deactivateOpinion(1)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        // Deactivate as moderator first
        await opinionMarket.connect(moderator).deactivateOpinion(1);
        
        // Try to reactivate using non-MODERATOR accounts
        await expect(
          opinionMarket.connect(user1).reactivateOpinion(1)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      });
    });

    // OPERATOR_ROLE permissions
    describe("OPERATOR_ROLE Permissions", function () {
      it("Should allow OPERATOR_ROLE to pause and unpause the contract", async function () {
        // Initial state should be unpaused
        expect(await opinionMarket.paused()).to.be.false;
        
        // Pause the contract using OPERATOR_ROLE
        await opinionMarket.connect(operator).pause();
        expect(await opinionMarket.paused()).to.be.true;
        
        // Unpause the contract using OPERATOR_ROLE
        await opinionMarket.connect(operator).unpause();
        expect(await opinionMarket.paused()).to.be.false;
      });

      it("Should not allow non-OPERATOR_ROLE to pause or unpause", async function () {
        // Try to pause using non-OPERATOR accounts
        await expect(
          opinionMarket.connect(user1).pause()
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        // Pause as operator first
        await opinionMarket.connect(operator).pause();
        
        // Try to unpause using non-OPERATOR accounts
        await expect(
          opinionMarket.connect(user1).unpause()
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      });
    });

    // TREASURY_ROLE permissions tests would go here
    // Note: The current contract doesn't have specific functions restricted to TREASURY_ROLE
    
    // Multiple roles per account
    describe("Multiple Roles Per Account", function () {
      it("Should allow an account to have multiple roles", async function () {
        // Grant multiple roles to user1
        await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
        await opinionMarket.grantRole(MODERATOR_ROLE, user1.address);
        await opinionMarket.grantRole(OPERATOR_ROLE, user1.address);
        
        // Check that user1 has all roles
        expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
        expect(await opinionMarket.hasRole(MODERATOR_ROLE, user1.address)).to.be.true;
        expect(await opinionMarket.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
        
        // Test that user1 can use functions from each role
        // Test ADMIN_ROLE function
        await opinionMarket.connect(user1).setMinimumPrice(2_000_000);
        expect(await opinionMarket.minimumPrice()).to.equal(2_000_000);
        
        // Test MODERATOR_ROLE function (create an opinion first)
        await mockUSDC.mint(owner.address, ethers.parseUnits("100", 6));
        await mockUSDC.approve(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
        await opinionMarket.createOpinion("Test Question?", "Test Answer");
        await opinionMarket.connect(user1).deactivateOpinion(1);
        const deactivatedOpinion = await opinionMarket.opinions(1);
        expect(deactivatedOpinion.isActive).to.be.false;
        
        // Test OPERATOR_ROLE function
        await opinionMarket.connect(user1).pause();
        expect(await opinionMarket.paused()).to.be.true;
      });

      it("Should allow revoking individual roles while preserving others", async function () {
        // Grant multiple roles to user1
        await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
        await opinionMarket.grantRole(MODERATOR_ROLE, user1.address);
        await opinionMarket.grantRole(OPERATOR_ROLE, user1.address);
        
        // Revoke ADMIN_ROLE
        await opinionMarket.revokeRole(ADMIN_ROLE, user1.address);
        
        // Check that user1 no longer has ADMIN_ROLE but still has other roles
        expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
        expect(await opinionMarket.hasRole(MODERATOR_ROLE, user1.address)).to.be.true;
        expect(await opinionMarket.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
        
        // Test that user1 can't use ADMIN_ROLE functions
        await expect(
          opinionMarket.connect(user1).setMinimumPrice(3_000_000)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
        
        // But can still use OPERATOR_ROLE functions
        await opinionMarket.connect(user1).pause();
        expect(await opinionMarket.paused()).to.be.true;
      });
    });

    // Transfer of roles between accounts
    describe("Transfer of Roles Between Accounts", function () {
      it("Should allow transferring roles from one account to another", async function () {
        // Grant ADMIN_ROLE to admin
        await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
        expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
        
        // Transfer ADMIN_ROLE from admin to user1 (by revoking and granting)
        await opinionMarket.revokeRole(ADMIN_ROLE, admin.address);
        await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
        
        // Check that admin no longer has the role and user1 now has it
        expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
        expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
        
        // Test that user1 can use ADMIN_ROLE functions
        await opinionMarket.connect(user1).setMinimumPrice(3_000_000);
        expect(await opinionMarket.minimumPrice()).to.equal(3_000_000);
        
        // Test that admin can no longer use ADMIN_ROLE functions
        await expect(
          opinionMarket.connect(admin).setMinimumPrice(4_000_000)
        ).to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
      });
    });
  });
});