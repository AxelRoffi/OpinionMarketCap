const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔄 Upgrading AnswerSharesCore with volume tracking fix...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Current proxy address (fresh v2.1.0 deploy)
  const PROXY_ADDRESS = "0x43C8f0774b7635cf16eCf2238b974ad3b0370937";

  console.log("Proxy to upgrade:", PROXY_ADDRESS);

  // Get current version before upgrade
  const currentContract = await ethers.getContractAt("AnswerSharesCore", PROXY_ADDRESS);
  const currentVersion = await currentContract.version();
  console.log("Current version:", currentVersion);

  // Force import the existing proxy into OpenZeppelin's manifest
  console.log("\n📦 Registering existing proxy with OpenZeppelin...");
  const AnswerSharesCoreV1 = await ethers.getContractFactory("AnswerSharesCore");

  try {
    await upgrades.forceImport(PROXY_ADDRESS, AnswerSharesCoreV1, {
      kind: 'uups'
    });
    console.log("   Proxy registered successfully");
  } catch (e) {
    if (e.message.includes("already registered") || e.message.includes("already imported")) {
      console.log("   Proxy already registered");
    } else {
      throw e;
    }
  }

  // Upgrade to new implementation
  console.log("\n🚀 Upgrading with volume tracking fix...");
  const AnswerSharesCoreNew = await ethers.getContractFactory("AnswerSharesCore");

  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, AnswerSharesCoreNew, {
    kind: 'uups',
  });

  await upgraded.waitForDeployment();

  // Verify new version
  const newVersion = await upgraded.version();
  console.log("New version:", newVersion);

  // Get new implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("New implementation address:", implAddress);

  console.log("\n🎉 Upgrade complete!");
  console.log("\n📝 Volume fix applied:");
  console.log("   - sellShares() now adds grossReturn to question.totalVolume");
  console.log("   - Volume = sum of all buy + sell trades");

  return {
    proxy: PROXY_ADDRESS,
    implementation: implAddress,
    version: newVersion,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
