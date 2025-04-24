// test/04_OpinionSubmitAnswer.test.ts

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OpinionMarket, MockERC20 } from "../typechain-types";

describe("04: Answer Submission & Fee Distribution", () => {
    // Type for our fixture return
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        user2: HardhatEthersSigner;
        user3: HardhatEthersSigner;
        moderator: HardhatEthersSigner;
    };

    // Define the deployment fixture inline for this file
    async function deployFixture(): Promise<DeploymentFixture> {
        const [owner, user1, user2, user3, moderator] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20Factory.deploy("Mock USDC", "mUSDC");
        const usdcAddress = await usdc.getAddress();

        // Deploy OpinionMarket through proxy
        const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
        const opinionMarket = await upgrades.deployProxy(
            OpinionMarketFactory,
            [usdcAddress],
            { initializer: "initialize", kind: "uups" }
        ) as unknown as OpinionMarket;
        const opinionMarketAddress = await opinionMarket.getAddress();

        // Mint some mock USDC for the users
        const amount = ethers.parseUnits("1000000", 6); // 1M USDC each
        for (const signer of [owner, user1, user2, user3, moderator]) {
            await usdc.mint(signer.address, amount);
            await usdc.connect(signer).approve(opinionMarketAddress, amount);
        }

        // Grant moderator role
        const moderatorRole = await opinionMarket.MODERATOR_ROLE();
        await opinionMarket.grantRole(moderatorRole, moderator.address);

        // Enable public creation
        await opinionMarket.connect(owner).togglePublicCreation();

        return { opinionMarket, usdc, owner, user1, user2, user3, moderator };
    }

    // Helper function to create an opinion
    async function createOpinionForTest(creator: HardhatEthersSigner, question: string = "Submit Answer Q?", answer: string = "Initial Submit A"): Promise<bigint> {
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
    let user2: HardhatEthersSigner;
    let user3: HardhatEthersSigner;
    let moderator: HardhatEthersSigner;
    let PLATFORM_FEE_PERCENT: bigint;
    let CREATOR_FEE_PERCENT: bigint;
    let MAX_ANSWER_LENGTH: bigint;
    let MODERATOR_ROLE: string;
    let opinionId: bigint;
    let opinionCreator: HardhatEthersSigner;
    let initialAnswerOwner: HardhatEthersSigner;

    // Load fixture before each test in this block
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;
        user1 = deployment.user1;
        user2 = deployment.user2;
        user3 = deployment.user3;
        moderator = deployment.moderator;
        
        // Fetch constants
        PLATFORM_FEE_PERCENT = await opinionMarket.PLATFORM_FEE_PERCENT();
        CREATOR_FEE_PERCENT = await opinionMarket.CREATOR_FEE_PERCENT();
        MAX_ANSWER_LENGTH = await opinionMarket.MAX_ANSWER_LENGTH();
        MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();

        // Setup base opinion for tests
        opinionCreator = user1;
        initialAnswerOwner = opinionCreator; // Creator is the first owner
        opinionId = await createOpinionForTest(opinionCreator);
    });

    // --- Test Cases ---

    it("Should allow submitting an answer and update state", async () => {
        const submitter = user2;
        const newAnswer = "Answer Two";
        const opinionBefore = await opinionMarket.opinions(opinionId);
        const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.MINIMUM_PRICE();

        await expect(opinionMarket.connect(submitter).submitAnswer(opinionId, newAnswer))
            .to.emit(opinionMarket, "AnswerSubmitted")
            .withArgs(opinionId, newAnswer, submitter.address, pricePaid);

        const opinionAfter = await opinionMarket.opinions(opinionId);
        expect(opinionAfter.currentAnswer).to.equal(newAnswer);
        expect(opinionAfter.currentAnswerOwner).to.equal(submitter.address);
        expect(opinionAfter.lastPrice).to.equal(pricePaid);
        expect(opinionAfter.nextPrice).to.be.gt(pricePaid);
        expect(opinionAfter.totalVolume).to.equal(opinionBefore.totalVolume + pricePaid);
        expect(opinionAfter.isActive).to.be.true;

        // Check history
        const history = await opinionMarket.getAnswerHistory(opinionId);
        expect(history.length).to.equal(2);
        expect(history[1].answer).to.equal(newAnswer);
        expect(history[1].owner).to.equal(submitter.address);
        expect(history[1].price).to.equal(pricePaid);
    });

    it("Should distribute fees correctly on submission", async () => {
        const submitter = user2;
        const previousOwner = initialAnswerOwner;
        const newAnswer = "Answer Fee Test";
        const opinionBefore = await opinionMarket.opinions(opinionId);
        const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.MINIMUM_PRICE();

        const expectedPlatformFee = (pricePaid * PLATFORM_FEE_PERCENT) / 100n;
        const expectedCreatorFee = (pricePaid * CREATOR_FEE_PERCENT) / 100n;
        const expectedPreviousOwnerAmount = pricePaid - expectedPlatformFee - expectedCreatorFee;

        const creatorFeesBefore = await opinionMarket.accumulatedFees(opinionCreator.address);
        const previousOwnerFeesBefore = await opinionMarket.accumulatedFees(previousOwner.address);

        await expect(opinionMarket.connect(submitter).submitAnswer(opinionId, newAnswer))
            .to.changeTokenBalances(
                usdc,
                [owner, submitter, opinionMarket],
                [expectedPlatformFee, -pricePaid, expectedCreatorFee + expectedPreviousOwnerAmount]
            );

        // Check accumulated fees increased
        // Note: creator and previousOwner are the same in this case (user1)
        if (opinionCreator.address === previousOwner.address) {
            expect(await opinionMarket.accumulatedFees(previousOwner.address))
                .to.equal(previousOwnerFeesBefore + expectedCreatorFee + expectedPreviousOwnerAmount);
        } else {
            expect(await opinionMarket.accumulatedFees(opinionCreator.address))
                .to.equal(creatorFeesBefore + expectedCreatorFee);
            expect(await opinionMarket.accumulatedFees(previousOwner.address))
                .to.equal(previousOwnerFeesBefore + expectedPreviousOwnerAmount);
        }
    });

    it("Should reject submission if opinion is inactive", async () => {
        await opinionMarket.connect(moderator).deactivateOpinion(opinionId);
        await expect(opinionMarket.connect(user2).submitAnswer(opinionId, "Inactive Answer"))
            .to.be.revertedWithCustomError(opinionMarket, "OpinionNotActive");
    });

    it("Should reject submission if submitter is current owner", async () => {
        await expect(opinionMarket.connect(initialAnswerOwner).submitAnswer(opinionId, "Same Owner Answer"))
            .to.be.revertedWithCustomError(opinionMarket, "SameOwner");
    });

    it("Should reject submission with empty answer", async () => {
        await expect(opinionMarket.connect(user2).submitAnswer(opinionId, ""))
            .to.be.revertedWithCustomError(opinionMarket, "EmptyString");
    });

    it("Should reject submission with answer too long", async () => {
        const longAnswer = "c".repeat(Number(MAX_ANSWER_LENGTH) + 1);
        await expect(opinionMarket.connect(user2).submitAnswer(opinionId, longAnswer))
            .to.be.revertedWithCustomError(opinionMarket, "InvalidAnswerLength");
    });

    it("Should reject submission without sufficient allowance", async () => {
        const opinionBefore = await opinionMarket.opinions(opinionId);
        const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.MINIMUM_PRICE();
        await usdc.connect(user2).approve(await opinionMarket.getAddress(), pricePaid - 1n);
        await expect(opinionMarket.connect(user2).submitAnswer(opinionId, "Low Allowance Answer"))
            .to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
    });

    it("Should apply anti-MEV penalty for rapid trading within time window", async () => {
        const submitter = user2;
        const firstAnswer = "Rapid Trade 1";
        const secondAnswer = "Rapid Trade 2";

        // First trade
        const tx1 = await opinionMarket.connect(submitter).submitAnswer(opinionId, firstAnswer);
        await tx1.wait();
        const opinionAfter1 = await opinionMarket.opinions(opinionId);
        const price1 = opinionAfter1.lastPrice;
        const standardPlatformFee1 = (price1 * PLATFORM_FEE_PERCENT) / 100n;

        // Second trade - immediately (within RAPID_TRADE_WINDOW)
        const ownerBalanceBefore2 = await usdc.balanceOf(owner.address);
        const tx2 = await opinionMarket.connect(user3).submitAnswer(opinionId, secondAnswer);
        await tx2.wait();
        const ownerBalanceAfter2 = await usdc.balanceOf(owner.address);
        const platformFeeReceived2 = ownerBalanceAfter2 - ownerBalanceBefore2;

        const opinionAfter2 = await opinionMarket.opinions(opinionId);
        const price2 = opinionAfter2.lastPrice;
        const standardPlatformFee2 = (price2 * PLATFORM_FEE_PERCENT) / 100n;

        // The fee received should be higher than standard % due to rapid trade penalty
        expect(platformFeeReceived2).to.be.gt(standardPlatformFee2);
    });
});