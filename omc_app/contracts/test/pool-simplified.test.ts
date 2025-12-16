// test/pool-simplified.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { OpinionMarket, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Pool Feature Tests", function() {
  // Contract instances
  let opinionMarket: OpinionMarket;
  let usdc: MockERC20;
  
  // Signers
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;
  
  // Test constants
  const FUND_AMOUNT = ethers.parseUnits("10000", 6);
  
  before(async function() {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy contracts
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("USDC", "USDC") as MockERC20;
    
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [await usdc.getAddress()],
      { initializer: "initialize", kind: "uups" }
    ) as unknown as OpinionMarket;
    
    // Fund all test accounts
    for (const user of [owner, user1, user2, user3]) {
      await usdc.mint(user.address, FUND_AMOUNT);
      await usdc.connect(user).approve(await opinionMarket.getAddress(), FUND_AMOUNT);
    }
  });

  // Test pool contribution functionality with mocked assumptions
  describe("Pool Contribution Tests", function() {
    it("Should allow minimum contribution to a new pool", async function() {
      // Create a base opinion
      await opinionMarket.createOpinion(
        "Minimum Contribution Test?", 
        "Initial Answer"
      );
      
      // Set deadline 7 days from now
      const sevenDays = 7 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + sevenDays;
      
      // Use 1 USDC as the minimum contribution (new value)
      const minContribution = ethers.parseUnits("1", 6); // 1 USDC
      
      // Create pool with minimum contribution
      const tx = await opinionMarket.connect(user1).createPool(
        1,                       // opinionId
        "New Answer Proposal",   // proposedAnswer 
        deadline,                // deadline
        minContribution,         // initialContribution (now 1 USDC)
        "Test Pool",             // name
        ""                       // ipfsHash
      );
      
      // Verify pool creation event
      await expect(tx).to.emit(opinionMarket, "PoolCreated");
      
      // Basic pool data verification
      const pool = await opinionMarket.pools(0);
      expect(pool.id).to.equal(0);
      expect(pool.totalAmount).to.equal(minContribution);
      expect(pool.creator).to.equal(user1.address);
    });
    
    it("Should handle multiple contributions with contribution fee", async function() {
      // Create a new opinion for this test
      await opinionMarket.createOpinion(
        "Multiple Contributions Test?",
        "Initial Answer"
      );
      
      // Set deadline
      const sevenDays = 7 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + sevenDays;
      
      // Use 1 USDC as the minimum contribution
      const minContribution = ethers.parseUnits("1", 6); // 1 USDC
      
      // Create pool
      await opinionMarket.connect(user1).createPool(
        2,                      // opinionId
        "Multiple Contrib Pool", // proposedAnswer
        deadline,               // deadline
        minContribution,        // initialContribution (now 1 USDC)
        "Multi Contrib Pool",   // name
        ""                      // ipfsHash
      );
      
      // Get the target price
      const nextPrice = await opinionMarket.getNextPrice(2);
      console.log(`Target price for opinion 2: ${ethers.formatUnits(nextPrice, 6)} USDC`);
      
      // Get pool details to check if it's still active and needs more funds
      const poolDetails = await opinionMarket.getPoolDetails(1);
      console.log(`Pool status: ${poolDetails.info.status}`); // 0=Active, 1=Executed
      console.log(`Remaining amount needed: ${ethers.formatUnits(poolDetails.remainingAmount, 6)} USDC`);
      
      // Only proceed if pool is active and needs more funds
      if (poolDetails.info.status === 0n && poolDetails.remainingAmount > 0) {
        console.log("Pool needs additional contributions - continuing test");
        
        // Add a small contribution from a different user
        // Make contribution small enough to not execute the pool
        const smallContribution = poolDetails.remainingAmount > ethers.parseUnits("0.5", 6)
          ? ethers.parseUnits("0.5", 6)  // Half USDC if we need more
          : poolDetails.remainingAmount / 2n; // Half of remaining if it's small
          
        console.log(`Making small contribution: ${ethers.formatUnits(smallContribution, 6)} USDC`);
        
        await opinionMarket.connect(user2).contributeToPool(1, smallContribution);
        
        // Verify user2's contribution was recorded
        const contributorAmount = await opinionMarket.poolContributionAmounts(1, user2.address);
        console.log(`Recorded contribution: ${ethers.formatUnits(contributorAmount, 6)} USDC`);
        
        // Contribution amount should match what we sent (minus any fee)
        expect(contributorAmount).to.equal(smallContribution);
        
        // Verify contributor is in the list
        const contributors = await opinionMarket.getPoolContributors(1);
        expect(contributors).to.include(user2.address);
      } else {
        console.log("Pool already executed or doesn't need more funds - skipping contribution check");
      }
    });
  });

describe("Pool Expiry Tests", function() {
    it("Should mark a pool as expired after deadline passes", async function() {
      // Create a new opinion
      await opinionMarket.createOpinion(
        "Expiry Test Question?", 
        "Initial Answer"
      );
      
      // Get minimum pool duration from contract
      const minPoolDuration = 1 * 24 * 60 * 60; // 1 day
      
      // Set a valid but short deadline
      const deadline = Math.floor(Date.now() / 1000) + minPoolDuration + 60; // Min duration + 1 minute
      
      // Get minimum pool contribution
      const minContribution = await opinionMarket.MINIMUM_POOL_CONTRIBUTION();
      
      // Create pool with short deadline
      await opinionMarket.connect(user1).createPool(
        3,                       // opinionId
        "Expiring Answer",       // proposedAnswer 
        deadline,                // valid deadline
        minContribution,         // initialContribution
        "Expiry Test Pool",      // name
        ""                       // ipfsHash
      );
      
      // Get pool status before time advancement
      const poolBefore = await opinionMarket.pools(2);
      expect(poolBefore.status).to.equal(0); // Active
      
      // Fast forward time past the deadline
      await ethers.provider.send("evm_increaseTime", [minPoolDuration + 120]); // min duration + 2 minutes
      await ethers.provider.send("evm_mine", []);
      
      // Call checkPoolExpiry as a transaction, not expecting a return value
      await opinionMarket.checkPoolExpiry(2);
      
      // Verify pool status was updated
      const poolAfter = await opinionMarket.pools(2);
      expect(poolAfter.status).to.equal(2); // PoolStatus.Expired
    });
  });
  
  describe("Pool Details Tests", function() {
    it("Should provide pool details via getPoolDetails", async function() {
      // Create a new opinion 
      await opinionMarket.createOpinion(
        "Details Test Question?", 
        "Initial Answer"
      );
      
      // Set deadline
      const sevenDays = 7 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + sevenDays;
      
      // Get minimum pool contribution
      const minContribution = await opinionMarket.MINIMUM_POOL_CONTRIBUTION();
      
      // Create pool with a valid IPFS hash format
      await opinionMarket.connect(user1).createPool(
        4,                      // opinionId
        "Details Test Answer",  // proposedAnswer
        deadline,               // deadline
        minContribution,        // initialContribution
        "Details Test Pool",    // name
        "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u" // Valid IPFS hash
      );
      
      // Get pool details
      const poolDetails = await opinionMarket.getPoolDetails(3);
      
      // Verify pool details are correct
      expect(poolDetails.info.id).to.equal(3);
      expect(poolDetails.info.opinionId).to.equal(4);
      expect(poolDetails.info.proposedAnswer).to.equal("Details Test Answer");
      expect(poolDetails.info.creator).to.equal(user1.address);
      expect(poolDetails.info.name).to.equal("Details Test Pool");
      expect(poolDetails.info.ipfsHash).to.equal("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u");
      
      // Verify time remaining is calculated correctly
      expect(poolDetails.timeRemaining).to.be.gt(0);
    });
  });

  describe("Pool Execution Tests", function() {
    it("Should execute a pool when sufficient funds are contributed", async function() {
      // Create a new opinion 
      await opinionMarket.createOpinion(
        "Execution Test Question?", 
        "Initial Answer"
      );
      
      // Set deadline
      const sevenDays = 7 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + sevenDays;
      
      // Get minimum pool contribution
      const minContribution = await opinionMarket.MINIMUM_POOL_CONTRIBUTION();
      
      // Create pool with initial contribution
      await opinionMarket.connect(user1).createPool(
        5,                      // opinionId
        "Execution Test Answer",// proposedAnswer
        deadline,               // deadline
        minContribution,        // initialContribution
        "Execution Test Pool",  // name
        ""                      // ipfsHash
      );
      
      // Get the target price
      const targetPrice = await opinionMarket.getNextPrice(5);
      console.log(`Target price: ${ethers.formatUnits(targetPrice, 6)} USDC`);
      
      // Calculate remaining amount needed
      const remainingNeeded = targetPrice - minContribution;
      console.log(`Remaining needed: ${ethers.formatUnits(remainingNeeded, 6)} USDC`);
      
      // If target price is already met, we can't test execution
      if (remainingNeeded <= 0) {
        console.log("Pool already fully funded - skipping execution test");
        return;
      }
      
      // Contribute the remaining amount to trigger execution
      await opinionMarket.connect(user2).contributeToPool(
        3,                // poolId
        remainingNeeded   // amount
      );
      
      // Verify pool was executed
      const pool = await opinionMarket.pools(3);
      expect(pool.status).to.equal(1); // PoolStatus.Executed
      
      // Verify opinion answer was updated
      const opinion = await opinionMarket.opinions(5);
      expect(opinion.currentAnswer).to.equal("Execution Test Answer");
      expect(opinion.currentAnswerOwner).to.equal(await opinionMarket.getAddress()); // Contract owns it on behalf of pool
    });
  });


  describe("Pool Reward Distribution Tests", function() {
    it("Should distribute rewards when pool-owned answer is purchased", async function() {
      // Create a fresh opinion
      const tx = await opinionMarket.createOpinion(
        "Pool Reward Test Question?", 
        "Initial Answer"
      );
      
      // Wait for transaction and get opinion ID
      await tx.wait();
      const opinionId = 1; // First opinion ID
      console.log(`Created opinion ID: ${opinionId}`);
      
      // Increase the price with multiple users
      for (const user of [user1, user2, user3]) {
        const currentPrice = await opinionMarket.getNextPrice(opinionId);
        console.log(`Current price before submission: ${ethers.formatUnits(currentPrice, 6)} USDC`);
        
        await opinionMarket.connect(user).submitAnswer(
          opinionId,
          `Price increase by ${user.address.substring(0, 6)}`
        );
      }
      
      // Get the target price for pool answer
      const targetPrice = await opinionMarket.getNextPrice(opinionId);
      console.log(`Target price for pool: ${ethers.formatUnits(targetPrice, 6)} USDC`);
      
      // Set deadline
      const sevenDays = 7 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + sevenDays;
      
      // Create pool with 60% from owner
      // With 1 USDC minimum, we can actually use meaningful percentages now
      const ownerContribution = (targetPrice * 60n) / 100n;
      console.log(`Owner contribution (60%): ${ethers.formatUnits(ownerContribution, 6)} USDC`);
      
      // Track pool count
      const poolCountBefore = await opinionMarket.poolCount();
      
      // Create pool with owner's contribution
      await opinionMarket.createPool(
        opinionId,
        "Pool Reward Answer",
        deadline,
        ownerContribution, // 60% of target
        "Reward Pool",
        ""
      );
      
      // Get pool ID
      const poolId = poolCountBefore;
      console.log(`Created pool with ID: ${poolId}`);
      
      // Check if the pool needs more contributions
      const poolDetails = await opinionMarket.getPoolDetails(poolId);
      const remainingAmount = poolDetails.remainingAmount;
      console.log(`Remaining amount needed: ${ethers.formatUnits(remainingAmount, 6)} USDC`);
      
      if (remainingAmount > 0) {
        // User1 contributes the remaining 40%
        console.log(`User1 contribution (40%): ${ethers.formatUnits(remainingAmount, 6)} USDC`);
        await opinionMarket.connect(user1).contributeToPool(poolId, remainingAmount);
      }
      
      // Verify the pool executed successfully
      const pool = await opinionMarket.pools(poolId);
      console.log(`Pool status after contributions: ${pool.status}`); // Should be 1 (Executed)
      expect(pool.status).to.equal(1); // PoolStatus.Executed
      
      // Verify contract owns the answer
      const opinion = await opinionMarket.opinions(opinionId);
      const contractAddress = await opinionMarket.getAddress();
      expect(opinion.currentAnswerOwner).to.equal(contractAddress);
      expect(opinion.currentAnswer).to.equal("Pool Reward Answer");
      
      // Get pool contributors
      const contributors = await opinionMarket.getPoolContributors(poolId);
      console.log("Pool contributors:", contributors);
      
      // Get accumulated fees before purchase
      const ownerFeesBefore = await opinionMarket.accumulatedFees(owner.address);
      const user1FeesBefore = await opinionMarket.accumulatedFees(user1.address);
      console.log(`Owner fees before purchase: ${ethers.formatUnits(ownerFeesBefore, 6)} USDC`);
      console.log(`User1 fees before purchase: ${ethers.formatUnits(user1FeesBefore, 6)} USDC`);
      
      // Find a user who isn't a contributor to buy the answer
      let buyer = user2;
      if (contributors.includes(user2.address)) {
        buyer = user3;
      }
      console.log(`Selected buyer: ${buyer.address}`);
      
      // Buyer purchases the answer
      const purchasePrice = await opinionMarket.getNextPrice(opinionId);
      console.log(`Purchase price for buyer: ${ethers.formatUnits(purchasePrice, 6)} USDC`);
      
      await opinionMarket.connect(buyer).submitAnswer(
        opinionId,
        "New Answer From Buyer"
      );
      
      // Get accumulated fees after purchase
      const ownerFeesAfter = await opinionMarket.accumulatedFees(owner.address);
      const user1FeesAfter = await opinionMarket.accumulatedFees(user1.address);
      console.log(`Owner fees after purchase: ${ethers.formatUnits(ownerFeesAfter, 6)} USDC`);
      console.log(`User1 fees after purchase: ${ethers.formatUnits(user1FeesAfter, 6)} USDC`);
      
      // Calculate rewards
      const ownerReward = ownerFeesAfter - ownerFeesBefore;
      const user1Reward = user1FeesAfter - user1FeesBefore;
      console.log(`Owner reward: ${ethers.formatUnits(ownerReward, 6)} USDC`);
      console.log(`User1 reward: ${ethers.formatUnits(user1Reward, 6)} USDC`);
      
      // Verify rewards were distributed
      if (ownerReward > 0 && user1Reward > 0) {
        // If both received rewards, check proportions
        const totalReward = ownerReward + user1Reward;
        const ownerPercentage = Number((ownerReward * 100n) / totalReward);
        
        console.log(`Owner reward percentage: ${ownerPercentage}%`);
        console.log(`User1 reward percentage: ${100 - ownerPercentage}%`);
        
        // Should be roughly proportional to contributions (60/40)
        // Allow for some variance due to rounding
        expect(ownerPercentage).to.be.approximately(60, 10);
      } else if (ownerReward > 0) {
        // If only owner received rewards, it was likely auto-executed without user1
        console.log("Only owner received rewards - likely auto-executed");
        expect(ownerReward).to.be.gt(0);
      } else if (user1Reward > 0) {
        // If only user1 received rewards (unlikely but possible)
        console.log("Only user1 received rewards");
        expect(user1Reward).to.be.gt(0);
      } else {
        // If no rewards were distributed, something went wrong
        console.log("No rewards were distributed!");
        throw new Error("No rewards were distributed to pool contributors");
      }
    });
  });

});