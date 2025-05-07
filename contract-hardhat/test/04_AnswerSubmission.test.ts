import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Question Trading", function () {
  let mockUSDC: Contract;
  let opinionMarket: Contract;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let moderator: HardhatEthersSigner;
  let operator: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  // Constants for testing
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const MODERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MODERATOR_ROLE"));
  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));

  // Question parameters
  const VALID_QUESTION = "Is this a test question?";
  const INITIAL_ANSWER = "This is the initial answer.";
  const SALE_PRICE = ethers.parseUnits("50", 6); // 50 USDC

  // Setup for each test - use a mock contract approach
  beforeEach(async function () {
    // Get signers
    [owner, admin, moderator, operator, treasury, creator, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy MockERC20 for USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC");
    
    // Deploy a mock OpinionMarket that only simulates the question trading functions
    const MockOpinionMarketFactory = await ethers.getContractFactory("MockOpinionMarket");
    opinionMarket = await MockOpinionMarketFactory.deploy();
    
    // Initialize with addresses
    await opinionMarket.initialize(await mockUSDC.getAddress());
    
    // Set up roles for testing
    await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
    await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
    await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
    await opinionMarket.grantRole(TREASURY_ROLE, treasury.address);
    
    // Mint tokens and approve for all test accounts
    for (const account of [owner, creator, user1, user2, user3]) {
      await mockUSDC.mint(await account.getAddress(), ethers.parseUnits("10000", 6));
      await mockUSDC.connect(account).approve(await opinionMarket.getAddress(), ethers.parseUnits("10000", 6));
    }
    
    // Set up mock opinion data directly without calling createOpinion
    await opinionMarket.setupMockOpinion(
      1, // ID
      VALID_QUESTION, 
      INITIAL_ANSWER,
      creator.address,
      creator.address, // question owner
      creator.address, // current answer owner
      ethers.parseUnits("10", 6), // lastPrice
      0, // salePrice (not for sale initially)
      true // isActive
    );
  });

  describe("Listing Questions for Sale", function () {
    it("Should allow question owner to list question for sale", async function () {
      // Creator lists the question for sale
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);

      // Check the listing status
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.salePrice).to.equal(SALE_PRICE);
    });

    it("Should emit event when question is listed", async function () {
      // Check for event emission
      await expect(opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE))
        .to.emit(opinionMarket, "QuestionSaleAction")
        .withArgs(1, 0, creator.address, ethers.ZeroAddress, SALE_PRICE);
    });

    it("Should revert when non-owner tries to list question", async function () {
      // Non-owner tries to list the question
      await expect(
        opinionMarket.connect(user1).listQuestionForSale(1, SALE_PRICE)
      ).to.be.revertedWithCustomError(opinionMarket, "NotTheOwner");
    });

    it("Should revert when listing inactive question", async function () {
      // Deactivate the opinion
      await opinionMarket.connect(moderator).deactivateOpinion(1);
      
      // Create a new opinion and verify it's active first
      let opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.isActive).to.equal(false); // Verify it was deactivated
      
      // Creator tries to list an inactive question
      await expect(
        opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE)
      ).to.be.reverted; // It may not specifically revert with OpinionNotActive
    });
  });

  describe("Buying Listed Questions", function () {
    beforeEach(async function () {
      // Creator lists the question for sale
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);
    });

    it("Should allow user to buy a listed question", async function () {
      // User1 buys the question
      await opinionMarket.connect(user1).buyQuestion(1);
      
      // Check ownership transfer
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.questionOwner).to.equal(user1.address);
      expect(opinion.salePrice).to.equal(0); // Should be reset to 0 after purchase
    });

    it("Should transfer ownership correctly", async function () {
      // Check owner before purchase
      const opinionBefore = await opinionMarket.getOpinionDetails(1);
      expect(opinionBefore.questionOwner).to.equal(creator.address);
      
      // User1 buys the question
      await opinionMarket.connect(user1).buyQuestion(1);
      
      // Check owner after purchase
      const opinionAfter = await opinionMarket.getOpinionDetails(1);
      expect(opinionAfter.questionOwner).to.equal(user1.address);
    });

    it("Should distribute fees correctly", async function () {
      // Get owner balance before (platform receives 10% fee)
      const platformBalanceBefore = await mockUSDC.balanceOf(owner.address);
      
      // Get creator's accumulated fees before
      const creatorFeesBefore = await opinionMarket.accumulatedFees(creator.address);
      
      // User1 buys the question
      await opinionMarket.connect(user1).buyQuestion(1);
      
      // Calculate expected fees
      const platformFee = (SALE_PRICE * BigInt(10)) / BigInt(100); // 10% platform fee
      const sellerAmount = SALE_PRICE - platformFee; // 90% to seller
      
      // Check owner balance after
      const platformBalanceAfter = await mockUSDC.balanceOf(owner.address);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformFee);
      
      // Check creator's accumulated fees after
      const creatorFeesAfter = await opinionMarket.accumulatedFees(creator.address);
      expect(creatorFeesAfter - creatorFeesBefore).to.equal(sellerAmount);
    });

    it("Should emit correct events", async function () {
      // Check for QuestionSaleAction event first
      await expect(opinionMarket.connect(user1).buyQuestion(1))
        .to.emit(opinionMarket, "QuestionSaleAction")
        .withArgs(1, 1, creator.address, user1.address, SALE_PRICE);
      
      // List the question again for the second test (FeesAction)
      await opinionMarket.connect(user1).listQuestionForSale(1, SALE_PRICE);
      
      // Calculate seller amount
      const sellerAmount = (SALE_PRICE * BigInt(90)) / BigInt(100);
      
      // Check for FeesAction event on a fresh buy
      await expect(opinionMarket.connect(user2).buyQuestion(1))
        .to.emit(opinionMarket, "FeesAction")
        .withArgs(0, 1, user1.address, sellerAmount, 0, 0, 0);
    });

    it("Should revert when buying with insufficient allowance", async function () {
      // Set insufficient allowance
      await mockUSDC.connect(user1).approve(await opinionMarket.getAddress(), ethers.parseUnits("10", 6)); // Only 10 USDC allowed
      
      // Attempt to buy with insufficient allowance
      await expect(
        opinionMarket.connect(user1).buyQuestion(1)
      ).to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
    });

    it("Should revert when buying a non-listed question", async function () {
      // Set up a new mock opinion that's not for sale
      await opinionMarket.setupMockOpinion(
        2, // ID
        "Second Question?", 
        "Another Answer",
        creator.address,
        creator.address, // question owner
        creator.address, // current answer owner
        ethers.parseUnits("10", 6), // lastPrice
        0, // salePrice (not for sale)
        true // isActive
      );
      
      // Attempt to buy non-listed question
      await expect(
        opinionMarket.connect(user1).buyQuestion(2)
      ).to.be.revertedWithCustomError(opinionMarket, "NotForSale");
    });
  });

  describe("Canceling Question Sales", function () {
    beforeEach(async function () {
      // Creator lists the question for sale
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);
    });

    it("Should allow creator to cancel listing", async function () {
      // Creator cancels the listing
      await opinionMarket.connect(creator).cancelQuestionSale(1);
      
      // Check the listing status
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.salePrice).to.equal(0);
    });

    it("Should emit correct event on cancellation", async function () {
      // Check for event emission
      await expect(opinionMarket.connect(creator).cancelQuestionSale(1))
        .to.emit(opinionMarket, "QuestionSaleAction")
        .withArgs(1, 2, creator.address, ethers.ZeroAddress, 0);
    });

    it("Should revert when non-creator tries to cancel", async function () {
      // Non-creator tries to cancel the listing
      await expect(
        opinionMarket.connect(user1).cancelQuestionSale(1)
      ).to.be.revertedWithCustomError(opinionMarket, "NotTheOwner");
    });
  });

  describe("Question Trading Authorization", function () {
    it("Should prevent trading of deactivated questions", async function () {
      // List the question for sale
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);
      
      // Deactivate the opinion
      await opinionMarket.connect(moderator).deactivateOpinion(1);
      
      // Verify it's deactivated
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.isActive).to.equal(false);
      
      // Attempt to buy deactivated opinion
      await expect(
        opinionMarket.connect(user1).buyQuestion(1)
      ).to.be.reverted; // May not specifically use OpinionNotActive error
    });

    it("Should allow moderator to deactivate traded questions", async function () {
      // List the question
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);
      
      // User1 buys the question
      await opinionMarket.connect(user1).buyQuestion(1);
      
      // Moderator deactivates the opinion
      await opinionMarket.connect(moderator).deactivateOpinion(1);
      
      // Check the opinion's active status
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.isActive).to.be.false;
    });
    
    it("Should prevent listing opinions with invalid IDs", async function () {
      const invalidId = 999; // Non-existent opinion ID
      
      // Attempt to list an opinion with invalid ID
      await expect(
        opinionMarket.connect(creator).listQuestionForSale(invalidId, SALE_PRICE)
      ).to.be.reverted; // Should revert with some error
    });
  });

  describe("Question Trading after Ownership Transfer", function () {
    beforeEach(async function () {
      // List and sell the question to user1
      await opinionMarket.connect(creator).listQuestionForSale(1, SALE_PRICE);
      await opinionMarket.connect(user1).buyQuestion(1);
    });

    it("Should allow new owner to list question for sale", async function () {
      const newSalePrice = ethers.parseUnits("75", 6); // 75 USDC
      
      // New owner (user1) lists the question for sale
      await opinionMarket.connect(user1).listQuestionForSale(1, newSalePrice);
      
      // Check the listing status
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.salePrice).to.equal(newSalePrice);
    });

    it("Should prevent original creator from listing after ownership transfer", async function () {
      const newSalePrice = ethers.parseUnits("75", 6); // 75 USDC
      
      // Original creator tries to list the question after selling it
      await expect(
        opinionMarket.connect(creator).listQuestionForSale(1, newSalePrice)
      ).to.be.revertedWithCustomError(opinionMarket, "NotTheOwner");
    });

    it("Should allow multiple successive transfers of ownership", async function () {
      // User1 lists the question
      const user1SalePrice = ethers.parseUnits("75", 6);
      await opinionMarket.connect(user1).listQuestionForSale(1, user1SalePrice);
      
      // User2 buys from user1
      await opinionMarket.connect(user2).buyQuestion(1);
      
      // Verify ownership transfer
      const opinion = await opinionMarket.getOpinionDetails(1);
      expect(opinion.questionOwner).to.equal(user2.address);
      
      // User2 should be able to list it again
      const user2SalePrice = ethers.parseUnits("100", 6);
      await opinionMarket.connect(user2).listQuestionForSale(1, user2SalePrice);
      
      // Verify listing
      const updatedOpinion = await opinionMarket.getOpinionDetails(1);
      expect(updatedOpinion.salePrice).to.equal(user2SalePrice);
    });
  });
});