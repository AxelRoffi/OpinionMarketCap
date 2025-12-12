// Quick test of mainnet contract connection
const { ethers } = require("ethers");

async function testMainnetConnection() {
    console.log("🔗 Testing Base Mainnet Contract Connection");
    console.log("==========================================\n");
    
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contractAddress = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    
    // Simple ABI for basic functions
    const abi = [
        "function nextOpinionId() view returns (uint256)",
        "function isPublicCreationEnabled() view returns (bool)",
        "function minimumPrice() view returns (uint96)",
        "function usdcToken() view returns (address)",
        "function treasury() view returns (address)"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        console.log("📋 Contract Information:");
        console.log(`Address: ${contractAddress}`);
        console.log(`Network: Base Mainnet (Chain ID: 8453)`);
        
        console.log("\n📊 Contract State:");
        const nextId = await contract.nextOpinionId();
        console.log(`Next Opinion ID: ${nextId}`);
        
        const isPublic = await contract.isPublicCreationEnabled();
        console.log(`Public Creation: ${isPublic ? 'ENABLED' : 'DISABLED'}`);
        
        const minPrice = await contract.minimumPrice();
        console.log(`Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
        
        const usdc = await contract.usdcToken();
        console.log(`USDC Token: ${usdc}`);
        
        const treasury = await contract.treasury();
        console.log(`Treasury: ${treasury}`);
        
        console.log("\n✅ CONTRACT IS LIVE AND READY FOR UI CONNECTION!");
        console.log("\nNext steps:");
        console.log("1. Start your frontend: cd frontend && npm run dev");
        console.log("2. Connect your wallet to Base mainnet");
        console.log("3. Fund wallet with USDC for transactions");
        console.log("4. Create opinions and start trading!");
        
    } catch (error) {
        console.error("\n❌ Connection failed:", error.message);
    }
}

testMainnetConnection();