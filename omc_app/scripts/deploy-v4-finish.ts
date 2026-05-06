/**
 * V4 Deploy — Final 3 Admin Calls
 *
 * Wraps up after deploy-v4-final.ts succeeded but choked on the
 * `factory.runner` having no signer. All deploys are done; this just
 * does the last 3 admin txs:
 *   1. OpinionCore.grantRole(POOL_MANAGER_ROLE, PoolManager)
 *   2. OpinionCore.initializeV4()
 *   3. PoolManager.initializeV2()
 */

import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const D = {
  validationLibrary: "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681",
  priceCalculator: "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7",
  selfExitLib: "0x30c465f5772dc86555d37fE1376218Cbf79a4D93",
  feeManager: "0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA",
  feeManagerImpl: "0xBC2cc09AfB1c5fB47d40BF8860416FA7Be9804e6",
  poolManager: "0x34537a749F4b16E7542a59e5322338372A6a1E3c",
  poolManagerImpl: "0x2cb3b0b143d9155db3b007d90b20cecc1af69cdf",
  opinionAdmin: "0x202Bc4E3aB50147212bee0506bF5f2B544333b5D",
  opinionAdminImpl: "0x297a71b4e4d5dcc0d8d69995091b50359ca08fb7",
  opinionExtensions: "0x2eD0DC454043A768cB3FA7e480c41Be7b8954394",
  opinionExtensionsImpl: "0xd20C3d839C40A27327936224eE8912398b19A9C4",
  opinionCore: "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1",
  opinionCoreImpl: "0xa5a47efc129ba25ec9066b6439684daa3e3df1e5",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  const opinionCore = await ethers.getContractAt("OpinionCoreV4", D.opinionCore, deployer);
  const poolManager = await ethers.getContractAt("PoolManagerV2", D.poolManager, deployer);

  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));

  console.log("1/3  OpinionCore.grantRole(POOL_MANAGER_ROLE, PoolManager)");
  await (await opinionCore.grantRole(POOL_MANAGER_ROLE, D.poolManager)).wait();
  console.log("     ✅");
  await sleep(2000);

  console.log("2/3  OpinionCoreV4.initializeV4()");
  await (await opinionCore.initializeV4()).wait();
  console.log("     ✅");
  await sleep(2000);

  console.log("3/3  PoolManagerV2.initializeV2()");
  await (await poolManager.initializeV2()).wait();
  console.log("     ✅");

  // ─── Save deployment record ─────────────────────────────────────────
  const out = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    treasury: process.env.TREASURY_ADDRESS,
    admin: process.env.ADMIN_ADDRESS,
    usdc: process.env.USDC_TOKEN_ADDRESS,
    ...D,
    featureFlags: {
      selfExitEnabled: await opinionCore.selfExitEnabled(),
      reclaimVacantSlotEnabled: await opinionCore.reclaimVacantSlotEnabled(),
      stalePoolExitEnabled: await poolManager.stalePoolExitEnabled(),
    },
  };
  const filepath = path.join(__dirname, "..", "deployments", `${network.name}-v4-fresh.json`);
  fs.writeFileSync(filepath, JSON.stringify(out, null, 2));

  console.log("\n══════════════════════════════════════════════════════════════════════");
  console.log("  ✅ V4 + V2 DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════════════════════════════════════");
  console.log("\nProxies (use these in frontend):");
  console.log(`  OpinionCore:        ${D.opinionCore}`);
  console.log(`  PoolManager:        ${D.poolManager}`);
  console.log(`  FeeManager:         ${D.feeManager}`);
  console.log(`  OpinionAdmin:       ${D.opinionAdmin}`);
  console.log(`  OpinionExtensions:  ${D.opinionExtensions}`);
  console.log(`  ValidationLibrary:  ${D.validationLibrary}`);
  console.log(`  PriceCalculator:    ${D.priceCalculator}`);
  console.log(`  SelfExitLib:        ${D.selfExitLib}`);
  console.log(`\nFeature flags (all FALSE — admin enables manually after testing):`);
  console.log(`  selfExitEnabled:          ${out.featureFlags.selfExitEnabled}`);
  console.log(`  reclaimVacantSlotEnabled: ${out.featureFlags.reclaimVacantSlotEnabled}`);
  console.log(`  stalePoolExitEnabled:     ${out.featureFlags.stalePoolExitEnabled}`);
  console.log(`\nSaved to deployments/${network.name}-v4-fresh.json\n`);
}

main().catch((err) => {
  console.error("\n❌ Failed:", err);
  process.exit(1);
});
