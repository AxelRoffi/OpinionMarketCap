// test/00_DeployInit.test.ts

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OpinionMarket, MockERC20 } from "../typechain-types"; // Adjust path if needed

describe("00: Deployment & Initialization", () => {
    // Type for our fixture return
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner; // Include another user for context, though not strictly needed here
    };

    // Define the deployment fixture inline for this file
    async function deployFixture(): Promise<DeploymentFixture> {
        const [owner, user1] = await ethers.getSigners();

        // Deploy MockUSDC
        // Assumes MockERC20.sol is in contracts/ and compiled
        const MockERC20Factory = await ethers.getContractFactory("MockERC20", owner);
        const usdc = await MockERC20Factory.deploy("Mock USDC", "mUSDC");
        const usdcAddress = await usdc.getAddress();

        // Deploy OpinionMarket through proxy
        // Assumes OpinionMarket.sol is in contracts/ and compiled
        const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket", owner);
        const opinionMarket = await upgrades.deployProxy(
            OpinionMarketFactory,
            [usdcAddress], // Args for initialize function
            { initializer: "initialize", kind: "uups" }
        ) as unknown as OpinionMarket;
        const opinionMarketAddress = await opinionMarket.getAddress();

        // Mint some mock USDC for the owner for potential future interactions
        // (Not strictly needed for init tests, but good practice)
        const initialMintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
        await usdc.mint(owner.address, initialMintAmount);
        // Approve the market contract to spend owner's USDC (important for later tests)
        await usdc.connect(owner).approve(opinionMarketAddress, initialMintAmount);

        return { opinionMarket, usdc, owner, user1 };
    }

    // Declare variables to hold fixture results
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner;
    let DEFAULT_ADMIN_ROLE: string;
    let ADMIN_ROLE: string;
    let MODERATOR_ROLE: string;
    let OPERATOR_ROLE: string;
    let TREASURY_ROLE: string;

    // Load fixture and fetch roles before each test in this block
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;

        // Fetch role identifiers directly from the contract
        DEFAULT_ADMIN_ROLE = await opinionMarket.DEFAULT_ADMIN_ROLE();
        ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
        MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
        OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
        TREASURY_ROLE = await opinionMarket.TREASURY_ROLE();
    });

    // --- Test Cases ---

    it("Should set the deployer as the owner", async () => {
        expect(await opinionMarket.owner()).to.equal(owner.address);
    });

    it("Should set the correct USDC token address during initialization", async () => {
        expect(await opinionMarket.usdcToken()).to.equal(await usdc.getAddress());
    });

    it("Should initialize nextOpinionId to 1", async () => {
        expect(await opinionMarket.nextOpinionId()).to.equal(1n); // Use 1n for bigint comparison
    });

    it("Should initialize poolCount to 0", async () => {
        expect(await opinionMarket.poolCount()).to.equal(0n); // Use 0n for bigint comparison
    });

    it("Should initialize as unpaused", async () => {
        expect(await opinionMarket.paused()).to.be.false;
    });

    it("Should initialize public creation as disabled", async () => {
        expect(await opinionMarket.isPublicCreationEnabled()).to.be.false;
    });

    it("Should grant DEFAULT_ADMIN_ROLE to the deployer", async () => {
        expect(await opinionMarket.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant ADMIN_ROLE to the deployer", async () => {
        expect(await opinionMarket.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant MODERATOR_ROLE to the deployer", async () => {
        expect(await opinionMarket.hasRole(MODERATOR_ROLE, owner.address)).to.be.true;
    });

    it("Should grant OPERATOR_ROLE to the deployer", async () => {
        expect(await opinionMarket.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
    });

    it("Should grant TREASURY_ROLE to the deployer", async () => {
        expect(await opinionMarket.hasRole(TREASURY_ROLE, owner.address)).to.be.true;
    });

    it("Should prevent re-initialization", async () => {
        // Try calling initialize again directly on the implementation (or proxy if possible)
        // This often requires getting the implementation address first if testing via proxy
        // Or just check if the Initializable error is thrown
        // Note: Direct re-init call might fail differently depending on proxy setup
         await expect(opinionMarket.initialize(await usdc.getAddress()))
            .to.be.revertedWith("Initializable: contract is already initialized"); // Standard OZ error
    });
});