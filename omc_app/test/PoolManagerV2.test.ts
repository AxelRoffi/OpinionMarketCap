/**
 * PoolManagerV2 — Stale-Exit Tests
 *
 * Coverage:
 *   1. Trigger preconditions (feature flag, pool status, no double-dissolve)
 *   2. Cooldown enforcement (21d for large holders, 35d for anyone)
 *   3. Trigger authorization (no contribution, below threshold)
 *   4. Dissolution effects (state, refund, events)
 *   5. Claim refund (pro-rata math, double-claim guard, non-contributor)
 *   6. Admin (feature flag gating)
 *
 * Setup:
 *   Real pool flow — create opinion, create pool, contributors fund it to
 *   target, pool auto-executes and becomes king of the opinion's answer.
 *   Then we time-warp past cooldowns and exercise the V2 dissolution paths.
 */

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PoolManagerV2 — Stale Exit", function () {
  const ONE_USDC = 10n ** 6n;
  const HUNDRED_USDC = 100n * ONE_USDC;
  const SPAM_FEE = 2n * ONE_USDC;
  const POOL_CREATION_FEE = 5n * ONE_USDC;
  const POOL_COOLDOWN = 21 * 24 * 60 * 60;
  const POOL_EXTENDED_COOLDOWN = 35 * 24 * 60 * 60;
  const EXIT_PENALTY_BPS = 2000n;
  const BPS_DENOM = 10000n;
  const LARGE_HOLDER_THRESHOLD_BPS = 1000n; // 10%

  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));

  let usdc: any;
  let feeManager: any;
  let poolManager: any; // PoolManagerV2 proxy
  let opinionAdmin: any;
  let opinionExtensions: any;
  let opinionCore: any; // OpinionCoreV4 proxy
  let validationLibAddress: string;
  let priceCalcAddress: string;
  let selfExitLibAddress: string;

  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let bigContributor: SignerWithAddress;
  let smallContributor1: SignerWithAddress;
  let smallContributor2: SignerWithAddress;
  let smallContributor3: SignerWithAddress;
  let outsider: SignerWithAddress;

  async function fundCore(account: SignerWithAddress, amount: bigint) {
    await usdc.mint(account.address, amount);
    await usdc.connect(account).approve(await opinionCore.getAddress(), amount);
  }

  async function fundPool(account: SignerWithAddress, amount: bigint) {
    await usdc.mint(account.address, amount);
    await usdc.connect(account).approve(await poolManager.getAddress(), amount);
  }

  /**
   * Deploys an opinion at $100 and a pool that gets filled to target by 4
   * contributors with different stake sizes. Returns the poolId and opinionId
   * after the pool has Executed (and thus become king).
   *
   * Stake breakdown (relative to nextPrice ~$115):
   *   - bigContributor:     ≥ 50 USDC   (large holder, > 10% threshold)
   *   - smallContributor1:   ~20 USDC   (regular)
   *   - smallContributor2:   ~20 USDC   (regular)
   *   - smallContributor3:   remainder  (small holder)
   */
  async function setupExecutedPool(): Promise<{ poolId: bigint; opinionId: bigint; nextPrice: bigint }> {
    // Creator opens an opinion at $100 (lockedStake = $100, nextPrice ~$115)
    await fundCore(creator, HUNDRED_USDC + SPAM_FEE);
    await opinionCore
      .connect(creator)
      .createOpinion("question?", "yes", "desc", HUNDRED_USDC, ["Technology"]);

    const opinionId = (await opinionCore.nextOpinionId()) - 1n;
    const nextPrice: bigint = await opinionCore.getNextPrice(opinionId);

    // Skew contributions so bigContributor is well above 10% threshold
    // and the small ones are clearly below.
    //
    // Layout (target ~= nextPrice):
    //   bigContributor:    nextPrice - 4 USDC   (>96%)
    //   smallContributor1: 2 USDC               (~2%)
    //   smallContributor2: 1 USDC               (<1%)
    //   smallContributor3: 1 USDC               (<1%)
    const initialContribution = nextPrice - 4n * ONE_USDC;
    const totalNeededByCreator = POOL_CREATION_FEE + initialContribution;
    await fundPool(bigContributor, totalNeededByCreator);

    const block = await ethers.provider.getBlock("latest");
    const deadline = BigInt(block!.timestamp) + 7n * 24n * 60n * 60n;

    await poolManager
      .connect(bigContributor)
      .createPool(opinionId, "no", deadline, initialContribution, "TestPool", "");

    const poolId = (await poolManager.poolCount()) - 1n;

    await fundPool(smallContributor1, 2n * ONE_USDC);
    await poolManager.connect(smallContributor1).contributeToPool(poolId, 2n * ONE_USDC);

    await fundPool(smallContributor2, ONE_USDC);
    await poolManager.connect(smallContributor2).contributeToPool(poolId, ONE_USDC);

    await fundPool(smallContributor3, ONE_USDC);
    await poolManager.connect(smallContributor3).contributeToPool(poolId, ONE_USDC);

    // Confirm pool is Executed and is now king
    const pool = await poolManager.pools(poolId);
    expect(pool.status).to.equal(1); // Executed

    const opinion = await opinionCore.getOpinionDetails(opinionId);
    expect(opinion.currentAnswerOwner).to.equal(await poolManager.getAddress());

    return { poolId, opinionId, nextPrice };
  }

  beforeEach(async function () {
    [deployer, admin, treasury, creator, bigContributor, smallContributor1, smallContributor2, smallContributor3, outsider] =
      await ethers.getSigners();

    // Mocks + libraries
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USDC", "USDC");
    await usdc.waitForDeployment();

    const ValidationLib = await ethers.getContractFactory("ValidationLibrary");
    const validationLib = await ValidationLib.deploy();
    await validationLib.waitForDeployment();
    validationLibAddress = await validationLib.getAddress();

    const PriceCalc = await ethers.getContractFactory("PriceCalculator");
    const priceCalc = await PriceCalc.deploy();
    await priceCalc.waitForDeployment();
    priceCalcAddress = await priceCalc.getAddress();

    const SelfExitLib = await ethers.getContractFactory("SelfExitLib", {
      libraries: { ValidationLibrary: validationLibAddress },
    });
    const selfExitLib = await SelfExitLib.deploy();
    await selfExitLib.waitForDeployment();
    selfExitLibAddress = await selfExitLib.getAddress();

    // FeeManager
    const FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await upgrades.deployProxy(
      FeeManager,
      [await usdc.getAddress(), treasury.address],
      { initializer: "initialize" }
    );
    await feeManager.waitForDeployment();

    // PoolManagerV2 (deployed as initial implementation; inherits V1 fully)
    const PMV2 = await ethers.getContractFactory("PoolManagerV2", {
      libraries: { ValidationLibrary: validationLibAddress },
    });
    poolManager = await upgrades.deployProxy(
      PMV2,
      [
        ethers.ZeroAddress,
        await feeManager.getAddress(),
        await usdc.getAddress(),
        treasury.address,
        admin.address,
      ],
      { initializer: "initialize", unsafeAllowLinkedLibraries: true }
    );
    await poolManager.waitForDeployment();

    // OpinionAdmin
    const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
    opinionAdmin = await upgrades.deployProxy(
      OpinionAdmin,
      [ethers.ZeroAddress, await usdc.getAddress(), treasury.address, admin.address],
      { initializer: "initialize" }
    );
    await opinionAdmin.waitForDeployment();

    // OpinionExtensionsV2
    const OpinionExt = await ethers.getContractFactory("OpinionExtensionsV2");
    opinionExtensions = await upgrades.deployProxy(
      OpinionExt,
      [ethers.ZeroAddress, admin.address],
      { initializer: "initialize" }
    );
    await opinionExtensions.waitForDeployment();

    // OpinionCoreV4
    const Core = await ethers.getContractFactory("OpinionCoreV4", {
      libraries: {
        ValidationLibrary: validationLibAddress,
        PriceCalculator: priceCalcAddress,
        SelfExitLib: selfExitLibAddress,
      },
    });
    opinionCore = await upgrades.deployProxy(
      Core,
      [
        await usdc.getAddress(),
        deployer.address,
        await feeManager.getAddress(),
        await poolManager.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        treasury.address,
        await opinionExtensions.getAddress(),
        await opinionAdmin.getAddress(),
      ],
      { initializer: "initialize", unsafeAllowLinkedLibraries: true }
    );
    await opinionCore.waitForDeployment();

    // Wire & roles
    const coreAddr = await opinionCore.getAddress();
    await opinionAdmin.connect(admin).setCoreContract(coreAddr);
    await opinionExtensions.connect(admin).setCoreContract(coreAddr);
    await poolManager.connect(admin).setOpinionCore(coreAddr);
    await feeManager.connect(deployer).grantCoreContractRole(coreAddr);
    await opinionCore.connect(deployer).grantRole(POOL_MANAGER_ROLE, await poolManager.getAddress());

    // Initialize V4 + V2 reinitializers, then enable features
    await opinionCore.connect(deployer).initializeV4();
    await poolManager.connect(admin).initializeV2();
    await opinionCore.connect(deployer).setSelfExitFlag(0, true); // selfExit (V4) enabled
    await poolManager.connect(admin).setStalePoolExitEnabled(true);
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 1 — Preconditions
  // ════════════════════════════════════════════════════════════════════
  describe("1. Trigger preconditions", function () {
    it("1.1 reverts if feature is disabled", async function () {
      const { poolId } = await setupExecutedPool();
      await poolManager.connect(admin).setStalePoolExitEnabled(false);
      await time.increase(POOL_EXTENDED_COOLDOWN + 1);
      await expect(
        poolManager.connect(bigContributor).triggerPoolStaleExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "StalePoolExitDisabled");
    });

    it("1.2 reverts on invalid poolId", async function () {
      await expect(
        poolManager.connect(bigContributor).triggerPoolStaleExit(999)
      ).to.be.reverted;
    });

    it("1.3 reverts if pool is not Executed (e.g., still Active)", async function () {
      // Create a pool but DON'T fill it to target — stays Active
      await fundCore(creator, HUNDRED_USDC + SPAM_FEE);
      await opinionCore
        .connect(creator)
        .createOpinion("question?", "yes", "desc", HUNDRED_USDC, ["Technology"]);
      const opinionId = (await opinionCore.nextOpinionId()) - 1n;
      const nextPrice: bigint = await opinionCore.getNextPrice(opinionId);

      await fundPool(bigContributor, POOL_CREATION_FEE + ONE_USDC);
      const block = await ethers.provider.getBlock("latest");
      const deadline = BigInt(block!.timestamp) + 7n * 24n * 60n * 60n;
      await poolManager
        .connect(bigContributor)
        .createPool(opinionId, "no", deadline, ONE_USDC, "Half-baked", "");

      const poolId = (await poolManager.poolCount()) - 1n;

      await time.increase(POOL_EXTENDED_COOLDOWN + 1);
      await expect(
        poolManager.connect(bigContributor).triggerPoolStaleExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "PoolNotExecuted");
    });

    it("1.4 reverts on second dissolution attempt", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 1);
      await poolManager.connect(bigContributor).triggerPoolStaleExit(poolId);
      await expect(
        poolManager.connect(smallContributor1).triggerPoolStaleExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "AlreadyDissolved");
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 2 — Cooldown enforcement
  // ════════════════════════════════════════════════════════════════════
  describe("2. Cooldown enforcement", function () {
    it("2.1 large-holder trigger reverts before 21-day cooldown", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN - 60); // just before
      await expect(
        poolManager.connect(bigContributor).triggerLargePoolExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "CooldownNotMet");
    });

    it("2.2 large-holder trigger succeeds after 21-day cooldown", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN + 60);
      await expect(
        poolManager.connect(bigContributor).triggerLargePoolExit(poolId)
      ).to.not.be.reverted;
    });

    it("2.3 anyone-trigger reverts before 35-day cooldown", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN + 60); // past large-holder window but not extended
      await expect(
        poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "CooldownNotMet");
    });

    it("2.4 anyone-trigger succeeds after 35-day cooldown", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);
      await expect(
        poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId)
      ).to.not.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 3 — Trigger authorization
  // ════════════════════════════════════════════════════════════════════
  describe("3. Authorization", function () {
    it("3.1 large-holder trigger reverts for non-contributor", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN + 60);
      await expect(
        poolManager.connect(outsider).triggerLargePoolExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "NoContribution");
    });

    it("3.2 large-holder trigger reverts for contributor below threshold", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN + 60);

      // smallContributor3 has the smallest stake (~$5 of ~$115 = 4%, below 10% threshold)
      const c3Contribution: bigint = await poolManager.poolContributionAmounts(poolId, smallContributor3.address);
      const poolTotal: bigint = (await poolManager.pools(poolId)).totalAmount;
      const c3Bps = (c3Contribution * BPS_DENOM) / poolTotal;
      expect(c3Bps).to.be.lt(LARGE_HOLDER_THRESHOLD_BPS);

      await expect(
        poolManager.connect(smallContributor3).triggerLargePoolExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "NotALargeHolder");
    });

    it("3.3 anyone-trigger reverts for non-contributor (even after extended cooldown)", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);
      await expect(
        poolManager.connect(outsider).triggerPoolStaleExit(poolId)
      ).to.be.revertedWithCustomError(poolManager, "NoContribution");
    });

    it("3.4 small contributor (below threshold) CAN trigger via the anyone path", async function () {
      const { poolId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);
      await expect(
        poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId)
      ).to.not.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 4 — Dissolution effects
  // ════════════════════════════════════════════════════════════════════
  describe("4. Dissolution state + USDC flow", function () {
    it("4.1 records dissolution data and pulls refund USDC from V4", async function () {
      const { poolId, opinionId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);

      const lockedStake: bigint = await opinionCore.lockedStake(opinionId);
      expect(lockedStake).to.equal(HUNDRED_USDC); // initialPrice locked at creation

      const expectedPenalty = (lockedStake * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedRefund = lockedStake - expectedPenalty;

      const v2BalBefore: bigint = await usdc.balanceOf(await poolManager.getAddress());

      const tx = await poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId);
      await tx.wait();

      const v2BalAfter: bigint = await usdc.balanceOf(await poolManager.getAddress());

      // V2 received the refund from V4
      expect(v2BalAfter - v2BalBefore).to.equal(expectedRefund);

      // State recorded correctly
      const data = await poolManager.staleExits(poolId);
      expect(data.dissolved).to.equal(true);
      expect(data.totalRefund).to.equal(expectedRefund);
      // totalEligibleContribution = pool.totalAmount at trigger time
      const poolTotal: bigint = (await poolManager.pools(poolId)).totalAmount;
      expect(data.totalEligibleContribution).to.equal(poolTotal);
    });

    it("4.2 V4 slot becomes vacant after dissolution", async function () {
      const { poolId, opinionId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);
      await poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId);

      const opinion = await opinionCore.getOpinionDetails(opinionId);
      expect(opinion.currentAnswerOwner).to.equal(ethers.ZeroAddress);
      expect(await opinionCore.lockedStake(opinionId)).to.equal(0);
    });

    it("4.3 emits PoolStaleExitTriggered with correct params (anyone path)", async function () {
      const { poolId, opinionId } = await setupExecutedPool();
      await time.increase(POOL_EXTENDED_COOLDOWN + 60);

      const expectedPenalty = (HUNDRED_USDC * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedRefund = HUNDRED_USDC - expectedPenalty;
      const poolTotal: bigint = (await poolManager.pools(poolId)).totalAmount;

      await expect(poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId))
        .to.emit(poolManager, "PoolStaleExitTriggered")
        .withArgs(
          poolId,
          opinionId,
          smallContributor3.address,
          expectedRefund,
          poolTotal,
          false, // wasLargeHolder = false for anyone path
          (val: any) => typeof val === "bigint" && val > 0n
        );
    });

    it("4.4 emits with wasLargeHolder=true on the large-holder path", async function () {
      const { poolId, opinionId } = await setupExecutedPool();
      await time.increase(POOL_COOLDOWN + 60);

      const expectedPenalty = (HUNDRED_USDC * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedRefund = HUNDRED_USDC - expectedPenalty;
      const poolTotal: bigint = (await poolManager.pools(poolId)).totalAmount;

      await expect(poolManager.connect(bigContributor).triggerLargePoolExit(poolId))
        .to.emit(poolManager, "PoolStaleExitTriggered")
        .withArgs(
          poolId,
          opinionId,
          bigContributor.address,
          expectedRefund,
          poolTotal,
          true,
          (val: any) => typeof val === "bigint" && val > 0n
        );
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 5 — Claim refund (pull pattern)
  // ════════════════════════════════════════════════════════════════════
  describe("5. claimStaleRefund", function () {
    let poolId: bigint;
    let opinionId: bigint;
    let totalRefund: bigint;
    let totalContribution: bigint;

    beforeEach(async function () {
      const setup = await setupExecutedPool();
      poolId = setup.poolId;
      opinionId = setup.opinionId;

      await time.increase(POOL_EXTENDED_COOLDOWN + 60);
      await poolManager.connect(smallContributor3).triggerPoolStaleExit(poolId);

      const data = await poolManager.staleExits(poolId);
      totalRefund = data.totalRefund;
      totalContribution = data.totalEligibleContribution;
    });

    it("5.1 reverts if pool is not dissolved", async function () {
      // Setup a fresh undissolved pool
      const setup2 = await setupExecutedPool();
      await expect(
        poolManager.connect(bigContributor).claimStaleRefund(setup2.poolId)
      ).to.be.revertedWithCustomError(poolManager, "PoolNotDissolved");
    });

    it("5.2 each contributor receives pro-rata share", async function () {
      const contributors = [bigContributor, smallContributor1, smallContributor2, smallContributor3];

      for (const c of contributors) {
        const contribution: bigint = await poolManager.poolContributionAmounts(poolId, c.address);
        const expected = (contribution * totalRefund) / totalContribution;

        const before: bigint = await usdc.balanceOf(c.address);
        await poolManager.connect(c).claimStaleRefund(poolId);
        const after: bigint = await usdc.balanceOf(c.address);

        expect(after - before).to.equal(expected);
      }
    });

    it("5.3 cannot claim twice", async function () {
      await poolManager.connect(bigContributor).claimStaleRefund(poolId);
      await expect(
        poolManager.connect(bigContributor).claimStaleRefund(poolId)
      ).to.be.revertedWithCustomError(poolManager, "AlreadyClaimed");
    });

    it("5.4 non-contributor gets NoContribution revert", async function () {
      await expect(
        poolManager.connect(outsider).claimStaleRefund(poolId)
      ).to.be.revertedWithCustomError(poolManager, "NoContribution");
    });

    it("5.5 sum of all claims equals totalRefund (no dust loss beyond rounding)", async function () {
      const contributors = [bigContributor, smallContributor1, smallContributor2, smallContributor3];

      let totalClaimed = 0n;
      for (const c of contributors) {
        const before: bigint = await usdc.balanceOf(c.address);
        await poolManager.connect(c).claimStaleRefund(poolId);
        const after: bigint = await usdc.balanceOf(c.address);
        totalClaimed += after - before;
      }

      // Allow up to N-1 wei dust where N = number of contributors (mul-before-div rounding)
      const dust = totalRefund - totalClaimed;
      expect(dust).to.be.gte(0n);
      expect(dust).to.be.lt(BigInt(contributors.length));
    });

    it("5.6 pendingStaleRefund matches actual refund", async function () {
      const pending: bigint = await poolManager.pendingStaleRefund(poolId, bigContributor.address);
      const before: bigint = await usdc.balanceOf(bigContributor.address);
      await poolManager.connect(bigContributor).claimStaleRefund(poolId);
      const after: bigint = await usdc.balanceOf(bigContributor.address);
      expect(after - before).to.equal(pending);
    });

    it("5.7 pendingStaleRefund returns 0 after claim", async function () {
      await poolManager.connect(bigContributor).claimStaleRefund(poolId);
      const pending: bigint = await poolManager.pendingStaleRefund(poolId, bigContributor.address);
      expect(pending).to.equal(0n);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 6 — Admin
  // ════════════════════════════════════════════════════════════════════
  describe("6. Admin", function () {
    it("6.1 setStalePoolExitEnabled is role-gated", async function () {
      await expect(poolManager.connect(outsider).setStalePoolExitEnabled(false)).to.be.reverted;
    });

    it("6.2 setStalePoolExitEnabled toggles the flag and emits event", async function () {
      await expect(poolManager.connect(admin).setStalePoolExitEnabled(false))
        .to.emit(poolManager, "StalePoolExitToggled")
        .withArgs(false);
      expect(await poolManager.stalePoolExitEnabled()).to.equal(false);
    });
  });
});
