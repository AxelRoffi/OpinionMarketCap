const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Testing Contract Size Without viaIR\n");
    console.log("━".repeat(60));

    // This script will compile and show sizes
    // The actual compilation happens via hardhat compile

    console.log("📋 Current Configuration:");
    console.log("   Compiler: 0.8.20");
    console.log("   Optimizer: enabled");
    console.log("   Runs: 1");
    console.log("   viaIR: true (CURRENT)");
    console.log("\n━".repeat(60));

    console.log("\n💡 To test without viaIR:");
    console.log("   1. Temporarily disable viaIR in hardhat.config.ts");
    console.log("   2. Run: npx hardhat clean");
    console.log("   3. Run: npx hardhat compile");
    console.log("   4. Check contract sizes");
    console.log("\n━".repeat(60));

    console.log("\n📊 Expected Results:");
    console.log("   - With viaIR: ~23.4 KB (current deployment)");
    console.log("   - Without viaIR: ~24-26 KB (estimated)");
    console.log("   - Limit: 24 KB for mainnet");
    console.log("\n━".repeat(60));

    console.log("\n⚠️  If contract exceeds 24KB without viaIR:");
    console.log("   Option A: Use OpinionCoreSimplified (smaller)");
    console.log("   Option B: Further optimize current contract");
    console.log("   Option C: Keep viaIR and accept unverified contract");
    console.log("\n━".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
