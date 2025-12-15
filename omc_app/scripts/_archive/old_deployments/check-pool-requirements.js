const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 CHECKING POOL REQUIREMENTS");
    console.log("==============================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        // Check pool duration requirements
        const minPoolDuration = await poolManager.minPoolDuration();
        const maxPoolDuration = await poolManager.maxPoolDuration();
        
        console.log("📋 Pool Duration Requirements:");
        console.log("   Min duration:", minPoolDuration.toString(), "seconds");
        console.log("   Min duration:", Math.floor(Number(minPoolDuration) / (24 * 60 * 60)), "days");
        console.log("   Max duration:", maxPoolDuration.toString(), "seconds");
        console.log("   Max duration:", Math.floor(Number(maxPoolDuration) / (24 * 60 * 60)), "days");
        
        // Test valid deadline
        const now = Math.floor(Date.now() / 1000);
        const validDeadline = now + Number(minPoolDuration) + 3600; // Add 1 hour buffer
        
        console.log("\n📋 Deadline Calculation:");
        console.log("   Current time:", now);
        console.log("   Valid deadline:", validDeadline);
        console.log("   Deadline date:", new Date(validDeadline * 1000).toLocaleString());
        console.log("   Duration:", Math.floor((validDeadline - now) / (24 * 60 * 60)), "days");
        
        // Check all fee amounts
        console.log("\n📋 Fee Structure:");
        const poolCreationFee = await poolManager.poolCreationFee();
        const poolContributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool creation fee:", ethers.formatUnits(poolCreationFee, 6), "USDC");
        console.log("   Pool contribution fee:", ethers.formatUnits(poolContributionFee, 6), "USDC");
        
        // Suggest minimum viable pool creation
        const minContribution = ethers.parseUnits("0.1", 6); // Very small amount
        const totalMinimum = poolCreationFee + poolContributionFee + minContribution;
        
        console.log("   Minimum contribution for test:", ethers.formatUnits(minContribution, 6), "USDC");
        console.log("   Total minimum needed:", ethers.formatUnits(totalMinimum, 6), "USDC");
        
        // Test with corrected parameters
        console.log("\n🧪 Test Pool Creation with Correct Parameters:");
        console.log("==============================================");
        
        const [deployer] = await ethers.getSigners();
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        const balance = await usdcToken.balanceOf(deployer.address);
        console.log("   User balance:", ethers.formatUnits(balance, 6), "USDC");
        
        if (balance >= totalMinimum) {
            try {
                console.log("   Attempting pool creation with corrected parameters...");
                
                const poolTx = await poolManager.createPool(
                    3, // Opinion ID
                    "Corrected test pool", // Proposed answer
                    validDeadline, // Valid deadline
                    minContribution, // Small contribution
                    "Debug Pool - Fixed", // Name
                    "" // No IPFS hash
                );
                
                console.log("   Transaction sent:", poolTx.hash);
                const receipt = await poolTx.wait();
                console.log("   ✅ SUCCESS! Pool created");
                console.log("   Gas used:", receipt.gasUsed.toString());
                
                // Check pool was created
                const poolCount = await poolManager.poolCount();
                console.log("   New pool count:", poolCount.toString());
                
                if (poolCount > 0) {
                    const pool = await poolManager.pools(poolCount - BigInt(1));
                    console.log("   ✅ Pool verified:");
                    console.log("     Opinion ID:", pool[1].toString());
                    console.log("     Proposed answer:", pool[3]);
                    console.log("     Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                }
                
            } catch (error) {
                console.log("   ❌ Still failed:", error.message);
                if (error.data) {
                    console.log("   Error data:", error.data);
                }
            }
        } else {
            console.log("   ❌ Still insufficient balance for minimum pool creation");
        }
        
        console.log("\n📋 Frontend Fix Requirements:");
        console.log("==============================");
        console.log("1. ✅ Contract address: Already fixed");
        console.log("2. ❌ Minimum deadline: Frontend must use at least", Math.ceil(Number(minPoolDuration) / (24 * 60 * 60)), "days");
        console.log("3. ❌ User USDC balance: Need at least", ethers.formatUnits(totalMinimum, 6), "USDC");
        console.log("4. ❌ Frontend validation: Must check balance before allowing submission");
        
        console.log("\n🔧 Specific Frontend Fixes Needed:");
        console.log("   - Update minimum deadline validation");
        console.log("   - Add USDC balance check");
        console.log("   - Show required vs available balance");
        console.log("   - Prevent submission if insufficient funds");
        
    } catch (error) {
        console.error("❌ Requirements check failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });