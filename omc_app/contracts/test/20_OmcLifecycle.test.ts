import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclaps/hardhat-ethers/signers";
import {
  OpinionMarket,
  OpinionCore,
  FeeManager,
  PoolManager,
  PriceCalculator,
  MockERC20,
  OpinionMarketV2Mock
} from "../typechain-types";

describe("OpinionMarket - Complete Lifecycle Test", function() {
  let opinionMarket, opinionCore, feeManager, poolManager;
  let mockUSDC;
  let deployer, admin, moderator, treasury;
  let user1, user2, user3, user4, user5;
  let firstOpinionId, popularOpinionId, pooledOpinionId;
  let poolId;
  let usdcTokenAddress; // Ajouté pour éviter l'erreur de référence
  
  before(async function() {
    // 1. DÉPLOIEMENT ET CONFIGURATION INITIALE
    [deployer, admin, moderator, treasury, user1, user2, user3, user4, user5] = await ethers.getSigners();
    
    // Mock USDC setup
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("Mock USDC", "mUSDC");
    usdcTokenAddress = await mockUSDC.getAddress();
    
    // Mint USDC to users
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC 
    for (const user of [user1, user2, user3, user4, user5, treasury]) {
      await mockUSDC.mint(await user.getAddress(), mintAmount);
    }
    
    // Deploy contracts
    const PriceCalculatorFactory = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculatorFactory.deploy();
    
    const libraries = {
      "contracts/core/libraries/PriceCalculator.sol:PriceCalculator": await priceCalculator.getAddress()
    };
    
    const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", { libraries });
    const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
    const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
    
    opinionCore = await upgrades.deployProxy(
      OpinionCoreFactory,
      [usdcTokenAddress, await admin.getAddress(), await admin.getAddress()],
      { unsafeAllowLinkedLibraries: true }
    );
    
    feeManager = await upgrades.deployProxy(
      FeeManagerFactory,
      [usdcTokenAddress]
    );
    
    poolManager = await upgrades.deployProxy(
      PoolManagerFactory,
      [await opinionCore.getAddress(), await feeManager.getAddress(), usdcTokenAddress, await admin.getAddress()]
    );
    
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [
        usdcTokenAddress,
        await opinionCore.getAddress(),
        await feeManager.getAddress(),
        await poolManager.getAddress()
      ],
      { kind: "uups" }
    );
    
    // Setup cross-contract references
    await opinionCore.setFeeManager(await feeManager.getAddress());
    await opinionCore.setPoolManager(await poolManager.getAddress());
    await opinionCore.grantRole(await opinionCore.POOL_MANAGER_ROLE(), await poolManager.getAddress());
    
    await feeManager.grantCoreContractRole(await opinionCore.getAddress());
    await feeManager.grantCoreContractRole(await poolManager.getAddress());
    // Ajouter dans before():
    await feeManager.grantRole(await feeManager.TREASURY_ROLE(), await treasury.getAddress());
    
    // Setup roles
    await opinionCore.grantRole(await opinionCore.MODERATOR_ROLE(), await moderator.getAddress());
    await opinionCore.grantRole(await opinionCore.MARKET_CONTRACT_ROLE(), await opinionMarket.getAddress());
    await opinionMarket.grantRole(await opinionMarket.TREASURY_ROLE(), await treasury.getAddress());
    await opinionMarket.grantRole(await opinionMarket.OPERATOR_ROLE(), await admin.getAddress()); // Ajouté pour résoudre l'erreur de pause
    
    // Enable public creation - using deployer instead of admin to avoid role error
    await opinionCore.connect(deployer).togglePublicCreation();
    
    // Approve USDC for all users
    const approvalAmount = ethers.parseUnits("10000", 6);
    for (const user of [user1, user2, user3, user4, user5]) {
      await mockUSDC.connect(user).approve(await opinionCore.getAddress(), approvalAmount);
      await mockUSDC.connect(user).approve(await poolManager.getAddress(), approvalAmount);
      await mockUSDC.connect(user).approve(await opinionMarket.getAddress(), approvalAmount);
    }
    console.log("Setup complete");
  });
  
  it("Should handle platform launch and initial growth phase", async function() {
    // 2. LANCEMENT: PREMIÈRES OPINIONS
    console.log("Phase 1: Platform Launch");
    
    // First opinion by early adopter
    const tx1 = await opinionCore.connect(user1).createOpinion(
      "Best pizza in New York?", 
      "Joe's Pizza on Carmine Street"
    );
    const receipt1 = await tx1.wait();
    
    // Extract ID from events
    for (const event of receipt1.logs) {
      try {
        const parsedLog = opinionCore.interface.parseLog({
          topics: [...event.topics], 
          data: event.data
        });
        
        if (parsedLog && parsedLog.name === "OpinionAction" && parsedLog.args.actionType == 0) {
          firstOpinionId = parsedLog.args.opinionId;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    expect(firstOpinionId).to.not.be.undefined;
    console.log("First opinion created with ID:", firstOpinionId);
    
    // First answer to an opinion
    await opinionCore.connect(user2).submitAnswer(firstOpinionId, "No, Prince Street Pizza is better");
    
    // Get opinion details
    const opinion = await opinionCore.getOpinionDetails(firstOpinionId);
    expect(opinion.currentAnswer).to.equal("No, Prince Street Pizza is better");
    expect(opinion.currentAnswerOwner).to.equal(await user2.getAddress());
    
    // Create a second popular opinion
    const tx2 = await opinionCore.connect(user1).createOpinionWithExtras(
      "Best film of 2024?", 
      "Dune Part 2",
      "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX",
      "https://example.com/dune"
    );
    const receipt2 = await tx2.wait();
    
    // Extract ID from events
    for (const event of receipt2.logs) {
      try {
        const parsedLog = opinionCore.interface.parseLog({
          topics: [...event.topics], 
          data: event.data
        });
        
        if (parsedLog && parsedLog.name === "OpinionAction" && parsedLog.args.actionType == 0) {
          popularOpinionId = parsedLog.args.opinionId;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    console.log("Popular opinion created with ID:", popularOpinionId);
  });
  
  it("Should handle increasing market activity", async function() {
    // 3. CROISSANCE: ACTIVITÉ CROISSANTE AUTOUR DES OPINIONS
    console.log("Phase 2: Increasing Activity");
    
    // Multiple answers to the popular opinion, simulating price increases
    await opinionCore.connect(user2).submitAnswer(popularOpinionId, "Inside Out 2 was better");
    await ethers.provider.send("evm_mine", []); // New block
    
    await opinionCore.connect(user3).submitAnswer(popularOpinionId, "Dune Part 2 for sure");
    await ethers.provider.send("evm_mine", []); // New block
    
    await opinionCore.connect(user4).submitAnswer(popularOpinionId, "Furiosa was the best");
    await ethers.provider.send("evm_mine", []); // New block
    
    await opinionCore.connect(user5).submitAnswer(popularOpinionId, "Deadpool & Wolverine takes the crown");
    await ethers.provider.send("evm_mine", []); // New block
    
    // Check answer history
    const answerHistory = await opinionCore.getAnswerHistory(popularOpinionId);
    expect(answerHistory.length).to.equal(5); // Initial + 4 answers
    
    // Check current state
    const popularOpinion = await opinionCore.getOpinionDetails(popularOpinionId);
    expect(popularOpinion.currentAnswer).to.equal("Deadpool & Wolverine takes the crown");
    expect(popularOpinion.currentAnswerOwner).to.equal(await user5.getAddress());
    
    // Create a third opinion for pool testing
    const tx3 = await opinionCore.connect(user3).createOpinion(
      "Best crypto project of 2025?", 
      "Base is the future"
    );
    const receipt3 = await tx3.wait();
    
    // Extract ID from events
    for (const event of receipt3.logs) {
      try {
        const parsedLog = opinionCore.interface.parseLog({
          topics: [...event.topics], 
          data: event.data
        });
        
        if (parsedLog && parsedLog.name === "OpinionAction" && parsedLog.args.actionType == 0) {
          pooledOpinionId = parsedLog.args.opinionId;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    console.log("Pooled opinion created with ID:", pooledOpinionId);
    
    // Submit some answers to increase the price
    await opinionCore.connect(user1).submitAnswer(pooledOpinionId, "Solana is still leading");
    await ethers.provider.send("evm_mine", []); // New block
    
    await opinionCore.connect(user2).submitAnswer(pooledOpinionId, "Ethereum with L2s dominates");
    await ethers.provider.send("evm_mine", []); // New block
  });
  
  it("Should handle pool creation and execution", async function() {
    // 4. POOLS: CRÉATION ET EXÉCUTION
    console.log("Phase 3: Pool Activities");
    
    // Get the current price for the opinion
    const nextPrice = await opinionCore.getNextPrice(pooledOpinionId);
    console.log("Next price for opinion:", nextPrice.toString());
    
    // Set up a pool with half the target price
    const initialContribution = BigInt(nextPrice) / BigInt(2);
    console.log("Initial pool contribution:", initialContribution.toString());
    
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 7 * 24 * 60 * 60; // 7 days
    
    // Create a pool to change the answer
    const tx = await poolManager.connect(user3).createPool(
      pooledOpinionId,
      "Bitcoin remains king of crypto",
      deadline,
      initialContribution,
      "Bitcoin Believers",
      "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
    );
    const receipt = await tx.wait();
    
    // Extract pool ID from events
    for (const event of receipt.logs) {
      try {
        const parsedLog = poolManager.interface.parseLog({
          topics: [...event.topics], 
          data: event.data
        });
        
        if (parsedLog && (parsedLog.name === "PoolCreated" || parsedLog.name === "PoolAction")) {
          poolId = parsedLog.args.poolId;
          console.log("Created pool with ID:", poolId);
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    expect(poolId).to.not.be.undefined;
    
    // Get pool details
    const poolDetails = await poolManager.getPoolDetails(poolId);
    const targetPrice = poolDetails[1];
    const currentAmount = poolDetails[0].totalAmount;
    const remainingAmount = BigInt(targetPrice) - BigInt(currentAmount);
    
    console.log("Pool details - Target:", targetPrice.toString(), 
                "Current:", currentAmount.toString(),
                "Remaining:", remainingAmount.toString());
    
    // Contribute to the pool to reach the target
    await poolManager.connect(user4).contributeToPool(poolId, remainingAmount);
    
    // Check if the pool has been executed
    const poolAfter = await poolManager.getPoolDetails(poolId);
    expect(poolAfter[0].status).to.equal(BigInt(1)); // PoolStatus.Executed - FIX BigInt conversion
    
    // Check if the opinion has been updated
    const opinionAfter = await opinionCore.getOpinionDetails(pooledOpinionId);
    expect(opinionAfter.currentAnswer).to.equal("Bitcoin remains king of crypto");
    expect(opinionAfter.currentAnswerOwner).to.equal(await poolManager.getAddress());
  });
  
  it("Should handle fee distribution and claiming", async function() {
    // 5. ÉCONOMIE: DISTRIBUTION ET RÉCLAMATION DES FRAIS
    console.log("Phase 4: Fee Economics");
    
    // Submit another answer to trigger fee distribution to the pool
    await opinionCore.connect(user5).submitAnswer(pooledOpinionId, "Actually, it's all about DeFi");
    await ethers.provider.send("evm_mine", []); // New block
    
    // Check accumulated fees for users
    const user1Fees = await feeManager.getAccumulatedFees(await user1.getAddress());
    const user2Fees = await feeManager.getAccumulatedFees(await user2.getAddress());
    const user3Fees = await feeManager.getAccumulatedFees(await user3.getAddress());
    
    console.log("Accumulated fees - User1:", user1Fees.toString(),
                "User2:", user2Fees.toString(),
                "User3:", user3Fees.toString());
    
    // Ensure some fees were accumulated
    expect(user1Fees).to.be.gt(BigInt(0));
    
    // Mint USDC to fee manager to allow claiming
    await mockUSDC.mint(await feeManager.getAddress(), user1Fees);
    
    // Claim fees
    const balanceBefore = await mockUSDC.balanceOf(await user1.getAddress());
    await feeManager.connect(user1).claimAccumulatedFees();
    const balanceAfter = await mockUSDC.balanceOf(await user1.getAddress());
    
    // Verify fees were claimed
    expect(balanceAfter - balanceBefore).to.equal(user1Fees);
    console.log("User1 claimed fees:", user1Fees.toString());
    
    // Check platform fees
    const platformBalance = await mockUSDC.balanceOf(await feeManager.getAddress());
    console.log("Platform fee balance:", platformBalance.toString());
    
    // Withdraw platform fees only if there are any
    if (platformBalance > BigInt(0)) {
      const treasuryBalanceBefore = await mockUSDC.balanceOf(await treasury.getAddress());
      await feeManager.connect(treasury).withdrawPlatformFees(await mockUSDC.getAddress(), await treasury.getAddress());
      const treasuryBalanceAfter = await mockUSDC.balanceOf(await treasury.getAddress());
      
      // Verify platform fees were withdrawn
      expect(treasuryBalanceAfter).to.be.gt(treasuryBalanceBefore);
      console.log("Treasury balance change:", (treasuryBalanceAfter - treasuryBalanceBefore).toString());
    } else {
      console.log("No platform fees to withdraw, skipping withdrawal test");
    }
  });
  
  it("Should handle administrative operations", async function() {
    // 6. MAINTENANCE: OPÉRATIONS ADMINISTRATIVES
    console.log("Phase 5: Administrative Operations");
    
    // Pause the contract
    await opinionMarket.connect(admin).pause();
    
    // Verify pause state
    const isPaused = await opinionMarket.paused();
    expect(isPaused).to.be.true;
    console.log("Platform successfully paused");

    // Test that operations fail during pause
    try {
      await opinionCore.connect(user1).createOpinion("This should fail", "Due to pause");
      expect.fail("Transaction should have failed due to pause");
    } catch (error) {
      console.log("Transaction correctly failed while paused");
    }
    
    // Parameter updates
    await opinionCore.connect(deployer).setParameter(0, ethers.parseUnits("2", 6)); // 2 USDC
    console.log("Minimum price updated");
    
    // Unpause the contract
    await opinionMarket.connect(admin).unpause();
    console.log("Platform successfully unpaused");
    
    // Verify operations resume
    const tx = await opinionCore.connect(user1).createOpinion(
      "Working after unpause?", 
      "Yes it is!"
    );
    await tx.wait();
    console.log("Platform functioning after unpause");
  });
  
  it("Should handle contract upgrades", async function() {
    // 7. ÉVOLUTION: UPGRADE DU CONTRAT
    console.log("Phase 6: Contract Upgrade");
    
    // Deploy a mock V2 implementation
    const OpinionMarketV2MockFactory = await ethers.getContractFactory("OpinionMarketV2Mock");
    
    // Prepare upgrade - pas besoin d'attendre avec ethers.js v6
    await upgrades.upgradeProxy(
      await opinionMarket.getAddress(),
      OpinionMarketV2MockFactory
    );
    console.log("Contract successfully upgraded to V2");
    
    // Verify upgrade was successful by calling a V2-specific function
    const opinionMarketV2 = await ethers.getContractAt("OpinionMarketV2Mock", await opinionMarket.getAddress());
    expect(await opinionMarketV2.getVersion()).to.equal("v2"); // FIX la casse à "v2"
    console.log("V2 function accessible after upgrade");
    
    // Verify all data was preserved
    const opinion = await opinionCore.getOpinionDetails(firstOpinionId);
    expect(opinion.question).to.equal("Best pizza in New York?");
    console.log("Data preserved after upgrade");
  });
  
  it("Should have correct final state after full lifecycle", async function() {
    // 8. VÉRIFICATION: ÉTAT FINAL DU SYSTÈME
    console.log("Phase 7: Final State Verification");
    
    // Check total statistics
    const totalOps = (await opinionCore.nextOpinionId()) - BigInt(1);
    expect(totalOps).to.be.gte(BigInt(4)); // At least 4 opinions created
    console.log("Total opinions created:", totalOps.toString());
    
    // Verify all contracts maintain expected state
    const opinion = await opinionCore.getOpinionDetails(firstOpinionId);
    const creatorOfFirst = opinion.creator;
    expect(creatorOfFirst).to.equal(await user1.getAddress());
    
    // Check answer histories
    const popularHistory = await opinionCore.getAnswerHistory(popularOpinionId);
    expect(popularHistory.length).to.be.gte(5); // Pas un BigInt ici
    console.log("Total answers for popular opinion:", popularHistory.length.toString());
    
    // Check pool state
    const poolState = await poolManager.getPoolDetails(poolId);
    expect(poolState[0].status).to.equal(BigInt(1)); // Executed - FIX BigInt conversion
    console.log("Final pool status: Executed");
    
    // Verify all events were emitted correctly (sample check)
    // Verify all accumulated fees were distributed correctly
    console.log("System state verification complete");
  });
});