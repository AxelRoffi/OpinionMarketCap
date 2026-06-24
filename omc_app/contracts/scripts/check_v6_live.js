require("dotenv").config();
const { ethers } = require("ethers");
const ART = require("../../artifacts/contracts/active/OpinionCoreV6.sol/OpinionCoreV6.json");

const RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const SAMEOWNER = ethers.id("SameOwner()").slice(0, 10);
const INSUFF = ethers.id("InsufficientAllowance(uint256,uint256)").slice(0, 10);

function selOf(e) {
  let d = e?.data;
  if (d && typeof d === "object") d = d.data;
  if (!d && e?.info?.error?.data) d = e.info.error.data;
  if (typeof d === "string") return d.slice(0, 10);
  return "(no data)";
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const c = new ethers.Contract(PROXY, ART.abi, provider);     // REAL abi from artifact
  const iface = new ethers.Interface(ART.abi);

  const n = Number(await c.nextOpinionId());
  let id = null, owner = null;
  for (let i = 1; i < n; i++) {
    const d = await c.getOpinionDetails(i);
    if (d.currentAnswerOwner && d.currentAnswerOwner !== ethers.ZeroAddress && d.isActive) {
      id = i; owner = d.currentAnswerOwner; break;
    }
  }
  console.log(`RESULT opinion #${id}, REAL currentAnswerOwner = ${owner}`);

  const data = iface.encodeFunctionData("submitAnswer", [id, "TESTSELF", "", ""]);
  async function sim(from) {
    try { await provider.call({ to: PROXY, from, data }); return "NO_REVERT"; }
    catch (e) { const s = selOf(e); return s === SAMEOWNER ? "revert SameOwner ✅" : s === INSUFF ? "revert InsufficientAllowance" : "revert " + s; }
  }
  console.log("RESULT sim FROM owner     :", await sim(owner), "  <- V6 = SameOwner");
  console.log("RESULT sim FROM 0xdead    :", await sim("0x000000000000000000000000000000000000dEaD"));
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
