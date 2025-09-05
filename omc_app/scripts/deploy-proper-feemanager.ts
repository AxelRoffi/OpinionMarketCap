import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying proper FeeManager contract...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Deploy the real FeeManager contract
    console.log("\n📦 Deploying FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy();
    await feeManager.waitForDeployment();
    const feeManagerAddress = await feeManager.getAddress();
    
    console.log("✅ FeeManager deployed at:", feeManagerAddress);
    
    // Initialize the FeeManager
    console.log("\n⚙️ Initializing FeeManager...");
    await feeManager.initialize(
      USDC_ADDRESS,
      TREASURY_ADDRESS
    );
    console.log("✅ FeeManager initialized");
    
    // Set fee parameters (20% platform fee as mentioned in your config)
    console.log("\n🎛️ Setting fee parameters...");
    await feeManager.setPlatformFeePercent(20); // 20%
    await feeManager.setCreatorFeePercent(10);  // 10%
    await feeManager.setMEVPenaltyPercent(25);  // 25%
    await feeManager.setRapidTradeWindow(300);  // 5 minutes
    console.log("✅ Fee parameters set");
    
    // Grant roles
    console.log("\n🔐 Setting up roles...");
    const TREASURY_ROLE = await feeManager.TREASURY_ROLE();
    const CORE_CONTRACT_ROLE = await feeManager.CORE_CONTRACT_ROLE();
    
    // Grant treasury role to treasury address
    await feeManager.grantRole(TREASURY_ROLE, TREASURY_ADDRESS);
    console.log("✅ TREASURY_ROLE granted to:", TREASURY_ADDRESS);
    
    // Grant core contract role to OpinionCore
    await feeManager.grantRole(CORE_CONTRACT_ROLE, OPINION_CORE_ADDRESS);
    console.log("✅ CORE_CONTRACT_ROLE granted to:", OPINION_CORE_ADDRESS);
    
    // Test the fee calculation
    console.log("\n🧮 Testing fee calculation...");
    const testPrice = ethers.parseUnits("10", 6); // 10 USDC
    const feeDistribution = await feeManager.calculateFeeDistribution(testPrice);
    
    console.log("Fee Distribution for 10 USDC:");
    console.log("- Platform Fee:", ethers.formatUnits(feeDistribution.platformFee, 6), "USDC");
    console.log("- Creator Fee:", ethers.formatUnits(feeDistribution.creatorFee, 6), "USDC");
    console.log("- Owner Amount:", ethers.formatUnits(feeDistribution.ownerAmount, 6), "USDC");
    
    // Save deployment info
    const deploymentInfo = {
      network: "baseSepolia",
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        opinionCore: OPINION_CORE_ADDRESS,
        feeManager: feeManagerAddress,
        usdcToken: USDC_ADDRESS,
        treasury: TREASURY_ADDRESS
      },
      features: {
        platformFeePercent: 20,
        creatorFeePercent: 10,
        mevPenaltyPercent: 25,
        rapidTradeWindow: 300,
        treasuryRole: TREASURY_ADDRESS,
        coreRole: OPINION_CORE_ADDRESS
      }
    };
    
    console.log("\n📋 Deployment Summary:");
    console.log("- FeeManager Address:", feeManagerAddress);
    console.log("- Treasury Address:", TREASURY_ADDRESS);
    console.log("- OpinionCore Address:", OPINION_CORE_ADDRESS);
    console.log("- Platform Fee:", "20%");
    console.log("- Creator Fee:", "10%");
    
    console.log("\n🔄 Next Steps:");
    console.log("1. Update OpinionCore to use the new FeeManager");
    console.log("2. Call opinionCore.setFeeManager('" + feeManagerAddress + "')");
    console.log("3. Test fee distribution");
    console.log("4. Verify treasury receives platform fees");
    
    // Create update script for OpinionCore
    console.log("\n📝 Creating update script...");
    const updateScript = `
// Update OpinionCore to use new FeeManager
import { ethers } from "hardhat";

async function main() {
  const opinionCore = await ethers.getContractAt("OpinionCore", "${OPINION_CORE_ADDRESS}");
  
  // Update FeeManager address
  await opinionCore.setFeeManager("${feeManagerAddress}");
  console.log("✅ OpinionCore updated with new FeeManager");
  
  // Verify the update
  const newFeeManager = await opinionCore.feeManager();
  console.log("New FeeManager:", newFeeManager);
}

main().catch(console.error);
`;
    
    require('fs').writeFileSync('./scripts/update-opinion-core-feemanager.ts', updateScript);
    console.log("✅ Update script created: scripts/update-opinion-core-feemanager.ts");
    
    // Save deployment info
    require('fs').writeFileSync('./deployed-feemanager.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved: deployed-feemanager.json");
    
  } catch (error: any) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});