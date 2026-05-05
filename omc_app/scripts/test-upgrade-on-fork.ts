/**
 * V3 → V4 + PoolManager V1 → V2 forked-mainnet upgrade test
 *
 * Runs the full upgrade flow against a local Base-mainnet fork and asserts:
 *   1. V3 storage layout is preserved (existing opinions still readable)
 *   2. V4 defaults are set, feature flags off
 *   3. Legacy opinions have lockedStake = 0 (Path A migration)
 *   4. Legacy opinions cannot self-exit (LegacyPositionNotEligible)
 *   5. New opinions created post-upgrade have lockedStake = initialPrice
 *   6. Self-exit on a new opinion succeeds, refunds 80% of lockedStake
 *   7. PoolManager V2 upgrade preserves V1 pool state
 *
 * This script costs zero ETH and zero real-network footprint. Run with:
 *   $ npx hardhat node --fork https://mainnet.base.org   # in one terminal
 *   $ npx hardhat run scripts/test-upgrade-on-fork.ts --network localhost
 */

import { ethers, upgrades, network } from "hardhat";
import type { ContractFactory, Signer } from "ethers";

// ─── Mainnet addresses (Base) ─────────────────────────────────────────
const ADDR = {
  ADMIN: "0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C",
  OPINION_CORE: "0x7b5d97fb78fbf41432F34f46a901C6da7754A726",
  POOL_MANAGER: "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e",
  OPINION_ADMIN: "0x4F0A1938E8707292059595275F9BBD067A301FD2",
  OPINION_EXTENSIONS: "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA",
  FEE_MANAGER: "0x31D604765CD76Ff098A283881B2ca57e7F703199",
  VALIDATION_LIB: "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5",
  PRICE_CALC: "0x99677761a6908EBde8BaD60cEfb2374C9f9afCEE",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
} as const;

const ONE_USDC = 10n ** 6n;

// USDC mainnet contract storage layout: balances mapping is at slot 9.
// We use this to "give" the test wallet some USDC by direct slot poking
// (cheaper than running a swap on the fork).
const USDC_BALANCES_SLOT = 9n;

