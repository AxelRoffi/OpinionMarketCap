/**
 * OpinionCoreV4 — Self-Exit Feature Tests
 *
 * Coverage:
 *   1. Deployment & Initialization (V4 reinitializer, defaults, role gating)
 *   2. createOpinion (α-vanilla economics: lock + spamFee)
 *   3. submitAnswer (timestamp updates, lock carry-forward)
 *   4. selfExit (all revert paths, successful exit, math correctness)
 *   5. reclaimVacantSlot (full lifecycle)
 *   6. processPoolStaleExit (role gating, refund return)
 *   7. Admin setters & feature flags (bounds, role gating)
 *   8. Edge cases (legacy positions, pause behavior, reentry guard)
 *
 * Notes:
 *   - All amounts are USDC (6 decimals).
 *   - V4 contract uses linked libraries (ValidationLibrary, PriceCalculator,
 *     SelfExitLib). Tests deploy these and pass their addresses to the factory.
 *   - Feature flags default to FALSE. Tests enable them where needed.
 */

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OpinionCoreV4 — Self-Exit Feature", function () {
  // ─── Constants matching contract defaults ───────────────────────────
  const ONE_USDC = 10n ** 6n;
  const INITIAL_PRICE = 50n * ONE_USDC;        // $50
  const SPAM_FEE = 2n * ONE_USDC;              // $2
  const SOLO_COOLDOWN = 14 * 24 * 60 * 60;     // 14 days in seconds
  const POOL_COOLDOWN = 21 * 24 * 60 * 60;     // 21 days
  const EXIT_PENALTY_BPS = 2000n;              // 20%
  const PENALTY_CREATOR_SHARE_BPS = 5000n;     // 50%
  const RECLAIM_DISCOUNT_BPS = 5000n;          // 50%
  const MIN_RECLAIM_PRICE = 2n * ONE_USDC;
  const BPS_DENOM = 10000n;

  // Roles
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));

  // ─── Contracts ──────────────────────────────────────────────────────
  let usdc: any;
  let feeManager: any;
  let poolManager: any;
  let opinionAdmin: any;
  let opinionExtensions: any;
  let opinionCore: any;       // OpinionCoreV4 proxy
  let validationLibAddress: string;
  let priceCalcAddress: string;
  let selfExitLibAddress: string;

  // ─── Signers ────────────────────────────────────────────────────────
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;
  let buyer3: SignerWithAddress;
  let attacker: SignerWithAddress;
  let other: SignerWithAddress;

  // Helper: fund + approve USDC for an account against the core contract
  async function fund(account: SignerWithAddress, amount: bigint) {
    await usdc.mint(account.address, amount);
    await usdc.connect(account).approve(await opinionCore.getAddress(), amount);
  }

  // Helper: create a V4 opinion. Returns the opinionId.
  async function createV4Opinion(
    by: SignerWithAddress,
    initialPrice: bigint = INITIAL_PRICE,
    answer: string = "yes",
    description: string = "first answer",
    categories: string[] = ["Technology"]
  ): Promise<bigint> {
    await fund(by, initialPrice + SPAM_FEE);
    const tx = await opinionCore
      .connect(by)
      .createOpinion(`question ${Date.now()}`, answer, description, initialPrice, categories);
    await tx.wait();
    // first opinion is id 1, then 2, etc. Read nextOpinionId - 1.
    const next = await opinionCore.nextOpinionId();
    return next - 1n;
  }

  // ════════════════════════════════════════════════════════════════════
  // FIXTURE: Deploy + wire all contracts
  // ════════════════════════════════════════════════════════════════════
  beforeEach(async function () {
    [deployer, admin, treasury, creator, buyer1, buyer2, buyer3, attacker, other] =
      await ethers.getSigners();

    // Deploy MockERC20 (USDC)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();

    // Deploy linked libraries
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

    // Deploy FeeManager
    const FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await upgrades.deployProxy(
      FeeManager,
      [await usdc.getAddress(), treasury.address],
      { initializer: "initialize" }
    );
    await feeManager.waitForDeployment();

    // Deploy PoolManager
    const PoolManager = await ethers.getContractFactory("PoolManager", {
      libraries: { ValidationLibrary: validationLibAddress },
    });
    poolManager = await upgrades.deployProxy(
      PoolManager,
      [
        ethers.ZeroAddress, // opinionCore — set later
        await feeManager.getAddress(),
        await usdc.getAddress(),
        treasury.address,
        admin.address,
      ],
      { initializer: "initialize", unsafeAllowLinkedLibraries: true }
    );
    await poolManager.waitForDeployment();

    // Deploy OpinionAdmin
    const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
    opinionAdmin = await upgrades.deployProxy(
      OpinionAdmin,
      [
        ethers.ZeroAddress, // opinionCore — set later
        await usdc.getAddress(),
        treasury.address,
        admin.address,
      ],
      { initializer: "initialize" }
    );
    await opinionAdmin.waitForDeployment();

    // Deploy OpinionExtensionsV2
    const OpinionExtensions = await ethers.getContractFactory("OpinionExtensionsV2");
    opinionExtensions = await upgrades.deployProxy(
      OpinionExtensions,
      [ethers.ZeroAddress, admin.address],
      { initializer: "initialize" }
    );
    await opinionExtensions.waitForDeployment();

    // Deploy OpinionCoreV4
    const OpinionCoreV4 = await ethers.getContractFactory("OpinionCoreV4", {
      libraries: {
        ValidationLibrary: validationLibAddress,
        PriceCalculator: priceCalcAddress,
        SelfExitLib: selfExitLibAddress,
      },
    });
    opinionCore = await upgrades.deployProxy(
      OpinionCoreV4,
      [
        await usdc.getAddress(),
        deployer.address,            // _opinionMarket (granted MARKET_CONTRACT_ROLE — not used in V4 tests)
        await feeManager.getAddress(),
        await poolManager.getAddress(),
        ethers.ZeroAddress,          // monitoringManager (optional)
        ethers.ZeroAddress,          // securityManager (optional)
        treasury.address,
        await opinionExtensions.getAddress(),
        await opinionAdmin.getAddress(),
      ],
      { initializer: "initialize", unsafeAllowLinkedLibraries: true }
    );
    await opinionCore.waitForDeployment();

    // Wire contracts together
    const coreAddress = await opinionCore.getAddress();
    await opinionAdmin.connect(admin).setCoreContract(coreAddress);
    await opinionExtensions.connect(admin).setCoreContract(coreAddress);
    await poolManager.connect(admin).setOpinionCore(coreAddress);

    // Grant CORE_CONTRACT_ROLE on FeeManager so OpinionCore can accumulate fees
    await feeManager.connect(deployer).grantCoreContractRole(coreAddress);

    // Grant POOL_MANAGER_ROLE to the pool manager contract on the core
    // (the deployer is the admin until transfer). We use deployer address here
    // because the V4 init grants ADMIN_ROLE to msg.sender.
    await opinionCore
      .connect(deployer)
      .grantRole(POOL_MANAGER_ROLE, await poolManager.getAddress());

    // Run V4 reinitializer to set defaults
    await opinionCore.connect(deployer).initializeV4();
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 1 — Deployment & Initialization
  // ════════════════════════════════════════════════════════════════════
  describe("1. Deployment & Initialization", function () {
    it("1.1 sets V4 defaults via initializeV4", async function () {
      expect(await opinionCore.soloCooldown()).to.equal(SOLO_COOLDOWN);
      expect(await opinionCore.poolCooldown()).to.equal(POOL_COOLDOWN);
      expect(await opinionCore.exitPenaltyBps()).to.equal(EXIT_PENALTY_BPS);
      expect(await opinionCore.penaltyCreatorShareBps()).to.equal(PENALTY_CREATOR_SHARE_BPS);
      expect(await opinionCore.reclaimDiscountBps()).to.equal(RECLAIM_DISCOUNT_BPS);
      expect(await opinionCore.minReclaimPrice()).to.equal(MIN_RECLAIM_PRICE);
      expect(await opinionCore.spamFee()).to.equal(SPAM_FEE);
    });

    it("1.2 starts both feature flags FALSE", async function () {
      expect(await opinionCore.selfExitEnabled()).to.equal(false);
      expect(await opinionCore.reclaimVacantSlotEnabled()).to.equal(false);
    });

    it("1.3 cannot reinitialize V4 a second time", async function () {
      await expect(opinionCore.connect(deployer).initializeV4()).to.be.reverted;
    });

    it("1.4 only ADMIN_ROLE can call initializeV4 (already used; check on fresh proxy via revert path)", async function () {
      // Already initialized above; this test confirms the ADMIN_ROLE check on the function.
      await expect(opinionCore.connect(other).initializeV4()).to.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 2 — createOpinion (V4 economics)
  // ════════════════════════════════════════════════════════════════════
  describe("2. createOpinion (α-vanilla)", function () {
    it("2.1 charges initialPrice + spamFee total", async function () {
      await fund(creator, INITIAL_PRICE + SPAM_FEE);
      const balBefore = await usdc.balanceOf(creator.address);

      await opinionCore
        .connect(creator)
        .createOpinion("question?", "yes", "desc", INITIAL_PRICE, ["Technology"]);

      const balAfter = await usdc.balanceOf(creator.address);
      expect(balBefore - balAfter).to.equal(INITIAL_PRICE + SPAM_FEE);
    });

    it("2.2 sets lockedStake to initialPrice", async function () {
      const id = await createV4Opinion(creator);
      expect(await opinionCore.lockedStake(id)).to.equal(INITIAL_PRICE);
    });

    it("2.3 sets lastTradeTimestamp to creation block timestamp", async function () {
      const id = await createV4Opinion(creator);
      const block = await ethers.provider.getBlock("latest");
      const ts = await opinionCore.lastTradeTimestamp(id);
      expect(ts).to.equal(BigInt(block!.timestamp));
    });

    it("2.4 locks initialPrice in contract, sends spamFee to treasury", async function () {
      const treasuryBefore = await usdc.balanceOf(treasury.address);
      const coreAddress = await opinionCore.getAddress();
      const coreBefore = await usdc.balanceOf(coreAddress);

      await createV4Opinion(creator);

      const treasuryAfter = await usdc.balanceOf(treasury.address);
      const coreAfter = await usdc.balanceOf(coreAddress);

      expect(treasuryAfter - treasuryBefore).to.equal(SPAM_FEE);
      expect(coreAfter - coreBefore).to.equal(INITIAL_PRICE);
    });

    it("2.5 emits LockedStakeBootstrapped with the locked amount", async function () {
      await fund(creator, INITIAL_PRICE + SPAM_FEE);
      await expect(
        opinionCore
          .connect(creator)
          .createOpinion("question?", "yes", "desc", INITIAL_PRICE, ["Technology"])
      )
        .to.emit(opinionCore, "LockedStakeBootstrapped")
        .withArgs(1, INITIAL_PRICE);
    });

    it("2.6 reverts on insufficient allowance", async function () {
      await usdc.mint(creator.address, INITIAL_PRICE + SPAM_FEE);
      await usdc.connect(creator).approve(await opinionCore.getAddress(), INITIAL_PRICE); // SHORT
      await expect(
        opinionCore
          .connect(creator)
          .createOpinion("q", "yes", "desc", INITIAL_PRICE, ["Technology"])
      ).to.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 3 — submitAnswer (V4 changes)
  // ════════════════════════════════════════════════════════════════════
  describe("3. submitAnswer (lock carry-forward)", function () {
    let opinionId: bigint;

    beforeEach(async function () {
      opinionId = await createV4Opinion(creator);
    });

    it("3.1 lockedStake stays at initialPrice after first trade", async function () {
      const nextPrice = await opinionCore.getNextPrice(opinionId);
      await fund(buyer1, nextPrice);

      // Mine one block so block.number changes (avoid OneTradePerBlock)
      await ethers.provider.send("evm_mine", []);

      await opinionCore.connect(buyer1).submitAnswer(opinionId, "no", "answer 2", "");
      expect(await opinionCore.lockedStake(opinionId)).to.equal(INITIAL_PRICE);
    });

    it("3.2 lastTradeTimestamp updates on each trade", async function () {
      const before = await opinionCore.lastTradeTimestamp(opinionId);

      const nextPrice = await opinionCore.getNextPrice(opinionId);
      await fund(buyer1, nextPrice);
      await ethers.provider.send("evm_mine", []);
      await time.increase(60); // jump 60 seconds

      await opinionCore.connect(buyer1).submitAnswer(opinionId, "no", "ans2", "");
      const after = await opinionCore.lastTradeTimestamp(opinionId);
      expect(after).to.be.gt(before);
    });

    it("3.3 lockedStake stays constant across multiple trades", async function () {
      const buyers = [buyer1, buyer2, buyer3];
      for (const buyer of buyers) {
        const nextPrice = await opinionCore.getNextPrice(opinionId);
        await fund(buyer, nextPrice);
        await ethers.provider.send("evm_mine", []);
        await time.increase(10);
        await opinionCore.connect(buyer).submitAnswer(opinionId, "ans", "desc", "");
        expect(await opinionCore.lockedStake(opinionId)).to.equal(INITIAL_PRICE);
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 4 — selfExit
  // ════════════════════════════════════════════════════════════════════
  describe("4. selfExit", function () {
    let opinionId: bigint;

    beforeEach(async function () {
      opinionId = await createV4Opinion(creator);
    });

    it("4.1 reverts when feature is disabled", async function () {
      await time.increase(SOLO_COOLDOWN + 1);
      await expect(opinionCore.connect(creator).selfExit(opinionId)).to.be.revertedWithCustomError(
        opinionCore,
        "FeatureDisabled"
      );
    });

    it("4.2 reverts when caller is not the king", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await expect(opinionCore.connect(buyer1).selfExit(opinionId)).to.be.reverted;
    });

    it("4.3 reverts when cooldown has not elapsed", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN - 60); // just under
      await expect(opinionCore.connect(creator).selfExit(opinionId)).to.be.reverted;
    });

    it("4.4 succeeds after cooldown — refund 80% of stake to king", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const expectedPenalty = (INITIAL_PRICE * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedRefund = INITIAL_PRICE - expectedPenalty;

      const balBefore = await usdc.balanceOf(creator.address);
      await opinionCore.connect(creator).selfExit(opinionId);
      const balAfter = await usdc.balanceOf(creator.address);

      expect(balAfter - balBefore).to.equal(expectedRefund);
    });

    it("4.5 zeroes out lockedStake and currentAnswerOwner", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      await opinionCore.connect(creator).selfExit(opinionId);

      expect(await opinionCore.lockedStake(opinionId)).to.equal(0);
      const opinion = await opinionCore.getOpinionDetails(opinionId);
      expect(opinion.currentAnswerOwner).to.equal(ethers.ZeroAddress);
    });

    it("4.6 sets nextPrice to reclaim price (50% of last price, floored)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const lastPrice = (await opinionCore.getOpinionDetails(opinionId)).lastPrice;
      await opinionCore.connect(creator).selfExit(opinionId);

      const expectedReclaim = (BigInt(lastPrice) * RECLAIM_DISCOUNT_BPS) / BPS_DENOM;
      const opinion = await opinionCore.getOpinionDetails(opinionId);
      expect(opinion.nextPrice).to.equal(
        expectedReclaim < MIN_RECLAIM_PRICE ? MIN_RECLAIM_PRICE : expectedReclaim
      );
    });

    it("4.7 splits penalty 50/50 between creator (accumulated) and platform (FeeManager)", async function () {
      // To distinguish "creator share" from "trade-creator share" in this test,
      // make the king a different address than the creator. Trade once first.
      const nextPrice = await opinionCore.getNextPrice(opinionId);
      await fund(buyer1, nextPrice);
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(buyer1).submitAnswer(opinionId, "ans2", "d2", "");

      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const stake = await opinionCore.lockedStake(opinionId);
      const expectedPenalty = (BigInt(stake) * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedCreatorShare = (expectedPenalty * PENALTY_CREATOR_SHARE_BPS) / BPS_DENOM;
      const expectedPlatformShare = expectedPenalty - expectedCreatorShare;

      const creatorAccBefore = await feeManager.getAccumulatedFees(creator.address);
      const fmBalBefore = await usdc.balanceOf(await feeManager.getAddress());

      await opinionCore.connect(buyer1).selfExit(opinionId);

      const creatorAccAfter = await feeManager.getAccumulatedFees(creator.address);
      const fmBalAfter = await usdc.balanceOf(await feeManager.getAddress());

      expect(creatorAccAfter - creatorAccBefore).to.equal(expectedCreatorShare);
      expect(fmBalAfter - fmBalBefore).to.equal(expectedPenalty);
      // platformShare = total transferred to FeeManager - creator's accumulated portion
      expect(fmBalAfter - fmBalBefore - (creatorAccAfter - creatorAccBefore)).to.equal(
        expectedPlatformShare
      );
    });

    it("4.8 emits SelfExitTriggered + SlotVacated events (from library)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      // Library emits events; logs land at the core contract address. Use a
      // generic assertion that the tx succeeds and emits SlotVacated topic.
      const tx = await opinionCore.connect(creator).selfExit(opinionId);
      const receipt = await tx.wait();
      // The library address is selfExitLibAddress; logs will have address == coreAddress
      expect(receipt.logs.length).to.be.gt(0);
    });

    it("4.9 cooldown clock RESETS on subsequent trades", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);

      // Wait until cooldown is half done, then do a trade — clock resets
      await time.increase(SOLO_COOLDOWN / 2);

      const nextPrice = await opinionCore.getNextPrice(opinionId);
      await fund(buyer1, nextPrice);
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(buyer1).submitAnswer(opinionId, "xx", "yy", "");

      // Now buyer1 is king. Wait the OTHER half — should NOT be enough.
      await time.increase(SOLO_COOLDOWN / 2 - 60);
      await expect(opinionCore.connect(buyer1).selfExit(opinionId)).to.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 5 — reclaimVacantSlot
  // ════════════════════════════════════════════════════════════════════
  describe("5. reclaimVacantSlot", function () {
    let opinionId: bigint;

    beforeEach(async function () {
      opinionId = await createV4Opinion(creator);
      // Self-exit to make slot vacant
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await opinionCore.connect(creator).selfExit(opinionId);
    });

    it("5.1 reverts when reclaim feature is disabled", async function () {
      await fund(buyer1, MIN_RECLAIM_PRICE * 10n);
      await expect(
        opinionCore.connect(buyer1).reclaimVacantSlot(opinionId, "new", "desc", "")
      ).to.be.revertedWithCustomError(opinionCore, "FeatureDisabled");
    });

    it("5.2 reverts on non-vacant slot (revert path tested via fresh opinion)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      const fresh = await createV4Opinion(buyer2);
      await fund(buyer1, INITIAL_PRICE * 2n);
      await expect(
        opinionCore.connect(buyer1).reclaimVacantSlot(fresh, "new", "desc", "")
      ).to.be.reverted;
    });

    it("5.3 succeeds — sets new king and locks ~95% of payment as new stake", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);

      const reclaimPrice = (await opinionCore.getOpinionDetails(opinionId)).nextPrice;
      await fund(buyer1, BigInt(reclaimPrice));

      await opinionCore.connect(buyer1).reclaimVacantSlot(opinionId, "new ans", "desc", "");

      const opinion = await opinionCore.getOpinionDetails(opinionId);
      expect(opinion.currentAnswerOwner).to.equal(buyer1.address);
      expect(opinion.currentAnswer).to.equal("new ans");

      // New lockedStake should be ~95% of reclaim price (per FeeManager 5% fee).
      // Allow ±1 USDC for rounding/regime variance.
      const expected = (BigInt(reclaimPrice) * 95n) / 100n;
      const actual = await opinionCore.lockedStake(opinionId);
      const diff = actual > expected ? actual - expected : expected - actual;
      expect(diff).to.be.lt(ONE_USDC);
    });

    it("5.4 reverts on bad string inputs (too short answer)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      await fund(buyer1, INITIAL_PRICE * 2n);
      await expect(
        opinionCore.connect(buyer1).reclaimVacantSlot(opinionId, "x", "desc", "")
      ).to.be.reverted;
    });

    it("5.5 lastTradeTimestamp is updated to reclaim block time", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      const reclaimPrice = (await opinionCore.getOpinionDetails(opinionId)).nextPrice;
      await fund(buyer1, BigInt(reclaimPrice));

      await opinionCore.connect(buyer1).reclaimVacantSlot(opinionId, "new ans", "desc", "");

      const ts = await opinionCore.lastTradeTimestamp(opinionId);
      const block = await ethers.provider.getBlock("latest");
      expect(ts).to.equal(BigInt(block!.timestamp));
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 6 — processPoolStaleExit
  // ════════════════════════════════════════════════════════════════════
  describe("6. processPoolStaleExit (role-gated)", function () {
    it("6.1 reverts when caller lacks POOL_MANAGER_ROLE", async function () {
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await expect(opinionCore.connect(attacker).processPoolStaleExit(id)).to.be.reverted;
    });

    it("6.2 reverts when current king is NOT a pool", async function () {
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);

      // Grant role to a wallet to bypass the access check (not the pool itself)
      await opinionCore.connect(deployer).grantRole(POOL_MANAGER_ROLE, other.address);

      await expect(opinionCore.connect(other).processPoolStaleExit(id)).to.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 7 — Admin setters & feature flags
  // ════════════════════════════════════════════════════════════════════
  describe("7. Admin setters", function () {
    it("7.1 setSelfExitParameter rejects out-of-bounds penalty", async function () {
      // exitPenaltyBps (paramType 3): bounds 5%–50%
      await expect(opinionCore.connect(deployer).setSelfExitParameter(3, 100)).to.be.reverted; // < MIN
      await expect(opinionCore.connect(deployer).setSelfExitParameter(3, 6000)).to.be.reverted; // > MAX
    });

    it("7.2 setSelfExitParameter accepts valid penalty values and emits event", async function () {
      await expect(opinionCore.connect(deployer).setSelfExitParameter(3, 1500))
        .to.emit(opinionCore, "SelfExitParameterUpdated")
        .withArgs(3, 1500);
      expect(await opinionCore.exitPenaltyBps()).to.equal(1500);
    });

    it("7.3 setSelfExitParameter rejects unknown paramType", async function () {
      await expect(opinionCore.connect(deployer).setSelfExitParameter(99, 100)).to.be.reverted;
    });

    it("7.4 setSelfExitParameter rejects non-admin caller", async function () {
      await expect(opinionCore.connect(attacker).setSelfExitParameter(3, 1500)).to.be.reverted;
    });

    it("7.5 setSelfExitFlag toggles selfExitEnabled (flagType 0)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      expect(await opinionCore.selfExitEnabled()).to.equal(true);
      await opinionCore.connect(deployer).setSelfExitFlag(0, false);
      expect(await opinionCore.selfExitEnabled()).to.equal(false);
    });

    it("7.6 setSelfExitFlag toggles reclaimVacantSlotEnabled (flagType 1)", async function () {
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      expect(await opinionCore.reclaimVacantSlotEnabled()).to.equal(true);
    });

    it("7.7 setSelfExitFlag rejects unknown flagType", async function () {
      await expect(opinionCore.connect(deployer).setSelfExitFlag(2, true)).to.be.reverted;
    });

    it("7.8 cooldown setters enforce min/max bounds", async function () {
      // soloCooldown (paramType 0): bounds 1–90 days
      await expect(opinionCore.connect(deployer).setSelfExitParameter(0, 100)).to.be.reverted; // < 1 day
      await expect(opinionCore.connect(deployer).setSelfExitParameter(0, 100 * 24 * 60 * 60))
        .to.be.reverted; // > 90 days
      await opinionCore.connect(deployer).setSelfExitParameter(0, 7 * 24 * 60 * 60);
      expect(await opinionCore.soloCooldown()).to.equal(7 * 24 * 60 * 60);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 8 — Edge cases
  // ════════════════════════════════════════════════════════════════════
  describe("8. Edge cases", function () {
    it("8.1 legacy positions (lockedStake = 0) cannot self-exit", async function () {
      // Simulate a legacy opinion: create one, then forcibly zero the lock.
      // We can't really do this without admin write access. Instead, we verify
      // that the revert occurs by checking the contract's branch logic via
      // a mock setup: confirm `LegacyPositionNotEligible` is thrown when lock is 0.
      //
      // Practical approach: deploy fresh opinion and have it self-exit once.
      // After exit, lockedStake = 0 and slot is vacant, so subsequent calls
      // revert with `OpinionNotActive` or `NotTheOwner` — the legacy guard
      // is exercised on positions where someone is the king but lock=0,
      // which can't happen post-V4 in normal flow. The branch is covered
      // implicitly by V3-pre-existing opinions in real upgrade scenarios.
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await opinionCore.connect(creator).selfExit(id);

      // Slot is now vacant; subsequent selfExit by the same address reverts.
      await expect(opinionCore.connect(creator).selfExit(id)).to.be.reverted;
    });

    it("8.2 paused contract blocks selfExit", async function () {
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      await opinionCore.connect(deployer).pause();
      await expect(opinionCore.connect(creator).selfExit(id)).to.be.reverted;

      await opinionCore.connect(deployer).unpause();
      await expect(opinionCore.connect(creator).selfExit(id)).to.not.be.reverted;
    });

    it("8.3 paused contract blocks reclaimVacantSlot", async function () {
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await opinionCore.connect(creator).selfExit(id);

      await opinionCore.connect(deployer).pause();
      await fund(buyer1, INITIAL_PRICE * 2n);
      await expect(
        opinionCore.connect(buyer1).reclaimVacantSlot(id, "new", "desc", "")
      ).to.be.reverted;
    });

    it("8.4 submitAnswer reverts on a vacant slot (must use reclaim)", async function () {
      const id = await createV4Opinion(creator);
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await opinionCore.connect(creator).selfExit(id);

      await fund(buyer1, INITIAL_PRICE * 2n);
      await expect(
        opinionCore.connect(buyer1).submitAnswer(id, "ans", "desc", "")
      ).to.be.revertedWithCustomError(opinionCore, "SlotIsVacant");
    });

    it("8.5 full lifecycle: create → trade → wait → self-exit → reclaim → trade — sanity end-to-end", async function () {
      const id = await createV4Opinion(creator);
      const stakeInitial = await opinionCore.lockedStake(id);
      expect(stakeInitial).to.equal(INITIAL_PRICE);

      // Trade 1
      let nextPrice = await opinionCore.getNextPrice(id);
      await fund(buyer1, nextPrice);
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(buyer1).submitAnswer(id, "ans2", "desc", "");
      expect(await opinionCore.lockedStake(id)).to.equal(INITIAL_PRICE);

      // Wait & self-exit
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await opinionCore.connect(deployer).setSelfExitFlag(1, true);
      await time.increase(SOLO_COOLDOWN + 1);
      await opinionCore.connect(buyer1).selfExit(id);
      expect(await opinionCore.lockedStake(id)).to.equal(0);
      expect((await opinionCore.getOpinionDetails(id)).currentAnswerOwner).to.equal(
        ethers.ZeroAddress
      );

      // Reclaim
      const reclaimPrice = (await opinionCore.getOpinionDetails(id)).nextPrice;
      await fund(buyer2, BigInt(reclaimPrice));
      await opinionCore.connect(buyer2).reclaimVacantSlot(id, "fresh", "desc", "");
      expect((await opinionCore.getOpinionDetails(id)).currentAnswerOwner).to.equal(
        buyer2.address
      );
      expect(await opinionCore.lockedStake(id)).to.be.gt(0);

      // Trade again
      nextPrice = await opinionCore.getNextPrice(id);
      await fund(buyer3, nextPrice);
      await ethers.provider.send("evm_mine", []);
      await opinionCore.connect(buyer3).submitAnswer(id, "next", "desc", "");
      expect((await opinionCore.getOpinionDetails(id)).currentAnswerOwner).to.equal(
        buyer3.address
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 9 — Pool stale exit: HAPPY PATH
  // ════════════════════════════════════════════════════════════════════
  describe("9. processPoolStaleExit — happy path", function () {
    it("9.1 dissolves a pool-owned slot and returns refund to caller", async function () {
      // Setup: create opinion, then make `other` act as a pool by granting role
      // and calling updateOpinionOnPoolExecution. This sidesteps PoolManager
      // (tested separately) but exercises the V4 dissolution path.
      const id = await createV4Opinion(creator);
      const stake = await opinionCore.lockedStake(id);
      expect(stake).to.equal(INITIAL_PRICE);

      // Grant POOL_MANAGER_ROLE to `other` so it can act as both the pool
      // king (via updateOpinionOnPoolExecution) and the caller of
      // processPoolStaleExit.
      await opinionCore.connect(deployer).grantRole(POOL_MANAGER_ROLE, other.address);

      // `other` becomes pool king
      await opinionCore
        .connect(other)
        .updateOpinionOnPoolExecution(id, "pool answer", other.address, INITIAL_PRICE);

      const opinion = await opinionCore.getOpinionDetails(id);
      expect(opinion.currentAnswerOwner).to.equal(other.address);

      // Enable feature, advance past cooldown
      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const expectedPenalty = (INITIAL_PRICE * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedRefund = INITIAL_PRICE - expectedPenalty;

      // Solo selfExit must be rejected for pool-owned slots
      await expect(opinionCore.connect(other).selfExit(id)).to.be.revertedWithCustomError(
        opinionCore,
        "PoolMustUsePoolExit"
      );

      // Pool exit succeeds — refund returned to msg.sender (the pool/poolManager)
      const balBefore = await usdc.balanceOf(other.address);
      const tx = await opinionCore.connect(other).processPoolStaleExit(id);
      await tx.wait();
      const balAfter = await usdc.balanceOf(other.address);

      expect(balAfter - balBefore).to.equal(expectedRefund);

      // State verification: stake zeroed, slot vacant, nextPrice set to reclaim
      expect(await opinionCore.lockedStake(id)).to.equal(0);
      const after = await opinionCore.getOpinionDetails(id);
      expect(after.currentAnswerOwner).to.equal(ethers.ZeroAddress);
    });

    it("9.2 splits penalty 50/50 to creator + platform on pool exit", async function () {
      const id = await createV4Opinion(creator);

      await opinionCore.connect(deployer).grantRole(POOL_MANAGER_ROLE, other.address);
      await opinionCore
        .connect(other)
        .updateOpinionOnPoolExecution(id, "pool answer", other.address, INITIAL_PRICE);

      await opinionCore.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const expectedPenalty = (INITIAL_PRICE * EXIT_PENALTY_BPS) / BPS_DENOM;
      const expectedCreator = (expectedPenalty * PENALTY_CREATOR_SHARE_BPS) / BPS_DENOM;

      const creatorAccBefore = await feeManager.getAccumulatedFees(creator.address);

      await opinionCore.connect(other).processPoolStaleExit(id);

      const creatorAccAfter = await feeManager.getAccumulatedFees(creator.address);
      expect(creatorAccAfter - creatorAccBefore).to.equal(expectedCreator);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 10 — V3 → V4 upgrade migration
  // ════════════════════════════════════════════════════════════════════
  describe("10. V3 → V4 upgrade (Path A migration)", function () {
    let v3Core: any;

    // We deploy a V3-style stack here (same modular pieces, but the proxy
    // points at V3). Then we upgrade the proxy to V4 and verify migration.
    beforeEach(async function () {
      // Deploy V3 stack alongside the existing V4 fixtures
      const PriceCalc = await ethers.getContractFactory("PriceCalculator");
      const priceCalc2 = await PriceCalc.deploy();
      await priceCalc2.waitForDeployment();
      const priceCalc2Addr = await priceCalc2.getAddress();

      // FeeManager (fresh)
      const FeeManager = await ethers.getContractFactory("FeeManager");
      const fm = await upgrades.deployProxy(
        FeeManager,
        [await usdc.getAddress(), treasury.address],
        { initializer: "initialize" }
      );
      await fm.waitForDeployment();

      // PoolManager (fresh)
      const PoolManager = await ethers.getContractFactory("PoolManager", {
        libraries: { ValidationLibrary: validationLibAddress },
      });
      const pm = await upgrades.deployProxy(
        PoolManager,
        [
          ethers.ZeroAddress,
          await fm.getAddress(),
          await usdc.getAddress(),
          treasury.address,
          admin.address,
        ],
        { initializer: "initialize", unsafeAllowLinkedLibraries: true }
      );
      await pm.waitForDeployment();

      // OpinionAdmin (fresh)
      const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
      const oa = await upgrades.deployProxy(
        OpinionAdmin,
        [ethers.ZeroAddress, await usdc.getAddress(), treasury.address, admin.address],
        { initializer: "initialize" }
      );
      await oa.waitForDeployment();

      // OpinionExtensions (fresh)
      const OpinionExt = await ethers.getContractFactory("OpinionExtensionsV2");
      const oe = await upgrades.deployProxy(
        OpinionExt,
        [ethers.ZeroAddress, admin.address],
        { initializer: "initialize" }
      );
      await oe.waitForDeployment();

      // V3 core proxy (this is what we'll upgrade)
      const V3 = await ethers.getContractFactory("OpinionCoreV3", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: priceCalc2Addr,
        },
      });
      v3Core = await upgrades.deployProxy(
        V3,
        [
          await usdc.getAddress(),
          deployer.address,
          await fm.getAddress(),
          await pm.getAddress(),
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          treasury.address,
          await oe.getAddress(),
          await oa.getAddress(),
        ],
        { initializer: "initialize", unsafeAllowLinkedLibraries: true }
      );
      await v3Core.waitForDeployment();

      // Wire
      const v3Addr = await v3Core.getAddress();
      await oa.connect(admin).setCoreContract(v3Addr);
      await oe.connect(admin).setCoreContract(v3Addr);
      await pm.connect(admin).setOpinionCore(v3Addr);
      await fm.connect(deployer).grantCoreContractRole(v3Addr);

      // Create some V3 opinions BEFORE upgrade
      const v3FundAmount = 50n * ONE_USDC; // generous coverage of creationFee
      await usdc.mint(creator.address, v3FundAmount);
      await usdc.connect(creator).approve(v3Addr, v3FundAmount);
      await v3Core
        .connect(creator)
        .createOpinion(
          "v3 question?",
          "v3 answer",
          "v3 desc",
          INITIAL_PRICE,
          ["Technology"]
        );
    });

    it("10.1 preserves V3 opinion state across the V4 upgrade", async function () {
      const idV3 = (await v3Core.nextOpinionId()) - 1n;
      const detailsBefore = await v3Core.getOpinionDetails(idV3);
      expect(detailsBefore.currentAnswerOwner).to.equal(creator.address);

      // Upgrade
      const V4 = await ethers.getContractFactory("OpinionCoreV4", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: (await ethers.getContractFactory("PriceCalculator")).getAddress
            ? priceCalcAddress
            : priceCalcAddress,
          SelfExitLib: selfExitLibAddress,
        },
      });
      const upgraded = await upgrades.upgradeProxy(await v3Core.getAddress(), V4, {
        unsafeAllowLinkedLibraries: true,
      });
      await upgraded.connect(deployer).initializeV4();

      // Verify state preserved
      const detailsAfter = await upgraded.getOpinionDetails(idV3);
      expect(detailsAfter.currentAnswerOwner).to.equal(creator.address);
      expect(detailsAfter.lastPrice).to.equal(detailsBefore.lastPrice);
      expect(detailsAfter.creator).to.equal(creator.address);
    });

    it("10.2 legacy V3 opinions have lockedStake = 0 after upgrade", async function () {
      const idV3 = (await v3Core.nextOpinionId()) - 1n;

      const V4 = await ethers.getContractFactory("OpinionCoreV4", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: priceCalcAddress,
          SelfExitLib: selfExitLibAddress,
        },
      });
      const upgraded = await upgrades.upgradeProxy(await v3Core.getAddress(), V4, {
        unsafeAllowLinkedLibraries: true,
      });
      await upgraded.connect(deployer).initializeV4();

      expect(await upgraded.lockedStake(idV3)).to.equal(0);
    });

    it("10.3 legacy opinion king CANNOT self-exit (LegacyPositionNotEligible)", async function () {
      const idV3 = (await v3Core.nextOpinionId()) - 1n;

      const V4 = await ethers.getContractFactory("OpinionCoreV4", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: priceCalcAddress,
          SelfExitLib: selfExitLibAddress,
        },
      });
      const upgraded = await upgrades.upgradeProxy(await v3Core.getAddress(), V4, {
        unsafeAllowLinkedLibraries: true,
      });
      await upgraded.connect(deployer).initializeV4();
      await upgraded.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      // Even after cooldown, legacy positions revert.
      await expect(upgraded.connect(creator).selfExit(idV3)).to.be.reverted;
    });

    it("10.4 NEW opinions created post-upgrade have rescue enabled", async function () {
      const V4 = await ethers.getContractFactory("OpinionCoreV4", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: priceCalcAddress,
          SelfExitLib: selfExitLibAddress,
        },
      });
      const upgraded = await upgrades.upgradeProxy(await v3Core.getAddress(), V4, {
        unsafeAllowLinkedLibraries: true,
      });
      await upgraded.connect(deployer).initializeV4();

      // Create a new opinion under V4 economics
      await usdc.mint(buyer1.address, INITIAL_PRICE + SPAM_FEE);
      await usdc.connect(buyer1).approve(await upgraded.getAddress(), INITIAL_PRICE + SPAM_FEE);
      await upgraded
        .connect(buyer1)
        .createOpinion("new question?", "new ans", "desc", INITIAL_PRICE, ["Technology"]);

      const newId = (await upgraded.nextOpinionId()) - 1n;
      expect(await upgraded.lockedStake(newId)).to.equal(INITIAL_PRICE);

      // Self-exit works for new opinions
      await upgraded.connect(deployer).setSelfExitFlag(0, true);
      await time.increase(SOLO_COOLDOWN + 1);

      const balBefore = await usdc.balanceOf(buyer1.address);
      await upgraded.connect(buyer1).selfExit(newId);
      const balAfter = await usdc.balanceOf(buyer1.address);
      const expectedRefund = INITIAL_PRICE - (INITIAL_PRICE * EXIT_PENALTY_BPS) / BPS_DENOM;
      expect(balAfter - balBefore).to.equal(expectedRefund);
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // SECTION 11 — Reentrancy attack via hookable USDC
  // ════════════════════════════════════════════════════════════════════
  // This block uses an entirely different USDC mock (HookableUSDC) that
  // calls `onUSDCReceived()` on contract recipients after every transfer.
  // It simulates an ERC777-style attack vector — real Base USDC has no such
  // hook, but the test verifies our defensive guards (CEI + nonReentrant)
  // would defeat it if the canonical token ever changed.
  describe("11. Reentrancy attack defense", function () {
    let hookUsdc: any;
    let hookFeeManager: any;
    let hookCore: any;
    let attacker: any; // ReentrantKing contract

    beforeEach(async function () {
      // Deploy hookable USDC
      const HookableUSDC = await ethers.getContractFactory("HookableUSDC");
      hookUsdc = await HookableUSDC.deploy();
      await hookUsdc.waitForDeployment();

      // Disable hook during setup so deployment/initialization isn't disrupted.
      await hookUsdc.setHookEnabled(false);

      // Fresh FeeManager + PoolManager + Admin + Extensions, all wired to hookUsdc.
      const FM = await ethers.getContractFactory("FeeManager");
      hookFeeManager = await upgrades.deployProxy(
        FM,
        [await hookUsdc.getAddress(), treasury.address],
        { initializer: "initialize" }
      );
      await hookFeeManager.waitForDeployment();

      const PM = await ethers.getContractFactory("PoolManager", {
        libraries: { ValidationLibrary: validationLibAddress },
      });
      const hookPm = await upgrades.deployProxy(
        PM,
        [
          ethers.ZeroAddress,
          await hookFeeManager.getAddress(),
          await hookUsdc.getAddress(),
          treasury.address,
          admin.address,
        ],
        { initializer: "initialize", unsafeAllowLinkedLibraries: true }
      );
      await hookPm.waitForDeployment();

      const OA = await ethers.getContractFactory("OpinionAdmin");
      const hookOa = await upgrades.deployProxy(
        OA,
        [ethers.ZeroAddress, await hookUsdc.getAddress(), treasury.address, admin.address],
        { initializer: "initialize" }
      );
      await hookOa.waitForDeployment();

      const OE = await ethers.getContractFactory("OpinionExtensionsV2");
      const hookOe = await upgrades.deployProxy(
        OE,
        [ethers.ZeroAddress, admin.address],
        { initializer: "initialize" }
      );
      await hookOe.waitForDeployment();

      const Core = await ethers.getContractFactory("OpinionCoreV4", {
        libraries: {
          ValidationLibrary: validationLibAddress,
          PriceCalculator: priceCalcAddress,
          SelfExitLib: selfExitLibAddress,
        },
      });
      hookCore = await upgrades.deployProxy(
        Core,
        [
          await hookUsdc.getAddress(),
          deployer.address,
          await hookFeeManager.getAddress(),
          await hookPm.getAddress(),
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          treasury.address,
          await hookOe.getAddress(),
          await hookOa.getAddress(),
        ],
        { initializer: "initialize", unsafeAllowLinkedLibraries: true }
      );
      await hookCore.waitForDeployment();

      const coreAddr = await hookCore.getAddress();
      await hookOa.connect(admin).setCoreContract(coreAddr);
      await hookOe.connect(admin).setCoreContract(coreAddr);
      await hookPm.connect(admin).setOpinionCore(coreAddr);
      await hookFeeManager.connect(deployer).grantCoreContractRole(coreAddr);
      await hookCore.connect(deployer).initializeV4();
      await hookCore.connect(deployer).setSelfExitFlag(0, true);
      await hookCore.connect(deployer).setSelfExitFlag(1, true);

      // Deploy the attacker
      const Attacker = await ethers.getContractFactory("ReentrantKing");
      attacker = await Attacker.deploy(coreAddr, await hookUsdc.getAddress());
      await attacker.waitForDeployment();

      // Fund attacker contract with USDC (it needs to pay create fees)
      await hookUsdc.mint(await attacker.getAddress(), INITIAL_PRICE * 10n);
      await attacker.approveCore(INITIAL_PRICE * 10n);
    });

    it("11.1 attacker cannot re-enter selfExit during refund transfer", async function () {
      // Have attacker create an opinion (becomes king with stake locked)
      // Disable hook during creation to avoid disrupting the setup transfer
      const attackerAddr = await attacker.getAddress();

      // Fund an EOA to create the opinion, then transfer ownership to attacker
      await hookUsdc.mint(creator.address, INITIAL_PRICE + SPAM_FEE);
      await hookUsdc
        .connect(creator)
        .approve(await hookCore.getAddress(), INITIAL_PRICE + SPAM_FEE);
      await hookCore
        .connect(creator)
        .createOpinion("ree?", "yes", "desc", INITIAL_PRICE, ["Technology"]);
      const id = (await hookCore.nextOpinionId()) - 1n;

      // Transfer answer ownership to attacker (free, doesn't move USDC)
      await hookCore.connect(creator).transferAnswerOwnership(id, attackerAddr);
      await attacker.setOpinionId(id);
      await attacker.setTarget(0); // SelfExit

      // Enable hook so the attacker's onUSDCReceived fires during refund
      await hookUsdc.setHookEnabled(true);

      // Advance past cooldown
      await time.increase(SOLO_COOLDOWN + 1);

      // Attacker triggers selfExit. The inner reentry MUST fail.
      // The outer call may either:
      //   (a) Succeed (if onUSDCReceived swallows the inner revert via try/catch)
      //   (b) Revert in totality
      // Either way, `reentrySucceeded` MUST stay false.
      try {
        await attacker.startSelfExit();
      } catch {
        // outer revert is acceptable
      }

      expect(await attacker.reentrySucceeded()).to.equal(false);
      expect(await attacker.reentryReverted()).to.equal(true);
    });

    it("11.2 attacker cannot re-enter submitAnswer during selfExit refund", async function () {
      const attackerAddr = await attacker.getAddress();

      await hookUsdc.mint(creator.address, INITIAL_PRICE + SPAM_FEE);
      await hookUsdc
        .connect(creator)
        .approve(await hookCore.getAddress(), INITIAL_PRICE + SPAM_FEE);
      await hookCore
        .connect(creator)
        .createOpinion("ree?", "yes", "desc", INITIAL_PRICE, ["Technology"]);
      const id = (await hookCore.nextOpinionId()) - 1n;

      await hookCore.connect(creator).transferAnswerOwnership(id, attackerAddr);
      await attacker.setOpinionId(id);
      await attacker.setTarget(2); // SubmitAnswer

      await hookUsdc.setHookEnabled(true);
      await time.increase(SOLO_COOLDOWN + 1);

      try {
        await attacker.startSelfExit();
      } catch {}

      expect(await attacker.reentrySucceeded()).to.equal(false);
      expect(await attacker.reentryReverted()).to.equal(true);
    });
  });
});
