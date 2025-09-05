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

async function deployLibrary(libraryName: string) {
  console.log(`\n📚 Deploying ${libraryName} library...`);
  const LibraryFactory = await ethers.getContractFactory(libraryName);
  const library = await LibraryFactory.deploy();
  await library.waitForDeployment();
  const address = await library.getAddress();
  console.log(`${libraryName} library deployed at: ${address}`);
  return address;
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
    console.log("🌟 Starting OpinionMarketCap V1 Modular Deployment...\n");

    // Configuration
    const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const deployerAddress = "0x7C91BaE430b526f2913969e306958cF66922426A"; // Burner wallet
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    if (deployer.address.toLowerCase() !== deployerAddress.toLowerCase()) {
        console.error("⚠️  WARNING: Deployer address mismatch!");
        console.error("Expected:", deployerAddress);
        console.error("Actual:", deployer.address);
    }

    // ========================================
    // PHASE 1: Deploy Libraries
    // ========================================
    console.log("\n=== PHASE 1: DEPLOYING LIBRARIES ===");
    
    const inputValidationLib = await deployLibrary("InputValidation");
    const mevProtectionLib = await deployLibrary("MevProtection");
    const priceCalculatorLib = await deployLibrary("PriceCalculator");
    const feeCalculatorLib = await deployLibrary("FeeCalculator");
    const poolLibraryLib = await deployLibrary("PoolLibrary");
    const monitoringLibraryLib = await deployLibrary("MonitoringLibrary");
    const validationLibraryLib = await deployLibrary("ValidationLibrary");

    console.log("\n✅ All libraries deployed successfully!");

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
        opinionCoreAddress,     // _opinionCore
        opinionMarketAddress,   // _opinionMarket
        poolManagerAddress,     // _poolManager
        deployer.address        // _treasury
    );

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

    console.log("\n🎉 OpinionMarketCap V1 Modular Deployment Complete!");
    console.log("Ready for Base Sepolia testnet deployment!");

    // Save deployment info to file
    const fs = require('fs');
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        network: "hardhat", // Will be base-sepolia when deployed
        addresses: deploymentSummary
    };
    
    fs.writeFileSync('./deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });