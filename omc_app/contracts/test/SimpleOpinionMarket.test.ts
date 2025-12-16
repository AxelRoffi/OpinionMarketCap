import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SimpleOpinionMarket, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleOpinionMarket - PRODUCTION DEBUG", function () {
    let contract: SimpleOpinionMarket;
    let usdc: IERC20;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy contract
        const SimpleOpinionMarket = await ethers.getContractFactory("SimpleOpinionMarket");
        contract = await upgrades.deployProxy(SimpleOpinionMarket, [
            USDC_ADDRESS,
            owner.address
        ], {
            initializer: 'initialize',
            kind: 'uups'
        }) as unknown as SimpleOpinionMarket;
        
        // Get USDC contract
        usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    });
    
    describe("🔍 DIAGNOSTIC TESTS", function () {
        it("Should have correct initial state", async function () {
            expect(await contract.usdcToken()).to.equal(USDC_ADDRESS);
            expect(await contract.treasury()).to.equal(owner.address);
            expect(await contract.nextOpinionId()).to.equal(1);
            expect(await contract.nextPoolId()).to.equal(1);
        });
        
        it("Should have proper access control", async function () {
            const ADMIN_ROLE = await contract.ADMIN_ROLE();
            expect(await contract.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
        });
    });
    
    describe("❌ BROKEN FUNCTION ANALYSIS", function () {
        it("DEBUG: createOpinion failure analysis", async function () {
            // Test different scenarios to find the exact failure point
            
            console.log("🧪 Testing createOpinion with various inputs...");
            
            // Test 1: Empty question
            try {
                await contract.createOpinion("", "answer", ethers.parseUnits("2", 6));
                console.log("❌ Empty question should have failed");
            } catch (e: any) {
                console.log("✅ Empty question correctly failed:", e.message);
            }
            
            // Test 2: Empty answer  
            try {
                await contract.createOpinion("question", "", ethers.parseUnits("2", 6));
                console.log("❌ Empty answer should have failed");
            } catch (e: any) {
                console.log("✅ Empty answer correctly failed:", e.message);
            }
            
            // Test 3: Price too low
            try {
                await contract.createOpinion("question", "answer", ethers.parseUnits("1", 6));
                console.log("❌ Low price should have failed");
            } catch (e: any) {
                console.log("✅ Low price correctly failed:", e.message);
            }
            
            // Test 4: Price too high
            try {
                await contract.createOpinion("question", "answer", ethers.parseUnits("101", 6));
                console.log("❌ High price should have failed");
            } catch (e: any) {
                console.log("✅ High price correctly failed:", e.message);
            }
            
            // Test 5: No USDC allowance (this might be the issue!)
            try {
                await contract.connect(user1).createOpinion(
                    "Valid question", 
                    "Valid answer", 
                    ethers.parseUnits("2", 6)
                );
                console.log("❌ No allowance should have failed");
            } catch (e: any) {
                console.log("🎯 NO ALLOWANCE ERROR:", e.message);
                console.log("🎯 ERROR DATA:", e.data);
            }
            
            // Test 6: With proper allowance
            try {
                // Give user1 some USDC (if possible in test)
                // This will fail in fork test, but let's see the error
                await usdc.connect(user1).approve(await contract.getAddress(), ethers.parseUnits("10", 6));
                
                await contract.connect(user1).createOpinion(
                    "Valid question", 
                    "Valid answer", 
                    ethers.parseUnits("2", 6)
                );
                console.log("✅ Valid createOpinion succeeded!");
            } catch (e: any) {
                console.log("🎯 WITH ALLOWANCE ERROR:", e.message);
                console.log("🎯 ERROR DATA:", e.data);
            }
        });
        
        it("DEBUG: Decode error 0xd93c0665", async function () {
            // This error signature might correspond to a specific require() or custom error
            const errorSig = "0xd93c0665";
            console.log("🔍 Decoding error signature:", errorSig);
            
            // Common Solidity error signatures:
            // 0x08c379a0 = Error(string)
            // 0x4e487b71 = Panic(uint256) 
            // Custom errors have their own signatures
            
            // Let's try to trigger the same error and catch more details
            try {
                const tx = await contract.createOpinion.populateTransaction(
                    "Valid question",
                    "Valid answer", 
                    ethers.parseUnits("2", 6)
                );
                
                // Try to estimate gas to see what happens
                const gasEstimate = await owner.estimateGas(tx);
                console.log("Gas estimate worked:", gasEstimate);
                
            } catch (e: any) {
                console.log("🎯 DETAILED ERROR:");
                console.log("   Message:", e.message);
                console.log("   Code:", e.code);
                console.log("   Data:", e.data);
                console.log("   Reason:", e.reason);
                
                // Check if it's the same error
                if (e.data === errorSig) {
                    console.log("✅ CONFIRMED: Same error signature");
                }
            }
        });
    });
    
    describe("🔧 COMPONENT TESTING", function () {
        it("Should validate USDC integration", async function () {
            const contractAddress = await contract.getAddress();
            
            // Check if we can call USDC functions
            const decimals = await usdc.decimals();
            expect(decimals).to.equal(6);
            
            // Check balances
            const ownerBalance = await usdc.balanceOf(owner.address);
            console.log("Owner USDC balance:", ethers.formatUnits(ownerBalance, 6));
            
            // Check allowances
            const allowance = await usdc.allowance(owner.address, contractAddress);
            console.log("Contract allowance:", ethers.formatUnits(allowance, 6));
        });
        
        it("Should test internal calculations", async function () {
            // Test if we can call view functions that might use internal logic
            try {
                const opinion = await contract.getOpinion(1);
                console.log("✅ getOpinion works for non-existent opinion");
            } catch (e: any) {
                console.log("❌ getOpinion failed:", e.message);
            }
            
            try {
                const pool = await contract.getPool(1);
                console.log("✅ getPool works for non-existent pool");
            } catch (e: any) {
                console.log("❌ getPool failed:", e.message);
            }
        });
    });
});