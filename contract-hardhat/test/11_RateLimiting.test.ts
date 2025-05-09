import { expect } from "chai";
import { ethers } from "hardhat";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

describe("OpinionMarket - Rate Limiting", function () {
    let rateLimiter;
    let owner, user1, user2;
    
    const MAX_TRADES_PER_BLOCK = 3;
    const RAPID_TRADE_WINDOW = 30; // 30 seconds
    const MEV_PENALTY_PERCENT = 20; // 20%
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const MockRateLimiter = await ethers.getContractFactory("MockRateLimiter");
        rateLimiter = await MockRateLimiter.deploy(
            MAX_TRADES_PER_BLOCK,
            RAPID_TRADE_WINDOW,
            MEV_PENALTY_PERCENT
        );
    });
    
    describe("Maximum trades per block enforcement", function () {
        it("Should allow up to max trades per block", async function () {
            const opinionId1 = 1;
            const opinionId2 = 2;
            const opinionId3 = 3;
            
            // Should succeed (trades 1-3 in current block)
            await rateLimiter.connect(user1).simulateTrade(opinionId1);
            await rateLimiter.connect(user1).simulateTrade(opinionId2);
            await rateLimiter.connect(user1).simulateTrade(opinionId3);
            
            // Verify state
            expect(await rateLimiter.getUserTradesInBlock(user1.address)).to.equal(3);
        });
        
        it("Should revert when exceeding max trades per block", async function () {
            const opinionId1 = 1;
            const opinionId2 = 2;
            const opinionId3 = 3;
            const opinionId4 = 4;
            
            // Execute max allowed trades
            await rateLimiter.connect(user1).simulateTrade(opinionId1);
            await rateLimiter.connect(user1).simulateTrade(opinionId2);
            await rateLimiter.connect(user1).simulateTrade(opinionId3);
            
            // This should revert (exceeds max)
            await expect(
                rateLimiter.connect(user1).simulateTrade(opinionId4)
            ).to.be.revertedWithCustomError(rateLimiter, "MaxTradesPerBlockExceeded");
        });
        
        it("Should reset counter in a new block", async function () {
            const opinionId1 = 1;
            const opinionId2 = 2;
            
            // Execute trades in first block
            await rateLimiter.connect(user1).simulateTrade(opinionId1);
            await rateLimiter.connect(user1).simulateTrade(opinionId2);
            
            // Mine a new block
            await mine(1);
            
            // Should succeed in the new block
            await rateLimiter.connect(user1).simulateTrade(opinionId1);
            
            // Verify reset counter
            expect(await rateLimiter.getUserTradesInBlock(user1.address)).to.equal(1);
        });
    });
    
    describe("One trade per opinion per block limitation", function () {
        it("Should prevent trading same opinion multiple times in one block", async function () {
            const opinionId = 1;
            
            // First trade succeeds
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Second trade for same opinion in same block should fail
            await expect(
                rateLimiter.connect(user1).simulateTrade(opinionId)
            ).to.be.revertedWithCustomError(rateLimiter, "OneTradePerBlock");
            
            // Different user can trade same opinion
            await rateLimiter.connect(user2).simulateTrade(opinionId);
        });
        
        it("Should allow trading same opinion in different blocks", async function () {
            const opinionId = 1;
            
            // Trade in first block
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Mine a new block
            await mine(1);
            
            // Should succeed in the new block
            await rateLimiter.connect(user1).simulateTrade(opinionId);
        });
    });
    
    describe("MEV protection and rapid trading penalties", function () {
        it("Should apply MEV penalty for rapid trades", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly (within rapid trade window)
            await time.increase(10); // 10 seconds
            
            // Calculate penalty for rapid second trade
            const [adjustedPlatformFee, adjustedOwnerAmount] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify penalty was applied (platform fee increased, owner amount decreased)
            const standardPlatformFee = Math.floor(price * 5 / 100); // 5% of price
            expect(adjustedPlatformFee).to.be.gt(standardPlatformFee);
            expect(adjustedOwnerAmount).to.be.lt(ownerAmount);
        });
        
        it("Should not apply penalty outside rapid trade window", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time beyond rapid trade window
            await time.increase(RAPID_TRADE_WINDOW + 1);
            
            // Calculate penalty
            const [adjustedPlatformFee, adjustedOwnerAmount] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify no penalty was applied
            const standardPlatformFee = Math.floor(price * 5 / 100); // 5% of price
            expect(adjustedPlatformFee).to.equal(standardPlatformFee);
            expect(adjustedOwnerAmount).to.equal(ownerAmount);
        });
        
        it("Should apply higher penalty for extremely rapid trades", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time very slightly (nearly immediate second trade)
            await time.increase(1); // 1 second
            
            // Calculate penalty
            const [adjustedPlatformFee1, adjustedOwnerAmount1] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Advance time further but still within window
            await time.increase(15); // 15 more seconds
            
            // Calculate penalty again
            const [adjustedPlatformFee2, adjustedOwnerAmount2] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify higher penalty for faster trade
            expect(adjustedPlatformFee1).to.be.gt(adjustedPlatformFee2);
            expect(adjustedOwnerAmount1).to.be.lt(adjustedOwnerAmount2);
        });
    });
    
    describe("Parameter update tests", function () {
        it("Should update maximum trades per block", async function () {
            const newMaxTrades = 5;
            await rateLimiter.setMaxTradesPerBlock(newMaxTrades);
            expect(await rateLimiter.maxTradesPerBlock()).to.equal(newMaxTrades);
            
            // Test with new limit
            for (let i = 1; i <= newMaxTrades; i++) {
                await rateLimiter.connect(user1).simulateTrade(i);
            }
            
            // This should now fail with the new limit
            await expect(
                rateLimiter.connect(user1).simulateTrade(newMaxTrades + 1)
            ).to.be.revertedWithCustomError(rateLimiter, "MaxTradesPerBlockExceeded");
        });
        
        it("Should update rapid trade window", async function () {
            const newWindow = 60; // 60 seconds
            await rateLimiter.setRapidTradeWindow(newWindow);
            expect(await rateLimiter.rapidTradeWindow()).to.equal(newWindow);
            
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time beyond original window but within new window
            await time.increase(RAPID_TRADE_WINDOW + 10);
            
            // Penalty should still apply with new window
            const [adjustedPlatformFee, adjustedOwnerAmount] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            const standardPlatformFee = Math.floor(price * 5 / 100);
            expect(adjustedPlatformFee).to.be.gt(standardPlatformFee);
        });
        
        it("Should update MEV penalty percent", async function () {
            const newPenaltyPercent = 40; // 40%
            await rateLimiter.setMEVPenaltyPercent(newPenaltyPercent);
            expect(await rateLimiter.mevPenaltyPercent()).to.equal(newPenaltyPercent);
            
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await rateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly
            await time.increase(10);
            
            // Higher penalty percent should lead to higher fee adjustment
            const [adjustedPlatformFee, adjustedOwnerAmount] = await rateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // This would require comparing with the original calculation
            const standardPlatformFee = Math.floor(price * 5 / 100);
            expect(adjustedPlatformFee).to.be.gt(standardPlatformFee);
        });
    });
});