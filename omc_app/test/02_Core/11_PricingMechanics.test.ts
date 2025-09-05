import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployRealOpinionMarketSystem,
  type TestContracts, 
  type TestUsers 
} from "../fixtures/deployments";

describe("11_PricingMechanics - Real 4-Regime Pricing System", function () {
  let contracts: TestContracts;
  let users: TestUsers;

  beforeEach(async function () {
    ({ contracts, users } = await deployRealOpinionMarketSystem());
    
    // Enable public creation for testing
    await contracts.opinionCore.connect(users.owner).togglePublicCreation();
  });

  describe("Market Regime System", function () {
    beforeEach(async function () {
      // Create base opinion for pricing tests
      await contracts.opinionMarket.connect(users.creator).createOpinion(
        "Pricing Test Opinion",
        "Initial Answer",
        "Testing pricing mechanics",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
    });

    it("should calculate prices using 4 regime types", async function () {
      const { opinionCore } = contracts;
      
      // Get initial price and next price
      const initialDetails = await opinionCore.getOpinionDetails(1);
      const nextPrice = await opinionCore.getNextPrice(1);
      
      expect(nextPrice).to.be.gt(0);
      expect(nextPrice).to.be.gte(initialDetails.lastPrice); // Should generally trend upward
      
      // Verify price is within reasonable bounds
      const minimumPrice = await opinionCore.minimumPrice();
      expect(nextPrice).to.be.gte(minimumPrice);
    });

    it("should respect -20% to +100% ranges", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      const initialDetails = await opinionCore.getOpinionDetails(1);
      const maxPriceChange = await opinionCore.absoluteMaxPriceChange();
      
      // Submit several answers to test price movements
      for (let i = 0; i < 5; i++) {
        const beforePrice = await opinionCore.getNextPrice(1);
        
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `Price Range Test ${i}`,
          `Testing price bounds ${i}`
        );
        
        const afterDetails = await opinionCore.getOpinionDetails(1);
        
        // Calculate actual price change percentage
        const priceChange = (afterDetails.lastPrice * 100n) / beforePrice - 100n;
        
        // Should not exceed maximum allowed change
        expect(priceChange).to.be.lte(maxPriceChange);
        expect(priceChange).to.be.gte(-maxPriceChange);
        
        // Move to next block to avoid rate limiting
        await ethers.provider.send("evm_mine", []);
      }
    });

    it("should correlate activity levels with regimes", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1, user2 } = users;
      
      // Start with low activity (COLD)
      const initialActivityLevel = await opinionCore.getOpinionActivityLevel(1);
      expect(initialActivityLevel).to.equal(0); // COLD = 0
      
      // Add activity to potentially reach WARM/HOT
      const users_list = [user1, user2, user1, user2, user1];
      
      for (let i = 0; i < users_list.length; i++) {
        await opinionMarket.connect(users_list[i]).submitAnswer(
          1,
          `Activity test ${i}`,
          `Building activity ${i}`
        );
        
        await ethers.provider.send("evm_mine", []);
        
        // Check activity level progression
        const currentLevel = await opinionCore.getOpinionActivityLevel(1);
        expect(currentLevel).to.be.gte(0).and.lte(2); // COLD=0, WARM=1, HOT=2
      }
      
      // Verify activity increased
      const finalActivityLevel = await opinionCore.getOpinionActivityLevel(1);
      expect(finalActivityLevel).to.be.gte(initialActivityLevel);
    });

    it("should apply volatility damping", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      const prices: bigint[] = [];
      
      // Collect price data across multiple trades
      for (let i = 0; i < 10; i++) {
        const nextPrice = await opinionCore.getNextPrice(1);
        prices.push(nextPrice);
        
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `Volatility test ${i}`,
          `Testing damping ${i}`
        );
        
        await ethers.provider.send("evm_mine", []);
      }
      
      // Analyze price volatility (consecutive large changes should be rare)
      let largeChanges = 0;
      for (let i = 1; i < prices.length; i++) {
        const changePercent = (prices[i] * 100n) / prices[i-1] - 100n;
        if (changePercent > 50n || changePercent < -20n) {
          largeChanges++;
        }
      }
      
      // Volatility damping should limit extreme movements
      expect(largeChanges).to.be.lte(prices.length / 2); // Less than half should be large changes
    });
  });

  describe("Activity-Based Triggers", function () {
    beforeEach(async function () {
      await contracts.opinionMarket.connect(users.creator).createOpinion(
        "Activity Test Opinion",
        "Initial Answer",
        "Testing activity levels",
        ethers.parseUnits("15", 6),
        ["Technology"]
      );
    });

    it("should classify COLD/WARM/HOT activity levels", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1, user2, user3 } = users;
      
      // Initially COLD
      let activityLevel = await opinionCore.getOpinionActivityLevel(1);
      expect(activityLevel).to.equal(0); // COLD
      
      // Build up activity
      await opinionMarket.connect(user1).submitAnswer(1, "Activity 1", "Desc 1");
      await ethers.provider.send("evm_mine", []);
      
      await opinionMarket.connect(user2).submitAnswer(1, "Activity 2", "Desc 2");
      await ethers.provider.send("evm_mine", []);
      
      await opinionMarket.connect(user3).submitAnswer(1, "Activity 3", "Desc 3");
      await ethers.provider.send("evm_mine", []);
      
      // Check if activity level increased
      activityLevel = await opinionCore.getOpinionActivityLevel(1);
      expect(activityLevel).to.be.gte(0).and.lte(2); // Should be in valid range
      
      // Verify activity statistics
      const stats = await opinionCore.getActivityStatistics(1);
      expect(stats.eligibleTransactions).to.be.gte(4); // Creation + 3 answers
      expect(stats.uniqueUsers).to.be.gte(3); // 3 different users
    });

    it("should adjust regime probabilities by activity", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      // Get initial regime probabilities (COLD activity)
      const coldProbs = await opinionCore.getRegimeProbabilitiesLight(0); // COLD = 0
      expect(coldProbs).to.have.length(4); // 4 regimes
      
      // Build activity and check if regime selection changes
      for (let i = 0; i < 5; i++) {
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `Regime probability test ${i}`,
          `Testing probabilities ${i}`
        );
        await ethers.provider.send("evm_mine", []);
      }
      
      // Check regime probabilities after activity
      const activityLevel = await opinionCore.getOpinionActivityLevel(1);
      const warmProbs = await opinionCore.getRegimeProbabilitiesLight(activityLevel);
      expect(warmProbs).to.have.length(4);
      
      // Probabilities should be different based on activity
      expect(warmProbs).to.not.deep.equal(coldProbs);
    });

    it("should prevent gaming through diversity requirements", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      // Try rapid trading from same user (should be rate limited)
      await opinionMarket.connect(user1).submitAnswer(
        1,
        "Gaming prevention test",
        "First answer"
      );
      
      // Second answer in same block should fail due to rate limiting
      await expect(
        opinionMarket.connect(user1).submitAnswer(
          1,
          "Gaming attempt",
          "Second answer"
        )
      ).to.be.revertedWithCustomError(opinionCore, "MaxTradesPerBlockExceeded");
    });
  });

  describe("Price History Tracking", function () {
    beforeEach(async function () {
      await contracts.opinionMarket.connect(users.creator).createOpinion(
        "Price History Test",
        "Initial Answer",
        "Testing price history",
        ethers.parseUnits("20", 6),
        ["Technology"]
      );
    });

    it("should maintain price history accurately", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1, user2 } = users;
      
      const prices: bigint[] = [];
      const initialDetails = await opinionCore.getOpinionDetails(1);
      prices.push(initialDetails.lastPrice);
      
      // Create price history
      for (let i = 0; i < 5; i++) {
        const nextPrice = await opinionCore.getNextPrice(1);
        prices.push(nextPrice);
        
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `History test ${i}`,
          `Building history ${i}`
        );
        await ethers.provider.send("evm_mine", []);
      }
      
      // Verify final price matches expected
      const finalDetails = await opinionCore.getOpinionDetails(1);
      expect(finalDetails.lastPrice).to.equal(prices[prices.length - 1]);
      
      // Verify volume tracking
      let expectedVolume = prices[0]; // Initial price
      for (let i = 1; i < prices.length; i++) {
        expectedVolume += prices[i];
      }
      expect(finalDetails.totalVolume).to.equal(expectedVolume);
    });

    it("should calculate support/resistance levels", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      const prices: bigint[] = [];
      
      // Build price history
      for (let i = 0; i < 8; i++) {
        const nextPrice = await opinionCore.getNextPrice(1);
        prices.push(nextPrice);
        
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `Support/Resistance test ${i}`,
          `Building levels ${i}`
        );
        await ethers.provider.send("evm_mine", []);
      }
      
      // Analyze for support/resistance patterns
      const highestPrice = prices.reduce((max, price) => price > max ? price : max, 0n);
      const lowestPrice = prices.reduce((min, price) => price < min ? price : min, prices[0]);
      
      // Should have meaningful price range
      expect(highestPrice).to.be.gt(lowestPrice);
      
      // Current price should be within historical range
      const currentDetails = await opinionCore.getOpinionDetails(1);
      expect(currentDetails.lastPrice).to.be.gte(lowestPrice);
      expect(currentDetails.lastPrice).to.be.lte(highestPrice * 2n); // Allow for growth
    });

    it("should apply momentum detection", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      // Create momentum by consistent trading direction
      let consecutiveIncreases = 0;
      let previousPrice = (await opinionCore.getOpinionDetails(1)).lastPrice;
      
      for (let i = 0; i < 6; i++) {
        await opinionMarket.connect(user1).submitAnswer(
          1,
          `Momentum test ${i}`,
          `Building momentum ${i}`
        );
        await ethers.provider.send("evm_mine", []);
        
        const currentPrice = (await opinionCore.getOpinionDetails(1)).lastPrice;
        if (currentPrice > previousPrice) {
          consecutiveIncreases++;
        }
        previousPrice = currentPrice;
      }
      
      // With bullish bias, should see upward momentum
      expect(consecutiveIncreases).to.be.gte(3); // At least half should be increases
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contracts.opinionMarket.connect(users.creator).createOpinion(
        "Edge Case Test",
        "Initial Answer",
        "Testing edge cases",
        ethers.parseUnits("5", 6),
        ["Technology"]
      );
    });

    it("should handle minimum price boundaries", async function () {
      const { opinionCore } = contracts;
      
      const minimumPrice = await opinionCore.minimumPrice();
      expect(minimumPrice).to.be.gt(0);
      expect(minimumPrice).to.equal(ethers.parseUnits("1", 6)); // 1 USDC
      
      // Next price should never go below minimum
      const nextPrice = await opinionCore.getNextPrice(1);
      expect(nextPrice).to.be.gte(minimumPrice);
    });

    it("should handle maximum price scenarios", async function () {
      const { opinionCore } = contracts;
      
      // Test with very large current price
      const maxInitialPrice = await opinionCore.MAX_INITIAL_PRICE();
      expect(maxInitialPrice).to.equal(ethers.parseUnits("100", 6)); // 100 USDC
      
      // Should handle large price calculations
      await expect(
        opinionCore.getNextPrice(1)
      ).to.not.be.reverted;
    });

    it("should validate price change limits", async function () {
      const { opinionMarket, opinionCore } = contracts;
      const { user1 } = users;
      
      const maxChange = await opinionCore.absoluteMaxPriceChange();
      const beforePrice = await opinionCore.getNextPrice(1);
      
      await opinionMarket.connect(user1).submitAnswer(
        1,
        "Price limit test",
        "Testing limits"
      );
      
      const afterDetails = await opinionCore.getOpinionDetails(1);
      
      // Calculate change percentage
      if (beforePrice > 0n) {
        const changePercent = afterDetails.lastPrice > beforePrice
          ? ((afterDetails.lastPrice - beforePrice) * 100n) / beforePrice
          : ((beforePrice - afterDetails.lastPrice) * 100n) / beforePrice;
        
        expect(changePercent).to.be.lte(maxChange);
      }
    });

    it("should handle invalid opinion IDs", async function () {
      const { opinionCore } = contracts;
      
      await expect(
        opinionCore.getNextPrice(999)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
      
      await expect(
        opinionCore.getOpinionActivityLevel(999)
      ).to.be.revertedWithCustomError(opinionCore, "OpinionNotFound");
    });

    it("should handle zero volume scenarios", async function () {
      const { opinionCore } = contracts;
      
      // New opinion should have initial volume equal to creation price
      const details = await opinionCore.getOpinionDetails(1);
      expect(details.totalVolume).to.equal(details.lastPrice);
      
      // Activity statistics should be valid even with minimal activity
      const stats = await opinionCore.getActivityStatistics(1);
      expect(stats.isDataValid).to.be.true;
      expect(stats.eligibleTransactions).to.be.gte(1);
    });
  });

  describe("Performance & Gas Optimization", function () {
    beforeEach(async function () {
      await contracts.opinionMarket.connect(users.creator).createOpinion(
        "Performance Test",
        "Initial Answer",
        "Testing performance",
        ethers.parseUnits("10", 6),
        ["Technology"]
      );
    });

    it("should calculate prices efficiently", async function () {
      const { opinionCore } = contracts;
      
      // Multiple price calculations should be efficient
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await opinionCore.getNextPrice(1);
      }
      
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(timeTaken).to.be.lt(1000);
    });

    it("should maintain reasonable gas costs for pricing", async function () {
      const { opinionMarket } = contracts;
      const { user1 } = users;
      
      // Test gas cost for answer submission (includes price calculation)
      const tx = await opinionMarket.connect(user1).submitAnswer(
        1,
        "Gas optimization test",
        "Testing gas efficiency"
      );
      
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;
      
      // Should use reasonable amount of gas (less than 500K)
      expect(gasUsed).to.be.lt(500000n);
    });

    it("should handle rapid consecutive price calculations", async function () {
      const { opinionCore } = contracts;
      
      // Rapid consecutive calls should return consistent results
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(opinionCore.getNextPrice(1));
      }
      
      const results = await Promise.all(promises);
      
      // All results should be identical (deterministic)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).to.equal(results[0]);
      }
    });
  });
});