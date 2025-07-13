/**
 * Analyze Your Actual Contract
 * Check what type of contract you have and if it's upgradeable
 */

import { ethers } from "hardhat";

async function main() {
    console.log("🔍 ANALYZING YOUR ACTUAL CONTRACT");
    console.log("=".repeat(50));
    
    const YOUR_CONTRACT = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    console.log(`Contract Address: ${YOUR_CONTRACT}`);
    
    // Try different contract types to see what it is
    console.log("\n📋 CONTRACT TYPE DETECTION");
    console.log("-".repeat(30));
    
    try {
        // Try as OpinionCore
        const opinionCore = await ethers.getContractAt("OpinionCore", YOUR_CONTRACT);
        const nextId = await opinionCore.nextOpinionId();
        console.log(`✅ OpinionCore detected - Next Opinion ID: ${nextId}`);
        
        // Check if it has competition functions (new)
        try {
            await opinionCore.getCompetitionStatus(1);
            console.log("✅ Has competition functions - Already fixed!");
        } catch (e) {
            console.log("❌ No competition functions - Needs upgrade");
        }
        
    } catch (e) {
        console.log("❌ Not OpinionCore format");
    }
    
    try {
        // Try as FixedOpinionMarket  
        const fixedMarket = await ethers.getContractAt("FixedOpinionMarket", YOUR_CONTRACT);
        const nextId = await fixedMarket.nextOpinionId();
        console.log(`✅ FixedOpinionMarket detected - Next Opinion ID: ${nextId}`);
        
    } catch (e) {
        console.log("❌ Not FixedOpinionMarket format");
    }
    
    try {
        // Try as OpinionMarket
        const market = await ethers.getContractAt("OpinionMarket", YOUR_CONTRACT);
        const nextId = await market.nextOpinionId();
        console.log(`✅ OpinionMarket detected - Next Opinion ID: ${nextId}`);
        
    } catch (e) {
        console.log("❌ Not OpinionMarket format");
    }
    
    // Check if it's a proxy (upgradeable)
    console.log("\n🔄 PROXY DETECTION");
    console.log("-".repeat(20));
    
    try {
        // Check for proxy storage slots
        const provider = ethers.provider;
        
        // EIP-1967 implementation slot
        const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implAddress = await provider.getStorage(YOUR_CONTRACT, implSlot);
        
        if (implAddress !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
            console.log(`✅ UPGRADEABLE PROXY detected`);
            console.log(`📍 Implementation: 0x${implAddress.slice(-40)}`);
        } else {
            console.log(`❌ NOT a proxy - Direct deployment`);
        }
        
    } catch (e) {
        console.log("❌ Could not check proxy status");
    }
    
    // Get basic contract info
    console.log("\n📊 CONTRACT INFO");
    console.log("-".repeat(20));
    
    try {
        const provider = ethers.provider;
        const code = await provider.getCode(YOUR_CONTRACT);
        const codeSize = (code.length - 2) / 2; // Remove 0x and convert to bytes
        console.log(`📏 Contract size: ${codeSize} bytes`);
        
        // Try to get some opinions
        try {
            const contract = await ethers.getContractAt("OpinionCore", YOUR_CONTRACT);
            const opinion1 = await contract.getOpinionDetails(1);
            console.log(`✅ Opinion #1 exists: "${opinion1.question}"`);
            console.log(`💰 Current price: $${Number(opinion1.lastPrice) / 1_000_000}`);
            console.log(`🔮 Next price: $${Number(opinion1.nextPrice) / 1_000_000}`);
            
            const priceChange = ((Number(opinion1.nextPrice) - Number(opinion1.lastPrice)) / Number(opinion1.lastPrice)) * 100;
            console.log(`📈 Price change: ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`);
            
            if (priceChange < 0) {
                console.log("🚨 PRICE DROP DETECTED - This is the problem we need to fix!");
            }
            
        } catch (e) {
            console.log("❌ Could not read opinion data");
        }
        
    } catch (e) {
        console.log("❌ Could not get contract info");
    }
    
    console.log("\n💡 CONCLUSION");
    console.log("-".repeat(15));
    console.log("Based on the analysis above:");
    console.log("1. If UPGRADEABLE PROXY: We can upgrade your existing contract");
    console.log("2. If DIRECT DEPLOYMENT: We need to deploy new and migrate");
    console.log("3. Check for price drops to confirm the problem exists");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Analysis failed:", error);
        process.exit(1);
    });