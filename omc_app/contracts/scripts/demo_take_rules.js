require("dotenv").config();
const { ethers } = require("ethers");
const ART = require("../../artifacts/contracts/active/OpinionCoreV6.sol/OpinionCoreV6.json");

const RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const OTHER = "0x000000000000000000000000000000000000dEaD"; // a non-owner with no allowance

const ERR = {
  [ethers.id("SameOwner()").slice(0, 10)]: "SameOwner ❌ (you already hold this slot)",
  [ethers.id("SlotIsVacant()").slice(0, 10)]: "SlotIsVacant ❌ (use RECLAIM, not take)",
  [ethers.id("InsufficientAllowance(uint256,uint256)").slice(0, 10)]: "InsufficientAllowance (guards PASSED — would work with USDC approved) ✅",
  [ethers.id("OneTradePerBlock()").slice(0, 10)]: "OneTradePerBlock ❌",
};
const sel = (e) => {
  let d = e?.data; if (d && typeof d === "object") d = d.data;
  if (!d && e?.info?.error?.data) d = e.info.error.data;
  const s = typeof d === "string" ? d.slice(0, 10) : "";
  return ERR[s] || s || (e.shortMessage || "").slice(0, 50);
};

async function main() {
  const p = new ethers.JsonRpcProvider(RPC);
  const c = new ethers.Contract(PROXY, ART.abi, p);
  const iface = new ethers.Interface(ART.abi);
  const n = Number(await c.nextOpinionId());

  // Find one OWNED opinion and one VACANT opinion (current state).
  let owned = null, vacant = null;
  for (let id = 1; id < n; id++) {
    const d = await c.getOpinionDetails(id);
    if (!owned && d.currentAnswerOwner !== ethers.ZeroAddress) owned = { id, owner: d.currentAnswerOwner, ans: d.currentAnswer };
    if (!vacant && d.currentAnswerOwner === ethers.ZeroAddress) vacant = { id, ans: d.currentAnswer };
    if (owned && vacant) break;
  }

  async function simSubmit(id, from) {
    const data = iface.encodeFunctionData("submitAnswer", [id, "TESTX", "", ""]);
    try { await p.call({ to: PROXY, from, data }); return "NO_REVERT (would succeed)"; }
    catch (e) { return sel(e); }
  }
  async function simReclaim(id, from) {
    const data = iface.encodeFunctionData("reclaimVacantSlot", [id, "TESTX", "", ""]);
    try { await p.call({ to: PROXY, from, data }); return "NO_REVERT (would succeed)"; }
    catch (e) { return sel(e); }
  }

  console.log("=== RULE 1: you cannot re-take a slot you ALREADY hold (V6) ===");
  if (owned) {
    console.log(`RESULT owned take #${owned.id} ("${owned.ans}") held by ${owned.owner.slice(0,10)}…`);
    console.log(`RESULT   submitAnswer FROM the owner      -> ${await simSubmit(owned.id, owned.owner)}`);
    console.log(`RESULT   submitAnswer FROM someone else   -> ${await simSubmit(owned.id, OTHER)}`);
  } else console.log("RESULT (no owned opinion right now)");

  console.log("=== RULE 2: a VACANT slot needs RECLAIM, not the normal take ===");
  if (vacant) {
    console.log(`RESULT vacant take #${vacant.id} (last answer "${vacant.ans}")`);
    console.log(`RESULT   submitAnswer (normal take)       -> ${await simSubmit(vacant.id, OTHER)}`);
    console.log(`RESULT   reclaimVacantSlot (correct path) -> ${await simReclaim(vacant.id, OTHER)}`);
  } else console.log("RESULT (no vacant opinion right now)");
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
