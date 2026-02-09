const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AnswerSharesCore to Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Deployer has no ETH! Please fund the wallet first.");
    process.exit(1);
  }

  // Configuration for Base Sepolia
  const config = {
    // Base Sepolia USDC (test token)
    usdcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    // Treasury - receives platform fees
    treasury: process.env.TREASURY_ADDRESS || deployer.address,
    // Admin - controls the contract
    admin: process.env.ADMIN_ADDRESS || deployer.address,
  };

  console.log("Configuration:");
  console.log("  USDC Token:", config.usdcToken);
  console.log("  Treasury:", config.treasury);
  console.log("  Admin:", config.admin);
  console.log("");

  // Deploy AnswerSharesCore as UUPS proxy
  console.log("📦 Deploying AnswerSharesCore proxy...");

  const AnswerSharesCore = await ethers.getContractFactory("AnswerSharesCore");

  const answerSharesCore = await upgrades.deployProxy(
    AnswerSharesCore,
    [config.usdcToken, config.treasury, config.admin],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await answerSharesCore.waitForDeployment();

  const proxyAddress = await answerSharesCore.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("\n✅ AnswerSharesCore deployed!");
  console.log("   Proxy address:", proxyAddress);
  console.log("   Implementation address:", implementationAddress);

  // Verify configuration
  console.log("\n🔍 Verifying configuration...");
  const usdcAddress = await answerSharesCore.usdcToken();
  const treasuryAddress = await answerSharesCore.treasury();
  const nextQuestionId = await answerSharesCore.nextQuestionId();
  const questionCreationFee = await answerSharesCore.questionCreationFee();
  const answerStake = await answerSharesCore.answerStake();
  const platformFeePercent = await answerSharesCore.platformFeePercent();
  const creatorFeePercent = await answerSharesCore.creatorFeePercent();

  console.log("   USDC Token:", usdcAddress);
  console.log("   Treasury:", treasuryAddress);
  console.log("   Next Question ID:", nextQuestionId.toString());
  console.log("   Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
  console.log("   Answer Stake:", ethers.formatUnits(answerStake, 6), "USDC");
  console.log("   Platform Fee:", platformFeePercent.toString(), "%");
  console.log("   Creator Fee:", creatorFeePercent.toString(), "%");

  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    chainId: 84532,
    deployer: deployer.address,
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    config: config,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update apps/shares/src/lib/contracts.ts with:");
  console.log(`   ANSWER_SHARES_CORE: "${proxyAddress}"`);
  console.log("2. Verify the contract on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${implementationAddress}`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
