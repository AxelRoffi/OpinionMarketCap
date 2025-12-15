const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Finding Implementation Contract Address...\n");

    const PROXY_ADDRESS = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";

    // ERC1967 implementation slot
    // keccak256("eip1967.proxy.implementation") - 1
    const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

    try {
        // Get the storage at the implementation slot
        const implementationAddress = await ethers.provider.getStorage(
            PROXY_ADDRESS,
            IMPLEMENTATION_SLOT
        );

        // Convert from bytes32 to address (remove leading zeros)
        const implementation = ethers.getAddress("0x" + implementationAddress.slice(-40));

        console.log("📋 Proxy Information:");
        console.log("━".repeat(60));
        console.log(`Proxy Address:          ${PROXY_ADDRESS}`);
        console.log(`Implementation Address: ${implementation}`);
        console.log("━".repeat(60));

        // Check if implementation has code
        const code = await ethers.provider.getCode(implementation);
        const hasCode = code !== "0x";

        console.log(`\n✅ Implementation Status: ${hasCode ? "Contract Found" : "⚠️  No Code Found"}`);
        console.log(`   Code Size: ${code.length} bytes\n`);

        // Get bytecode hash for verification
        const bytecodeHash = ethers.keccak256(code);
        console.log(`📊 Implementation Bytecode Hash:`);
        console.log(`   ${bytecodeHash}\n`);

        console.log("🎯 Next Steps:");
        console.log("━".repeat(60));
        console.log("1. Verify the IMPLEMENTATION contract at:");
        console.log(`   ${implementation}`);
        console.log("\n2. BaseScan URL:");
        console.log(`   https://basescan.org/address/${implementation}#code`);
        console.log("\n3. Use this command to verify:");
        console.log(`   npx hardhat verify --network base-mainnet ${implementation}`);
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
