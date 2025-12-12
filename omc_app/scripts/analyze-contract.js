const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Analyzing Deployed Contract...\n");

    const CONTRACT_ADDRESS = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";

    try {
        // Get the deployed bytecode
        const deployedCode = await ethers.provider.getCode(CONTRACT_ADDRESS);

        console.log("📋 Contract Analysis:");
        console.log("━".repeat(60));
        console.log(`Address: ${CONTRACT_ADDRESS}`);
        console.log(`Bytecode Size: ${deployedCode.length} bytes`);
        console.log(`Bytecode Hash: ${ethers.keccak256(deployedCode)}`);
        console.log("━".repeat(60));

        // Check if it's a proxy by looking for common proxy patterns
        const isERC1967Proxy = deployedCode.includes("360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc");
        const isMinimalProxy = deployedCode.startsWith("0x363d3d373d3d3d363d73");

        console.log("\n🔎 Proxy Detection:");
        console.log(`   ERC1967 Proxy Pattern: ${isERC1967Proxy ? "✅ Found" : "❌ Not Found"}`);
        console.log(`   Minimal Proxy Pattern: ${isMinimalProxy ? "✅ Found" : "❌ Not Found"}`);

        // Show first 200 bytes of bytecode
        console.log("\n📝 Bytecode Preview (first 200 bytes):");
        console.log(`   ${deployedCode.substring(0, 400)}...`);

        // Try to get the implementation from different slots
        console.log("\n🔍 Checking Common Proxy Slots:");
        console.log("━".repeat(60));

        // ERC1967 implementation slot
        const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implAddress = await ethers.provider.getStorage(CONTRACT_ADDRESS, implSlot);
        console.log(`ERC1967 Implementation Slot:`);
        console.log(`   ${implAddress}`);

        // ERC1967 admin slot
        const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
        const adminAddress = await ethers.provider.getStorage(CONTRACT_ADDRESS, adminSlot);
        console.log(`\nERC1967 Admin Slot:`);
        console.log(`   ${adminAddress}`);

        // ERC1967 beacon slot
        const beaconSlot = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";
        const beaconAddress = await ethers.provider.getStorage(CONTRACT_ADDRESS, beaconSlot);
        console.log(`\nERC1967 Beacon Slot:`);
        console.log(`   ${beaconAddress}`);

        console.log("━".repeat(60));

        // Determine contract type
        console.log("\n🎯 Conclusion:");
        console.log("━".repeat(60));

        if (implAddress === "0x" + "0".repeat(64)) {
            console.log("⚠️  This appears to be a DIRECT IMPLEMENTATION deployment");
            console.log("   (Not a proxy contract)");
            console.log("\n💡 To verify this contract:");
            console.log("   1. You need to verify it as the OpinionCore implementation");
            console.log("   2. The bytecode must match EXACTLY with your compiled contract");
            console.log("   3. Check if viaIR was enabled during deployment");
            console.log("\n📌 Verification Command:");
            console.log(`   npx hardhat verify --network base-mainnet ${CONTRACT_ADDRESS}`);
        } else {
            const impl = ethers.getAddress("0x" + implAddress.slice(-40));
            console.log("✅ This is a PROXY contract");
            console.log(`   Implementation: ${impl}`);
            console.log("\n💡 To verify:");
            console.log(`   1. Verify implementation: ${impl}`);
            console.log(`   2. Then verify proxy: ${CONTRACT_ADDRESS}`);
        }

        console.log("━".repeat(60));

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
