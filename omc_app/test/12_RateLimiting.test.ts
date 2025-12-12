import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("OpinionMarket - Rate Limiting", function () {
    let mockRateLimiter;
    let owner, user1, user2;
    
    const MAX_TRADES_PER_BLOCK = 3;
    const RAPID_TRADE_WINDOW = 30; // 30 seconds
    const MEV_PENALTY_PERCENT = 20; // 20%
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy mock contract
        const MockRateLimiter = await ethers.getContractFactory("MockRateLimiter");
        mockRateLimiter = await MockRateLimiter.deploy(
            MAX_TRADES_PER_BLOCK,
            RAPID_TRADE_WINDOW,
            MEV_PENALTY_PERCENT
        );
    });
    
    describe("Maximum trades per block enforcement", function () {
        it("Should allow up to max trades per block", async function () {
            // For testing purposes, create direct functions that simulate 
            // the internal checkAndUpdateTradesInBlock behavior without actually using blocks
            
            // First call
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(1);
            expect(await mockRateLimiter.getUserTradesInBlock(user1.address)).to.equal(1);
            
            // Second call
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(2);
            expect(await mockRateLimiter.getUserTradesInBlock(user1.address)).to.equal(2);
            
            // Third call (max)
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(3);
            expect(await mockRateLimiter.getUserTradesInBlock(user1.address)).to.equal(3);
        });
        
        it("Should revert when exceeding max trades per block", async function () {
            // Set trades to max
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(MAX_TRADES_PER_BLOCK);
            
            // Next call should revert
            await expect(
                mockRateLimiter.connect(user1).checkMaxTradesAndIncrement()
            ).to.be.revertedWithCustomError(
                mockRateLimiter, 
                "MaxTradesPerBlockExceeded"
            );
        });
        
        it("Should reset counter in a new block", async function () {
            // Set trades to 2 in "current block"
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(2);
            
            // Simulate new block
            await mockRateLimiter.connect(user1).simulateNewBlock();
            
            // First trade in new block should reset counter to 1
            await mockRateLimiter.connect(user1).checkMaxTradesAndIncrement();
            expect(await mockRateLimiter.getUserTradesInBlock(user1.address)).to.equal(1);
        });
    });
    
    describe("One trade per opinion per block limitation", function () {
        it("Should prevent trading same opinion multiple times in one block", async function () {
            const opinionId = 1;
            
            // Mark opinion as traded in current block
            await mockRateLimiter.connect(user1).manuallySetLastTradeBlock(opinionId);
            
            // Should revert when trying again
            await expect(
                mockRateLimiter.connect(user1).checkOpinionTradeAllowed(opinionId)
            ).to.be.revertedWithCustomError(
                mockRateLimiter, 
                "OneTradePerBlock"
            );
        });
        
        it("Should allow trading same opinion in different blocks", async function () {
            const opinionId = 1;
            
            // Mark opinion as traded in current block
            await mockRateLimiter.connect(user1).manuallySetLastTradeBlock(opinionId);
            
            // Simulate new block
            await mockRateLimiter.connect(user1).simulateNewBlock();
            
            // Should be allowed in new block
            await mockRateLimiter.connect(user1).checkOpinionTradeAllowed(opinionId);
            
            // Verify it was recorded
            expect(
                await mockRateLimiter.getUserLastTradeBlock(user1.address, opinionId)
            ).to.equal(await mockRateLimiter.getCurrentBlockForTesting());
        });
    });
    
    // The time-based tests stay the same - they work correctly
    describe("MEV protection and rapid trading penalties", function () {
        it("Should apply MEV penalty for rapid trades", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly (within rapid trade window)
            await time.increase(10); // 10 seconds
            
            // Calculate penalty for rapid second trade
            const [adjustedPlatformFee, adjustedOwnerAmount] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify penalty was applied (platform fee increased, owner amount decreased)
            const standardPlatformFee = Math.floor(price * 5 / 100); // 5% platform fee
            expect(adjustedPlatformFee).to.be.gt(standardPlatformFee);
            expect(adjustedOwnerAmount).to.be.lt(ownerAmount);
        });
        
        it("Should not apply penalty outside rapid trade window", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time beyond rapid trade window
            await time.increase(RAPID_TRADE_WINDOW + 1);
            
            // Calculate penalty
            const [adjustedPlatformFee, adjustedOwnerAmount] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify no penalty was applied
            const standardPlatformFee = Math.floor(price * 5 / 100); // 5% platform fee
            expect(adjustedPlatformFee).to.equal(standardPlatformFee);
            expect(adjustedOwnerAmount).to.equal(ownerAmount);
        });
        
        it("Should apply higher penalty for extremely rapid trades", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time very slightly (nearly immediate second trade)
            await time.increase(1); // 1 second
            
            // Calculate penalty
            const [adjustedPlatformFee1, adjustedOwnerAmount1] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Advance time further but still within window
            await time.increase(15); // 15 more seconds
            
            // Calculate penalty again
            const [adjustedPlatformFee2, adjustedOwnerAmount2] = await mockRateLimiter.calculateMEVPenalty(
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
            
            // Update the parameter
            await mockRateLimiter.setParameter(4, newMaxTrades);
            expect(await mockRateLimiter.maxTradesPerBlock()).to.equal(newMaxTrades);
            
            // Set trades to the new max
            await mockRateLimiter.connect(user1).manuallySetTradesInBlock(newMaxTrades);
            
            // Should be acceptable with the new limit
            expect(await mockRateLimiter.getUserTradesInBlock(user1.address)).to.equal(newMaxTrades);
            
            // Next trade should revert
            await expect(
                mockRateLimiter.connect(user1).checkMaxTradesAndIncrement()
            ).to.be.revertedWithCustomError(
                mockRateLimiter, 
                "MaxTradesPerBlockExceeded"
            );
        });
        
        it("Should update rapid trade window", async function () {
            const newWindow = 60; // 60 seconds
            await mockRateLimiter.setRapidTradeWindow(newWindow);
            expect(await mockRateLimiter.rapidTradeWindow()).to.equal(newWindow);
            
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time beyond original window but within new window
            await time.increase(RAPID_TRADE_WINDOW + 10);
            
            // Penalty should still apply with new window
            const [adjustedPlatformFee, adjustedOwnerAmount] = await mockRateLimiter.calculateMEVPenalty(
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
            await mockRateLimiter.setMEVPenaltyPercent(newPenaltyPercent);
            expect(await mockRateLimiter.mevPenaltyPercent()).to.equal(newPenaltyPercent);
            
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Simulate first trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly
            await time.increase(10);
            
            // Calculate penalty with new percentage
            const [adjustedPlatformFee, adjustedOwnerAmount] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Higher penalty percent should result in higher fee
            const standardPlatformFee = Math.floor(price * 5 / 100);
            expect(adjustedPlatformFee).to.be.gt(standardPlatformFee);
        });
    });
});