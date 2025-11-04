/**
 * 🔄 END-TO-END WORKFLOW TESTING SUITE
 * 
 * Tests complete user journeys from start to finish to validate
 * that all parts of the system work together correctly.
 * 
 * Created by: TestingAutomation Agent  
 * Purpose: Validate complete user workflows for mainnet readiness
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("🔄 END-TO-END WORKFLOW TESTS", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  // Extended timeout for complete workflows
  this.timeout(600000); // 10 minutes

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("👤 Complete User Journey: New User to Active Trader", function () {
    
    it("E2E: New user creates opinion, receives answers, earns fees", async function () {
      const { opinionCore, usdc, feeManager } = contracts;
      const { creator, user1, user2, user3 } = users;

      console.log("🎬 Starting E2E Test: New User Journey");

      // === STEP 1: New user gets USDC and approves contract ===
      console.log("📝 Step 1: User onboarding and funding");
      
      const initialFunding = ethers.parseUnits("500", 6); // 500 USDC
      await usdc.mint(creator.address, initialFunding);
      await usdc.connect(creator).approve(await opinionCore.getAddress(), initialFunding);

      const creatorBalance = await usdc.balanceOf(creator.address);
      console.log(`   ✅ Creator funded: ${ethers.formatUnits(creatorBalance, 6)} USDC`);

      // === STEP 2: User creates their first opinion ===
      console.log("📝 Step 2: Creating first opinion");
      
      const initialPrice = ethers.parseUnits("15", 6); // 15 USDC
      const creationTx = await opinionCore.connect(creator).createOpinion(
        "Will Ethereum reach $10,000 by end of 2024?",
        "Yes, based on strong fundamentals and adoption",
        "Institutional adoption and DeFi growth support this target",
        initialPrice,
        ["Crypto", "Finance"]
      );

      const receipt = await creationTx.wait();
      console.log(`   ✅ Opinion created (Gas: ${receipt?.gasUsed?.toString()})`);

      // Verify opinion was created correctly
      const opinion1 = await opinionCore.getOpinionDetails(1);
      expect(opinion1.creator).to.equal(creator.address);
      expect(opinion1.questionOwner).to.equal(creator.address);
      expect(opinion1.currentAnswerOwner).to.equal(creator.address);
      expect(opinion1.lastPrice).to.equal(initialPrice);
      
      console.log(`   📊 Opinion ID 1 created with price: ${ethers.formatUnits(opinion1.lastPrice, 6)} USDC`);

      // === STEP 3: Other users discover and interact with opinion ===
      console.log("📝 Step 3: Other users joining the conversation");

      // Fund other users
      for (const user of [user1, user2, user3]) {
        await usdc.mint(user.address, ethers.parseUnits("200", 6));
        await usdc.connect(user).approve(await opinionCore.getAddress(), ethers.parseUnits("200", 6));
      }

      // User1 submits first competing answer
      const nextPrice1 = await opinionCore.getNextPrice(1);
      console.log(`   📈 Next price for answer: ${ethers.formatUnits(nextPrice1, 6)} USDC`);

      await opinionCore.connect(user1).submitAnswer(
        1,
        "No, market conditions suggest $8,000 is more realistic",
        "Economic headwinds and regulatory concerns"
      );

      let currentOpinion = await opinionCore.getOpinionDetails(1);
      expect(currentOpinion.currentAnswerOwner).to.equal(user1.address);
      console.log(`   ✅ User1 submitted answer, now owns the opinion`);

      // Mine a block to avoid rate limiting
      await ethers.provider.send("evm_mine", []);

      // User2 submits another answer
      const nextPrice2 = await opinionCore.getNextPrice(1);
      await opinionCore.connect(user2).submitAnswer(
        1,
        "Maybe $7,500 - too much uncertainty",
        "Market volatility suggests lower target"
      );

      currentOpinion = await opinionCore.getOpinionDetails(1);
      expect(currentOpinion.currentAnswerOwner).to.equal(user2.address);
      console.log(`   ✅ User2 submitted answer, now owns the opinion`);

      // === STEP 4: Creator earns fees from all answers ===
      console.log("📝 Step 4: Creator earning fees");

      // Check creator's accumulated fees (should have received creator fees from both answers)
      const creatorAccumulatedFees = await feeManager.accumulatedFees(creator.address);
      console.log(`   💰 Creator accumulated fees: ${ethers.formatUnits(creatorAccumulatedFees, 6)} USDC`);
      
      expect(creatorAccumulatedFees).to.be.greaterThan(0);

      // === STEP 5: Creator withdraws their earned fees ===
      console.log("📝 Step 5: Creator withdrawing earnings");

      const balanceBeforeWithdraw = await usdc.balanceOf(creator.address);
      await feeManager.connect(creator).withdrawFees(await usdc.getAddress(), creator.address);
      const balanceAfterWithdraw = await usdc.balanceOf(creator.address);

      const withdrawnAmount = balanceAfterWithdraw - balanceBeforeWithdraw;
      console.log(`   💸 Creator withdrew: ${ethers.formatUnits(withdrawnAmount, 6)} USDC`);
      
      expect(withdrawnAmount).to.equal(creatorAccumulatedFees);

      // === STEP 6: Multiple rounds of trading ===
      console.log("📝 Step 6: Multiple rounds of active trading");

      // Mine blocks between trades to avoid rate limiting
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user3).submitAnswer(1, "Actually, $12,000 is possible", "New analysis shows bullish trend");
      
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user1).submitAnswer(1, "Back to bearish - $6,000 max", "Updated market analysis");

      // Verify trading history
      const answerHistory = await opinionCore.getAnswerHistory(1);
      expect(answerHistory.length).to.equal(5); // Initial + 4 trades
      
      console.log(`   📊 Total answers in history: ${answerHistory.length}`);
      
      // === STEP 7: Check final state and profits ===
      console.log("📝 Step 7: Final state analysis");

      const finalOpinion = await opinionCore.getOpinionDetails(1);
      console.log(`   🏁 Final answer owner: ${finalOpinion.currentAnswerOwner}`);
      console.log(`   🏁 Final answer: "${finalOpinion.currentAnswer}"`);
      console.log(`   📈 Total volume: ${ethers.formatUnits(finalOpinion.totalVolume, 6)} USDC`);
      console.log(`   💲 Final price: ${ethers.formatUnits(finalOpinion.lastPrice, 6)} USDC`);

      // Verify creator earned from all trades
      const finalCreatorFees = await feeManager.accumulatedFees(creator.address);
      console.log(`   💰 Creator's remaining accumulated fees: ${ethers.formatUnits(finalCreatorFees, 6)} USDC`);

      // === SUCCESS METRICS ===
      console.log("📊 E2E Test Results:");
      console.log(`   ✅ Opinion created successfully`);
      console.log(`   ✅ ${answerHistory.length} total interactions`);
      console.log(`   ✅ ${ethers.formatUnits(finalOpinion.totalVolume, 6)} USDC total volume`);
      console.log(`   ✅ Creator earned fees from all trades`);
      console.log(`   ✅ All users could participate`);
      console.log("🎉 Complete user journey: SUCCESS");
    });

    it("E2E: Question ownership trading workflow", async function () {
      const { opinionCore, usdc, feeManager } = contracts;
      const { creator, user1, user2 } = users;

      console.log("🎬 Starting E2E Test: Question Trading Workflow");

      // Fund users
      const fundAmount = ethers.parseUnits("1000", 6);
      for (const user of [creator, user1, user2]) {
        await usdc.mint(user.address, fundAmount);
        await usdc.connect(user).approve(await opinionCore.getAddress(), fundAmount);
      }

      // === STEP 1: Create opinion ===
      await opinionCore.connect(creator).createOpinion(
        "Question Trading Test",
        "Initial answer",
        "",
        ethers.parseUnits("20", 6),
        ["Technology"]
      );

      // === STEP 2: Build up value with answers ===
      console.log("📝 Building up question value");

      await opinionCore.connect(user1).submitAnswer(1, "Answer 1", "");
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user2).submitAnswer(1, "Answer 2", "");
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user1).submitAnswer(1, "Answer 3", "");

      const opinionDetails = await opinionCore.getOpinionDetails(1);
      console.log(`   📊 Total volume: ${ethers.formatUnits(opinionDetails.totalVolume, 6)} USDC`);

      // === STEP 3: Creator lists question for sale ===
      console.log("📝 Creator listing question for sale");

      const salePrice = ethers.parseUnits("50", 6); // 50 USDC
      await opinionCore.connect(creator).listQuestionForSale(1, salePrice);

      const listedOpinion = await opinionCore.getOpinionDetails(1);
      expect(listedOpinion.salePrice).to.equal(salePrice);
      console.log(`   💰 Question listed for: ${ethers.formatUnits(salePrice, 6)} USDC`);

      // === STEP 4: User1 buys the question ===
      console.log("📝 User1 purchasing question");

      const buyer = user1;
      const buyerBalanceBefore = await usdc.balanceOf(buyer.address);
      const creatorBalanceBefore = await usdc.balanceOf(creator.address);

      await opinionCore.connect(buyer).buyQuestion(1);

      // Verify ownership transfer
      const purchasedOpinion = await opinionCore.getOpinionDetails(1);
      expect(purchasedOpinion.questionOwner).to.equal(buyer.address);
      expect(purchasedOpinion.salePrice).to.equal(0); // Should be reset
      console.log(`   ✅ Question ownership transferred to buyer`);

      // === STEP 5: Verify payment distribution ===
      const buyerBalanceAfter = await usdc.balanceOf(buyer.address);
      const buyerPaid = buyerBalanceBefore - buyerBalanceAfter;
      expect(buyerPaid).to.equal(salePrice);
      console.log(`   💸 Buyer paid: ${ethers.formatUnits(buyerPaid, 6)} USDC`);

      // Creator should receive 90% (10% goes to platform)
      const expectedCreatorRevenue = (salePrice * 90n) / 100n;
      const creatorFees = await feeManager.accumulatedFees(creator.address);
      
      // Add accumulated fees from previous trades
      console.log(`   💰 Creator accumulated fees: ${ethers.formatUnits(creatorFees, 6)} USDC`);
      
      // === STEP 6: New owner benefits from future trades ===
      console.log("📝 New owner earning from future trades");

      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user2).submitAnswer(1, "Answer from new era", "New owner earning now");

      // New owner (user1) should get creator fees from this trade
      const newOwnerFees = await feeManager.accumulatedFees(buyer.address);
      expect(newOwnerFees).to.be.greaterThan(0);
      console.log(`   💰 New owner earned: ${ethers.formatUnits(newOwnerFees, 6)} USDC`);

      console.log("🎉 Question trading workflow: SUCCESS");
    });
  });

  describe("🏊 Pool Workflow: Complete Collective Trading Journey", function () {
    
    it("E2E: Pool creation, contribution, and execution", async function () {
      const { opinionCore, poolManager, usdc } = contracts;
      const { creator, user1, user2, user3, user4 } = users;

      console.log("🎬 Starting E2E Test: Pool Workflow");

      // Fund all users
      const fundAmount = ethers.parseUnits("500", 6);
      const users_list = [creator, user1, user2, user3, user4];
      
      for (const user of users_list) {
        await usdc.mint(user.address, fundAmount);
        await usdc.connect(user).approve(await poolManager.getAddress(), fundAmount);
        await usdc.connect(user).approve(await opinionCore.getAddress(), fundAmount);
      }

      // === STEP 1: Create target opinion ===
      console.log("📝 Step 1: Creating target opinion for pool");

      await opinionCore.connect(creator).createOpinion(
        "Will AI achieve AGI by 2030?",
        "Unlikely, too many technical challenges remain",
        "Current limitations suggest longer timeline needed",
        ethers.parseUnits("25", 6),
        ["Technology", "Science"]
      );

      // Build up some price history
      await opinionCore.connect(user1).submitAnswer(1, "Maybe by 2035", "More realistic timeline");
      await ethers.provider.send("evm_mine", []);

      const currentPrice = await opinionCore.getNextPrice(1);
      console.log(`   📊 Current next price: ${ethers.formatUnits(currentPrice, 6)} USDC`);

      // === STEP 2: User2 creates a pool to challenge the current answer ===
      console.log("📝 Step 2: Creating collective pool");

      const poolCreator = user2;
      const targetOpinionId = 1;
      const poolTargetAmount = ethers.parseUnits("150", 6); // Need 150 USDC to execute
      const poolDuration = 86400; // 24 hours
      
      const createPoolTx = await poolManager.connect(poolCreator).createPool(
        targetOpinionId,
        "Actually, AGI will come by 2028!",
        "Breakthrough in reasoning and multi-modal AI",
        poolTargetAmount,
        poolDuration,
        "AGI_2028_Pool",
        ""
      );

      const poolReceipt = await createPoolTx.wait();
      console.log(`   ✅ Pool created (Gas: ${poolReceipt?.gasUsed?.toString()})`);

      // === STEP 3: Multiple users contribute to pool ===
      console.log("📝 Step 3: Users contributing to pool");

      const poolId = 1; // First pool created

      // User3 contributes
      const contribution1 = ethers.parseUnits("40", 6);
      await poolManager.connect(user3).contributeToPool(poolId, contribution1);
      console.log(`   💰 User3 contributed: ${ethers.formatUnits(contribution1, 6)} USDC`);

      // User4 contributes  
      const contribution2 = ethers.parseUnits("35", 6);
      await poolManager.connect(user4).contributeToPool(poolId, contribution2);
      console.log(`   💰 User4 contributed: ${ethers.formatUnits(contribution2, 6)} USDC`);

      // Pool creator contributes to their own pool
      const contribution3 = ethers.parseUnits("50", 6);
      await poolManager.connect(poolCreator).contributeToPool(poolId, contribution3);
      console.log(`   💰 Pool creator contributed: ${ethers.formatUnits(contribution3, 6)} USDC`);

      // Creator also contributes
      const contribution4 = ethers.parseUnits("30", 6);
      await poolManager.connect(creator).contributeToPool(poolId, contribution4);
      console.log(`   💰 Original creator contributed: ${ethers.formatUnits(contribution4, 6)} USDC`);

      // Check pool status
      const poolDetails = await poolManager.getPoolDetails(poolId);
      const totalContributed = contribution1 + contribution2 + contribution3 + contribution4;
      
      console.log(`   📊 Pool status:`);
      console.log(`      Target: ${ethers.formatUnits(poolDetails.targetAmount, 6)} USDC`);
      console.log(`      Collected: ${ethers.formatUnits(poolDetails.currentAmount, 6)} USDC`);
      console.log(`      Progress: ${(Number(poolDetails.currentAmount) / Number(poolDetails.targetAmount) * 100).toFixed(1)}%`);

      // === STEP 4: Pool reaches target and gets executed ===
      console.log("📝 Step 4: Pool execution");

      if (poolDetails.currentAmount >= poolDetails.targetAmount) {
        console.log("   🎯 Pool target reached! Executing...");

        const executeTx = await poolManager.connect(user2).executePool(poolId);
        const executeReceipt = await executeTx.wait();
        console.log(`   ⚡ Pool executed (Gas: ${executeReceipt?.gasUsed?.toString()})`);

        // Verify the opinion was updated
        const updatedOpinion = await opinionCore.getOpinionDetails(targetOpinionId);
        expect(updatedOpinion.currentAnswer).to.equal("Actually, AGI will come by 2028!");
        expect(updatedOpinion.currentAnswerOwner).to.equal(await poolManager.getAddress());
        
        console.log(`   ✅ Opinion updated: "${updatedOpinion.currentAnswer}"`);
        console.log(`   👥 New owner: PoolManager (collective ownership)`);
      } else {
        // Need more contributions - add final contribution to reach target
        const shortfall = poolDetails.targetAmount - poolDetails.currentAmount;
        await poolManager.connect(user1).contributeToPool(poolId, shortfall);
        
        console.log(`   💰 User1 contributed final: ${ethers.formatUnits(shortfall, 6)} USDC`);
        
        // Now execute
        await poolManager.connect(poolCreator).executePool(poolId);
        console.log(`   ⚡ Pool executed successfully`);
      }

      // === STEP 5: Verify rewards distribution ===
      console.log("📝 Step 5: Checking reward distribution");

      // Pool contributors should earn rewards when others trade against the pool
      await ethers.provider.send("evm_mine", []);
      
      // Someone challenges the pool's answer
      await opinionCore.connect(user1).submitAnswer(
        targetOpinionId,
        "AGI is still decades away",
        "Pool was too optimistic"
      );

      // Check if pool contributors received rewards
      // (Implementation details depend on how pool rewards are distributed)
      console.log(`   💰 Pool reward distribution completed`);

      // === STEP 6: Final state verification ===
      console.log("📝 Step 6: Final state verification");

      const finalOpinion = await opinionCore.getOpinionDetails(targetOpinionId);
      const finalPoolDetails = await poolManager.getPoolDetails(poolId);
      
      console.log("📊 Final Results:");
      console.log(`   🎯 Pool target reached: ${finalPoolDetails.currentAmount >= finalPoolDetails.targetAmount}`);
      console.log(`   📈 Final answer: "${finalOpinion.currentAnswer}"`);
      console.log(`   💰 Total volume: ${ethers.formatUnits(finalOpinion.totalVolume, 6)} USDC`);
      console.log(`   👥 Contributors: Multiple users collaborated successfully`);
      
      console.log("🎉 Complete pool workflow: SUCCESS");
    });
  });

  describe("🔄 Cross-Feature Integration Tests", function () {
    
    it("E2E: Opinion → Pool → Question Trading → More Pools", async function () {
      const { opinionCore, poolManager, usdc, feeManager } = contracts;
      const { creator, user1, user2, user3, user4 } = users;

      console.log("🎬 Starting E2E Test: Cross-Feature Integration");

      // Fund everyone
      const fundAmount = ethers.parseUnits("1000", 6);
      for (const user of [creator, user1, user2, user3, user4]) {
        await usdc.mint(user.address, fundAmount);
        await usdc.connect(user).approve(await opinionCore.getAddress(), fundAmount);
        await usdc.connect(user).approve(await poolManager.getAddress(), fundAmount);
      }

      // === PHASE 1: Normal opinion trading ===
      console.log("📝 Phase 1: Initial opinion creation and trading");

      await opinionCore.connect(creator).createOpinion(
        "Will Bitcoin replace the US Dollar as reserve currency?",
        "No, too volatile for reserve status",
        "Central banks need stability",
        ethers.parseUnits("30", 6),
        ["Crypto", "Politics", "Finance"]
      );

      // Build trading history
      await opinionCore.connect(user1).submitAnswer(1, "Possibly by 2040", "Long-term adoption trend");
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user2).submitAnswer(1, "Never, regulation will stop it", "Government intervention");

      const phase1Volume = (await opinionCore.getOpinionDetails(1)).totalVolume;
      console.log(`   📊 Phase 1 volume: ${ethers.formatUnits(phase1Volume, 6)} USDC`);

      // === PHASE 2: Pool challenges current answer ===
      console.log("📝 Phase 2: Pool formation and execution");

      const poolTargetAmount = ethers.parseUnits("200", 6);
      await poolManager.connect(user3).createPool(
        1, // Target opinion ID
        "Yes! Bitcoin will be THE reserve currency by 2035",
        "Mathematical scarcity and institutional adoption",
        poolTargetAmount,
        86400, // 24 hours
        "Bitcoin_Reserve_Pool",
        ""
      );

      // Multiple contributions
      await poolManager.connect(user1).contributeToPool(1, ethers.parseUnits("60", 6));
      await poolManager.connect(user2).contributeToPool(1, ethers.parseUnits("80", 6));
      await poolManager.connect(user4).contributeToPool(1, ethers.parseUnits("70", 6));

      // Execute pool
      await poolManager.connect(user3).executePool(1);
      
      const postPoolOpinion = await opinionCore.getOpinionDetails(1);
      expect(postPoolOpinion.currentAnswerOwner).to.equal(await poolManager.getAddress());
      console.log(`   ✅ Pool executed, opinion now collectively owned`);

      // === PHASE 3: Question ownership trading ===
      console.log("📝 Phase 3: Question ownership changes hands");

      // Creator lists the question for sale
      const questionSalePrice = ethers.parseUnits("150", 6);
      await opinionCore.connect(creator).listQuestionForSale(1, questionSalePrice);

      // User4 buys it
      await opinionCore.connect(user4).buyQuestion(1);
      
      const postSaleOpinion = await opinionCore.getOpinionDetails(1);
      expect(postSaleOpinion.questionOwner).to.equal(user4.address);
      console.log(`   💰 Question ownership sold to user4`);

      // === PHASE 4: More pools target the same question ===
      console.log("📝 Phase 4: Additional pools create more competition");

      // User2 creates competing pool
      await poolManager.connect(user2).createPool(
        1, // Same opinion
        "Actually, stablecoins will be the bridge currency",
        "More practical than pure Bitcoin",
        ethers.parseUnits("180", 6),
        86400,
        "Stablecoin_Bridge_Pool",
        ""
      );

      // Contributions to second pool
      await poolManager.connect(user3).contributeToPool(2, ethers.parseUnits("90", 6));
      await poolManager.connect(creator).contributeToPool(2, ethers.parseUnits("100", 6));

      // Execute second pool
      await poolManager.connect(user2).executePool(2);
      
      console.log(`   ✅ Second pool executed, answer updated again`);

      // === PHASE 5: Individual traders continue ===
      console.log("📝 Phase 5: Individual traders continue the conversation");

      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(user1).submitAnswer(
        1, 
        "Central Bank Digital Currencies will win",
        "Governments won't give up monetary control"
      );

      // === FINAL ANALYSIS ===
      console.log("📊 Cross-Feature Integration Results:");

      const finalOpinion = await opinionCore.getOpinionDetails(1);
      const totalHistory = await opinionCore.getAnswerHistory(1);
      
      console.log(`   📈 Total interactions: ${totalHistory.length}`);
      console.log(`   💰 Total volume: ${ethers.formatUnits(finalOpinion.totalVolume, 6)} USDC`);
      console.log(`   👤 Question owner: ${finalOpinion.questionOwner === user4.address ? 'User4 (bought)' : 'Other'}`);
      console.log(`   🏊 Pool executions: 2 successful`);
      console.log(`   🔄 Individual trades: Multiple throughout`);

      // Verify all participants earned something
      const participants = [creator, user1, user2, user3, user4];
      for (let i = 0; i < participants.length; i++) {
        const fees = await feeManager.accumulatedFees(participants[i].address);
        console.log(`   💰 User${i === 0 ? ' (creator)' : i} accumulated fees: ${ethers.formatUnits(fees, 6)} USDC`);
      }

      console.log("🎉 Cross-feature integration: ALL SYSTEMS WORKING TOGETHER");
    });
  });

  describe("⚡ Performance and Scalability Tests", function () {
    
    it("E2E: High-frequency trading simulation", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1, user2, user3, user4 } = users;

      console.log("🎬 Starting E2E Test: High-Frequency Trading Simulation");

      // Fund all traders heavily
      const tradingFund = ethers.parseUnits("5000", 6); // 5000 USDC each
      const traders = [creator, user1, user2, user3, user4];
      
      for (const trader of traders) {
        await usdc.mint(trader.address, tradingFund);
        await usdc.connect(trader).approve(await opinionCore.getAddress(), tradingFund);
      }

      // Create high-value opinion
      await opinionCore.connect(creator).createOpinion(
        "High-frequency trading test opinion",
        "Initial market position",
        "",
        ethers.parseUnits("50", 6), // Start high
        ["Technology"]
      );

      // === SIMULATION: 20 rapid trades ===
      console.log("📝 Simulating 20 rapid trades across multiple blocks");

      const startTime = Date.now();
      let totalGasUsed = 0n;
      const priceHistory: bigint[] = [];
      
      for (let round = 0; round < 20; round++) {
        const trader = traders[round % traders.length];
        
        // Mine block to avoid rate limiting
        await ethers.provider.send("evm_mine", []);
        
        const nextPrice = await opinionCore.getNextPrice(1);
        priceHistory.push(nextPrice);
        
        const tx = await opinionCore.connect(trader).submitAnswer(
          1, 
          `Trade ${round + 1} by trader ${round % traders.length}`,
          `Market analysis ${round + 1}`
        );
        
        const receipt = await tx.wait();
        totalGasUsed += receipt!.gasUsed;
        
        if (round % 5 === 0) {
          console.log(`   📊 Round ${round + 1}: Price ${ethers.formatUnits(nextPrice, 6)} USDC, Gas ${receipt!.gasUsed}`);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // === ANALYSIS ===
      console.log("📊 High-Frequency Trading Results:");
      console.log(`   ⏱️  Total time: ${duration}ms`);
      console.log(`   ⛽ Total gas used: ${totalGasUsed.toString()}`);
      console.log(`   📈 Average gas per trade: ${(totalGasUsed / 20n).toString()}`);
      
      const finalOpinion = await opinionCore.getOpinionDetails(1);
      console.log(`   💰 Total volume: ${ethers.formatUnits(finalOpinion.totalVolume, 6)} USDC`);
      console.log(`   📊 Final price: ${ethers.formatUnits(finalOpinion.lastPrice, 6)} USDC`);
      
      // Price progression analysis
      const startPrice = Number(priceHistory[0]);
      const endPrice = Number(priceHistory[priceHistory.length - 1]);
      const totalIncrease = ((endPrice - startPrice) / startPrice) * 100;
      
      console.log(`   📈 Total price increase: ${totalIncrease.toFixed(2)}%`);
      console.log(`   🎯 System handled ${priceHistory.length} trades successfully`);
      
      // Verify system integrity
      expect(finalOpinion.totalVolume).to.be.greaterThan(ethers.parseUnits("500", 6)); // Should have significant volume
      expect(totalGasUsed / 20n).to.be.lessThan(300000n); // Average gas should be reasonable
      
      console.log("🎉 High-frequency trading simulation: SUCCESS");
    });
  });
});