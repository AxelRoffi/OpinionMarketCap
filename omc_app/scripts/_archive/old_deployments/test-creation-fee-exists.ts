import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const contract = await ethers.getContractAt("OpinionCore", CONTRACT_ADDRESS);
  
  try {
    const creationFeePercent = await contract.creationFeePercent();
    console.log("✅ creationFeePercent exists:", creationFeePercent.toString());
  } catch (error: any) {
    console.log("❌ creationFeePercent does not exist:", error.message.split('\n')[0]);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});