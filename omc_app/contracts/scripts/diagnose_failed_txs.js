require("dotenv").config();
const { ethers } = require("ethers");

const RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const PROXY = "0xadc44c00dc6a45b8776fddbb1f977950838eafc1";
const SCAN_BLOCKS = Number(process.env.SCAN_BLOCKS || 250);

const FUNCS = {
  [ethers.id("submitAnswer(uint256,string,string,string)").slice(0, 10)]: "submitAnswer",
  [ethers.id("createOpinion(string,string,string,string,uint96,string[])").slice(0, 10)]: "createOpinion(6-arg V5/V6)",
  [ethers.id("createOpinion(string,string,string,uint96,string[])").slice(0, 10)]: "createOpinion(5-arg OLD)",
  [ethers.id("buyQuestion(uint256)").slice(0, 10)]: "buyQuestion",
  [ethers.id("reclaimVacantSlot(uint256,string,string,string)").slice(0, 10)]: "reclaimVacantSlot",
  [ethers.id("selfExit(uint256)").slice(0, 10)]: "selfExit",
};
const ERRORS = {
  [ethers.id("SameOwner()").slice(0, 10)]: "SameOwner (self-rebuy blocked, V6)",
  [ethers.id("OneTradePerBlock()").slice(0, 10)]: "OneTradePerBlock",
  [ethers.id("InsufficientAllowance(uint256,uint256)").slice(0, 10)]: "InsufficientAllowance",
  [ethers.id("SlotIsVacant()").slice(0, 10)]: "SlotIsVacant",
  [ethers.id("OpinionNotActive()").slice(0, 10)]: "OpinionNotActive",
  [ethers.id("FeatureDisabled()").slice(0, 10)]: "FeatureDisabled",
  "0x08c379a0": "Error(string)",
  "0x4e487b71": "Panic(uint)",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const latest = await provider.getBlockNumber();
  console.log(`RESULT scanning blocks ${latest - SCAN_BLOCKS}..${latest} for txs to proxy`);

  const proxyTxs = [];
  for (let b = latest; b > latest - SCAN_BLOCKS; b -= 1) {
    let blk;
    for (let i = 0; i < 5; i++) { try { blk = await provider.getBlock(b, true); break; } catch { await sleep(300); } }
    if (!blk) continue;
    for (const tx of blk.prefetchedTransactions || []) {
      if (tx.to && tx.to.toLowerCase() === PROXY) proxyTxs.push(tx);
    }
  }
  console.log(`RESULT proxy txs found: ${proxyTxs.length}`);

  let failed = 0;
  const byReason = {};
  for (const tx of proxyTxs) {
    let rcpt;
    for (let i = 0; i < 5; i++) { try { rcpt = await provider.getTransactionReceipt(tx.hash); break; } catch { await sleep(300); } }
    if (!rcpt || rcpt.status === 1) continue;
    failed++;
    const fn = FUNCS[(tx.data || "").slice(0, 10)] || (tx.data || "").slice(0, 10);
    // Replay to get revert reason.
    let reason = "(unknown)";
    try {
      await provider.call({ to: tx.to, from: tx.from, data: tx.data, value: tx.value }, tx.blockNumber - 1);
    } catch (e) {
      let d = e?.data; if (d && typeof d === "object") d = d.data;
      if (!d && e?.info?.error?.data) d = e.info.error.data;
      const sel = typeof d === "string" ? d.slice(0, 10) : "";
      reason = ERRORS[sel] || sel || "(no data)";
    }
    const key = `${fn} -> ${reason}`;
    byReason[key] = (byReason[key] || 0) + 1;
  }

  console.log(`RESULT FAILED txs to proxy: ${failed}`);
  console.log("RESULT breakdown:");
  for (const [k, v] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`RESULT   ${v}x  ${k}`);
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
