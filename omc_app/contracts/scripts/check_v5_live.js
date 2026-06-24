const { ethers } = require("hardhat");
const PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
async function main() {
  const slot = await ethers.provider.getStorage(PROXY, IMPL_SLOT);
  const impl = ethers.getAddress("0x" + slot.slice(-40));
  console.log("RESULT Live impl:", impl);
  const sel5 = ethers.id("createOpinion(string,string,string,uint96,string[])").slice(0, 10);
  const sel6 = ethers.id("createOpinion(string,string,string,string,uint96,string[])").slice(0, 10);
  console.log("RESULT 5-arg selector:", sel5, "| 6-arg selector:", sel6);
  const code = await ethers.provider.getCode(impl);
  console.log("RESULT impl bytecode size:", (code.length - 2) / 2, "bytes");
  console.log("RESULT contains 5-arg selector:", code.includes(sel5.slice(2)));
  console.log("RESULT contains 6-arg selector (V5):", code.includes(sel6.slice(2)));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
