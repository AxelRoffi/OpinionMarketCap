import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MockERC20, OpinionMarket, PriceCalculator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Deployment & Initialization", function () {
  let opinionMarket: any; // Using any for the proxy to avoid typing issues
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
    
    // Deploy PriceCalculator library first
    const PriceCalculatorFactory = await ethers.getContractFactory("PriceCalculator");
    priceCalculator = await PriceCalculatorFactory.deploy() as PriceCalculator;
    
    // Link PriceCalculator library to OpinionMarket
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    // Now that the library is linked, proceed with deployment tests inside each test case
  });

  it("Should deploy correctly with USDC address", async function () {
    // Deploy as proxy with USDC address, with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking'] // This is needed for libraries in upgradeable contracts
      }
    );
    
    // Verify deployment
    expect(await opinionMarket.usdcToken()).to.equal(await mockUSDC.getAddress());
    expect(await opinionMarket.owner()).to.equal(owner.address);
  });

  it("Should initialize roles correctly", async function () {
    // Deploy as proxy with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Check all roles are granted to owner
    expect(await opinionMarket.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(MODERATOR_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
    expect(await opinionMarket.hasRole(TREASURY_ROLE, owner.address)).to.be.true;
  });

  it("Should initialize state variables correctly", async function () {
    // Deploy as proxy with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Check initial values
    expect(await opinionMarket.minimumPrice()).to.equal(1_000_000); // 1 USDC
    expect(await opinionMarket.platformFeePercent()).to.equal(2);
    expect(await opinionMarket.creatorFeePercent()).to.equal(3);
    expect(await opinionMarket.absoluteMaxPriceChange()).to.equal(200);
    expect(await opinionMarket.maxTradesPerBlock()).to.equal(3);
    expect(await opinionMarket.rapidTradeWindow()).to.equal(30); // 30 seconds
    expect(await opinionMarket.questionCreationFee()).to.equal(1_000_000); // 1 USDC
    expect(await opinionMarket.initialAnswerPrice()).to.equal(2_000_000); // 2 USDC
    expect(await opinionMarket.poolCreationFee()).to.equal(50_000_000); // 50 USDC
    expect(await opinionMarket.poolContributionFee()).to.equal(1_000_000); // 1 USDC
    expect(await opinionMarket.minPoolDuration()).to.equal(24 * 60 * 60); // 1 day
    expect(await opinionMarket.maxPoolDuration()).to.equal(30 * 24 * 60 * 60); // 30 days
    expect(await opinionMarket.nextOpinionId()).to.equal(1);
    expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
    expect(await opinionMarket.paused()).to.be.false;
  });

  it("Should initialize with zero address and allow setting USDC later", async function () {
    // Deploy with zero address, with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [ethers.ZeroAddress],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Verify USDC is zero address
    expect(await opinionMarket.usdcToken()).to.equal(ethers.ZeroAddress);
    
    // Set USDC token
    await opinionMarket.setUsdcToken(await mockUSDC.getAddress());
    
    // Verify USDC is set
    expect(await opinionMarket.usdcToken()).to.equal(await mockUSDC.getAddress());
  });

  it("Should not allow initialize to be called more than once", async function () {
    // Deploy as proxy with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Try to call initialize again
    await expect(
      opinionMarket.initialize(await mockUSDC.getAddress())
    ).to.be.revertedWithCustomError(opinionMarket, "InvalidInitialization");
  });

  it("Should not allow setUsdcToken if already set", async function () {
    // Deploy as proxy with library linked
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", {
      libraries: {
        PriceCalculator: await priceCalculator.getAddress()
      }
    });
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await mockUSDC.getAddress()],
      { 
        kind: 'uups',
        unsafeAllow: ['external-library-linking']
      }
    );
    
    // Try to set USDC again
    await expect(
      opinionMarket.setUsdcToken(await mockUSDC.getAddress())
    ).to.be.revertedWith("USDC already set");
  });
});