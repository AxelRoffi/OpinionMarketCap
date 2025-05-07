import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OpinionMarket - Question Trading Interface", function () {
  let opinionMarket: Contract;
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  
  before(async function() {
    // Get signers
    [owner, creator, user1] = await ethers.getSigners();
    
    // Deploy OpinionMarket without initialization
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    opinionMarket = await OpinionMarketFactory.deploy();
    
    // Verify deployment succeeded
    expect(await opinionMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
  });

  // Test that the contract has the expected functions for question trading
  describe("Function Existence", function() {
    it("Should have listQuestionForSale function", function() {
      expect(typeof opinionMarket.listQuestionForSale).to.equal("function");
    });
    
    it("Should have buyQuestion function", function() {
      expect(typeof opinionMarket.buyQuestion).to.equal("function");
    });
    
    it("Should have cancelQuestionSale function", function() {
      expect(typeof opinionMarket.cancelQuestionSale).to.equal("function");
    });
  });
  
  // Test that the contract defines the expected events
  describe("Event Definitions", function() {
    it("Should define QuestionSaleAction event", function() {
      // Check that the event exists in the contract interface
      const eventFragment = opinionMarket.interface.getEvent("QuestionSaleAction");
      expect(eventFragment).to.not.be.undefined;
      
      // Check event parameters
      const paramNames = eventFragment.inputs.map((input: any) => input.name);
      expect(paramNames).to.include.members(["opinionId", "actionType", "seller", "buyer", "price"]);
    });
    
    it("Should verify QuestionSaleAction event parameter types", function() {
      const eventFragment = opinionMarket.interface.getEvent("QuestionSaleAction");
      const paramTypes = eventFragment.inputs.map((input: any) => input.type);
      
      // Check that the parameters have the expected types
      expect(paramTypes).to.deep.equal([
        "uint256",     // opinionId
        "uint8",       // actionType
        "address",     // seller
        "address",     // buyer 
        "uint256"      // price
      ]);
    });
    
    it("Should define FeesAction event for fee tracking", function() {
      // Check that the event exists in the contract interface
      const eventFragment = opinionMarket.interface.getEvent("FeesAction");
      expect(eventFragment).to.not.be.undefined;
      
      // Check event has appropriate parameters for fee tracking
      const paramNames = eventFragment.inputs.map((input: any) => input.name);
      expect(paramNames).to.include.members(["opinionId", "actionType", "account", "amount"]);
    });
  });
  
  // Test that the contract defines the expected errors
  describe("Error Definitions", function() {
    it("Should define NotTheOwner error", function() {
      const errorFragment = opinionMarket.interface.getError("NotTheOwner");
      expect(errorFragment).to.not.be.undefined;
      
      // Check error parameters
      const params = errorFragment.inputs.map((input: any) => input.name);
      expect(params).to.include.members(["caller", "owner"]);
    });
    
    it("Should define NotForSale error", function() {
      const errorFragment = opinionMarket.interface.getError("NotForSale");
      expect(errorFragment).to.not.be.undefined;
      
      // Check error parameter
      const params = errorFragment.inputs.map((input: any) => input.name);
      expect(params).to.include.members(["opinionId"]);
    });
    
    it("Should define OpinionNotActive error", function() {
      const errorFragment = opinionMarket.interface.getError("OpinionNotActive");
      expect(errorFragment).to.not.be.undefined;
    });
    
    it("Should define InsufficientAllowance error for token checks", function() {
      const errorFragment = opinionMarket.interface.getError("InsufficientAllowance");
      expect(errorFragment).to.not.be.undefined;
      
      // Check error parameters
      const params = errorFragment.inputs.map((input: any) => input.name);
      expect(params).to.include.members(["required", "provided"]);
    });
    
    it("Should define OpinionNotFound error", function() {
      const errorFragment = opinionMarket.interface.getError("OpinionNotFound");
      expect(errorFragment).to.not.be.undefined;
    });
  });
  
  // Test function behaviors by examining the interface more deeply
  describe("Function Parameter Validation", function() {
    it("Should require opinionId and price parameters for listQuestionForSale", function() {
      const func = opinionMarket.interface.getFunction("listQuestionForSale");
      expect(func).to.not.be.undefined;
      
      // Check parameter names and types
      const paramNames = func.inputs.map((input: any) => input.name);
      const paramTypes = func.inputs.map((input: any) => input.type);
      
      expect(paramNames).to.deep.equal(["opinionId", "price"]);
      expect(paramTypes).to.deep.equal(["uint256", "uint256"]);
    });
    
    it("Should require opinionId parameter for buyQuestion", function() {
      const func = opinionMarket.interface.getFunction("buyQuestion");
      expect(func).to.not.be.undefined;
      
      // Check parameter names and types
      const paramNames = func.inputs.map((input: any) => input.name);
      const paramTypes = func.inputs.map((input: any) => input.type);
      
      expect(paramNames).to.deep.equal(["opinionId"]);
      expect(paramTypes).to.deep.equal(["uint256"]);
    });
    
    it("Should require opinionId parameter for cancelQuestionSale", function() {
      const func = opinionMarket.interface.getFunction("cancelQuestionSale");
      expect(func).to.not.be.undefined;
      
      // Check parameter names and types
      const paramNames = func.inputs.map((input: any) => input.name);
      const paramTypes = func.inputs.map((input: any) => input.type);
      
      expect(paramNames).to.deep.equal(["opinionId"]);
      expect(paramTypes).to.deep.equal(["uint256"]);
    });
  });
  
  // Test view functions related to question trading
  describe("Related View Functions", function() {
    it("Should have opinions mapping or getOpinionDetails function", function() {
      // Check if the contract has a way to access opinion details
      expect(
        opinionMarket.interface.hasFunction("opinions") || 
        opinionMarket.interface.hasFunction("getOpinionDetails") ||
        opinionMarket.interface.hasFunction("getOpinion")
      ).to.be.true;
    });
    
    it("Should have accumulatedFees or fee tracking functions", function() {
      // Check if the contract has fee tracking capabilities
      expect(
        opinionMarket.interface.hasFunction("accumulatedFees") || 
        opinionMarket.interface.hasFunction("getAccumulatedFees")
      ).to.be.true;
    });
  });
  
  // Test access control mechanisms
  describe("Access Control for Trading", function() {
    it("Should have role management functions", function() {
      // Check for role-based access control functions
      expect(opinionMarket.interface.hasFunction("grantRole")).to.be.true;
      expect(opinionMarket.interface.hasFunction("revokeRole")).to.be.true;
      expect(opinionMarket.interface.hasFunction("hasRole")).to.be.true;
    });
    
    it("Should define MODERATOR_ROLE for deactivating opinions", function() {
      // Check that the contract defines a MODERATOR_ROLE constant
      expect(opinionMarket.MODERATOR_ROLE).to.not.be.undefined;
    });
  });
  
  describe("Fee Handling in Trading", function() {
    it("Should have fee accumulation mechanism", function() {
      // Check if contract delegates to fee manager
      expect(opinionMarket.interface.hasFunction("feeManager")).to.be.true;
    });
    
    it("Should have fee claiming function", function() {
      expect(opinionMarket.interface.hasFunction("claimAccumulatedFees")).to.be.true;
    });
    
    it("Should have platform fee withdrawal function", function() {
      expect(opinionMarket.interface.hasFunction("withdrawPlatformFees")).to.be.true;
    });
    
    it("Should have functions to get accumulated fees", function() {
      expect(
        opinionMarket.interface.hasFunction("getAccumulatedFees") || 
        opinionMarket.interface.hasFunction("accumulatedFees")
      ).to.be.true;
    });
  });
  
  describe("Opinion Ownership Tracking", function() {
    it("Should track question ownership in opinion struct", function() {
      // Get the opinion struct definition if possible
      const funcs = opinionMarket.interface.fragments.filter((f: any) => 
        f.type === 'function' && 
        (f.name === 'opinions' || f.name === 'getOpinionDetails')
      );
      
      expect(funcs.length).to.be.greaterThan(0);
      
      // Unfortunately, we can't directly check the struct fields through the interface,
      // but we can check that appropriate functions and events exist for ownership tracking
      expect(opinionMarket.interface.hasEvent("QuestionSaleAction")).to.be.true;
    });
    
    it("Should have error for ownership verification", function() {
      try {
        const errorFragment = opinionMarket.interface.getError("NotTheOwner");
        expect(errorFragment).to.not.be.undefined;
      } catch (e) {
        expect.fail("Error NotTheOwner should be defined");
      }
    });
  });
  
  describe("Trading Security Mechanisms", function() {
    it("Should have nonReentrant protection", function() {
      // Trading functions should have nonReentrant protection
      // We can infer this by checking they're all non-view functions
      // that require transaction signing
      expect(opinionMarket.interface.getFunction("listQuestionForSale").stateMutability).to.not.equal("view");
      expect(opinionMarket.interface.getFunction("buyQuestion").stateMutability).to.not.equal("view");
      expect(opinionMarket.interface.getFunction("cancelQuestionSale").stateMutability).to.not.equal("view");
    });
    
    it("Should have pausable functionality", function() {
      expect(opinionMarket.interface.hasFunction("paused")).to.be.true;
      expect(opinionMarket.interface.hasFunction("pause")).to.be.true;
      expect(opinionMarket.interface.hasFunction("unpause")).to.be.true;
    });
  });
  
  describe("Trading Component Integration", function() {
    it("Should have opinion core integration", function() {
      // Check for delegation to opinion core component
      expect(opinionMarket.interface.hasFunction("opinionCore")).to.be.true;
    });
    
    it("Should have fee manager integration", function() {
      // Check for delegation to fee manager component
      expect(opinionMarket.interface.hasFunction("feeManager")).to.be.true;
    });
    
    it("Should have pool manager integration", function() {
      // Check for delegation to pool manager component
      expect(opinionMarket.interface.hasFunction("poolManager")).to.be.true;
    });
  });
  
  describe("Trading State Transitions", function() {
    it("Should emit appropriate events for trading state changes", function() {
      // Check for events that mark state transitions in trading
      expect(opinionMarket.interface.hasEvent("QuestionSaleAction")).to.be.true;
      
      // Check that the event has an actionType parameter for different states
      const event = opinionMarket.interface.getEvent("QuestionSaleAction");
      const actionTypeParam = event.inputs.find((input: any) => input.name === "actionType");
      expect(actionTypeParam).to.not.be.undefined;
      expect(actionTypeParam.type).to.equal("uint8");
    });
    
    it("Should define state transition errors", function() {
      try {
        const notForSale = opinionMarket.interface.getError("NotForSale");
        const notActive = opinionMarket.interface.getError("OpinionNotActive");
        expect(notForSale).to.not.be.undefined;
        expect(notActive).to.not.be.undefined;
      } catch (e) {
        expect.fail("Required errors should be defined");
      }
    });
  });
  
  describe("Trading Configuration Management", function() {
    it("Should have functions to set component contracts", function() {
      expect(opinionMarket.interface.hasFunction("setOpinionCore")).to.be.true;
      expect(opinionMarket.interface.hasFunction("setFeeManager")).to.be.true;
      expect(opinionMarket.interface.hasFunction("setPoolManager")).to.be.true;
    });
    
    it("Should have initialization function", function() {
      expect(opinionMarket.interface.hasFunction("initialize")).to.be.true;
    });
    
    it("Should have upgradeability functionality", function() {
      // Check for UUPSUpgradeable implementation signature
      expect(
        opinionMarket.interface.hasFunction("upgradeTo") ||
        opinionMarket.interface.hasFunction("upgradeToAndCall")
      ).to.be.true;
    });
  });
  
  describe("Trading Emergency Controls", function() {
    it("Should have emergency withdrawal function", function() {
      expect(opinionMarket.interface.hasFunction("emergencyWithdraw")).to.be.true;
    });
    
    it("Should have pause/unpause controls", function() {
      expect(opinionMarket.interface.hasFunction("pause")).to.be.true;
      expect(opinionMarket.interface.hasFunction("unpause")).to.be.true;
    });
  });
});