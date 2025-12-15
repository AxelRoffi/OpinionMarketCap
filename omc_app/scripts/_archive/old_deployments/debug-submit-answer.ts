import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Debugging Submit Answer Transaction...");
    
    const OPINION_CORE_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const FAILED_TX_HASH = "0x924a274b626e33a7274d99996845633344dddadbc51158a45f1d57f7199b670b";
    
    const [deployer] = await ethers.getSigners();
    console.log("Account:", deployer.address);

    // Get contract instances
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    
    try {
        // Get the failed transaction details
        const tx = await ethers.provider.getTransaction(FAILED_TX_HASH);
        console.log("🔍 Failed Transaction Details:");
        console.log("From:", tx?.from);
        console.log("To:", tx?.to);
        console.log("Value:", ethers.formatEther(tx?.value || 0), "ETH");
        console.log("Gas Limit:", tx?.gasLimit?.toString());
        
        // Decode the transaction data to see what function was called
        const iface = new ethers.Interface([
            "function submitAnswer(uint256 opinionId, string memory answer, string memory description)"
        ]);
        
        if (tx?.data) {
            try {
                const decoded = iface.parseTransaction({ data: tx.data });
                console.log("📋 Function Called:", decoded?.name);
                console.log("Parameters:");
                console.log("  Opinion ID:", decoded?.args[0]?.toString());
                console.log("  Answer:", decoded?.args[1]);
                console.log("  Description:", decoded?.args[2]);
                
                const opinionId = decoded?.args[0];
                const answer = decoded?.args[1];
                const description = decoded?.args[2];
                
                // Now let's check why this might have failed
                console.log("\n🔍 Checking Potential Issues:");
                
                // 1. Check if opinion exists and is active
                try {
                    const opinion = await opinionCore.getOpinionDetails(opinionId);
                    console.log("✅ Opinion exists");
                    console.log("  Question:", opinion.question);
                    console.log("  Current Answer:", opinion.currentAnswer);
                    console.log("  Is Active:", opinion.isActive);
                    console.log("  Current Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
                    
                    if (!opinion.isActive) {
                        console.log("❌ ISSUE: Opinion is not active!");
                    }
                    
                    // 2. Check if user has enough USDC balance
                    const userBalance = await usdc.balanceOf(tx?.from || deployer.address);
                    console.log("💳 User USDC Balance:", ethers.formatUnits(userBalance, 6), "USDC");
                    
                    // 3. Check USDC allowance
                    const allowance = await usdc.allowance(tx?.from || deployer.address, OPINION_CORE_ADDRESS);
                    console.log("🔒 USDC Allowance:", ethers.formatUnits(allowance, 6), "USDC");
                    
                    // 4. Check required payment amount
                    const requiredPayment = opinion.lastPrice; // This is the current price
                    console.log("💰 Required Payment:", ethers.formatUnits(requiredPayment, 6), "USDC");
                    
                    if (userBalance < requiredPayment) {
                        console.log("❌ ISSUE: Insufficient USDC balance!");
                    }
                    
                    if (allowance < requiredPayment) {
                        console.log("❌ ISSUE: Insufficient USDC allowance!");
                    }
                    
                    // 5. Check if answer is different from current
                    if (answer === opinion.currentAnswer) {
                        console.log("❌ ISSUE: Answer is the same as current answer!");
                    }
                    
                    // 6. Check answer length
                    if (answer.length > 52) {
                        console.log("❌ ISSUE: Answer too long (max 52 characters)!");
                    }
                    
                    // 7. Check description length
                    if (description.length > 120) {
                        console.log("❌ ISSUE: Description too long (max 120 characters)!");
                    }
                    
                    // 8. Check if contract is paused
                    try {
                        const isPaused = await opinionCore.paused();
                        console.log("⏸️ Contract Paused:", isPaused);
                        if (isPaused) {
                            console.log("❌ ISSUE: Contract is paused!");
                        }
                    } catch (e) {
                        console.log("ℹ️ Could not check paused status");
                    }
                    
                } catch (error) {
                    console.log("❌ ISSUE: Opinion does not exist or cannot be read!");
                    console.log("Error:", error);
                }
                
            } catch (decodeError) {
                console.log("⚠️ Could not decode transaction data");
            }
        }
        
    } catch (error) {
        console.error("❌ Error analyzing transaction:", error);
    }
    
    // Test a simple read function to make sure contract is accessible
    try {
        console.log("\n🧪 Testing Contract Access:");
        const nextOpinionId = await opinionCore.nextOpinionId();
        console.log("✅ Contract accessible, next opinion ID:", nextOpinionId.toString());
    } catch (error) {
        console.log("❌ Cannot access contract:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });