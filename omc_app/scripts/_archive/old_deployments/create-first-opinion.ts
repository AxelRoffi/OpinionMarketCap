import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Creating your first opinion on OpinionCore...");
  
  const OPINION_CORE_ADDRESS = "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc";
  const MOCK_USDC_ADDRESS = "0xAb462fb7F8c952C63b62EF4371A60020e2abcA95";
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Using account: ${deployer.address}`);
  
  // Get contract instances
  const OpinionCore = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: "0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113",
    },
  });
  const opinionCore = OpinionCore.attach(OPINION_CORE_ADDRESS);
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = MockERC20.attach(MOCK_USDC_ADDRESS);
  
  // Opinion details
  const question = "Goat of Soccer ?";
  const answer = "Zidane";
  const description = "Panenka in WC 2006 Final";
  const initialPrice = 1_000_000; // 1 USDC
  const categories = ["Sports"];
  
  console.log("\n📝 Opinion Details:");
  console.log("===================");
  console.log(`Question: "${question}"`);
  console.log(`Answer: "${answer}"`);
  console.log(`Description: "${description}"`);
  console.log(`Initial Price: ${initialPrice / 1_000_000} USDC`);
  console.log(`Categories: ${JSON.stringify(categories)}`);
  
  // Calculate expected fee (20% with 5 USDC minimum)
  let expectedFee = Math.floor((initialPrice * 20) / 100);
  if (expectedFee < 5_000_000) {
    expectedFee = 5_000_000; // 5 USDC minimum
  }
  console.log(`💰 Expected Fee: ${expectedFee / 1_000_000} USDC (minimum 5 USDC applies)`);
  
  try {
    // Check USDC balance
    const usdcBalance = await mockUSDC.balanceOf(deployer.address);
    console.log(`\n💳 Current USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
    
    if (usdcBalance < expectedFee) {
      console.log("❌ Insufficient USDC balance! Minting more...");
      await mockUSDC.mint(deployer.address, ethers.parseUnits("100", 6));
      console.log("✅ Minted 100 USDC");
    }
    
    // Check allowance
    const allowance = await mockUSDC.allowance(deployer.address, OPINION_CORE_ADDRESS);
    console.log(`🔓 Current Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    if (allowance < expectedFee) {
      console.log("⚙️ Approving USDC spending...");
      const approveTx = await mockUSDC.approve(OPINION_CORE_ADDRESS, ethers.parseUnits("100", 6));
      await approveTx.wait();
      console.log("✅ USDC spending approved");
    }
    
    // Get treasury balance before
    const treasuryBalanceBefore = await mockUSDC.balanceOf(deployer.address);
    
    // Create the opinion
    console.log("\n🔨 Creating opinion...");
    const tx = await opinionCore.createOpinion(
      question,
      answer,
      description,
      initialPrice,
      categories
    );
    
    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt?.blockNumber}`);
    
    // Get the opinion ID from events
    const opinionActionEvents = receipt?.logs.filter((log: any) => {
      try {
        const parsed = opinionCore.interface.parseLog(log);
        return parsed?.name === 'OpinionAction';
      } catch {
        return false;
      }
    });
    
    if (opinionActionEvents && opinionActionEvents.length > 0) {
      const parsedEvent = opinionCore.interface.parseLog(opinionActionEvents[0]);
      const opinionId = parsedEvent?.args[0];
      console.log(`🎉 Opinion created with ID: ${opinionId}`);
      
      // Get opinion details
      console.log("\n📊 Opinion Details:");
      try {
        const opinionDetails = await opinionCore.getOpinionDetails(opinionId);
        console.log(`Creator: ${opinionDetails.creator}`);
        console.log(`Question: ${opinionDetails.question}`);
        console.log(`Current Answer: ${opinionDetails.currentAnswer}`);
        console.log(`Initial Price: ${Number(opinionDetails.lastPrice) / 1_000_000} USDC`);
        console.log(`Is Active: ${opinionDetails.isActive}`);
      } catch (e) {
        console.log("Could not fetch opinion details:", e);
      }
    }
    
    // Check treasury balance after
    const treasuryBalanceAfter = await mockUSDC.balanceOf(deployer.address);
    const feeCharged = Number(treasuryBalanceBefore - treasuryBalanceAfter) / 1_000_000;
    console.log(`💰 Fee charged to treasury: ${feeCharged} USDC`);
    
    console.log("\n🎊 SUCCESS! Your opinion has been created!");
    console.log(`🔗 View transaction: https://sepolia.basescan.org/tx/${tx.hash}`);
    console.log(`🔗 View contract: https://sepolia.basescan.org/address/${OPINION_CORE_ADDRESS}`);
    
  } catch (error: any) {
    console.error("❌ Error creating opinion:", error);
    if (error.message.includes("InsufficientAllowance")) {
      console.log("💡 Tip: Make sure to approve USDC spending first");
    } else if (error.message.includes("InvalidInitialPrice")) {
      console.log("💡 Tip: Initial price must be between 1-100 USDC");
    } else if (error.message.includes("UnauthorizedCreator")) {
      console.log("💡 Tip: Public creation might not be enabled");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });