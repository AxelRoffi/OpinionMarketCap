/**
 * V4 Deploy — Final Continuation
 *
 * Picks up after the second OZ race-condition crash. By now we have:
 *   - All 3 libraries
 *   - FeeManager proxy + impl
 *   - PoolManagerV2 proxy + impl
 *
 * Remaining:
 *   - OpinionAdmin proxy
 *   - OpinionExtensionsV2 proxy
 *   - OpinionCoreV4 proxy
 *   - Wiring + initializeV4/V2
 *
 * Wraps each deployProxy in a try/catch that swallows the OZ
 * post-verification race and reads the actual proxy address from the
 * manifest, then validates via raw RPC (`eth_getStorageAt` on the
 * EIP-1967 implementation slot).
 */

import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import type { ContractFactory, Contract } from "ethers";

const ZERO = ethers.ZeroAddress;
const SLEEP_MS = 8000;
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

// Already deployed
const D = {
  validationLibrary: "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681",
  priceCalculator: "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7",
  selfExitLib: "0x30c465f5772dc86555d37fE1376218Cbf79a4D93",
  feeManager: "0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA",
  feeManagerImpl: "0xBC2cc09AfB1c5fB47d40BF8860416FA7Be9804e6",
  poolManager: "0x34537a749F4b16E7542a59e5322338372A6a1E3c",
  poolManagerImpl: "0x2cb3b0b143d9155db3b007d90b20cecc1af69cdf",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Reads the latest proxy address from the OZ manifest (post-failed-deploy fallback). */
function lastProxyFromManifest(): string {
  const p = path.join(__dirname, "..", ".openzeppelin", "base.json");
  const m = JSON.parse(fs.readFileSync(p, "utf8"));
  return m.proxies[m.proxies.length - 1].address;
}

/**
 * Deploys a proxy via OZ. If OZ throws its post-verification race error,
 * falls back to reading the manifest + verifying the impl slot via RPC.
 */
async function safeDeployProxy(
  factory: ContractFactory,
  args: unknown[],
  opts: any,
  label: string
): Promise<{ address: string; impl: string; contract: Contract }> {
  try {
    const proxy = await upgrades.deployProxy(factory, args, opts);
    await proxy.waitForDeployment();
    const address = await proxy.getAddress();
    const impl = await upgrades.erc1967.getImplementationAddress(address);
    console.log(`  ✅ ${label}: proxy ${address}`);
    console.log(`     impl  ${impl}`);
    return { address, impl, contract: proxy as unknown as Contract };
  } catch (err: any) {
    if (!String(err?.message ?? err).includes("doesn't look like an ERC 1967 proxy")) {
      throw err;
    }
    console.log(`  ⚠️  OZ race-condition error — verifying via RPC fallback`);
    await sleep(5000);
    const address = lastProxyFromManifest();
    const slotData = await ethers.provider.getStorage(address, IMPL_SLOT);
    const impl = "0x" + slotData.slice(-40);
    if (impl === ZERO.toLowerCase()) {
      throw new Error(`Proxy at ${address} has empty impl slot — real failure`);
    }
    console.log(`  ✅ ${label}: proxy ${address} (verified via RPC)`);
    console.log(`     impl  ${impl}`);
    const contract = new ethers.Contract(address, factory.interface, factory.runner);
    return { address, impl, contract };
  }
}

async function main() {
  const net = await ethers.provider.getNetwork();
  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log("  V4 DEPLOY — FINAL");
  console.log("══════════════════════════════════════════════════════════════════════");
  console.log(`Network: ${network.name} (chainId ${net.chainId})`);

  const TREASURY = process.env.TREASURY_ADDRESS!;
  const ADMIN = process.env.ADMIN_ADDRESS!;
  const USDC = process.env.USDC_TOKEN_ADDRESS!;
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  console.log("\nAlready deployed:");
  Object.entries(D).forEach(([k, v]) => console.log(`  · ${k}: ${v}`));
  console.log("\nProceeding in 3 seconds.");
  await sleep(3000);

  const out = {
    network: network.name,
    chainId: net.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    treasury: TREASURY,
    admin: ADMIN,
    usdc: USDC,
    ...D,
  } as Record<string, string>;

  // ─── 6/8 OpinionAdmin ───────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  6/8 OpinionAdmin (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
  const oa = await safeDeployProxy(
    OpinionAdmin,
    [ZERO, USDC, TREASURY, deployer.address],
    { initializer: "initialize" },
    "OpinionAdmin"
  );
  out.opinionAdmin = oa.address;
  out.opinionAdminImpl = oa.impl;
  await sleep(SLEEP_MS);

  // ─── 7/8 OpinionExtensionsV2 ────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  7/8 OpinionExtensionsV2 (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionExtensions = await ethers.getContractFactory("OpinionExtensionsV2");
  const oe = await safeDeployProxy(
    OpinionExtensions,
    [ZERO, deployer.address],
    { initializer: "initialize" },
    "OpinionExtensionsV2"
  );
  out.opinionExtensions = oe.address;
  out.opinionExtensionsImpl = oe.impl;
  await sleep(SLEEP_MS);

  // ─── 8/8 OpinionCoreV4 ──────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  8/8 OpinionCoreV4 (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionCoreV4 = await ethers.getContractFactory("OpinionCoreV4", {
    libraries: {
      ValidationLibrary: D.validationLibrary,
      PriceCalculator: D.priceCalculator,
      SelfExitLib: D.selfExitLib,
    },
  });
  const oc = await safeDeployProxy(
    OpinionCoreV4,
    [
      USDC,
      deployer.address,
      D.feeManager,
      D.poolManager,
      ZERO,
      ZERO,
      TREASURY,
      out.opinionExtensions,
      out.opinionAdmin,
    ],
    { initializer: "initialize", unsafeAllowLinkedLibraries: true },
    "OpinionCoreV4"
  );
  out.opinionCore = oc.address;
  out.opinionCoreImpl = oc.impl;
  await sleep(SLEEP_MS);

  // ─── Re-attach to existing pool manager + opinion admin + extensions ─
  const pm = await ethers.getContractAt("PoolManagerV2", D.poolManager);
  const opAdmin = await ethers.getContractAt("OpinionAdmin", out.opinionAdmin);
  const opExt = await ethers.getContractAt("OpinionExtensionsV2", out.opinionExtensions);
  const fm = await ethers.getContractAt("FeeManager", D.feeManager);
  const oCore = await ethers.getContractAt("OpinionCoreV4", out.opinionCore, {
    libraries: {
      ValidationLibrary: D.validationLibrary,
      PriceCalculator: D.priceCalculator,
      SelfExitLib: D.selfExitLib,
    },
  } as any);

  // ─── Wire ───────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  Wiring contracts together");
  console.log("──────────────────────────────────────────────────────────────────────");

  console.log("  · OpinionAdmin.setCoreContract → OpinionCore");
  await (await opAdmin.setCoreContract(out.opinionCore)).wait();
  await sleep(2000);

  console.log("  · OpinionExtensions.setCoreContract → OpinionCore");
  await (await opExt.setCoreContract(out.opinionCore)).wait();
  await sleep(2000);

  console.log("  · PoolManager.setOpinionCore → OpinionCore");
  await (await pm.setOpinionCore(out.opinionCore)).wait();
  await sleep(2000);

  console.log("  · FeeManager.grantCoreContractRole → OpinionCore");
  await (await fm.grantCoreContractRole(out.opinionCore)).wait();
  await sleep(2000);

  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));
  console.log("  · OpinionCore.grantRole(POOL_MANAGER_ROLE, PoolManager)");
  await (await oCore.grantRole(POOL_MANAGER_ROLE, D.poolManager)).wait();
  await sleep(2000);

  // ─── Init V4 + V2 ───────────────────────────────────────────────────
  console.log("\n  · OpinionCoreV4.initializeV4()");
  await (await oCore.initializeV4()).wait();
  await sleep(2000);
  console.log("  · PoolManagerV2.initializeV2()");
  await (await pm.initializeV2()).wait();

  // ─── Save ───────────────────────────────────────────────────────────
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });
  const filepath = path.join(deploymentsDir, `${network.name}-v4-fresh.json`);
  fs.writeFileSync(filepath, JSON.stringify(out, null, 2));

  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log("  ✅ DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════════════════════════════════════");
  console.log(`\nProxy addresses (use these in frontend):`);
  console.log(`  OpinionCore:        ${out.opinionCore}`);
  console.log(`  PoolManager:        ${D.poolManager}`);
  console.log(`  FeeManager:         ${D.feeManager}`);
  console.log(`  OpinionAdmin:       ${out.opinionAdmin}`);
  console.log(`  OpinionExtensions:  ${out.opinionExtensions}`);
  console.log(`  ValidationLibrary:  ${D.validationLibrary}`);
  console.log(`  PriceCalculator:    ${D.priceCalculator}`);
  console.log(`  SelfExitLib:        ${D.selfExitLib}`);
  console.log(`\nSaved to deployments/${network.name}-v4-fresh.json\n`);
}

main().catch((err) => {
  console.error("\n❌ Failed:", err);
  process.exit(1);
});
