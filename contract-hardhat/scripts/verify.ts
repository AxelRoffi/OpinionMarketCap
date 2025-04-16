import { ethers } from "hardhat";
import * as hre from "hardhat";

async function main() {
  const proxyAddress = "0xCBB8f0797074c6f4D8D71f122c53141947f41db2";
  
  console.log("Checking contract at:", proxyAddress);
  
  try {
    // Check the contract bytecode
    const provider = ethers.provider;
    const code = await provider.getCode(proxyAddress);
    
    console.log("Contract code length:", code.length);
    console.log("Contract exists:", code !== '0x');
    
    if (code === '0x') {
      console.log("Contract doesn't exist or is not deployed at this address.");
      return;
    }
    
    // Directly verify the contract without assuming it's a proxy
    console.log("Attempting to verify contract...");
    await hre.run("verify:verify", {
      address: proxyAddress,
      constructorArguments: []
    });
    
    console.log("Verification complete!");
  } catch (error) {
    console.error("Error during verification process:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });