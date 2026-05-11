import { ethers } from "hardhat";

async function main() {
  const v4 = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
  const v3 = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";
  const [signer] = await ethers.getSigners();

  const v4c = await ethers.getContractAt("OpinionCoreV4", v4, signer);
  const v3c = await ethers.getContractAt("OpinionCoreV4", v3, signer);

  const v4Last = await v4c.nextOpinionId().catch(() => -1n);
  const v3Last = await v3c.nextOpinionId().catch(() => -1n);

  console.log(`V4 OpinionCore (0xAdc4…afC1): nextOpinionId = ${v4Last}`);
  console.log(`V3 OpinionCore (0x7b5d…A726): nextOpinionId = ${v3Last}`);

  if (v4Last > 1n) {
    const op = await v4c.opinions(1).catch(() => null);
    console.log(`V4 opinion #1: question="${op?.question?.slice(0, 40) || "n/a"}"`);
  }
  if (v3Last > 1n) {
    const op = await v3c.opinions(1).catch(() => null);
    console.log(`V3 opinion #1: question="${op?.question?.slice(0, 40) || "n/a"}"`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
