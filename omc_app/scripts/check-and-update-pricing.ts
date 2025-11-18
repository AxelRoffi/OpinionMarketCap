import { ethers } from "hardhat";
import fs from 'fs';

async function main() {
  console.log("\n🔧 CHECKING AND UPDATING PRICING PARAMETERS");
  console.log("=" .repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Connected with account:", deployer.address);
  
  // Get current balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Your contract address
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";

  try {
    console.log("\n📋 CURRENT PRICING PARAMETERS");
    console.log("-".repeat(40));

    // Connect to your existing contract
    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    const contract = OpinionCore.attach(CONTRACT_ADDRESS);

    // Read current pricing parameters
    const minimumPrice = await contract.minimumPrice();
    const questionCreationFee = await contract.questionCreationFee();
    const initialAnswerPrice = await contract.initialAnswerPrice();

    console.log("📊 Current Settings:");
    console.log("   • Minimum Price:", ethers.formatUnits(minimumPrice, 6), "USDC");
    console.log("   • Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
    console.log("   • Initial Answer Price:", ethers.formatUnits(initialAnswerPrice, 6), "USDC");

    console.log("\n🧮 HOW OPINION CREATION FEE IS CALCULATED:");
    console.log("-".repeat(50));
    console.log("Current logic in createOpinion():");
    console.log("1. Base fee = 20% of initialPrice");
    console.log("2. Minimum fee = 5 USDC");
    console.log("3. Final fee = max(20% of initialPrice, 5 USDC)");
    
    console.log("\n📈 Examples with current logic:");
    const examples = [
      { initialPrice: 1, expected: 5 },      // 20% of 1 = 0.2, but min is 5
      { initialPrice: 5, expected: 5 },      // 20% of 5 = 1, but min is 5  
      { initialPrice: 10, expected: 5 },     // 20% of 10 = 2, but min is 5
      { initialPrice: 25, expected: 5 },     // 20% of 25 = 5, equals min
      { initialPrice: 50, expected: 10 },    // 20% of 50 = 10, exceeds min
      { initialPrice: 100, expected: 20 }    // 20% of 100 = 20, exceeds min
    ];

    examples.forEach(example => {
      console.log(`   • ${example.initialPrice} USDC initial → ${example.expected} USDC fee`);
    });

    console.log("\n❓ DO YOU WANT TO UPDATE THESE PARAMETERS?");
    console.log("-".repeat(50));
    console.log("Available admin functions you can call:");
    console.log("1. setMinimumPrice(uint96 _minimumPrice)");
    console.log("2. setQuestionCreationFee(uint96 _questionCreationFee) - NOTE: This is unused in current logic");
    console.log("3. setInitialAnswerPrice(uint96 _initialAnswerPrice) - For answer submissions");

    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("• The 20% calculation is HARDCODED in createOpinion()");
    console.log("• The 5 USDC minimum is HARDCODED in createOpinion()");  
    console.log("• To change these, you'd need a contract upgrade");
    console.log("• You CAN change minimumPrice for trading (not creation fees)");

    console.log("\n🔧 WHAT YOU CAN MODIFY NOW:");
    console.log("• minimumPrice: Affects minimum trading price for answers");
    console.log("• initialAnswerPrice: Default price for answer submissions");
    console.log("• questionCreationFee: Currently unused in the code");

    // Check if user has admin role
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("\n🔐 ADMIN STATUS:");
    console.log("   • Your address has ADMIN_ROLE:", hasAdminRole);

    if (hasAdminRole) {
      console.log("\n✅ You can call these functions directly:");
      console.log("   • contract.setMinimumPrice(newPrice)");
      console.log("   • contract.setInitialAnswerPrice(newPrice)");
    } else {
      console.log("\n❌ You need ADMIN_ROLE to modify parameters");
    }

    // Show current creation fee logic from contract
    console.log("\n📝 CURRENT CREATION FEE CODE:");
    console.log(`
// From createOpinion() function:
uint96 creationFee = uint96((initialPrice * 20) / 100);
if (creationFee < 5_000_000) { // 5 USDC minimum
    creationFee = 5_000_000;
}
    `);

    console.log("\n💡 RECOMMENDATIONS:");
    console.log("• If you want different creation fee logic, you need a contract upgrade");
    console.log("• If you want to adjust trading minimums, use setMinimumPrice()"); 
    console.log("• Current system works well - 5 USDC minimum prevents spam");

  } catch (error) {
    console.error("❌ Failed to check parameters:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});