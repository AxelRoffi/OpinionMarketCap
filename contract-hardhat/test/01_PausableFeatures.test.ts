import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OpinionMarket, MockERC20 } from "../typechain-types";

describe("01: Pausable Functionality", () => {
    // Type for our fixture return
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        operator: HardhatEthersSigner;
    };

    // Define the deployment fixture inline for this file
    async function deployFixture(): Promise<DeploymentFixture> {
        const [owner, user1, operator] = await ethers.getSigners();

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
        for (const signer of [owner, user1, operator]) {
            await usdc.mint(signer.address, initialMintAmount);
            await usdc.connect(signer).approve(opinionMarketAddress, initialMintAmount);
        }

        // Grant OPERATOR role to our operator account
        const OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
        await opinionMarket.grantRole(OPERATOR_ROLE, operator.address);

        return { opinionMarket, usdc, owner, user1, operator };
    }

    // Declare variables to hold fixture results
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let operator: HardhatEthersSigner;
    let OPERATOR_ROLE: string;

    // Load fixture before each test in this block
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;
        user1 = deployment.user1;
        operator = deployment.operator;
        
        // Fetch role identifier
        OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
    });

    // --- Test Cases ---

    it("Should allow OPERATOR to pause", async () => {
        await expect(opinionMarket.connect(operator).pause()).to.not.be.reverted;
        expect(await opinionMarket.paused()).to.be.true;
    });

    it("Should prevent non-OPERATOR from pausing", async () => {
        await expect(opinionMarket.connect(user1).pause())
            .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
            .withArgs(user1.address, OPERATOR_ROLE);
    });

    it("Should prevent actions when paused", async () => {
        await opinionMarket.connect(operator).pause();
        
        // Enable public creation first so user1 can try to create an opinion
        await opinionMarket.connect(owner).togglePublicCreation();
        
        await expect(opinionMarket.connect(user1).createOpinion("Paused?", "No"))
            .to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
        
        await expect(opinionMarket.connect(user1).claimAccumulatedFees())
            .to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
    });

    it("Should allow OPERATOR to unpause", async () => {
        // Pause first
        await opinionMarket.connect(operator).pause();
        expect(await opinionMarket.paused()).to.be.true;
        
        // Then unpause
        await expect(opinionMarket.connect(operator).unpause()).to.not.be.reverted;
        expect(await opinionMarket.paused()).to.be.false;
    });

    it("Should prevent non-OPERATOR from unpausing", async () => {
        // Pause first
        await opinionMarket.connect(operator).pause();
        
        await expect(opinionMarket.connect(user1).unpause())
            .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
            .withArgs(user1.address, OPERATOR_ROLE);
    });
});