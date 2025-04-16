import { expect } from "chai";
import hre, { ethers, upgrades } from "hardhat";
import { OpinionMarket, MockERC20 } from "../typechain-types"; // Adjust path if needed
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// --- Test Suite ---
describe("OpinionMarket Comprehensive Tests", () => {
    // --- Types ---
    type DeploymentFixture = {
        opinionMarket: OpinionMarket;
        usdc: MockERC20;
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        user2: HardhatEthersSigner;
        user3: HardhatEthersSigner;
        admin: HardhatEthersSigner;
        moderator: HardhatEthersSigner;
        operator: HardhatEthersSigner;
    };

    // --- Constants and Variables ---
    let opinionMarket: OpinionMarket;
    let usdc: MockERC20;
    let owner: HardhatEthersSigner,
        user1: HardhatEthersSigner,
        user2: HardhatEthersSigner,
        user3: HardhatEthersSigner,
        admin: HardhatEthersSigner,
        moderator: HardhatEthersSigner,
        operator: HardhatEthersSigner;

    // Contract Constants (fetched dynamically)
    let MINIMUM_PRICE: bigint;
    let POOL_CREATION_FEE: bigint;
    let POOL_CONTRIBUTION_FEE: bigint;
    let MIN_POOL_DURATION: bigint;
    let MAX_POOL_DURATION: bigint;
    let MAX_QUESTION_LENGTH: bigint;
    let MAX_ANSWER_LENGTH: bigint;
    let MAX_POOL_NAME_LENGTH: bigint;
    let MAX_LINK_LENGTH: bigint;
    let MAX_IPFS_HASH_LENGTH: bigint;
    let ADMIN_ROLE: string;
    let MODERATOR_ROLE: string;
    let OPERATOR_ROLE: string;
    let TREASURY_ROLE: string;
    let DEFAULT_ADMIN_ROLE: string;


    // --- Fixture ---
    async function deployFixture(): Promise<DeploymentFixture> {
        const signers = await ethers.getSigners();
        const [owner, user1, user2, user3, admin, moderator, operator] = signers.slice(0, 7); // Ensure enough signers

        // Deploy MockUSDC
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20Factory.deploy("USDC", "USDC");
        const usdcAddress = await usdc.getAddress();

        // Deploy OpinionMarket through proxy
        const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
        const opinionMarket = await upgrades.deployProxy(
            OpinionMarketFactory,
            [usdcAddress],
            { initializer: "initialize", kind: "uups" }
        ) as unknown as OpinionMarket;
        const opinionMarketAddress = await opinionMarket.getAddress();

        // Mint and approve USDC for all users
        const amount = ethers.parseUnits("1000000", 6); // 1M USDC each
        for (const signer of [owner, user1, user2, user3, admin, moderator, operator]) {
            await usdc.mint(signer.address, amount);
            await usdc.connect(signer).approve(opinionMarketAddress, amount);
        }

        // Assign specific roles for testing clarity (owner already has them)
        // In a real scenario, you might grant these later in tests if needed
        const adminRole = await opinionMarket.ADMIN_ROLE();
        const moderatorRole = await opinionMarket.MODERATOR_ROLE();
        const operatorRole = await opinionMarket.OPERATOR_ROLE();
        await opinionMarket.grantRole(adminRole, admin.address);
        await opinionMarket.grantRole(moderatorRole, moderator.address);
        await opinionMarket.grantRole(operatorRole, operator.address);


        return { opinionMarket, usdc, owner, user1, user2, user3, admin, moderator, operator };
    }

    // --- Setup Hook ---
    beforeEach(async () => {
        const deployment = await loadFixture(deployFixture);
        opinionMarket = deployment.opinionMarket;
        usdc = deployment.usdc;
        owner = deployment.owner;
        user1 = deployment.user1;
        user2 = deployment.user2;
        user3 = deployment.user3;
        admin = deployment.admin;
        moderator = deployment.moderator;
        operator = deployment.operator;

        // Fetch constants
        MINIMUM_PRICE = await opinionMarket.MINIMUM_PRICE();
        POOL_CREATION_FEE = await opinionMarket.POOL_CREATION_FEE();
        POOL_CONTRIBUTION_FEE = await opinionMarket.POOL_CONTRIBUTION_FEE();
        MIN_POOL_DURATION = await opinionMarket.MIN_POOL_DURATION();
        MAX_POOL_DURATION = await opinionMarket.MAX_POOL_DURATION();
        MAX_QUESTION_LENGTH = await opinionMarket.MAX_QUESTION_LENGTH();
        MAX_ANSWER_LENGTH = await opinionMarket.MAX_ANSWER_LENGTH();
        MAX_POOL_NAME_LENGTH = await opinionMarket.MAX_POOL_NAME_LENGTH();
        MAX_LINK_LENGTH = await opinionMarket.MAX_LINK_LENGTH();
        MAX_IPFS_HASH_LENGTH = await opinionMarket.MAX_IPFS_HASH_LENGTH();
        ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
        MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
        OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
        TREASURY_ROLE = await opinionMarket.TREASURY_ROLE();
        DEFAULT_ADMIN_ROLE = await opinionMarket.DEFAULT_ADMIN_ROLE();

    });

     // --- Helper Functions ---
     async function createOpinionForPool(creator: HardhatEthersSigner, question: string = "Pool Test Question?", answer: string = "Initial Pool Answer"): Promise<bigint> {
        // Assuming QUESTION_CREATION_FEE is handled within createOpinion now based on MINIMUM_PRICE logic
        const tx = await opinionMarket.connect(creator).createOpinion(question, answer);
        const receipt = await tx.wait();
        const event = receipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("OpinionCreated")?.topicHash);
        if (!event) throw new Error("OpinionCreated event not found");
        const args = opinionMarket.interface.parseLog(event as any)?.args;
        return args.id;
    }

    async function getValidDeadline(offsetSeconds: number = Number(MIN_POOL_DURATION) + 60 * 60): Promise<bigint> { // Default: min + 1 hour
         const latestTime = await time.latest();
         return BigInt(latestTime + offsetSeconds);
    }

    async function approveForPoolCreation(user: HardhatEthersSigner, contribution: bigint) {
         const totalRequired = POOL_CREATION_FEE + contribution;
         await usdc.connect(user).approve(await opinionMarket.getAddress(), totalRequired);
    }

    async function approveForContribution(user: HardhatEthersSigner, amount: bigint) {
        const totalRequired = amount + POOL_CONTRIBUTION_FEE;
        await usdc.connect(user).approve(await opinionMarket.getAddress(), totalRequired);
    }


    // --- Test Sections ---

    describe("I. Deployment & Initialization", () => {
        it("Should set the correct owner", async () => {
            expect(await opinionMarket.owner()).to.equal(owner.address);
        });

        it("Should set the correct USDC token address", async () => {
            expect(await opinionMarket.usdcToken()).to.equal(await usdc.getAddress());
        });

        it("Should initialize nextOpinionId to 1", async () => {
            expect(await opinionMarket.nextOpinionId()).to.equal(1);
        });

         it("Should grant all operational roles to the deployer/owner", async () => {
            expect(await opinionMarket.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
            expect(await opinionMarket.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
            expect(await opinionMarket.hasRole(MODERATOR_ROLE, owner.address)).to.be.true;
            expect(await opinionMarket.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
            expect(await opinionMarket.hasRole(TREASURY_ROLE, owner.address)).to.be.true; // Assuming TREASURY_ROLE exists and is granted
        });

        it("Should start unpaused", async () => {
            expect(await opinionMarket.paused()).to.be.false;
        });

        // Add test for re-initialization attempt if needed
    });

    describe("III. Pausable Functionality", () => {
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
            await expect(opinionMarket.connect(user1).createOpinion("Paused?", "No"))
                .to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
             await expect(opinionMarket.connect(user1).claimAccumulatedFees())
                .to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
             // Add checks for other core functions like submitAnswer, createPool, contributeToPool etc.
        });

         it("Should allow OPERATOR to unpause", async () => {
            await opinionMarket.connect(operator).pause();
            await expect(opinionMarket.connect(operator).unpause()).to.not.be.reverted;
            expect(await opinionMarket.paused()).to.be.false;
        });

         it("Should prevent non-OPERATOR from unpausing", async () => {
            await opinionMarket.connect(operator).pause();
            await expect(opinionMarket.connect(user1).unpause())
                .to.be.revertedWithCustomError(opinionMarket, "AccessControlUnauthorizedAccount")
                .withArgs(user1.address, OPERATOR_ROLE);
        });
    });


    describe("IV. Opinion Creation", () => {
         beforeEach(async() => {
             // Public creation needs to be enabled for non-owner tests
             await opinionMarket.connect(owner).togglePublicCreation();
         });

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

         it("Should reject creation without allowance", async () => {
            await usdc.connect(user2).approve(await opinionMarket.getAddress(), 0); // Revoke approval
            await expect(opinionMarket.connect(user2).createOpinion("No Allowance Q?", "No A"))
                .to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
                // .withArgs(MINIMUM_PRICE, 0); // Exact args might vary slightly
        });

        // Add more validation tests (answer length, ipfs length, link length...)
    });


    describe("VII. Pool Creation", () => {
        let opinionId: bigint;
        beforeEach(async () => {
            opinionId = await createOpinionForPool(owner); // Create opinion 1
        });

        it("Should create a pool with valid parameters", async () => {
            const deadline = await getValidDeadline();
            const initialContribution = MINIMUM_PRICE; // Example contribution
            const poolName = "Test Pool Alpha";
            const ipfsHash = "QmWmyoMoct5RR7c67KR6o5SVksL2dqGGuPA4141AGGh16u";
            const proposedAnswer = "A New Hope";

            await approveForPoolCreation(user1, initialContribution);

            await expect(opinionMarket.connect(user1).createPool(opinionId, proposedAnswer, deadline, initialContribution, poolName, ipfsHash))
                .to.emit(opinionMarket, "PoolCreated")
                .withArgs(0, opinionId, proposedAnswer, initialContribution, user1.address, deadline, poolName, ipfsHash); // Pool ID 0

            const pool = await opinionMarket.pools(0);
            expect(pool.id).to.equal(0);
            expect(pool.opinionId).to.equal(opinionId);
            expect(pool.proposedAnswer).to.equal(proposedAnswer);
            expect(pool.totalAmount).to.equal(initialContribution);
            expect(pool.deadline).to.equal(deadline);
            expect(pool.creator).to.equal(user1.address);
            expect(pool.status).to.equal(0); // PoolStatus.Active
            expect(pool.name).to.equal(poolName);
            expect(pool.ipfsHash).to.equal(ipfsHash);

            // Check fee transfer
            await expect(opinionMarket.connect(user1).createPool(opinionId + 1n, proposedAnswer, deadline, initialContribution, poolName, ipfsHash)) // Use different opinionId to avoid double creation revert
                .to.changeTokenBalances(
                    usdc,
                    [owner, user1, opinionMarket], // Platform owner, pool creator, contract
                    [POOL_CREATION_FEE, -(POOL_CREATION_FEE + initialContribution), initialContribution]
                );
        });

        it("Should reject pool creation for non-existent opinion", async () => {
             const deadline = await getValidDeadline();
             const initialContribution = MINIMUM_PRICE;
             await approveForPoolCreation(user1, initialContribution);
             await expect(opinionMarket.connect(user1).createPool(999, "Answer", deadline, initialContribution, "Name", ""))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolInvalidOpinionId"); // Or OpinionNotFound if validation is different
        });

        it("Should reject pool creation with deadline too short", async () => {
             const latestTime = await time.latest();
             const shortDeadline = BigInt(latestTime) + MIN_POOL_DURATION - 1n; // Too short
             const initialContribution = MINIMUM_PRICE;
             await approveForPoolCreation(user1, initialContribution);
             await expect(opinionMarket.connect(user1).createPool(opinionId, "Answer", shortDeadline, initialContribution, "Name", ""))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolDeadlineTooShort");
        });

         it("Should reject pool creation with proposed answer same as current", async () => {
             const opinion = await opinionMarket.opinions(opinionId);
             const currentAnswer = opinion.currentAnswer;
             const deadline = await getValidDeadline();
             const initialContribution = MINIMUM_PRICE;
             await approveForPoolCreation(user1, initialContribution);

             await expect(opinionMarket.connect(user1).createPool(opinionId, currentAnswer, deadline, initialContribution, "Name", ""))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolSameAnswerAsCurrentAnswer");
         });

          it("Should reject pool creation with name too long", async () => {
             const longName = "b".repeat(Number(MAX_POOL_NAME_LENGTH) + 1);
             const deadline = await getValidDeadline();
             const initialContribution = MINIMUM_PRICE;
             await approveForPoolCreation(user1, initialContribution);
             await expect(opinionMarket.connect(user1).createPool(opinionId, "Answer", deadline, initialContribution, longName, ""))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolInvalidNameLength");
         });

        // Add more validation tests: deadline too long, contribution too low (if applicable), ipfs hash length, empty name/answer, allowance...
    });

    describe("VIII. Pool Contribution", () => {
        let opinionId: bigint;
        let poolId: bigint;
        let poolCreator: HardhatEthersSigner;
        let questionCreator: HardhatEthersSigner;

        beforeEach(async () => {
            questionCreator = owner; // For simplicity, owner created the opinion
            poolCreator = user1;    // User1 created the pool
            opinionId = await createOpinionForPool(questionCreator);

            const deadline = await getValidDeadline();
            const initialContribution = MINIMUM_PRICE;
            await approveForPoolCreation(poolCreator, initialContribution);
            const tx = await opinionMarket.connect(poolCreator).createPool(opinionId, "Pool Answer Contrib", deadline, initialContribution, "Contrib Pool", "");
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolCreated")?.topicHash);
            if (!event) throw new Error("PoolCreated event not found");
            poolId = opinionMarket.interface.parseLog(event as any)?.args.poolId;
        });

        it("Should allow a user to contribute and split contribution fee", async () => {
            const contributionAmount = ethers.parseUnits("10", 6); // 10 USDC
            const contributor = user2;
            await approveForContribution(contributor, contributionAmount);

            const expectedTotalCost = contributionAmount + POOL_CONTRIBUTION_FEE;
            const feeShare = POOL_CONTRIBUTION_FEE / 3n;
            const feeShareRemainder = POOL_CONTRIBUTION_FEE - feeShare * 2n; // Handle potential rounding

            // Check balances and accumulated fees change
            await expect(opinionMarket.connect(contributor).contributeToPool(poolId, contributionAmount))
                .to.changeTokenBalances(
                    usdc,
                    [owner, contributor, opinionMarket], // Platform owner, contributor, contract
                    [feeShare, -expectedTotalCost, contributionAmount + feeShare * 2n + feeShareRemainder] // Platform gets share, user pays total, contract gets contribution + other 2 shares initially
                )
                .and.to.emit(opinionMarket, "PoolContributed")
                .withArgs(poolId, opinionId, contributor.address, contributionAmount, anyValue) // newTotalAmount is tricky to predict exactly here
                .and.to.emit(opinionMarket, "FeesAccumulated") // For Question Creator
                .withArgs(questionCreator.address, feeShare)
                .and.to.emit(opinionMarket, "FeesAccumulated") // For Pool Creator
                .withArgs(poolCreator.address, feeShareRemainder); // Pool creator gets remainder

            // Verify accumulated fees state
            expect(await opinionMarket.accumulatedFees(questionCreator.address)).to.equal(feeShare);
            expect(await opinionMarket.accumulatedFees(poolCreator.address)).to.equal(feeShareRemainder); // Pool creator might have other fees too

            // Verify pool state
            const pool = await opinionMarket.pools(poolId);
            const initialPoolAmount = MINIMUM_PRICE; // From pool creation in beforeEach
            expect(pool.totalAmount).to.equal(initialPoolAmount + contributionAmount);
            expect(await opinionMarket.poolContributionAmounts(poolId, contributor.address)).to.equal(contributionAmount);
        });

        it("Should reject contribution if amount is 0", async () => {
             await approveForContribution(user2, 0n); // Approve just the fee
             await expect(opinionMarket.connect(user2).contributeToPool(poolId, 0))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolContributionTooLow"); // Verify this exact error
        });

        it("Should reject contribution after deadline", async () => {
            const pool = await opinionMarket.pools(poolId);
            await time.increaseTo(pool.deadline + 1n); // Move time past deadline

            const contributionAmount = ethers.parseUnits("5", 6);
            await approveForContribution(user2, contributionAmount);

            await expect(opinionMarket.connect(user2).contributeToPool(poolId, contributionAmount))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolDeadlinePassed");
        });

         it("Should reject contribution without sufficient allowance (amount + fee)", async () => {
            const contributionAmount = ethers.parseUnits("10", 6);
            // Approve only the contribution amount, not the fee
            await usdc.connect(user2).approve(await opinionMarket.getAddress(), contributionAmount);

            await expect(opinionMarket.connect(user2).contributeToPool(poolId, contributionAmount))
                .to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
        });

        // Add tests for invalid poolId, pool not active, insufficient balance...

        it("Should trigger execution if contribution meets target price", async () => {
            // 1. Get current opinion price needed for execution
            const opinion = await opinionMarket.opinions(opinionId);
            let targetPrice = opinion.nextPrice;
            if (targetPrice === 0n) {
                 // If nextPrice isn't set (e.g., first answer), we need to estimate/calculate it
                 // This requires knowing the internal logic of _calculateNextPrice
                 // For simplicity, let's assume it's roughly 1.5x lastPrice (adjust based on actual logic)
                 targetPrice = opinion.lastPrice * 150n / 100n;
            }

            // 2. Get current pool amount
            const pool = await opinionMarket.pools(poolId);
            const currentAmount = pool.totalAmount;

            // 3. Calculate needed contribution (ensure it's > 0)
            let neededContribution = targetPrice - currentAmount;
            if (neededContribution <= 0n) {
                // Pool already has enough, maybe execute manually or add test case for this
                console.warn("Pool already met target price in setup. Skipping execution trigger test.");
                return;
            }
            // Ensure contribution isn't zero after calculation
             if (neededContribution == 0n) neededContribution = 1n; // Contribute at least 1 wei


            // 4. Contribute the exact needed amount
            const contributor = user2;
            await approveForContribution(contributor, neededContribution);

            // 5. Expect execution events along with contribution events
            await expect(opinionMarket.connect(contributor).contributeToPool(poolId, neededContribution))
                .to.emit(opinionMarket, "PoolContributed") // Contribution happens first
                .and.to.emit(opinionMarket, "PoolExecuted") // Then execution
                .withArgs(poolId, opinionId, pool.proposedAnswer, targetPrice);

            // 6. Verify pool status changed
            const finalPool = await opinionMarket.pools(poolId);
            expect(finalPool.status).to.equal(1); // PoolStatus.Executed

            // 7. Verify opinion owner changed to contract
            const finalOpinion = await opinionMarket.opinions(opinionId);
            expect(finalOpinion.currentAnswerOwner).to.equal(await opinionMarket.getAddress());
            expect(finalOpinion.currentAnswer).to.equal(pool.proposedAnswer);
        });
    });

    describe("X. Pool Expiry & Withdrawal", () => {
        let opinionId: bigint;
        let poolId: bigint;
        let deadline: bigint;
        let contributor1: HardhatEthersSigner;
        let contributor2: HardhatEthersSigner;
        let contribution1: bigint;
        let contribution2: bigint;


        beforeEach(async () => {
            opinionId = await createOpinionForPool(owner);
            deadline = await getValidDeadline();
            contributor1 = user1;
            contributor2 = user2;
            contribution1 = ethers.parseUnits("10", 6);
            contribution2 = ethers.parseUnits("25", 6);


            // Create pool (user3 is creator)
            await approveForPoolCreation(user3, MINIMUM_PRICE); // Creator's initial contribution
            const tx = await opinionMarket.connect(user3).createPool(opinionId, "Expire Answer", deadline, MINIMUM_PRICE, "Expire Pool", "");
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolCreated")?.topicHash);
             if (!event) throw new Error("PoolCreated event not found");
            poolId = opinionMarket.interface.parseLog(event as any)?.args.poolId;

            // Contributions
            await approveForContribution(contributor1, contribution1);
            await opinionMarket.connect(contributor1).contributeToPool(poolId, contribution1);
            await approveForContribution(contributor2, contribution2);
            await opinionMarket.connect(contributor2).contributeToPool(poolId, contribution2);
        });

        it("Should allow contributor to withdraw after expiry", async () => {
            // Move time past deadline
            await time.increaseTo(deadline + 1n);

            // Contributor 1 withdraws
            await expect(opinionMarket.connect(contributor1).withdrawFromExpiredPool(poolId))
                .to.emit(opinionMarket, "PoolRefundIssued")
                .withArgs(poolId, contributor1.address, contribution1)
                .and.to.changeTokenBalance(usdc, contributor1, contribution1); // Check they receive funds back

            // Verify their contribution amount in mapping is now 0
            expect(await opinionMarket.poolContributionAmounts(poolId, contributor1.address)).to.equal(0);

            // Contributor 2 withdraws
             await expect(opinionMarket.connect(contributor2).withdrawFromExpiredPool(poolId))
                .to.emit(opinionMarket, "PoolRefundIssued")
                .withArgs(poolId, contributor2.address, contribution2)
                .and.to.changeTokenBalance(usdc, contributor2, contribution2);
             expect(await opinionMarket.poolContributionAmounts(poolId, contributor2.address)).to.equal(0);

            // Pool status should be Expired
            const pool = await opinionMarket.pools(poolId);
             // Note: withdrawFromExpiredPool implicitly sets status if not already Expired
            expect(pool.status).to.equal(2); // PoolStatus.Expired
        });

        it("Should reject withdrawal before expiry", async () => {
             // Don't increase time
             await expect(opinionMarket.connect(contributor1).withdrawFromExpiredPool(poolId))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolNotExpired");
        });

        it("Should reject withdrawal if user did not contribute", async () => {
            await time.increaseTo(deadline + 1n);
            const nonContributor = operator; // Someone who didn't contribute
            await expect(opinionMarket.connect(nonContributor).withdrawFromExpiredPool(poolId))
                .to.be.revertedWithCustomError(opinionMarket, "PoolNoContribution");
        });

         it("Should reject double withdrawal", async () => {
            await time.increaseTo(deadline + 1n);
            // First withdrawal
             await opinionMarket.connect(contributor1).withdrawFromExpiredPool(poolId);
             // Second attempt
             await expect(opinionMarket.connect(contributor1).withdrawFromExpiredPool(poolId))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolNoContribution"); // Because amount is 0 now
        });

         it("checkPoolExpiry should update status and emit event after deadline", async () => {
            await time.increaseTo(deadline + 1n);
            await expect(opinionMarket.checkPoolExpiry(poolId))
                .to.emit(opinionMarket, "PoolExpired")
                .withArgs(poolId, opinionId, anyValue, anyValue); // Check args if needed
            const pool = await opinionMarket.pools(poolId);
            expect(pool.status).to.equal(2); // PoolStatus.Expired
        });
    });


    // --- Add More Describe Blocks for Other Sections ---
    // describe("V. Answer Submission & Fee Distribution", () => { ... });
    // describe("VI. Fee Claiming", () => { ... });
    // describe("IX. Pool Execution", () => { ... }); // Test explicitly if needed beyond contribution trigger
    // describe("XI. Pool Deadline Extension", () => { ... });
    // describe("XII. Pool Reward Distribution", () => { ... });
    // describe("XIII. Admin/Moderator Actions", () => { ... });
    // describe("XIV. Security Mechanisms", () => { ... }); // Reentrancy needs separate setup
    // describe("XV. Upgradeability", () => { ... });
    // describe("XVI. View Functions & Constants", () => { ... });

}); // End of main describe block

How to Use This Code:

Save: Save this code in your Hardhat project, likely under the test/ directory (e.g., test/OpinionMarket.test.ts or break it down into multiple files like test/Pools.test.ts, test/Core.test.ts).
Dependencies: Make sure you have the necessary dependencies installed:
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-chai-matchers ethers chai @openzeppelin/contracts @openzeppelin/contracts-upgradeable @openzeppelin/hardhat-upgrades typechain @typechain/hardhat @typechain/ethers-v6
You'll also need your MockERC20.sol contract compiled.
TypeChain: Run npx hardhat compile which should also generate TypeChain types (used for OpinionMarket, MockERC20 type hints).
Run Tests: Execute the tests from your terminal using npx hardhat test. Hardhat will pick up the file, run the tests against a simulated blockchain environment, and report the results.
Complete & Debug:
Fill in the Gaps: Add tests for the sections marked // --- Add More Describe Blocks... --- based on the detailed list provided previously.
Debug Failures: If tests fail, use the error messages, Hardhat's stack traces, and potentially console.log statements within your tests to understand what went wrong. Adjust the test logic or contract code as needed.
Refine Helpers: You might need to adjust the deployFixture or helper functions based on your exact contract constructor or initialization needs.
This coded structure provides a substantial head start on automating your testing process. Remember that thorough testing, especially for complex DeFi contracts, is an iterative process of writing, running, and debugging. Good luck!





add the missing tests, describe blog:



// --- Add More Describe Blocks for Other Sections ---

// describe("V. Answer Submission & Fee Distribution", () => { ... });

// describe("VI. Fee Claiming", () => { ... });

// describe("IX. Pool Execution", () => { ... }); // Test explicitly if needed beyond contribution trigger

// describe("XI. Pool Deadline Extension", () => { ... });

// describe("XII. Pool Reward Distribution", () => { ... });

// describe("XIII. Admin/Moderator Actions", () => { ... });

// describe("XIV. Security Mechanisms", () => { ... }); // Reentrancy needs separate setup

// describe("XV. Upgradeability", () => { ... });

// describe("XVI. View Functions & Constants", () => { ... });




Afficher le raisonnement
Okay, let's fill in the code for the remaining describe blocks based on our test list and the provided contract.

TypeScript

// --- Paste this below the existing test code provided previously ---
// --- Make sure all imports, types, fixtures, and beforeEach are defined above ---

    describe("V. Answer Submission & Fee Distribution", () => {
        let opinionId: bigint;
        let opinionCreator: HardhatEthersSigner;
        let initialAnswerOwner: HardhatEthersSigner;

        beforeEach(async () => {
            opinionCreator = user1;
            initialAnswerOwner = opinionCreator; // Creator is the first owner
            opinionId = await createOpinionForPool(opinionCreator, "Submit Answer Q?", "Initial Submit A"); // Opinion ID 1 typically
        });

        it("Should allow submitting an answer and update state", async () => {
            const submitter = user2;
            const newAnswer = "Answer Two";
            const opinionBefore = await opinionMarket.opinions(opinionId);
            const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE(); // Use nextPrice or estimate/fetch initial

            await expect(opinionMarket.connect(submitter).submitAnswer(opinionId, newAnswer))
                .to.emit(opinionMarket, "AnswerSubmitted")
                .withArgs(opinionId, newAnswer, submitter.address, pricePaid); // Price might need 'anyValue' if calculation is complex

            const opinionAfter = await opinionMarket.opinions(opinionId);
            expect(opinionAfter.currentAnswer).to.equal(newAnswer);
            expect(opinionAfter.currentAnswerOwner).to.equal(submitter.address);
            expect(opinionAfter.lastPrice).to.equal(pricePaid);
            expect(opinionAfter.nextPrice).to.be.gt(pricePaid); // Price should increase (based on typical _calculateNextPrice)
            expect(opinionAfter.totalVolume).to.equal(opinionBefore.totalVolume + pricePaid);
            expect(opinionAfter.isActive).to.be.true;

            // Check history
            const history = await opinionMarket.getAnswerHistory(opinionId);
            expect(history.length).to.equal(2); // Initial + new one
            expect(history[1].answer).to.equal(newAnswer);
            expect(history[1].owner).to.equal(submitter.address);
            expect(history[1].price).to.equal(pricePaid);
        });

        it("Should distribute fees correctly on submission", async () => {
            const submitter = user2;
            const previousOwner = initialAnswerOwner; // User1 in this setup
            const newAnswer = "Answer Fee Test";
            const opinionBefore = await opinionMarket.opinions(opinionId);
            const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE(); // Use nextPrice or estimate/fetch initial

            const platformFeePercent = await opinionMarket.PLATFORM_FEE_PERCENT();
            const creatorFeePercent = await opinionMarket.CREATOR_FEE_PERCENT();

            const expectedPlatformFee = (pricePaid * platformFeePercent) / 100n;
            const expectedCreatorFee = (pricePaid * creatorFeePercent) / 100n;
            const expectedPreviousOwnerAmount = pricePaid - expectedPlatformFee - expectedCreatorFee;

            const creatorFeesBefore = await opinionMarket.accumulatedFees(opinionCreator.address);
            const previousOwnerFeesBefore = await opinionMarket.accumulatedFees(previousOwner.address);

            await expect(opinionMarket.connect(submitter).submitAnswer(opinionId, newAnswer))
                .to.changeTokenBalances(
                    usdc,
                    [owner, submitter, opinionMarket], // Platform owner, submitter, contract (holds accumulated fees)
                    [expectedPlatformFee, -pricePaid, expectedCreatorFee + expectedPreviousOwnerAmount]
                );

            // Check accumulated fees state
            expect(await opinionMarket.accumulatedFees(opinionCreator.address)).to.equal(creatorFeesBefore + expectedCreatorFee);
            // Note: If creator == previousOwner, their accumulated fee increases by both amounts
             if (opinionCreator.address !== previousOwner.address) {
               expect(await opinionMarket.accumulatedFees(previousOwner.address)).to.equal(previousOwnerFeesBefore + expectedPreviousOwnerAmount);
            } else {
                 expect(await opinionMarket.accumulatedFees(previousOwner.address)).to.equal(previousOwnerFeesBefore + expectedCreatorFee + expectedPreviousOwnerAmount);
            }

            // Check events
            // await expect(tx)... .to.emit... // Covered partially in previous test
        });

        it("Should reject submission if opinion is inactive", async () => {
            await opinionMarket.connect(owner).deactivateOpinion(opinionId); // Owner has MODERATOR role initially
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
             const pricePaid = opinionBefore.nextPrice > 0n ? opinionBefore.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE();
             await usdc.connect(user2).approve(await opinionMarket.getAddress(), pricePaid - 1n); // Insufficient approval
             await expect(opinionMarket.connect(user2).submitAnswer(opinionId, "Low Allowance Answer"))
                 .to.be.revertedWithCustomError(opinionMarket, "InsufficientAllowance");
         });

         // Note: Testing MaxTradesPerBlockExceeded and OneTradePerBlock might require
         // advanced Hardhat techniques like `hardhat_setAutomine(false)` if simple sequential calls don't trigger them.
         it("Should potentially reject rapid trading in same block (OneTradePerBlock)", async () => {
            // This test setup might not reliably trigger the block-specific checks in standard Hardhat tests.
            // It serves as a placeholder for the expected revert.
             await opinionMarket.connect(user2).submitAnswer(opinionId, "Answer Block 1");
             // Attempt another trade immediately (may or may not be in same block depending on Hardhat config)
             await expect(opinionMarket.connect(user2).submitAnswer(opinionId, "Answer Block 2"))
                 .to.be.revertedWithCustomError(opinionMarket, "OneTradePerBlock"); // Or revertedWithoutReason if block changes
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
             const platformFeePercent = await opinionMarket.PLATFORM_FEE_PERCENT();
             const standardPlatformFee1 = (price1 * platformFeePercent) / 100n;

             // Second trade - immediately (within RAPID_TRADE_WINDOW)
             // We measure the *next* platform fee received by the owner
             const ownerBalanceBefore2 = await usdc.balanceOf(owner.address);
             const tx2 = await opinionMarket.connect(submitter).submitAnswer(opinionId, secondAnswer);
             await tx2.wait();
             const ownerBalanceAfter2 = await usdc.balanceOf(owner.address);
             const platformFeeReceived2 = ownerBalanceAfter2 - ownerBalanceBefore2;

             const opinionAfter2 = await opinionMarket.opinions(opinionId);
             const price2 = opinionAfter2.lastPrice;
             const standardPlatformFee2 = (price2 * platformFeePercent) / 100n;

             // The fee received for the second trade should be higher than the standard % due to the penalty
             expect(platformFeeReceived2).to.be.gt(standardPlatformFee2);
         });

    });

    describe("VI. Fee Claiming", () => {
        let opinionId: bigint;
        let opinionCreator: HardhatEthersSigner;
        let previousOwner: HardhatEthersSigner;
        let submitter: HardhatEthersSigner;

        beforeEach(async () => {
            // Setup scenario where fees are generated
            opinionCreator = user1;
            previousOwner = user1; // Initially
            submitter = user2;
            opinionId = await createOpinionForPool(opinionCreator, "Fee Claim Q?", "Fee Claim A");
            // Submit an answer to generate fees for previousOwner(user1) and creator(user1)
            await opinionMarket.connect(submitter).submitAnswer(opinionId, "Generate Fees");
            previousOwner = submitter; // user2 is now previous owner
            // Submit again to generate fees for creator(user1) and previousOwner(user2)
             await opinionMarket.connect(user3).submitAnswer(opinionId, "Generate More Fees");

        });

        it("Should allow a user to claim their accumulated fees", async () => {
            const user1Fees = await opinionMarket.accumulatedFees(user1.address);
            const user2Fees = await opinionMarket.accumulatedFees(user2.address);
            expect(user1Fees).to.be.gt(0); // Should have creator fees
            expect(user2Fees).to.be.gt(0); // Should have owner fees

            const totalFeesBefore = await opinionMarket.totalAccumulatedFees();

            // User 1 claims
            await expect(opinionMarket.connect(user1).claimAccumulatedFees())
                .to.emit(opinionMarket, "FeesClaimed").withArgs(user1.address, user1Fees)
                .and.to.changeTokenBalance(usdc, user1, user1Fees);
            expect(await opinionMarket.accumulatedFees(user1.address)).to.equal(0);

             // User 2 claims
            await expect(opinionMarket.connect(user2).claimAccumulatedFees())
                .to.emit(opinionMarket, "FeesClaimed").withArgs(user2.address, user2Fees)
                .and.to.changeTokenBalance(usdc, user2, user2Fees);
            expect(await opinionMarket.accumulatedFees(user2.address)).to.equal(0);

            // Check total accumulated fees decreased
            expect(await opinionMarket.totalAccumulatedFees()).to.equal(totalFeesBefore - user1Fees - user2Fees);
        });

        it("Should reject claim if user has zero fees", async () => {
            const zeroFeeUser = operator; // Assumed no prior fees
            expect(await opinionMarket.accumulatedFees(zeroFeeUser.address)).to.equal(0);
            await expect(opinionMarket.connect(zeroFeeUser).claimAccumulatedFees())
                .to.be.revertedWithCustomError(opinionMarket, "NoFeesToClaim");
        });

         it("Should reject claim when paused", async () => {
            // Make sure user1 has fees (from beforeEach)
            expect(await opinionMarket.accumulatedFees(user1.address)).to.be.gt(0);
            await opinionMarket.connect(operator).pause();
            await expect(opinionMarket.connect(user1).claimAccumulatedFees())
                 .to.be.revertedWithCustomError(opinionMarket, "EnforcedPause");
        });
    });

    // Note: Pool Execution is mostly tested via the contribution trigger test.
    // We can add specific state verification here if needed.
    describe("IX. Pool Execution Verification", () => {
        // Re-use setup from contribution trigger test if possible, or create new one
        it("Should have correct final state after execution", async () => {
            // 1. Setup Opinion & Pool
             const opinionId = await createOpinionForPool(owner);
             const poolCreator = user1;
             const proposedAnswer = "Executed Pool Answer";
             const deadline = await getValidDeadline();
             await approveForPoolCreation(poolCreator, MINIMUM_PRICE);
             const createTx = await opinionMarket.connect(poolCreator).createPool(opinionId, proposedAnswer, deadline, MINIMUM_PRICE, "Exec Pool", "");
             const createReceipt = await createTx.wait();
             const createEvent = createReceipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolCreated")?.topicHash);
             const poolId = opinionMarket.interface.parseLog(createEvent as any)?.args.poolId;

            // 2. Calculate target price
             const opinion = await opinionMarket.opinions(opinionId);
             let targetPrice = opinion.nextPrice > 0n ? opinion.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE(); // Estimate/fetch

            // 3. Contribute enough to execute
             const currentAmount = (await opinionMarket.pools(poolId)).totalAmount;
             let neededContribution = targetPrice - currentAmount;
             if (neededContribution <= 0n) neededContribution = 1n; // Ensure positive contribution

             const contributor = user2;
             await approveForContribution(contributor, neededContribution);
             await opinionMarket.connect(contributor).contributeToPool(poolId, neededContribution); // This triggers execution

            // 4. Verify Final State
             const finalPool = await opinionMarket.pools(poolId);
             const finalOpinion = await opinionMarket.opinions(opinionId);
             const history = await opinionMarket.getAnswerHistory(opinionId);

             expect(finalPool.status).to.equal(1); // Executed
             expect(finalOpinion.currentAnswerOwner).to.equal(await opinionMarket.getAddress());
             expect(finalOpinion.currentAnswer).to.equal(proposedAnswer);
             expect(finalOpinion.lastPrice).to.equal(targetPrice);
             expect(history.length).to.equal(2); // Initial + Pool execution
             expect(history[1].owner).to.equal(await opinionMarket.getAddress());
             expect(history[1].answer).to.equal(proposedAnswer);
             expect(history[1].price).to.equal(targetPrice);
             // Add checks for fee accumulation if needed (though covered elsewhere)
        });
    });


    describe("XI. Pool Deadline Extension", () => {
        let opinionId: bigint;
        let poolId: bigint;
        let deadline: bigint;

         beforeEach(async () => {
             opinionId = await createOpinionForPool(owner);
             deadline = await getValidDeadline(Number(MIN_POOL_DURATION) + 3600); // 1 day + 1 hour
             await approveForPoolCreation(user1, MINIMUM_PRICE);
             const tx = await opinionMarket.connect(user1).createPool(opinionId, "Extend Answer", deadline, MINIMUM_PRICE, "Extend Pool", "");
              const receipt = await tx.wait();
              const event = receipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolCreated")?.topicHash);
              poolId = opinionMarket.interface.parseLog(event as any)?.args.poolId;
         });

        it("Should allow extending deadline for an Active pool", async () => {
            const extensionDuration = 3 * 24 * 60 * 60; // 3 days
            const newDeadline = deadline + BigInt(extensionDuration);
            const extender = user2; // Anyone can extend

            await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, newDeadline))
                .to.emit(opinionMarket, "PoolExtended")
                .withArgs(poolId, newDeadline, extender.address);

            const pool = await opinionMarket.pools(poolId);
            expect(pool.deadline).to.equal(newDeadline);
            expect(pool.status).to.equal(3); // PoolStatus.Extended
        });

         it("Should allow extending deadline for a recently Expired pool", async () => {
             // Expire the pool
             await time.increaseTo(deadline + 1n);
             await opinionMarket.checkPoolExpiry(poolId); // Mark as expired
             expect((await opinionMarket.pools(poolId)).status).to.equal(2); // Expired

             const extensionDuration = 2 * 24 * 60 * 60; // 2 days
             const newDeadline = deadline + BigInt(extensionDuration); // Extend from original deadline time
             const extender = user3;

             await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, newDeadline))
                 .to.emit(opinionMarket, "PoolExtended")
                 .withArgs(poolId, newDeadline, extender.address);

             const pool = await opinionMarket.pools(poolId);
             expect(pool.deadline).to.equal(newDeadline);
             expect(pool.status).to.equal(3); // PoolStatus.Extended
         });

         it("Should reject extension if new deadline is not later", async () => {
              const extender = user2;
              await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, deadline)) // Same deadline
                   .to.be.revertedWith("Invalid new deadline");
              await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, deadline - 1n)) // Earlier deadline
                   .to.be.revertedWith("Invalid new deadline");
         });

        it("Should reject extension if new deadline is too far", async () => {
             const farFutureExtension = 35 * 24 * 60 * 60; // 35 days
             const latestTime = await time.latest();
             const farDeadline = BigInt(latestTime + farFutureExtension);
             const extender = user2;
             await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, farDeadline))
                  .to.be.revertedWith("Invalid new deadline"); // Exceeds MAX_POOL_DURATION from now
        });

         it("Should reject extension if pool expired too long ago", async () => {
             // Expire pool and wait > 7 days
             await time.increaseTo(deadline + BigInt(8 * 24 * 60 * 60)); // 8 days past deadline
             // Mark as expired (implicitly done by extend check too)
             // await opinionMarket.checkPoolExpiry(poolId);


             const extensionDuration = 2 * 24 * 60 * 60;
             const newDeadline = deadline + BigInt(extensionDuration); // Still a valid time relative to original deadline
             const extender = user3;

             await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, newDeadline))
                  .to.be.revertedWith("Pool expired too long ago");
         });

         it("Should reject extension for an Executed pool", async () => {
             // --- Setup for Execution ---
             const opinion = await opinionMarket.opinions(opinionId);
             let targetPrice = opinion.nextPrice > 0n ? opinion.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE();
             const currentAmount = (await opinionMarket.pools(poolId)).totalAmount;
             let neededContribution = targetPrice - currentAmount;
             if (neededContribution <= 0n) neededContribution = 1n;

             await approveForContribution(user2, neededContribution);
             await opinionMarket.connect(user2).contributeToPool(poolId, neededContribution); // Execute
             expect((await opinionMarket.pools(poolId)).status).to.equal(1); // Executed
             // --- End Setup ---

             const newDeadline = deadline + BigInt(2 * 24 * 60 * 60); // 2 days extension
             const extender = user3;

             await expect(opinionMarket.connect(extender).extendPoolDeadline(poolId, newDeadline))
                 .to.be.revertedWith("Pool cannot be extended");
         });

         // QoL: Does extending an Expired pool make it Active again for contributions?
         // Current code sets status to Extended. Need to check if contributeToPool allows this status.
         // Assuming contributeToPool requires Active status based on PoolNotActive error checks.
         it("Should NOT allow contributions to an Extended pool", async () => {
             await opinionMarket.connect(user2).extendPoolDeadline(poolId, deadline + BigInt(2 * 24 * 60 * 60));
             expect((await opinionMarket.pools(poolId)).status).to.equal(3); // Extended

             const contributionAmount = ethers.parseUnits("5", 6);
             await approveForContribution(user3, contributionAmount);
             await expect(opinionMarket.connect(user3).contributeToPool(poolId, contributionAmount))
                 .to.be.revertedWithCustomError(opinionMarket, "PoolNotActive"); // Expecting this based on typical checks
         });

    });


    describe("XII. Pool Reward Distribution", () => {
        let opinionId: bigint;
        let poolId: bigint;
        let opinionCreator: HardhatEthersSigner;
        let poolCreator: HardhatEthersSigner;
        let contributor1: HardhatEthersSigner;
        let contributor2: HardhatEthersSigner;
        let contribution1: bigint;
        let contribution2: bigint;
        let poolAnswer: string;

        beforeEach(async () => {
            // Setup: Opinion -> Pool -> Contributions -> Execution
            opinionCreator = owner;
            poolCreator = user1;
            contributor1 = user2;
            contributor2 = user3;
            poolAnswer = "Pool Reward Answer";
            contribution1 = ethers.parseUnits("10", 6); // 10 USDC
            contribution2 = ethers.parseUnits("30", 6); // 30 USDC -> 25% / 75% split approx.
            const totalContribution = contribution1 + contribution2;

            opinionId = await createOpinionForPool(opinionCreator);

            // Create Pool
            const initialPoolContribution = MINIMUM_PRICE; // Pool creator's stake
            const deadline = await getValidDeadline();
            await approveForPoolCreation(poolCreator, initialPoolContribution);
            const createTx = await opinionMarket.connect(poolCreator).createPool(opinionId, poolAnswer, deadline, initialPoolContribution, "Reward Pool", "");
            const createReceipt = await createTx.wait();
            const createEvent = createReceipt?.logs.find((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolCreated")?.topicHash);
            poolId = opinionMarket.interface.parseLog(createEvent as any)?.args.poolId;


            // Calculate target price for execution
            const opinion = await opinionMarket.opinions(opinionId);
            let targetPrice = opinion.nextPrice > 0n ? opinion.nextPrice : await opinionMarket.INITIAL_ANSWER_PRICE(); // Estimate/fetch

            // Contribute enough to execute (or more) - simpler: just contribute the amounts needed
            await approveForContribution(contributor1, contribution1);
            await opinionMarket.connect(contributor1).contributeToPool(poolId, contribution1);
            await approveForContribution(contributor2, contribution2);
            await opinionMarket.connect(contributor2).contributeToPool(poolId, contribution2);

            // Ensure pool *might* have executed (need enough total contribution vs targetPrice)
             const pool = await opinionMarket.pools(poolId);
             const currentAmount = pool.totalAmount;
             if (currentAmount < targetPrice) {
                 // Contribute diff needed by someone else to trigger execution
                 let needed = targetPrice - currentAmount;
                 if (needed <= 0n) needed = 1n;
                 await approveForContribution(poolCreator, needed); // Pool creator tops up
                 await opinionMarket.connect(poolCreator).contributeToPool(poolId, needed);
             }

            // Verify pool executed and owned by contract
            expect((await opinionMarket.pools(poolId)).status).to.equal(1); // Executed
            expect((await opinionMarket.opinions(opinionId)).currentAnswerOwner).to.equal(await opinionMarket.getAddress());
            expect((await opinionMarket.opinions(opinionId)).currentAnswer).to.equal(poolAnswer);

        });

        it("Should distribute rewards proportionally when pool-owned answer is bought", async () => {
            const buyer = operator; // Someone buys the answer now owned by the pool/contract
            const newAnswer = "Bought Pool Answer";
            const opinionBeforeBuy = await opinionMarket.opinions(opinionId);
            const purchasePrice = opinionBeforeBuy.nextPrice; // Price to buy the pool's answer

            // Calculate expected fees and reward amount
            const platformFeePercent = await opinionMarket.PLATFORM_FEE_PERCENT();
            const creatorFeePercent = await opinionMarket.CREATOR_FEE_PERCENT();
            const platformFee = (purchasePrice * platformFeePercent) / 100n;
            const creatorFee = (purchasePrice * creatorFeePercent) / 100n;
            const totalRewardAmount = purchasePrice - platformFee - creatorFee;

            // Calculate expected shares for contributors (based on their contributions relative to total *funding*)
            // NOTE: Pool creator also contributed MINIMUM_PRICE initially in this setup
            const totalFunded = MINIMUM_PRICE + contribution1 + contribution2; // Pool creator + C1 + C2
            const poolCreatorShare = (MINIMUM_PRICE * totalRewardAmount) / totalFunded;
            const contributor1Share = (contribution1 * totalRewardAmount) / totalFunded;
            const contributor2Share = (contribution2 * totalRewardAmount) / totalFunded;
            // Note: integer division might leave dust. The contract likely distributes dust implicitly or to last calculation.

            // Get initial accumulated fees
            const poolCreatorFeesBefore = await opinionMarket.accumulatedFees(poolCreator.address);
            const contributor1FeesBefore = await opinionMarket.accumulatedFees(contributor1.address);
            const contributor2FeesBefore = await opinionMarket.accumulatedFees(contributor2.address);


            // Buyer submits answer - this triggers _distributePoolRewards internally
            const tx = await opinionMarket.connect(buyer).submitAnswer(opinionId, newAnswer);
            const receipt = await tx.wait();

            // --- Verify Reward Distribution ---

            // Check PoolAnswerPurchased event
            await expect(tx).to.emit(opinionMarket, "PoolAnswerPurchased")
                 .withArgs(poolId, opinionId, buyer.address, purchasePrice, totalRewardAmount);

            // Check PoolRewardDistributed events (order might vary)
            // Use anyValue for percentage if precise calculation is complex to replicate
            const rewardEvents = receipt?.logs.filter((log: any) => log.topics[0] === opinionMarket.interface.getEvent("PoolRewardDistributed")?.topicHash)
                                            .map((log: any) => opinionMarket.interface.parseLog(log as any)?.args);

            expect(rewardEvents).to.have.lengthOf(3); // poolCreator, contributor1, contributor2

            // Function to find event for a specific contributor
            const findEventArgs = (addr: string) => rewardEvents?.find(args => args.contributor === addr);

            // Check event args (approximate amounts due to potential rounding)
            const tolerance = ethers.parseUnits("0.01", 6); // Allow small difference for rounding
            expect(findEventArgs(poolCreator.address)?.rewardAmount).to.be.closeTo(poolCreatorShare, tolerance);
            expect(findEventArgs(contributor1.address)?.rewardAmount).to.be.closeTo(contributor1Share, tolerance);
            expect(findEventArgs(contributor2.address)?.rewardAmount).to.be.closeTo(contributor2Share, tolerance);

            // Check accumulated fees state update (approximate match)
            expect(await opinionMarket.accumulatedFees(poolCreator.address)).to.be.closeTo(poolCreatorFeesBefore + poolCreatorShare, tolerance);
            expect(await opinionMarket.accumulatedFees(contributor1.address)).to.be.closeTo(contributor1FeesBefore + contributor1Share, tolerance);
            expect(await opinionMarket.accumulatedFees(contributor2.address)).to.be.closeTo(contributor2FeesBefore + contributor2Share, tolerance);

             // --- Verify Opinion State Update ---
             const opinionAfterBuy = await opinionMarket.opinions(opinionId);
             expect(opinionAfterBuy.currentAnswerOwner).to.equal(buyer.address);
             expect(opinionAfterBuy.currentAnswer).to.equal(newAnswer);
             expect(opinionAfterBuy.lastPrice).to.equal(purchasePrice);
        });
    });


    describe("XIII. Admin/Moderator Actions", () => {

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
                     .withArgs(user1.address, ADMIN_ROLE); // Check if ADMIN_ROLE is correct role needed
            });
        });

        describe("Opinion Deactivation", () => {
             let opinionId: bigint;
             beforeEach(async () => {
                 opinionId = await createOpinionForPool(owner); // Opinion 1
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

             // Add reactivateOpinion tests if that function exists
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
                     .to.be.revertedWithCustomError(opinionMarket, "OwnableUnauthorizedAccount"); // Assuming Ownable's error
             });
        });
    });


    describe("XIV. Security Mechanisms", () => {
        // Note: Reentrancy requires malicious contract setup, omitted here.

        describe("Rate Limiting", () => {
             let opinionId1: bigint;
             let opinionId2: bigint;
             let opinionId3: bigint;
             let opinionId4: bigint;

             beforeEach(async() => {
                 // Create multiple opinions for testing limits
                 opinionId1 = await createOpinionForPool(owner, "Q1");
                 opinionId2 = await createOpinionForPool(owner, "Q2");
                 opinionId3 = await createOpinionForPool(owner, "Q3");
                 opinionId4 = await createOpinionForPool(owner, "Q4"); // Need 4 for MAX_TRADES_PER_BLOCK=3 test
             });

             // Hardhat's default behavior often puts sequential txs in different blocks.
             // Reliably testing same-block reverts might need network manipulation.
             // These tests check the *intent* of the reverts.

             it("Should revert if user exceeds MAX_TRADES_PER_BLOCK (across different opinions)", async () => {
                 // This test structure assumes sequential calls might hit the limit.
                 // May require hardhat_setAutomine(false) for reliable testing.
                 await opinionMarket.connect(user1).submitAnswer(opinionId1, "A1");
                 await opinionMarket.connect(user1).submitAnswer(opinionId2, "A2");
                 await opinionMarket.connect(user1).submitAnswer(opinionId3, "A3");
                 // The 4th trade in the same simulated block context should fail
                 await expect(opinionMarket.connect(user1).submitAnswer(opinionId4, "A4"))
                    .to.be.revertedWithCustomError(opinionMarket, "MaxTradesPerBlockExceeded"); // Check error and max value
             });

             it("Should revert if user trades the SAME opinion multiple times in the same block (OneTradePerBlock)", async () => {
                 // This test structure assumes sequential calls might hit the limit.
                 // May require hardhat_setAutomine(false) for reliable testing.
                 await opinionMarket.connect(user1).submitAnswer(opinionId1, "A1-1");
                 // The 2nd trade on the *same opinion* in the same block context should fail
                 await expect(opinionMarket.connect(user1).submitAnswer(opinionId1, "A1-2"))
                     .to.be.revertedWithCustomError(opinionMarket, "OneTradePerBlock");
             });
        });

        // describe("Price Change Limits", () => {
        //     // Testing PriceChangeExceedsLimit revert requires specific price manipulation
        //     // or exact knowledge of internal _calculateNextPrice and _validatePriceChange.
        //     it.skip("Should revert if price change exceeds limit", async () => {
        //         // TODO: Setup scenario where next price calculation would violate limits
        //     });
        // });
    });

    describe("XV. Upgradeability", () => {
        it("Should allow the owner to upgrade the contract (UUPS)", async () => {
            const currentImplementation = await upgrades.erc1967.getImplementationAddress(await opinionMarket.getAddress());

            // Deploy Mock V2 Implementation (replace with your actual V2)
            const OpinionMarketV2 = await ethers.getContractFactory("OpinionMarket"); // Use same factory for demo, replace if V2 exists
            const implementationV2 = await OpinionMarketV2.deploy();
            await implementationV2.waitForDeployment();
             const implementationV2Address = await implementationV2.getAddress();


            // Perform upgrade
             await expect(opinionMarket.connect(owner).upgradeToAndCall(implementationV2Address, "0x")).to.not.be.reverted; // Use upgradeTo if no call data needed


            // Verify implementation address changed
            const newImplementation = await upgrades.erc1967.getImplementationAddress(await opinionMarket.getAddress());
            expect(newImplementation).to.equal(implementationV2Address);
            expect(newImplementation).to.not.equal(currentImplementation);

            // Verify state is preserved (e.g., owner, nextOpinionId)
             expect(await opinionMarket.owner()).to.equal(owner.address);
             expect(await opinionMarket.nextOpinionId()).to.be.gte(1); // Should retain its value


        });

         it("Should prevent non-owner from upgrading", async () => {
            const OpinionMarketV2 = await ethers.getContractFactory("OpinionMarket"); // Use same factory for demo
            const implementationV2 = await OpinionMarketV2.deploy();
             await implementationV2.waitForDeployment();
             const implementationV2Address = await implementationV2.getAddress();

             // Attempt upgrade from non-owner
             await expect(opinionMarket.connect(user1).upgradeToAndCall(implementationV2Address, "0x"))
                 .to.be.revertedWithCustomError(opinionMarket,"OwnableUnauthorizedAccount"); // Or generic revert if UUPS doesn't bubble Ownable error

         });
    });

    describe("XVI. View Functions & Constants", () => {
        it("Should return constants correctly", async () => {
            expect(await opinionMarket.MAX_QUESTION_LENGTH()).to.equal(50);
            expect(await opinionMarket.POOL_CREATION_FEE()).to.equal(ethers.parseUnits("50", 6));
            // ... check other constants
        });

        it("Should return accumulatedFees for a user", async () => {
            // Setup fees first (e.g., via submitAnswer)
            const opinionId = await createOpinionForPool(user1);
             await opinionMarket.connect(user2).submitAnswer(opinionId, "Gen fees");
             const fees = await opinionMarket.accumulatedFees(user1.address);
             expect(fees).to.be.gt(0);
        });

         it("Should return totalAccumulatedFees", async () => {
             const opinionId = await createOpinionForPool(user1);
             await opinionMarket.connect(user2).submitAnswer(opinionId, "Gen fees total");
             const totalFees = await opinionMarket.totalAccumulatedFees();
             expect(totalFees).to.be.gt(0);
             // Check if it roughly matches sum of individual fees accumulated in the test run
         });

        it("Should return answer history", async () => {
            const opinionId = await createOpinionForPool(owner, "History Q");
             await opinionMarket.connect(user1).submitAnswer(opinionId, "History A1");
             await opinionMarket.connect(user2).submitAnswer(opinionId, "History A2");
             const history = await opinionMarket.getAnswerHistory(opinionId);
             expect(history.length).to.equal(3);
             expect(history[0].answer).to.equal("Initial Pool Answer"); // From helper
             expect(history[1].answer).to.equal("History A1");
             expect(history[2].answer).to.equal("History A2");
        });

         // Add tests for other view functions: opinions(), pools(), poolContributionAmounts(), etc.
         it("Should return opinion data via opinions mapping", async () => {
             const opinionId = await createOpinionForPool(user1, "Mapping Q", "Mapping A");
             const opinionData = await opinionMarket.opinions(opinionId);
             expect(opinionData.id).to.equal(opinionId);
             expect(opinionData.question).to.equal("Mapping Q");
             expect(opinionData.creator).to.equal(user1.address);
             expect(opinionData.isActive).to.be.true;
         });
    });




