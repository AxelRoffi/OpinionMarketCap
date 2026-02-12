const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying AnswerSharesCore to Base Sepolia (Manual Deploy)...\n");

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
    usdcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    treasury: process.env.TREASURY_ADDRESS || deployer.address,
    admin: process.env.ADMIN_ADDRESS || deployer.address,
  };

  console.log("Configuration:");
  console.log("  USDC Token:", config.usdcToken);
  console.log("  Treasury:", config.treasury);
  console.log("  Admin:", config.admin);
  console.log("");

  // Step 1: Deploy Implementation
  console.log("📦 Step 1: Deploying AnswerSharesCore implementation...");
  const AnswerSharesCore = await ethers.getContractFactory("AnswerSharesCore");
  const implementation = await AnswerSharesCore.deploy();
  await implementation.waitForDeployment();
  const implAddress = await implementation.getAddress();
  console.log("   Implementation deployed at:", implAddress);

  // Step 2: Deploy ERC1967 Proxy
  console.log("📦 Step 2: Deploying ERC1967 Proxy...");

  // Encode initialize call
  const initData = AnswerSharesCore.interface.encodeFunctionData("initialize", [
    config.usdcToken,
    config.treasury,
    config.admin,
  ]);

  // Get AnswerSharesProxy (wrapper for ERC1967Proxy)
  const AnswerSharesProxy = await ethers.getContractFactory("AnswerSharesProxy");
  const proxy = await AnswerSharesProxy.deploy(implAddress, initData);
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("   Proxy deployed at:", proxyAddress);

  // Step 3: Connect to proxy and verify
  console.log("\n🔍 Verifying configuration...");
  const answerSharesCore = AnswerSharesCore.attach(proxyAddress);

  const usdcAddress = await answerSharesCore.usdcToken();
  const treasuryAddress = await answerSharesCore.treasury();
  const nextQuestionId = await answerSharesCore.nextQuestionId();
  const questionCreationFee = await answerSharesCore.questionCreationFee();
  const answerProposalStake = await answerSharesCore.answerProposalStake();
  const platformFeeBps = await answerSharesCore.platformFeeBps();
  const creatorFeeBps = await answerSharesCore.creatorFeeBps();
  const contractVersion = await answerSharesCore.version();

  console.log("   USDC Token:", usdcAddress);
  console.log("   Treasury:", treasuryAddress);
  console.log("   Next Question ID:", nextQuestionId.toString());
  console.log("   Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
  console.log("   Answer Proposal Stake:", ethers.formatUnits(answerProposalStake, 6), "USDC");
  console.log("   Platform Fee:", platformFeeBps.toString(), "bps (", Number(platformFeeBps) / 100, "%)");
  console.log("   Creator Fee:", creatorFeeBps.toString(), "bps (", Number(creatorFeeBps) / 100, "%)");
  console.log("   Contract Version:", contractVersion);

  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    chainId: 84532,
    deployer: deployer.address,
    proxyAddress: proxyAddress,
    implementationAddress: implAddress,
    config: config,
    version: contractVersion,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update apps/shares/src/lib/contracts.ts with:");
  console.log(`   ANSWER_SHARES_CORE: "${proxyAddress}"`);
  console.log("2. Verify the contract on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${implAddress}`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
