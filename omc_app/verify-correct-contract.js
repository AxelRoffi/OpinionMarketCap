const { run, ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🔍 Debugging BaseScan Verification Issue\n");
    
    const CONTRACT_ADDRESS = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    
    // First, let's check what's actually deployed
    console.log("📋 Checking deployed contract...");
    const deployedCode = await ethers.provider.getCode(CONTRACT_ADDRESS);
    console.log(`Deployed bytecode size: ${deployedCode.length / 2} bytes`);
    
    // Check our local compilation
    const artifact = require("./artifacts/contracts/core/OpinionCoreNoMod.sol/OpinionCoreNoMod.json");
    console.log(`\n📦 Local compilation info:`);
    console.log(`Contract name: ${artifact.contractName}`);
    console.log(`Compiler: ${artifact.compiler.version}`);
    console.log(`Source: contracts/core/OpinionCoreNoMod.sol`);
    
    // The ACTUAL contract name is OpinionCoreNoMod (not OpinionCoreSimplified)
    console.log("\n🚀 Attempting verification with CORRECT contract name...");
    
    try {
        await run("verify:verify", {
            address: CONTRACT_ADDRESS,
            contract: "contracts/core/OpinionCoreNoMod.sol:OpinionCoreNoMod",
            libraries: {
                PriceCalculator: "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"
            }
        });
        
        console.log("✅ Verification successful!");
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        if (error.message.includes("Stack too deep")) {
            console.log("\n💡 The contract requires viaIR compilation.");
            console.log("Since BaseScan's UI doesn't support viaIR properly, try:");
            console.log("\n1. Use Etherscan's API directly with curl");
            console.log("2. Contact BaseScan support");
            console.log("3. Use alternative interfaces (Sourcify, Blockscout)");
        }
    }
    
    // Create corrected standard JSON
    console.log("\n📝 Creating corrected standard-input.json...");
    const standardJson = {
        language: "Solidity",
        sources: {
            "contracts/core/OpinionCoreNoMod.sol": {
                content: fs.readFileSync("./contracts/core/OpinionCoreNoMod.sol", "utf8")
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 1
            },
            viaIR: true,
            outputSelection: {
                "*": {
                    "*": ["metadata", "evm.bytecode", "evm.deployedBytecode", "abi"]
                }
            },
            libraries: {
                "contracts/core/OpinionCoreNoMod.sol": {
                    "PriceCalculator": "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"
                }
            }
        }
    };
    
    fs.writeFileSync("standard-input-corrected.json", JSON.stringify(standardJson, null, 2));
    console.log("✅ Created standard-input-corrected.json with correct contract name");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });