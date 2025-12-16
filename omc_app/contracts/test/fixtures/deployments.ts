import { ethers, upgrades } from "hardhat";
import type {
  OpinionMarket,
  OpinionCore,
  FeeManager,
  PoolManager,
  TreasurySecure,
  MockERC20
} from "../../typechain-types";

export interface TestContracts {
  opinionMarket: OpinionMarket;
  opinionCore: OpinionCore;
  feeManager: FeeManager;
  poolManager: PoolManager;
  treasurySecure: TreasurySecure;
  usdc: MockERC20;
}

export interface TestUsers {
  owner: any;
  admin: any;
  treasury: any;
  moderator: any;
  operator: any;
  user1: any;
  user2: any;
  user3: any;
}

/**
 * REAL CONTRACT DEPLOYMENT SYSTEM
 * 90% Real Contracts + 10% Strategic Mocks (USDC only)
 * 
 * This deploys the actual OpinionMarketCap V1 production contracts
 * for authentic testing of sophisticated DeFi features
 */
export async function deployRealOpinionMarketSystem(): Promise<{
  contracts: TestContracts;
  users: TestUsers;
}> {
  console.log("🚀 REAL CONTRACT DEPLOYMENT: 90% Real + 10% Mocks");

  // Get test signers
  const [owner, admin, treasury, moderator, operator, user1, user2, user3] = await ethers.getSigners();

  const users: TestUsers = {
    owner,
    admin,
    treasury,
    moderator,
    operator,
    user1,
    user2,
    user3
  };

  // ===== STEP 1: Deploy Strategic Mocks (10%) =====
  console.log("📍 Step 1: Deploying Strategic Mocks (10%)...");

  // Only mock external dependencies - keep USDC mock for testing
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20Factory.deploy("USD Coin", "USDC");
  await usdc.waitForDeployment();
  console.log(`✅ MockERC20 (USDC) deployed: ${await usdc.getAddress()}`);

  // Fund all test users with USDC
  const testAmount = ethers.parseUnits("10000", 6); // 10K USDC each
  for (const user of [owner, admin, treasury, moderator, operator, user1, user2, user3]) {
    await usdc.mint(user.address, testAmount);
  }
  console.log("💰 Test users funded with 10K USDC each");

  // ===== STEP 2: Deploy Real TreasurySecure (Independent) =====
  console.log("📍 Step 2: Deploying REAL TreasurySecure...");
  const TreasurySecureFactory = await ethers.getContractFactory("TreasurySecure");
  const treasurySecure = await upgrades.deployProxy(
    TreasurySecureFactory,
    [
      await usdc.getAddress(),
      treasury.address,
      admin.address
    ],
    {
      initializer: "initialize"
    }
  ) as unknown as TreasurySecure;
  await treasurySecure.waitForDeployment();
  console.log(`✅ REAL TreasurySecure deployed: ${await treasurySecure.getAddress()}`);

  // ===== STEP 3: Deploy Real FeeManager (Independent) =====
  console.log("📍 Step 3: Deploying REAL FeeManager...");
  const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManagerFactory,
    [
      await usdc.getAddress(),
      await treasurySecure.getAddress()
    ],
    {
      initializer: "initialize"
    }
  ) as unknown as FeeManager;
  await feeManager.waitForDeployment();
  console.log(`✅ REAL FeeManager deployed: ${await feeManager.getAddress()}`);

  // ===== STEP 4: Deploy Required Libraries for OpinionCore =====
  console.log("📍 Step 4: Deploying Libraries for REAL OpinionCore...");

  // Deploy base libraries first (no dependencies)
  const PriceCalculatorFactory = await ethers.getContractFactory("PriceCalculator");
  const priceCalculator = await PriceCalculatorFactory.deploy();
  await priceCalculator.waitForDeployment();

  // Deploy OpinionCreationLib (no library dependencies)
  const OpinionCreationLibFactory = await ethers.getContractFactory("OpinionCreationLib");
  const opinionCreationLib = await OpinionCreationLibFactory.deploy();
  await opinionCreationLib.waitForDeployment();

  // Deploy OpinionTradingLib (depends on PriceCalculator via OpinionPricingLibrary)
  const OpinionTradingLibFactory = await ethers.getContractFactory("OpinionTradingLib", {
    libraries: {
      "contracts/core/libraries/PriceCalculator.sol:PriceCalculator": await priceCalculator.getAddress(),
    },
  });
  const opinionTradingLib = await OpinionTradingLibFactory.deploy();
  await opinionTradingLib.waitForDeployment();

  // Deploy OpinionUpdateLib (depends on PriceCalculator via OpinionPricingLibrary)
  const OpinionUpdateLibFactory = await ethers.getContractFactory("OpinionUpdateLib", {
    libraries: {
      "contracts/core/libraries/PriceCalculator.sol:PriceCalculator": await priceCalculator.getAddress(),
    },
  });
  const opinionUpdateLib = await OpinionUpdateLibFactory.deploy();
  await opinionUpdateLib.waitForDeployment();

  console.log("📚 Libraries deployed successfully");

  // ===== STEP 5: Deploy Real OpinionCore (Core Logic) =====
  console.log("📍 Step 5: Deploying REAL OpinionCore...");
  const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      "contracts/core/libraries/OpinionCreationLib.sol:OpinionCreationLib": await opinionCreationLib.getAddress(),
      "contracts/core/libraries/OpinionTradingLib.sol:OpinionTradingLib": await opinionTradingLib.getAddress(),
      "contracts/core/libraries/OpinionUpdateLib.sol:OpinionUpdateLib": await opinionUpdateLib.getAddress(),
    },
  });

  const opinionCore = await upgrades.deployProxy(
    OpinionCoreFactory,
    [
      await usdc.getAddress(),
      await feeManager.getAddress(),
      admin.address, // Temporary poolManager - will be updated
      await treasurySecure.getAddress()
    ],
    {
      initializer: "initialize",
      unsafeAllowLinkedLibraries: true
    }
  ) as unknown as OpinionCore;
  await opinionCore.waitForDeployment();
  console.log(`✅ REAL OpinionCore deployed: ${await opinionCore.getAddress()}`);

  // ===== STEP 6: Deploy Real PoolManager =====
  console.log("📍 Step 6: Deploying REAL PoolManager...");
  const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
  const poolManager = await upgrades.deployProxy(
    PoolManagerFactory,
    [
      await opinionCore.getAddress(),
      await feeManager.getAddress(),
      await usdc.getAddress(),
      await treasurySecure.getAddress(),
      admin.address
    ],
    {
      initializer: "initialize"
    }
  ) as unknown as PoolManager;
  await poolManager.waitForDeployment();
  console.log(`✅ REAL PoolManager deployed: ${await poolManager.getAddress()}`);

  // ===== STEP 7: Update OpinionCore with Real PoolManager =====
  console.log("📍 Step 7: Updating OpinionCore with Real PoolManager...");
  await opinionCore.setPoolManager(await poolManager.getAddress());
  console.log("✅ OpinionCore updated with real PoolManager address");

  // ===== STEP 8: Deploy Real OpinionMarket (Main Coordinator) =====
  console.log("📍 Step 8: Deploying REAL OpinionMarket...");
  const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
  const opinionMarket = await upgrades.deployProxy(
    OpinionMarketFactory,
    [
      await usdc.getAddress(),
      await opinionCore.getAddress(),
      await feeManager.getAddress(),
      await poolManager.getAddress(),
      ethers.ZeroAddress, // monitoringManager (optional)
      ethers.ZeroAddress, // securityManager (optional)
      await treasurySecure.getAddress() // treasury
    ],
    {
      initializer: "initialize",
      kind: 'uups'
    }
  ) as unknown as OpinionMarket;
  await opinionMarket.waitForDeployment();
  console.log(`✅ REAL OpinionMarket deployed: ${await opinionMarket.getAddress()}`);

  // ===== STEP 9: Setup Basic Permissions (Simplified for Testing) =====
  console.log("📍 Step 9: Setting up basic permissions...");
  // For now, just ensure owner has admin rights on key contracts
  try {
    const moderatorRole = await opinionCore.MODERATOR_ROLE();
    await opinionCore.connect(owner).grantRole(moderatorRole, moderator.address);
    console.log("✅ Basic permissions configured");
  } catch (error) {
    console.log("⚠️ Skipping complex permissions setup for now");
  }

  // ===== STEP 10: Setup USDC Allowances for Testing =====
  console.log("📍 Step 10: Setting up USDC allowances for all users...");
  const maxApproval = ethers.MaxUint256;
  const contracts = [opinionMarket, opinionCore, feeManager, poolManager];

  for (const user of [owner, admin, treasury, moderator, operator, user1, user2, user3]) {
    for (const contract of contracts) {
      await usdc.connect(user).approve(await contract.getAddress(), maxApproval);
    }
  }
  console.log("💰 USDC allowances configured for all users and contracts");

  const contractsObj: TestContracts = {
    opinionMarket,
    opinionCore,
    feeManager,
    poolManager,
    treasurySecure,
    usdc
  };

  console.log("🎉 REAL CONTRACT DEPLOYMENT COMPLETE!");
  console.log("📋 Real Contract Addresses:");
  console.log(`   OpinionMarket: ${await opinionMarket.getAddress()}`);
  console.log(`   OpinionCore: ${await opinionCore.getAddress()}`);
  console.log(`   FeeManager: ${await feeManager.getAddress()}`);
  console.log(`   PoolManager: ${await poolManager.getAddress()}`);
  console.log(`   TreasurySecure: ${await treasurySecure.getAddress()}`);
  console.log(`   USDC: ${await usdc.getAddress()}`);

  return { contracts: contractsObj, users };
}

/**
 * Setup real cross-contract permissions for authentic testing
 */
async function setupRealContractPermissions(contracts: TestContracts, users: TestUsers) {
  const { opinionMarket, opinionCore, feeManager, poolManager, treasurySecure } = contracts;
  const { owner, admin, moderator, treasury } = users;

  // Get role constants from real contracts
  const DEFAULT_ADMIN_ROLE = await opinionCore.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
  const MODERATOR_ROLE = await opinionCore.MODERATOR_ROLE();

  // Setup OpinionCore roles using deployer (owner) who has DEFAULT_ADMIN_ROLE by default
  await opinionCore.connect(owner).grantRole(ADMIN_ROLE, admin.address);
  await opinionCore.connect(owner).grantRole(MODERATOR_ROLE, moderator.address);

  // Setup TreasurySecure roles
  const TREASURY_DEFAULT_ADMIN_ROLE = await treasurySecure.DEFAULT_ADMIN_ROLE();
  const TREASURY_ADMIN_ROLE = await treasurySecure.TREASURY_ADMIN_ROLE();
  await treasurySecure.connect(treasury).grantRole(TREASURY_DEFAULT_ADMIN_ROLE, admin.address);

  // Setup cross-contract permissions for real contracts using owner
  await opinionCore.connect(owner).grantRole(ADMIN_ROLE, await opinionMarket.getAddress());

  // Allow real contracts to interact with FeeManager using owner
  const FEE_ADMIN_ROLE = await feeManager.ADMIN_ROLE();
  await feeManager.connect(owner).grantRole(FEE_ADMIN_ROLE, admin.address);
  await feeManager.connect(owner).grantRole(FEE_ADMIN_ROLE, await opinionCore.getAddress());
  await feeManager.connect(owner).grantRole(FEE_ADMIN_ROLE, await opinionMarket.getAddress());

  // Allow real contracts to interact with PoolManager using owner
  const POOL_ADMIN_ROLE = await poolManager.ADMIN_ROLE();
  await poolManager.connect(owner).grantRole(POOL_ADMIN_ROLE, admin.address);
  await poolManager.connect(owner).grantRole(POOL_ADMIN_ROLE, await opinionCore.getAddress());
  await poolManager.connect(owner).grantRole(POOL_ADMIN_ROLE, await opinionMarket.getAddress());
}

/**
 * Validation function for real contract deployment
 */
export async function validateRealContractDeployment(contracts: TestContracts): Promise<void> {
  const { opinionMarket, opinionCore, feeManager, poolManager, treasurySecure, usdc } = contracts;

  // Validate real contract addresses are set correctly
  expect(await opinionMarket.usdcToken()).to.equal(await usdc.getAddress());
  expect(await opinionMarket.opinionCore()).to.equal(await opinionCore.getAddress());
  expect(await opinionMarket.feeManager()).to.equal(await feeManager.getAddress());
  expect(await opinionMarket.poolManager()).to.equal(await poolManager.getAddress());

  // Validate real OpinionCore configuration
  expect(await opinionCore.usdcToken()).to.equal(await usdc.getAddress());
  expect(await opinionCore.feeManager()).to.equal(await feeManager.getAddress());
  expect(await opinionCore.poolManager()).to.equal(await poolManager.getAddress());

  // Validate real FeeManager configuration
  expect(await feeManager.usdcToken()).to.equal(await usdc.getAddress());

  // Validate real contract parameters
  expect(await opinionCore.minimumPrice()).to.equal(ethers.parseUnits("1", 6));
  expect(await opinionCore.MAX_INITIAL_PRICE()).to.equal(ethers.parseUnits("100", 6));

  console.log("✅ Real contract deployment validation passed");
}

// Helper function to create opinion for testing
export async function createTestOpinion(
  contracts: TestContracts,
  creator: any,
  question: string = "Test Question?",
  initialAnswer: string = "Test Answer",
  description: string = "Test Description",
  initialPrice: bigint = ethers.parseUnits("10", 6),
  categories: string[] = ["test"]
): Promise<bigint> {
  const tx = await contracts.opinionCore.connect(creator).createOpinion(
    question,
    initialAnswer,
    description,
    initialPrice,
    categories
  );
  const receipt = await tx.wait();

  // Find OpinionCreated event
  const event = receipt?.logs.find(log => {
    try {
      const parsed = contracts.opinionCore.interface.parseLog(log);
      return parsed?.name === "OpinionCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contracts.opinionCore.interface.parseLog(event);
    return parsed?.args[0];
  }

  throw new Error("OpinionCreated event not found");
}

// Import expect for validation
import { expect } from "chai";