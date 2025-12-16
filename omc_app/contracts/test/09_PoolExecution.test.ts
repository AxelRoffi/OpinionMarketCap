import { ethers } from "hardhat";
import { expect } from "chai";

describe("Pool Execution Test", function () {
  // Contract instance and accounts
  let mockPoolTester: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user1Address: string;
  let user2Address: string;
  
  // Constants for testing
  const READY_POOL_ID = 0; // Pool with enough funds to execute
  const ALMOST_READY_POOL_ID = 1; // Pool that needs more funds
  const EXECUTED_POOL_ID = 2; // Pool already executed
  const EXPIRED_POOL_ID = 3; // Pool expired
  const OPINION_ID = 1;
  const TARGET_PRICE = ethers.parseUnits("200", 6); // 200 USDC
  const CONTRIBUTION = ethers.parseUnits("10", 6); // 10 USDC
  
  // Setup for each test
  beforeEach(async function() {
    // Deploy the mock contract
    const MockPoolExecutionTester = await ethers.getContractFactory("MockPoolExecutionTester");
    mockPoolTester = await MockPoolExecutionTester.deploy();
    
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
  });

  describe("Basic Pool Execution", function() {
    it("Should execute a pool that has reached its target funding", async function () {
      // Get initial opinion data
      const opinionBefore = await mockPoolTester.getOpinionDetails(OPINION_ID);
      const initialAnswer = opinionBefore.currentAnswer;
      const initialOwner = opinionBefore.owner;
      
      // Execute the pool
      await mockPoolTester.executePool(READY_POOL_ID);
      
      // Check pool status after execution
      const poolAfter = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      expect(poolAfter.info.status).to.equal(1); // Executed
      
      // Check opinion was updated
      const opinionAfter = await mockPoolTester.getOpinionDetails(OPINION_ID);
      expect(opinionAfter.currentAnswer).to.equal("Ready Pool Answer");
      expect(opinionAfter.owner).to.not.equal(initialOwner); // Owner should change
      expect(opinionAfter.lastPrice).to.equal(TARGET_PRICE);
    });

    it("Should auto-execute a pool when it reaches target funding through contribution", async function() {
      // Get initial state
      const poolBefore = await mockPoolTester.getPoolDetails(ALMOST_READY_POOL_ID);
      const remainingAmount = poolBefore.remainingAmount;
      
      // Contribute enough to reach target
      await mockPoolTester.connect(user1).contributeAndExecute(ALMOST_READY_POOL_ID, remainingAmount);
      
      // Check pool was executed
      const poolAfter = await mockPoolTester.getPoolDetails(ALMOST_READY_POOL_ID);
      expect(poolAfter.info.status).to.equal(1); // Executed
      
      // Check opinion was updated
      const opinionAfter = await mockPoolTester.getOpinionDetails(OPINION_ID);
      expect(opinionAfter.currentAnswer).to.equal("Almost Ready Pool Answer");
    });
  });
  
  describe("Execution Validation", function() {
    it("Should reject execution for a non-existent pool", async function() {
      const nonExistentPoolId = 999;
      
      await expect(
        mockPoolTester.executePool(nonExistentPoolId)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolNotFound");
    });
    
    it("Should reject execution for a pool with insufficient funds", async function() {
      await expect(
        mockPoolTester.executePool(ALMOST_READY_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolInsufficientFunds");
    });
    
    it("Should reject execution for an already executed pool", async function() {
      await expect(
        mockPoolTester.executePool(EXECUTED_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolNotActive");
    });
    
    it("Should reject execution for an expired pool", async function() {
      await expect(
        mockPoolTester.executePool(EXPIRED_POOL_ID)
      ).to.be.revertedWithCustomError(mockPoolTester, "PoolNotActive");
    });
  });
  
  describe("Opinion Update", function() {
    it("Should update the opinion with the pool's proposed answer", async function() {
      // Get initial opinion data
      const opinionBefore = await mockPoolTester.getOpinionDetails(OPINION_ID);
      const initialAnswer = opinionBefore.currentAnswer;
      const initialOwner = opinionBefore.owner;
      
      const poolBefore = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      const proposedAnswer = poolBefore.info.proposedAnswer;
      
      // Execute the pool
      await mockPoolTester.executePool(READY_POOL_ID);
      
      // Check opinion was updated correctly
      const opinionAfter = await mockPoolTester.getOpinionDetails(OPINION_ID);
      expect(opinionAfter.currentAnswer).to.equal(proposedAnswer);
      expect(opinionAfter.owner).to.not.equal(initialOwner); // Owner should change
    });
    
    it("Should update the opinion price to the pool's total amount", async function() {
      // Execute the pool
      await mockPoolTester.executePool(READY_POOL_ID);
      
      // Check opinion price was updated
      const opinionAfter = await mockPoolTester.getOpinionDetails(OPINION_ID);
      expect(opinionAfter.lastPrice).to.equal(TARGET_PRICE);
    });
  });
  
  describe("Manual vs Auto Execution", function() {
    it("Should respect manual execution setting when contributing", async function() {
      // Enable manual execution
      await mockPoolTester.setExecuteManually(true);
      
      // Get initial state
      const poolBefore = await mockPoolTester.getPoolDetails(ALMOST_READY_POOL_ID);
      const remainingAmount = poolBefore.remainingAmount;
      
      // Contribute enough to reach target
      await mockPoolTester.connect(user1).contributeAndExecute(ALMOST_READY_POOL_ID, remainingAmount);
      
      // Check pool was NOT executed due to manual setting
      const poolAfter = await mockPoolTester.getPoolDetails(ALMOST_READY_POOL_ID);
      expect(poolAfter.info.status).to.equal(0); // Still Active
      
      // Now execute manually
      await mockPoolTester.executePool(ALMOST_READY_POOL_ID);
      
      // Check pool is now executed
      const poolFinal = await mockPoolTester.getPoolDetails(ALMOST_READY_POOL_ID);
      expect(poolFinal.info.status).to.equal(1); // Executed
    });
  });
  
  describe("Event Emission", function() {
    it("Should emit PoolExecuted event with correct parameters", async function() {
      // Get pool details before execution
      const poolBefore = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      const proposedAnswer = poolBefore.info.proposedAnswer;
      
      // Execute and get the transaction receipt
      const tx = await mockPoolTester.executePool(READY_POOL_ID);
      const receipt = await tx.wait();
      
      // Find the PoolExecuted event
      const executedEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "PoolExecuted";
        } catch (e) {
          return false;
        }
      });
      
      expect(executedEvents.length).to.be.gt(0, "No PoolExecuted event found");
      
      // Check event parameters without relying on withArgs
      if (executedEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(executedEvents[0]);
        expect(parsedEvent.args[0]).to.equal(READY_POOL_ID); // poolId
        expect(parsedEvent.args[1]).to.equal(OPINION_ID); // opinionId  
        expect(parsedEvent.args[2]).to.equal(proposedAnswer); // proposedAnswer
        expect(parsedEvent.args[3]).to.equal(TARGET_PRICE); // targetPrice
        // Skip timestamp check
      }
    });
    
    it("Should emit OpinionUpdated event with correct parameters", async function() {
      // Get initial state
      const opinionBefore = await mockPoolTester.getOpinionDetails(OPINION_ID);
      const initialAnswer = opinionBefore.currentAnswer;
      
      const poolBefore = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      const proposedAnswer = poolBefore.info.proposedAnswer;
      
      // Execute the pool
      const tx = await mockPoolTester.executePool(READY_POOL_ID);
      const receipt = await tx.wait();
      
      // Find the OpinionUpdated event
      const updatedEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "OpinionUpdated";
        } catch (e) {
          return false;
        }
      });
      
      expect(updatedEvents.length).to.be.gt(0, "No OpinionUpdated event found");
      
      // Check event parameters without relying on withArgs
      if (updatedEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(updatedEvents[0]);
        expect(parsedEvent.args[0]).to.equal(OPINION_ID); // opinionId
        expect(parsedEvent.args[1]).to.equal(initialAnswer); // oldAnswer
        expect(parsedEvent.args[2]).to.equal(proposedAnswer); // newAnswer
        // Skip owner address comparisons
        expect(parsedEvent.args[5]).to.equal(TARGET_PRICE); // price
      }
    });
    
    it("Should emit PoolAction event with correct parameters", async function() {
      // Get pool details
      const poolBefore = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      const proposedAnswer = poolBefore.info.proposedAnswer;
      
      // Execute and get the transaction receipt
      const tx = await mockPoolTester.executePool(READY_POOL_ID);
      const receipt = await tx.wait();
      
      // Find the PoolAction event
      const actionEvents = receipt.logs.filter(log => {
        try {
          const parsedLog = mockPoolTester.interface.parseLog(log);
          return parsedLog.name === "PoolAction";
        } catch (e) {
          return false;
        }
      });
      
      expect(actionEvents.length).to.be.gt(0, "No PoolAction event found");
      
      // Check event parameters without relying on withArgs
      if (actionEvents.length > 0) {
        const parsedEvent = mockPoolTester.interface.parseLog(actionEvents[0]);
        expect(parsedEvent.args[0]).to.equal(READY_POOL_ID); // poolId
        expect(parsedEvent.args[1]).to.equal(OPINION_ID); // opinionId
        expect(parsedEvent.args[2]).to.equal(2); // actionType (2 = execute)
        // Skip actor address comparison
        // Skip amount comparison
        expect(parsedEvent.args[5]).to.equal(proposedAnswer); // answer
      }
    });
  });
  
  describe("Execution Failure Handling", function() {
    it("Should emit ExecutionFailed event when execution fails", async function() {
      await expect(
        mockPoolTester.executePoolWithFailure(READY_POOL_ID)
      )
        .to.emit(mockPoolTester, "ExecutionFailed")
        .withArgs(READY_POOL_ID, "Simulated execution failure");
      
      // Verify pool status remains unchanged
      const poolAfter = await mockPoolTester.getPoolDetails(READY_POOL_ID);
      expect(poolAfter.info.status).to.equal(0); // Still Active
    });
  });
});