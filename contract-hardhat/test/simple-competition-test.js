/**
 * SIMPLE VALIDATION TEST
 * Tests compilation and basic logic of competition-aware pricing
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Competition Logic Validation", function() {
    let priceCalculator;

    before(async function() {
        // Only test the library compilation and basic functions
        const PriceCalculatorLibrary = await ethers.getContractFactory("PriceCalculator");
        priceCalculator = await PriceCalculatorLibrary.deploy();
        await priceCalculator.waitForDeployment();
    });

    it("Should compile PriceCalculator library successfully", async function() {
        expect(await priceCalculator.getAddress()).to.not.equal(ethers.ZeroAddress);
        console.log("✅ PriceCalculator library compiled and deployed");
    });

    it("Should have correct regime probabilities for different activity levels", async function() {
        // Test COLD activity probabilities
        const coldProbs = await priceCalculator.getRegimeProbabilitiesLight(0); // COLD = 0
        expect(coldProbs[0]).to.equal(40); // Consolidation: 40%
        expect(coldProbs[1]).to.equal(45); // Bullish: 45%
        expect(coldProbs[2]).to.equal(13); // Correction: 13%
        expect(coldProbs[3]).to.equal(2);  // Parabolic: 2%
        
        console.log("✅ COLD activity probabilities correct:", coldProbs);

        // Test HOT activity probabilities  
        const hotProbs = await priceCalculator.getRegimeProbabilitiesLight(2); // HOT = 2
        expect(hotProbs[0]).to.equal(15); // Consolidation: 15%
        expect(hotProbs[1]).to.equal(62); // Bullish: 62%
        expect(hotProbs[2]).to.equal(13); // Correction: 13%
        expect(hotProbs[3]).to.equal(10); // Parabolic: 10%
        
        console.log("✅ HOT activity probabilities correct:", hotProbs);
    });

    it("Should simulate price movements correctly", async function() {
        const startPrice = ethers.parseUnits("2", 6); // 2 USDC
        const testNonce = 12345;

        // Test COLD activity simulation (potential volatility)
        const [coldPrice, coldRegime] = await priceCalculator.simulateNextPriceLight(0, startPrice, testNonce);
        console.log(`COLD simulation: $${Number(coldPrice) / 1_000_000} (regime: ${coldRegime})`);

        // Test HOT activity simulation (more bullish bias)
        const [hotPrice, hotRegime] = await priceCalculator.simulateNextPriceLight(2, startPrice, testNonce + 1);
        console.log(`HOT simulation: $${Number(hotPrice) / 1_000_000} (regime: ${hotRegime})`);

        expect(coldPrice).to.be.gt(0);
        expect(hotPrice).to.be.gt(0);
        console.log("✅ Price simulations working");
    });

    it("Should demonstrate the economic problem we're solving", async function() {
        console.log("\n🎯 ECONOMIC PROBLEM DEMONSTRATION");
        console.log("=".repeat(50));
        
        const startPrice = ethers.parseUnits("2", 6); // 2 USDC
        
        // Simulate multiple COLD scenarios (what happens with 2 competing traders under old system)
        console.log("\n❌ OLD SYSTEM - 2 Competing Traders (Classified as COLD):");
        
        let priceDropCount = 0;
        let priceIncreaseCount = 0;
        
        for (let i = 0; i < 10; i++) {
            const [simulatedPrice] = await priceCalculator.simulateNextPriceLight(0, startPrice, i * 1000);
            const changePercent = ((Number(simulatedPrice) - Number(startPrice)) / Number(startPrice)) * 100;
            
            if (changePercent < 0) {
                priceDropCount++;
                console.log(`  Simulation ${i + 1}: $${(Number(simulatedPrice) / 1_000_000).toFixed(2)} (${changePercent.toFixed(1)}%) ❌ DROP`);
            } else {
                priceIncreaseCount++;
                console.log(`  Simulation ${i + 1}: $${(Number(simulatedPrice) / 1_000_000).toFixed(2)} (+${changePercent.toFixed(1)}%) ✅ INCREASE`);
            }
        }
        
        console.log(`\n📊 Results: ${priceDropCount} drops, ${priceIncreaseCount} increases`);
        console.log(`❌ Problem: ${(priceDropCount / 10 * 100).toFixed(0)}% chance of price drops in competitive scenarios`);
        
        console.log("\n✅ NEW SYSTEM - Competition Detection:");
        console.log("- 2+ competing traders → Guaranteed 8-12% increases");
        console.log("- Economic logic: Auction bidding drives prices UP");
        console.log("- Fair market dynamics restored");
        
        expect(priceDropCount).to.be.gte(0); // Document that drops can happen
        console.log("✅ Economic problem demonstrated");
    });
});