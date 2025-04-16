// test/03_OpinionCreation.test.ts

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OpinionMarket, MockERC20 } from "../typechain-types";

describe("03: Opinion Creation", () => {
    // Type for our fixture return
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        user2: HardhatEthersSigner;
        admin: HardhatEthersSigner;
    };

    // Define the deployment fixture inline for this file
    async function deployFixture(): Promise<DeploymentFixture> {
        const [owner, user1, user2, admin] = await ethers.getSigners();

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
        for (const signer of [owner, user1, user2, admin]) {
            await usdc.mint(signer.address, amount);
            await usdc.connect(signer).approve(opinionMarketAddress, amount);
        }

        // Assign admin role
        const adminRole = await opinionMarket.ADMIN_ROLE();
        await opinionMarket.grantRole(adminRole, admin.address);

        return { opinionMarket, usdc, owner, user1, user2, admin };
    }

    // Declare variables to hold fixture results
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let admin: HardhatEthersSigner;
    let MINIMUM_PRICE: bigint;
    let MAX_QUESTION_LENGTH: bigint;
    let MAX_ANSWER_LENGTH: bigint;
    let MAX_LINK_LENGTH: bigint;
    let MAX_IPFS_HASH_LENGTH: bigint;
    let ADMIN_ROLE: string;

    // Load fixture before each test in this block
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;
        user1 = deployment.user1;
        user2 = deployment.user2;
        admin = deployment.admin;
        
        // Fetch constants
        MINIMUM_PRICE = await opinionMarket.MINIMUM_PRICE();
        MAX_QUESTION_LENGTH = await opinionMarket.MAX_QUESTION_LENGTH();
        MAX_ANSWER_LENGTH = await opinionMarket.MAX_ANSWER_LENGTH();
        MAX_LINK_LENGTH = await opinionMarket.MAX_LINK_LENGTH();
        MAX_IPFS_HASH_LENGTH = await opinionMarket.MAX_IPFS_HASH_LENGTH();
        ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
        
        // Enable public creation for most tests
        await opinionMarket.connect(admin).togglePublicCreation();
    });

    // --- Test Cases ---

    it("Should allow public creation when enabled", async () => {
        await expect(opinionMarket.connect(user1).createOpinion("Public Q?", "Public A"))
            .to.emit(opinionMarket, "OpinionCreated")
            .withArgs(1, "Public Q?", MINIMUM_PRICE, user1.address, "", ""); // ID 1
        const opinion = await opinionMarket.opinions(1);
        expect(opinion.creator).to.equal(user1.address);
        expect(opinion.lastPrice).to.equal(MINIMUM_PRICE);
    });

    it("Should create opinion with extras", async () => {
        const ipfs = "QmWmyoMoct5RR7c67KR6o5SVksL2dqGGuPA4141AGGh16u";
        const link = "http://example.com";
        await expect(opinionMarket.connect(user1).createOpinionWithExtras("Q Extras?", "A Extras", ipfs, link))
            .to.emit(opinionMarket, "OpinionCreated")
            .withArgs(1, "Q Extras?", MINIMUM_PRICE, user1.address, ipfs, link);
        const opinion = await opinionMarket.opinions(1);
        expect(opinion.ipfsHash).to.equal(ipfs);
        expect(opinion.link).to.equal(link);
    });

    it("Should reject creation with empty question", async () => {
        await expect(opinionMarket.connect(user1).createOpinion("", "Answer"))
            .to.be.revertedWithCustomError(opinionMarket, "EmptyString");
    });

    it("Should reject creation with question too long", async () => {
        const longQuestion = "a".repeat(Number(MAX_QUESTION_LENGTH) + 1);
        await expect(opinionMarket.connect(user1).createOpinion(longQuestion, "Answer"))
            .to.be.revertedWithCustomError(opinionMarket, "InvalidQuestionLength");
    });

    it("Should reject creation with answer too long", async () => {
        const longAnswer = "a".repeat(Number(MAX_ANSWER_LENGTH) + 1);
        await expect(opinionMarket.connect(user1).createOpinion("Valid Question?", longAnswer))
            .to.be.revertedWithCustomError(opinionMarket, "InvalidAnswerLength");
    });

    it("Should reject creation with ipfs hash too long", async () => {
        const longIpfs = "a".repeat(Number(MAX_IPFS_HASH_LENGTH) + 1);
        await expect(opinionMarket.connect(user1).createOpinionWithExtras("Valid Question?", "Valid Answer", longIpfs, ""))
            .to.be.revertedWithCustomError(opinionMarket, "InvalidIpfsHashLength");
    });

    it("Should reject creation with link too long", async () => {
        const longLink = "a".repeat(Number(MAX_LINK_LENGTH) + 1);
        await expect(opinionMarket.connect(user1).createOpinionWithExtras("Valid Question?", "Valid Answer", "", longLink))
            .to.be.revertedWithCustomError(opinionMarket, "InvalidLinkLength");
    });

    it("Should reject creation without allowance", async () => {
        await usdc.connect(user2).approve(await opinionMarket.getAddress(), 0); // Revoke approval
        await expect(opinionMarket.connect(user2).createOpinion("No Allowance Q?", "No A"))
            .to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
    });

    it("Should allow owner to create even when public creation is disabled", async () => {
        // Disable public creation
        await opinionMarket.connect(admin).togglePublicCreation();
        expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
        
        // Owner should still be able to create
        await expect(opinionMarket.connect(owner).createOpinion("Owner Q?", "Owner A"))
            .to.not.be.reverted;
    });

    it("Should properly increment nextOpinionId", async () => {
        const initialId = await opinionMarket.nextOpinionId();
        await opinionMarket.connect(user1).createOpinion("First Q?", "First A");
        expect(await opinionMarket.nextOpinionId()).to.equal(initialId + 1n);
        
        await opinionMarket.connect(user1).createOpinion("Second Q?", "Second A");
        expect(await opinionMarket.nextOpinionId()).to.equal(initialId + 2n);
    });
});