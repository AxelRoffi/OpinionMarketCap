const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AnswerSharesCoreV3", function () {
  // Constants matching contract
  const SHARES_DECIMALS = 100n;
  const USDC_DECIMALS = 6;
  const toUSDC = (amount) => BigInt(Math.floor(amount * 10 ** USDC_DECIMALS));

  // Default config
  const QUESTION_FEE = toUSDC(5);      // $5
  const ANSWER_STAKE = toUSDC(5);      // $5
  const BOOTSTRAP_THRESHOLD = toUSDC(50);  // $50
  const MAX_MULTIPLIER = 10n;
  const GRADUATION_THRESHOLD = toUSDC(500); // $500
  const KING_FLIP_THRESHOLD_BPS = 500n;     // 5%

  // Fee structure (3% total)
  const PLATFORM_FEE_BPS = 200n;  // 2%
  const CREATOR_FEE_BPS = 50n;    // 0.5%
  const KING_FEE_BPS = 50n;       // 0.5%

  let contract;
  let usdc;
  let owner, admin, user1, user2, user3, treasury;

  beforeEach(async function () {
    [owner, admin, user1, user2, user3, treasury] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Mint USDC to users
    const mintAmount = toUSDC(100000);
    await usdc.mint(user1.address, mintAmount);
    await usdc.mint(user2.address, mintAmount);
    await usdc.mint(user3.address, mintAmount);
    await usdc.mint(owner.address, mintAmount);

    // Deploy V3 contract
    const AnswerSharesCoreV3 = await ethers.getContractFactory("AnswerSharesCoreV3");
    contract = await upgrades.deployProxy(
      AnswerSharesCoreV3,
      [await usdc.getAddress(), treasury.address, admin.address],
      { initializer: "initialize", kind: "uups" }
    );
    await contract.waitForDeployment();

    // Approve contract for all users
    const contractAddr = await contract.getAddress();
    await usdc.connect(user1).approve(contractAddr, ethers.MaxUint256);
    await usdc.connect(user2).approve(contractAddr, ethers.MaxUint256);
    await usdc.connect(user3).approve(contractAddr, ethers.MaxUint256);
    await usdc.connect(owner).approve(contractAddr, ethers.MaxUint256);
  });

  // Helper to create question with answer
  async function createQuestionWithAnswer(
    questionText = "Who is the GOAT?",
    category = "Sports",
    answerText = "Messi",
    user = user1
  ) {
    await contract.connect(user).createQuestionWithAnswer(
      questionText,
      category,
      answerText,
      "The greatest of all time",
      "https://example.com"
    );
    return { questionId: 1n, answerId: 1n };
  }

  describe("Deployment & Initialization", function () {
    it("should initialize with correct default values", async function () {
      expect(await contract.questionCreationFee()).to.equal(QUESTION_FEE);
      expect(await contract.answerProposalStake()).to.equal(ANSWER_STAKE);
      expect(await contract.bootstrapThreshold()).to.equal(BOOTSTRAP_THRESHOLD);
      expect(await contract.maxMultiplier()).to.equal(MAX_MULTIPLIER);
      expect(await contract.graduationThreshold()).to.equal(GRADUATION_THRESHOLD);
      expect(await contract.kingFlipThresholdBps()).to.equal(KING_FLIP_THRESHOLD_BPS);
      expect(await contract.platformFeeBps()).to.equal(PLATFORM_FEE_BPS);
      expect(await contract.creatorFeeBps()).to.equal(CREATOR_FEE_BPS);
      expect(await contract.kingFeeBps()).to.equal(KING_FEE_BPS);
      expect(await contract.baseAnswerLimit()).to.equal(7);
      expect(await contract.maxAnswerLimit()).to.equal(25);
      expect(await contract.volumePerSlot()).to.equal(toUSDC(50));
      expect(await contract.treasury()).to.equal(treasury.address);
    });

    it("should set correct roles", async function () {
      const ADMIN_ROLE = await contract.ADMIN_ROLE();
      const MODERATOR_ROLE = await contract.MODERATOR_ROLE();
      const TREASURY_ROLE = await contract.TREASURY_ROLE();

      expect(await contract.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(MODERATOR_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(TREASURY_ROLE, admin.address)).to.be.true;
    });
  });

  describe("Question Creation", function () {
    it("should charge $5 fee for question creation", async function () {
      const balanceBefore = await usdc.balanceOf(treasury.address);
      await contract.connect(user1).createQuestion("Test question?", "General");
      const balanceAfter = await usdc.balanceOf(treasury.address);

      expect(balanceAfter - balanceBefore).to.equal(QUESTION_FEE);
    });

    it("should create question with answer and give proposer 10x shares", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      // Proposer should have 50 shares (5 USDC * 10x multiplier * 100 decimals / 1e6)
      const expectedShares = (ANSWER_STAKE * MAX_MULTIPLIER * SHARES_DECIMALS) / BigInt(1e6);
      const position = await contract.getUserPosition(answerId, user1.address);

      expect(position.shares).to.equal(expectedShares);
      expect(expectedShares).to.equal(5000n); // 50.00 shares
    });

    it("should set first answer as leader", async function () {
      await createQuestionWithAnswer();
      const questionId = 1n;
      const answerId = 1n;

      const question = await contract.getQuestion(questionId);
      expect(question.leadingAnswerId).to.equal(answerId);
    });
  });

  describe("Exponential Pricing (First $50)", function () {
    it("should give high multiplier at low pool values", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      // Pool starts at $5 (proposal stake)
      const buyAmount = toUSDC(5);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const position = await contract.getUserPosition(answerId, user2.address);
      // Should get substantial shares due to multiplier
      expect(position.shares).to.be.gt(4000n);
    });

    it("should give linear pricing after $50 pool threshold", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Buy enough to clearly pass the $50 threshold
      await contract.connect(user2).buyShares(answerId, toUSDC(100), 0, deadline);

      const answer = await contract.answers(answerId);
      expect(answer.poolValue).to.be.gte(BOOTSTRAP_THRESHOLD);

      // Get shares before third buy
      const sharesBefore = answer.totalShares;
      const poolBefore = answer.poolValue;

      // Buy more in linear phase
      const buyAmount = toUSDC(20);
      await contract.connect(user3).buyShares(answerId, buyAmount, 0, deadline);

      const position = await contract.getUserPosition(answerId, user3.address);

      // In linear phase: shares ≈ (amount * totalShares) / poolValue
      // After 3% fee: ~$19.40 effective
      // The key assertion is that linear gives FEWER shares per dollar than exponential
      // At exponential phase, first buyers get 9x+ multiplier (900+ shares/dollar)
      // At linear phase, should get significantly less
      const sharesPerDollar = Number(position.shares) / 20;
      expect(sharesPerDollar).to.be.lt(1000); // Less than exponential peak
      expect(position.shares).to.be.gt(0);    // But still gets some shares
    });
  });

  describe("Fee Distribution (3% Total)", function () {
    it("should distribute 2% to platform treasury", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const balanceBefore = await usdc.balanceOf(treasury.address);

      const buyAmount = toUSDC(100);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const balanceAfter = await usdc.balanceOf(treasury.address);
      const platformFee = balanceAfter - balanceBefore;

      expect(platformFee).to.equal(toUSDC(2));
    });

    it("should accumulate 0.5% for question creator", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const buyAmount = toUSDC(100);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const creatorFees = await contract.getAccumulatedFees(user1.address);
      expect(creatorFees).to.equal(toUSDC(0.5));
    });

    it("should allow creator to claim accumulated fees", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const buyAmount = toUSDC(100);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const balanceBefore = await usdc.balanceOf(user1.address);
      await contract.connect(user1).claimAccumulatedFees();
      const balanceAfter = await usdc.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(toUSDC(0.5));
    });
  });

  describe("King of the Hill Fees", function () {
    it("should distribute 0.5% to king answer holders", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const buyAmount = toUSDC(100);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const pendingFees = await contract.getPendingKingFees(answerId, user1.address);
      expect(pendingFees).to.be.gt(0);
    });

    it("should allow king fee claiming", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const buyAmount = toUSDC(100);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, buyAmount, 0, deadline);

      const balanceBefore = await usdc.balanceOf(user1.address);
      await contract.connect(user1).claimKingFees(answerId);
      const balanceAfter = await usdc.balanceOf(user1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("5% Hysteresis (King Flip Protection)", function () {
    it("should NOT flip king if challenger is less than 5% ahead", async function () {
      await createQuestionWithAnswer("Who is the GOAT?", "Sports", "Messi");
      const questionId = 1n;
      const answer1 = 1n;

      await contract.connect(user2).proposeAnswer(questionId, "Ronaldo", "Also great", "");
      const answer2 = 2n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await contract.connect(user3).buyShares(answer1, toUSDC(50), 0, deadline);
      await contract.connect(user3).buyShares(answer2, toUSDC(52), 0, deadline);

      const question = await contract.getQuestion(questionId);
      expect(question.leadingAnswerId).to.equal(answer1);
    });

    it("should flip king when challenger exceeds 5% threshold", async function () {
      await createQuestionWithAnswer("Who is the GOAT?", "Sports", "Messi");
      const questionId = 1n;

      await contract.connect(user2).proposeAnswer(questionId, "Ronaldo", "Also great", "");
      const answer2 = 2n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await contract.connect(user3).buyShares(1n, toUSDC(20), 0, deadline);
      await contract.connect(user3).buyShares(answer2, toUSDC(100), 0, deadline);

      const question = await contract.getQuestion(questionId);
      expect(question.leadingAnswerId).to.equal(answer2);
    });

    it("should emit LeaderChanged event on flip", async function () {
      await createQuestionWithAnswer("Who is the GOAT?", "Sports", "Messi");
      const questionId = 1n;

      await contract.connect(user2).proposeAnswer(questionId, "Ronaldo", "", "");
      const answer2 = 2n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await expect(contract.connect(user3).buyShares(answer2, toUSDC(200), 0, deadline))
        .to.emit(contract, "LeaderChanged");
    });
  });

  describe("Dynamic Answer Limits", function () {
    it("should start with base limit of 7", async function () {
      await createQuestionWithAnswer();
      const questionId = 1n;

      const maxAnswers = await contract.getMaxAnswersForQuestion(questionId);
      expect(maxAnswers).to.equal(7);
    });

    it("should increase limit with volume (+1 per $50)", async function () {
      await createQuestionWithAnswer();
      const questionId = 1n;
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, toUSDC(100), 0, deadline);

      const maxAnswers = await contract.getMaxAnswersForQuestion(questionId);
      expect(maxAnswers).to.be.gte(8);
    });
  });

  describe("Graduation Events", function () {
    it("should emit AnswerGraduated at $500 market cap", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await expect(contract.connect(user2).buyShares(answerId, toUSDC(600), 0, deadline))
        .to.emit(contract, "AnswerGraduated");
    });
  });

  describe("Selling Shares", function () {
    it("should return USDC when selling", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, toUSDC(100), 0, deadline);

      const position = await contract.getUserPosition(answerId, user2.address);
      const sharesToSell = position.shares / 2n;

      const balanceBefore = await usdc.balanceOf(user2.address);
      await contract.connect(user2).sellShares(answerId, sharesToSell, 0, deadline);
      const balanceAfter = await usdc.balanceOf(user2.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should apply 3% fee on sells", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user2).buyShares(answerId, toUSDC(100), 0, deadline);

      const treasuryBefore = await usdc.balanceOf(treasury.address);

      const position = await contract.getUserPosition(answerId, user2.address);
      await contract.connect(user2).sellShares(answerId, position.shares / 2n, 0, deadline);

      const treasuryAfter = await usdc.balanceOf(treasury.address);
      expect(treasuryAfter).to.be.gt(treasuryBefore);
    });
  });

  describe("Admin Functions", function () {
    it("should allow admin to change question creation fee", async function () {
      await contract.connect(admin).setQuestionCreationFee(toUSDC(10));
      expect(await contract.questionCreationFee()).to.equal(toUSDC(10));
    });

    it("should allow admin to change answer proposal stake", async function () {
      await contract.connect(admin).setAnswerProposalStake(toUSDC(10));
      expect(await contract.answerProposalStake()).to.equal(toUSDC(10));
    });

    it("should allow admin to change fee structure", async function () {
      await contract.connect(admin).setFees(300, 100, 100);
      expect(await contract.platformFeeBps()).to.equal(300);
      expect(await contract.creatorFeeBps()).to.equal(100);
      expect(await contract.kingFeeBps()).to.equal(100);
    });

    it("should allow admin to change dynamic limits", async function () {
      await contract.connect(admin).setDynamicLimits(5, toUSDC(100), 30);
      expect(await contract.baseAnswerLimit()).to.equal(5);
      expect(await contract.volumePerSlot()).to.equal(toUSDC(100));
      expect(await contract.maxAnswerLimit()).to.equal(30);
    });

    it("should allow admin to change exponential params", async function () {
      await contract.connect(admin).setExponentialParams(toUSDC(100), 15);
      expect(await contract.bootstrapThreshold()).to.equal(toUSDC(100));
      expect(await contract.maxMultiplier()).to.equal(15);
    });

    it("should allow admin to change king flip threshold", async function () {
      await contract.connect(admin).setKingFlipThreshold(1000);
      expect(await contract.kingFlipThresholdBps()).to.equal(1000);
    });

    it("should allow admin to change graduation threshold", async function () {
      await contract.connect(admin).setGraduationThreshold(toUSDC(1000));
      expect(await contract.graduationThreshold()).to.equal(toUSDC(1000));
    });

    it("should reject king flip threshold > 20%", async function () {
      await expect(
        contract.connect(admin).setKingFlipThreshold(2001)
      ).to.be.revertedWithCustomError(contract, "InvalidFlipThreshold");
    });

    it("should reject non-admin from changing params", async function () {
      await expect(
        contract.connect(user1).setQuestionCreationFee(toUSDC(10))
      ).to.be.reverted;
    });
  });

  describe("Question Ownership Transfer", function () {
    it("should allow owner to transfer question", async function () {
      await createQuestionWithAnswer();
      const questionId = 1n;

      await contract.connect(user1).transferQuestionOwnership(questionId, user2.address);

      const question = await contract.getQuestion(questionId);
      expect(question.owner).to.equal(user2.address);
    });

    it("should transfer creator fee rights to new owner", async function () {
      await createQuestionWithAnswer();
      const questionId = 1n;
      const answerId = 1n;

      await contract.connect(user1).transferQuestionOwnership(questionId, user2.address);

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await contract.connect(user3).buyShares(answerId, toUSDC(100), 0, deadline);

      const user2Fees = await contract.getAccumulatedFees(user2.address);
      expect(user2Fees).to.be.gt(0);
    });
  });

  describe("Edge Cases", function () {
    it("should handle slippage protection", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const buyAmount = toUSDC(10);

      await expect(
        contract.connect(user2).buyShares(answerId, buyAmount, BigInt(1e18), deadline)
      ).to.be.revertedWithCustomError(contract, "SlippageExceeded");
    });

    it("should handle deadline protection", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const expiredDeadline = Math.floor(Date.now() / 1000) - 3600;

      await expect(
        contract.connect(user2).buyShares(answerId, toUSDC(10), 0, expiredDeadline)
      ).to.be.revertedWithCustomError(contract, "DeadlineExpired");
    });

    it("should prevent duplicate answers", async function () {
      await createQuestionWithAnswer("Test?", "General", "Answer1");
      const questionId = 1n;

      await expect(
        contract.connect(user2).proposeAnswer(questionId, "Answer1", "", "")
      ).to.be.revertedWithCustomError(contract, "DuplicateAnswer");
    });

    it("should prevent selling more shares than owned", async function () {
      await createQuestionWithAnswer();
      const answerId = 1n;

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await expect(
        contract.connect(user2).sellShares(answerId, 1000n, 0, deadline)
      ).to.be.revertedWithCustomError(contract, "InsufficientShares");
    });
  });

  describe("Pause/Unpause", function () {
    it("should allow admin to pause", async function () {
      await contract.connect(admin).pause();
      expect(await contract.paused()).to.be.true;
    });

    it("should block operations when paused", async function () {
      await contract.connect(admin).pause();

      await expect(
        contract.connect(user1).createQuestion("Test?", "General")
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });

    it("should allow admin to unpause", async function () {
      await contract.connect(admin).pause();
      await contract.connect(admin).unpause();

      await expect(
        contract.connect(user1).createQuestion("Test?", "General")
      ).to.not.be.reverted;
    });
  });
});
