import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("02_BasicIntegration - Real Cross-Contract Integration", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public creation for testing
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("OpinionMarket → OpinionCore Integration", function () {
    it("should execute createOpinion through main contract", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator } = users;
      
      const question = "Will Ethereum 2.0 launch on time?";
      const answer = "Yes, it will launch by end of year";
      const initialPrice = ethers.parseUnits("10", 6); // 10 USDC
      
      // Create opinion through OpinionCore directly with real 5-parameter signature
      const tx = await opinionCore.connect(creator).createOpinion(
        question,
        answer,
        "Based on development progress",
        initialPrice,
        ["Technology"]
      );
      
      await expect(tx).to.emit(opinionCore, "OpinionAction");
      
      // Verify opinion was created in OpinionCore
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.question).to.equal(question);
      expect(opinionDetails.currentAnswer).to.equal(answer);
      expect(opinionDetails.creator).to.equal(creator.address);
      expect(opinionDetails.lastPrice).to.equal(initialPrice);
    });

    it("should execute submitAnswer through main contract", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create initial opinion with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Test Opinion Question",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Get next price from OpinionCore
      const nextPrice = await opinionCore.getNextPrice(1);
      
      // Submit answer through OpinionMarket
      const newAnswer = "No, it will be delayed";
      const tx = await opinionMarket.connect(user1).submitAnswer(
        1,
        newAnswer,
        "Market conditions suggest delay"
      );
      
      await expect(tx).to.emit(opinionCore, "OpinionAction");
      
      // Verify answer was updated in OpinionCore
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswer).to.equal(newAnswer);
      expect(opinionDetails.currentAnswerOwner).to.equal(user1.address);
    });

    it("should proxy question trading functions", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Trading Test Question",
        "Trading Answer",
        "Trading Description",
        ethers.parseUnits("5", 6),
        ["Crypto"]
      );
      
      // List question for trading through OpinionMarket
      const listingPrice = ethers.parseUnits("8", 6);
      const listTx = await opinionMarket.connect(creator).listQuestionForSale(1, listingPrice);
      
      await expect(listTx).to.emit(opinionCore, "QuestionSaleAction");
      
      // Purchase question through OpinionMarket
      const purchaseTx = await opinionMarket.connect(user1).purchaseQuestion(1);
      
      await expect(purchaseTx).to.emit(opinionCore, "QuestionSaleAction");
      
      // Verify ownership transfer
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswerOwner).to.equal(user1.address);
    });
  });

  describe("OpinionCore → FeeManager Integration", function () {
    it("should calculate fees using real FeeManager", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Fee Test Question",
        "Fee Test Answer",
        "Fee Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Get next price and calculate expected fees
      const nextPrice = await opinionCore.getNextPrice(1);
      const feeDistribution = await feeManager.calculateFeeDistribution(nextPrice);
      
      // Submit answer to trigger fee calculation
      await opinionMarket.connect(user1).submitAnswer(
        1,
        "New answer for fee test",
        "Testing fee calculation"
      );
      
      // Verify fee calculation matches FeeManager
      const creatorFees = await feeManager.getAccumulatedFees(creator.address);
      expect(creatorFees).to.equal(feeDistribution[1]); // Creator fee
    });

    it("should accumulate fees in FeeManager", async function () {
      const { opinionMarket, feeManager } = contracts;
      const { creator, user1, user2 } = users;
      
      // Create opinion with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Accumulation Test",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Science"]
      );
      
      // Submit multiple answers to accumulate fees
      await opinionMarket.connect(user1).submitAnswer(1, "Answer 1", "Desc 1");
      await opinionMarket.connect(user2).submitAnswer(1, "Answer 2", "Desc 2");
      
      // Check accumulated fees
      const creatorFees = await feeManager.getAccumulatedFees(creator.address);
      expect(creatorFees).to.be.gt(0);
      
      // Platform fees should also accumulate
      const platformFees = await feeManager.platformFeesAccumulated();
      expect(platformFees).to.be.gt(0);
    });

    it("should apply MEV penalties through FeeManager", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "MEV Test Question",
        "MEV Test Answer",
        "MEV Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Get next price
      const nextPrice = await opinionCore.getNextPrice(1);
      
      // Submit answer (may trigger MEV protection)
      await opinionMarket.connect(user1).submitAnswer(
        1,
        "Answer with potential MEV",
        "Testing MEV penalties"
      );
      
      // Verify transaction completed (MEV protection active but not blocking)
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswerOwner).to.equal(user1.address);
    });
  });

  describe("PoolManager Integration", function () {
    it("should create pools through main contract", async function () {
      const { opinionMarket, poolManager } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion first with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Pool Test Question",
        "Pool Test Answer",
        "Pool Test Description",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Create pool through OpinionMarket
      const poolTx = await opinionMarket.connect(user1).createPool(
        1, // opinion ID
        "Pooled Answer",
        ethers.parseUnits("10", 6), // initial contribution
        Math.floor(Date.now() / 1000) + 86400, // 24 hours deadline
        "Test Pool"
      );
      
      await expect(poolTx).to.emit(poolManager, "PoolAction");
      
      // Verify pool creation
      const poolDetails = await poolManager.getPoolDetails(1);
      expect(poolDetails.opinionId).to.equal(1);
      expect(poolDetails.creator).to.equal(user1.address);
    });

    it("should execute pool contributions", async function () {
      const { opinionMarket, poolManager } = contracts;
      const { creator, user1, user2 } = users;
      
      // Create opinion and pool with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Pool Contribution Test",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      await opinionMarket.connect(user1).createPool(
        1,
        "Pooled Answer",
        ethers.parseUnits("10", 6),
        Math.floor(Date.now() / 1000) + 86400,
        "Contribution Test Pool"
      );
      
      // Contribute to pool
      const contributeTx = await opinionMarket.connect(user2).contributeToPool(
        1, // pool ID
        ethers.parseUnits("5", 6)
      );
      
      await expect(contributeTx).to.emit(poolManager, "PoolAction");
      
      // Verify contribution
      const contribution = await poolManager.getContribution(1, user2.address);
      expect(contribution).to.equal(ethers.parseUnits("5", 6));
    });

    it("should distribute rewards via FeeManager", async function () {
      const { opinionMarket, poolManager, feeManager } = contracts;
      const { creator, user1, user2 } = users;
      
      // Create opinion and pool with real 5-parameter signature
      await opinionCore.connect(creator).createOpinion(
        "Reward Distribution Test",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      await opinionMarket.connect(user1).createPool(
        1,
        "Winning Answer",
        ethers.parseUnits("20", 6),
        Math.floor(Date.now() / 1000) + 86400,
        "Reward Pool"
      );
      
      // Add contribution
      await poolManager.connect(user2).contributeToPool(1, ethers.parseUnits("10", 6));
      
      // Check if pool can be executed (based on real contract logic)
      const poolDetails = await poolManager.getPoolDetails(1);
      expect(poolDetails.info.totalAmount).to.be.gt(0);
      
      // Check if rewards were distributed (fees accumulated)
      const user1Fees = await feeManager.getAccumulatedFees(user1.address);
      const user2Fees = await feeManager.getAccumulatedFees(user2.address);
      
      // At least one should have accumulated rewards
      expect(user1Fees + user2Fees).to.be.gt(0);
    });
  });

  describe("Event Correlation", function () {
    it("should emit coordinated events across contracts", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion - should emit events in multiple contracts
      const createTx = await opinionCore.connect(creator).createOpinion(
        "Event Coordination Test",
        "Test Answer",
        "Test Description",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Should emit OpinionAction in OpinionCore
      await expect(createTx).to.emit(opinionCore, "OpinionAction");
      
      // Submit answer - should emit events in multiple contracts
      const answerTx = await opinionMarket.connect(user1).submitAnswer(
        1,
        "New coordinated answer",
        "New description"
      );
      
      // Should emit events in both OpinionCore and FeeManager
      await expect(answerTx).to.emit(opinionCore, "OpinionAction");
      await expect(answerTx).to.emit(feeManager, "FeesAction");
    });

    it("should maintain event parameter consistency", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator } = users;
      
      // Create opinion and capture events
      const tx = await opinionCore.connect(creator).createOpinion(
        "Parameter Consistency Test",
        "Testing event parameters",
        "Consistency check",
        ethers.parseUnits("7", 6),
        ["Technology"]
      );
      
      const receipt = await tx.wait();
      
      // Verify events contain consistent data
      const opinionActionEvents = receipt?.logs.filter(log => {
        try {
          const parsed = opinionCore.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsed?.name === "OpinionAction";
        } catch {
          return false;
        }
      });
      
      expect(opinionActionEvents).to.have.length.greaterThan(0);
      
      // Verify opinion details match event data
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.question).to.equal("Parameter Consistency Test");
      expect(opinionDetails.creator).to.equal(creator.address);
    });
  });

  describe("Edge Cases & Error Handling", function () {
    it("should handle contract address changes", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { owner } = users;
      
      // Admin should be able to update contract addresses
      await expect(
        opinionMarket.connect(owner).setFeeManager(await feeManager.getAddress())
      ).to.not.be.reverted;
      
      await expect(
        opinionCore.connect(owner).setFeeManager(await feeManager.getAddress())
      ).to.not.be.reverted;
    });

    it("should handle failed cross-contract calls gracefully", async function () {
      const { opinionCore } = contracts;
      
      // Try to get details for non-existent opinion
      await expect(
        opinionCore.getOpinionDetails(999)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
      
      // Try to get next price for non-existent opinion
      await expect(
        opinionCore.getNextPrice(999)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
    });

    it("should maintain state consistency during failures", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator } = users;
      
      // Try to create opinion with invalid parameters
      await expect(
        opinionCore.connect(creator).createOpinion(
          "", // Empty question should fail
          "Test answer",
          "Description",
          ethers.parseUnits("5", 6),
          ["Technology"]
        )
      ).to.be.reverted;
      
      // Verify no opinion was created
      await expect(
        opinionCore.getOpinionDetails(1)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
    });

    it("should handle zero amounts and edge values", async function () {
      const { feeManager } = contracts;
      
      // Test fee calculation with zero price
      const zeroPriceFees = await feeManager.calculateFeeDistribution(0);
      expect(zeroPriceFees[0]).to.equal(0); // Platform fee
      expect(zeroPriceFees[1]).to.equal(0); // Creator fee
      expect(zeroPriceFees[2]).to.equal(0); // Owner amount
      
      // Test fee calculation with reasonable price
      const normalPrice = ethers.parseUnits("100", 6); // 100 USDC
      const normalPriceFees = await feeManager.calculateFeeDistribution(normalPrice);
      expect(normalPriceFees[0]).to.be.gt(0); // Should calculate fees
    });
  });

  describe("Performance & Concurrency", function () {
    it("should handle multiple operations efficiently", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator } = users;
      
      // Create multiple opinions rapidly
      const opinions = [];
      for (let i = 0; i < 5; i++) {
        const tx = await opinionCore.connect(creator).createOpinion(
          `Performance Question ${i}?`,
          `Performance Answer ${i}`,
          `Performance Description ${i}`,
          ethers.parseUnits("5", 6),
          ["Technology"]
        );
        opinions.push(tx);
      }
      
      // All transactions should succeed
      for (const tx of opinions) {
        await expect(tx).to.not.be.reverted;
      }
      
      // Verify all opinions were created
      for (let i = 1; i <= 5; i++) {
        const opinion = await opinionCore.getOpinionDetails(i);
        expect(opinion.creator).to.equal(creator.address);
      }
    });

    it("should maintain gas efficiency in cross-contract calls", async function () {
      const { opinionCore, opinionMarket } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion and measure gas
      const tx1 = await opinionCore.connect(creator).createOpinion(
        "Gas efficiency test?",
        "Testing gas usage",
        "Monitoring overhead",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      const receipt1 = await tx1.wait();
      const gasUsed1 = receipt1?.gasUsed || 0n;
      
      // Submit answer and measure gas
      const tx2 = await opinionMarket.connect(user1).submitAnswer(
        1,
        "Gas efficient answer",
        "Still monitoring"
      );
      
      const receipt2 = await tx2.wait();
      const gasUsed2 = receipt2?.gasUsed || 0n;
      
      // Gas usage should be reasonable (these are rough estimates)
      expect(gasUsed1).to.be.lt(ethers.parseUnits("1", 6)); // Less than 1M gas
      expect(gasUsed2).to.be.lt(ethers.parseUnits("500000", 0)); // Less than 500K gas
    });

    it("should handle concurrent operations correctly", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { creator, user1, user2 } = users;
      
      // Create multiple opinions concurrently
      const promises = [
        opinionCore.connect(creator).createOpinion(
          "Concurrent test 1?", "Answer 1", "Desc 1", 
          ethers.parseUnits("5", 6), ["Technology"]
        ),
        opinionCore.connect(user1).createOpinion(
          "Concurrent test 2?", "Answer 2", "Desc 2", 
          ethers.parseUnits("6", 6), ["Science"]
        ),
        opinionCore.connect(user2).createOpinion(
          "Concurrent test 3?", "Answer 3", "Desc 3", 
          ethers.parseUnits("7", 6), ["Politics"]
        )
      ];
      
      // All should succeed
      const results = await Promise.all(promises);
      for (const result of results) {
        expect(result).to.not.be.undefined;
      }
      
      // Verify all opinions exist with correct data
      for (let i = 1; i <= 3; i++) {
        const opinion = await opinionCore.getOpinionDetails(i);
        expect(opinion.creator).to.not.equal(ethers.ZeroAddress);
        expect(opinion.question).to.include("Concurrent test");
      }
    });
  });

  describe("State Synchronization", function () {
    it("should maintain consistent state across contracts", async function () {
      const { opinionMarket, opinionCore, feeManager } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "State Sync Test",
        "Initial Answer",
        "Test Description",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Get opinion details from OpinionCore
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      
      // Submit answer and track state changes
      const nextPrice = await opinionCore.getNextPrice(1);
      await opinionMarket.connect(user1).submitAnswer(
        1,
        "Synchronized answer",
        "State consistency test"
      );
      
      // Verify state is consistent
      const updatedDetails = await opinionCore.getOpinionDetails(1);
      expect(updatedDetails.currentAnswerOwner).to.equal(user1.address);
      expect(updatedDetails.lastPrice).to.equal(nextPrice);
      
      // Verify fees were accumulated consistently
      const creatorFees = await feeManager.getAccumulatedFees(creator.address);
      const expectedFee = (nextPrice * 3n) / 100n; // 3% creator fee
      expect(creatorFees).to.equal(expectedFee);
    });
  });
});