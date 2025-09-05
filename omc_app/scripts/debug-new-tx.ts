import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging new failed transaction...");
    
    const txHash = "0x883758abffc004ea8c398ba7cc4358ee6cf5378f6fd594797a6e8db86c06d24f";
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        // Get transaction details
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        
        console.log("📡 Transaction Details:");
        console.log("   From:", tx?.from);
        console.log("   Status:", receipt?.status === 1 ? "Success" : "Failed");
        console.log("   Gas Used:", receipt?.gasUsed.toString());
        
        if (tx?.from) {
            // Check the user's USDC status
            const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
            const balance = await usdcContract.balanceOf(tx.from);
            const allowance = await usdcContract.allowance(tx.from, contractAddress);
            
            console.log("\n💰 User's USDC Status:");
            console.log("   Balance:", ethers.formatUnits(balance, 6), "USDC");
            console.log("   Allowance:", ethers.formatUnits(allowance, 6), "USDC");
            
            if (balance < ethers.parseUnits("2", 6)) {
                console.log("🚨 ISSUE: Insufficient USDC balance!");
                console.log("   Need: 2 USDC");
                console.log("   Have:", ethers.formatUnits(balance, 6), "USDC");
            }
            
            if (allowance < ethers.parseUnits("2", 6)) {
                console.log("🚨 ISSUE: Insufficient USDC allowance!");
                console.log("   Need: 2 USDC");
                console.log("   Approved:", ethers.formatUnits(allowance, 6), "USDC");
            }
        }
        
        // Decode the transaction
        const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
        
        if (tx?.data && tx.data.length > 10) {
            try {
                const decoded = contract.interface.parseTransaction({ data: tx.data });
                console.log("\n🔧 Decoded Function Call:");
                console.log("   Function:", decoded?.name);
                console.log("   Price:", decoded?.args[3].toString(), "(should be 2000000)");
                console.log("   Categories:", decoded?.args[4]);
            } catch (e) {
                console.log("❌ Could not decode transaction data");
            }
        }
        
        // Try to simulate and get exact error
        console.log("\n🔍 Simulating transaction to get error...");
        try {
            await ethers.provider.call({
                to: tx?.to,
                data: tx?.data,
                from: tx?.from
            }, receipt?.blockNumber! - 1);
        } catch (error: any) {
            console.log("💡 Error details:", error.message);
            
            // Parse custom errors
            if (error.data) {
                try {
                    const errorData = contract.interface.parseError(error.data);
                    console.log("🚨 Custom Error:", errorData?.name);
                    console.log("   Args:", errorData?.args);
                } catch (e) {
                    console.log("Could not parse custom error");
                }
            }
        }
        
    } catch (error) {
        console.error("❌ Failed to analyze transaction:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Debug script failed:", error);
        process.exit(1);
    });