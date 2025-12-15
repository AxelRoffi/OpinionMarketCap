import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Testing deployed contract on Base Sepolia...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Testing with account:", deployer.address);
    
    // Connect to the deployed contract
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
    
    console.log("\n🧪 Testing contract connectivity...");
    
    try {
        // Test basic read functions
        const nextOpinionId = await contract.nextOpinionId();
        console.log("✅ nextOpinionId:", nextOpinionId.toString());
        
        const usdcToken = await contract.usdcToken();
        console.log("✅ USDC token:", usdcToken);
        
        const treasury = await contract.treasury();
        console.log("✅ Treasury:", treasury);
        
    } catch (error) {
        console.error("❌ Basic read failed:", error);
        return;
    }
    
    console.log("\n🔍 Testing function signatures...");
    
    try {
        // Get the function fragment
        const fragment = contract.interface.getFunction("createOpinion");
        console.log("✅ Function signature:", fragment.format());
        console.log("📝 Parameters:", fragment.inputs.map(i => `${i.name}: ${i.type}`).join(", "));
        
        // Test that function exists by encoding a call (but not sending it)
        const calldata = contract.interface.encodeFunctionData("createOpinion", [
            "Test question",
            "Test answer", 
            "Test description",
            ethers.parseUnits("5", 6),
            ["test"]
        ]);
        console.log("✅ Function encoding works, calldata length:", calldata.length);
        
    } catch (error) {
        console.error("❌ Function signature test failed:", error);
        return;
    }
    
    console.log("\n🔍 Testing USDC interaction...");
    
    try {
        // Connect to USDC contract
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        const balance = await usdcContract.balanceOf(deployer.address);
        console.log("💰 USDC balance:", ethers.formatUnits(balance, 6), "USDC");
        
        const allowance = await usdcContract.allowance(deployer.address, contractAddress);
        console.log("🔓 USDC allowance:", ethers.formatUnits(allowance, 6), "USDC");
        
        if (balance === 0n) {
            console.log("⚠️  WARNING: No USDC balance - this could cause transaction failures");
        }
        
        if (allowance === 0n) {
            console.log("⚠️  WARNING: No USDC allowance - need to approve first");
        }
        
    } catch (error) {
        console.error("❌ USDC test failed:", error);
    }
    
    console.log("\n📋 Summary:");
    console.log("✅ Contract is deployed and accessible");
    console.log("✅ Function signature is correct (5 parameters)");
    console.log("📝 Next steps: Check USDC balance and allowance before calling createOpinion");
    
    console.log("\n🔗 Contract on BaseScan:");
    console.log(`   https://sepolia.basescan.org/address/${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });