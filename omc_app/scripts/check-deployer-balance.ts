import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(bal)} ETH`);
  console.log(`USD est:  $${(Number(ethers.formatEther(bal)) * 3000).toFixed(2)} (at $3000/ETH)`);

  const gas = 21_000_000n;
  const gasPrice = 50_000_000n; // 0.05 gwei
  const ethCost = gas * gasPrice;
  console.log(
    `Est. deploy cost (21M gas @ 0.05 gwei): ${ethers.formatEther(ethCost)} ETH = $${(
      Number(ethers.formatEther(ethCost)) * 3000
    ).toFixed(2)}`
  );

  if (bal < ethCost) {
    console.log("⚠️  Balance MAY be insufficient.");
  } else {
    console.log("✅ Balance sufficient (~10× headroom).");
  }
}

main();
