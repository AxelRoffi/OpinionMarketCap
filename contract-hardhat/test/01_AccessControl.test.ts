// test/01_AccessControl.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Access Control", function () {
  let opinionMarket: any; // Using any for the proxy to avoid typing issues
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
    
    // Deploy OpinionMarket
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), user1.address, user2.address, treasury.address],
      { kind: 'uups' }
    );
    
    // Confirm contract is deployed and initialized
    expect(await opinionMarket.usdcToken()).to.equal(await mockUSDC.getAddress());
  });

  // Test: Role assignment and revocation
  it("Should allow role assignment and revocation", async function () {
    // Initially admin shouldn't have roles
    expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, admin.address)).to.be.false;
    
    // Grant ADMIN_ROLE to admin
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    
    // Grant MODERATOR_ROLE to admin
    await opinionMarket.grantRole(MODERATOR_ROLE, admin.address);
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, admin.address)).to.be.true;
    
    // Revoke ADMIN_ROLE from admin
    await opinionMarket.revokeRole(ADMIN_ROLE, admin.address);
    expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
    
    // But admin should still have MODERATOR_ROLE
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, admin.address)).to.be.true;
  });

  // Test: Function restrictions by role (DEFAULT_ADMIN_ROLE)
  it("Should enforce DEFAULT_ADMIN_ROLE restrictions", async function () {
    // DEFAULT_ADMIN_ROLE can grant any role
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    
    // DEFAULT_ADMIN_ROLE can revoke any role
    await opinionMarket.revokeRole(ADMIN_ROLE, admin.address);
    expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
    
    // Non-DEFAULT_ADMIN_ROLE accounts cannot grant DEFAULT_ADMIN_ROLE
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    
    await expect(
      opinionMarket.connect(admin).grantRole(DEFAULT_ADMIN_ROLE, user1.address)
    ).to.be.reverted;
  });

  // Test: ADMIN_ROLE permissions
  it("Should enforce ADMIN_ROLE permissions", async function () {
    // Grant ADMIN_ROLE to admin
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    
    // Grant DEFAULT_ADMIN_ROLE to admin as well (needed for role management)
    await opinionMarket.grantRole(DEFAULT_ADMIN_ROLE, admin.address);
    
    // Now admin should be able to grant MODERATOR_ROLE
    await opinionMarket.connect(admin).grantRole(MODERATOR_ROLE, moderator.address);
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, moderator.address)).to.be.true;
    
    // And should be able to revoke MODERATOR_ROLE
    await opinionMarket.connect(admin).revokeRole(MODERATOR_ROLE, moderator.address);
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, moderator.address)).to.be.false;
    
    // Test ADMIN-specific functions
    // Using setOpinionCore as an example of an admin-only function
    await opinionMarket.connect(admin).setOpinionCore(user2.address);
    expect(await opinionMarket.opinionCore()).to.equal(user2.address);
    
    // Regular users should not be able to call admin-only functions
    await expect(
      opinionMarket.connect(user1).setOpinionCore(user2.address)
    ).to.be.reverted;
  });

  // Test: MODERATOR_ROLE permissions
  it("Should enforce MODERATOR_ROLE permissions", async function () {
    // Grant MODERATOR_ROLE to moderator
    await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
    
    // MODERATOR_ROLE shouldn't be able to grant roles
    await expect(
      opinionMarket.connect(moderator).grantRole(MODERATOR_ROLE, user1.address)
    ).to.be.reverted;
    
    // Testing permissions of a specific moderator function would require
    // knowing what functions require MODERATOR_ROLE in your contract
    // This is just a placeholder test - modify to test actual moderator functions
    
    // Example: If deactivateOpinion requires MODERATOR_ROLE
    // await opinionMarket.connect(moderator).deactivateOpinion(1);
    
    // Regular users should not be able to call moderator-only functions
    // await expect(
    //   opinionMarket.connect(user1).deactivateOpinion(1)
    // ).to.be.reverted;
  });

  // Test: OPERATOR_ROLE permissions
  it("Should enforce OPERATOR_ROLE permissions", async function () {
    // Grant OPERATOR_ROLE to operator
    await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
    
    // Test operator-specific functions
    // Assume pause/unpause requires OPERATOR_ROLE
    await opinionMarket.connect(operator).pause();
    expect(await opinionMarket.paused()).to.be.true;
    
    await opinionMarket.connect(operator).unpause();
    expect(await opinionMarket.paused()).to.be.false;
    
    // Regular users should not be able to call operator-only functions
    await expect(
      opinionMarket.connect(user1).pause()
    ).to.be.reverted;
  });

  // Test: TREASURY_ROLE permissions
  it("Should enforce TREASURY_ROLE permissions", async function () {
    // Grant TREASURY_ROLE to treasury
    await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
    
    // Test treasury-specific functions
    // Assume withdrawPlatformFees requires TREASURY_ROLE
    // For testing, we'll need to have some funds in the contract first
    // This is just a placeholder - adjust based on your actual contract functions
    
    // Regular users should not be able to call treasury-only functions
    await expect(
      opinionMarket.connect(user1).withdrawPlatformFees(
        await mockUSDC.getAddress(), 
        user1.address
      )
    ).to.be.reverted;
  });

  // Test: Multiple roles per account
  it("Should support multiple roles per account", async function () {
    // Grant multiple roles to the same account
    await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
    await opinionMarket.grantRole(MODERATOR_ROLE, user1.address);
    await opinionMarket.grantRole(OPERATOR_ROLE, user1.address);
    
    // Verify all roles are assigned
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, user1.address)).to.be.true;
    expect(await opinionMarket.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
    
    // Revoke one role
    await opinionMarket.revokeRole(MODERATOR_ROLE, user1.address);
    
    // Verify only that role was revoked
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, user1.address)).to.be.false;
    expect(await opinionMarket.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
  });

  // Test: Transfer of roles between accounts
  it("Should allow transfer of roles between accounts", async function () {
    // Grant role to one account
    await opinionMarket.grantRole(ADMIN_ROLE, user1.address);
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
    
    // Transfer role to another account (revoke from first, grant to second)
    await opinionMarket.revokeRole(ADMIN_ROLE, user1.address);
    await opinionMarket.grantRole(ADMIN_ROLE, user2.address);
    
    // Verify transfer
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user2.address)).to.be.true;
  });
});