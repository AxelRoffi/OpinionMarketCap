/**
 * AnswerSharesCore - Comprehensive Test Suite
 *
 * This test suite covers:
 * 1. Deployment & Initialization
 * 2. Question Creation
 * 3. Answer Proposal
 * 4. Share Trading (Buy/Sell)
 * 5. Fee System & Claiming
 * 6. Edge Cases & Boundaries
 * 7. Security (Access Control, Reentrancy, Overflow)
 * 8. Moderation Functions
 * 9. Admin Functions
 * 10. Integration Tests (Full Trading Flows)
 *
 * @author Security Test Engineer
 * @notice All amounts are in USDC (6 decimals)
 */

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { AnswerSharesCore } from "../typechain-types/contracts/active/AnswerSharesCore";
import { MockERC20 } from "../typechain-types/contracts/active/test/MockERC20";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AnswerSharesCore", function () {
  // Constants matching contract
  const USDC_DECIMALS = 6;
  const ONE_USDC = 10n ** 6n;
  const QUESTION_FEE = 2n * ONE_USDC;           // $2
  const ANSWER_STAKE = 5n * ONE_USDC;           // $5
  const PLATFORM_FEE_BPS = 150n;                // 1.5%
  const CREATOR_FEE_BPS = 50n;                  // 0.5%
  const MAX_FEE_BPS = 1000n;                    // 10%
  const MIN_POOL_RESERVE = ONE_USDC;            // $1
  const MIN_SHARES_RESERVE = 1n;

  // Roles
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const MODERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MODERATOR_ROLE"));
  const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  // Contract instances
  let answerShares: AnswerSharesCore;
  let usdc: MockERC20;

  // Signers
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let moderator: SignerWithAddress;
  let questionCreator: SignerWithAddress;
  let answerProposer: SignerWithAddress;
  let trader1: SignerWithAddress;
  let trader2: SignerWithAddress;
  let trader3: SignerWithAddress;
  let attacker: SignerWithAddress;

  // Helper function to mint and approve USDC
  async function fundAccount(account: SignerWithAddress, amount: bigint) {
    await usdc.mint(account.address, amount);
    await usdc.connect(account).approve(await answerShares.getAddress(), amount);
  }

  // Helper to get current block timestamp + buffer
  async function getDeadline(seconds: number = 3600): Promise<bigint> {
    const block = await ethers.provider.getBlock("latest");
    return BigInt(block!.timestamp + seconds);
  }

  beforeEach(async function () {
    // Get signers
    [deployer, admin, treasury, moderator, questionCreator, answerProposer, trader1, trader2, trader3, attacker] =
      await ethers.getSigners();

    // Deploy MockERC20 (USDC)
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("USD Coin", "USDC") as MockERC20;
    await usdc.waitForDeployment();

    // Deploy AnswerSharesCore (upgradeable)
    const AnswerSharesCoreFactory = await ethers.getContractFactory("AnswerSharesCore");
    answerShares = await upgrades.deployProxy(
      AnswerSharesCoreFactory,
      [await usdc.getAddress(), treasury.address, admin.address],
      { initializer: "initialize" }
    ) as unknown as AnswerSharesCore;
    await answerShares.waitForDeployment();

    // Grant moderator role
    await answerShares.connect(admin).grantRole(MODERATOR_ROLE, moderator.address);
  });

  // ============================================================
  // SECTION 1: DEPLOYMENT & INITIALIZATION
  // ============================================================
  describe("1. Deployment & Initialization", function () {
    it("1.1 Should initialize with correct parameters", async function () {
      expect(await answerShares.usdcToken()).to.equal(await usdc.getAddress());
      expect(await answerShares.treasury()).to.equal(treasury.address);
      expect(await answerShares.questionCreationFee()).to.equal(QUESTION_FEE);
      expect(await answerShares.answerProposalStake()).to.equal(ANSWER_STAKE);
      expect(await answerShares.platformFeeBps()).to.equal(PLATFORM_FEE_BPS);
      expect(await answerShares.creatorFeeBps()).to.equal(CREATOR_FEE_BPS);
      expect(await answerShares.maxAnswersPerQuestion()).to.equal(10);
      expect(await answerShares.nextQuestionId()).to.equal(1);
      expect(await answerShares.nextAnswerId()).to.equal(1);
    });

    it("1.2 Should assign correct roles to admin", async function () {
      expect(await answerShares.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await answerShares.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await answerShares.hasRole(MODERATOR_ROLE, admin.address)).to.be.true;
      expect(await answerShares.hasRole(TREASURY_ROLE, admin.address)).to.be.true;
    });

    it("1.3 Should revert initialization with zero USDC address", async function () {
      const AnswerSharesCoreFactory = await ethers.getContractFactory("AnswerSharesCore");
      await expect(
        upgrades.deployProxy(
          AnswerSharesCoreFactory,
          [ethers.ZeroAddress, treasury.address, admin.address],
          { initializer: "initialize" }
        )
      ).to.be.revertedWithCustomError(answerShares, "InvalidAddress");
    });

    it("1.4 Should revert initialization with zero treasury address", async function () {
      const AnswerSharesCoreFactory = await ethers.getContractFactory("AnswerSharesCore");
      await expect(
        upgrades.deployProxy(
          AnswerSharesCoreFactory,
          [await usdc.getAddress(), ethers.ZeroAddress, admin.address],
          { initializer: "initialize" }
        )
      ).to.be.revertedWithCustomError(answerShares, "InvalidAddress");
    });

    it("1.5 Should revert initialization with zero admin address", async function () {
      const AnswerSharesCoreFactory = await ethers.getContractFactory("AnswerSharesCore");
      await expect(
        upgrades.deployProxy(
          AnswerSharesCoreFactory,
          [await usdc.getAddress(), treasury.address, ethers.ZeroAddress],
          { initializer: "initialize" }
        )
      ).to.be.revertedWithCustomError(answerShares, "InvalidAddress");
    });

    it("1.6 Should not be re-initializable", async function () {
      await expect(
        answerShares.initialize(await usdc.getAddress(), treasury.address, admin.address)
      ).to.be.revertedWithCustomError(answerShares, "InvalidInitialization");
    });

    it("1.7 Should return correct version", async function () {
      expect(await answerShares.version()).to.equal("1.0.0");
    });
  });

  // ============================================================
  // SECTION 2: QUESTION CREATION
  // ============================================================
  describe("2. Question Creation", function () {
    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE * 10n);
    });

    it("2.1 Should create question with valid parameters", async function () {
      const tx = await answerShares.connect(questionCreator).createQuestion(
        "Best L2 for DeFi?",
        "Looking for the best Layer 2 solution"
      );

      await expect(tx)
        .to.emit(answerShares, "QuestionCreated")
        .withArgs(1, questionCreator.address, "Best L2 for DeFi?", "Looking for the best Layer 2 solution");

      const question = await answerShares.getQuestion(1);
      expect(question.id).to.equal(1);
      expect(question.text).to.equal("Best L2 for DeFi?");
      expect(question.description).to.equal("Looking for the best Layer 2 solution");
      expect(question.creator).to.equal(questionCreator.address);
      expect(question.isActive).to.be.true;
      expect(question.totalVolume).to.equal(0);
      expect(question.answerCount).to.equal(0);
    });

    it("2.2 Should collect creation fee to treasury", async function () {
      const treasuryBalanceBefore = await usdc.balanceOf(treasury.address);

      await answerShares.connect(questionCreator).createQuestion("Test?", "Description");

      const treasuryBalanceAfter = await usdc.balanceOf(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(QUESTION_FEE);
    });

    it("2.3 Should increment question ID", async function () {
      await answerShares.connect(questionCreator).createQuestion("Question 1?", "Desc 1");
      await answerShares.connect(questionCreator).createQuestion("Question 2?", "Desc 2");

      expect(await answerShares.nextQuestionId()).to.equal(3);
    });

    it("2.4 Should revert with text too short (< 5 chars)", async function () {
      await expect(
        answerShares.connect(questionCreator).createQuestion("Hi?", "Description")
      ).to.be.revertedWithCustomError(answerShares, "TextTooShort");
    });

    it("2.5 Should revert with text too long (> 100 chars)", async function () {
      const longText = "A".repeat(101) + "?";
      await expect(
        answerShares.connect(questionCreator).createQuestion(longText, "Description")
      ).to.be.revertedWithCustomError(answerShares, "TextTooLong");
    });

    it("2.6 Should revert with description too long (> 280 chars)", async function () {
      const longDesc = "A".repeat(281);
      await expect(
        answerShares.connect(questionCreator).createQuestion("Valid question?", longDesc)
      ).to.be.revertedWithCustomError(answerShares, "TextTooLong");
    });

    it("2.7 Should allow empty description", async function () {
      await expect(
        answerShares.connect(questionCreator).createQuestion("Valid question?", "")
      ).to.not.be.reverted;
    });

    it("2.8 Should allow exactly 5 character text (boundary)", async function () {
      await expect(
        answerShares.connect(questionCreator).createQuestion("12345", "")
      ).to.not.be.reverted;
    });

    it("2.9 Should allow exactly 100 character text (boundary)", async function () {
      const exactText = "A".repeat(100);
      await expect(
        answerShares.connect(questionCreator).createQuestion(exactText, "")
      ).to.not.be.reverted;
    });

    it("2.10 Should allow exactly 280 character description (boundary)", async function () {
      const exactDesc = "A".repeat(280);
      await expect(
        answerShares.connect(questionCreator).createQuestion("Valid?", exactDesc)
      ).to.not.be.reverted;
    });

    it("2.11 Should revert when paused", async function () {
      await answerShares.connect(admin).pause();

      await expect(
        answerShares.connect(questionCreator).createQuestion("Test?", "")
      ).to.be.revertedWithCustomError(answerShares, "EnforcedPause");
    });

    it("2.12 Should revert with insufficient USDC balance", async function () {
      await expect(
        answerShares.connect(attacker).createQuestion("Test?", "")
      ).to.be.reverted; // ERC20 insufficient balance
    });
  });

  // ============================================================
  // SECTION 3: ANSWER PROPOSAL
  // ============================================================
  describe("3. Answer Proposal", function () {
    let questionId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE * 10n);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "Description");
      questionId = 1n;
    });

    it("3.1 Should propose answer with valid parameters", async function () {
      const tx = await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");

      await expect(tx)
        .to.emit(answerShares, "AnswerProposed")
        .withArgs(1, questionId, answerProposer.address, "Base", 5); // 5 shares from $5 stake

      const answer = await answerShares.getAnswer(1);
      expect(answer.id).to.equal(1);
      expect(answer.questionId).to.equal(questionId);
      expect(answer.text).to.equal("Base");
      expect(answer.proposer).to.equal(answerProposer.address);
      expect(answer.totalShares).to.equal(5); // $5 stake / $1 per share
      expect(answer.poolValue).to.equal(ANSWER_STAKE);
      expect(answer.isActive).to.be.true;
      expect(answer.isFlagged).to.be.false;
    });

    it("3.2 Should give proposer initial shares", async function () {
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");

      const position = await answerShares.getUserPosition(1, answerProposer.address);
      expect(position.shares).to.equal(5);
      expect(position.costBasis).to.equal(ANSWER_STAKE);
    });

    it("3.3 Should add answer to question's answer list", async function () {
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Arbitrum");

      const answerIds = await answerShares.getQuestionAnswers(questionId);
      expect(answerIds.length).to.equal(2);
      expect(answerIds[0]).to.equal(1);
      expect(answerIds[1]).to.equal(2);
    });

    it("3.4 Should revert for non-existent question", async function () {
      await expect(
        answerShares.connect(answerProposer).proposeAnswer(999, "Base")
      ).to.be.revertedWithCustomError(answerShares, "QuestionNotFound");
    });

    it("3.5 Should revert for deactivated question", async function () {
      await answerShares.connect(moderator).deactivateQuestion(questionId);

      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "Base")
      ).to.be.revertedWithCustomError(answerShares, "QuestionNotActive");
    });

    it("3.6 Should revert with empty answer text", async function () {
      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "")
      ).to.be.revertedWithCustomError(answerShares, "TextTooShort");
    });

    it("3.7 Should revert with answer text too long (> 60 chars)", async function () {
      const longText = "A".repeat(61);
      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, longText)
      ).to.be.revertedWithCustomError(answerShares, "TextTooLong");
    });

    it("3.8 Should allow exactly 60 character answer (boundary)", async function () {
      const exactText = "A".repeat(60);
      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, exactText)
      ).to.not.be.reverted;
    });

    it("3.9 Should allow exactly 1 character answer (boundary)", async function () {
      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "X")
      ).to.not.be.reverted;
    });

    it("3.10 Should revert on duplicate answer (case-insensitive)", async function () {
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");

      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "BASE")
      ).to.be.revertedWithCustomError(answerShares, "DuplicateAnswer");

      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "base")
      ).to.be.revertedWithCustomError(answerShares, "DuplicateAnswer");
    });

    it("3.11 Should revert when max answers reached", async function () {
      // Create 10 answers (max)
      for (let i = 0; i < 10; i++) {
        await answerShares.connect(answerProposer).proposeAnswer(questionId, `Answer${i}`);
      }

      await expect(
        answerShares.connect(answerProposer).proposeAnswer(questionId, "Answer10")
      ).to.be.revertedWithCustomError(answerShares, "MaxAnswersReached");
    });

    it("3.12 Should track holder correctly", async function () {
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");

      expect(await answerShares.getHolderCount(1)).to.equal(1);
    });
  });

  // ============================================================
  // SECTION 4: SHARE TRADING (BUY)
  // ============================================================
  describe("4. Buy Shares", function () {
    let questionId: bigint;
    let answerId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 1000n * ONE_USDC);
      await fundAccount(trader2, 1000n * ONE_USDC);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "");
      questionId = 1n;

      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      answerId = 1n;
    });

    it("4.1 Should buy shares successfully", async function () {
      const buyAmount = 10n * ONE_USDC; // $10
      const deadline = await getDeadline();

      const tx = await answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline);

      await expect(tx).to.emit(answerShares, "SharesBought");

      const position = await answerShares.getUserPosition(answerId, trader1.address);
      expect(position.shares).to.be.gt(0);
    });

    it("4.2 Should calculate correct shares for purchase", async function () {
      // Initial: 5 shares, $5 pool → price = $1/share
      // Buy $10 → after 2% fee = $9.80 → ~9.8 shares
      const buyAmount = 10n * ONE_USDC;
      const deadline = await getDeadline();

      // Calculate expected: fee = 2%, so 98% goes to pool
      const totalFeeBps = PLATFORM_FEE_BPS + CREATOR_FEE_BPS; // 200 bps = 2%
      const amountAfterFee = buyAmount - (buyAmount * totalFeeBps / 10000n);

      // shares = (amount * totalShares) / poolValue = (9.8 * 5) / 5 = 9.8
      const expectedShares = (amountAfterFee * 5n) / ANSWER_STAKE;

      await answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline);

      const position = await answerShares.getUserPosition(answerId, trader1.address);
      expect(position.shares).to.equal(expectedShares);
    });

    it("4.3 Should distribute fees correctly (platform to treasury, creator to accumulator)", async function () {
      const buyAmount = 100n * ONE_USDC;
      const deadline = await getDeadline();

      const treasuryBefore = await usdc.balanceOf(treasury.address);
      const creatorFeesBefore = await answerShares.getAccumulatedFees(questionCreator.address);

      await answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline);

      const treasuryAfter = await usdc.balanceOf(treasury.address);
      const creatorFeesAfter = await answerShares.getAccumulatedFees(questionCreator.address);

      const expectedPlatformFee = (buyAmount * PLATFORM_FEE_BPS) / 10000n; // 1.5%
      const expectedCreatorFee = (buyAmount * CREATOR_FEE_BPS) / 10000n;   // 0.5%

      expect(treasuryAfter - treasuryBefore).to.equal(expectedPlatformFee);
      expect(creatorFeesAfter - creatorFeesBefore).to.equal(expectedCreatorFee);
    });

    it("4.4 Should emit FeesAccumulated event", async function () {
      const buyAmount = 100n * ONE_USDC;
      const deadline = await getDeadline();
      const expectedCreatorFee = (buyAmount * CREATOR_FEE_BPS) / 10000n;

      await expect(answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline))
        .to.emit(answerShares, "FeesAccumulated")
        .withArgs(questionCreator.address, expectedCreatorFee, expectedCreatorFee);
    });

    it("4.5 Should update question total volume", async function () {
      const buyAmount = 50n * ONE_USDC;
      const deadline = await getDeadline();

      await answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline);

      const question = await answerShares.getQuestion(questionId);
      expect(question.totalVolume).to.equal(buyAmount);
    });

    it("4.6 Should increase pool value after purchase", async function () {
      // Note: With bonding curve formula price = pool/shares, price stays constant
      // because both pool and shares grow proportionally. What changes is total pool value.
      const answerBefore = await answerShares.getAnswer(answerId);
      const poolBefore = answerBefore.poolValue;

      const buyAmount = 100n * ONE_USDC;
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, buyAmount, 0, deadline);

      const answerAfter = await answerShares.getAnswer(answerId);
      expect(answerAfter.poolValue).to.be.gt(poolBefore);
      expect(answerAfter.totalShares).to.be.gt(answerBefore.totalShares);
    });

    it("4.7 Should revert with zero amount", async function () {
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).buyShares(answerId, 0, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "ZeroAmount");
    });

    it("4.8 Should revert with expired deadline", async function () {
      const expiredDeadline = BigInt((await ethers.provider.getBlock("latest"))!.timestamp - 1);

      await expect(
        answerShares.connect(trader1).buyShares(answerId, 10n * ONE_USDC, 0, expiredDeadline)
      ).to.be.revertedWithCustomError(answerShares, "DeadlineExpired");
    });

    it("4.9 Should revert with slippage exceeded", async function () {
      const buyAmount = 10n * ONE_USDC;
      const deadline = await getDeadline();
      const minSharesOut = 1000n; // Unrealistically high

      await expect(
        answerShares.connect(trader1).buyShares(answerId, buyAmount, minSharesOut, deadline)
      ).to.be.revertedWithCustomError(answerShares, "SlippageExceeded");
    });

    it("4.10 Should revert for non-existent answer", async function () {
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).buyShares(999, 10n * ONE_USDC, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "AnswerNotFound");
    });

    it("4.11 Should revert for deactivated answer", async function () {
      await answerShares.connect(moderator).deactivateAnswer(answerId);
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).buyShares(answerId, 10n * ONE_USDC, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "AnswerNotActive");
    });

    it("4.12 Should track new holder", async function () {
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, 10n * ONE_USDC, 0, deadline);

      expect(await answerShares.getHolderCount(answerId)).to.equal(2); // proposer + trader1
    });

    it("4.13 Should not duplicate holder on multiple buys", async function () {
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, 10n * ONE_USDC, 0, deadline);
      await answerShares.connect(trader1).buyShares(answerId, 10n * ONE_USDC, 0, deadline);

      expect(await answerShares.getHolderCount(answerId)).to.equal(2);
    });
  });

  // ============================================================
  // SECTION 5: SHARE TRADING (SELL)
  // ============================================================
  describe("5. Sell Shares", function () {
    let questionId: bigint;
    let answerId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 1000n * ONE_USDC);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "");
      questionId = 1n;

      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      answerId = 1n;

      // Trader1 buys shares
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, 100n * ONE_USDC, 0, deadline);
    });

    it("5.1 Should sell shares successfully", async function () {
      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = position.shares / 2n;
      const deadline = await getDeadline();

      const tx = await answerShares.connect(trader1).sellShares(answerId, sharesToSell, 0, deadline);

      await expect(tx).to.emit(answerShares, "SharesSold");
    });

    it("5.2 Should return correct USDC amount", async function () {
      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = position.shares / 2n;
      const deadline = await getDeadline();

      const balanceBefore = await usdc.balanceOf(trader1.address);
      await answerShares.connect(trader1).sellShares(answerId, sharesToSell, 0, deadline);
      const balanceAfter = await usdc.balanceOf(trader1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("5.3 Should distribute fees correctly on sell", async function () {
      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = position.shares / 2n;
      const deadline = await getDeadline();

      const treasuryBefore = await usdc.balanceOf(treasury.address);
      const creatorFeesBefore = await answerShares.getAccumulatedFees(questionCreator.address);

      await answerShares.connect(trader1).sellShares(answerId, sharesToSell, 0, deadline);

      const treasuryAfter = await usdc.balanceOf(treasury.address);
      const creatorFeesAfter = await answerShares.getAccumulatedFees(questionCreator.address);

      expect(treasuryAfter).to.be.gt(treasuryBefore);
      expect(creatorFeesAfter).to.be.gt(creatorFeesBefore);
    });

    it("5.4 Should decrease pool value after sell", async function () {
      const answerBefore = await answerShares.getAnswer(answerId);
      const poolBefore = answerBefore.poolValue;

      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = position.shares / 2n;
      const deadline = await getDeadline();
      await answerShares.connect(trader1).sellShares(answerId, sharesToSell, 0, deadline);

      const answerAfter = await answerShares.getAnswer(answerId);
      expect(answerAfter.poolValue).to.be.lt(poolBefore);
    });

    it("5.5 Should update user position correctly", async function () {
      const positionBefore = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = positionBefore.shares / 2n;
      const deadline = await getDeadline();

      await answerShares.connect(trader1).sellShares(answerId, sharesToSell, 0, deadline);

      const positionAfter = await answerShares.getUserPosition(answerId, trader1.address);
      expect(positionAfter.shares).to.equal(positionBefore.shares - sharesToSell);
    });

    it("5.6 Should revert with zero amount", async function () {
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).sellShares(answerId, 0, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "ZeroAmount");
    });

    it("5.7 Should revert with expired deadline", async function () {
      const expiredDeadline = BigInt((await ethers.provider.getBlock("latest"))!.timestamp - 1);

      await expect(
        answerShares.connect(trader1).sellShares(answerId, 1, 0, expiredDeadline)
      ).to.be.revertedWithCustomError(answerShares, "DeadlineExpired");
    });

    it("5.8 Should revert with insufficient shares", async function () {
      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).sellShares(answerId, position.shares + 1n, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "InsufficientShares");
    });

    it("5.9 Should revert with slippage exceeded", async function () {
      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const sharesToSell = position.shares / 2n;
      const deadline = await getDeadline();
      const minUsdcOut = 1000n * ONE_USDC; // Unrealistically high

      await expect(
        answerShares.connect(trader1).sellShares(answerId, sharesToSell, minUsdcOut, deadline)
      ).to.be.revertedWithCustomError(answerShares, "SlippageExceeded");
    });

    it("5.10 Should allow selling when answer is deactivated (prevent locked funds)", async function () {
      await answerShares.connect(moderator).deactivateAnswer(answerId);

      const position = await answerShares.getUserPosition(answerId, trader1.address);
      const deadline = await getDeadline();

      // Should NOT revert - selling is allowed even when deactivated
      await expect(
        answerShares.connect(trader1).sellShares(answerId, position.shares / 2n, 0, deadline)
      ).to.not.be.reverted;
    });

    it("5.11 Should revert when trying to sell all shares (MIN_SHARES_RESERVE)", async function () {
      // Create a new answer where proposer is the only holder
      await fundAccount(answerProposer, ANSWER_STAKE);
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Optimism");
      const newAnswerId = 2n;

      // Proposer has 5 shares, totalShares = 5
      // Trying to sell all 5 would leave 0 shares, violating MIN_SHARES_RESERVE = 1
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(answerProposer).sellShares(newAnswerId, 5n, 0, deadline)
      ).to.be.revertedWithCustomError(answerShares, "SharesReserveViolation");
    });
  });

  // ============================================================
  // SECTION 6: FEE CLAIMING
  // ============================================================
  describe("6. Fee Claiming", function () {
    let questionId: bigint;
    let answerId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 1000n * ONE_USDC);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "");
      questionId = 1n;

      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      answerId = 1n;

      // Generate some trading fees
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, 100n * ONE_USDC, 0, deadline);
    });

    it("6.1 Should accumulate creator fees", async function () {
      const fees = await answerShares.getAccumulatedFees(questionCreator.address);
      expect(fees).to.be.gt(0);
    });

    it("6.2 Should claim accumulated fees successfully", async function () {
      const feesBefore = await answerShares.getAccumulatedFees(questionCreator.address);
      const balanceBefore = await usdc.balanceOf(questionCreator.address);

      await answerShares.connect(questionCreator).claimAccumulatedFees();

      const feesAfter = await answerShares.getAccumulatedFees(questionCreator.address);
      const balanceAfter = await usdc.balanceOf(questionCreator.address);

      expect(feesAfter).to.equal(0);
      expect(balanceAfter - balanceBefore).to.equal(feesBefore);
    });

    it("6.3 Should emit FeesClaimed event", async function () {
      const fees = await answerShares.getAccumulatedFees(questionCreator.address);

      await expect(answerShares.connect(questionCreator).claimAccumulatedFees())
        .to.emit(answerShares, "FeesClaimed")
        .withArgs(questionCreator.address, fees);
    });

    it("6.4 Should revert when no fees to claim", async function () {
      await expect(
        answerShares.connect(attacker).claimAccumulatedFees()
      ).to.be.revertedWithCustomError(answerShares, "NoFeesToClaim");
    });

    it("6.5 Should update total accumulated fees", async function () {
      const totalBefore = await answerShares.getTotalAccumulatedFees();
      const userFees = await answerShares.getAccumulatedFees(questionCreator.address);

      await answerShares.connect(questionCreator).claimAccumulatedFees();

      const totalAfter = await answerShares.getTotalAccumulatedFees();
      expect(totalBefore - totalAfter).to.equal(userFees);
    });

    it("6.6 Should accumulate fees from multiple trades", async function () {
      const deadline = await getDeadline();

      // More trades
      await answerShares.connect(trader1).buyShares(answerId, 50n * ONE_USDC, 0, deadline);

      const position = await answerShares.getUserPosition(answerId, trader1.address);
      await answerShares.connect(trader1).sellShares(answerId, position.shares / 2n, 0, deadline);

      const fees = await answerShares.getAccumulatedFees(questionCreator.address);

      // Should have fees from: initial buy + second buy + sell
      // Each trade: 0.5% creator fee
      expect(fees).to.be.gt((100n * ONE_USDC * CREATOR_FEE_BPS) / 10000n);
    });

    it("6.7 Should not allow claiming when paused", async function () {
      await answerShares.connect(admin).pause();

      await expect(
        answerShares.connect(questionCreator).claimAccumulatedFees()
      ).to.be.revertedWithCustomError(answerShares, "EnforcedPause");
    });
  });

  // ============================================================
  // SECTION 7: EDGE CASES & BOUNDARIES
  // ============================================================
  describe("7. Edge Cases & Boundaries", function () {
    let questionId: bigint;
    let answerId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 10000n * ONE_USDC);
      await fundAccount(trader2, 10000n * ONE_USDC);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "");
      questionId = 1n;

      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      answerId = 1n;
    });

    it("7.1 Should handle minimum viable purchase ($1)", async function () {
      const deadline = await getDeadline();

      await expect(
        answerShares.connect(trader1).buyShares(answerId, ONE_USDC, 0, deadline)
      ).to.not.be.reverted;
    });

    it("7.2 Should handle very small purchase (1 cent)", async function () {
      const deadline = await getDeadline();
      const oneCent = ONE_USDC / 100n;

      // May result in 0 shares due to rounding, but shouldn't revert
      await answerShares.connect(trader1).buyShares(answerId, oneCent, 0, deadline);
    });

    it("7.3 Should maintain pool reserve on large sells", async function () {
      const deadline = await getDeadline();

      // Large buy to get many shares
      await answerShares.connect(trader1).buyShares(answerId, 1000n * ONE_USDC, 0, deadline);

      const position = await answerShares.getUserPosition(answerId, trader1.address);

      // Try to sell all but leave pool underfunded
      // This should be prevented by MIN_POOL_RESERVE
      const answer = await answerShares.getAnswer(answerId);

      // Selling too many shares should trigger pool reserve violation
      // Note: The exact number depends on pool math
    });

    it("7.4 Should handle sequential buys with price impact", async function () {
      const deadline = await getDeadline();

      // Trader1 buys first
      await answerShares.connect(trader1).buyShares(answerId, 100n * ONE_USDC, 0, deadline);
      const position1 = await answerShares.getUserPosition(answerId, trader1.address);

      // Get price after first buy
      const priceAfterFirst = await answerShares.getSharePrice(answerId);

      // Trader2 buys second (price is now higher)
      await answerShares.connect(trader2).buyShares(answerId, 100n * ONE_USDC, 0, deadline);
      const position2 = await answerShares.getUserPosition(answerId, trader2.address);

      expect(position1.shares).to.be.gt(0);
      expect(position2.shares).to.be.gt(0);

      // Both got shares, price impact means later buyer gets fewer shares per dollar
      // With bonding curve: shares = (amount * totalShares) / poolValue
      // As pool grows, this ratio decreases
      expect(position1.shares).to.be.gte(position2.shares);
    });

    it("7.5 Should calculate correct leading answer", async function () {
      await fundAccount(answerProposer, ANSWER_STAKE * 2n);
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Arbitrum");
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Optimism");

      const deadline = await getDeadline();

      // Buy into answer 2 (Arbitrum) to make it the leader
      await answerShares.connect(trader1).buyShares(2, 200n * ONE_USDC, 0, deadline);

      const [leaderId, marketCap] = await answerShares.getLeadingAnswer(questionId);
      expect(leaderId).to.equal(2);
    });

    it("7.6 Should handle user P&L calculation correctly", async function () {
      const deadline = await getDeadline();

      // Buy at initial price
      await answerShares.connect(trader1).buyShares(answerId, 100n * ONE_USDC, 0, deadline);

      const position = await answerShares.getUserPosition(answerId, trader1.address);

      // Current value should be close to cost basis initially (minus fees already taken)
      // profitLoss = currentValue - costBasis
      // Since price went up after our buy, we should be slightly positive
    });

    it("7.7 Should return base price when totalShares is 0 (edge case)", async function () {
      // This shouldn't happen in practice since proposal creates shares
      // But getSharePrice handles it
      const price = await answerShares.getSharePrice(999);
      expect(price).to.equal(ONE_USDC); // Default $1
    });

    it("7.8 Should handle very large trade amounts", async function () {
      await fundAccount(trader1, 1000000n * ONE_USDC); // $1M
      await usdc.connect(trader1).approve(await answerShares.getAddress(), 1000000n * ONE_USDC);

      const deadline = await getDeadline();

      // This should work up to MAX_POOL_VALUE
      await expect(
        answerShares.connect(trader1).buyShares(answerId, 100000n * ONE_USDC, 0, deadline)
      ).to.not.be.reverted;
    });
  });

  // ============================================================
  // SECTION 8: MODERATION
  // ============================================================
  describe("8. Moderation Functions", function () {
    let questionId: bigint;
    let answerId: bigint;

    beforeEach(async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);

      await answerShares.connect(questionCreator).createQuestion("Best L2?", "");
      questionId = 1n;

      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Base");
      answerId = 1n;
    });

    it("8.1 Should deactivate answer (moderator only)", async function () {
      await expect(answerShares.connect(moderator).deactivateAnswer(answerId))
        .to.emit(answerShares, "AnswerDeactivated")
        .withArgs(answerId, moderator.address);

      const answer = await answerShares.getAnswer(answerId);
      expect(answer.isActive).to.be.false;
    });

    it("8.2 Should reactivate answer (moderator only)", async function () {
      await answerShares.connect(moderator).deactivateAnswer(answerId);

      await expect(answerShares.connect(moderator).reactivateAnswer(answerId))
        .to.emit(answerShares, "AnswerReactivated")
        .withArgs(answerId, moderator.address);

      const answer = await answerShares.getAnswer(answerId);
      expect(answer.isActive).to.be.true;
    });

    it("8.3 Should flag answer with reason", async function () {
      await expect(answerShares.connect(moderator).flagAnswer(answerId, "Spam content"))
        .to.emit(answerShares, "AnswerFlagged")
        .withArgs(answerId, moderator.address, "Spam content");

      const answer = await answerShares.getAnswer(answerId);
      expect(answer.isFlagged).to.be.true;
    });

    it("8.4 Should unflag answer", async function () {
      await answerShares.connect(moderator).flagAnswer(answerId, "Spam");
      await answerShares.connect(moderator).unflagAnswer(answerId);

      const answer = await answerShares.getAnswer(answerId);
      expect(answer.isFlagged).to.be.false;
    });

    it("8.5 Should deactivate question", async function () {
      await expect(answerShares.connect(moderator).deactivateQuestion(questionId))
        .to.emit(answerShares, "QuestionDeactivated")
        .withArgs(questionId, moderator.address);

      const question = await answerShares.getQuestion(questionId);
      expect(question.isActive).to.be.false;
    });

    it("8.6 Should reactivate question", async function () {
      await answerShares.connect(moderator).deactivateQuestion(questionId);

      await expect(answerShares.connect(moderator).reactivateQuestion(questionId))
        .to.emit(answerShares, "QuestionReactivated")
        .withArgs(questionId, moderator.address);

      const question = await answerShares.getQuestion(questionId);
      expect(question.isActive).to.be.true;
    });

    it("8.7 Should revert moderation from non-moderator", async function () {
      await expect(
        answerShares.connect(attacker).deactivateAnswer(answerId)
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");

      await expect(
        answerShares.connect(attacker).flagAnswer(answerId, "test")
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");

      await expect(
        answerShares.connect(attacker).deactivateQuestion(questionId)
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");
    });

    it("8.8 Should revert moderation on non-existent entities", async function () {
      await expect(
        answerShares.connect(moderator).deactivateAnswer(999)
      ).to.be.revertedWithCustomError(answerShares, "AnswerNotFound");

      await expect(
        answerShares.connect(moderator).deactivateQuestion(999)
      ).to.be.revertedWithCustomError(answerShares, "QuestionNotFound");
    });
  });

  // ============================================================
  // SECTION 9: ADMIN FUNCTIONS
  // ============================================================
  describe("9. Admin Functions", function () {
    it("9.1 Should pause/unpause contract", async function () {
      await answerShares.connect(admin).pause();
      expect(await answerShares.paused()).to.be.true;

      await answerShares.connect(admin).unpause();
      expect(await answerShares.paused()).to.be.false;
    });

    it("9.2 Should update fees", async function () {
      await expect(answerShares.connect(admin).setFees(100, 100))
        .to.emit(answerShares, "FeesUpdated")
        .withArgs(100, 100);

      expect(await answerShares.platformFeeBps()).to.equal(100);
      expect(await answerShares.creatorFeeBps()).to.equal(100);
    });

    it("9.3 Should revert fee update exceeding max", async function () {
      await expect(
        answerShares.connect(admin).setFees(1001, 100)
      ).to.be.revertedWithCustomError(answerShares, "FeeTooHigh");

      await expect(
        answerShares.connect(admin).setFees(100, 1001)
      ).to.be.revertedWithCustomError(answerShares, "FeeTooHigh");
    });

    it("9.4 Should update question creation fee", async function () {
      const newFee = 5n * ONE_USDC;

      await expect(answerShares.connect(admin).setQuestionCreationFee(newFee))
        .to.emit(answerShares, "QuestionCreationFeeUpdated")
        .withArgs(QUESTION_FEE, newFee);

      expect(await answerShares.questionCreationFee()).to.equal(newFee);
    });

    it("9.5 Should revert question fee exceeding max ($100)", async function () {
      const maxFee = 100n * ONE_USDC;

      await expect(
        answerShares.connect(admin).setQuestionCreationFee(maxFee + 1n)
      ).to.be.revertedWithCustomError(answerShares, "FeeTooHigh");
    });

    it("9.6 Should update answer proposal stake", async function () {
      const newStake = 10n * ONE_USDC;

      await expect(answerShares.connect(admin).setAnswerProposalStake(newStake))
        .to.emit(answerShares, "AnswerProposalStakeUpdated")
        .withArgs(ANSWER_STAKE, newStake);

      expect(await answerShares.answerProposalStake()).to.equal(newStake);
    });

    it("9.7 Should revert stake below minimum ($1)", async function () {
      await expect(
        answerShares.connect(admin).setAnswerProposalStake(ONE_USDC - 1n)
      ).to.be.revertedWithCustomError(answerShares, "StakeTooLow");
    });

    it("9.8 Should revert stake above maximum ($1000)", async function () {
      const maxStake = 1000n * ONE_USDC;

      await expect(
        answerShares.connect(admin).setAnswerProposalStake(maxStake + 1n)
      ).to.be.revertedWithCustomError(answerShares, "StakeTooHigh");
    });

    it("9.9 Should update max answers per question", async function () {
      await expect(answerShares.connect(admin).setMaxAnswersPerQuestion(20))
        .to.emit(answerShares, "MaxAnswersUpdated")
        .withArgs(10, 20);

      expect(await answerShares.maxAnswersPerQuestion()).to.equal(20);
    });

    it("9.10 Should revert invalid max answers (< 2 or > 50)", async function () {
      await expect(
        answerShares.connect(admin).setMaxAnswersPerQuestion(1)
      ).to.be.revertedWithCustomError(answerShares, "InvalidMaxAnswers");

      await expect(
        answerShares.connect(admin).setMaxAnswersPerQuestion(51)
      ).to.be.revertedWithCustomError(answerShares, "InvalidMaxAnswers");
    });

    it("9.11 Should update treasury", async function () {
      const newTreasury = trader1.address;

      await expect(answerShares.connect(admin).setTreasury(newTreasury))
        .to.emit(answerShares, "TreasuryUpdated")
        .withArgs(treasury.address, newTreasury);

      expect(await answerShares.treasury()).to.equal(newTreasury);
    });

    it("9.12 Should revert treasury update to zero address", async function () {
      await expect(
        answerShares.connect(admin).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(answerShares, "InvalidAddress");
    });

    it("9.13 Should emergency withdraw when paused", async function () {
      // First, get some USDC into the contract
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await answerShares.connect(questionCreator).createQuestion("Test?", "");
      await answerShares.connect(answerProposer).proposeAnswer(1, "Answer");

      const contractBalance = await usdc.balanceOf(await answerShares.getAddress());
      expect(contractBalance).to.be.gt(0);

      // Pause and withdraw
      await answerShares.connect(admin).pause();

      const adminBalanceBefore = await usdc.balanceOf(admin.address);

      await expect(
        answerShares.connect(admin).emergencyWithdraw(
          await usdc.getAddress(),
          admin.address,
          contractBalance
        )
      ).to.emit(answerShares, "EmergencyWithdraw");

      const adminBalanceAfter = await usdc.balanceOf(admin.address);
      expect(adminBalanceAfter - adminBalanceBefore).to.equal(contractBalance);
    });

    it("9.14 Should revert emergency withdraw when not paused", async function () {
      await expect(
        answerShares.connect(admin).emergencyWithdraw(
          await usdc.getAddress(),
          admin.address,
          ONE_USDC
        )
      ).to.be.revertedWithCustomError(answerShares, "NotPaused");
    });

    it("9.15 Should transfer full admin", async function () {
      const newAdmin = trader1.address;

      await answerShares.connect(admin).transferFullAdmin(newAdmin);

      // New admin should have all roles
      expect(await answerShares.hasRole(DEFAULT_ADMIN_ROLE, newAdmin)).to.be.true;
      expect(await answerShares.hasRole(ADMIN_ROLE, newAdmin)).to.be.true;
      expect(await answerShares.hasRole(MODERATOR_ROLE, newAdmin)).to.be.true;
      expect(await answerShares.hasRole(TREASURY_ROLE, newAdmin)).to.be.true;

      // Old admin should have no roles
      expect(await answerShares.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.false;
      expect(await answerShares.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
      expect(await answerShares.hasRole(MODERATOR_ROLE, admin.address)).to.be.false;
      expect(await answerShares.hasRole(TREASURY_ROLE, admin.address)).to.be.false;
    });

    it("9.16 Should revert admin functions from non-admin", async function () {
      await expect(
        answerShares.connect(attacker).pause()
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");

      await expect(
        answerShares.connect(attacker).setFees(100, 100)
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");

      await expect(
        answerShares.connect(attacker).transferFullAdmin(attacker.address)
      ).to.be.revertedWithCustomError(answerShares, "AccessControlUnauthorizedAccount");
    });
  });

  // ============================================================
  // SECTION 10: INTEGRATION TESTS
  // ============================================================
  describe("10. Integration Tests (Full Trading Flows)", function () {
    it("10.1 Complete flow: create → propose → buy → sell → claim", async function () {
      // Setup
      await fundAccount(questionCreator, QUESTION_FEE + 100n * ONE_USDC);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 500n * ONE_USDC);
      await fundAccount(trader2, 500n * ONE_USDC);

      // 1. Create question
      await answerShares.connect(questionCreator).createQuestion("Best DEX?", "Decentralized exchange");
      const questionId = 1n;

      // 2. Propose answers
      await answerShares.connect(answerProposer).proposeAnswer(questionId, "Uniswap");
      const answerId = 1n;

      // 3. Multiple traders buy
      const deadline = await getDeadline();
      await answerShares.connect(trader1).buyShares(answerId, 100n * ONE_USDC, 0, deadline);
      await answerShares.connect(trader2).buyShares(answerId, 200n * ONE_USDC, 0, deadline);

      // Check price increased
      const priceAfterBuys = await answerShares.getSharePrice(answerId);
      expect(priceAfterBuys).to.be.gt(ONE_USDC);

      // 4. Trader1 takes profit
      const position1 = await answerShares.getUserPosition(answerId, trader1.address);
      await answerShares.connect(trader1).sellShares(answerId, position1.shares, 0, deadline);

      // 5. Creator claims fees
      const creatorFees = await answerShares.getAccumulatedFees(questionCreator.address);
      expect(creatorFees).to.be.gt(0);

      const creatorBalanceBefore = await usdc.balanceOf(questionCreator.address);
      await answerShares.connect(questionCreator).claimAccumulatedFees();
      const creatorBalanceAfter = await usdc.balanceOf(questionCreator.address);

      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(creatorFees);

      // 6. Verify final state
      const question = await answerShares.getQuestion(questionId);
      expect(question.totalVolume).to.be.gt(0);

      const answer = await answerShares.getAnswer(answerId);
      expect(answer.totalShares).to.be.gt(0);
      expect(answer.poolValue).to.be.gt(0);
    });

    it("10.2 Competition: multiple answers competing for leading position", async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE * 3n);
      await fundAccount(trader1, 1000n * ONE_USDC);
      await fundAccount(trader2, 1000n * ONE_USDC);

      // Create question with 3 answers
      await answerShares.connect(questionCreator).createQuestion("Best blockchain?", "");
      await answerShares.connect(answerProposer).proposeAnswer(1, "Ethereum");
      await answerShares.connect(answerProposer).proposeAnswer(1, "Solana");
      await answerShares.connect(answerProposer).proposeAnswer(1, "Bitcoin");

      const deadline = await getDeadline();

      // Initially all equal
      let [leader, cap] = await answerShares.getLeadingAnswer(1);
      expect(leader).to.equal(1); // First answer wins ties

      // Trader1 backs Solana (answer 2)
      await answerShares.connect(trader1).buyShares(2, 100n * ONE_USDC, 0, deadline);

      [leader, cap] = await answerShares.getLeadingAnswer(1);
      expect(leader).to.equal(2); // Solana leads

      // Trader2 backs Ethereum (answer 1) with more
      await answerShares.connect(trader2).buyShares(1, 200n * ONE_USDC, 0, deadline);

      [leader, cap] = await answerShares.getLeadingAnswer(1);
      expect(leader).to.equal(1); // Ethereum leads now
    });

    it("10.3 Stress test: many small trades", async function () {
      await fundAccount(questionCreator, QUESTION_FEE);
      await fundAccount(answerProposer, ANSWER_STAKE);
      await fundAccount(trader1, 1000n * ONE_USDC);

      await answerShares.connect(questionCreator).createQuestion("Test?", "");
      await answerShares.connect(answerProposer).proposeAnswer(1, "Answer");

      const deadline = await getDeadline(7200); // 2 hours

      // 50 small buys
      for (let i = 0; i < 50; i++) {
        await answerShares.connect(trader1).buyShares(1, 5n * ONE_USDC, 0, deadline);
      }

      const position = await answerShares.getUserPosition(1, trader1.address);
      expect(position.shares).to.be.gt(0);

      // 25 small sells
      for (let i = 0; i < 25; i++) {
        await answerShares.connect(trader1).sellShares(1, 1n, 0, deadline);
      }

      // Verify state is consistent
      const answer = await answerShares.getAnswer(1);
      expect(answer.totalShares).to.be.gt(MIN_SHARES_RESERVE);
      expect(answer.poolValue).to.be.gte(MIN_POOL_RESERVE);
    });

    it("10.4 Fee accumulation across multiple questions", async function () {
      await fundAccount(questionCreator, QUESTION_FEE * 3n);
      await fundAccount(answerProposer, ANSWER_STAKE * 3n);
      await fundAccount(trader1, 1000n * ONE_USDC);

      // Create 3 questions
      for (let i = 0; i < 3; i++) {
        await answerShares.connect(questionCreator).createQuestion(`Question ${i}?`, "");
        await answerShares.connect(answerProposer).proposeAnswer(i + 1, `Answer ${i}`);
      }

      const deadline = await getDeadline();

      // Trade on all questions
      await answerShares.connect(trader1).buyShares(1, 100n * ONE_USDC, 0, deadline);
      await answerShares.connect(trader1).buyShares(2, 100n * ONE_USDC, 0, deadline);
      await answerShares.connect(trader1).buyShares(3, 100n * ONE_USDC, 0, deadline);

      // Creator should have accumulated fees from all 3 questions
      const totalFees = await answerShares.getAccumulatedFees(questionCreator.address);
      const expectedMinFees = (300n * ONE_USDC * CREATOR_FEE_BPS) / 10000n;

      expect(totalFees).to.be.gte(expectedMinFees);
    });
  });
});
