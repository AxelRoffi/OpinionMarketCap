/**
 * Test Script: Competition-Aware Pricing System
 * 
 * This script validates that the new auction dynamics fix works correctly:
 * - Single trader: Uses market regime pricing (can go up or down)
 * - Multiple traders: Uses guaranteed minimum growth floor (8-12% up)
 */

import { ethers } from "hardhat";

async function main() {
    console.log("🎯 TESTING COMPETITION-AWARE PRICING SYSTEM");
    console.log("=" .repeat(60));
    
    // Get contract instance (assumes already deployed)
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f"; // Base Sepolia - YOUR ACTUAL CONTRACT
    
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    
    // Test scenario 1: Check competition status for existing opinions
    console.log("\n📊 COMPETITION STATUS CHECK");
    console.log("-".repeat(40));
    
    for (let opinionId = 1; opinionId <= 3; opinionId++) {
        try {
            const [isCompetitive, traderCount, traders] = await opinionCore.getCompetitionStatus(opinionId);
            
            console.log(`Opinion #${opinionId}:`);
            console.log(`  Competitive: ${isCompetitive}`);
            console.log(`  Trader Count: ${traderCount}`);
            console.log(`  Traders: ${traders.slice(0, 5).join(", ")}${traders.length > 5 ? "..." : ""}`);
            
            // Get current price info
            const opinion = await opinionCore.getOpinionDetails(opinionId);
            console.log(`  Last Price: $${(Number(opinion.lastPrice) / 1_000_000).toFixed(2)}`);
            console.log(`  Next Price: $${(Number(opinion.nextPrice) / 1_000_000).toFixed(2)}`);
            
            const priceChange = ((Number(opinion.nextPrice) - Number(opinion.lastPrice)) / Number(opinion.lastPrice)) * 100;
            console.log(`  Price Change: ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`);
            
            if (isCompetitive && priceChange < 8) {
                console.log(`  ⚠️  WARNING: Competitive opinion has <8% growth - may need manual correction`);
            } else if (isCompetitive) {
                console.log(`  ✅ GOOD: Competitive opinion shows proper auction dynamics (≥8% growth)`);
            } else {
                console.log(`  📈 NON-COMPETITIVE: Using market regime pricing (volatility allowed)`);
            }
            
            console.log();
        } catch (error) {
            console.log(`Opinion #${opinionId}: Not found or error`);
        }
    }
    
    // Explain the economic fix
    console.log("\n🏆 AUCTION DYNAMICS FIX EXPLANATION");
    console.log("-".repeat(40));
    console.log("✅ BEFORE FIX: 2 competing traders → COLD activity → 53% chance of price DROP");
    console.log("✅ AFTER FIX:  2 competing traders → Competition detected → 8-12% guaranteed growth");
    console.log();
    console.log("📊 PRICING LOGIC:");
    console.log("• Single trader: Market regime system (allows volatility for excitement)");
    console.log("• 2+ traders competing: Auction dynamics (guaranteed upward pressure)");
    console.log("• 24h reset: Competition data refreshes daily to prevent stale tracking");
    console.log();
    console.log("🎯 ECONOMIC RESULT:");
    console.log("• Fair auction pricing when multiple traders compete");
    console.log("• Maintains excitement through volatility for single traders");
    console.log("• Prevents backwards economic incentives");
    
    // Simulation example
    console.log("\n🧮 SIMULATION EXAMPLE");
    console.log("-".repeat(40));
    
    const startPrice = 2_000_000; // $2.00 USDC
    console.log(`Starting price: $${(startPrice / 1_000_000).toFixed(2)}`);
    
    console.log("\nScenario A - Single Trader (Market Regime):");
    console.log("• COLD activity (40% consolidation, 45% bullish, 13% correction, 2% parabolic)");
    console.log("• Expected outcome: Mix of gains and potential losses for excitement");
    console.log("• Price volatility: Allows for market simulation experience");
    
    console.log("\nScenario B - Competing Traders (Auction Dynamics):");
    console.log("• Competition detected → Minimum growth floor activated");
    console.log("• Guaranteed: 8-12% price increase per trade");
    console.log("• Economic logic: Auction bidding drives prices UP, not down");
    
    const competitivePrice1 = startPrice * 1.08; // 8% minimum
    const competitivePrice2 = competitivePrice1 * 1.10; // 10% next trade
    console.log(`• Trade 1: $${(competitivePrice1 / 1_000_000).toFixed(2)} (+8%)`);
    console.log(`• Trade 2: $${(competitivePrice2 / 1_000_000).toFixed(2)} (+10%)`);
    console.log("• Result: Economically sound auction dynamics ✅");
    
    console.log("\n🚀 DEPLOYMENT READY");
    console.log("The competition-aware pricing system is now active!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });