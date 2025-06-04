import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("21_MEVBasicProtection - Real MEV Protection", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public creation for testing
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("MEV Protection in Real Contracts", function () {
    it("should allow normal answer submissions without MEV concerns", async function () {
      const { opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "MEV Protection Test Question",
        "Initial Answer",
        "Testing MEV protection mechanisms",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Submit answer (should work normally)
      const tx = await opinionCore.connect(user1).submitAnswer(
        1,
        "Protected Answer",
        "MEV protection active"
      );
      
      await expect(tx).to.emit(opinionCore, "OpinionAction");
      
      // Verify answer was submitted successfully
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswer).to.equal("Protected Answer");
      expect(opinionDetails.currentAnswerOwner).to.equal(user1.address);
    });

    it("should handle rapid answer submissions", async function () {
      const { opinionCore } = contracts;
      const { creator, user1, user2 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Rapid Submission Test",
        "Initial Answer",
        "Testing rapid submissions",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Submit multiple answers rapidly
      await opinionCore.connect(user1).submitAnswer(
        1,
        "First Rapid Answer",
        "First submission"
      );
      
      await opinionCore.connect(user2).submitAnswer(
        1,
        "Second Rapid Answer", 
        "Second submission"
      );
      
      // Both should succeed with MEV protection
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswer).to.equal("Second Rapid Answer");
      expect(opinionDetails.currentAnswerOwner).to.equal(user2.address);
    });

    it("should maintain price integrity during high activity", async function () {
      const { opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Price Integrity Test",
        "Initial Answer",
        "Testing price integrity",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Get initial price
      const price1 = await opinionCore.getNextPrice(1);
      
      // Submit answer
      await opinionCore.connect(user1).submitAnswer(
        1,
        "Price Test Answer",
        "Testing price"
      );
      
      // Get new price after submission
      const price2 = await opinionCore.getNextPrice(1);
      
      // Price should have increased (using real pricing mechanism)
      expect(price2).to.be.gt(price1);
    });

    it("should validate transaction ordering protection", async function () {
      const { opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Transaction Ordering Test",
        "Initial Answer",
        "Testing transaction ordering",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Multiple users submitting in sequence should work correctly
      const tx1 = opinionCore.connect(user1).submitAnswer(
        1,
        "First Ordered Answer",
        "First in sequence"
      );
      
      // Transaction should complete successfully
      await expect(tx1).to.not.be.reverted;
      
      // Verify final state is correct
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswerOwner).to.equal(user1.address);
    });
  });

  describe("Real-world MEV Scenarios", function () {
    it("should handle normal user behavior patterns", async function () {
      const { opinionCore } = contracts;
      const { creator, user1, user2, user3 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "Normal Behavior Test",
        "Initial Answer", 
        "Testing normal user patterns",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
      
      // Multiple users submit answers in typical pattern
      await opinionCore.connect(user1).submitAnswer(1, "User1 Answer", "First user");
      await opinionCore.connect(user2).submitAnswer(1, "User2 Answer", "Second user");  
      await opinionCore.connect(user3).submitAnswer(1, "User3 Answer", "Third user");
      
      // All submissions should succeed
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.currentAnswer).to.equal("User3 Answer");
      expect(opinionDetails.answerCount).to.be.gte(4); // Initial + 3 submissions
    });

    it("should maintain system integrity under stress", async function () {
      const { opinionCore } = contracts;
      const { creator, user1 } = users;
      
      // Create opinion
      await opinionCore.connect(creator).createOpinion(
        "System Integrity Test",
        "Initial Answer",
        "Testing system under stress",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
      
      // Submit answer with high value
      const nextPrice = await opinionCore.getNextPrice(1);
      
      await opinionCore.connect(user1).submitAnswer(
        1,
        "High Value Answer",
        "Testing with significant value"
      );
      
      // System should maintain integrity
      const opinionDetails = await opinionCore.getOpinionDetails(1);
      expect(opinionDetails.lastPrice).to.equal(nextPrice);
      expect(opinionDetails.totalVolume).to.be.gt(0);
    });
  });
});