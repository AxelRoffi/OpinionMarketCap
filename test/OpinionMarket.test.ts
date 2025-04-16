import { expect } from "chai";
import hre from "hardhat";  // Add this
import { ethers, upgrades } from "hardhat";
import { OpinionMarket, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("OpinionMarket", () => {
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    const INITIAL_PRICE = 1_000_000n; // 1 USDC
    const FINAL_ANSWER_PRICE = 100_000_000_000_000n; // 100M USDC
    const PLATFORM_FEE_PERCENT = 2n;
    const CREATOR_FEE_PERCENT = 3n;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdc = await MockERC20.deploy("USDC", "USDC");

        // Deploy OpinionMarket through proxy
        const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
        opinionMarket = await upgrades.deployProxy(
            OpinionMarket,
            [await usdc.getAddress()],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        ) as unknown as OpinionMarket;

        // Mint and approve USDC for all users including owner
        await usdc.mint(owner.address, ethers.parseUnits("1000000", 6));
        await usdc.connect(owner).approve(await opinionMarket.getAddress(), ethers.MaxUint256);

        await usdc.mint(user1.address, ethers.parseUnits("1000000", 6));
        await usdc.connect(user1).approve(await opinionMarket.getAddress(), ethers.MaxUint256);

        await usdc.mint(user2.address, ethers.parseUnits("1000000", 6));
        await usdc.connect(user2).approve(await opinionMarket.getAddress(), ethers.MaxUint256);
    });

    describe("Basic Creation", () => {
        it("should create opinion with correct initial state", async () => {
            const tx = await opinionMarket.createOpinion(
                "Test Question?",
                "Initial Answer",
                INITIAL_PRICE
            );
            await tx.wait();

            const opinion = await opinionMarket.opinions(1);
            expect(opinion.id).to.equal(1);
            expect(opinion.question).to.equal("Test Question?");
            expect(opinion.creator).to.equal(owner.address);
            expect(opinion.currentPrice).to.equal(INITIAL_PRICE);
            expect(opinion.isActive).to.be.true;
            expect(opinion.currentAnswer).to.equal("Initial Answer");
            expect(opinion.currentAnswerOwner).to.equal(owner.address);
            expect(opinion.totalVolume).to.equal(INITIAL_PRICE);
            expect(opinion.isFinal).to.be.false;
        });

        it("should increment opinion ID correctly", async () => {
            await opinionMarket.createOpinion("First?", "Answer1", INITIAL_PRICE);
            await opinionMarket.createOpinion("Second?", "Answer2", INITIAL_PRICE);

            const opinion1 = await opinionMarket.opinions(1);
            const opinion2 = await opinionMarket.opinions(2);
            expect(opinion1.id).to.equal(1);
            expect(opinion2.id).to.equal(2);
        });

        it("should emit correct events", async () => {
            await expect(opinionMarket.createOpinion("Test?", "Answer", INITIAL_PRICE))
                .to.emit(opinionMarket, "OpinionCreated")
                .withArgs(1, "Test?", INITIAL_PRICE, owner.address)
                .and.to.emit(opinionMarket, "AnswerSubmitted")
                .withArgs(1, "Answer", owner.address, INITIAL_PRICE);
        });
    });

    describe("Admin Controls", () => {
        beforeEach(async () => {
            await usdc.mint(owner.address, INITIAL_PRICE);
            await usdc.connect(owner).approve(await opinionMarket.getAddress(), INITIAL_PRICE);
            await usdc.mint(user1.address, INITIAL_PRICE);
            await usdc.connect(user1).approve(await opinionMarket.getAddress(), INITIAL_PRICE);
        });

        it("Should allow admin to create questions", async () => {
            const tx = await opinionMarket.createOpinion("Test Question?", "Initial Answer", INITIAL_PRICE);
            await tx.wait();

            const opinion = await opinionMarket.opinions(1);
            expect(opinion.creator).to.equal(owner.address);
            expect(opinion.isActive).to.be.true;
        });

        it("Should not allow non-admin creation when disabled", async () => {
            await expect(
                opinionMarket.connect(user1).createOpinion("Test?", "Initial Answer", INITIAL_PRICE)
            ).to.be.revertedWithCustomError(opinionMarket, "UnauthorizedCreator");
        });

        it("Should allow public creation when enabled", async () => {
            await opinionMarket.togglePublicCreation();
            const tx = await opinionMarket.connect(user1).createOpinion("Test?", "Initial Answer", INITIAL_PRICE);
            await tx.wait();

            const opinion = await opinionMarket.opinions(1);
            expect(opinion.creator).to.equal(user1.address);
            expect(opinion.isActive).to.be.true;
        });
    });

    describe("Emergency Functions", function () {
        describe("emergencyWithdraw", function () {
            beforeEach(async () => {
                await usdc.mint(opinionMarket.getAddress(), ethers.parseUnits("1000", 6));
            });

            it("Should revert if contract is not paused", async function () {
                await expect(
                    opinionMarket.emergencyWithdraw(usdc.getAddress())
                ).to.be.revertedWithCustomError(opinionMarket, "ExpectedPause");
            });

            it("Should emit EmergencyWithdraw event", async function () {
                const contractBalance = await usdc.balanceOf(opinionMarket.getAddress());
                await opinionMarket.pause();
                await expect(opinionMarket.emergencyWithdraw(usdc.getAddress()))
                    .to.emit(opinionMarket, "EmergencyWithdraw")
                    .withArgs(usdc.getAddress(), contractBalance, anyValue);
            });

            it("Should prevent operations while paused", async function () {
                await opinionMarket.pause();
                await expect(
                    opinionMarket.createOpinion("Test?", "Initial Answer", ethers.parseUnits("100", 6))
                ).to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
            });

            it("Should allow owner to pause and unpause", async function () {
                await opinionMarket.pause();
                expect(await opinionMarket.paused()).to.be.true;

                await opinionMarket.unpause();
                expect(await opinionMarket.paused()).to.be.false;
            });
        });
    });

    describe("Question Validation", () => {
        it("Should reject empty questions", async () => {
            await expect(
                opinionMarket.createOpinion("", "Initial Answer", INITIAL_PRICE)
            ).to.be.revertedWithCustomError(opinionMarket, "EmptyString");
        });

        it("Should reject questions that are too long", async () => {
            const longQuestion = "a".repeat(281);
            await expect(
                opinionMarket.createOpinion(longQuestion, "Initial Answer", INITIAL_PRICE)
            ).to.be.revertedWithCustomError(opinionMarket, "InvalidQuestionLength");
        });

        it("Should reject prices below minimum", async () => {
            await expect(
                opinionMarket.createOpinion("Test?", "Initial Answer", INITIAL_PRICE - 1n)
            ).to.be.revertedWithCustomError(opinionMarket, "InvalidPrice");
        });
    });

    describe("Answer Management", () => {
        beforeEach(async () => {
            await opinionMarket.createOpinion("Test Question?", "Initial Answer", INITIAL_PRICE);
        });

        it("Should allow submitting an answer", async () => {
            await opinionMarket.connect(user1).submitAnswer(1, "Test Answer");
            const opinion = await opinionMarket.opinions(1);
            expect(opinion.currentAnswer).to.equal("Test Answer");
            expect(opinion.currentAnswerOwner).to.equal(user1.address);
        });

        it("Should reject empty answers", async () => {
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "")
            ).to.be.revertedWithCustomError(opinionMarket, "EmptyString");
        });

        it("Should reject answers that are too long", async () => {
            const longAnswer = "a".repeat(41);
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, longAnswer)
            ).to.be.revertedWithCustomError(opinionMarket, "InvalidAnswerLength");
        });

        it("Should track answer history", async () => {
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            await opinionMarket.connect(user2).submitAnswer(1, "Answer 2");

            const history = await opinionMarket.getAnswerHistory(1);
            expect(history.length).to.equal(3); // Including initial answer
            expect(history[1].answer).to.equal("Answer 1");
            expect(history[2].answer).to.equal("Answer 2");
        });

        it("Should update total volume", async () => {
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            const opinion = await opinionMarket.opinions(1);
            expect(opinion.totalVolume).to.be.gt(INITIAL_PRICE);
        });

        it("Should prevent submitting answers to inactive opinions", async () => {
            await opinionMarket.deactivateOpinion(1);
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "Test Answer")
            ).to.be.revertedWithCustomError(opinionMarket, "OpinionNotActive");
        });
    });

    describe("Fee Distribution", () => {
        beforeEach(async () => {
            await opinionMarket.togglePublicCreation();
        });

        it("should distribute initial fees correctly", async () => {
            const initialOwnerBalance = await usdc.balanceOf(owner.address);
            const initialCreatorBalance = await usdc.balanceOf(user1.address);

            await opinionMarket.connect(user1).createOpinion(
                "Test?",
                "Answer",
                INITIAL_PRICE
            );

            const platformFee = (INITIAL_PRICE * BigInt(PLATFORM_FEE_PERCENT)) / 100n;
            const creatorFee = (INITIAL_PRICE * BigInt(CREATOR_FEE_PERCENT)) / 100n;

            expect(await usdc.balanceOf(owner.address))
                .to.equal(initialOwnerBalance + platformFee);
            expect(await usdc.balanceOf(user1.address))
                .to.equal(initialCreatorBalance - INITIAL_PRICE + creatorFee);
        });

        it("should track total accumulated fees correctly", async () => {
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);
            const initialTotal = await opinionMarket.totalAccumulatedFees();

            await opinionMarket.connect(user2).submitAnswer(1, "New Answer");
            const newTotal = await opinionMarket.totalAccumulatedFees();

            expect(newTotal).to.be.gt(initialTotal);
        });

        it("should allow users to claim accumulated fees", async () => {
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);
            await opinionMarket.connect(user2).submitAnswer(1, "New Answer");

            const initialBalance = await usdc.balanceOf(user1.address);
            const accumulatedAmount = await opinionMarket.accumulatedFees(user1.address);

            await opinionMarket.connect(user1).claimAccumulatedFees();

            expect(await usdc.balanceOf(user1.address)).to.equal(initialBalance + accumulatedAmount);
            expect(await opinionMarket.accumulatedFees(user1.address)).to.equal(0);
        });
    });

    describe("Final Answers", () => {
        beforeEach(async () => {
            await opinionMarket.createOpinion("Test Question?", "Initial Answer", INITIAL_PRICE);
            await usdc.mint(user1.address, FINAL_ANSWER_PRICE);
            await usdc.connect(user1).approve(await opinionMarket.getAddress(), FINAL_ANSWER_PRICE);
        });

        it("Should allow submitting a final answer", async () => {
            await opinionMarket.connect(user1).submitFinalAnswer(1, "Final Answer");
            const opinion = await opinionMarket.opinions(1);
            expect(opinion.isFinal).to.be.true;
            expect(opinion.currentAnswer).to.equal("Final Answer");
            expect(opinion.currentAnswerOwner).to.equal(user1.address);
        });

        it("Should prevent further answers after final answer", async () => {
            await opinionMarket.connect(user1).submitFinalAnswer(1, "Final Answer");
            await expect(
                opinionMarket.connect(user2).submitAnswer(1, "New Answer")
            ).to.be.revertedWithCustomError(opinionMarket, "OpinionIsFinal");
        });

        it("Should prevent multiple final answers", async () => {
            await opinionMarket.connect(user1).submitFinalAnswer(1, "Final Answer");
            await expect(
                opinionMarket.connect(user2).submitFinalAnswer(1, "Another Final")
            ).to.be.revertedWithCustomError(opinionMarket, "OpinionIsFinal");
        });

        it("Should track final answer in history", async () => {
            await opinionMarket.connect(user1).submitFinalAnswer(1, "Final Answer");
            const history = await opinionMarket.getAnswerHistory(1);
            expect(history[history.length - 1].answer).to.equal("Final Answer");
            expect(history[history.length - 1].price).to.equal(FINAL_ANSWER_PRICE);
        });
    });

    describe("Fee Distribution and Accumulation", () => {
        let user3: HardhatEthersSigner;

        beforeEach(async () => {
            // Get signers first
            [owner, user1, user2, user3] = await ethers.getSigners();

            // Deploy fresh contracts
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            usdc = await MockERC20.deploy("USDC", "USDC");

            const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
            opinionMarket = await upgrades.deployProxy(
                OpinionMarket,
                [await usdc.getAddress()],
                {
                    initializer: 'initialize',
                    kind: 'uups'
                }
            ) as unknown as OpinionMarket;

            // Enable public creation
            await opinionMarket.togglePublicCreation();

            // Mint USDC for all users
            const largeAmount = ethers.parseUnits("1000000000", 6);
            await Promise.all([
                usdc.mint(user1.address, largeAmount),
                usdc.mint(user2.address, largeAmount),
                usdc.mint(user3.address, largeAmount)
            ]);

            // Approve USDC spending
            await Promise.all([
                usdc.connect(user1).approve(await opinionMarket.getAddress(), ethers.MaxUint256),
                usdc.connect(user2).approve(await opinionMarket.getAddress(), ethers.MaxUint256),
                usdc.connect(user3).approve(await opinionMarket.getAddress(), ethers.MaxUint256)
            ]);
        });
        it("should track total accumulated fees correctly", async () => {
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);
            const initialTotal = await opinionMarket.totalAccumulatedFees();

            await opinionMarket.connect(user2).submitAnswer(1, "New Answer");
            const newTotal = await opinionMarket.totalAccumulatedFees();

            expect(newTotal).to.be.gt(initialTotal);
        });

        it("should allow users to claim accumulated fees", async () => {
            // Create opinion and submit answer to generate fees
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);
            await opinionMarket.connect(user2).submitAnswer(1, "New Answer");

            const initialBalance = await usdc.balanceOf(user1.address);
            const accumulatedAmount = await opinionMarket.accumulatedFees(user1.address);

            // Claim fees
            await opinionMarket.connect(user1).claimAccumulatedFees();

            // Check balances
            expect(await usdc.balanceOf(user1.address)).to.equal(initialBalance + accumulatedAmount);
            expect(await opinionMarket.accumulatedFees(user1.address)).to.equal(0);
        });

        it("should prevent claiming when no fees are accumulated", async () => {
            await expect(opinionMarket.connect(user2).claimAccumulatedFees())
                .to.be.revertedWith("No fees to claim");
        });

        it("should emit events when fees are accumulated and claimed", async () => {
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);

            // Check for FeesAccumulated event when submitting answer
            await expect(opinionMarket.connect(user2).submitAnswer(1, "New Answer"))
                .to.emit(opinionMarket, "FeesAccumulated")
                .withArgs(user1.address, anyValue);  // Creator fee

            // Get accumulated amount
            const accumulatedAmount = await opinionMarket.accumulatedFees(user1.address);

            // Check for FeesClaimed event
            await expect(opinionMarket.connect(user1).claimAccumulatedFees())
                .to.emit(opinionMarket, "FeesClaimed")
                .withArgs(user1.address, accumulatedAmount);
        });

        it("should handle multiple fee accumulations before claiming", async () => {
            // Create initial opinion
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);

            // Multiple answers to accumulate fees
            await opinionMarket.connect(user2).submitAnswer(1, "Answer 1");
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 2");
            await opinionMarket.connect(user2).submitAnswer(1, "Answer 3");

            const accumulatedAmount = await opinionMarket.accumulatedFees(user1.address);
            const initialBalance = await usdc.balanceOf(user1.address);

            // Claim accumulated fees
            await opinionMarket.connect(user1).claimAccumulatedFees();

            expect(await usdc.balanceOf(user1.address)).to.equal(initialBalance + accumulatedAmount);
            expect(await opinionMarket.accumulatedFees(user1.address)).to.equal(0);
        });

        it("should handle final answer fee accumulation", async () => {
            console.log("\n=== Final Answer Fee Accumulation Test ===");

            // 1. User1 creates question
            await opinionMarket.connect(user1).createOpinion("Test?", "Answer", INITIAL_PRICE);
            console.log("\nAfter creation:");
            console.log("- Creator:", user1.address);

            // 2. User2 submits regular answer
            await opinionMarket.connect(user2).submitAnswer(1, "Answer 2");

            // Store accumulated fees before final answer
            const creatorFeesBefore = await opinionMarket.accumulatedFees(user1.address);
            const ownerFeesBefore = await opinionMarket.accumulatedFees(user2.address);

            console.log("\nBefore final answer:");
            console.log("- Creator accumulated fees:", creatorFeesBefore.toString());
            console.log("- Owner accumulated fees:", ownerFeesBefore.toString());

            // 3. User3 submits final answer
            const tx = await opinionMarket.connect(user3).submitFinalAnswer(1, "Final Answer");
            const receipt = await tx.wait();

            // Get final accumulated fees
            const creatorFeesAfter = await opinionMarket.accumulatedFees(user1.address);
            const ownerFeesAfter = await opinionMarket.accumulatedFees(user2.address);

            // Calculate the incremental fees from final answer only
            const creatorFeesFromFinal = creatorFeesAfter - creatorFeesBefore;
            const ownerFeesFromFinal = ownerFeesAfter - ownerFeesBefore;

            console.log("\nFinal Answer Fees Only:");
            console.log("- Creator fees from final:", creatorFeesFromFinal.toString());
            console.log("- Owner fees from final:", ownerFeesFromFinal.toString());

            // Expected fees from final answer
            const expectedCreatorFee = (FINAL_ANSWER_PRICE * BigInt(CREATOR_FEE_PERCENT)) / 100n;
            const expectedOwnerAmount = FINAL_ANSWER_PRICE -
                (FINAL_ANSWER_PRICE * BigInt(PLATFORM_FEE_PERCENT)) / 100n -
                (FINAL_ANSWER_PRICE * BigInt(CREATOR_FEE_PERCENT)) / 100n;

            // Verify only the incremental fees from final answer
            expect(creatorFeesFromFinal).to.equal(expectedCreatorFee, "Creator fee from final answer mismatch");
            expect(ownerFeesFromFinal).to.equal(expectedOwnerAmount, "Owner amount from final answer mismatch");
        });
    });
    describe("Rate Limiting", () => {
        beforeEach(async () => {
            await opinionMarket.createOpinion("Question 1?", "Initial 1", INITIAL_PRICE);
            await opinionMarket.createOpinion("Question 2?", "Initial 2", INITIAL_PRICE);
        });

        it("should allow multiple trades in same block for different opinions", async () => {
            await network.provider.send("evm_setAutomine", [false]);
            
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            await opinionMarket.connect(user1).submitAnswer(2, "Answer 2");
            
            await network.provider.send("evm_mine");
            await network.provider.send("evm_setAutomine", [true]);

            const trades = await opinionMarket.getTradesInBlock(user1.address);
            expect(trades).to.equal(2);
        });

        it("should prevent trading same opinion twice in same block", async () => {
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "Answer 2")
            ).to.be.revertedWithCustomError(opinionMarket, "OneTradePerBlock");
        });

        it("should reset counter in new block", async () => {
            // First trade
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            expect(await opinionMarket.getTradesInBlock(user1.address)).to.equal(1);

            // Mine new block
            await network.provider.send("evm_mine");

            // Trade in new block should start from 0
            await opinionMarket.connect(user1).submitAnswer(2, "Answer 1");
            expect(await opinionMarket.getTradesInBlock(user1.address)).to.equal(1);
        });

        it("should enforce MAX_TRADES_PER_BLOCK limit", async () => {
            // Submit MAX_TRADES_PER_BLOCK trades
            for (let i = 1; i <= 3; i++) { // Using hardcoded 3 since that's our constant
                await opinionMarket.connect(user1).submitAnswer(i % 2 + 1, `Answer ${i}`);
            }

            // Next trade should fail
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "One too many")
            ).to.be.revertedWithCustomError(opinionMarket, "MaxBlockTradesExceeded");
        });
    });

    describe("Access Control", () => {
        let admin: HardhatEthersSigner;
        let moderator: HardhatEthersSigner;
        let operator: HardhatEthersSigner;

        beforeEach(async () => {
            const signers = await ethers.getSigners();
            admin = signers[3];
            moderator = signers[4];
            operator = signers[5];
        });

        describe("Role Management", () => {
            it("Should assign all roles to owner during initialization", async () => {
                const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                const MODERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MODERATOR_ROLE"));
                const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
                const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));

                expect(await opinionMarket.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
                expect(await opinionMarket.hasRole(MODERATOR_ROLE, owner.address)).to.be.true;
                expect(await opinionMarket.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
                expect(await opinionMarket.hasRole(TREASURY_ROLE, owner.address)).to.be.true;
            });

            it("Should allow owner to grant and revoke roles", async () => {
                const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                await opinionMarket.grantRole(ADMIN_ROLE, admin.address);
                expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.true;

                await opinionMarket.revokeRole(ADMIN_ROLE, admin.address);
                expect(await opinionMarket.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
            });
        });

        describe("Function Access", () => {
            beforeEach(async () => {
                const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
                const MODERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MODERATOR_ROLE"));
                await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);
                await opinionMarket.grantRole(MODERATOR_ROLE, moderator.address);
            });

            it("Should allow operator to pause/unpause", async () => {
                await expect(opinionMarket.connect(operator).pause())
                    .to.not.be.reverted;
                expect(await opinionMarket.paused()).to.be.true;

                await expect(opinionMarket.connect(operator).unpause())
                    .to.not.be.reverted;
                expect(await opinionMarket.paused()).to.be.false;
            });

            it("Should prevent unauthorized access", async () => {
                const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
                await expect(opinionMarket.connect(user1).pause())
                    .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
                    .withArgs(user1.address, OPERATOR_ROLE);
            });
        });
    });

    describe("Enhanced Rate Limiting", () => {
        let initialBlockNumber: number;
    
        beforeEach(async () => {
            // Create and activate opinions
            await opinionMarket.createOpinion("Question 1?", "Initial 1", INITIAL_PRICE);
            await opinionMarket.createOpinion("Question 2?", "Initial 2", INITIAL_PRICE);
            
            // Store initial block number
            initialBlockNumber = await ethers.provider.getBlockNumber();
        });
    
        it("should track trades per block correctly", async () => {
            // Submit first answer
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            let count = await opinionMarket.userBlockTradeCount(user1.address);
            expect(count).to.equal(1);
    
            // Submit second answer in same block
            await network.provider.send("evm_setAutomine", [false]);
            await opinionMarket.connect(user1).submitAnswer(2, "Answer 2");
            await network.provider.send("evm_mine");
            await network.provider.send("evm_setAutomine", [true]);
    
            count = await opinionMarket.userBlockTradeCount(user1.address);
            expect(count).to.equal(2);
        });
    
        it("should enforce MAX_TRADES_PER_BLOCK limit", async () => {
            // Submit MAX_TRADES_PER_BLOCK answers
            for (let i = 1; i <= MAX_TRADES_PER_BLOCK; i++) {
                // Alternate between opinions
                await opinionMarket.connect(user1).submitAnswer(i % 2 + 1, `Answer ${i}`);
            }
    
            // Next trade should fail
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "One too many")
            ).to.be.revertedWithCustomError(opinionMarket, "MaxBlockTradesExceeded");
        });
    
        it("should emit TradeExecuted event", async () => {
            const currentBlock = await ethers.provider.getBlockNumber();
            await expect(opinionMarket.connect(user1).submitAnswer(1, "Answer"))
                .to.emit(opinionMarket, "TradeExecuted")
                .withArgs(user1.address, 1, currentBlock + 1);
        });
    
        it("should correctly report remaining trades", async () => {
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            const remaining = await opinionMarket.getRemainingBlockTrades(user1.address);
            expect(remaining).to.equal(MAX_TRADES_PER_BLOCK - 1);
        });
    
        it("should maintain opinion-specific block check while enforcing global limit", async () => {
            // Submit answer for opinion 1
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            
            // Same opinion in same block should fail
            await expect(
                opinionMarket.connect(user1).submitAnswer(1, "Answer 1 again")
            ).to.be.revertedWithCustomError(opinionMarket, "OneTradePerBlock");
            
            // Different opinion in same block should work
            await opinionMarket.connect(user1).submitAnswer(2, "Answer 2");
        });
    
        it("should reset count in new block", async () => {
            // Submit an answer
            await opinionMarket.connect(user1).submitAnswer(1, "Answer 1");
            
            // Mine a new block
            await network.provider.send("evm_mine");
            
            // Check count reset
            const count = await opinionMarket.userBlockTradeCount(user1.address);
            expect(count).to.equal(0);
        });
    
        it("should handle multiple users independently", async () => {
            // First user submits max trades
            for (let i = 1; i <= MAX_TRADES_PER_BLOCK; i++) {
                await opinionMarket.connect(user1).submitAnswer(i % 2 + 1, `Answer ${i}`);
            }
    
            // Second user should still be able to trade
            await expect(
                opinionMarket.connect(user2).submitAnswer(1, "Other user answer")
            ).to.not.be.reverted;
        });
    });
}); // End of main describe block