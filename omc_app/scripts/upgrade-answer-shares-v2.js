const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Upgrading AnswerSharesCore on Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // Current proxy address on Base Sepolia
  const PROXY_ADDRESS = "0xb0461e420F65d711f84a7daA0E94893482435617";

  console.log("📦 Upgrading AnswerSharesCore proxy at:", PROXY_ADDRESS);
  console.log("");

  // Get the new implementation
  const AnswerSharesCoreV2 = await ethers.getContractFactory("AnswerSharesCore");

  // Upgrade the proxy to the new implementation
  console.log("⏳ Deploying new implementation and upgrading proxy...");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, AnswerSharesCoreV2, {
    kind: "uups",
  });

  await upgraded.waitForDeployment();

  const newImplAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);

  console.log("\n✅ AnswerSharesCore upgraded!");
  console.log("   Proxy address:", PROXY_ADDRESS);
  console.log("   New implementation:", newImplAddress);

  // Verify the upgrade by checking version
  const version = await upgraded.version();
  console.log("   Contract version:", version);

  // Verify state is preserved
  const nextQuestionId = await upgraded.nextQuestionId();
  const nextAnswerId = await upgraded.nextAnswerId();
  console.log("\n🔍 State verification:");
  console.log("   Next Question ID:", nextQuestionId.toString());
  console.log("   Next Answer ID:", nextAnswerId.toString());

  console.log("\n🎉 Upgrade complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Verify the implementation on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${newImplAddress}`);

  return {
    proxyAddress: PROXY_ADDRESS,
    implementationAddress: newImplAddress,
    version: version,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
