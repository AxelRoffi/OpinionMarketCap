// Simple script to show how to moderate an answer
// Run: npx hardhat run moderate-answer-example.js --network baseSepolia

const { ethers } = require("hardhat");

async function main() {
  console.log("🛡️ Admin Moderation Example");
  
  // Your contract address
  const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
  
  // Get the contract (use whatever ABI you have available)
  const contract = await ethers.getContractAt("OpinionCore", CONTRACT_ADDRESS);
  
  // Example: Moderate opinion #1 
  const opinionId = 1;
  const reason = "Inappropriate content violation";
  
  console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`🎯 Moderating Opinion #${opinionId}`);
  console.log(`📝 Reason: ${reason}`);
  
  try {
    // Check if you have moderator role
    const [signer] = await ethers.getSigners();
    const moderatorRole = await contract.MODERATOR_ROLE();
    const hasRole = await contract.hasRole(moderatorRole, signer.address);
    
    console.log(`👤 Your address: ${signer.address}`);
    console.log(`🔑 Has moderator role: ${hasRole}`);
    
    if (!hasRole) {
      console.log("❌ You need MODERATOR_ROLE to moderate answers");
      console.log("Grant yourself the role first with:");
      console.log(`await contract.grantRole("${moderatorRole}", "${signer.address}")`);
      return;
    }
    
    // Get opinion details before moderation
    const opinion = await contract.getOpinion(opinionId);
    console.log(`📊 Current Answer: "${opinion.currentAnswer}"`);
    console.log(`👥 Current Owner: ${opinion.currentAnswerOwner}`);
    console.log(`💰 Current Price: ${ethers.formatUnits(opinion.nextPrice, 6)} USDC`);
    
    // Moderate the answer
    console.log("\n🚨 Moderating answer...");
    const tx = await contract.moderateAnswer(opinionId, reason);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    await tx.wait();
    console.log("✅ Answer moderated successfully!");
    
    // Check new state
    const updatedOpinion = await contract.getOpinion(opinionId);
    console.log(`\n📊 After Moderation:`);
    console.log(`📝 New Answer: "${updatedOpinion.currentAnswer}"`);
    console.log(`👥 New Owner: ${updatedOpinion.currentAnswerOwner}`);
    console.log(`💰 Price: ${ethers.formatUnits(updatedOpinion.nextPrice, 6)} USDC (kept same)`);
    
  } catch (error) {
    if (error.message.includes("No answer to moderate")) {
      console.log("❌ Cannot moderate: Creator is still the owner (no inappropriate answer to moderate)");
    } else if (error.message.includes("OpinionNotFound")) {
      console.log("❌ Opinion not found");
    } else if (error.message.includes("AccessControl")) {
      console.log("❌ Access denied: You need MODERATOR_ROLE");
    } else {
      console.log("❌ Moderation failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });