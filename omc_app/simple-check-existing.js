// SIMPLE CHECK OF EXISTING CONTRACTS
const { ethers } = require("hardhat");

const CONTRACTS_TO_CHECK = [
    "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    "0x0dc574553fb88a204c014b2a9b3c1d5bfae165da", 
    "0xc4f73fe61b811ecc6af2a94e0123506622bb8d43",
    "0xa4b604da9b202a315cfc63f43b5700e847cf847b",
    "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259"
];

async function checkContracts() {
    console.log("🔍 HONEST CHECK OF EXISTING CONTRACTS");
    console.log("=====================================");
    
    const [signer] = await ethers.getSigners();
    console.log(`Checking from: ${signer.address}`);
    
    for (const address of CONTRACTS_TO_CHECK) {
        console.log(`\n📋 Contract: ${address}`);
        
        try {
            // Check if it's a contract
            const code = await ethers.provider.getCode(address);
            if (code === "0x") {
                console.log("❌ NOT A CONTRACT");
                continue;
            }
            
            console.log("✅ IS A CONTRACT");
            
            // Try common functions
            const possibleContracts = [
                { name: "FeeManager", abi: ["function usdcToken() view returns (address)", "function treasury() view returns (address)", "function platformFeePercent() view returns (uint256)"] },
                { name: "PoolManager", abi: ["function opinionCore() view returns (address)", "function usdcToken() view returns (address)"] },
                { name: "OpinionCore", abi: ["function nextOpinionId() view returns (uint256)", "function usdcToken() view returns (address)"] },
                { name: "MinimalOpinionCore", abi: ["function nextOpinionId() view returns (uint256)", "function isPublicCreationEnabled() view returns (bool)"] }
            ];
            
            for (const contractType of possibleContracts) {
                try {
                    const contract = new ethers.Contract(address, contractType.abi, signer);
                    
                    if (contractType.name === "FeeManager") {
                        const usdc = await contract.usdcToken();
                        const treasury = await contract.treasury(); 
                        const fee = await contract.platformFeePercent();
                        console.log(`✅ ${contractType.name} FOUND!`);
                        console.log(`   USDC: ${usdc}`);
                        console.log(`   Treasury: ${treasury}`);
                        console.log(`   Fee: ${fee}%`);
                        
                        if (usdc !== "0x0000000000000000000000000000000000000000") {
                            console.log("   🎉 CONFIGURED AND USABLE!");
                        } else {
                            console.log("   ⚠️  NOT CONFIGURED YET");
                        }
                        break;
                    }
                    
                    if (contractType.name === "PoolManager") {
                        const core = await contract.opinionCore();
                        const usdc = await contract.usdcToken();
                        console.log(`✅ ${contractType.name} FOUND!`);
                        console.log(`   OpinionCore: ${core}`);
                        console.log(`   USDC: ${usdc}`);
                        break;
                    }
                    
                    if (contractType.name === "OpinionCore" || contractType.name === "MinimalOpinionCore") {
                        const nextId = await contract.nextOpinionId();
                        console.log(`✅ ${contractType.name} FOUND!`);
                        console.log(`   Next Opinion ID: ${nextId}`);
                        
                        if (contractType.name === "MinimalOpinionCore") {
                            const publicEnabled = await contract.isPublicCreationEnabled();
                            console.log(`   Public Creation: ${publicEnabled}`);
                        }
                        break;
                    }
                    
                } catch (e) {
                    // Not this contract type, continue
                }
            }
            
        } catch (error) {
            console.log(`❌ Error checking: ${error.message}`);
        }
    }
}

checkContracts().catch(console.error);