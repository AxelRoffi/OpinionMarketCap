/**
 * V4 Fresh Deploy
 *
 * Deploys the full V4 + V2 stack from scratch to a target network.
 * Same script for Sepolia (`--network baseSepolia`) and mainnet
 * (`--network base`). Reads TREASURY_ADDRESS, ADMIN_ADDRESS, USDC_TOKEN_ADDRESS,
 * and PRIVATE_KEY from .env.
 *
 * Run order:
 *   1. ValidationLibrary
 *   2. PriceCalculator
 *   3. SelfExitLib                    (linked → ValidationLibrary)
 *   4. FeeManager (proxy)
 *   5. PoolManagerV2 (proxy)          (linked → ValidationLibrary)
 *   6. OpinionAdmin (proxy)
 *   7. OpinionExtensionsV2 (proxy)
 *   8. OpinionCoreV4 (proxy)          (linked → all 3 libs)
 *   9. Wire roles + cross-references
 *  10. Save addresses to deployments/<network>-v4-fresh.json
 *
 * Feature flags (selfExitEnabled, reclaimVacantSlotEnabled,
 * stalePoolExitEnabled) all start FALSE — admin must enable explicitly
 * after testing.
 */

import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const ZERO = ethers.ZeroAddress;

// 60s minimum cooldown was set at the contract level for live testing.
// Production initializeV4() sets soloCooldown = 14 days regardless.

async function getEnvAddress(name: string): Promise<string> {
  const v = process.env[name];
  if (!v || !ethers.isAddress(v)) {
    throw new Error(`Missing or invalid env var: ${name}`);
  }
  return v;
}

interface DeployedAddresses {
  network: string;
  chainId: string;
  deployedAt: string;
  deployer: string;
  treasury: string;
  admin: string;
  usdc: string;
  validationLibrary: string;
  priceCalculator: string;
  selfExitLib: string;
  feeManager: string;
  feeManagerImpl: string;
  poolManager: string;
  poolManagerImpl: string;
  opinionAdmin: string;
  opinionAdminImpl: string;
  opinionExtensions: string;
  opinionExtensionsImpl: string;
  opinionCore: string;
  opinionCoreImpl: string;
  featureFlags: {
    selfExitEnabled: boolean;
    reclaimVacantSlotEnabled: boolean;
    stalePoolExitEnabled: boolean;
  };
}

function divider(label: string) {
  console.log("\n" + "─".repeat(70));
  console.log(`  ${label}`);
  console.log("─".repeat(70));
}

async function main() {
  const net = await ethers.provider.getNetwork();
  console.log("\n" + "═".repeat(70));
  console.log("  V4 + V2 FRESH DEPLOY");
  console.log("═".repeat(70));
  console.log(`Network:  ${network.name} (chainId ${net.chainId})`);

  // ─── Env ────────────────────────────────────────────────────────────
  const TREASURY = await getEnvAddress("TREASURY_ADDRESS");
  const ADMIN = await getEnvAddress("ADMIN_ADDRESS");
  const USDC = await getEnvAddress("USDC_TOKEN_ADDRESS");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log(`Treasury: ${TREASURY}`);
  console.log(`Admin:    ${ADMIN}`);
  console.log(`USDC:     ${USDC}`);

  if (balance < ethers.parseEther("0.005")) {
    console.warn(
      `⚠️  Deployer balance is low. Recommend at least 0.01 ETH for full deploy + buffer.`
    );
  }

  // Sanity: ensure deployer == admin so we can wire roles in this same tx batch
  if (deployer.address.toLowerCase() !== ADMIN.toLowerCase()) {
    console.warn(
      `⚠️  Deployer (${deployer.address}) != ADMIN (${ADMIN}). The script will\n` +
        `   grant roles to ADMIN and revoke from deployer at the end so you keep\n` +
        `   sole admin control.`
    );
  }

  console.log("\nProceeding in 3 seconds. Ctrl-C to abort.");
  await new Promise((r) => setTimeout(r, 3000));

  const out: Partial<DeployedAddresses> = {
    network: network.name,
    chainId: net.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    treasury: TREASURY,
    admin: ADMIN,
    usdc: USDC,
  };

  // ─── 1. ValidationLibrary ───────────────────────────────────────────
  divider("1/8 ValidationLibrary");
  if (process.env.VALIDATION_LIB_ADDRESS) {
    out.validationLibrary = process.env.VALIDATION_LIB_ADDRESS;
    console.log(`  ⏭  Reusing deployed at ${out.validationLibrary}`);
  } else {
    const ValidationLib = await ethers.getContractFactory("ValidationLibrary");
    const valLib = await ValidationLib.deploy();
    await valLib.waitForDeployment();
    out.validationLibrary = await valLib.getAddress();
    console.log(`  ✅ ${out.validationLibrary}`);
  }

  // ─── 2. PriceCalculator ─────────────────────────────────────────────
  divider("2/8 PriceCalculator");
  if (process.env.PRICE_CALC_ADDRESS) {
    out.priceCalculator = process.env.PRICE_CALC_ADDRESS;
    console.log(`  ⏭  Reusing deployed at ${out.priceCalculator}`);
  } else {
    const PriceCalc = await ethers.getContractFactory("PriceCalculator");
    const priceCalc = await PriceCalc.deploy();
    await priceCalc.waitForDeployment();
    out.priceCalculator = await priceCalc.getAddress();
    console.log(`  ✅ ${out.priceCalculator}`);
  }

  // ─── 3. SelfExitLib ─────────────────────────────────────────────────
  divider("3/8 SelfExitLib");
  const SelfExitLib = await ethers.getContractFactory("SelfExitLib", {
    libraries: { ValidationLibrary: out.validationLibrary },
  });
  const selfExitLib = await SelfExitLib.deploy();
  await selfExitLib.waitForDeployment();
  out.selfExitLib = await selfExitLib.getAddress();
  console.log(`  ✅ ${out.selfExitLib}`);

  // ─── 4. FeeManager ──────────────────────────────────────────────────
  divider("4/8 FeeManager (proxy)");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(FeeManager, [USDC, TREASURY], {
    initializer: "initialize",
  });
  await feeManager.waitForDeployment();
  out.feeManager = await feeManager.getAddress();
  out.feeManagerImpl = await upgrades.erc1967.getImplementationAddress(out.feeManager);
  console.log(`  ✅ proxy ${out.feeManager}`);
  console.log(`     impl  ${out.feeManagerImpl}`);

  // ─── 5. PoolManagerV2 ──────────────────────────────────────────────
  divider("5/8 PoolManagerV2 (proxy)");
  const PoolManagerV2 = await ethers.getContractFactory("PoolManagerV2", {
    libraries: { ValidationLibrary: out.validationLibrary },
  });
  // opinionCore set later via setOpinionCore
  const poolManager = await upgrades.deployProxy(
    PoolManagerV2,
    [ZERO, out.feeManager, USDC, TREASURY, deployer.address],
    { initializer: "initialize", unsafeAllowLinkedLibraries: true }
  );
  await poolManager.waitForDeployment();
  out.poolManager = await poolManager.getAddress();
  out.poolManagerImpl = await upgrades.erc1967.getImplementationAddress(out.poolManager);
  console.log(`  ✅ proxy ${out.poolManager}`);
  console.log(`     impl  ${out.poolManagerImpl}`);

  // ─── 6. OpinionAdmin ───────────────────────────────────────────────
  divider("6/8 OpinionAdmin (proxy)");
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

  // ─── 7. OpinionExtensionsV2 ────────────────────────────────────────
  divider("7/8 OpinionExtensionsV2 (proxy)");
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

  // ─── 8. OpinionCoreV4 ──────────────────────────────────────────────
  divider("8/8 OpinionCoreV4 (proxy)");
  const OpinionCoreV4 = await ethers.getContractFactory("OpinionCoreV4", {
    libraries: {
      ValidationLibrary: out.validationLibrary,
      PriceCalculator: out.priceCalculator,
      SelfExitLib: out.selfExitLib,
    },
  });
  const opinionCore = await upgrades.deployProxy(
    OpinionCoreV4,
    [
      USDC,
      deployer.address, // _opinionMarket — granted MARKET_CONTRACT_ROLE; can revoke later
      out.feeManager,
      out.poolManager,
      ZERO, // monitoringManager (optional)
      ZERO, // securityManager (optional)
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

  // ─── Wire ────────────────────────────────────────────────────────
  divider("Wiring contracts together");
  console.log("  · OpinionAdmin.setCoreContract → OpinionCore");
  await (await opinionAdmin.setCoreContract(out.opinionCore)).wait();

  console.log("  · OpinionExtensions.setCoreContract → OpinionCore");
  await (await opinionExtensions.setCoreContract(out.opinionCore)).wait();

  console.log("  · PoolManager.setOpinionCore → OpinionCore");
  await (await poolManager.setOpinionCore(out.opinionCore)).wait();

  console.log("  · FeeManager.grantCoreContractRole → OpinionCore");
  await (await feeManager.grantCoreContractRole(out.opinionCore)).wait();

  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));
  console.log("  · OpinionCore.grantRole(POOL_MANAGER_ROLE, PoolManager)");
  await (await opinionCore.grantRole(POOL_MANAGER_ROLE, out.poolManager)).wait();

  // ─── Initialize V4 + V2 reinitializers ─────────────────────────────
  divider("Running initializeV4 + initializeV2");
  console.log("  · OpinionCoreV4.initializeV4()");
  await (await opinionCore.initializeV4()).wait();

  console.log("  · PoolManagerV2.initializeV2()");
  await (await poolManager.initializeV2()).wait();

  // ─── Confirm feature flags FALSE ────────────────────────────────────
  out.featureFlags = {
    selfExitEnabled: await opinionCore.selfExitEnabled(),
    reclaimVacantSlotEnabled: await opinionCore.reclaimVacantSlotEnabled(),
    stalePoolExitEnabled: await poolManager.stalePoolExitEnabled(),
  };
  divider("Feature flags (all should be FALSE — enable manually after testing)");
  console.log(`  · selfExitEnabled:          ${out.featureFlags.selfExitEnabled}`);
  console.log(`  · reclaimVacantSlotEnabled: ${out.featureFlags.reclaimVacantSlotEnabled}`);
  console.log(`  · stalePoolExitEnabled:     ${out.featureFlags.stalePoolExitEnabled}`);

  // ─── Hand off admin role if deployer != ADMIN ──────────────────────
  if (deployer.address.toLowerCase() !== ADMIN.toLowerCase()) {
    divider("Transferring admin to ADMIN_ADDRESS");
    console.log("  · OpinionCore.transferFullAdmin");
    await (await opinionCore.transferFullAdmin(ADMIN)).wait();
    console.log("  · OpinionAdmin.transferFullAdmin");
    await (await opinionAdmin.transferFullAdmin(ADMIN)).wait();
    console.log("  · OpinionExtensions.transferFullAdmin");
    await (await opinionExtensions.transferFullAdmin(ADMIN)).wait();
    console.log("  · PoolManager.transferFullAdmin");
    await (await poolManager.transferFullAdmin(ADMIN)).wait();
    console.log("  · FeeManager.transferFullAdmin");
    await (await feeManager.transferFullAdmin(ADMIN)).wait();
    console.log("  ✅ Admin transferred. Deployer no longer holds admin roles.");
  }

  // ─── Save deployment record ─────────────────────────────────────────
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });
  const filename = `${network.name}-v4-fresh.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(out, null, 2));
  console.log(`\n  📝 Saved to deployments/${filename}`);

  // ─── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(70));
  console.log("  ✅ DEPLOYMENT COMPLETE");
  console.log("═".repeat(70));
  console.log(`\nProxy addresses (use these in frontend):`);
  console.log(`  OpinionCore:        ${out.opinionCore}`);
  console.log(`  PoolManager:        ${out.poolManager}`);
  console.log(`  FeeManager:         ${out.feeManager}`);
  console.log(`  OpinionAdmin:       ${out.opinionAdmin}`);
  console.log(`  OpinionExtensions:  ${out.opinionExtensions}`);
  console.log(`  ValidationLibrary:  ${out.validationLibrary}`);
  console.log(`  PriceCalculator:    ${out.priceCalculator}`);
  console.log(`  SelfExitLib:        ${out.selfExitLib}`);

  console.log(`\nNext steps:`);
  console.log(`  1. Update apps/web/src/lib/contracts.ts with the proxy addresses above.`);
  console.log(`  2. Verify on Basescan:`);
  console.log(`     npx hardhat verify --network ${network.name} ${out.opinionCoreImpl}`);
  console.log(`     (repeat for each impl + libraries)`);
  console.log(`  3. To live-test self-exit with a fast cooldown:`);
  console.log(`     opinionCore.setSelfExitParameter(0, 60)   // 60s cooldown`);
  console.log(`     opinionCore.setSelfExitFlag(0, true)      // enable self-exit`);
  console.log(`     opinionCore.setSelfExitFlag(1, true)      // enable reclaim`);
  console.log(`     poolManager.setStalePoolExitEnabled(true) // enable pool exits`);
  console.log(`  4. After testing, restore production cooldown:`);
  console.log(`     opinionCore.setSelfExitParameter(0, ${14 * 24 * 60 * 60})  // 14 days\n`);
}

main().catch((err) => {
  console.error("\n❌ Deploy failed:", err);
  process.exit(1);
});
