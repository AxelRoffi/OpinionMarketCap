import { ethers } from "hardhat";

async function main() {
  console.log("\n🔧 CHECKING PRICING PARAMETERS (DIRECT APPROACH)");
  console.log("=" .repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Connected with account:", deployer.address);
  
  // Your contract address
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";

  // Minimal ABI for the functions we need
  const MINIMAL_ABI = [
    "function minimumPrice() view returns (uint96)",
    "function questionCreationFee() view returns (uint96)", 
    "function initialAnswerPrice() view returns (uint96)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function ADMIN_ROLE() view returns (bytes32)",
    "function setMinimumPrice(uint96 _minimumPrice) external",
    "function setQuestionCreationFee(uint96 _questionCreationFee) external",
    "function setInitialAnswerPrice(uint96 _initialAnswerPrice) external",
    "function nextOpinionId() view returns (uint256)"
  ];

  try {
    // Connect to contract with minimal ABI
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, deployer);

    console.log("\n📋 CURRENT PRICING PARAMETERS");
    console.log("-".repeat(40));

    // Read current pricing parameters
    const minimumPrice = await contract.minimumPrice();
    const questionCreationFee = await contract.questionCreationFee();
    const initialAnswerPrice = await contract.initialAnswerPrice();
    const nextOpinionId = await contract.nextOpinionId();

    console.log("📊 Current Settings:");
    console.log("   • Minimum Price:", ethers.formatUnits(minimumPrice, 6), "USDC");
    console.log("   • Question Creation Fee:", ethers.formatUnits(questionCreationFee, 6), "USDC");
    console.log("   • Initial Answer Price:", ethers.formatUnits(initialAnswerPrice, 6), "USDC");
    console.log("   • Next Opinion ID:", nextOpinionId.toString(), "(total opinions created)");

    // Check admin role
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
    
    console.log("\n🔐 ADMIN STATUS:");
    console.log("   • Your address has ADMIN_ROLE:", hasAdminRole);

    console.log("\n🧮 HOW OPINION CREATION FEE WORKS:");
    console.log("-".repeat(50));
    console.log("📝 Current logic in createOpinion() function:");
    console.log("1. creationFee = 20% of initialPrice");
    console.log("2. if (creationFee < 5 USDC) { creationFee = 5 USDC; }");
    console.log("3. User pays the creationFee");
    
    console.log("\n📈 Examples with current system:");
    const examples = [
      { initialPrice: 1, fee: Math.max(1 * 0.2, 5) },
      { initialPrice: 5, fee: Math.max(5 * 0.2, 5) },
      { initialPrice: 10, fee: Math.max(10 * 0.2, 5) },
      { initialPrice: 25, fee: Math.max(25 * 0.2, 5) },
      { initialPrice: 50, fee: Math.max(50 * 0.2, 5) },
      { initialPrice: 100, fee: Math.max(100 * 0.2, 5) }
    ];

    examples.forEach(example => {
      console.log(`   • Opinion priced at ${example.initialPrice} USDC → Creation fee: ${example.fee} USDC`);
    });

    console.log("\n❗ IMPORTANT UNDERSTANDING:");
    console.log("-".repeat(35));
    console.log("🔹 The 20% and 5 USDC minimum are HARDCODED in the contract");
    console.log("🔹 questionCreationFee variable is NOT used in the current logic");
    console.log("🔹 To change creation fee logic, you need a contract upgrade");

    console.log("\n✅ WHAT YOU CAN MODIFY RIGHT NOW:");
    console.log("-".repeat(40));
    console.log("1. minimumPrice - Affects minimum price for answer trading");
    console.log("2. initialAnswerPrice - Default price for answer submissions");
    console.log("3. questionCreationFee - Currently unused, but could be used in upgrades");

    if (hasAdminRole) {
      console.log("\n🚀 EXAMPLE: Change minimum trading price to 0.5 USDC:");
      console.log("await contract.setMinimumPrice(ethers.parseUnits('0.5', 6));");
      
      console.log("\n🚀 EXAMPLE: Change initial answer price to 3 USDC:");
      console.log("await contract.setInitialAnswerPrice(ethers.parseUnits('3', 6));");

      console.log("\n❓ Would you like me to make any changes? (Current values seem reasonable)");
    } else {
      console.log("\n❌ You need ADMIN_ROLE to modify these parameters");
    }

    console.log("\n💡 SUMMARY:");
    console.log("-".repeat(20));
    console.log("• Creation fee: 20% of initial price, minimum 5 USDC (hardcoded)");
    console.log("• Trading minimum: " + ethers.formatUnits(minimumPrice, 6) + " USDC (adjustable)");
    console.log("• Answer price: " + ethers.formatUnits(initialAnswerPrice, 6) + " USDC (adjustable)");
    console.log("• Total opinions created:", (Number(nextOpinionId) - 1).toString());

    console.log("\n🔧 TO CHANGE CREATION FEE LOGIC:");
    console.log("You would need to modify the createOpinion() function in a contract upgrade");
    console.log("Current logic works well - prevents spam with 5 USDC minimum");

  } catch (error) {
    console.error("❌ Failed to check parameters:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});