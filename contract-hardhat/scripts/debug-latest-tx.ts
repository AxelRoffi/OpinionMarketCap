import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging latest failed transaction...");
    
    const txHash = "0x7cd7957380d45154b3a7043601a27f8298e2ba617cca78c49d930e0c8e8eb451";
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        // Get transaction details
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        
        console.log("📡 Transaction Details:");
        console.log("   From:", tx?.from);
        console.log("   To:", tx?.to);
        console.log("   Status:", receipt?.status === 1 ? "Success" : "Failed");
        console.log("   Gas Used:", receipt?.gasUsed.toString());
        console.log("   Gas Limit:", tx?.gasLimit.toString());
        
        if (tx?.from) {
            // Check the user's USDC status at the time of transaction
            const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
            const balance = await usdcContract.balanceOf(tx.from);
            const allowance = await usdcContract.allowance(tx.from, contractAddress);
            
            console.log("\n💰 Current USDC Status for", tx.from);
            console.log("   Balance:", ethers.formatUnits(balance, 6), "USDC");
            console.log("   Allowance:", ethers.formatUnits(allowance, 6), "USDC");
        }
        
        // Decode the transaction data
        const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
        
        if (tx?.data && tx.data.length > 10) {
            try {
                const decoded = contract.interface.parseTransaction({ data: tx.data });
                console.log("\n🔧 Decoded Function Call:");
                console.log("   Function:", decoded?.name);
                
                if (decoded?.name === "createOpinion") {
                    console.log("   Question:", decoded.args[0]);
                    console.log("   Answer:", decoded.args[1]);
                    console.log("   Description:", decoded.args[2]);
                    console.log("   Price:", decoded.args[3].toString(), "wei");
                    console.log("   Price in USDC:", ethers.formatUnits(decoded.args[3], 6));
                    console.log("   Categories:", decoded.args[4]);
                    
                    // Validate the inputs
                    console.log("\n🔍 Input Validation:");
                    console.log("   Question length:", decoded.args[0].length, "(max 100)");
                    console.log("   Answer length:", decoded.args[1].length, "(max 100)");
                    console.log("   Description length:", decoded.args[2].length, "(max 120)");
                    console.log("   Categories count:", decoded.args[4].length, "(max 3)");
                    console.log("   Price >= 2 USDC?", decoded.args[3] >= 2000000n);
                    console.log("   Price <= 100 USDC?", decoded.args[3] <= 100000000n);
                    
                    // Check for validation failures
                    if (decoded.args[0].length === 0) console.log("❌ Question is empty!");
                    if (decoded.args[0].length > 100) console.log("❌ Question too long!");
                    if (decoded.args[1].length === 0) console.log("❌ Answer is empty!");
                    if (decoded.args[1].length > 100) console.log("❌ Answer too long!");
                    if (decoded.args[2].length > 120) console.log("❌ Description too long!");
                    if (decoded.args[4].length === 0 || decoded.args[4].length > 3) console.log("❌ Invalid categories count!");
                    if (decoded.args[3] < 2000000n) console.log("❌ Price too low!");
                    if (decoded.args[3] > 100000000n) console.log("❌ Price too high!");
                    
                    // Check for empty categories
                    for (let i = 0; i < decoded.args[4].length; i++) {
                        if (decoded.args[4][i].length === 0) {
                            console.log(`❌ Category ${i} is empty!`);
                        }
                    }
                }
            } catch (e) {
                console.log("❌ Could not decode transaction data:", e);
            }
        }
        
        // Try to get the exact revert reason
        console.log("\n🔍 Getting exact revert reason...");
        try {
            await ethers.provider.call({
                to: tx?.to,
                data: tx?.data,
                from: tx?.from,
                gasLimit: tx?.gasLimit
            }, receipt?.blockNumber! - 1);
            console.log("🤔 Call succeeded in simulation - weird!");
        } catch (error: any) {
            console.log("💡 Revert reason:", error.message);
            
            // Try to parse custom error
            if (error.data) {
                try {
                    const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress);
                    const errorData = contract.interface.parseError(error.data);
                    console.log("🚨 Custom Error:", errorData?.name);
                    if (errorData?.args && errorData.args.length > 0) {
                        console.log("   Error Args:", errorData.args.map((arg: any) => arg.toString()));
                    }
                } catch (parseError) {
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