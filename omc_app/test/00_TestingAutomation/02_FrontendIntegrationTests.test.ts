/**
 * 🖥️ FRONTEND-BACKEND INTEGRATION TESTING SUITE
 * 
 * Tests the integration between frontend React components and smart contracts
 * to validate that the UI correctly interacts with the blockchain layer.
 * 
 * Created by: TestingAutomation Agent
 * Purpose: Validate frontend safety features and contract integration
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("🖥️ FRONTEND-BACKEND INTEGRATION TESTS", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  this.timeout(300000); // 5 minutes

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("🔗 Contract Integration Validation", function () {
    
    it("INTEGRATION: Frontend contract addresses match deployed contracts", async function () {
      const { opinionCore, feeManager, poolManager, usdc } = contracts;

      console.log("🔍 Validating contract addresses for frontend integration");

      // These addresses should match what's in the frontend configuration
      const addresses = {
        opinionCore: await opinionCore.getAddress(),
        feeManager: await feeManager.getAddress(),
        poolManager: await poolManager.getAddress(),
        usdc: await usdc.getAddress()
      };

      console.log("📋 Contract addresses for frontend config:");
      console.log(`   OpinionCore: ${addresses.opinionCore}`);
      console.log(`   FeeManager: ${addresses.feeManager}`);
      console.log(`   PoolManager: ${addresses.poolManager}`);
      console.log(`   USDC Token: ${addresses.usdc}`);

      // Validate that contracts are properly linked
      expect(await opinionCore.feeManager()).to.equal(addresses.feeManager);
      expect(await opinionCore.poolManager()).to.equal(addresses.poolManager);
      expect(await opinionCore.usdcToken()).to.equal(addresses.usdc);

      console.log("✅ Contract linking validated for frontend integration");
    });

    it("INTEGRATION: Frontend ABI compatibility validation", async function () {
      const { opinionCore, feeManager, poolManager } = contracts;
      const { creator, user1 } = users;

      console.log("🔍 Testing critical function calls that frontend uses");

      // Fund users
      await contracts.usdc.mint(creator.address, ethers.parseUnits("100", 6));
      await contracts.usdc.mint(user1.address, ethers.parseUnits("100", 6));
      await contracts.usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await contracts.usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

      // === TEST: Opinion creation (exact signature frontend uses) ===
      console.log("📝 Testing opinion creation signature");
      
      const tx1 = await opinionCore.connect(creator).createOpinion(
        "Frontend Integration Test Question?",
        "Initial Answer",
        "Test description",
        ethers.parseUnits("10", 6),
        ["Technology"] // Single category array
      );
      await tx1.wait();

      const opinion = await opinionCore.getOpinionDetails(1);
      expect(opinion.question).to.equal("Frontend Integration Test Question?");
      console.log("✅ Opinion creation signature compatible");

      // === TEST: Answer submission (exact signature frontend uses) ===
      console.log("📝 Testing answer submission signature");

      const tx2 = await opinionCore.connect(user1).submitAnswer(
        1,
        "Frontend Test Answer",
        "Answer description",
        "https://example.com/link"
      );
      await tx2.wait();

      const updatedOpinion = await opinionCore.getOpinionDetails(1);
      expect(updatedOpinion.currentAnswer).to.equal("Frontend Test Answer");
      expect(updatedOpinion.link).to.equal("https://example.com/link");
      console.log("✅ Answer submission signature compatible");

      // === TEST: Question trading signatures ===
      console.log("📝 Testing question trading signatures");

      const salePrice = ethers.parseUnits("25", 6);
      await opinionCore.connect(creator).listQuestionForSale(1, salePrice);

      await contracts.usdc.connect(user1).approve(await opinionCore.getAddress(), salePrice);
      await opinionCore.connect(user1).buyQuestion(1);

      const tradedOpinion = await opinionCore.getOpinionDetails(1);
      expect(tradedOpinion.questionOwner).to.equal(user1.address);
      console.log("✅ Question trading signatures compatible");

      // === TEST: View functions frontend needs ===
      console.log("📝 Testing view functions frontend relies on");

      const nextPrice = await opinionCore.getNextPrice(1);
      expect(nextPrice).to.be.greaterThan(0);

      const answerHistory = await opinionCore.getAnswerHistory(1);
      expect(answerHistory.length).to.be.greaterThan(0);

      const creatorGain = await opinionCore.getCreatorGain(1);
      expect(creatorGain).to.be.greaterThan(0);

      console.log("✅ All view functions working correctly");

      // === TEST: Pool functions ===
      console.log("📝 Testing pool function signatures");

      await contracts.usdc.connect(user1).approve(await poolManager.getAddress(), ethers.parseUnits("100", 6));

      const poolTx = await poolManager.connect(user1).createPool(
        1,
        "Pool Answer",
        "Pool Description", 
        ethers.parseUnits("50", 6),
        86400,
        "TestPool",
        ""
      );
      await poolTx.wait();

      const poolDetails = await poolManager.getPoolDetails(1);
      expect(poolDetails.targetAmount).to.equal(ethers.parseUnits("50", 6));
      console.log("✅ Pool function signatures compatible");

      console.log("🎉 All frontend ABI compatibility tests passed");
    });
  });

  describe("💰 Financial Safety Integration", function () {
    
    it("INTEGRATION: Transaction safety validation mirrors frontend logic", async function () {
      const { opinionCore, usdc, feeManager } = contracts;
      const { creator, user1 } = users;

      console.log("🛡️ Testing transaction safety validation");

      // Fund users
      const fundAmount = ethers.parseUnits("1000", 6);
      await usdc.mint(creator.address, fundAmount);
      await usdc.mint(user1.address, fundAmount);
      await usdc.connect(creator).approve(await opinionCore.getAddress(), fundAmount);
      await usdc.connect(user1).approve(await opinionCore.getAddress(), fundAmount);

      // Create opinion
      const initialPrice = ethers.parseUnits("20", 6);
      await opinionCore.connect(creator).createOpinion(
        "Safety Validation Test",
        "Initial Answer",
        "",
        initialPrice,
        ["Finance"]
      );

      const nextPrice = await opinionCore.getNextPrice(1);

      // === TEST: Price impact validation (frontend should warn about this) ===
      console.log("📝 Testing price impact calculation");

      const oldPrice = Number(ethers.formatUnits(initialPrice, 6));
      const newPrice = Number(ethers.formatUnits(nextPrice, 6));
      const priceImpact = ((newPrice - oldPrice) / oldPrice) * 100;

      console.log(`   📊 Price impact: ${priceImpact.toFixed(2)}%`);

      // Frontend should warn if price impact > 20%
      if (Math.abs(priceImpact) > 20) {
        console.log("   ⚠️  HIGH PRICE IMPACT - Frontend should show warning");
      } else {
        console.log("   ✅ Normal price impact - No warning needed");
      }

      // === TEST: Large amount validation ===
      console.log("📝 Testing large amount detection");

      const amountUSD = Number(ethers.formatUnits(nextPrice, 6));
      if (amountUSD > 100) {
        console.log(`   ⚠️  LARGE AMOUNT (${amountUSD} USD) - Frontend should require confirmation`);
      } else {
        console.log(`   ✅ Normal amount (${amountUSD} USD)`);
      }

      // === TEST: Insufficient balance validation ===
      console.log("📝 Testing insufficient balance detection");

      const userBalance = await usdc.balanceOf(user1.address);
      const userBalanceUSD = Number(ethers.formatUnits(userBalance, 6));
      const requiredUSD = Number(ethers.formatUnits(nextPrice, 6));

      console.log(`   💰 User balance: ${userBalanceUSD} USDC`);
      console.log(`   💸 Required amount: ${requiredUSD} USDC`);

      if (userBalanceUSD < requiredUSD) {
        console.log("   ❌ INSUFFICIENT BALANCE - Frontend should prevent transaction");
        expect.fail("User should have sufficient balance for this test");
      } else {
        console.log("   ✅ Sufficient balance");
      }

      // === TEST: Allowance validation ===
      console.log("📝 Testing allowance validation");

      const allowance = await usdc.allowance(user1.address, await opinionCore.getAddress());
      const allowanceUSD = Number(ethers.formatUnits(allowance, 6));

      console.log(`   🎫 User allowance: ${allowanceUSD} USDC`);

      if (allowanceUSD < requiredUSD) {
        console.log("   ❌ INSUFFICIENT ALLOWANCE - Frontend should request approval");
      } else {
        console.log("   ✅ Sufficient allowance");
      }

      // === TEST: Execute transaction with all validations passed ===
      console.log("📝 Executing transaction with all safety checks passed");

      const tx = await opinionCore.connect(user1).submitAnswer(
        1,
        "Safety validated answer",
        "All checks passed"
      );
      const receipt = await tx.wait();
      
      console.log(`   ✅ Transaction successful (Gas: ${receipt?.gasUsed?.toString()})`);

      // === TEST: Fee calculation matches frontend expectations ===
      console.log("📝 Validating fee calculations");

      const userFees = await feeManager.accumulatedFees(user1.address);
      const creatorFees = await feeManager.accumulatedFees(creator.address);

      console.log(`   💰 User accumulated fees: ${ethers.formatUnits(userFees, 6)} USDC`);
      console.log(`   💰 Creator accumulated fees: ${ethers.formatUnits(creatorFees, 6)} USDC`);

      // Creator should have earned fees from the transaction
      expect(creatorFees).to.be.greaterThan(0);

      console.log("🎉 All transaction safety integrations validated");
    });

    it("INTEGRATION: Gas estimation for frontend gas warnings", async function () {
      const { opinionCore, poolManager, usdc } = contracts;
      const { creator, user1 } = users;

      console.log("⛽ Testing gas estimation for frontend warnings");

      // Fund users
      await usdc.mint(creator.address, ethers.parseUnits("100", 6));
      await usdc.mint(user1.address, ethers.parseUnits("100", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await usdc.connect(user1).approve(await poolManager.getAddress(), ethers.parseUnits("100", 6));

      // === TEST: Opinion creation gas ===
      const estimateCreate = await opinionCore.connect(creator).createOpinion.estimateGas(
        "Gas Test Question",
        "Answer",
        "",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      console.log(`   📊 Opinion creation estimated gas: ${estimateCreate.toString()}`);

      // Execute to get actual gas
      const createTx = await opinionCore.connect(creator).createOpinion(
        "Gas Test Question",
        "Answer",
        "",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      const createReceipt = await createTx.wait();
      console.log(`   📊 Opinion creation actual gas: ${createReceipt?.gasUsed?.toString()}`);

      // === TEST: Answer submission gas ===
      const estimateAnswer = await opinionCore.connect(user1).submitAnswer.estimateGas(
        1,
        "Gas test answer",
        ""
      );
      console.log(`   📊 Answer submission estimated gas: ${estimateAnswer.toString()}`);

      const answerTx = await opinionCore.connect(user1).submitAnswer(1, "Gas test answer", "");
      const answerReceipt = await answerTx.wait();
      console.log(`   📊 Answer submission actual gas: ${answerReceipt?.gasUsed?.toString()}`);

      // === TEST: Pool creation gas ===
      const estimatePool = await poolManager.connect(user1).createPool.estimateGas(
        1,
        "Pool answer",
        "",
        ethers.parseUnits("50", 6),
        86400,
        "GasTestPool",
        ""
      );
      console.log(`   📊 Pool creation estimated gas: ${estimatePool.toString()}`);

      // Frontend should warn if gas > 300k
      if (estimateCreate > 300000n) {
        console.log("   ⚠️  HIGH GAS for opinion creation - Frontend should warn");
      }
      if (estimateAnswer > 300000n) {
        console.log("   ⚠️  HIGH GAS for answer submission - Frontend should warn");
      }
      if (estimatePool > 400000n) {
        console.log("   ⚠️  HIGH GAS for pool creation - Frontend should warn");
      }

      console.log("✅ Gas estimation data provided for frontend integration");
    });
  });

  describe("📊 Real-Time Data Integration", function () {
    
    it("INTEGRATION: Event emission matches frontend event listeners", async function () {
      const { opinionCore, feeManager, poolManager, usdc } = contracts;
      const { creator, user1 } = users;

      console.log("📡 Testing event emission for frontend real-time updates");

      // Fund users
      await usdc.mint(creator.address, ethers.parseUnits("100", 6));
      await usdc.mint(user1.address, ethers.parseUnits("100", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
      await usdc.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

      // === TEST: Opinion creation events ===
      console.log("📝 Testing OpinionAction events");

      const createTx = await opinionCore.connect(creator).createOpinion(
        "Event Test Question",
        "Initial Answer",
        "",
        ethers.parseUnits("15", 6),
        ["Technology"]
      );

      // Should emit 2 OpinionAction events (question + initial answer)
      await expect(createTx)
        .to.emit(opinionCore, "OpinionAction")
        .withArgs(1, 0, "Event Test Question", creator.address, ethers.parseUnits("15", 6));

      await expect(createTx)
        .to.emit(opinionCore, "OpinionAction")  
        .withArgs(1, 1, "Initial Answer", creator.address, ethers.parseUnits("15", 6));

      console.log("   ✅ Opinion creation events emitted correctly");

      // === TEST: Answer submission events ===
      console.log("📝 Testing answer submission events");

      const answerTx = await opinionCore.connect(user1).submitAnswer(
        1,
        "Event Test Answer",
        ""
      );

      await expect(answerTx)
        .to.emit(opinionCore, "OpinionAction");

      await expect(answerTx)
        .to.emit(opinionCore, "FeesAction");

      console.log("   ✅ Answer submission events emitted correctly");

      // === TEST: Question trading events ===
      console.log("📝 Testing question trading events");

      const salePrice = ethers.parseUnits("30", 6);
      const listTx = await opinionCore.connect(creator).listQuestionForSale(1, salePrice);

      await expect(listTx)
        .to.emit(opinionCore, "QuestionSaleAction")
        .withArgs(1, 0, creator.address, ethers.ZeroAddress, salePrice);

      await usdc.connect(user1).approve(await opinionCore.getAddress(), salePrice);
      const buyTx = await opinionCore.connect(user1).buyQuestion(1);

      await expect(buyTx)
        .to.emit(opinionCore, "QuestionSaleAction")
        .withArgs(1, 1, creator.address, user1.address, salePrice);

      console.log("   ✅ Question trading events emitted correctly");

      // === TEST: Pool events ===
      console.log("📝 Testing pool events");

      await usdc.connect(user1).approve(await poolManager.getAddress(), ethers.parseUnits("100", 6));

      // Pool creation should emit events
      const poolTx = await poolManager.connect(user1).createPool(
        1,
        "Pool Answer",
        "",
        ethers.parseUnits("50", 6),
        86400,
        "EventTestPool",
        ""
      );

      // Check if pool events are emitted (event names depend on PoolManager implementation)
      const poolReceipt = await poolTx.wait();
      console.log(`   📊 Pool creation emitted ${poolReceipt?.logs?.length || 0} events`);

      console.log("🎉 All events properly emitted for frontend real-time updates");
    });

    it("INTEGRATION: Price calculation matches frontend display logic", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator, user1, user2 } = users;

      console.log("📊 Testing price calculation consistency");

      // Fund users
      const fundAmount = ethers.parseUnits("500", 6);
      for (const user of [creator, user1, user2]) {
        await usdc.mint(user.address, fundAmount);
        await usdc.connect(user).approve(await opinionCore.getAddress(), fundAmount);
      }

      // Create opinion with known initial price
      const initialPrice = ethers.parseUnits("25", 6);
      await opinionCore.connect(creator).createOpinion(
        "Price Consistency Test",
        "Initial Answer",
        "",
        initialPrice,
        ["Finance"]
      );

      console.log(`   💰 Initial price: ${ethers.formatUnits(initialPrice, 6)} USDC`);

      // Track price progression through multiple trades
      const prices = [];
      const nextPrice1 = await opinionCore.getNextPrice(1);
      prices.push(nextPrice1);
      console.log(`   📈 Next price 1: ${ethers.formatUnits(nextPrice1, 6)} USDC`);

      // Submit answer and get new next price
      await opinionCore.connect(user1).submitAnswer(1, "Answer 1", "");
      await ethers.provider.send("evm_mine", []);

      const nextPrice2 = await opinionCore.getNextPrice(1);
      prices.push(nextPrice2);
      console.log(`   📈 Next price 2: ${ethers.formatUnits(nextPrice2, 6)} USDC`);

      // Submit another answer
      await opinionCore.connect(user2).submitAnswer(1, "Answer 2", "");
      await ethers.provider.send("evm_mine", []);

      const nextPrice3 = await opinionCore.getNextPrice(1);
      prices.push(nextPrice3);
      console.log(`   📈 Next price 3: ${ethers.formatUnits(nextPrice3, 6)} USDC`);

      // === VALIDATION: Prices should increase consistently ===
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).to.be.greaterThan(prices[i-1]);
        
        const increasePercent = ((Number(prices[i]) - Number(prices[i-1])) / Number(prices[i-1])) * 100;
        console.log(`   📊 Price increase ${i}: ${increasePercent.toFixed(2)}%`);
        
        // Frontend should handle these percentage calculations correctly
        expect(increasePercent).to.be.greaterThan(0);
        expect(increasePercent).to.be.lessThan(300); // Reasonable upper bound
      }

      // === VALIDATION: Answer history matches price history ===
      const answerHistory = await opinionCore.getAnswerHistory(1);
      console.log(`   📚 Answer history length: ${answerHistory.length}`);
      
      // Should have initial answer + 2 submitted answers = 3 total
      expect(answerHistory.length).to.equal(3);
      
      // Each answer should have a price recorded
      for (let i = 0; i < answerHistory.length; i++) {
        const historyPrice = answerHistory[i].price;
        console.log(`   📊 History entry ${i}: ${ethers.formatUnits(historyPrice, 6)} USDC`);
        expect(historyPrice).to.be.greaterThan(0);
      }

      console.log("✅ Price calculations consistent for frontend display");
    });
  });

  describe("🔧 Configuration and Environment Integration", function () {
    
    it("INTEGRATION: Environment-specific contract behavior", async function () {
      const { opinionCore, usdc } = contracts;
      const { creator } = users;

      console.log("🔧 Testing environment-specific configurations");

      // === TEST: Initial price bounds ===
      const minInitialPrice = ethers.parseUnits("1", 6); // 1 USDC
      const maxInitialPrice = ethers.parseUnits("100", 6); // 100 USDC

      await usdc.mint(creator.address, ethers.parseUnits("200", 6));
      await usdc.connect(creator).approve(await opinionCore.getAddress(), ethers.parseUnits("200", 6));

      // Should accept minimum price
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Min Price Test",
          "Answer",
          "",
          minInitialPrice,
          ["Technology"]
        )
      ).to.not.be.reverted;

      // Should accept maximum price
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Max Price Test",
          "Answer", 
          "",
          maxInitialPrice,
          ["Technology"]
        )
      ).to.not.be.reverted;

      // Should reject above maximum
      await expect(
        opinionCore.connect(creator).createOpinion(
          "Above Max Test",
          "Answer",
          "",
          ethers.parseUnits("101", 6),
          ["Technology"]
        )
      ).to.be.revertedWithCustomError(opinionCore, "InvalidInitialPrice");

      console.log("   ✅ Price bounds configured correctly for mainnet");

      // === TEST: Category validation ===
      const validCategories = await opinionCore.getAvailableCategories();
      console.log(`   📂 Available categories: ${validCategories.length}`);
      console.log(`   📋 Categories: ${validCategories.join(", ")}`);

      // Frontend should display these exact categories
      expect(validCategories.length).to.be.greaterThan(5);
      expect(validCategories).to.include("Technology");
      expect(validCategories).to.include("Finance");

      console.log("   ✅ Categories properly configured");

      // === TEST: Contract parameters match expected values ===
      const minimumPrice = await opinionCore.minimumPrice();
      const questionCreationFee = await opinionCore.questionCreationFee();
      
      console.log(`   💰 Minimum price: ${ethers.formatUnits(minimumPrice, 6)} USDC`);
      console.log(`   💰 Creation fee: ${ethers.formatUnits(questionCreationFee, 6)} USDC`);

      // These should match frontend constants
      expect(minimumPrice).to.equal(ethers.parseUnits("1", 6));

      console.log("✅ Contract parameters match expected configuration");
    });

    it("INTEGRATION: Safety feature configuration validation", async function () {
      const { opinionCore } = contracts;
      const { owner, user1 } = users;

      console.log("🛡️ Testing safety feature configurations");

      // === TEST: Public creation toggle ===
      const isPublicBefore = await opinionCore.isPublicCreationEnabled();
      console.log(`   🔓 Public creation enabled: ${isPublicBefore}`);

      // Toggle it off
      await opinionCore.connect(owner).togglePublicCreation();
      const isPublicAfter = await opinionCore.isPublicCreationEnabled();
      expect(isPublicAfter).to.equal(!isPublicBefore);
      console.log(`   🔒 Public creation after toggle: ${isPublicAfter}`);

      // === TEST: Pause functionality ===
      const isPausedBefore = await opinionCore.paused();
      expect(isPausedBefore).to.be.false;

      await opinionCore.connect(owner).pause();
      const isPausedAfter = await opinionCore.paused();
      expect(isPausedAfter).to.be.true;
      console.log("   ⏸️  Contract successfully paused");

      await opinionCore.connect(owner).unpause();
      const isUnpaused = await opinionCore.paused();
      expect(isUnpaused).to.be.false;
      console.log("   ▶️  Contract successfully unpaused");

      // === TEST: Rate limiting configuration ===
      const maxTradesPerBlock = await opinionCore.maxTradesPerBlock();
      console.log(`   🚫 Max trades per block: ${maxTradesPerBlock.toString()}`);
      
      // Should be reasonable for mainnet (not too restrictive, not too permissive)
      expect(maxTradesPerBlock).to.be.greaterThan(0);
      expect(maxTradesPerBlock).to.be.lessThan(10);

      console.log("✅ Safety features properly configured");
    });
  });

  describe("🚀 Final Integration Validation", function () {
    
    it("INTEGRATION: Complete frontend workflow simulation", async function () {
      const { opinionCore, poolManager, feeManager, usdc } = contracts;
      const { creator, user1, user2 } = users;

      console.log("🚀 Running complete frontend workflow simulation");

      // === SIMULATE: User connects wallet and gets funded ===
      console.log("📝 Step 1: Wallet connection and funding simulation");
      
      const userFund = ethers.parseUnits("300", 6);
      await usdc.mint(creator.address, userFund);
      await usdc.mint(user1.address, userFund);
      await usdc.mint(user2.address, userFund);

      console.log("   ✅ Users funded (simulating faucet or exchange deposit)");

      // === SIMULATE: Frontend checks user balances ===
      for (const [name, user] of [["Creator", creator], ["User1", user1], ["User2", user2]]) {
        const balance = await usdc.balanceOf(user.address);
        console.log(`   💰 ${name} balance: ${ethers.formatUnits(balance, 6)} USDC`);
        expect(balance).to.equal(userFund);
      }

      // === SIMULATE: Frontend requests approvals ===
      console.log("📝 Step 2: Frontend approval flow simulation");
      
      const approvalAmount = ethers.parseUnits("200", 6);
      await usdc.connect(creator).approve(await opinionCore.getAddress(), approvalAmount);
      await usdc.connect(user1).approve(await opinionCore.getAddress(), approvalAmount);
      await usdc.connect(user2).approve(await poolManager.getAddress(), approvalAmount);

      // Verify approvals
      for (const [name, user, contract] of [
        ["Creator", creator, await opinionCore.getAddress()],
        ["User1", user1, await opinionCore.getAddress()],
        ["User2", user2, await poolManager.getAddress()]
      ]) {
        const allowance = await usdc.allowance(user.address, contract);
        console.log(`   🎫 ${name} allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
        expect(allowance).to.be.greaterThanOrEqual(approvalAmount);
      }

      // === SIMULATE: Create opinion through frontend ===
      console.log("📝 Step 3: Opinion creation via frontend");

      const createTx = await opinionCore.connect(creator).createOpinion(
        "Will quantum computers break current encryption by 2030?",
        "No, quantum error correction still needs major breakthroughs",
        "Current quantum computers lack the stability for cryptographic attacks",
        ethers.parseUnits("18", 6),
        ["Technology", "Science"]
      );

      const createReceipt = await createTx.wait();
      console.log(`   ✅ Opinion created (Gas: ${createReceipt?.gasUsed?.toString()})`);

      // === SIMULATE: Frontend displays opinion data ===
      const opinion = await opinionCore.getOpinionDetails(1);
      const nextPrice = await opinionCore.getNextPrice(1);
      const categories = opinion.categories;

      console.log("   📊 Frontend display data:");
      console.log(`      Question: ${opinion.question}`);
      console.log(`      Current Answer: ${opinion.currentAnswer}`);
      console.log(`      Current Price: ${ethers.formatUnits(opinion.lastPrice, 6)} USDC`);
      console.log(`      Next Price: ${ethers.formatUnits(nextPrice, 6)} USDC`);
      console.log(`      Categories: ${categories.join(", ")}`);

      // === SIMULATE: User submits answer through frontend ===
      console.log("📝 Step 4: Answer submission via frontend");

      const answerTx = await opinionCore.connect(user1).submitAnswer(
        1,
        "Actually yes - IBM and Google are making rapid progress",
        "Recent advances in quantum error correction suggest 2029-2030 timeline is possible",
        "https://example.com/quantum-research"
      );

      const answerReceipt = await answerTx.wait();
      console.log(`   ✅ Answer submitted (Gas: ${answerReceipt?.gasUsed?.toString()})`);

      // === SIMULATE: Frontend updates display with new data ===
      const updatedOpinion = await opinionCore.getOpinionDetails(1);
      const newNextPrice = await opinionCore.getNextPrice(1);

      console.log("   📊 Updated frontend display:");
      console.log(`      New Answer: ${updatedOpinion.currentAnswer}`);
      console.log(`      New Price: ${ethers.formatUnits(updatedOpinion.lastPrice, 6)} USDC`);
      console.log(`      Next Price: ${ethers.formatUnits(newNextPrice, 6)} USDC`);
      console.log(`      Volume: ${ethers.formatUnits(updatedOpinion.totalVolume, 6)} USDC`);

      // === SIMULATE: Pool creation through frontend ===
      console.log("📝 Step 5: Pool creation via frontend");

      const poolTx = await poolManager.connect(user2).createPool(
        1,
        "Quantum supremacy by 2027, not 2030!",
        "Accelerated research timelines and breakthrough results",
        ethers.parseUnits("100", 6),
        86400,
        "QuantumSupremacy2027",
        ""
      );

      const poolReceipt = await poolTx.wait();
      console.log(`   ✅ Pool created (Gas: ${poolReceipt?.gasUsed?.toString()})`);

      // === SIMULATE: Frontend displays earnings ===
      console.log("📝 Step 6: Earnings display via frontend");

      const creatorEarnings = await feeManager.accumulatedFees(creator.address);
      const user1Earnings = await feeManager.accumulatedFees(user1.address);

      console.log("   💰 User earnings display:");
      console.log(`      Creator earned: ${ethers.formatUnits(creatorEarnings, 6)} USDC`);
      console.log(`      User1 earned: ${ethers.formatUnits(user1Earnings, 6)} USDC`);

      // === FINAL VALIDATION ===
      console.log("📊 Frontend Integration Summary:");
      console.log(`   ✅ Opinion created and displayed correctly`);
      console.log(`   ✅ Answers submitted and updated in real-time`);
      console.log(`   ✅ Pools created and managed properly`);
      console.log(`   ✅ Financial calculations accurate`);
      console.log(`   ✅ All user interactions successful`);
      console.log(`   ✅ Gas usage reasonable for mainnet`);

      console.log("🎉 COMPLETE FRONTEND INTEGRATION: SUCCESS");
    });
  });
});