const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Deploys a Gnosis Safe multisig for solo developer admin control
 * Creates 2-of-3 multisig using three wallets controlled by the developer
 */
async function deployMultisig() {
    console.log("🔐 Deploying Multisig for Solo Developer Admin Control...");
    
    // ===== CONFIGURATION =====
    // You need to update these addresses with your actual wallet addresses
    const owners = [
        "0x0000000000000000000000000000000000000001", // Replace with your HOT wallet (daily operations)
        "0x0000000000000000000000000000000000000002", // Replace with your HARDWARE wallet (secure signing)
        "0x0000000000000000000000000000000000000003"  // Replace with your BACKUP wallet (emergency access)
    ];
    
    const threshold = 2; // Need 2 of 3 signatures for any admin operation
    
    // Gnosis Safe deployment addresses for Base Sepolia
    const SAFE_FACTORY_ADDRESS = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";
    const SAFE_MASTER_COPY = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
    
    // ===== VALIDATION =====
    console.log("📋 Validating configuration...");
    
    // Check if placeholder addresses are still being used
    const placeholderAddresses = [
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002", 
        "0x0000000000000000000000000000000000000003"
    ];
    
    for (let i = 0; i < owners.length; i++) {
        if (placeholderAddresses.includes(owners[i])) {
            console.error(`❌ ERROR: Please replace placeholder address ${owners[i]} with your actual wallet address`);
            console.error(`   Update the 'owners' array in this script with your real wallet addresses`);
            process.exit(1);
        }
        
        if (!ethers.utils.isAddress(owners[i])) {
            console.error(`❌ ERROR: Invalid address format: ${owners[i]}`);
            process.exit(1);
        }
    }
    
    // Check for duplicate addresses
    const uniqueOwners = [...new Set(owners)];
    if (uniqueOwners.length !== owners.length) {
        console.error("❌ ERROR: Duplicate addresses found in owners array");
        process.exit(1);
    }
    
    console.log(`✅ Configuration valid:`);
    console.log(`   Owners: ${owners.length}`);
    console.log(`   Threshold: ${threshold} of ${owners.length}`);
    console.log(`   Network: ${(await ethers.provider.getNetwork()).name}`);
    
    // ===== DEPLOYMENT =====
    try {
        console.log("\n🏭 Deploying Gnosis Safe...");
        
        // Get the Safe factory contract
        const safeFactory = await ethers.getContractAt(
            [
                "function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce) external returns (address proxy)"
            ],
            SAFE_FACTORY_ADDRESS
        );
        
        // Get Safe master copy interface for setup data encoding
        const safeMasterInterface = new ethers.utils.Interface([
            "function setup(address[] calldata _owners, uint256 _threshold, address to, bytes calldata data, address fallbackHandler, address paymentToken, uint256 payment, address paymentReceiver) external"
        ]);
        
        // Encode setup data
        const setupData = safeMasterInterface.encodeFunctionData("setup", [
            owners,           // _owners: Array of owner addresses
            threshold,        // _threshold: Number of required confirmations
            "0x0000000000000000000000000000000000000000", // to: Contract address for optional delegate call
            "0x",            // data: Data payload for optional delegate call
            "0x0000000000000000000000000000000000000000", // fallbackHandler: Handler for fallback calls
            "0x0000000000000000000000000000000000000000", // paymentToken: Token for payment (0 for ETH)
            0,               // payment: Value for payment
            "0x0000000000000000000000000000000000000000"  // paymentReceiver: Address for payment
        ]);
        
        // Create unique nonce for deployment
        const saltNonce = Date.now();
        
        console.log(`📝 Setup data: ${setupData.slice(0, 50)}...`);
        console.log(`🧂 Salt nonce: ${saltNonce}`);
        
        // Deploy the Safe
        const deployTx = await safeFactory.createProxyWithNonce(
            SAFE_MASTER_COPY,
            setupData,
            saltNonce
        );
        
        console.log(`⏳ Transaction hash: ${deployTx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await deployTx.wait();
        
        // Extract Safe address from events
        // The ProxyCreation event should contain the deployed proxy address
        let safeAddress = null;
        for (const log of receipt.logs) {
            try {
                // Try to decode as ProxyCreation event
                if (log.topics[0] === "0x4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235") {
                    safeAddress = ethers.utils.getAddress("0x" + log.topics[1].slice(26));
                    break;
                }
            } catch (e) {
                // Continue looking through logs
            }
        }
        
        // Fallback: use contract creation logic if event parsing fails
        if (!safeAddress) {
            // Calculate the deterministic address
            const abiCoder = ethers.utils.defaultAbiCoder;
            const salt = ethers.utils.keccak256(
                abiCoder.encode(
                    ["bytes32", "uint256"],
                    [ethers.utils.keccak256(setupData), saltNonce]
                )
            );
            
            safeAddress = ethers.utils.getCreate2Address(
                SAFE_FACTORY_ADDRESS,
                salt,
                ethers.utils.keccak256(
                    ethers.utils.concat([
                        "0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806101c26024913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061010e8061011d6000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c6964206d617374657220636f707920616464726573732070726f7669646564",
                        ethers.utils.defaultAbiCoder.encode(["address"], [SAFE_MASTER_COPY])
                    ])
                )
            );
        }
        
        console.log("\n✅ Multisig deployed successfully!");
        console.log(`📍 Safe Address: ${safeAddress}`);
        console.log(`🔍 BaseScan: https://sepolia.basescan.org/address/${safeAddress}`);
        console.log(`🌐 Safe UI: https://app.safe.global/sep:${safeAddress}/home`);
        
        // ===== VERIFICATION =====
        console.log("\n🔍 Verifying deployment...");
        
        // Check if contract exists
        const code = await ethers.provider.getCode(safeAddress);
        if (code === "0x") {
            throw new Error("❌ Safe contract not deployed - no code at address");
        }
        
        // Create Safe contract interface to verify configuration
        const safe = await ethers.getContractAt([
            "function getOwners() external view returns (address[] memory)",
            "function getThreshold() external view returns (uint256)",
            "function isOwner(address owner) external view returns (bool)"
        ], safeAddress);
        
        const deployedOwners = await safe.getOwners();
        const deployedThreshold = await safe.getThreshold();
        
        console.log(`✅ Owners verified: ${deployedOwners.length} owners`);
        console.log(`✅ Threshold verified: ${deployedThreshold}`);
        
        // Verify each owner
        for (let i = 0; i < owners.length; i++) {
            const isOwner = await safe.isOwner(owners[i]);
            if (isOwner) {
                console.log(`✅ Owner ${i + 1}: ${owners[i]} ✓`);
            } else {
                console.log(`❌ Owner ${i + 1}: ${owners[i]} ✗`);
            }
        }
        
        // ===== SAVE DEPLOYMENT INFO =====
        const deploymentInfo = {
            network: (await ethers.provider.getNetwork()).name,
            chainId: (await ethers.provider.getNetwork()).chainId,
            safeAddress: safeAddress,
            owners: owners,
            threshold: threshold,
            deploymentTx: deployTx.hash,
            deploymentBlock: receipt.blockNumber,
            timestamp: new Date().toISOString(),
            basescanUrl: `https://sepolia.basescan.org/address/${safeAddress}`,
            safeUIUrl: `https://app.safe.global/sep:${safeAddress}/home`
        };
        
        // Save to deployment file
        const deploymentFile = 'multisig-deployment.json';
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        console.log(`📁 Deployment info saved to: ${deploymentFile}`);
        
        // ===== NEXT STEPS =====
        console.log("\n🎯 Next Steps:");
        console.log("1. 🌐 Visit Safe UI:", deploymentInfo.safeUIUrl);
        console.log("2. 🔗 Connect all 3 wallets to the Safe");
        console.log("3. 🧪 Test a simple transaction (send small amount)");
        console.log("4. 🔄 Run transfer-admin script to give admin control to multisig");
        console.log("5. ✅ Test admin operations through multisig");
        
        console.log("\n📋 Important Information:");
        console.log(`Safe Address: ${safeAddress}`);
        console.log("Keep this address secure - it will control your protocol!");
        
        return {
            safeAddress,
            deploymentInfo,
            success: true
        };
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💰 Insufficient funds for deployment. Ensure deployer wallet has ETH for gas.");
        } else if (error.code === 'NETWORK_ERROR') {
            console.error("🌐 Network error. Check your RPC connection.");
        } else {
            console.error("🔍 Full error:", error);
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for module usage
module.exports = deployMultisig;

// Run directly if called from command line
if (require.main === module) {
    deployMultisig()
        .then((result) => {
            if (result.success) {
                console.log("\n🎉 Multisig deployment completed successfully!");
                process.exit(0);
            } else {
                console.log("\n💥 Multisig deployment failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("💥 Unexpected error:", error);
            process.exit(1);
        });
}