// test/02_AdminOperator.test.ts

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OpinionMarket, MockERC20 } from "../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("02: Admin & Operator Actions", () => {
    // Type for our fixture return
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        admin: HardhatEthersSigner;
        moderator: HardhatEthersSigner;
        operator: HardhatEthersSigner;
    };

    // Define the deployment fixture inline for this file
    async function deployFixture(): Promise<DeploymentFixture> {
        const [owner, user1, admin, moderator, operator] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockERC20Factory = await ethers.getContractFactory("MockERC20", owner);
        const usdc = await MockERC20Factory.deploy("Mock USDC", "mUSDC");
        const usdcAddress = await usdc.getAddress();

        // Deploy OpinionMarket through proxy
        const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", owner);
        const opinionMarket = await upgrades.deployProxy(
            OpinionMarketFactory,
            [usdcAddress],
            { initializer: "initialize", kind: "uups" }
        ) as unknown as OpinionMarket;
        const opinionMarketAddress = await opinionMarket.getAddress();

        // Mint some mock USDC for the users
        const initialMintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
        for (const signer of [owner, user1, admin, moderator, operator]) {
            await usdc.mint(signer.address, initialMintAmount);
            await usdc.connect(signer).approve(opinionMarketAddress, initialMintAmount);
        }

        // Assign specific roles
        const adminRole = await opinionMarket.ADMIN_ROLE();
        const moderatorRole = await opinionMarket.MODERATOR_ROLE();
        const operatorRole = await opinionMarket.OPERATOR_ROLE();
        
        await opinionMarket.grantRole(adminRole, admin.address);
        await opinionMarket.grantRole(moderatorRole, moderator.address);
        await opinionMarket.grantRole(operatorRole, operator.address);

        return { opinionMarket, usdc, owner, user1, admin, moderator, operator };
    }

    // Helper function to create an opinion for testing
    async function createOpinionForPool(creator: HardhatEthersSigner, question: string = "Test Question?", answer: string = "Test Answer"): Promise<bigint> {
        const tx = await opinionMarket.connect(creator).createOpinion(question, answer);
        const receipt = await tx.wait();
        const event = receipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("OpinionCreated")?.topicHash);
        if (!event) throw new Error("OpinionCreated event not found");
        const args = opinionMarket.interface.parseLog(event as any)?.args;
        return args.id;
    }

    // Declare variables to hold fixture results
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let admin: HardhatEthersSigner;
    let moderator: HardhatEthersSigner;
    let operator: HardhatEthersSigner;
    let ADMIN_ROLE: string;
    let MODERATOR_ROLE: string;
    let OPERATOR_ROLE: string;

    // Load fixture before each test in this block
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;
        user1 = deployment.user1;
        admin = deployment.admin;
        moderator = deployment.moderator;
        operator = deployment.operator;
        
        // Fetch role identifiers
        ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
        MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
        OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
    });

    // --- Test Cases ---

    describe("Public Creation Toggle", () => {
        it("Should allow ADMIN to toggle public creation", async () => {
            expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
            await expect(opinionMarket.connect(admin).togglePublicCreation())
                .to.emit(opinionMarket, "PublicCreationToggled").withArgs(true);
            expect(await opinionMarket.isPublicCreationEnabled()).to.be.true;
            // Non-owner can now create
            await expect(opinionMarket.connect(user1).createOpinion("Test?", "Initial")).to.not.be.reverted;

            await expect(opinionMarket.connect(admin).togglePublicCreation())
                .to.emit(opinionMarket, "PublicCreationToggled").withArgs(false);
            expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
            // Non-owner cannot create now
            await expect(opinionMarket.connect(user1).createOpinion("Test 2?", "Initial 2"))
                .to.be.revertedWithCustomError(opinionMarket, "UnauthorizedCreator");
        });

        it("Should prevent non-ADMIN from toggling", async () => {
            await expect(opinionMarket.connect(user1).togglePublicCreation())
                .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
                .withArgs(user1.address, ADMIN_ROLE);
        });
    });

    describe("Opinion Deactivation", () => {
        let opinionId: bigint;
        beforeEach(async () => {
            // Enable public creation for this test
            await opinionMarket.connect(admin).togglePublicCreation();
            opinionId = await createOpinionForPool(owner);
        });

        it("Should allow MODERATOR to deactivate an opinion", async () => {
            expect((await opinionMarket.opinions(opinionId)).isActive).to.be.true;
            await expect(opinionMarket.connect(moderator).deactivateOpinion(opinionId))
                .to.emit(opinionMarket, "OpinionDeactivated").withArgs(opinionId);
            expect((await opinionMarket.opinions(opinionId)).isActive).to.be.false;
        });

        it("Should prevent non-MODERATOR from deactivating", async () => {
            await expect(opinionMarket.connect(user1).deactivateOpinion(opinionId))
                .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
                .withArgs(user1.address, MODERATOR_ROLE);
        });

        it("Should prevent submitting answers to deactivated opinions", async () => {
            await opinionMarket.connect(moderator).deactivateOpinion(opinionId);
            await expect(opinionMarket.connect(user1).submitAnswer(opinionId, "Deactivated Answer"))
                .to.be.revertedWithCustomError(opinionMarket, "OpinionNotActive");
        });
    });

    describe("Emergency Withdrawal", () => {
        beforeEach(async() => {
            // Send some USDC directly to the contract for withdrawal test
            await usdc.connect(owner).transfer(await opinionMarket.getAddress(), ethers.parseUnits("100", 6));
            expect(await usdc.balanceOf(await opinionMarket.getAddress())).to.equal(ethers.parseUnits("100", 6));
        });

        it("Should allow OWNER to emergency withdraw WHEN PAUSED", async () => {
            await opinionMarket.connect(operator).pause(); // Pause first
            const contractBalance = await usdc.balanceOf(await opinionMarket.getAddress());
            const ownerBalanceBefore = await usdc.balanceOf(owner.address);

            await expect(opinionMarket.connect(owner).emergencyWithdraw(await usdc.getAddress()))
                .to.emit(opinionMarket, "EmergencyWithdraw")
                .withArgs(await usdc.getAddress(), contractBalance, anyValue); // Timestamp is anyValue

            expect(await usdc.balanceOf(await opinionMarket.getAddress())).to.equal(0);
            expect(await usdc.balanceOf(owner.address)).to.equal(ownerBalanceBefore + contractBalance);
        });

        it("Should prevent emergency withdraw when NOT PAUSED", async () => {
            await expect(opinionMarket.connect(owner).emergencyWithdraw(await usdc.getAddress()))
                .to.be.revertedWithCustomError(opinionMarket, "ExpectedPause");
        });

        it("Should prevent non-OWNER from emergency withdraw", async () => {
            await opinionMarket.connect(operator).pause();
            await expect(opinionMarket.connect(user1).emergencyWithdraw(await usdc.getAddress()))
                .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount");
            // The contract is using AccessControl instead of direct owner check
        });
    });
});