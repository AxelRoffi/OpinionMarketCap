const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MinimalOpinionCoreUpgradeable", function () {
    let minimalOpinionCore;
    let usdcToken;
    let feeManager;
    let treasury;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2, treasury, feeManager] = await ethers.getSigners();

        // Deploy mock USDC
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdcToken = await MockERC20.deploy("USDC", "USDC", 6);
        await usdcToken.waitForDeployment();

        // Mint USDC to users
        await usdcToken.mint(user1.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(user2.address, ethers.parseUnits("1000", 6));

        // Deploy MinimalOpinionCoreUpgradeable
        const MinimalOpinionCore = await ethers.getContractFactory("MinimalOpinionCoreUpgradeable");
        minimalOpinionCore = await upgrades.deployProxy(
            MinimalOpinionCore,
            [await usdcToken.getAddress(), feeManager.address, treasury.address],
            { kind: "uups" }
        );
        await minimalOpinionCore.waitForDeployment();

        // Approve USDC for contract
        await usdcToken.connect(user1).approve(
            await minimalOpinionCore.getAddress(),
            ethers.parseUnits("1000", 6)
        );
        await usdcToken.connect(user2).approve(
            await minimalOpinionCore.getAddress(),
            ethers.parseUnits("1000", 6)
        );
    });

    describe("Initialization", function () {
        it("Should initialize with correct parameters", async function () {
            expect(await minimalOpinionCore.usdcToken()).to.equal(await usdcToken.getAddress());
            expect(await minimalOpinionCore.feeManager()).to.equal(feeManager.address);
            expect(await minimalOpinionCore.treasury()).to.equal(treasury.address);
            expect(await minimalOpinionCore.nextOpinionId()).to.equal(1);
        });

        it("Should grant admin role to deployer", async function () {
            const ADMIN_ROLE = await minimalOpinionCore.ADMIN_ROLE();
            expect(await minimalOpinionCore.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should have correct version", async function () {
            expect(await minimalOpinionCore.version()).to.equal("1.0.0");
        });
    });

    describe("Opinion Creation", function () {
        it("Should create opinion successfully", async function () {
            const tx = await minimalOpinionCore.connect(user1).createOpinion(
                "Will ETH reach $5000?",
                "Yes"
            );

            await expect(tx)
                .to.emit(minimalOpinionCore, "OpinionCreated")
                .withArgs(1, user1.address, "Will ETH reach $5000?");

            const opinion = await minimalOpinionCore.getOpinion(1);
            expect(opinion.question).to.equal("Will ETH reach $5000?");
            expect(opinion.currentAnswer).to.equal("Yes");
            expect(opinion.creator).to.equal(user1.address);
            expect(opinion.currentOwner).to.equal(user1.address);
            expect(opinion.isActive).to.be.true;
        });

        it("Should charge creation fee", async function () {
            const treasuryBalanceBefore = await usdcToken.balanceOf(treasury.address);

            await minimalOpinionCore.connect(user1).createOpinion(
                "Will ETH reach $5000?",
                "Yes"
            );

            const treasuryBalanceAfter = await usdcToken.balanceOf(treasury.address);
            const CREATION_FEE = await minimalOpinionCore.CREATION_FEE();

            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(CREATION_FEE);
        });

        it("Should increment opinion ID", async function () {
            await minimalOpinionCore.connect(user1).createOpinion("Question 1", "Answer 1");
            await minimalOpinionCore.connect(user1).createOpinion("Question 2", "Answer 2");

            expect(await minimalOpinionCore.nextOpinionId()).to.equal(3);
        });

        it("Should revert with invalid question", async function () {
            await expect(
                minimalOpinionCore.connect(user1).createOpinion("", "Answer")
            ).to.be.revertedWith("Invalid question");

            await expect(
                minimalOpinionCore.connect(user1).createOpinion("a".repeat(101), "Answer")
            ).to.be.revertedWith("Invalid question");
        });
    });

    describe("Answer Submission", function () {
        beforeEach(async function () {
            await minimalOpinionCore.connect(user1).createOpinion(
                "Will ETH reach $5000?",
                "Yes"
            );
        });

        it("Should submit answer successfully", async function () {
            const MIN_ANSWER_PRICE = await minimalOpinionCore.MIN_ANSWER_PRICE();

            const tx = await minimalOpinionCore.connect(user2).submitAnswer(1, "No");

            await expect(tx)
                .to.emit(minimalOpinionCore, "AnswerSubmitted")
                .withArgs(1, user2.address, "No", MIN_ANSWER_PRICE);

            const opinion = await minimalOpinionCore.getOpinion(1);
            expect(opinion.currentAnswer).to.equal("No");
            expect(opinion.currentOwner).to.equal(user2.address);
        });

        it("Should transfer payment to previous owner", async function () {
            const MIN_ANSWER_PRICE = await minimalOpinionCore.MIN_ANSWER_PRICE();
            const user1BalanceBefore = await usdcToken.balanceOf(user1.address);

            await minimalOpinionCore.connect(user2).submitAnswer(1, "No");

            const user1BalanceAfter = await usdcToken.balanceOf(user1.address);
            expect(user1BalanceAfter - user1BalanceBefore).to.equal(MIN_ANSWER_PRICE);
        });

        it("Should increase price by 50%", async function () {
            const MIN_ANSWER_PRICE = await minimalOpinionCore.MIN_ANSWER_PRICE();

            await minimalOpinionCore.connect(user2).submitAnswer(1, "No");

            const opinion = await minimalOpinionCore.getOpinion(1);
            const expectedNextPrice = (MIN_ANSWER_PRICE * 150n) / 100n;
            expect(opinion.nextPrice).to.equal(expectedNextPrice);
        });

        it("Should increment answer count", async function () {
            await minimalOpinionCore.connect(user2).submitAnswer(1, "No");
            expect(await minimalOpinionCore.answerCount(1)).to.equal(1);

            await minimalOpinionCore.connect(user1).submitAnswer(1, "Maybe");
            expect(await minimalOpinionCore.answerCount(1)).to.equal(2);
        });

        it("Should revert if opinion not active", async function () {
            await minimalOpinionCore.deactivateOpinion(1);

            await expect(
                minimalOpinionCore.connect(user2).submitAnswer(1, "No")
            ).to.be.revertedWith("Not active");
        });
    });

    describe("Admin Functions", function () {
        beforeEach(async function () {
            await minimalOpinionCore.connect(user1).createOpinion(
                "Will ETH reach $5000?",
                "Yes"
            );
        });

        it("Should deactivate opinion", async function () {
            await minimalOpinionCore.deactivateOpinion(1);

            const opinion = await minimalOpinionCore.getOpinion(1);
            expect(opinion.isActive).to.be.false;
        });

        it("Should grant admin role", async function () {
            await minimalOpinionCore.grantAdminRole(user1.address);

            const ADMIN_ROLE = await minimalOpinionCore.ADMIN_ROLE();
            expect(await minimalOpinionCore.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
        });

        it("Should emergency withdraw", async function () {
            // Send some USDC to contract
            await usdcToken.connect(user1).transfer(
                await minimalOpinionCore.getAddress(),
                ethers.parseUnits("10", 6)
            );

            const treasuryBalanceBefore = await usdcToken.balanceOf(treasury.address);

            await minimalOpinionCore.emergencyWithdraw();

            const treasuryBalanceAfter = await usdcToken.balanceOf(treasury.address);
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(ethers.parseUnits("10", 6));
        });
    });

    describe("UUPS Upgrade", function () {
        it("Should upgrade to new implementation", async function () {
            // Deploy V2 (for now, just redeploy same contract)
            const MinimalOpinionCoreV2 = await ethers.getContractFactory("MinimalOpinionCoreUpgradeable");

            const upgraded = await upgrades.upgradeProxy(
                await minimalOpinionCore.getAddress(),
                MinimalOpinionCoreV2
            );

            expect(await upgraded.version()).to.equal("1.0.0");
        });

        it("Should preserve state after upgrade", async function () {
            // Create opinion before upgrade
            await minimalOpinionCore.connect(user1).createOpinion(
                "Will ETH reach $5000?",
                "Yes"
            );

            // Upgrade
            const MinimalOpinionCoreV2 = await ethers.getContractFactory("MinimalOpinionCoreUpgradeable");
            const upgraded = await upgrades.upgradeProxy(
                await minimalOpinionCore.getAddress(),
                MinimalOpinionCoreV2
            );

            // Check state preserved
            const opinion = await upgraded.getOpinion(1);
            expect(opinion.question).to.equal("Will ETH reach $5000?");
            expect(opinion.currentAnswer).to.equal("Yes");
        });

        it("Should only allow admin to upgrade", async function () {
            const MinimalOpinionCoreV2 = await ethers.getContractFactory("MinimalOpinionCoreUpgradeable");
            const v2Implementation = await MinimalOpinionCoreV2.deploy();
            await v2Implementation.waitForDeployment();

            await expect(
                minimalOpinionCore.connect(user1).upgradeToAndCall(
                    await v2Implementation.getAddress(),
                    "0x"
                )
            ).to.be.reverted;
        });
    });
});
