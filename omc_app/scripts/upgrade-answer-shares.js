const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔄 Upgrading AnswerSharesCore on Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // Existing proxy address from the previous deployment
  const PROXY_ADDRESS = "0xb0461e420F65d711f84a7daA0E94893482435617";

  console.log("📦 Upgrading AnswerSharesCore proxy at:", PROXY_ADDRESS);
  console.log("   New feature: createQuestionWithAnswer() function\n");

  // Get the new implementation contract factory
  const AnswerSharesCore = await ethers.getContractFactory("AnswerSharesCore");

  // Upgrade the proxy to the new implementation
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, AnswerSharesCore);
  await upgraded.waitForDeployment();

  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);

  console.log("\n✅ AnswerSharesCore upgraded!");
  console.log("   Proxy address:", PROXY_ADDRESS);
  console.log("   New implementation:", newImplementationAddress);

  // Verify the new function exists by checking version
  const version = await upgraded.version();
  console.log("   Contract version:", version);

  console.log("\n🎉 Upgrade complete!");
  console.log("\n📝 Changes in v1.1.0:");
  console.log("   - Added createQuestionWithAnswer() function");
  console.log("   - Questions now require at least one answer at creation");

  return {
    proxyAddress: PROXY_ADDRESS,
    implementationAddress: newImplementationAddress,
    version: version,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
