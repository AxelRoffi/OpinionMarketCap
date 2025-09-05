import { ethers } from "hardhat";

async function main() {
    console.log("🔧 Setting up USDC allowance and testing createOpinion...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Connect to contracts
    const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("\n💰 Current USDC status:");
    const balance = await usdcContract.balanceOf(deployer.address);
    const allowance = await usdcContract.allowance(deployer.address, contractAddress);
    console.log("   Balance:", ethers.formatUnits(balance, 6), "USDC");
    console.log("   Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    // Approve USDC if needed
    if (allowance < ethers.parseUnits("20", 6)) {
        console.log("\n🔓 Approving USDC...");
        const approveTx = await usdcContract.approve(contractAddress, ethers.parseUnits("100", 6));
        await approveTx.wait();
        console.log("✅ USDC approved: 100 USDC");
        
        const newAllowance = await usdcContract.allowance(deployer.address, contractAddress);
        console.log("   New allowance:", ethers.formatUnits(newAllowance, 6), "USDC");
    }
    
    console.log("\n🧪 Testing createOpinion with correct signature...");
    
    try {
        const tx = await contract.createOpinion(
            "Will Bitcoin reach $100k by end of 2024?",
            "Yes, based on institutional adoption",
            "The approval of Bitcoin ETFs and increasing institutional adoption suggests strong momentum",
            ethers.parseUnits("5", 6), // 5 USDC
            ["crypto", "bitcoin", "prediction"]
        );
        
        console.log("📡 Transaction submitted:", tx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("   Gas used:", receipt?.gasUsed.toString());
        console.log("   Block:", receipt?.blockNumber);
        
        // Check the created opinion
        const opinion = await contract.getOpinion(1);
        console.log("\n📋 Created Opinion:");
        console.log("   ID: 1");
        console.log("   Creator:", opinion.creator);
        console.log("   Question:", opinion.question);
        console.log("   Answer:", opinion.currentAnswer);
        console.log("   Description:", opinion.description);
        console.log("   Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        console.log("   Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
        console.log("   Categories:", opinion.categories.join(", "));
        
        console.log("\n🎉 SUCCESS! The contract is working correctly on testnet!");
        
    } catch (error: any) {
        console.error("❌ Transaction failed:", error.message);
        
        if (error.message.includes("InsufficientAllowance")) {
            console.log("💡 Solution: Increase USDC allowance");
        } else if (error.message.includes("InsufficientBalance")) {
            console.log("💡 Solution: Get more USDC from faucet");
        } else if (error.message.includes("PriceRange")) {
            console.log("💡 Solution: Price must be between 2-100 USDC");
        } else {
            console.log("💡 Check the transaction on BaseScan for detailed error");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });