import { expect } from "chai";
import { ethers } from "hardhat";
import { FixedOpinionMarket, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FixedOpinionMarket - Complete Testing", function () {
    let contract: FixedOpinionMarket;
    let mockUSDC: MockERC20;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let treasury: SignerWithAddress;

    beforeEach(async function () {
        [owner, user1, user2, treasury] = await ethers.getSigners();

        // Deploy mock USDC
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20Factory.deploy("Mock USDC", "USDC");

        // Deploy FixedOpinionMarket
        const FixedOpinionMarketFactory = await ethers.getContractFactory("FixedOpinionMarket");
        contract = await FixedOpinionMarketFactory.deploy();

        // Initialize
        await contract.initialize(await mockUSDC.getAddress(), treasury.address);

        // Mint and approve USDC for users
        const amount = ethers.parseUnits("1000", 6); // 1000 USDC
        await mockUSDC.mint(user1.address, amount);
        await mockUSDC.mint(user2.address, amount);
        await mockUSDC.mint(owner.address, amount);

        await mockUSDC.connect(user1).approve(await contract.getAddress(), amount);
        await mockUSDC.connect(user2).approve(await contract.getAddress(), amount);
        await mockUSDC.connect(owner).approve(await contract.getAddress(), amount);
    });
    
    describe("✅ CORE FUNCTIONS - MUST WORK", function () {
        it("Should create opinion successfully", async function () {
            const initialPrice = ethers.parseUnits("10", 6); // 10 USDC
            
            await expect(contract.connect(user1).createOpinion(
                "Will ETH reach $10k?",
                "Yes definitely",
                "This is my analysis",
                initialPrice,
                ["crypto", "prediction"]
            )).to.emit(contract, "OpinionCreated");
            
            const opinion = await contract.getOpinion(1);
            expect(opinion.creator).to.equal(user1.address);
            expect(opinion.question).to.equal("Will ETH reach $10k?");
            expect(opinion.description).to.equal("This is my analysis");
            expect(opinion.lastPrice).to.equal(initialPrice);
            expect(opinion.isActive).to.be.true;
            expect(opinion.categories.length).to.equal(2);
            expect(opinion.categories[0]).to.equal("crypto");
            expect(opinion.categories[1]).to.equal("prediction");
            
            // Check nextPrice is 30% more
            const expectedNext = (initialPrice * 130n) / 100n;
            expect(opinion.nextPrice).to.equal(expectedNext);
        });
        
        it("Should submit answer successfully", async function () {
            // Create opinion first
            await contract.connect(user1).createOpinion(
                "Will ETH reach $10k?",
                "Yes definitely",
                "This is my analysis",
                ethers.parseUnits("10", 6),
                ["crypto", "prediction"]
            );
            
            const opinion = await contract.getOpinion(1);
            const nextPrice = opinion.nextPrice;
            
            // Submit new answer
            await expect(contract.connect(user2).submitAnswer(
                1,
                "No way, bear market"
            )).to.emit(contract, "AnswerSubmitted");
            
            const updatedOpinion = await contract.getOpinion(1);
            expect(updatedOpinion.currentOwner).to.equal(user2.address);
            expect(updatedOpinion.currentAnswer).to.equal("No way, bear market");
            expect(updatedOpinion.lastPrice).to.equal(nextPrice);
            
            // Check fees were distributed
            const creatorFees = await contract.getAccumulatedFees(user1.address);
            const ownerFees = await contract.getAccumulatedFees(user1.address);
            expect(creatorFees).to.be.gt(0);
        });
        
        it("Should create pool successfully", async function () {
            // Create opinion first
            await contract.connect(user1).createOpinion(
                "Will ETH reach $10k?",
                "Yes definitely",
                "This is my analysis",
                ethers.parseUnits("10", 6),
                ["crypto", "prediction"]
            );
            
            const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
            const contribution = ethers.parseUnits("5", 6); // 5 USDC
            
            await expect(contract.connect(user2).createPool(
                1,
                "Bearish prediction",
                deadline,
                contribution
            )).to.emit(contract, "PoolCreated");
            
            const pool = await contract.getPool(1);
            expect(pool.creator).to.equal(user2.address);
            expect(pool.opinionId).to.equal(1);
            expect(pool.proposedAnswer).to.equal("Bearish prediction");
            expect(pool.totalContributed).to.equal(contribution);
        });
        
        it("Should contribute to pool successfully", async function () {
            // Create opinion and pool
            await contract.connect(user1).createOpinion(
                "Will ETH reach $10k?",
                "Yes definitely",
                "This is my analysis",
                ethers.parseUnits("2", 6), // Min price
                ["crypto", "prediction"]
            );
            
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            await contract.connect(user2).createPool(
                1,
                "Bearish prediction",
                deadline,
                ethers.parseUnits("1", 6)
            );
            
            // User1 contributes to the pool
            const contribution = ethers.parseUnits("2", 6);
            await expect(contract.connect(user1).contributeToPool(1, contribution))
                .to.emit(contract, "PoolContribution");
            
            const userContribution = await contract.getUserContribution(1, user1.address);
            expect(userContribution).to.equal(contribution);
        });
        
        it("Should claim fees successfully", async function () {
            // Create opinion and submit answer to generate fees
            await contract.connect(user1).createOpinion(
                "Will ETH reach $10k?",
                "Yes definitely",
                "This is my analysis",
                ethers.parseUnits("10", 6),
                ["crypto", "prediction"]
            );
            
            await contract.connect(user2).submitAnswer(1, "No way");
            
            // Check fees accumulated
            const feesBefore = await contract.getAccumulatedFees(user1.address);
            expect(feesBefore).to.be.gt(0);
            
            // Claim fees
            await expect(contract.connect(user1).claimFees())
                .to.emit(contract, "FeesDistributed");
            
            const feesAfter = await contract.getAccumulatedFees(user1.address);
            expect(feesAfter).to.equal(0);
        });
    });
    
    describe("❌ ERROR HANDLING - CUSTOM ERRORS", function () {
        it("Should revert with custom errors for invalid inputs", async function () {
            // Empty question
            await expect(
                contract.createOpinion("", "answer", "desc", ethers.parseUnits("10", 6), ["category"])
            ).to.be.revertedWithCustomError(contract, "QuestionEmpty");
            
            // Question too long
            const longQuestion = "a".repeat(101);
            await expect(
                contract.createOpinion(longQuestion, "answer", "desc", ethers.parseUnits("10", 6), ["category"])
            ).to.be.revertedWithCustomError(contract, "QuestionTooLong");
            
            // Price too low
            await expect(
                contract.createOpinion("question", "answer", "desc", ethers.parseUnits("1", 6), ["category"])
            ).to.be.revertedWithCustomError(contract, "PriceRange");
            
            // Price too high
            await expect(
                contract.createOpinion("question", "answer", "desc", ethers.parseUnits("101", 6), ["category"])
            ).to.be.revertedWithCustomError(contract, "PriceRange");
            
            // Too many categories
            await expect(
                contract.createOpinion("question", "answer", "desc", ethers.parseUnits("10", 6), ["a", "b", "c", "d"])
            ).to.be.revertedWithCustomError(contract, "TooManyCategories");
            
            // No categories
            await expect(
                contract.createOpinion("question", "answer", "desc", ethers.parseUnits("10", 6), [])
            ).to.be.revertedWithCustomError(contract, "TooManyCategories");
        });
        
        it("Should handle insufficient allowance/balance", async function () {
            // Remove allowance
            await mockUSDC.connect(user1).approve(await contract.getAddress(), 0);
            
            await expect(
                contract.connect(user1).createOpinion("question", "answer", "desc", ethers.parseUnits("10", 6), ["category"])
            ).to.be.revertedWithCustomError(contract, "InsufficientAllowance");
        });
        
        it("Should handle non-existent opinions/pools", async function () {
            await expect(
                contract.submitAnswer(999, "answer")
            ).to.be.revertedWithCustomError(contract, "OpinionNotFound");
            
            await expect(
                contract.contributeToPool(999, ethers.parseUnits("1", 6))
            ).to.be.revertedWithCustomError(contract, "PoolNotFound");
        });
    });
    
    describe("💰 FINANCIAL CALCULATIONS", function () {
        it("Should calculate fees correctly", async function () {
            const initialPrice = ethers.parseUnits("100", 6); // 100 USDC for easy math
            
            await contract.connect(user1).createOpinion(
                "Test question",
                "Test answer",
                "Test description",
                initialPrice,
                ["test"]
            );
            
            const opinion = await contract.getOpinion(1);
            const nextPrice = opinion.nextPrice; // 130 USDC
            
            await contract.connect(user2).submitAnswer(1, "New answer");
            
            // 3% to creator = 3.9 USDC
            // 2% to platform = 2.6 USDC (goes to treasury)  
            // 95% to previous owner = 123.5 USDC
            const expectedCreatorFee = (nextPrice * 3n) / 100n;
            const expectedOwnerFee = (nextPrice * 95n) / 100n;
            
            const creatorFees = await contract.getAccumulatedFees(user1.address);
            // user1 gets both creator fee AND owner fee (since they were the previous owner)
            expect(creatorFees).to.equal(expectedCreatorFee + expectedOwnerFee);
        });
        
        it("Should calculate next price correctly", async function () {
            const initialPrice = ethers.parseUnits("10", 6);
            
            await contract.connect(user1).createOpinion(
                "Test question",
                "Test answer",
                "Test description",
                initialPrice,
                ["test"]
            );
            
            const opinion = await contract.getOpinion(1);
            const expectedNextPrice = (initialPrice * 130n) / 100n; // 30% increase
            expect(opinion.nextPrice).to.equal(expectedNextPrice);
        });
    });
});