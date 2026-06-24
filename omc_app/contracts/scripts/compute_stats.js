require("dotenv").config();
const { ethers } = require("ethers");
const ART = require("../../artifacts/contracts/active/OpinionCoreV6.sol/OpinionCoreV6.json");

const RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const ZERO = ethers.ZeroAddress.toLowerCase();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function retry(fn, label, tries = 8) {
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { if (i === tries - 1) throw new Error(`${label}: ${e.shortMessage || e.message}`); await sleep(500 * (i + 1)); }
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const c = new ethers.Contract(PROXY, ART.abi, provider);

  const n = Number(await retry(() => c.nextOpinionId(), "nextOpinionId"));
  const users = new Set();
  let volumeMicro = 0n, trades = 0;

  // getAnswerHistory per opinion: the first entry's owner is the creator,
  // every entry's owner is a holder, every entry's price is a trade/creation.
  for (let id = 1; id < n; id++) {
    const hist = await retry(() => c.getAnswerHistory(id), `history#${id}`);
    for (const h of hist) {
      trades++;
      volumeMicro += BigInt(h.price);
      if (h.owner && h.owner.toLowerCase() !== ZERO) users.add(h.owner.toLowerCase());
    }
    await sleep(250);
  }

  console.log("RESULT opinions               :", n - 1, `(nextOpinionId=${n})`);
  console.log("RESULT total trades+creations :", trades);
  console.log("RESULT UNIQUE USERS (wallets) :", users.size);
  console.log("RESULT TOTAL VOLUME (USDC)    :", ethers.formatUnits(volumeMicro, 6));
  console.log("RESULT users:\n  " + [...users].join("\n  "));
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
