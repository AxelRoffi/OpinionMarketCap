import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing createOpinion with CORRECT price format...");
    
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
    
    console.log("📋 Price Format Guide:");
    console.log("   ❌ Wrong: 2 (this is 2 wei = 0.000002 USDC)");
    console.log("   ✅ Right: 2000000 (this is 2 USDC in 6 decimals)");
    console.log("   ✅ Right: 5000000 (this is 5 USDC in 6 decimals)");
    
    // Test the EXACT same call but with correct price
    console.log("\n🔧 Testing with corrected price...");
    
    try {
        const tx = await contract.createOpinion(
            "Best AI tool for coding ?",
            "Claude code", 
            "running everything from the terminal with the context of your all code, it is so convenient !!",
            ethers.parseUnits("2", 6), // 2 USDC in proper format
            ["web3"]
        );
        
        console.log("📡 Transaction submitted:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ SUCCESS! Gas used:", receipt?.gasUsed.toString());
        
        // Check the created opinion
        const opinion = await contract.getOpinion(2); // Should be opinion ID 2
        console.log("\n📋 Created Opinion #2:");
        console.log("   Question:", opinion.question);
        console.log("   Answer:", opinion.currentAnswer);
        console.log("   Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        
    } catch (error: any) {
        console.error("❌ Still failed:", error.message);
    }
    
    console.log("\n💡 For BaseScan UI:");
    console.log("   Use price: 2000000 (for 2 USDC)");
    console.log("   Use price: 5000000 (for 5 USDC)");
    console.log("   Use price: 10000000 (for 10 USDC)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });