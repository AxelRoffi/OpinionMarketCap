/**
 * V4 Fresh Deploy — Continuation Script
 *
 * Picks up where deploy-v4-fresh.ts left off after we hit OZ's post-deploy
 * race condition on Base mainnet. Uses already-deployed addresses for the
 * libs + FeeManager and continues with PoolManagerV2, OpinionAdmin,
 * OpinionExtensionsV2, OpinionCoreV4.
 *
 * Adds 5-second sleeps between deployProxy calls to give Base RPC time to
 * index each new contract before OZ runs its verification.
 */

import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// ─── Already deployed on Base mainnet ────────────────────────────────
const DEPLOYED = {
  validationLibrary: "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681",
  priceCalculator: "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7",
  selfExitLib: "0x30c465f5772dc86555d37fE1376218Cbf79a4D93",
  feeManager: "0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA",
  feeManagerImpl: "0xBC2cc09AfB1c5fB47d40BF8860416FA7Be9804e6",
};

const ZERO = ethers.ZeroAddress;
const SLEEP_MS = 5000; // wait between deploys

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const net = await ethers.provider.getNetwork();
  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log("  V4 + V2 DEPLOY — CONTINUATION");
  console.log("══════════════════════════════════════════════════════════════════════");
  console.log(`Network:  ${network.name} (chainId ${net.chainId})`);

  const TREASURY = process.env.TREASURY_ADDRESS!;
  const ADMIN = process.env.ADMIN_ADDRESS!;
  const USDC = process.env.USDC_TOKEN_ADDRESS!;
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  console.log("\nAlready deployed (skipping):");
  Object.entries(DEPLOYED).forEach(([k, v]) => console.log(`  · ${k}: ${v}`));

  console.log("\nProceeding in 3 seconds. Ctrl-C to abort.");
  await sleep(3000);

  const out = {
    network: network.name,
    chainId: net.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    treasury: TREASURY,
    admin: ADMIN,
    usdc: USDC,
    ...DEPLOYED,
  } as Record<string, string>;

  // ─── 5/8 PoolManagerV2 ──────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  5/8 PoolManagerV2 (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const PoolManagerV2 = await ethers.getContractFactory("PoolManagerV2", {
    libraries: { ValidationLibrary: DEPLOYED.validationLibrary },
  });
  const poolManager = await upgrades.deployProxy(
    PoolManagerV2,
    [ZERO, DEPLOYED.feeManager, USDC, TREASURY, deployer.address],
    { initializer: "initialize", unsafeAllowLinkedLibraries: true, txOverrides: { gasPrice: 50000000n } }
  );
  await poolManager.waitForDeployment();
  out.poolManager = await poolManager.getAddress();
  out.poolManagerImpl = await upgrades.erc1967.getImplementationAddress(out.poolManager);
  console.log(`  ✅ proxy ${out.poolManager}`);
  console.log(`     impl  ${out.poolManagerImpl}`);
  await sleep(SLEEP_MS);

  // ─── 6/8 OpinionAdmin ───────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  6/8 OpinionAdmin (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
  const opinionAdmin = await upgrades.deployProxy(
    OpinionAdmin,
    [ZERO, USDC, TREASURY, deployer.address],
    { initializer: "initialize" }
  );
  await opinionAdmin.waitForDeployment();
  out.opinionAdmin = await opinionAdmin.getAddress();
  out.opinionAdminImpl = await upgrades.erc1967.getImplementationAddress(out.opinionAdmin);
  console.log(`  ✅ proxy ${out.opinionAdmin}`);
  console.log(`     impl  ${out.opinionAdminImpl}`);
  await sleep(SLEEP_MS);

  // ─── 7/8 OpinionExtensionsV2 ────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  7/8 OpinionExtensionsV2 (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionExtensions = await ethers.getContractFactory("OpinionExtensionsV2");
  const opinionExtensions = await upgrades.deployProxy(
    OpinionExtensions,
    [ZERO, deployer.address],
    { initializer: "initialize" }
  );
  await opinionExtensions.waitForDeployment();
  out.opinionExtensions = await opinionExtensions.getAddress();
  out.opinionExtensionsImpl = await upgrades.erc1967.getImplementationAddress(
    out.opinionExtensions
  );
  console.log(`  ✅ proxy ${out.opinionExtensions}`);
  console.log(`     impl  ${out.opinionExtensionsImpl}`);
  await sleep(SLEEP_MS);

  // ─── 8/8 OpinionCoreV4 ──────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  8/8 OpinionCoreV4 (proxy)");
  console.log("──────────────────────────────────────────────────────────────────────");
  const OpinionCoreV4 = await ethers.getContractFactory("OpinionCoreV4", {
    libraries: {
      ValidationLibrary: DEPLOYED.validationLibrary,
      PriceCalculator: DEPLOYED.priceCalculator,
      SelfExitLib: DEPLOYED.selfExitLib,
    },
  });
  const opinionCore = await upgrades.deployProxy(
    OpinionCoreV4,
    [
      USDC,
      deployer.address,
      DEPLOYED.feeManager,
      out.poolManager,
      ZERO,
      ZERO,
      TREASURY,
      out.opinionExtensions,
      out.opinionAdmin,
    ],
    { initializer: "initialize", unsafeAllowLinkedLibraries: true }
  );
  await opinionCore.waitForDeployment();
  out.opinionCore = await opinionCore.getAddress();
  out.opinionCoreImpl = await upgrades.erc1967.getImplementationAddress(out.opinionCore);
  console.log(`  ✅ proxy ${out.opinionCore}`);
  console.log(`     impl  ${out.opinionCoreImpl}`);
  await sleep(SLEEP_MS);

  // ─── Wire ───────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────────────────");
  console.log("  Wiring contracts together");
  console.log("──────────────────────────────────────────────────────────────────────");

  console.log("  · OpinionAdmin.setCoreContract → OpinionCore");
  await (await opinionAdmin.setCoreContract(out.opinionCore)).wait();

  console.log("  · OpinionExtensions.setCoreContract → OpinionCore");
  await (await opinionExtensions.setCoreContract(out.opinionCore)).wait();

  console.log("  · PoolManager.setOpinionCore → OpinionCore");
  await (await poolManager.setOpinionCore(out.opinionCore)).wait();

  // FeeManager already deployed; need its instance for grantCoreContractRole
  const feeManager = await ethers.getContractAt("FeeManager", DEPLOYED.feeManager);
  console.log("  · FeeManager.grantCoreContractRole → OpinionCore");
  await (await feeManager.grantCoreContractRole(out.opinionCore)).wait();

  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));
  console.log("  · OpinionCore.grantRole(POOL_MANAGER_ROLE, PoolManager)");
  await (await opinionCore.grantRole(POOL_MANAGER_ROLE, out.poolManager)).wait();

  // ─── Init V4 + V2 ───────────────────────────────────────────────────
  console.log("\n  · OpinionCoreV4.initializeV4()");
  await (await opinionCore.initializeV4()).wait();
  console.log("  · PoolManagerV2.initializeV2()");
  await (await poolManager.initializeV2()).wait();

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
  console.log(`  PoolManager:        ${out.poolManager}`);
  console.log(`  FeeManager:         ${DEPLOYED.feeManager}`);
  console.log(`  OpinionAdmin:       ${out.opinionAdmin}`);
  console.log(`  OpinionExtensions:  ${out.opinionExtensions}`);
  console.log(`  ValidationLibrary:  ${DEPLOYED.validationLibrary}`);
  console.log(`  PriceCalculator:    ${DEPLOYED.priceCalculator}`);
  console.log(`  SelfExitLib:        ${DEPLOYED.selfExitLib}`);
  console.log(`\n  📝 Saved to deployments/${network.name}-v4-fresh.json\n`);
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err);
  process.exit(1);
});
