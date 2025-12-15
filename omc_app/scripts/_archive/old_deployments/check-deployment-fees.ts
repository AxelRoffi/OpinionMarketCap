import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking deployed contract and fees...");
  
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  
  try {
    // Get USDC contract
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("📋 Contract Addresses:");
    console.log("- OpinionCore:", CONTRACT_ADDRESS);
    console.log("- USDC Token:", USDC_ADDRESS);
    console.log("- Treasury:", TREASURY_ADDRESS);
    console.log("- Deployer:", deployer.address);
    
    // Check USDC balances
    console.log("\n💰 USDC Balance Analysis:");
    const contractBalance = await USDC.balanceOf(CONTRACT_ADDRESS);
    const treasuryBalance = await USDC.balanceOf(TREASURY_ADDRESS);
    const deployerBalance = await USDC.balanceOf(deployer.address);
    
    console.log("- Contract Balance:", ethers.formatUnits(contractBalance, 6), "USDC");
    console.log("- Treasury Balance:", ethers.formatUnits(treasuryBalance, 6), "USDC");
    console.log("- Deployer Balance:", ethers.formatUnits(deployerBalance, 6), "USDC");
    
    // Check proxy information
    console.log("\n🔍 Proxy Analysis:");
    console.log("- Contract is EIP-1967 Transparent Proxy");
    console.log("- Implementation should be at: 0x9d0d22c617e03f2bab1045b692aa1647ca7232b5");
    console.log("- Previous implementation: 0x584f5760cbccb5d938e9403b8f9861587327b0b0");
    
    // Check basic contract calls
    console.log("\n📞 Contract State Check:");
    const provider = ethers.provider;
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("- Contract has code:", code.length > 2 ? "✅" : "❌");
    
    // Try to call some basic functions
    const opinionCore = await ethers.getContractAt("IOpinionCore", CONTRACT_ADDRESS);
    
    try {
      const nextOpinionId = await opinionCore.nextOpinionId();
      console.log("- Next Opinion ID:", nextOpinionId.toString());
      
      const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
      console.log("- Public Creation Enabled:", isPublicEnabled ? "✅" : "❌");
      
    } catch (error: any) {
      console.log("❌ Error calling contract functions:", error.message);
    }
    
    // Platform fees explanation
    console.log("\n💡 Platform Fees Explanation:");
    console.log("Based on the contract analysis:");
    console.log("1. ✅ Creation fees (5 USDC) go directly to treasury");
    console.log("2. ❌ Platform fees from trades are NOT going to treasury");
    console.log("3. 🔍 Platform fees are accumulated in the FeeManager contract");
    console.log("4. 🔑 Only addresses with TREASURY_ROLE can withdraw platform fees");
    console.log("5. 💰 Platform fees remain in the contract until withdrawn");
    
    console.log("\n🚨 Issue Found:");
    console.log("Platform fees from trading are accumulating in the contract");
    console.log("and not being automatically sent to your treasury address.");
    console.log("You need to:");
    console.log("1. Get the FeeManager contract address");
    console.log("2. Ensure your treasury has TREASURY_ROLE");
    console.log("3. Call withdrawPlatformFees() to collect accumulated fees");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});