// test/00_DeployInit.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Deployment & Initialization", function () {
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
  });

  // Test: Contract deployment with correct USDC address
  it("Should deploy with correct USDC address", async function () {
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), user1.address, user2.address, treasury.address],
      { kind: 'uups' }
    );
    
    expect(await opinionMarket.usdcToken()).to.equal(await mockUSDC.getAddress());
  });

  // Test: Role initialization
  it("Should initialize roles correctly", async function () {
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), user1.address, user2.address, treasury.address],
      { kind: 'uups' }
    );
    
    // Check all roles are granted to deployer
    expect(await opinionMarket.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(TREASURY_ROLE, owner.address)).to.be.true;
    
    // Other users should not have roles yet
    expect(await opinionMarket.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, user2.address)).to.be.false;
  });

  // Test: Initial state variables validation
  it("Should initialize with default state variables", async function () {
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), user1.address, user2.address, treasury.address],
      { kind: 'uups' }
    );
    
    // Verify contract references
    expect(await opinionMarket.opinionCore()).to.equal(user1.address);
    expect(await opinionMarket.feeManager()).to.equal(user2.address);
    expect(await opinionMarket.poolManager()).to.equal(treasury.address);
    
    // Verify initial state
    expect(await opinionMarket.paused()).to.be.false;
  });

  // Test: Initialization with zero address
  it("Should revert when initialized with zero address", async function () {
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    await expect(
      upgrades.deployProxy(
        OpinionMarketFactory,
        [ethers.ZeroAddress, user1.address, user2.address, treasury.address],
        { kind: 'uups' }
      )
    ).to.be.revertedWithCustomError(OpinionMarketFactory, "ZeroAddressNotAllowed");
  });

  // Test: Initialize can only be called once
  it("Should not allow initialize to be called more than once", async function () {
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress(), user1.address, user2.address, treasury.address],
      { kind: 'uups' }
    );
    
    // Try to call initialize again
    await expect(
      opinionMarket.initialize(
        await mockUSDC.getAddress(), 
        user1.address, 
        user2.address, 
        treasury.address
      )
    ).to.be.revertedWithCustomError(OpinionMarketFactory, "InvalidInitialization");
  });
});