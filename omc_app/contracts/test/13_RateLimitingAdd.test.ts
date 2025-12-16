import { expect } from "chai";
import { ethers } from "hardhat";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

describe("OpinionMarket - Rate Limiting Integration Tests", function () {
    let mockRateLimiter;
    let owner, user1, user2;
    
    const MAX_TRADES_PER_BLOCK = 3;
    const RAPID_TRADE_WINDOW = 30; // 30 seconds
    const MEV_PENALTY_PERCENT = 20; // 20%
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Use your existing MockRateLimiter contract that works in your other tests
        const MockRateLimiter = await ethers.getContractFactory("MockRateLimiter");
        mockRateLimiter = await MockRateLimiter.deploy(
            MAX_TRADES_PER_BLOCK,
            RAPID_TRADE_WINDOW,
            MEV_PENALTY_PERCENT
        );
    });
    
    describe("Extended Rate Limiting Scenarios", function () {
        it("Should apply different penalties based on time elapsed", async function () {
            const opinionId = 1;
            // Make sure to use BigInt for price and ownerAmount
            const price = BigInt(1_000_000); // 1 USDC
            const ownerAmount = BigInt(900_000); // 0.9 USDC (after standard fees)
            
            // First record a trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Take a simpler approach to testing time-based penalties
            // Get penalty at initial time
            const [initialFee, initialAmount] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Advance time slightly
            await time.increase(5); // 5 seconds
            
            // Get penalty after 5 seconds
            const [fee5Sec, amount5Sec] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Advance time more
            await time.increase(10); // 15 seconds total
            
            // Get penalty after 15 seconds
            const [fee15Sec, amount15Sec] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Advance time even more
            await time.increase(10); // 25 seconds total
            
            // Get penalty after 25 seconds
            const [fee25Sec, amount25Sec] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Verify penalty decreases as time interval increases
            expect(initialFee).to.be.gt(fee5Sec);
            expect(fee5Sec).to.be.gt(fee15Sec);
            expect(fee15Sec).to.be.gt(fee25Sec);
            
            expect(initialAmount).to.be.lt(amount5Sec);
            expect(amount5Sec).to.be.lt(amount15Sec);
            expect(amount15Sec).to.be.lt(amount25Sec);
        });
        
        it("Should respect updated MEV penalty parameters", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Record initial trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly
            await time.increase(5); // 5 seconds
            
            // Check penalty with current settings
            const [fee1, amount1] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Update MEV penalty to a higher value
            await mockRateLimiter.setMEVPenaltyPercent(50); // 50% instead of 20%
            
            // Check penalty again with same conditions but new settings
            const [fee2, amount2] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Higher penalty should result in higher fee and lower owner amount
            expect(fee2).to.be.gt(fee1);
            expect(amount2).to.be.lt(amount1);
        });
        
        it("Should limit max penalty to half of owner amount", async function () {
            const opinionId = 1;
            const price = 1_000_000; // 1 USDC
            const ownerAmount = 900_000; // 0.9 USDC
            
            // Record initial trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Set MEV penalty to an extremely high value
            await mockRateLimiter.setMEVPenaltyPercent(100); // 100%
            
            // Simulate immediate second trade (maximum penalty scenario)
            await time.increase(1); // 1 second
            
            // Calculate penalty
            const [adjustedPlatformFee, adjustedOwnerAmount] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Penalty should be capped at half of owner amount
            expect(adjustedOwnerAmount).to.equal(ownerAmount / 2);
            expect(adjustedPlatformFee).to.equal(50_000 + (ownerAmount / 2)); // Standard fee + half owner amount
        });
    });
    
    describe("Rate Limiting System Behavior", function () {
        it("Should track opinion-specific trades separately from block-wide limit", async function () {
            // Reset mock block counter
            await mockRateLimiter.simulateNewBlock();
            
            // Perform trades for different opinions (within block limit)
            for (let i = 1; i <= MAX_TRADES_PER_BLOCK; i++) {
                await mockRateLimiter.connect(user1).checkOpinionTradeAllowed(i);
            }
            
            // Should fail when trying to trade same opinion twice
            await expect(
                mockRateLimiter.connect(user1).checkOpinionTradeAllowed(1)
            ).to.be.revertedWithCustomError(
                mockRateLimiter,
                "OneTradePerBlock"
            );
            
            // But should be able to trade after a new block
            await mockRateLimiter.simulateNewBlock();
            await mockRateLimiter.connect(user1).checkOpinionTradeAllowed(1);
            
            // And now we hit the second trade limit for this opinion in this block
            await expect(
                mockRateLimiter.connect(user1).checkOpinionTradeAllowed(1)
            ).to.be.revertedWithCustomError(
                mockRateLimiter,
                "OneTradePerBlock"
            );
        });
    });
    describe("Additional Rate Limiting Edge Cases", function () {
        it("Should track rate limits separately for different users", async function () {
            // Reset block counter
            await mockRateLimiter.simulateNewBlock();
            
            // User 1 performs max trades
            for (let i = 1; i <= MAX_TRADES_PER_BLOCK; i++) {
                await mockRateLimiter.connect(user1).checkMaxTradesAndIncrement();
            }
            
            // User 1 should now be at the limit
            await expect(
                mockRateLimiter.connect(user1).checkMaxTradesAndIncrement()
            ).to.be.revertedWithCustomError(
                mockRateLimiter,
                "MaxTradesPerBlockExceeded"
            );
            
            // But user 2 should still be able to trade
            for (let i = 1; i <= MAX_TRADES_PER_BLOCK; i++) {
                await mockRateLimiter.connect(user2).checkMaxTradesAndIncrement();
            }
            
            // And user 2 should now hit their own limit
            await expect(
                mockRateLimiter.connect(user2).checkMaxTradesAndIncrement()
            ).to.be.revertedWithCustomError(
                mockRateLimiter,
                "MaxTradesPerBlockExceeded"
            );
        });
        
        it("Should handle exact window boundary correctly", async function () {
            const opinionId = 1;
            const price = 1_000_000;
            const ownerAmount = 900_000;
            
            // Record initial trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time to exactly the window boundary
            await time.increase(RAPID_TRADE_WINDOW);
            
            // Get penalty right at the window boundary
            const [feeAtBoundary, amountAtBoundary] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Should be no penalty at the exact boundary
            const standardPlatformFee = Math.floor(price * 5 / 100); // 5%
            expect(feeAtBoundary).to.equal(standardPlatformFee);
            expect(amountAtBoundary).to.equal(ownerAmount);
            
            // Advance time by 1 more second (beyond window)
            await time.increase(1);
            
            // Get penalty just beyond window
            const [feeBeyondWindow, amountBeyondWindow] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Should still be no penalty
            expect(feeBeyondWindow).to.equal(standardPlatformFee);
            expect(amountBeyondWindow).to.equal(ownerAmount);
        });
        
        it("Should apply maximum penalty for extremely rapid trades", async function () {
            const opinionId = 1;
            const price = 1_000_000;
            const ownerAmount = 900_000;
            
            // Record initial trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Don't advance time at all (simulate immediate follow-up trade)
            
            // Calculate penalty at time zero
            const [feeImmediate, amountImmediate] = await mockRateLimiter.calculateMEVPenalty(
                price,
                ownerAmount,
                user1.address,
                opinionId
            );
            
            // Should have maximum penalty (time factor = 100%)
            // Calculate expected penalty with full multiplier
            const expectedPenalty = Math.min(
                (price * MEV_PENALTY_PERCENT * 100) / 10000, // Full penalty
                ownerAmount / 2 // Capped at half of owner amount
            );
            
            // Platform fee should include standard fee plus penalty
            const standardPlatformFee = Math.floor(price * 5 / 100);
            expect(feeImmediate).to.be.closeTo(
                standardPlatformFee + expectedPenalty,
                5 // Allow small rounding difference
            );
        });
        
        it("Should handle very small transaction amounts correctly", async function () {
            const opinionId = 1;
            const smallPrice = 100; // Very small price
            const smallOwnerAmount = 90; // Very small owner amount
            
            // Record initial trade
            await mockRateLimiter.connect(user1).simulateTrade(opinionId);
            
            // Advance time slightly
            await time.increase(5);
            
            // Calculate penalty for small amount
            const [feeSmall, amountSmall] = await mockRateLimiter.calculateMEVPenalty(
                smallPrice,
                smallOwnerAmount,
                user1.address,
                opinionId
            );
            
            // Even with small amounts, fees should be proportional
            const standardPlatformFee = Math.floor(smallPrice * 5 / 100);
            expect(feeSmall).to.be.gt(standardPlatformFee);
            expect(amountSmall).to.be.lt(smallOwnerAmount);
            
            // Basic sanity checks with tolerance for rounding
            const expectedTotal = smallPrice - Math.floor(smallPrice * 3 / 100); // Total minus creator fee
            expect(feeSmall + amountSmall).to.be.closeTo(expectedTotal, 2); // Allow for small rounding differences
            
            // Check minimum owner amount threshold
            expect(amountSmall).to.be.gte(smallOwnerAmount / 2); // Should respect min owner amount
        });
    });

});