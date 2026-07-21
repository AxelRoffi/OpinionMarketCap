require("dotenv").config();
const { ethers } = require("ethers");

const RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const FEE_MANAGER = "0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA";
const TREASURY = "0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9";
const ADMIN_EOA = "0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C";

const ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function TREASURY_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const fm = new ethers.Contract(FEE_MANAGER, ABI, provider);

  const TREASURY_ROLE = await fm.TREASURY_ROLE();
  const DEFAULT_ADMIN_ROLE = await fm.DEFAULT_ADMIN_ROLE().catch(() => ethers.ZeroHash);
  console.log("RESULT TREASURY_ROLE hash :", TREASURY_ROLE);

  const candidates = { Treasury: TREASURY, AdminEOA: ADMIN_EOA, FeeManager: FEE_MANAGER };
  for (const [label, addr] of Object.entries(candidates)) {
    const hasTre = await fm.hasRole(TREASURY_ROLE, addr).catch(() => null);
    const hasDef = await fm.hasRole(DEFAULT_ADMIN_ROLE, addr).catch(() => null);
    console.log(`RESULT ${label} (${addr}) -> TREASURY_ROLE=${hasTre}  DEFAULT_ADMIN=${hasDef}`);
  }

  // Enumerate via RoleGranted events for TREASURY_ROLE (chunked to respect RPC limits).
  console.log("RESULT --- scanning RoleGranted(TREASURY_ROLE) events ---");
  const iface = new ethers.Interface([
    "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  ]);
  const topic0 = iface.getEvent("RoleGranted").topicHash;
  const latest = await provider.getBlockNumber();
  const START = 28000000; // FeeManager deployed well after this on Base
  const STEP = 400000;
  const holders = new Set();
  for (let from = START; from <= latest; from += STEP) {
    const to = Math.min(from + STEP - 1, latest);
    try {
      const logs = await provider.getLogs({
        address: FEE_MANAGER, fromBlock: from, toBlock: to,
        topics: [topic0, TREASURY_ROLE],
      });
      for (const lg of logs) holders.add(ethers.getAddress("0x" + lg.topics[2].slice(26)));
    } catch (_) { /* skip chunk on RPC limit */ }
  }
  console.log("RESULT ever-granted TREASURY_ROLE:", [...holders].join(", ") || "(none found in scan)");
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERR", e.message); process.exit(1); });
