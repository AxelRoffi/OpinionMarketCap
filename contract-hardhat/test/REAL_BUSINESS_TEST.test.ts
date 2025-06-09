import { expect } from "chai";
import { ethers } from "hardhat";
import { FixedOpinionMarket, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("🚨 REAL BUSINESS FUNCTIONS TEST - EXACTLY LIKE TESTNET", function () {
    let contract: FixedOpinionMarket;
    let mockUSDC: MockERC20;
    let user1: SignerWithAddress;
    let treasury: SignerWithAddress;

    beforeEach(async function () {
        [, user1, treasury] = await ethers.getSigners();

        // Deploy mock USDC
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20Factory.deploy("Mock USDC", "USDC");

        // Deploy FixedOpinionMarket
        const FixedOpinionMarketFactory = await ethers.getContractFactory("FixedOpinionMarket");
        contract = await FixedOpinionMarketFactory.deploy();

        // Initialize
        await contract.initialize(await mockUSDC.getAddress(), treasury.address);

        // Mint and approve USDC for user1
        const amount = ethers.parseUnits("1000", 6); // 1000 USDC
        await mockUSDC.mint(user1.address, amount);
        await mockUSDC.connect(user1).approve(await contract.getAddress(), amount);
    });
    
    describe("🧪 EXACT TESTNET SCENARIO", function () {
        it("Should handle REAL createOpinion call with 5 parameters", async function () {
            console.log("🔍 Testing createOpinion with 5 parameters...");
            
            const initialPrice = ethers.parseUnits("5", 6); // 5 USDC
            
            // This is EXACTLY what would be called on testnet
            const tx = await contract.connect(user1).createOpinion(
                "Will Bitcoin reach $100k by end of 2024?",
                "Yes, definitely happening",
                "Based on institutional adoption and ETF approvals",
                initialPrice,
                ["crypto", "prediction", "bitcoin"]
            );
            
            const receipt = await tx.wait();
            console.log("✅ Transaction successful, gas used:", receipt?.gasUsed.toString());
            
            // Check the opinion was created correctly
            const opinion = await contract.getOpinion(1);
            expect(opinion.creator).to.equal(user1.address);
            expect(opinion.question).to.equal("Will Bitcoin reach $100k by end of 2024?");
            expect(opinion.currentAnswer).to.equal("Yes, definitely happening");
            expect(opinion.description).to.equal("Based on institutional adoption and ETF approvals");
            expect(opinion.lastPrice).to.equal(initialPrice);
            expect(opinion.categories.length).to.equal(3);
            expect(opinion.categories[0]).to.equal("crypto");
            expect(opinion.categories[1]).to.equal("prediction");
            expect(opinion.categories[2]).to.equal("bitcoin");
            
            console.log("✅ All data stored correctly");
        });
        
        it("Should fail with old 3-parameter signature", async function () {
            console.log("🔍 Testing that old signature fails...");
            
            // This should fail - it's the OLD signature that was causing problems
            try {
                // @ts-ignore - intentionally calling wrong signature
                await contract.connect(user1)['createOpinion(string,string,uint96)'](
                    "Will Bitcoin reach $100k?",
                    "Yes definitely",
                    ethers.parseUnits("5", 6)
                );
                throw new Error("Should have failed!");
            } catch (error: any) {
                expect(error.message).to.include("no matching function");
                console.log("✅ Old signature correctly rejected");
            }
        });
        
        it("Should handle edge cases - empty categories array", async function () {
            console.log("🔍 Testing empty categories...");
            
            await expect(
                contract.connect(user1).createOpinion(
                    "Test question",
                    "Test answer", 
                    "Test description",
                    ethers.parseUnits("5", 6),
                    [] // Empty categories
                )
            ).to.be.revertedWithCustomError(contract, "TooManyCategories");
            
            console.log("✅ Empty categories correctly rejected");
        });
        
        it("Should handle edge cases - too many categories", async function () {
            console.log("🔍 Testing too many categories...");
            
            await expect(
                contract.connect(user1).createOpinion(
                    "Test question",
                    "Test answer",
                    "Test description", 
                    ethers.parseUnits("5", 6),
                    ["a", "b", "c", "d"] // 4 categories > MAX_CATEGORIES (3)
                )
            ).to.be.revertedWithCustomError(contract, "TooManyCategories");
            
            console.log("✅ Too many categories correctly rejected");
        });
        
        it("Should handle real submitAnswer scenario", async function () {
            console.log("🔍 Testing real submitAnswer flow...");
            
            // Create opinion first
            await contract.connect(user1).createOpinion(
                "Will ETH reach $5k?",
                "Yes by Q2 2024",
                "Bullish on ETH 2.0 and institutional adoption",
                ethers.parseUnits("10", 6),
                ["crypto", "ethereum"]
            );
            
            // Check the next price
            const opinion = await contract.getOpinion(1);
            const nextPrice = opinion.nextPrice;
            console.log("📊 Next price:", ethers.formatUnits(nextPrice, 6), "USDC");
            
            // Submit answer (different user)
            const user2 = (await ethers.getSigners())[2];
            await mockUSDC.mint(user2.address, ethers.parseUnits("1000", 6));
            await mockUSDC.connect(user2).approve(await contract.getAddress(), ethers.parseUnits("1000", 6));
            
            const submitTx = await contract.connect(user2).submitAnswer(
                1,
                "No, bear market incoming"
            );
            
            await submitTx.wait();
            console.log("✅ Answer submitted successfully");
            
            // Verify the state change
            const updatedOpinion = await contract.getOpinion(1);
            expect(updatedOpinion.currentOwner).to.equal(user2.address);
            expect(updatedOpinion.currentAnswer).to.equal("No, bear market incoming");
            expect(updatedOpinion.lastPrice).to.equal(nextPrice);
            
            console.log("✅ Opinion state updated correctly");
        });
    });
    
    describe("🔍 FUNCTION SIGNATURE VERIFICATION", function () {
        it("Should have correct function signatures", async function () {
            const fragment = contract.interface.getFunction("createOpinion");
            console.log("📝 createOpinion signature:", fragment.format());
            
            expect(fragment.inputs.length).to.equal(5);
            expect(fragment.inputs[0].type).to.equal("string"); // question
            expect(fragment.inputs[1].type).to.equal("string"); // answer
            expect(fragment.inputs[2].type).to.equal("string"); // description
            expect(fragment.inputs[3].type).to.equal("uint96"); // initialPrice
            expect(fragment.inputs[4].type).to.equal("string[]"); // categories
            
            console.log("✅ Function signature matches expected format");
        });
    });
});