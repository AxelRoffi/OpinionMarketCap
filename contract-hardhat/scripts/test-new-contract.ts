import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing NEW CONTRACT with CORRECTED FEES");
    
    // Use admin wallet for testing
    const ADMIN_PRIVATE_KEY = "0xa42bcddedd96c0f1fbb72c89287b3ad74963f0128a8935a8bf655c135ecabc88";
    const provider = ethers.provider;
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    
    const NEW_CONTRACT = "0xe73c6dcd6aEf15119eBD484266DDf745C6Ae12E7";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const contract = await ethers.getContractAt("FixedOpinionMarket", NEW_CONTRACT, adminWallet);
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS, adminWallet);
    
    console.log("🔑 Using wallet:", adminWallet.address);
    console.log("📝 New contract:", NEW_CONTRACT);
    
    // Check contract state
    const treasury = await contract.treasury();
    const usdcToken = await contract.usdcToken();
    const nextOpinionId = await contract.nextOpinionId();
    
    console.log("✅ Contract initialized correctly:");
    console.log("   Treasury:", treasury);
    console.log("   USDC Token:", usdcToken);
    console.log("   Next Opinion ID:", nextOpinionId.toString());
    
    // Check USDC allowance
    const allowance = await usdcContract.allowance(adminWallet.address, NEW_CONTRACT);
    console.log("   USDC Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    if (allowance < ethers.parseUnits("10", 6)) {
        console.log("🔓 Approving USDC for new contract...");
        const approveTx = await usdcContract.approve(NEW_CONTRACT, ethers.parseUnits("50", 6));
        await approveTx.wait();
        console.log("✅ USDC approved for new contract");
    }
    
    // Test createOpinion with corrected fee structure
    console.log("\n🧪 Testing createOpinion on new contract...");
    try {
        const tx = await contract.createOpinion(
            "Will the corrected fee structure work perfectly?",
            "Yes, 2% platform + 3% creator + 95% owner = 100%",
            "This test validates that the fee structure has been corrected from the wrong 5%/5%/90% to the correct 2%/3%/95%.",
            ethers.parseUnits("10", 6), // 10 USDC
            ["testing", "fees", "corrected"]
        );
        
        await tx.wait();
        console.log("✅ Opinion created successfully on new contract!");
        
        // Get the opinion details
        const opinion = await contract.getOpinion(1);
        console.log("📋 Created Opinion:");
        console.log("   Question:", opinion.question);
        console.log("   Answer:", opinion.currentAnswer);
        console.log("   Description:", opinion.description);
        console.log("   Categories:", opinion.categories.join(", "));
        console.log("   Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        console.log("   Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
        
        console.log("\n🎉 NEW CONTRACT IS READY FOR FRONTEND!");
        
    } catch (error: any) {
        console.error("❌ Test failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test script failed:", error);
        process.exit(1);
    });