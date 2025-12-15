import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Checking Proxy Implementation...");
    
    const PROXY_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const [deployer] = await ethers.getSigners();
    
    console.log("Proxy Address:", PROXY_ADDRESS);
    
    try {
        // Get the proxy contract
        const proxy = await ethers.getContractAt("OpinionCore", PROXY_ADDRESS);
        
        // Try to call some basic functions to verify it works
        console.log("\n🧪 Testing Contract Functions:");
        
        const isPublicEnabled = await proxy.isPublicCreationEnabled();
        console.log("✅ Public creation enabled:", isPublicEnabled);
        
        const nextOpinionId = await proxy.nextOpinionId();
        console.log("✅ Next opinion ID:", nextOpinionId.toString());
        
        const availableCategories = await proxy.getAvailableCategories();
        console.log("✅ Available categories:", availableCategories);
        
        const minPrice = await proxy.MIN_INITIAL_PRICE();
        const maxPrice = await proxy.MAX_INITIAL_PRICE();
        console.log(`✅ Price range: ${ethers.formatUnits(minPrice, 6)} - ${ethers.formatUnits(maxPrice, 6)} USDC`);
        
        // Try to get the implementation address (for UUPS proxies)
        try {
            // This storage slot contains the implementation address for UUPS proxies
            const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const implementationAddress = await ethers.provider.getStorage(PROXY_ADDRESS, implementationSlot);
            const cleanAddress = "0x" + implementationAddress.slice(-40);
            
            console.log("\n🏗️ Proxy Information:");
            console.log("Implementation Address:", cleanAddress);
            
            // Verify implementation has code
            const implementationCode = await ethers.provider.getCode(cleanAddress);
            if (implementationCode === "0x") {
                console.log("❌ Implementation has no code");
            } else {
                console.log("✅ Implementation has code");
                console.log("Implementation code size:", (implementationCode.length - 2) / 2, "bytes");
            }
            
        } catch (error) {
            console.log("⚠️ Could not get implementation address (might be transparent proxy)");
        }
        
        // Check if it's a transparent proxy
        try {
            const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
            const adminAddress = await ethers.provider.getStorage(PROXY_ADDRESS, adminSlot);
            if (adminAddress !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                console.log("🏗️ This appears to be a Transparent Proxy");
                console.log("Admin Address:", "0x" + adminAddress.slice(-40));
            }
        } catch (error) {
            console.log("Not a transparent proxy");
        }
        
        console.log("\n✅ Contract is working correctly!");
        console.log("The issue is likely that BaseScan needs time to index the proxy implementation.");
        
    } catch (error: any) {
        console.error("❌ Error accessing contract:", error.message);
        
        // Check if contract exists
        const code = await ethers.provider.getCode(PROXY_ADDRESS);
        if (code === "0x") {
            console.log("❌ No contract code found at this address");
        } else {
            console.log("✅ Contract code exists");
            console.log("Code size:", (code.length - 2) / 2, "bytes");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });