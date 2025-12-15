import { ethers, upgrades } from "hardhat";
import { run } from "hardhat";

// Verification helper
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

async function main() {
    console.log("Starting new deployment process...");

    // Hard-coded deployer address to ensure roles are assigned correctly
    const deployerAddress = "0xa56436FC54B8201a2a5340f16be693B3711Bf9c1";
    
    // Get the signer (your account)
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Verify deployer address matches expected address
    if (deployer.address.toLowerCase() !== deployerAddress.toLowerCase()) {
        console.error("WARNING: Current deployer doesn't match the expected address!");
        console.error("Expected:", deployerAddress);
        console.error("Actual:", deployer.address);
        // Continue anyway, but with a warning
    }

    // Get the OpinionMarket contract factory
    const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
    console.log("Deploying OpinionMarket...");

    // For ethers v6, use this for zero address
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    // Deploy as upgradeable (UUPS pattern)
    // Include explicit role initialization in initialize call
    const opinionMarket = await upgrades.deployProxy(OpinionMarket,
        [zeroAddress], // Only pass the USDC token address
        {
            initializer: 'initialize',
            kind: 'uups'
        }
    );

    await opinionMarket.waitForDeployment();
    const contractAddress = await opinionMarket.getAddress();
    console.log("OpinionMarket deployed to:", contractAddress);

    // Verify that the contract was initialized correctly
    const owner = await opinionMarket.owner();
    console.log("Contract owner:", owner);
    console.log("Expected owner:", deployerAddress);

    // Check role assignments
    const ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await opinionMarket.DEFAULT_ADMIN_ROLE();
    const MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
    
    const hasDefaultAdminRole = await opinionMarket.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    const hasAdminRole = await opinionMarket.hasRole(ADMIN_ROLE, deployer.address);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
    const hasModeratorRole = await opinionMarket.hasRole(MODERATOR_ROLE, deployerAddress);
    
    console.log("Has DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
    console.log("Has MODERATOR_ROLE:", hasModeratorRole);

    // If roles are not assigned, explicitly grant them
    if (!hasDefaultAdminRole || !hasAdminRole || !hasModeratorRole) {
        console.log("Some roles are missing. Attempting to grant roles...");
        
        if (!hasDefaultAdminRole) {
            console.log("Granting DEFAULT_ADMIN_ROLE...");
            await opinionMarket.grantRole(DEFAULT_ADMIN_ROLE, deployerAddress);
        }
        
        if (!hasAdminRole) {
            console.log("Granting ADMIN_ROLE...");
            await opinionMarket.grantRole(ADMIN_ROLE, deployerAddress);
        }
        
        if (!hasModeratorRole) {
            console.log("Granting MODERATOR_ROLE...");
            await opinionMarket.grantRole(MODERATOR_ROLE, deployerAddress);
        }
        
        // Verify roles were assigned correctly
        console.log("Verifying role assignment...");
        const hasAdminRoleAfter = await opinionMarket.hasRole(ADMIN_ROLE, deployerAddress);
        console.log("Has ADMIN_ROLE after granting:", hasAdminRoleAfter);
    }

    // Set USDC token address
    console.log("Setting USDC address...");
    const tx = await opinionMarket.setUsdcToken("0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    await tx.wait();
    console.log("USDC address set successfully!");

    // Verify contract on block explorer
    try {
        console.log("Verifying contract on block explorer...");
        // For UUPS proxies, we need to verify both implementation and proxy
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(
            contractAddress
        );
        
        await verify(implementationAddress, []);
        console.log(`Implementation verified at ${implementationAddress}`);
        
        // Verify proxy
        await verify(contractAddress, []);
        console.log(`Proxy verified at ${contractAddress}`);
    } catch (error) {
        console.error("Error during verification:", error);
    }

    console.log("Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });