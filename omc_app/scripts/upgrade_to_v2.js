const { ethers } = require("hardhat");

async function main() {
    const PROXY_ADDRESS = "0x65BF4593333e7b290a7A99899e3F0350A0E3fA31"; // V1 Proxy
    // REPLACE THIS WITH THE DEPLOYED V2 IMPLEMENTATION ADDRESS
    const V2_IMPL_ADDRESS = "REPLACE_WITH_V2_IMPL_ADDRESS";

    if (V2_IMPL_ADDRESS === "REPLACE_WITH_V2_IMPL_ADDRESS") {
        console.error("Please set the V2_IMPL_ADDRESS in the script!");
        process.exit(1);
    }

    console.log("Starting Phase 2 Upgrade: V1 Proxy -> V2 Implementation");
    console.log("Proxy Address:", PROXY_ADDRESS);
    console.log("V2 Implementation Address:", V2_IMPL_ADDRESS);

    const [deployer] = await ethers.getSigners();
    console.log("Upgrading with account:", deployer.address);

    // Attach to Proxy
    const Proxy = await ethers.getContractAt("MinimalOpinionCoreUpgradeable", PROXY_ADDRESS);

    console.log("Executing upgradeTo...");
    try {
        const tx = await Proxy.upgradeTo(V2_IMPL_ADDRESS);
        console.log("Upgrade transaction sent:", tx.hash);
        await tx.wait();
        console.log("Upgrade confirmed!");

        // Verify Upgrade
        console.log("Verifying upgrade...");
        const V2Proxy = await ethers.getContractAt("OpinionCoreV2_Final", PROXY_ADDRESS);
        try {
            const version = await V2Proxy.version();
            console.log("New Contract Version:", version);
            if (version === "2.0.0") {
                console.log("SUCCESS: Upgrade to V2 verified!");
            } else {
                console.log("WARNING: Version mismatch!");
            }
        } catch (e) {
            console.log("Verification failed (version() call):", e.message);
        }
    } catch (e) {
        console.error("Upgrade failed:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
