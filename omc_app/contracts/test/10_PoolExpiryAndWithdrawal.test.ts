import { ethers } from "hardhat";
import { expect } from "chai";

describe("Pool Expiry and Withdrawal Test", function () {
  // Contract instance and accounts
  let mockPoolTester: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;
  let user1Address: string;
  let user2Address: string;
  let user3Address: string;
  
  // Constants for testing
  const ACTIVE_POOL_ID = 0; // Pool that is active
  const ALMOST_EXPIRED_POOL_ID = 1; // Pool that will expire soon
  const EXPIRED_NOT_MARKED_POOL_ID = 2; // Pool that has expired but not marked yet
  const MARKED_EXPIRED_POOL_ID = 3; // Pool already marked as expired
  const EXECUTED_POOL_ID = 4; // Pool that has been executed
  const EXTENDED_POOL_ID = 5; // Pool with extended deadline
  
  // Setup for each test
  beforeEach(async function() {
    // Deploy the mock contract
    const MockPoolExpiryWithdrawalTester = await ethers.getContractFactory("MockPoolExpiryWithdrawalTester");
    mockPoolTester = await MockPoolExpiryWithdrawalTester.deploy();
    
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    user3Address = await user3.getAddress();
  });

  describe("Pool Expiry Checking", function() {
    it("Should correctly identify active pools as not expired", async function () {
      // Call function to check expiry
      await mockPoolTester.checkPoolExpiry(ACTIVE_POOL_ID);
      
      // Check pool status is still active after the check
      const poolDetails = await mockPoolTester.getPoolDetails(ACTIVE_POOL_ID);
      expect(poolDetails.info.status).to.equal(0); // Still active
    });

    it("Should auto-mark an expired pool when checking", async function() {
      // Pool is expired but not marked yet
      await mockPoolTester.checkPoolExpiry(EXPIRED_NOT_MARKED_POOL_ID);
      
      // Check pool status is now expired
      const poolDetails = await mockPoolTester.getPoolDetails(EXPIRED_NOT_MARKED_POOL_ID);
      expect(poolDetails.info.status).to.equal(2); // Expired
    });
    
    it("Should recognize an already marked expired pool", async function() {
      // Should not change status
      await mockPoolTester.checkPoolExpiry(MARKED_EXPIRED_POOL_ID);
      
      // Status should remain expired
      const poolDetails = await mockPoolTester.getPoolDetails(MARKED_EXPIRED_POOL_ID);
      expect(poolDetails.info.status).to.equal(2); // Still expired
    });
    
    it("Should not mark executed pools as expired", async function() {
      // Should not change status
      await mockPoolTester.checkPoolExpiry(EXECUTED_POOL_ID);
      
      // Status should remain executed
      const poolDetails = await mockPoolTester.getPoolDetails(EXECUTED_POOL_ID);
      expect(poolDetails.info.status).to.equal(1); // Still executed
    });
  });
  
  describe("Pool Expiry Events", function() {
    it("Should emit correct events when a pool is marked as expired", async function() {
      // Find the PoolExpired event
      const tx = await mockPoolTester.checkPoolExpiry(EXPIRED_NOT_MARKED_POOL_ID);
      const receipt = await tx.wait();
      
      const expiredEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "PoolExpired";
        } catch (e) {
          return false;
        }
      });
      
      expect(expiredEvents.length).to.be.gt(0, "No PoolExpired event found");
      
      // Check core event parameters
      if (expiredEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(expiredEvents[0]);
        expect(parsedEvent.args[0]).to.equal(EXPIRED_NOT_MARKED_POOL_ID); // poolId
        expect(parsedEvent.args[1]).to.equal(1); // opinionId
        expect(parsedEvent.args[2]).to.equal(ethers.parseUnits("100", 6)); // totalAmount
        expect(parsedEvent.args[3]).to.equal(3); // contributorCount
      }
    });
    
    it("Should emit PoolAction event when a pool is marked as expired", async function() {
      // Check for PoolAction event
      const tx = await mockPoolTester.checkPoolExpiry(EXPIRED_NOT_MARKED_POOL_ID);
      const receipt = await tx.wait();
      
      const actionEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "PoolAction";
        } catch (e) {
          return false;
        }
      });
      
      expect(actionEvents.length).to.be.gt(0, "No PoolAction event found");
      
      // Check core event parameters
      if (actionEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(actionEvents[0]);
        expect(parsedEvent.args[0]).to.equal(EXPIRED_NOT_MARKED_POOL_ID); // poolId
        expect(parsedEvent.args[1]).to.equal(1); // opinionId
        expect(parsedEvent.args[2]).to.equal(3); // actionType (3 = expire)
      }
    });
  });
  
  describe("Pool Withdrawal", function() {
    it("Should allow withdrawal from an expired pool", async function() {
      // First add contribution directly to fix the alignment issue
      await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user1Address, ethers.parseUnits("60", 6));
      
      // User 1 withdraws from the marked expired pool
      await mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
      
      // Check user is marked as withdrawn
      const hasWithdrawn = await mockPoolTester.hasUserWithdrawn(MARKED_EXPIRED_POOL_ID, user1Address);
      expect(hasWithdrawn).to.be.true;
      
      // Check total withdrawn amount
      const totalWithdrawn = await mockPoolTester.getTotalWithdrawn(MARKED_EXPIRED_POOL_ID);
      const userContribution = await mockPoolTester.getContributionAmount(MARKED_EXPIRED_POOL_ID, user1Address);
      expect(totalWithdrawn).to.equal(userContribution);
    });
    
    it("Should auto-mark an expired pool when withdrawing", async function() {
      // Add contribution for testing
      await mockPoolTester.addContributionForTesting(EXPIRED_NOT_MARKED_POOL_ID, user1Address, ethers.parseUnits("50", 6));
      
      // Pool has expired but not marked yet
      const poolBefore = await mockPoolTester.getPoolDetails(EXPIRED_NOT_MARKED_POOL_ID);
      expect(poolBefore.info.status).to.equal(0); // Still active
      
      // User 1 withdraws, which should auto-mark the pool as expired
      await mockPoolTester.connect(user1).withdrawFromExpiredPool(EXPIRED_NOT_MARKED_POOL_ID);
      
      // Check pool is now marked as expired
      const poolAfter = await mockPoolTester.getPoolDetails(EXPIRED_NOT_MARKED_POOL_ID);
      expect(poolAfter.info.status).to.equal(2); // Now expired
    });
    
    it("Should reject withdrawal from an active pool", async function() {
      // Add contribution for testing
      await mockPoolTester.addContributionForTesting(ACTIVE_POOL_ID, user1Address, ethers.parseUnits("50", 6));
      
      await expect(
        mockPoolTester.connect(user1).withdrawFromExpiredPool(ACTIVE_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolNotExpired");
    });
    
    it("Should reject withdrawal if user has no contribution", async function() {
      // User 3 has not contributed to the marked expired pool
      await expect(
        mockPoolTester.connect(user3).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "NoContribution");
    });
    
    it("Should reject withdrawal if user has already withdrawn", async function() {
      // Add contribution for testing
      await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user1Address, ethers.parseUnits("60", 6));
      
      // First withdrawal
      await mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
      
      // Second attempt should fail
      await expect(
        mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "AlreadyWithdrawn");
    });
    
    it("Should allow multiple users to withdraw from the same pool", async function() {
      // Add contributions for testing
      await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user1Address, ethers.parseUnits("60", 6));
      await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user2Address, ethers.parseUnits("40", 6));
      
      // User 1 withdraws
      await mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
      
      // User 2 withdraws
      await mockPoolTester.connect(user2).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
      
      // Check both users are marked as withdrawn
      const user1HasWithdrawn = await mockPoolTester.hasUserWithdrawn(MARKED_EXPIRED_POOL_ID, user1Address);
      const user2HasWithdrawn = await mockPoolTester.hasUserWithdrawn(MARKED_EXPIRED_POOL_ID, user2Address);
      expect(user1HasWithdrawn).to.be.true;
      expect(user2HasWithdrawn).to.be.true;
      
      // Check total withdrawn amount
      const totalWithdrawn = await mockPoolTester.getTotalWithdrawn(MARKED_EXPIRED_POOL_ID);
      const user1Contribution = await mockPoolTester.getContributionAmount(MARKED_EXPIRED_POOL_ID, user1Address);
      const user2Contribution = await mockPoolTester.getContributionAmount(MARKED_EXPIRED_POOL_ID, user2Address);
      expect(totalWithdrawn).to.equal(user1Contribution + user2Contribution);
    });
  });
  
  describe("Withdrawal Events", function() {
    it("Should emit PoolRefund event when a user withdraws", async function() {
      // Add contribution for testing
      await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user1Address, ethers.parseUnits("60", 6));
      
      // Withdraw and get the transaction receipt
      const tx = await mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
      const receipt = await tx.wait();
      
      // Find the PoolRefund event
      const refundEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "PoolRefund";
        } catch (e) {
          return false;
        }
      });
      
      expect(refundEvents.length).to.be.gt(0, "No PoolRefund event found");
      
      // Check core event parameters
      if (refundEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(refundEvents[0]);
        expect(parsedEvent.args[0]).to.equal(MARKED_EXPIRED_POOL_ID); // poolId
        expect(parsedEvent.args[1]).to.equal(user1Address); // user
        expect(parsedEvent.args[2]).to.equal(ethers.parseUnits("60", 6)); // amount
      }
    });
    
    it("Should emit PoolAction event when a user withdraws", async function() {
        // Add contribution for testing
        await mockPoolTester.addContributionForTesting(MARKED_EXPIRED_POOL_ID, user1Address, ethers.parseUnits("60", 6));
        
        // Withdraw and get the transaction receipt
        const tx = await mockPoolTester.connect(user1).withdrawFromExpiredPool(MARKED_EXPIRED_POOL_ID);
        const receipt = await tx.wait();
        
        // First, find all PoolAction events
        const actionEvents = receipt.logs.filter(log => {
          try {
            const parsedLog = mockPoolTester.interface.parseLog(log);
            return parsedLog.name === "PoolAction";
          } catch (e) {
            return false;
          }
        });
        
        expect(actionEvents.length).to.be.gt(0, "No PoolAction events found");
        
        // Then look for the specific withdraw action type
        let withdrawEventFound = false;
        for (const log of actionEvents) {
          const parsedEvent = mockPoolTester.interface.parseLog(log);
          if (parsedEvent.args[2] === 5n) { // actionType 5 = withdraw, convert to BigInt
            withdrawEventFound = true;
            // Verify other parameters
            expect(parsedEvent.args[0]).to.equal(BigInt(MARKED_EXPIRED_POOL_ID)); // poolId
            expect(parsedEvent.args[3]).to.equal(user1Address); // actor
            break;
          }
        }
        
        // Fix the assertion syntax - moved the message inside the expect
        expect(withdrawEventFound, "No withdraw action found in PoolAction events").to.be.true;
      });
  });
  
  describe("Pool Extension", function() {
    it("Should allow extending an active pool", async function() {
      const poolBefore = await mockPoolTester.getPoolDetails(ACTIVE_POOL_ID);
      const oldDeadline = poolBefore.info.deadline;
      const newDeadline = Number(oldDeadline) + 7 * 24 * 60 * 60; // Add 7 more days
      
      await mockPoolTester.extendPoolDeadline(ACTIVE_POOL_ID, newDeadline);
      
      // Check pool status and deadline
      const poolAfter = await mockPoolTester.getPoolDetails(ACTIVE_POOL_ID);
      expect(poolAfter.info.status).to.equal(3); // Now extended
      expect(poolAfter.info.deadline).to.equal(newDeadline);
    });
    
    it("Should allow extending an expired pool", async function() {
      const poolBefore = await mockPoolTester.getPoolDetails(MARKED_EXPIRED_POOL_ID);
      const oldDeadline = poolBefore.info.deadline;
      const newDeadline = Number(oldDeadline) + 14 * 24 * 60 * 60; // Add 14 more days
      
      await mockPoolTester.extendPoolDeadline(MARKED_EXPIRED_POOL_ID, newDeadline);
      
      // Check pool status and deadline
      const poolAfter = await mockPoolTester.getPoolDetails(MARKED_EXPIRED_POOL_ID);
      expect(poolAfter.info.status).to.equal(3); // Now extended
      expect(poolAfter.info.deadline).to.equal(newDeadline);
    });
    
    it("Should not allow extending an executed pool", async function() {
      const poolBefore = await mockPoolTester.getPoolDetails(EXECUTED_POOL_ID);
      const oldDeadline = poolBefore.info.deadline;
      const newDeadline = Number(oldDeadline) + 7 * 24 * 60 * 60; // Add 7 more days
      
      await expect(
        mockPoolTester.extendPoolDeadline(EXECUTED_POOL_ID, newDeadline)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolNotActive");
    });
    
    it("Should emit PoolAction event when extending a pool", async function() {
        const poolBefore = await mockPoolTester.getPoolDetails(ACTIVE_POOL_ID);
        const oldDeadline = poolBefore.info.deadline;
        const newDeadline = Number(oldDeadline) + 7 * 24 * 60 * 60; // Add 7 more days
        
        // Extend and get the transaction receipt
        const tx = await mockPoolTester.extendPoolDeadline(ACTIVE_POOL_ID, newDeadline);
        const receipt = await tx.wait();
        
        // Find all PoolAction events
        const actionEvents = receipt.logs.filter(log => {
          try {
            const parsedLog = mockPoolTester.interface.parseLog(log);
            return parsedLog.name === "PoolAction";
          } catch (e) {
            return false;
          }
        });
        
        expect(actionEvents.length).to.be.gt(0, "No PoolAction events found");
        
        // Check for the extension event
        let extendEventFound = false;
        for (const log of actionEvents) {
          const parsedEvent = mockPoolTester.interface.parseLog(log);
          if (parsedEvent.args[2] === 4n) { // actionType 4 = extend, convert to BigInt
            extendEventFound = true;
            expect(parsedEvent.args[0]).to.equal(BigInt(ACTIVE_POOL_ID)); // poolId
            break;
          }
        }
        
        // Fix the assertion syntax - moved the message inside the expect
        expect(extendEventFound, "No extend action found in PoolAction events").to.be.true;
      });
  });
});