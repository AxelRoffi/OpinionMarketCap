import { ethers, upgrades } from "hardhat";
import { run } from "hardhat";

// Verification helper
async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

async function deployContract(contractName: string, args: any[] = [], libraries: any = {}) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  const ContractFactory = await ethers.getContractFactory(contractName, { libraries });
  const contract = await ContractFactory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${contractName} deployed at: ${address}`);
  return { contract, address };
}

async function main() {
    console.log("🔄 Continuing OpinionMarketCap V1 Modular Deployment...\n");

    // Configuration
    const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // ========================================
    // EXISTING LIBRARY ADDRESSES (Already deployed)
    // ========================================
    console.log("\n=== USING EXISTING LIBRARIES ===");
    
    const inputValidationLib = "0x34F55EA72565B97b6159Decb69410A0FF4C1Fa62";
    const mevProtectionLib = "0xE57e1058da1A8c80BC94E1994Dc75ffd5962C7c2";
    const priceCalculatorLib = "0xb65Dd52e1f3e7C6f4667D9B26Ebb26C27b4aa0Aa";
    const feeCalculatorLib = "0x1186DE3B426F5338AFb3d2293252abbD7f4daB67";
    const poolLibraryLib = "0xf1eA1e3ac4Ea1F163F9473Ac98824745c8C1402a";
    const monitoringLibraryLib = "0x2A41d67FcCc92FdA1451bbd3B996B4c5312C5A4B";
    const validationLibraryLib = "0xa7074c020c4B1740BC7e0d6E848DC9262022550e";

    console.log("✅ Using 7 existing libraries from previous deployment");

    // ========================================
    // PHASE 2: Deploy Modular Contracts
    // ========================================
    console.log("\n=== PHASE 2: DEPLOYING MODULAR CONTRACTS ===");

    // 2.1 Deploy MonitoringManager
    const { contract: monitoringManager, address: monitoringManagerAddress } = 
        await deployContract("MonitoringManager");

    // 2.2 Deploy SecurityManager  
    const { contract: securityManager, address: securityManagerAddress } = 
        await deployContract("SecurityManager", [], {
            InputValidation: inputValidationLib,
            MevProtection: mevProtectionLib,
            PriceCalculator: priceCalculatorLib
        });

    // 2.3 Deploy OpinionCoreSimplified
    const { contract: opinionCore, address: opinionCoreAddress } = 
        await deployContract("OpinionCoreSimplified", [], {
            PriceCalculator: priceCalculatorLib
        });

    // 2.4 Deploy FeeManager
    const { contract: feeManager, address: feeManagerAddress } = 
        await deployContract("FeeManager");

    // 2.5 Deploy PoolManager 
    const { contract: poolManager, address: poolManagerAddress } = 
        await deployContract("PoolManager");

    console.log("\n✅ All modular contracts deployed!");

    // ========================================
    // PHASE 3: Deploy Main OpinionMarket (UUPS Proxy)
    // ========================================
    console.log("\n=== PHASE 3: DEPLOYING OPINION MARKET (UUPS PROXY) ===");

    const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
    const opinionMarket = await upgrades.deployProxy(OpinionMarket, [
        USDC_BASE_SEPOLIA,              // _usdcToken
        opinionCoreAddress,             // _opinionCore
        feeManagerAddress,              // _feeManager
        poolManagerAddress,             // _poolManager
        monitoringManagerAddress,       // _monitoringManager
        securityManagerAddress,         // _securityManager
        deployer.address                // _treasury
    ], {
        initializer: 'initialize',
        kind: 'uups'
    });

    await opinionMarket.waitForDeployment();
    const opinionMarketAddress = await opinionMarket.getAddress();
    console.log("OpinionMarket (Proxy) deployed at:", opinionMarketAddress);

    // ========================================
    // PHASE 4: Initialize Cross-References
    // ========================================
    console.log("\n=== PHASE 4: SETTING UP CROSS-REFERENCES ===");

    // 4.1 Initialize MonitoringManager
    console.log("\n🔧 Initializing MonitoringManager...");
    await monitoringManager.initialize(
        opinionCoreAddress,     // _opinionCore
        USDC_BASE_SEPOLIA,      // _usdcToken
        deployer.address        // _treasury
    );

    // 4.2 Initialize SecurityManager
    console.log("🔧 Initializing SecurityManager...");
    await securityManager.initialize(
        opinionCoreAddress,     // _opinionCore
        USDC_BASE_SEPOLIA,      // _usdcToken
        deployer.address        // _treasury
    );

    // 4.3 Initialize OpinionCore with all dependencies
    console.log("🔧 Initializing OpinionCoreSimplified...");
    await opinionCore.initialize(
        USDC_BASE_SEPOLIA,              // _usdcToken
        opinionMarketAddress,           // _opinionMarket
        feeManagerAddress,              // _feeManager
        poolManagerAddress,             // _poolManager
        monitoringManagerAddress,       // _monitoringManager (optional)
        securityManagerAddress,         // _securityManager (optional)
        deployer.address                // _treasury
    );

    // 4.4 Initialize FeeManager
    console.log("🔧 Initializing FeeManager...");
    await feeManager.initialize(
        USDC_BASE_SEPOLIA,      // _usdcToken
        deployer.address        // _treasury
    );
    
    // Grant core contract role to OpinionCore
    const CORE_CONTRACT_ROLE_2 = ethers.keccak256(ethers.toUtf8Bytes("CORE_CONTRACT_ROLE"));
    await feeManager.grantRole(CORE_CONTRACT_ROLE_2, opinionCoreAddress);

    // 4.5 Initialize PoolManager
    console.log("🔧 Initializing PoolManager...");
    await poolManager.initialize(
        opinionCoreAddress,     // _opinionCore
        feeManagerAddress,      // _feeManager
        USDC_BASE_SEPOLIA,      // _usdcToken
        deployer.address,       // _treasury
        deployer.address        // _admin
    );

    console.log("\n✅ All cross-references configured!");

    // ========================================
    // PHASE 5: Grant Access Control Roles
    // ========================================
    console.log("\n=== PHASE 5: CONFIGURING ACCESS CONTROL ===");

    // Grant roles to OpinionMarket in all contracts
    const OPINION_MARKET_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPINION_MARKET_ROLE"));
    const CORE_CONTRACT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CORE_CONTRACT_ROLE"));

    console.log("🔐 Granting roles to OpinionMarket...");
    await monitoringManager.grantRole(CORE_CONTRACT_ROLE, opinionCoreAddress);
    await securityManager.grantRole(CORE_CONTRACT_ROLE, opinionCoreAddress);
    await opinionCore.grantRole(OPINION_MARKET_ROLE, opinionMarketAddress);
    await feeManager.grantRole(OPINION_MARKET_ROLE, opinionMarketAddress);
    await poolManager.grantRole(OPINION_MARKET_ROLE, opinionMarketAddress);

    console.log("✅ Access control configured!");

    // ========================================
    // PHASE 6: Verification & Summary
    // ========================================
    console.log("\n=== PHASE 6: DEPLOYMENT SUMMARY ===");

    const deploymentSummary = {
        "USDC Token (Base Sepolia)": USDC_BASE_SEPOLIA,
        "Treasury/Deployer": deployer.address,
        "Libraries": {
            "InputValidation": inputValidationLib,
            "MevProtection": mevProtectionLib,
            "PriceCalculator": priceCalculatorLib,
            "FeeCalculator": feeCalculatorLib,
            "PoolLibrary": poolLibraryLib,
            "MonitoringLibrary": monitoringLibraryLib,
            "ValidationLibrary": validationLibraryLib
        },
        "Core Contracts": {
            "OpinionMarket (Proxy)": opinionMarketAddress,
            "OpinionCoreSimplified": opinionCoreAddress,
            "FeeManager": feeManagerAddress,
            "PoolManager": poolManagerAddress,
            "MonitoringManager": monitoringManagerAddress,
            "SecurityManager": securityManagerAddress
        }
    };

    console.log(JSON.stringify(deploymentSummary, null, 2));

    // Contract size verification
    console.log("\n=== CONTRACT SIZE VERIFICATION ===");
    const contracts = [
        { name: "OpinionCoreSimplified", address: opinionCoreAddress },
        { name: "MonitoringManager", address: monitoringManagerAddress },
        { name: "SecurityManager", address: securityManagerAddress },
        { name: "FeeManager", address: feeManagerAddress },
        { name: "PoolManager", address: poolManagerAddress }
    ];

    for (const contract of contracts) {
        const code = await ethers.provider.getCode(contract.address);
        const sizeInBytes = (code.length - 2) / 2; // Remove 0x prefix and convert hex to bytes
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const status = sizeInBytes <= 24576 ? "✅ PASS" : "❌ FAIL"; // 24KB limit
        console.log(`${contract.name}: ${sizeInKB} KB ${status}`);
    }

    // Final balance check
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    console.log("\n💰 Final account balance:", ethers.formatEther(finalBalance), "ETH");

    console.log("\n🎉 OpinionMarketCap V1 Modular Deployment Complete!");
    console.log("🌟 Successfully deployed to Base Sepolia testnet!");
    console.log("🔗 Main contract address:", opinionMarketAddress);

    // Save deployment info to file
    const fs = require('fs');
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        network: "baseSepolia",
        chainId: 84532,
        addresses: deploymentSummary,
        deployer: deployer.address,
        gasUsed: ethers.formatEther(ethers.parseEther("0.051") - finalBalance) + " ETH"
    };
    
    fs.writeFileSync('./deployment-base-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment-base-sepolia.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });