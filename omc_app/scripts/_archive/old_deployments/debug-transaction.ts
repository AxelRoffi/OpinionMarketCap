import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging failed transaction...");
    
    const txHash = "0xd5b430492d0fe1f8be7b68aaa3635c757e64f4c7a7064b004a5d805d5d77da9e";
    
    try {
        // Get transaction details
        const tx = await ethers.provider.getTransaction(txHash);
        console.log("📡 Transaction Details:");
        console.log("   From:", tx?.from);
        console.log("   To:", tx?.to);
        console.log("   Value:", tx?.value.toString());
        console.log("   Gas Limit:", tx?.gasLimit.toString());
        console.log("   Gas Price:", tx?.gasPrice?.toString());
        console.log("   Data Length:", tx?.data.length);
        
        // Get transaction receipt
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        console.log("\n📋 Transaction Receipt:");
        console.log("   Status:", receipt?.status === 1 ? "Success" : "Failed");
        console.log("   Gas Used:", receipt?.gasUsed.toString());
        console.log("   Block:", receipt?.blockNumber);
        
        if (receipt?.status === 0) {
            console.log("❌ Transaction failed!");
            
            // Try to decode the transaction data
            const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
            const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
            
            if (tx?.data && tx.data.length > 10) {
                try {
                    const decoded = contract.interface.parseTransaction({ data: tx.data });
                    console.log("\n🔧 Decoded Function Call:");
                    console.log("   Function:", decoded?.name);
                    console.log("   Arguments:", decoded?.args);
                } catch (e) {
                    console.log("❌ Could not decode transaction data");
                }
            }
            
            // Try to simulate the transaction to get the revert reason
            console.log("\n🔍 Attempting to get revert reason...");
            try {
                await ethers.provider.call({
                    to: tx?.to,
                    data: tx?.data,
                    from: tx?.from,
                    gasLimit: tx?.gasLimit,
                    gasPrice: tx?.gasPrice
                }, receipt?.blockNumber);
            } catch (error: any) {
                console.log("💡 Revert Reason:", error.reason || error.message);
                
                // Check for specific errors
                if (error.message.includes("InsufficientAllowance")) {
                    console.log("🚨 ISSUE: Not enough USDC allowance");
                } else if (error.message.includes("InsufficientBalance")) {
                    console.log("🚨 ISSUE: Not enough USDC balance");
                } else if (error.message.includes("PriceRange")) {
                    console.log("🚨 ISSUE: Price out of range (must be 2-100 USDC)");
                } else if (error.message.includes("QuestionEmpty")) {
                    console.log("🚨 ISSUE: Question cannot be empty");
                } else if (error.message.includes("TooManyCategories")) {
                    console.log("🚨 ISSUE: Categories must be 1-3 items");
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