function ok(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✅ ${msg}`);
}

function info(label: string, value: unknown) {
  console.log(`  · ${label}: ${value}`);
}

async function impersonate(address: string, ethBalance: bigint = 10n ** 18n): Promise<Signer> {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  await network.provider.request({
    method: "hardhat_setBalance",
    params: [address, "0x" + ethBalance.toString(16)],
  });
  return ethers.getSigner(address);
}

/** Funds an address with USDC by writing directly to the canonical USDC balances slot. */
async function fundUSDC(addr: string, amount: bigint) {
  const slot = ethers.solidityPackedKeccak256(
    ["uint256", "uint256"],
    [addr, USDC_BALANCES_SLOT]
  );
  await network.provider.request({
    method: "hardhat_setStorageAt",
    params: [
      ADDR.USDC,
      slot,
      ethers.zeroPadValue(ethers.toBeHex(amount), 32),
    ],
  });
}

async function main() {
  console.log("\n" + "═".repeat(70));
  console.log("  V3 → V4 FORKED-MAINNET UPGRADE TEST");
  console.log("═".repeat(70));

  // ─── Setup ─────────────────────────────────────────────────────────
  const net = await ethers.provider.getNetwork();
  console.log(`\nNetwork: chainId=${net.chainId}`);
  if (net.chainId !== 8453n && net.chainId !== 31337n) {
    throw new Error(`Expected Base (8453) or local fork (31337), got ${net.chainId}`);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer (gas payer): ${deployer.address}`);

  const adminSigner = await impersonate(ADDR.ADMIN);
  console.log(`Admin (impersonated): ${ADDR.ADMIN}`);

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[1/8] Capturing pre-upgrade V3 state ────────────────────");
  // ═══════════════════════════════════════════════════════════════════
  const v3 = await ethers.getContractAt("OpinionCoreV3", ADDR.OPINION_CORE);

  const preNextId: bigint = await v3.nextOpinionId();
  const preMinPrice: bigint = await v3.minimumPrice();
  info("nextOpinionId", preNextId);
  info("existing opinions", preNextId - 1n);
  info("minimumPrice", `${preMinPrice} (${Number(preMinPrice) / 1e6} USDC)`);

  // Snapshot a few opinions if any exist
  const sampleIds: bigint[] = [];
  if (preNextId > 1n) {
    const last = preNextId - 1n;
    sampleIds.push(1n);
    if (last >= 2n) sampleIds.push(last);
    if (last >= 3n) sampleIds.push((1n + last) / 2n);
  }
  const preSnapshot = new Map<string, any>();
  for (const id of sampleIds) {
    const op = await v3.getOpinionDetails(id);
    preSnapshot.set(id.toString(), {
      currentAnswerOwner: op.currentAnswerOwner,
      lastPrice: op.lastPrice,
      creator: op.creator,
      isActive: op.isActive,
    });
    console.log(
      `  · #${id}: owner=${op.currentAnswerOwner.slice(0, 10)}… lastPrice=${
        Number(op.lastPrice) / 1e6
      } USDC active=${op.isActive}`
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[2/8] Deploying SelfExitLib ─────────────────────────────");
  // ═══════════════════════════════════════════════════════════════════
  const SelfExitLib = await ethers.getContractFactory("SelfExitLib", {
    libraries: { ValidationLibrary: ADDR.VALIDATION_LIB },
  });
  const selfExitLib = await SelfExitLib.deploy();
  await selfExitLib.waitForDeployment();
  const selfExitLibAddr = await selfExitLib.getAddress();
  info("SelfExitLib deployed at", selfExitLibAddr);

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[3/8] Upgrading OpinionCore V3 → V4 ─────────────────────");
  // ═══════════════════════════════════════════════════════════════════
  const V4Factory = (
    await ethers.getContractFactory("OpinionCoreV4", {
      libraries: {
        ValidationLibrary: ADDR.VALIDATION_LIB,
        PriceCalculator: ADDR.PRICE_CALC,
        SelfExitLib: selfExitLibAddr,
      },
    })
  ).connect(adminSigner) as ContractFactory;

  const upgraded = await upgrades.upgradeProxy(ADDR.OPINION_CORE, V4Factory, {
    unsafeAllowLinkedLibraries: true,
  });
  await upgraded.waitForDeployment();
  info("Proxy now points at V4 implementation", await upgrades.erc1967.getImplementationAddress(ADDR.OPINION_CORE));

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[4/8] Calling initializeV4 ──────────────────────────────");
  // ═══════════════════════════════════════════════════════════════════
  const v4 = (await ethers.getContractAt("OpinionCoreV4", ADDR.OPINION_CORE)).connect(
    adminSigner
  ) as any;

  await (await v4.initializeV4()).wait();
  info("initializeV4 OK", "version bumped");

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[5/8] Asserting state preservation + V4 defaults ────────");
  // ═══════════════════════════════════════════════════════════════════
  const postNextId: bigint = await v4.nextOpinionId();
  ok(postNextId === preNextId, `nextOpinionId preserved (${postNextId})`);
  ok((await v4.minimumPrice()) === preMinPrice, `minimumPrice preserved`);

  for (const id of sampleIds) {
    const op = await v4.getOpinionDetails(id);
    const before = preSnapshot.get(id.toString())!;
    ok(
      op.currentAnswerOwner.toLowerCase() === before.currentAnswerOwner.toLowerCase() &&
        op.lastPrice === before.lastPrice &&
        op.creator.toLowerCase() === before.creator.toLowerCase() &&
        op.isActive === before.isActive,
      `Opinion #${id} state intact`
    );
    // Path A: legacy opinions get lockedStake = 0
    const lockedStake: bigint = await v4.lockedStake(id);
    ok(lockedStake === 0n, `Opinion #${id} lockedStake = 0 (legacy)`);
  }

  ok((await v4.soloCooldown()) === 14n * 24n * 60n * 60n, "soloCooldown = 14 days");
  ok((await v4.poolCooldown()) === 21n * 24n * 60n * 60n, "poolCooldown = 21 days");
  ok((await v4.exitPenaltyBps()) === 2000n, "exitPenaltyBps = 20%");
  ok((await v4.spamFee()) === 2n * ONE_USDC, "spamFee = 2 USDC");
  ok((await v4.selfExitEnabled()) === false, "selfExitEnabled = false (safe default)");
  ok(
    (await v4.reclaimVacantSlotEnabled()) === false,
    "reclaimVacantSlotEnabled = false (safe default)"
  );

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[6/8] Legacy opinion CANNOT self-exit ───────────────────");
  // ═══════════════════════════════════════════════════════════════════
  if (sampleIds.length > 0) {
    // Enable feature so the revert reason is the legacy guard, not the feature flag
    await (await v4.setSelfExitFlag(0, true)).wait();
    // Time-warp past cooldown
    await network.provider.request({ method: "evm_increaseTime", params: [15 * 24 * 60 * 60] });
    await network.provider.request({ method: "evm_mine", params: [] });

    const id = sampleIds[0];
    const opinion = await v4.getOpinionDetails(id);
    const ownerSigner = await impersonate(opinion.currentAnswerOwner);
    let reverted = false;
    try {
      await v4.connect(ownerSigner).selfExit(id);
    } catch (e: any) {
      reverted = true;
      info("Revert message", e?.shortMessage ?? e?.message?.slice(0, 80));
    }
    ok(reverted, `selfExit on legacy opinion #${id} reverted`);

    // Disable again so step 7 starts cleanly
    await (await v4.setSelfExitFlag(0, false)).wait();
  } else {
    console.log("  · skipped (no existing opinions)");
  }

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[7/8] NEW opinion has lockedStake + can self-exit ───────");
  // ═══════════════════════════════════════════════════════════════════
  // Fund a fresh wallet with USDC + ETH
  const newKing = ethers.Wallet.createRandom().connect(ethers.provider);
  await network.provider.request({
    method: "hardhat_setBalance",
    params: [newKing.address, "0x" + (10n ** 18n).toString(16)],
  });
  const initialPrice = 50n * ONE_USDC; // $50 opinion
  const totalCost = initialPrice + 2n * ONE_USDC; // + spamFee
  await fundUSDC(newKing.address, totalCost * 2n);

  const usdc = await ethers.getContractAt(
    [
      "function approve(address,uint256) external returns (bool)",
      "function balanceOf(address) external view returns (uint256)",
    ],
    ADDR.USDC,
    newKing
  );
  await (await usdc.approve(ADDR.OPINION_CORE, totalCost)).wait();
  info("New king USDC balance", `${Number(await usdc.balanceOf(newKing.address)) / 1e6} USDC`);

  const v4AsKing = v4.connect(newKing);
  await (
    await v4AsKing.createOpinion(
      `fork test ${Date.now()}`,
      "yes",
      "first answer",
      initialPrice,
      ["Technology"]
    )
  ).wait();

  const newId: bigint = (await v4.nextOpinionId()) - 1n;
  info("New opinion id", newId);
  const newLock: bigint = await v4.lockedStake(newId);
  ok(newLock === initialPrice, `New opinion lockedStake = initialPrice ($${Number(newLock) / 1e6})`);

  const opAfterCreate = await v4.getOpinionDetails(newId);
  ok(
    opAfterCreate.currentAnswerOwner.toLowerCase() === newKing.address.toLowerCase(),
    "New king is currentAnswerOwner"
  );

  // Self-exit happy path
  await (await v4.setSelfExitFlag(0, true)).wait();
  await network.provider.request({ method: "evm_increaseTime", params: [15 * 24 * 60 * 60] });
  await network.provider.request({ method: "evm_mine", params: [] });

  const balBefore: bigint = await usdc.balanceOf(newKing.address);
  await (await v4AsKing.selfExit(newId)).wait();
  const balAfter: bigint = await usdc.balanceOf(newKing.address);

  const expectedRefund = (initialPrice * 8000n) / 10000n; // 80%
  const actualRefund = balAfter - balBefore;
  ok(
    actualRefund === expectedRefund,
    `Self-exit refunded ${Number(actualRefund) / 1e6} USDC (= 80% of $${Number(initialPrice) / 1e6})`
  );

  const lockAfterExit: bigint = await v4.lockedStake(newId);
  ok(lockAfterExit === 0n, "lockedStake zeroed after exit");

  const opAfterExit = await v4.getOpinionDetails(newId);
  ok(
    opAfterExit.currentAnswerOwner === ethers.ZeroAddress,
    "Slot is vacant after exit"
  );

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n[8/8] PoolManager V1 → V2 upgrade ───────────────────────");
  // ═══════════════════════════════════════════════════════════════════
  const v1Pool = await ethers.getContractAt("PoolManager", ADDR.POOL_MANAGER);
  const prePoolCount: bigint = await v1Pool.poolCount();
  info("Existing poolCount", prePoolCount);

  const PMV2Factory = (
    await ethers.getContractFactory("PoolManagerV2", {
      libraries: { ValidationLibrary: ADDR.VALIDATION_LIB },
    })
  ).connect(adminSigner) as ContractFactory;

  const upgradedPool = await upgrades.upgradeProxy(ADDR.POOL_MANAGER, PMV2Factory, {
    unsafeAllowLinkedLibraries: true,
  });
  await upgradedPool.waitForDeployment();
  info("Pool proxy now points at V2 impl", await upgrades.erc1967.getImplementationAddress(ADDR.POOL_MANAGER));

  const v2Pool = (
    await ethers.getContractAt("PoolManagerV2", ADDR.POOL_MANAGER)
  ).connect(adminSigner) as any;

  await (await v2Pool.initializeV2()).wait();
  info("initializeV2 OK", "version bumped");

  ok((await v2Pool.poolCount()) === prePoolCount, `poolCount preserved (${prePoolCount})`);
  ok(
    (await v2Pool.stalePoolExitEnabled()) === false,
    "stalePoolExitEnabled = false (safe default)"
  );

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("  ✅ ALL CHECKS PASSED — UPGRADE PATH IS SAFE");
  console.log("═".repeat(70));
  console.log("\nNew implementation addresses (deployed locally on the fork):");
  console.log(`  SelfExitLib:    ${selfExitLibAddr}`);
  console.log(`  V4 impl:        ${await upgrades.erc1967.getImplementationAddress(ADDR.OPINION_CORE)}`);
  console.log(`  V2 pool impl:   ${await upgrades.erc1967.getImplementationAddress(ADDR.POOL_MANAGER)}`);
  console.log("\nThese addresses are local-only. For mainnet, run the upgrade against\n" +
              "the real network — the implementation contracts will be redeployed there.\n");
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
});
