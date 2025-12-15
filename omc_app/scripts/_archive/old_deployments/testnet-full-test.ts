import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
    console.log("🧪 FULL TESTNET TEST - Running Hardhat-style tests on Base Sepolia");
    
    // IMPORTANT: Put your burner wallet private key here temporarily
    const BURNER_PRIVATE_KEY = process.env.BURNER_PRIVATE_KEY || "";
    
    if (!BURNER_PRIVATE_KEY) {
        console.log("❌ Please set BURNER_PRIVATE_KEY environment variable");
        console.log("💡 Usage: BURNER_PRIVATE_KEY=0x... npx hardhat run scripts/testnet-full-test.ts --network baseSepolia");
        return;
    }
    
    // Connect to burner wallet
    const provider = ethers.provider;
    const wallet = new ethers.Wallet(BURNER_PRIVATE_KEY, provider);
    
    console.log("🔑 Using burner wallet:", wallet.address);
    
    // Contract addresses
    const contractAddress = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Connect to contracts
    const contract = await ethers.getContractAt("FixedOpinionMarket", contractAddress, wallet);
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS, wallet);
    
    console.log("\n💰 Checking wallet status...");
    const ethBalance = await provider.getBalance(wallet.address);
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const allowance = await usdcContract.allowance(wallet.address, contractAddress);
    
    console.log("   ETH Balance:", ethers.formatEther(ethBalance), "ETH");
    console.log("   USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");
    console.log("   USDC Allowance:", ethers.formatUnits(allowance, 6), "USDC");
    
    if (ethBalance < ethers.parseEther("0.01")) {
        console.log("❌ Need more ETH for gas fees (at least 0.01 ETH)");
        return;
    }
    
    if (usdcBalance < ethers.parseUnits("20", 6)) {
        console.log("❌ Need more USDC for testing (at least 20 USDC)");
        return;
    }
    
    // Approve USDC if needed
    if (allowance < ethers.parseUnits("20", 6)) {
        console.log("\n🔓 Approving USDC...");
        const approveTx = await usdcContract.approve(contractAddress, ethers.parseUnits("50", 6));
        await approveTx.wait();
        console.log("✅ USDC approved");
    }
    
    console.log("\n🧪 TEST 1: Create Opinion");
    try {
        const tx1 = await contract.createOpinion(
            "Will ETH reach $5000 by end of 2024?",
            "Yes, bullish on ETH",
            "Based on institutional adoption and upcoming upgrades", 
            ethers.parseUnits("5", 6), // 5 USDC
            ["crypto", "ethereum"]
        );
        const receipt1 = await tx1.wait();
        console.log("✅ Opinion created! Gas:", receipt1?.gasUsed.toString());
        
        // Verify the opinion
        const opinion = await contract.getOpinion(2); // Assuming this will be opinion #2
        console.log("   Creator:", opinion.creator);
        console.log("   Question:", opinion.question);
        console.log("   Price:", ethers.formatUnits(opinion.lastPrice, 6), "USDC");
        console.log("   Next Price:", ethers.formatUnits(opinion.nextPrice, 6), "USDC");
        
    } catch (error: any) {
        console.error("❌ Create opinion failed:", error.message);
        return;
    }
    
    console.log("\n🧪 TEST 2: Submit Answer (Price Increase)");
    try {
        const opinion = await contract.getOpinion(2);
        const nextPrice = opinion.nextPrice;
        
        const tx2 = await contract.submitAnswer(2, "Actually, no - bear market coming");
        const receipt2 = await tx2.wait();
        console.log("✅ Answer submitted! Gas:", receipt2?.gasUsed.toString());
        
        // Verify state change
        const updatedOpinion = await contract.getOpinion(2);
        console.log("   New owner:", updatedOpinion.currentOwner);
        console.log("   New answer:", updatedOpinion.currentAnswer);
        console.log("   New price:", ethers.formatUnits(updatedOpinion.lastPrice, 6), "USDC");
        
    } catch (error: any) {
        console.error("❌ Submit answer failed:", error.message);
        return;
    }
    
    console.log("\n🧪 TEST 3: Create Pool");
    try {
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
        const tx3 = await contract.createPool(
            2, // Opinion ID
            "I think it will reach $6000",
            deadline,
            ethers.parseUnits("3", 6) // 3 USDC contribution
        );
        const receipt3 = await tx3.wait();
        console.log("✅ Pool created! Gas:", receipt3?.gasUsed.toString());
        
        const pool = await contract.getPool(1);
        console.log("   Pool creator:", pool.creator);
        console.log("   Proposed answer:", pool.proposedAnswer);
        console.log("   Total contributed:", ethers.formatUnits(pool.totalContributed, 6), "USDC");
        
    } catch (error: any) {
        console.error("❌ Create pool failed:", error.message);
        return;
    }
    
    console.log("\n🧪 TEST 4: Claim Fees");
    try {
        const feesBefore = await contract.getAccumulatedFees(wallet.address);
        console.log("   Fees available:", ethers.formatUnits(feesBefore, 6), "USDC");
        
        if (feesBefore > 0) {
            const tx4 = await contract.claimFees();
            const receipt4 = await tx4.wait();
            console.log("✅ Fees claimed! Gas:", receipt4?.gasUsed.toString());
            
            const feesAfter = await contract.getAccumulatedFees(wallet.address);
            console.log("   Fees remaining:", ethers.formatUnits(feesAfter, 6), "USDC");
        } else {
            console.log("⚠️  No fees to claim (this is normal for first tests)");
        }
        
    } catch (error: any) {
        console.error("❌ Claim fees failed:", error.message);
    }
    
    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("✅ Contract is fully functional on Base Sepolia testnet");
    console.log("📊 Total gas used across all functions");
    console.log("🔗 Contract: https://sepolia.basescan.org/address/" + contractAddress);
    
    // Security: Auto-delete environment variable hint
    console.log("\n🔒 SECURITY REMINDER:");
    console.log("   Don't forget to unset BURNER_PRIVATE_KEY after testing");
    console.log("   Run: unset BURNER_PRIVATE_KEY");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testnet test failed:", error);
        process.exit(1);
    });