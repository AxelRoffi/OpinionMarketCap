const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 FIXING POOLMANAGER ROLE IN FEEMANAGER");
    console.log("=========================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
    
    try {
        const feeManager = await ethers.getContractAt("FeeManager", FEE_MANAGER_ADDRESS);
        
        console.log("🔍 Current Role Status:");
        const CORE_CONTRACT_ROLE = await feeManager.CORE_CONTRACT_ROLE();
        const hasRole = await feeManager.hasRole(CORE_CONTRACT_ROLE, POOL_MANAGER_ADDRESS);
        
        console.log("   CORE_CONTRACT_ROLE:", CORE_CONTRACT_ROLE);
        console.log("   PoolManager address:", POOL_MANAGER_ADDRESS);
        console.log("   PoolManager has CORE_CONTRACT_ROLE:", hasRole);
        
        if (!hasRole) {
            console.log("\n🔧 GRANTING CORE_CONTRACT_ROLE TO POOLMANAGER...");
            
            // Check if deployer can grant roles
            const DEFAULT_ADMIN_ROLE = await feeManager.DEFAULT_ADMIN_ROLE();
            const isAdmin = await feeManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
            
            console.log("   Deployer is admin:", isAdmin);
            
            if (isAdmin) {
                // Grant the role
                const grantTx = await feeManager.grantRole(CORE_CONTRACT_ROLE, POOL_MANAGER_ADDRESS);
                await grantTx.wait();
                
                console.log("   ✅ CORE_CONTRACT_ROLE granted to PoolManager");
                console.log("   Transaction:", grantTx.hash);
                
                // Verify the role was granted
                const hasRoleNow = await feeManager.hasRole(CORE_CONTRACT_ROLE, POOL_MANAGER_ADDRESS);
                console.log("   Verification - PoolManager now has role:", hasRoleNow);
                
            } else {
                console.log("   ❌ Deployer does not have admin rights to grant roles");
                
                // Check who has admin role
                console.log("   Checking admin role holders...");
                // We can't easily enumerate role holders, but we can check common addresses
                
                return;
            }
        } else {
            console.log("   ✅ PoolManager already has CORE_CONTRACT_ROLE");
        }
        
        console.log("\n🧪 TESTING POOL CREATION AFTER FIX:");
        console.log("===================================");
        
        // Now test pool creation
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Test parameters
        const contribution = ethers.parseUnits("2", 6);
        const creationFee = await poolManager.poolCreationFee();
        const totalCost = creationFee + contribution;
        const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
        
        const balance = await usdcToken.balanceOf(deployer.address);
        console.log("   User balance:", ethers.formatUnits(balance, 6), "USDC");
        console.log("   Required cost:", ethers.formatUnits(totalCost, 6), "USDC");
        
        if (balance >= totalCost) {
            // Set allowance
            const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (allowance < totalCost) {
                console.log("   Setting USDC allowance...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalCost);
                await approveTx.wait();
                console.log("   ✅ Allowance set");
            }
            
            console.log("   Attempting pool creation...");
            console.log("   Parameters:");
            console.log("     Opinion ID: 3");
            console.log("     Proposed answer: 'Biden will win'");
            console.log("     Contribution:", ethers.formatUnits(contribution, 6), "USDC");
            console.log("     Deadline:", new Date(deadline * 1000).toLocaleString());
            
            try {
                const poolTx = await poolManager.createPool(
                    3,
                    "Biden will win", // Different from current answer
                    deadline,
                    contribution,
                    "Biden Victory Pool",
                    ""
                );
                
                console.log("   Transaction sent:", poolTx.hash);
                const receipt = await poolTx.wait();
                
                console.log("   🎊 SUCCESS! POOL CREATED!");
                console.log("   Block:", receipt.blockNumber);
                console.log("   Gas used:", receipt.gasUsed.toString());
                
                // Verify pool exists
                const poolCount = await poolManager.poolCount();
                console.log("   New pool count:", poolCount.toString());
                
                if (poolCount > 0) {
                    const poolId = poolCount - BigInt(1);
                    const pool = await poolManager.pools(poolId);
                    
                    console.log("\n📋 Created Pool Details:");
                    console.log("     Pool ID:", poolId.toString());
                    console.log("     Opinion ID:", pool[1].toString());
                    console.log("     Proposed Answer:", pool[3]);
                    console.log("     Name:", pool[8]);
                    console.log("     Creator:", pool[2]);
                    console.log("     Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                    console.log("     Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
                }
                
                console.log("\n🎯 ISSUE COMPLETELY RESOLVED!");
                console.log("==============================");
                console.log("✅ Role permission fixed");
                console.log("✅ Pool creation working");
                console.log("✅ FeeManager integration working");  
                console.log("✅ Frontend should now work perfectly");
                
                console.log("\n🔗 BaseScan Transaction:");
                console.log("   https://sepolia.basescan.org/tx/" + poolTx.hash);
                
            } catch (poolError) {
                console.log("   ❌ Pool creation still failed:", poolError.message);
                if (poolError.data) {
                    console.log("   Error data:", poolError.data);
                    
                    if (poolError.data !== "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1") {
                        console.log("   🔍 Different error - the role fix helped!");
                    } else {
                        console.log("   🔍 Same error - there might be another issue");
                    }
                }
            }
            
        } else {
            console.log("   ❌ Insufficient balance for testing");
        }
        
    } catch (error) {
        console.error("❌ Role fix failed:", error.message);
        if (error.data) {
            console.error("   Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });