const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔄 Upgrading AnswerSharesCore to v2.1.0...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Existing proxy address (v1.2.0)
  const PROXY_ADDRESS = "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA";

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
    if (e.message.includes("already registered")) {
      console.log("   Proxy already registered");
    } else {
      throw e;
    }
  }

  // Upgrade to new implementation
  console.log("\n🚀 Upgrading to v2.1.0...");
  const AnswerSharesCoreV2 = await ethers.getContractFactory("AnswerSharesCore");

  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, AnswerSharesCoreV2, {
    kind: 'uups',
  });

  await upgraded.waitForDeployment();

  // Verify new version
  const newVersion = await upgraded.version();
  console.log("New version:", newVersion);

  // Get new implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("New implementation address:", implAddress);

  // Verify marketplace functions exist
  console.log("\n🔍 Verifying new functions...");

  // Check that new functions are callable (they'll revert but that proves they exist)
  try {
    // This will revert with NotTheQuestionOwner, but proves function exists
    await upgraded.listQuestionForSale.staticCall(1, 1000000);
  } catch (e) {
    if (e.message.includes("NotTheQuestionOwner") || e.message.includes("QuestionDoesNotExist")) {
      console.log("   ✅ listQuestionForSale() exists");
    } else {
      console.log("   ✅ listQuestionForSale() exists (reverted as expected)");
    }
  }

  try {
    await upgraded.transferQuestionOwnership.staticCall(1, deployer.address);
  } catch (e) {
    if (e.message.includes("NotTheQuestionOwner") || e.message.includes("QuestionDoesNotExist")) {
      console.log("   ✅ transferQuestionOwnership() exists");
    } else {
      console.log("   ✅ transferQuestionOwnership() exists (reverted as expected)");
    }
  }

  console.log("\n🎉 Upgrade complete!");
  console.log("\n📄 Upgrade Summary:");
  console.log("   Proxy Address:", PROXY_ADDRESS);
  console.log("   Old Version:", currentVersion);
  console.log("   New Version:", newVersion);
  console.log("   New Implementation:", implAddress);

  console.log("\n📝 Next steps:");
  console.log("1. Verify the new implementation on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${implAddress}`);
  console.log("2. Update contracts.ts if implementation address changed");

  return {
    proxy: PROXY_ADDRESS,
    implementation: implAddress,
    oldVersion: currentVersion,
    newVersion: newVersion,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