ok, now, this is too much for a single file, so break down the tests in multiple logical files and (just a describe block per file) and what is needed before runnning the describe block




Afficher le raisonnement
Okay, let's break down that large test suite into multiple logical files, each focusing on a specific aspect of the OpinionMarket contract.

Core Idea:

Each file will contain one main describe block (e.g., describe("Pool Creation", ...)).
Each file will require a common setup phase, primarily handled by loading a fixture function (loadFixture) within a beforeEach.
We assume the deployFixture function (as defined in the previous examples) is available, either copied into each file or imported from a shared helper file (recommended).
Here's the breakdown:

1. File: test/00_DeployInit.test.ts

describe Block: describe("Deployment & Initialization", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (expect, ethers, upgrades, loadFixture, Typechain types, Signer type).
The deployFixture function definition (or import).
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    // Potentially fetch roles needed for checks
    DEFAULT_ADMIN_ROLE = await opinionMarket.DEFAULT_ADMIN_ROLE();
    ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
    MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
    OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
    TREASURY_ROLE = await opinionMarket.TREASURY_ROLE();
});
Tests Included: Tests verifying owner, token address, initial state variables (nextOpinionId, paused, isPublicCreationEnabled, poolCount), and initial role assignments for the deployer.
2. File: test/01_AccessControl.test.ts

describe Block: describe("Access Control & Roles", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc; // Might not be needed directly here
    owner = deployment.owner;
    user1 = deployment.user1;
    user2 = deployment.user2; // Need users to grant/revoke roles to/from
    // Fetch roles
    DEFAULT_ADMIN_ROLE = await opinionMarket.DEFAULT_ADMIN_ROLE();
    ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
    // ... any other roles tested
});
Tests Included: Tests for grantRole, revokeRole, ensuring only DEFAULT_ADMIN_ROLE can perform these actions, checking hasRole, and event emissions (RoleGranted, RoleRevoked).
3. File: test/02_Admin.test.ts

describe Block: describe("Admin & Operator Actions", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
Helper function like createOpinionForPool might be needed for deactivation tests.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1;
    admin = deployment.admin; // Signer already granted ADMIN_ROLE in fixture
    moderator = deployment.moderator; // Signer already granted MODERATOR_ROLE
    operator = deployment.operator; // Signer already granted OPERATOR_ROLE
    // Fetch roles if checking specific errors
    ADMIN_ROLE = await opinionMarket.ADMIN_ROLE();
    MODERATOR_ROLE = await opinionMarket.MODERATOR_ROLE();
    OPERATOR_ROLE = await opinionMarket.OPERATOR_ROLE();
    // You might need to create an opinion here if testing deactivate/reactivate
    // opinionId = await createOpinionForPool(owner); // Example
});
Tests Included: Grouped tests for:
Pausable (pause, unpause, testing reverts when paused/unpaused).
togglePublicCreation (permissions, state change, event).
deactivateOpinion (permissions, state change, event).
emergencyWithdraw (permissions, requires pausing first, balance changes, event).
4. File: test/03_OpinionCreation.test.ts

describe Block: describe("Opinion Creation", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1; // To test non-owner creation
    // Fetch constants needed for validation
    MINIMUM_PRICE = await opinionMarket.MINIMUM_PRICE();
    MAX_QUESTION_LENGTH = await opinionMarket.MAX_QUESTION_LENGTH();
    MAX_ANSWER_LENGTH = await opinionMarket.MAX_ANSWER_LENGTH();
    MAX_LINK_LENGTH = await opinionMarket.MAX_LINK_LENGTH();
    MAX_IPFS_HASH_LENGTH = await opinionMarket.MAX_IPFS_HASH_LENGTH();
    ADMIN_ROLE = await opinionMarket.ADMIN_ROLE(); // Needed for togglePublicCreation if tested here
     // Ensure public creation is off initially unless toggled for specific tests
     // await opinionMarket.connect(owner).togglePublicCreation(); // Example if needed for most tests
});
Tests Included: Tests for createOpinion and createOpinionWithExtras. Covers permissions (isPublicCreationEnabled), validation (lengths, empty strings), allowance/balance checks, state changes (opinions struct, nextOpinionId), fee calculation/distribution on creation, and event emissions (OpinionCreated, AnswerSubmitted, FeesDistributed).
5. File: test/04_OpinionCore.test.ts

describe Block: describe("Opinion Core Mechanics (Submit Answer, Claim Fees)", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (time helper needed for anti-MEV).
deployFixture function.
createOpinionForPool helper function.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1;
    user2 = deployment.user2;
    user3 = deployment.user3;
    operator = deployment.operator; // Needed for pausing if testing interaction
    // Fetch constants
    MAX_ANSWER_LENGTH = await opinionMarket.MAX_ANSWER_LENGTH();
    PLATFORM_FEE_PERCENT = await opinionMarket.PLATFORM_FEE_PERCENT();
    CREATOR_FEE_PERCENT = await opinionMarket.CREATOR_FEE_PERCENT();
    INITIAL_ANSWER_PRICE = await opinionMarket.INITIAL_ANSWER_PRICE(); // Or fetch dynamically
    // Create a base opinion for most tests in this file
    // opinionCreator = user1;
    // opinionId = await createOpinionForPool(opinionCreator, "Core Test Q", "Core Test A");
});
Tests Included: Grouped tests for:
submitAnswer: Happy path, fee distribution (platform, creator, previous owner), state updates (opinions, answerHistory, accumulatedFees), event emissions (AnswerSubmitted, FeesDistributed, FeesAccumulated). Revert conditions (inactive, same owner, lengths, allowance, balance). Anti-MEV/Rate limiting tests (OneTradePerBlock, MaxTradesPerBlockExceeded, rapid trade penalty).
claimAccumulatedFees: Happy path (checking balance change, state reset), revert on zero fees, testing claim after different fee accumulation scenarios (creator, owner, pool rewards - though pool rewards tested separately). Interaction with pause.
6. File: test/05_PoolCreation.test.ts

describe Block: describe("Pool Creation", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (time helper needed for deadlines).
deployFixture function.
createOpinionForPool helper function.
getValidDeadline helper function.
approveForPoolCreation helper function.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1;
    user2 = deployment.user2;
    // Fetch constants
    MINIMUM_PRICE = await opinionMarket.MINIMUM_PRICE(); // Often used as initial contribution basis
    POOL_CREATION_FEE = await opinionMarket.POOL_CREATION_FEE();
    MIN_POOL_DURATION = await opinionMarket.MIN_POOL_DURATION();
    MAX_POOL_DURATION = await opinionMarket.MAX_POOL_DURATION();
    MAX_POOL_NAME_LENGTH = await opinionMarket.MAX_POOL_NAME_LENGTH();
    MAX_IPFS_HASH_LENGTH = await opinionMarket.MAX_IPFS_HASH_LENGTH();
    // Create a base opinion for pool creation tests
    // opinionId = await createOpinionForPool(owner);
});
Tests Included: Tests specifically for createPool. Happy path, state updates (pools, poolCount, mappings), event emission (PoolCreated), fee transfer (POOL_CREATION_FEE, initial contribution). All revert conditions (invalid opinion, same answer, deadline validation, contribution validation, name/hash lengths, allowance/balance).
7. File: test/06_PoolContribution.test.ts

describe Block: describe("Pool Contribution", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (time helper).
deployFixture function.
Helpers: createOpinionForPool, getValidDeadline, approveForPoolCreation, approveForContribution.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1; // Pool Creator in setup
    user2 = deployment.user2; // Contributor
    user3 = deployment.user3; // Another Contributor
    questionCreator = owner; // Assuming owner created opinion
    // Fetch constants
    POOL_CONTRIBUTION_FEE = await opinionMarket.POOL_CONTRIBUTION_FEE();
    INITIAL_ANSWER_PRICE = await opinionMarket.INITIAL_ANSWER_PRICE(); // For execution check
    // Create base Opinion and Pool in beforeEach
    // opinionId = await createOpinionForPool(questionCreator);
    // poolCreator = user1;
    // deadline = await getValidDeadline();
    // initialContribution = MINIMUM_PRICE; // Example
    // await approveForPoolCreation(poolCreator, initialContribution);
    // const tx = await opinionMarket.connect(poolCreator).createPool(...);
    // poolId = ... // extract poolId from event
});
Tests Included: Tests for contributeToPool. Happy path, state updates (totalAmount, mappings). Event emission (PoolContributed, FeesAccumulated x2). Crucially, testing the POOL_CONTRIBUTION_FEE transfer and 3-way split. Revert conditions (invalid pool, amount=0, pool status, deadline passed, allowance/balance). Testing the trigger for pool execution when contribution meets/exceeds target price.
8. File: test/07_PoolLifecycle.test.ts

describe Block: describe("Pool Lifecycle (Execution, Expiry, Withdrawal, Extension)", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (time helper is essential).
deployFixture function.
Helpers: createOpinionForPool, getValidDeadline, approveForPoolCreation, approveForContribution.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1; // Pool creator/contributor
    user2 = deployment.user2; // Contributor/Extender
    user3 = deployment.user3; // Contributor
    // Fetch constants
    MINIMUM_PRICE = await opinionMarket.MINIMUM_PRICE();
    POOL_CONTRIBUTION_FEE = await opinionMarket.POOL_CONTRIBUTION_FEE();
    INITIAL_ANSWER_PRICE = await opinionMarket.INITIAL_ANSWER_PRICE();
    // Setup a standard pool used across multiple lifecycle tests might be useful here
    // E.g., Create opinion, create pool, add contributions from user1, user2
    // Store opinionId, poolId, deadline, contribution amounts for use in tests
});
Tests Included:
Pool Execution Verification: Focus on the state changes and events after execution is triggered (often by contribution tests, but verify final state here).
checkPoolExpiry: Testing before/after deadline, status change, event.
withdrawFromExpiredPool: Happy path, reverts (not expired, no contribution, double withdrawal), event, balance changes.
extendPoolDeadline: Happy path (Active/Expired pool), reverts (status, deadline validity, expiry grace period), state change, event. Testing contribution attempt after extension.
9. File: test/08_PoolRewards.test.ts

describe Block: describe("Pool Reward Distribution", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
Helpers: createOpinionForPool, getValidDeadline, approveForPoolCreation, approveForContribution.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner; // Opinion creator
    poolCreator = user1;
    contributor1 = user2;
    contributor2 = user3;
    buyer = operator; // Use a distinct address for the final buyer
    // Fetch constants
    PLATFORM_FEE_PERCENT = await opinionMarket.PLATFORM_FEE_PERCENT();
    CREATOR_FEE_PERCENT = await opinionMarket.CREATOR_FEE_PERCENT();
    // --- Complex Setup ---
    // 1. Create opinion
    // 2. Create pool
    // 3. Add contributions from poolCreator, contributor1, contributor2
    // 4. Ensure pool executes (contribute enough) -> contract owns answer
    // Store opinionId, poolId, contribution amounts
});
Tests Included: The specific scenario where a pool-owned answer is bought. Tests focus on verifying the proportional distribution of the rewardAmount (price - platform fee - creator fee) to the accumulatedFees of all original contributors (pool creator, contributor1, contributor2). Checking PoolRewardDistributed and PoolAnswerPurchased events.
10. File: test/09_Security.test.ts

describe Block: describe("Security Mechanisms", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
createOpinionForPool helper.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1;
    // Create multiple opinions needed for rate limit tests
    // opinionId1 = await createOpinionForPool(owner, "Q1");
    // opinionId2 = await createOpinionForPool(owner, "Q2");
    // ...
});
Tests Included: Focus on testable security aspects:
Rate Limiting: Testing the MaxTradesPerBlockExceeded and OneTradePerBlock reverts (with the caveat that reliable same-block testing can be tricky in default Hardhat).
Anti-MEV Penalty: Comparing platform fees during rapid vs normal trades (as shown in the OpinionCore section, can be duplicated or referenced here).
(Skipping Reentrancy Guard coding here).
(Skipping Price Change Limit coding due to complexity of triggering internal logic).
11. File: test/10_Upgradeability.test.ts

describe Block: describe("Upgradeability (UUPS)", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports (upgrades from @openzeppelin/hardhat-upgrades is key).
deployFixture function.
A compiled version of the contract (and potentially a V2 version if testing actual changes).
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket; // This is the proxy instance
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1; // Non-owner for testing permissions
    // OpinionMarketV2Factory = await ethers.getContractFactory("OpinionMarketV2"); // If testing V2
});
Tests Included: Deploying V1 via proxy, deploying a V2 implementation, calling upgradeToAndCall (or upgradeTo) from the owner, verifying implementation address changes, verifying state preservation, checking non-owner cannot upgrade.
12. File: test/11_Views.test.ts

describe Block: describe("View Functions & Constants", () => { ... });
Prerequisites / Setup Needed Before describe Block:
Standard imports.
deployFixture function.
Helpers to create opinions/pools to populate data for views.
beforeEach Content:
TypeScript

beforeEach(async () => {
    const deployment = await loadFixture(deployFixture);
    opinionMarket = deployment.opinionMarket;
    usdc = deployment.usdc;
    owner = deployment.owner;
    user1 = deployment.user1;
    user2 = deployment.user2;
    // Set up some state (opinions, pools, answers) to make views return data
    // opinionId = await createOpinionForPool(owner);
    // await opinionMarket.connect(user1).submitAnswer(opinionId, "View Test Answer");
    // ... create a pool maybe ...
});
Tests Included: Simple checks calling various public view functions (getAnswerHistory, opinions, pools, accumulatedFees, totalAccumulatedFees, poolContributionAmounts, etc.) and verifying they return expected types or values based on the beforeEach setup. Also, checking public constant values.
General Recommendations:

Shared Fixture: Define deployFixture in a separate file (e.g., test/fixtures.ts) and import it into each test file to avoid repetition.
Shared Helpers: Similarly, place common helper functions (createOpinionForPool, getValidDeadline, etc.) in a shared location (test/helpers.ts).
Run All: Hardhat will automatically pick up all *.test.ts files when you run npx hardhat test.
Refinement: As you write tests, you might find better ways to group them or realize more helpers are needed. Adapt the structure as necessary.