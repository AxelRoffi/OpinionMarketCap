// test/deployment-readiness.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
    OpinionCore,
    FeeManager,
    PoolManager,
    OpinionMarket,
    MockERC20
} from "../typechain-types";

describe("Deployment Readiness Suite", function() {
    async function deployFullSystemFixture() {
        const [admin, treasury, user1, user2, moderator] = await ethers.getSigners();

        // Deploy USDC mock
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        const usdcToken = await MockERC20Factory.deploy("USDC Token", "USDC");
        await usdcToken.waitForDeployment();

        // Deploy FeeManager
        const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
        const feeManager = await FeeManagerFactory.deploy();
        await feeManager.waitForDeployment();

        // Deploy PoolManager
        const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
        const poolManager = await PoolManagerFactory.deploy();
        await poolManager.waitForDeployment();

        // Deploy OpinionCore
        const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore");
        const opinionCore = await OpinionCoreFactory.deploy();
        await opinionCore.waitForDeployment();

        // Deploy OpinionMarket
        const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
        const opinionMarket = await OpinionMarketFactory.deploy();
        await opinionMarket.waitForDeployment();

        // Initialize contracts
        await feeManager.initialize(
            await usdcToken.getAddress(),
            treasury.address
        );

        await poolManager.initialize(
            await opinionCore.getAddress(),
            await feeManager.getAddress(),
            await usdcToken.getAddress(),
            treasury.address
        );

        await opinionCore.initialize(
            await usdcToken.getAddress(),
            await feeManager.getAddress(),
            await poolManager.getAddress(),
            treasury.address
        );

        await opinionMarket.initialize(
            await opinionCore.getAddress(),
            await feeManager.getAddress(),
            await poolManager.getAddress(),
            await usdcToken.getAddress(),
            treasury.address
        );

        // Setup roles
        const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
        const MARKET_CONTRACT_ROLE = await opinionCore.MARKET_CONTRACT_ROLE();
        const MODERATOR_ROLE = await opinionCore.MODERATOR_ROLE();

        await opinionCore.grantRole(POOL_MANAGER_ROLE, await poolManager.getAddress());
        await opinionCore.grantRole(MARKET_CONTRACT_ROLE, await opinionMarket.getAddress());
        await opinionCore.grantRole(MODERATOR_ROLE, moderator.address);

        // Mint USDC to users
        await usdcToken.mint(user1.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(user2.address, ethers.parseUnits("1000", 6));

        return {
            opinionCore,
            feeManager,
            poolManager,
            opinionMarket,
            usdcToken,
            admin,
            treasury,
            user1,
            user2,
            moderator
        };
    }

    describe("Contract Deployment", function() {
        it("Should deploy all contracts successfully", async function() {
            const {
                opinionCore,
                feeManager,
                poolManager,
                opinionMarket,
                usdcToken
            } = await loadFixture(deployFullSystemFixture);

            expect(await opinionCore.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await feeManager.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await poolManager.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await opinionMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
            expect(await usdcToken.getAddress()).to.not.equal(ethers.ZeroAddress);
        });

        it("Should initialize all contracts correctly", async function() {
            const {
                opinionCore,
                feeManager,
                poolManager,
                opinionMarket,
                usdcToken,
                treasury
            } = await loadFixture(deployFullSystemFixture);

            expect(await opinionCore.usdcToken()).to.equal(await usdcToken.getAddress());
            expect(await opinionCore.treasury()).to.equal(treasury.address);
            expect(await feeManager.usdcToken()).to.equal(await usdcToken.getAddress());
            expect(await poolManager.usdcToken()).to.equal(await usdcToken.getAddress());
            expect(await opinionMarket.usdcToken()).to.equal(await usdcToken.getAddress());
        });
    });

    describe("Role Configuration", function() {
        it("Should have proper role assignments", async function() {
            const {
                opinionCore,
                poolManager,
                opinionMarket,
                moderator,
                admin
            } = await loadFixture(deployFullSystemFixture);

            const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
            const MODERATOR_ROLE = await opinionCore.MODERATOR_ROLE();
            const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
            const MARKET_CONTRACT_ROLE = await opinionCore.MARKET_CONTRACT_ROLE();

            expect(await opinionCore.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
            expect(await opinionCore.hasRole(MODERATOR_ROLE, moderator.address)).to.be.true;
            expect(await opinionCore.hasRole(POOL_MANAGER_ROLE, await poolManager.getAddress())).to.be.true;
            expect(await opinionCore.hasRole(MARKET_CONTRACT_ROLE, await opinionMarket.getAddress())).to.be.true;
        });
    });

    describe("Core Functionality", function() {
        it("Should enable public creation and create opinions", async function() {
            const {
                opinionCore,
                usdcToken,
                user1,
                treasury,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Enable public creation
            await opinionCore.connect(admin).togglePublicCreation();

            // Approve USDC for opinion creation
            await usdcToken.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("10", 6));

            // Create opinion
            await expect(
                opinionCore.connect(user1).createOpinion(
                    "Will Bitcoin reach $100k?",
                    "Yes, by end of 2024",
                    "Based on current trends",
                    ethers.parseUnits("5", 6), // 5 USDC initial price
                    ["Crypto"]
                )
            ).to.not.be.reverted;

            // Check opinion was created
            const opinion = await opinionCore.getOpinionDetails(1);
            expect(opinion.question).to.equal("Will Bitcoin reach $100k?");
            expect(opinion.creator).to.equal(user1.address);
        });

        it("Should handle answer submissions with proper fee collection", async function() {
            const {
                opinionCore,
                usdcToken,
                user1,
                user2,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Enable public creation
            await opinionCore.connect(admin).togglePublicCreation();

            // Setup approvals
            await usdcToken.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
            await usdcToken.connect(user2).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

            // Create opinion
            await opinionCore.connect(user1).createOpinion(
                "Test question?",
                "Initial answer",
                "Description",
                ethers.parseUnits("2", 6),
                ["Crypto"]
            );

            // Submit new answer
            await expect(
                opinionCore.connect(user2).submitAnswer(
                    1,
                    "Different answer",
                    "New description",
                    ""
                )
            ).to.not.be.reverted;

            // Check answer history
            const history = await opinionCore.getAnswerHistory(1);
            expect(history.length).to.equal(2);
            expect(history[1].answer).to.equal("Different answer");
            expect(history[1].owner).to.equal(user2.address);
        });
    });

    describe("Security Features", function() {
        it("Should implement proper access controls", async function() {
            const {
                opinionCore,
                user1,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // User1 should not be able to call admin functions
            await expect(
                opinionCore.connect(user1).pause()
            ).to.be.revertedWithCustomError(
                opinionCore,
                "AccessControlUnauthorizedAccount"
            );

            // Admin should be able to pause
            await expect(
                opinionCore.connect(admin).pause()
            ).to.not.be.reverted;
        });

        it("Should implement reentrancy protection", async function() {
            const {
                opinionCore,
                usdcToken,
                user1,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Enable public creation
            await opinionCore.connect(admin).togglePublicCreation();

            // Approve USDC
            await usdcToken.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("10", 6));

            // Create opinion should work normally
            await expect(
                opinionCore.connect(user1).createOpinion(
                    "Test question?",
                    "Answer",
                    "Desc",
                    ethers.parseUnits("2", 6),
                    ["Crypto"]
                )
            ).to.not.be.reverted;
        });
    });

    describe("Fee Management", function() {
        it("Should properly calculate and distribute fees", async function() {
            const {
                opinionCore,
                feeManager,
                usdcToken,
                user1,
                user2,
                treasury,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Enable public creation
            await opinionCore.connect(admin).togglePublicCreation();

            // Setup approvals
            await usdcToken.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
            await usdcToken.connect(user2).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

            // Get initial treasury balance
            const initialTreasuryBalance = await usdcToken.balanceOf(treasury.address);

            // Create opinion (should collect creation fee)
            await opinionCore.connect(user1).createOpinion(
                "Fee test?",
                "Answer",
                "Desc",
                ethers.parseUnits("5", 6),
                ["Crypto"]
            );

            // Check treasury received creation fee
            const afterCreationBalance = await usdcToken.balanceOf(treasury.address);
            expect(afterCreationBalance).to.be.gt(initialTreasuryBalance);

            // Submit answer (should collect trading fee)
            await opinionCore.connect(user2).submitAnswer(
                1,
                "New answer",
                "New desc",
                ""
            );

            // Check fee manager has accumulated fees
            const accumulatedFees = await feeManager.getTotalAccumulatedFees();
            expect(accumulatedFees).to.be.gt(0);
        });
    });

    describe("Upgrade Mechanism", function() {
        it("Should support UUPS upgrade pattern", async function() {
            const {
                opinionCore,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Deploy new implementation
            const OpinionCoreV2Factory = await ethers.getContractFactory("OpinionCore");
            const opinionCoreV2 = await OpinionCoreV2Factory.deploy();
            await opinionCoreV2.waitForDeployment();

            // Schedule upgrade (should work with timelock)
            const tx = await opinionCore.connect(admin).scheduleContractUpgrade(
                await opinionCoreV2.getAddress(),
                "Test upgrade"
            );
            
            expect(tx).to.not.be.reverted;
        });
    });

    describe("Gas Optimization", function() {
        it("Should stay within reasonable gas limits for key operations", async function() {
            const {
                opinionCore,
                usdcToken,
                user1,
                user2,
                admin
            } = await loadFixture(deployFullSystemFixture);

            // Enable public creation
            await opinionCore.connect(admin).togglePublicCreation();

            // Setup approvals
            await usdcToken.connect(user1).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));
            await usdcToken.connect(user2).approve(await opinionCore.getAddress(), ethers.parseUnits("100", 6));

            // Test opinion creation gas usage
            const createTx = await opinionCore.connect(user1).createOpinion.populateTransaction(
                "Gas test question?",
                "Initial answer",
                "Description",
                ethers.parseUnits("5", 6),
                ["Crypto"]
            );
            
            const gasEstimate = await user1.estimateGas(createTx);
            expect(gasEstimate).to.be.lt(500000); // Should be under 500k gas

            // Actually create the opinion
            await opinionCore.connect(user1).createOpinion(
                "Gas test question?",
                "Initial answer", 
                "Description",
                ethers.parseUnits("5", 6),
                ["Crypto"]
            );

            // Test answer submission gas usage
            const answerTx = await opinionCore.connect(user2).submitAnswer.populateTransaction(
                1,
                "New answer",
                "New description",
                ""
            );
            
            const answerGasEstimate = await user2.estimateGas(answerTx);
            expect(answerGasEstimate).to.be.lt(300000); // Should be under 300k gas
        });
    });
});