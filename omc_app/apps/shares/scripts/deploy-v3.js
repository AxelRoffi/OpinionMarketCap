const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("AnswerSharesCoreV3 Deployment to Base Sepolia");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\nDeployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.001")) {
    throw new Error("Insufficient ETH balance for deployment");
  }

  // Base Sepolia USDC (or use mock for testing)
  // Official Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = deployer.address; // Use deployer as treasury for testing

  console.log("\nConfiguration:");
  console.log("- USDC:", USDC_ADDRESS);
  console.log("- Treasury:", TREASURY_ADDRESS);

  console.log("\n[1/2] Deploying AnswerSharesCoreV3 proxy...");

  const AnswerSharesCoreV3 = await ethers.getContractFactory("AnswerSharesCoreV3");

  const proxy = await upgrades.deployProxy(
    AnswerSharesCoreV3,
    [USDC_ADDRESS, TREASURY_ADDRESS],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("✅ Proxy deployed at:", proxyAddress);

  // Get implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("✅ Implementation at:", implAddress);

  console.log("\n[2/2] Verifying deployment...");

  // Read back configuration
  const questionCreationFee = await proxy.questionCreationFee();
  const answerProposalStake = await proxy.answerProposalStake();
  const platformFeePercent = await proxy.platformFeePercent();
  const creatorFeePercent = await proxy.creatorFeePercent();
  const kingFeePercent = await proxy.kingFeePercent();
  const kingFlipThreshold = await proxy.kingFlipThresholdBps();
  const graduationThreshold = await proxy.graduationThreshold();
  const bootstrapThreshold = await proxy.BOOTSTRAP_THRESHOLD();
  const maxMultiplier = await proxy.MAX_MULTIPLIER();

  console.log("\nContract Configuration:");
  console.log("- Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
  console.log("- Answer Proposal Stake:", ethers.formatUnits(answerProposalStake, 6), "USDC");
  console.log("- Platform Fee:", platformFeePercent.toString(), "%");
  console.log("- Creator Fee:", creatorFeePercent.toString() / 10, "%");
  console.log("- King Fee:", kingFeePercent.toString() / 10, "%");
  console.log("- King Flip Threshold:", kingFlipThreshold.toString() / 100, "%");
  console.log("- Graduation Threshold:", ethers.formatUnits(graduationThreshold, 6), "USDC");
  console.log("- Bootstrap Threshold:", ethers.formatUnits(bootstrapThreshold, 6), "USDC");
  console.log("- Max Multiplier:", maxMultiplier.toString(), "x");

  // Check roles
  const ADMIN_ROLE = await proxy.ADMIN_ROLE();
  const hasAdminRole = await proxy.hasRole(ADMIN_ROLE, deployer.address);
  console.log("\nRoles:");
  console.log("- Deployer has ADMIN_ROLE:", hasAdminRole);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("=".repeat(60));
  console.log("\nAddresses to save:");
  console.log(`PROXY_ADDRESS=${proxyAddress}`);
  console.log(`IMPLEMENTATION_ADDRESS=${implAddress}`);
  console.log(`USDC_ADDRESS=${USDC_ADDRESS}`);
  console.log(`TREASURY_ADDRESS=${TREASURY_ADDRESS}`);

  // Save to file
  const fs = require("fs");
  const deploymentInfo = {
    network: "baseSepolia",
    chainId: 84532,
    timestamp: new Date().toISOString(),
    contracts: {
      proxy: proxyAddress,
      implementation: implAddress
    },
    config: {
      usdc: USDC_ADDRESS,
      treasury: TREASURY_ADDRESS,
      questionCreationFee: questionCreationFee.toString(),
      answerProposalStake: answerProposalStake.toString(),
      platformFeePercent: platformFeePercent.toString(),
      creatorFeePercent: creatorFeePercent.toString(),
      kingFeePercent: kingFeePercent.toString(),
      kingFlipThresholdBps: kingFlipThreshold.toString(),
      graduationThreshold: graduationThreshold.toString()
    }
  };

  fs.writeFileSync(
    "deployments/base-sepolia-v3.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployments/base-sepolia-v3.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
