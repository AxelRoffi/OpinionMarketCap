import { expect } from "chai";
import { ethers } from "hardhat";
import { OpinionMarket, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket", () => {
   let opinionMarket: OpinionMarket;
   let weth: MockERC20;
   let usdc: MockERC20;
   let owner: HardhatEthersSigner;
   let user1: HardhatEthersSigner;
   let user2: HardhatEthersSigner;

   const INITIAL_PRICE = 1_000_000n;
   const FINAL_ANSWER_PRICE = 100_000_000n * 1_000_000n;
   const EXPIRY_DURATION = 30n * 24n * 60n * 60n;

   beforeEach(async () => {
       [owner, user1, user2] = await ethers.getSigners();
       
       const MockERC20 = await ethers.getContractFactory("MockERC20");
       weth = await MockERC20.deploy("WETH", "WETH");
       usdc = await MockERC20.deploy("USDC", "USDC");

       const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
       opinionMarket = await OpinionMarket.deploy();

       await opinionMarket.configureTokens(await weth.getAddress(), await usdc.getAddress());
       await usdc.mint(user1.address, FINAL_ANSWER_PRICE);
       await usdc.connect(user1).approve(await opinionMarket.getAddress(), FINAL_ANSWER_PRICE);
   });

   describe("Basic Functionality", () => {
       it("Should initialize correctly", async () => {
           expect(await opinionMarket.owner()).to.equal(owner.address);
           expect(await opinionMarket.wethToken()).to.equal(await weth.getAddress());
           expect(await opinionMarket.usdcToken()).to.equal(await usdc.getAddress());
       });

       it("Should allow owner to create opinion", async () => {
           await opinionMarket.createOpinion("Test Question?", INITIAL_PRICE);
           const opinion = await opinionMarket.opinions(1);
           expect(opinion.question).to.equal("Test Question?");
           expect(opinion.currentPrice).to.equal(INITIAL_PRICE);
       });

       it("Should prevent non-owner from creating opinion", async () => {
           await expect(
               opinionMarket.connect(user1).createOpinion("Test?", INITIAL_PRICE)
           ).to.be.revertedWithCustomError(opinionMarket, "OwnableUnauthorizedAccount");
       });
   });

   describe("Trading & Pricing", () => {
       beforeEach(async () => {
           await opinionMarket.createOpinion("Test Question?", INITIAL_PRICE);
       });

       it("Should allow answer purchase", async () => {
           await opinionMarket.connect(user1).buyAnswer(1, "Answer", await usdc.getAddress());
           const opinion = await opinionMarket.opinions(1);
           expect(opinion.currentAnswer).to.equal("Answer");
           expect(opinion.owner).to.equal(user1.address);
       });

       it("Should enforce price ranges", async () => {
           const trades = 20;
           let hasSmallLoss = false;
           let hasHighGain = false;
           let hasNormalGain = false;

           for(let i = 0; i < trades; i++) {
               const beforePrice = (await opinionMarket.opinions(1)).currentPrice;
               await opinionMarket.connect(user1).buyAnswer(1, `Answer ${i}`, await usdc.getAddress());
               const afterPrice = (await opinionMarket.opinions(1)).currentPrice;
               
               const change = Number((afterPrice - beforePrice) * 100n / beforePrice);
               
               if (change >= -10 && change <= -5) hasSmallLoss = true;
               if (change >= 31 && change <= 45) hasHighGain = true;
               if (change >= 0 && change <= 30) hasNormalGain = true;
           }

           expect(hasSmallLoss).to.be.true; // 10% chance of -10% to -5%
           expect(hasHighGain).to.be.true;  // 20% chance of 31% to 45%
           expect(hasNormalGain).to.be.true; // 70% chance of 0% to 30%
       });

       it("Should maintain target average return", async () => {
           let totalReturn = 0;
           const trades = 10;
           
           for(let i = 0; i < trades; i++) {
               const beforePrice = (await opinionMarket.opinions(1)).currentPrice;
               await opinionMarket.connect(user1).buyAnswer(1, `Answer ${i}`, await usdc.getAddress());
               const afterPrice = (await opinionMarket.opinions(1)).currentPrice;
               totalReturn += Number((afterPrice - beforePrice) * 100n / beforePrice);
           }

           expect(totalReturn / trades).to.be.approximately(13.5, 5);
       });
   });

   describe("Expiry Mechanism", () => {
       beforeEach(async () => {
           await opinionMarket.createOpinion("Test Question?", INITIAL_PRICE);
       });

       it("Should enforce 30-day expiry", async () => {
           await opinionMarket.connect(user1).buyAnswer(1, "First Answer", await usdc.getAddress());
           
           await ethers.provider.send("evm_increaseTime", [Number(EXPIRY_DURATION) + 1]);
           await ethers.provider.send("evm_mine", []);

           await expect(
               opinionMarket.connect(user1).buyAnswer(1, "New Answer", await usdc.getAddress())
           ).to.be.revertedWithCustomError(opinionMarket, "OpinionExpiredError");

           const opinion = await opinionMarket.opinions(1);
           expect(opinion.isEngraved).to.be.true;
       });

       it("Should allow final answer purchase", async () => {
           await opinionMarket.connect(user1).buyAnswer(1, "Final Answer", await usdc.getAddress());
           const opinion = await opinionMarket.opinions(1);
           
           expect(opinion.currentAnswer).to.equal("Final Answer");
           expect(opinion.isEngraved).to.be.true;
       });
   });

   describe("Platform Features", () => {
       beforeEach(async () => {
           await opinionMarket.createOpinion("Test Question?", INITIAL_PRICE);
       });

       it("Should handle platform fees", async () => {
           await opinionMarket.connect(user1).buyAnswer(1, "Answer", await usdc.getAddress());
           
           const opinion = await opinionMarket.opinions(1);
           const platformFee = await usdc.balanceOf(await opinionMarket.getAddress());
           expect(platformFee).to.equal((opinion.currentPrice * 5n) / 100n);
       });

       it("Should allow fee withdrawal", async () => {
           await opinionMarket.connect(user1).buyAnswer(1, "Answer", await usdc.getAddress());
           
           const beforeBalance = await usdc.balanceOf(owner.address);
           await opinionMarket.withdrawPlatformFees(await usdc.getAddress(), owner.address);
           expect(await usdc.balanceOf(owner.address)).to.be.gt(beforeBalance);
       });

       it("Should handle pause/unpause", async () => {
           await opinionMarket.pause();
           await expect(
               opinionMarket.createOpinion("Test?", INITIAL_PRICE)
           ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");

           await opinionMarket.unpause();
           await expect(
               opinionMarket.createOpinion("Test?", INITIAL_PRICE)
           ).not.to.be.reverted;
       });
   });
});