const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

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

  // Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = deployer.address; // Use deployer as treasury for testing
  const ADMIN_ADDRESS = deployer.address;    // Use deployer as admin for testing

  console.log("\nConfiguration:");
  console.log("- USDC:", USDC_ADDRESS);
  console.log("- Treasury:", TREASURY_ADDRESS);
  console.log("- Admin:", ADMIN_ADDRESS);

  console.log("\n[1/2] Deploying AnswerSharesCoreV3 proxy...");

  const AnswerSharesCoreV3 = await ethers.getContractFactory("AnswerSharesCoreV3");

  const proxy = await upgrades.deployProxy(
    AnswerSharesCoreV3,
    [USDC_ADDRESS, TREASURY_ADDRESS, ADMIN_ADDRESS],
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

  // Read back configuration (using correct V3 function names)
  const questionCreationFee = await proxy.questionCreationFee();
  const answerProposalStake = await proxy.answerProposalStake();
  const platformFeeBps = await proxy.platformFeeBps();
  const creatorFeeBps = await proxy.creatorFeeBps();
  const kingFeeBps = await proxy.kingFeeBps();
  const kingFlipThreshold = await proxy.kingFlipThresholdBps();
  const graduationThreshold = await proxy.graduationThreshold();
  const bootstrapThreshold = await proxy.bootstrapThreshold();
  const maxMultiplier = await proxy.maxMultiplier();
  const baseAnswerLimit = await proxy.baseAnswerLimit();
  const maxAnswerLimit = await proxy.maxAnswerLimit();
  const volumePerSlot = await proxy.volumePerSlot();
  const contractVersion = await proxy.version();

  console.log("\nContract Configuration:");
  console.log("- Version:", contractVersion);
  console.log("- Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
  console.log("- Answer Proposal Stake:", ethers.formatUnits(answerProposalStake, 6), "USDC");
  console.log("- Platform Fee:", Number(platformFeeBps) / 100, "%");
  console.log("- Creator Fee:", Number(creatorFeeBps) / 100, "%");
  console.log("- King Fee:", Number(kingFeeBps) / 100, "%");
  console.log("- Total Fee:", (Number(platformFeeBps) + Number(creatorFeeBps) + Number(kingFeeBps)) / 100, "%");
  console.log("- King Flip Threshold:", Number(kingFlipThreshold) / 100, "%");
  console.log("- Graduation Threshold:", ethers.formatUnits(graduationThreshold, 6), "USDC");
  console.log("- Bootstrap Threshold:", ethers.formatUnits(bootstrapThreshold, 6), "USDC");
  console.log("- Max Multiplier:", maxMultiplier.toString(), "x");
  console.log("- Base Answer Limit:", baseAnswerLimit.toString());
  console.log("- Max Answer Limit:", maxAnswerLimit.toString());
  console.log("- Volume Per Slot:", ethers.formatUnits(volumePerSlot, 6), "USDC");

  // Check roles
  const ADMIN_ROLE = await proxy.ADMIN_ROLE();
  const MODERATOR_ROLE = await proxy.MODERATOR_ROLE();
  const TREASURY_ROLE = await proxy.TREASURY_ROLE();
  console.log("\nRoles:");
  console.log("- Deployer has ADMIN_ROLE:", await proxy.hasRole(ADMIN_ROLE, deployer.address));
  console.log("- Deployer has MODERATOR_ROLE:", await proxy.hasRole(MODERATOR_ROLE, deployer.address));
  console.log("- Deployer has TREASURY_ROLE:", await proxy.hasRole(TREASURY_ROLE, deployer.address));

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("=".repeat(60));
  console.log("\nAddresses to save:");
  console.log(`PROXY_ADDRESS=${proxyAddress}`);
  console.log(`IMPLEMENTATION_ADDRESS=${implAddress}`);
  console.log(`USDC_ADDRESS=${USDC_ADDRESS}`);
  console.log(`TREASURY_ADDRESS=${TREASURY_ADDRESS}`);

  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: "baseSepolia",
    chainId: 84532,
    timestamp: new Date().toISOString(),
    version: contractVersion,
    contracts: {
      proxy: proxyAddress,
      implementation: implAddress
    },
    config: {
      usdc: USDC_ADDRESS,
      treasury: TREASURY_ADDRESS,
      admin: ADMIN_ADDRESS,
      questionCreationFee: questionCreationFee.toString(),
      answerProposalStake: answerProposalStake.toString(),
      platformFeeBps: platformFeeBps.toString(),
      creatorFeeBps: creatorFeeBps.toString(),
      kingFeeBps: kingFeeBps.toString(),
      kingFlipThresholdBps: kingFlipThreshold.toString(),
      graduationThreshold: graduationThreshold.toString(),
      bootstrapThreshold: bootstrapThreshold.toString(),
      maxMultiplier: maxMultiplier.toString(),
      baseAnswerLimit: baseAnswerLimit.toString(),
      maxAnswerLimit: maxAnswerLimit.toString(),
      volumePerSlot: volumePerSlot.toString()
    }
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "base-sepolia-v3.json"),
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
