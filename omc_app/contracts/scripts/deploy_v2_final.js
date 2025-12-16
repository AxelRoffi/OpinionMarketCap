const { ethers, upgrades, run } = require("hardhat");

async function main() {
    console.log("Starting Phase 2 Deployment: OpinionCoreV2_Final");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy ValidationLibrary
    console.log("\n1. Deploying ValidationLibrary...");
    const ValidationLibrary = await ethers.getContractFactory("ValidationLibrary");
    const validationLib = await ValidationLibrary.deploy();
    await validationLib.waitForDeployment();
    const validationLibAddress = await validationLib.getAddress();
    console.log("ValidationLibrary deployed to:", validationLibAddress);

    // 2. Deploy PriceCalculator
    console.log("\n2. Deploying PriceCalculator...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalc = await PriceCalculator.deploy();
    await priceCalc.waitForDeployment();
    const priceCalcAddress = await priceCalc.getAddress();
    console.log("PriceCalculator deployed to:", priceCalcAddress);

    // 3. Deploy OpinionCoreV2_Final Implementation
    console.log("\n3. Deploying OpinionCoreV2_Final Implementation...");

    // Link libraries
    const OpinionCoreV2 = await ethers.getContractFactory("OpinionCoreV2_Final", {
        libraries: {
            ValidationLibrary: validationLibAddress,
            PriceCalculator: priceCalcAddress,
        },
    });

    // Deploy implementation directly (not proxy yet)
    // We use upgrades.deployImplementation if we want to use the plugin's checks
    // But for manual control and verification, we can just deploy it.
    // However, to use upgradeProxy later, we usually need the implementation address.

    // Let's use a standard deployment for the implementation to ensure verification works easily
    const v2Impl = await OpinionCoreV2.deploy();
    await v2Impl.waitForDeployment();
    const v2ImplAddress = await v2Impl.getAddress();
    console.log("OpinionCoreV2_Final Implementation deployed to:", v2ImplAddress);

    // 4. Verify Contracts
    console.log("\n4. Verifying contracts...");

    try {
        await run("verify:verify", {
            address: validationLibAddress,
        });
        console.log("ValidationLibrary verified");
    } catch (e) {
        console.log("ValidationLibrary verification failed:", e.message);
    }

    try {
        await run("verify:verify", {
            address: priceCalcAddress,
        });
        console.log("PriceCalculator verified");
    } catch (e) {
        console.log("PriceCalculator verification failed:", e.message);
    }

    try {
        await run("verify:verify", {
            address: v2ImplAddress,
            libraries: {
                ValidationLibrary: validationLibAddress,
                PriceCalculator: priceCalcAddress,
            }
        });
        console.log("OpinionCoreV2_Final verified");
    } catch (e) {
        console.log("OpinionCoreV2_Final verification failed:", e.message);
    }

    console.log("\nDeployment Complete!");
    console.log("----------------------------------------------------");
    console.log("ValidationLibrary:", validationLibAddress);
    console.log("PriceCalculator:", priceCalcAddress);
    console.log("OpinionCoreV2 Implementation:", v2ImplAddress);
    console.log("----------------------------------------------------");
    console.log("NEXT STEP: Run upgrade script to point Proxy to V2 Implementation");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
