import { ethers } from "hardhat";
async function main() {
  const v4 = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
  const c = await ethers.getContractAt("OpinionCoreV4", v4);
  const op = await c.opinions(1);
  console.log("Opinion #1 on-chain state:");
  console.log("  question:           ", op.question);
  console.log("  currentAnswer:      ", op.currentAnswer);
  console.log("  currentAnswerOwner: ", op.currentAnswerOwner);
  console.log("  isActive:           ", op.isActive);
  console.log("  lastPrice:          ", ethers.formatUnits(op.lastPrice, 6), "USDC");
  console.log("  nextPrice:          ", ethers.formatUnits(op.nextPrice, 6), "USDC");
  console.log("  creator:            ", op.creator);
  console.log("  ");
  console.log("  vacant?            ", op.currentAnswerOwner === "0x0000000000000000000000000000000000000000");
}
main().catch(e => { console.error(e); process.exit(1); });
