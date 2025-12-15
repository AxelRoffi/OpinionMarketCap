import { ethers } from "hardhat";

async function main() {
  console.log("🏆 Creating 'Goat of Soccer' Opinion...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Contract addresses
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // Opinion data
  const QUESTION = "Goat of soccer ?";
  const ANSWER = "Zidane";
  const DESCRIPTION = "Panenka in 2006 WC Final";
  const INITIAL_PRICE = 1_000_000; // 1 USDC (6 decimals)
  const CATEGORIES = ["Sports"];

  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Get contract instances
  const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
  const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);

  console.log("");
  console.log("🔍 Checking current state...");
  
  // Check current opinions count
  const nextOpinionId = await opinionCore.nextOpinionId();
  console.log("📊 Current opinions count:", (Number(nextOpinionId) - 1).toString());

  // Check USDC balance
  const usdcBalance = await usdc.balanceOf(deployer.address);
  console.log("💵 USDC balance:", ethers.formatUnits(usdcBalance, 6), "USDC");

  // Check allowance
  const allowance = await usdc.allowance(deployer.address, OPINION_CORE_ADDRESS);
  console.log("✅ Current allowance:", ethers.formatUnits(allowance, 6), "USDC");

  // Calculate creation fee (5 USDC minimum since 1 USDC < 25 USDC)
  const creationFee = 5_000_000; // 5 USDC minimum for prices under 25 USDC
  console.log("💰 Creation fee needed:", ethers.formatUnits(creationFee, 6), "USDC");

  // Step 1: Approve USDC if needed
  if (Number(allowance) < creationFee) {
    console.log("");
    console.log("🔓 Step 1: Approving USDC...");
    const approveTx = await usdc.approve(OPINION_CORE_ADDRESS, creationFee);
    await approveTx.wait();
    console.log("✅ USDC approved for creation fee");
  } else {
    console.log("✅ USDC already approved");
  }

  // Step 2: Create opinion
  console.log("");
  console.log("🏆 Step 2: Creating opinion...");
  console.log("Question:", QUESTION);
  console.log("Answer:", ANSWER);
  console.log("Description:", DESCRIPTION);
  console.log("Initial Price:", ethers.formatUnits(INITIAL_PRICE, 6), "USDC");
  console.log("Categories:", CATEGORIES);

  try {
    const createTx = await opinionCore.createOpinionWithExtras(
      QUESTION,
      ANSWER,
      DESCRIPTION,
      INITIAL_PRICE,
      CATEGORIES,
      "", // empty ipfsHash
      ""  // empty link
    );

    console.log("📋 Transaction hash:", createTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await createTx.wait();
    console.log("✅ Opinion created successfully!");
    console.log("🔗 Transaction:", `https://sepolia.basescan.org/tx/${createTx.hash}`);

    // Get the new opinion ID from events
    const newOpinionId = await opinionCore.nextOpinionId();
    const opinionId = Number(newOpinionId) - 1;
    console.log("🆔 New Opinion ID:", opinionId);

    // Verify the opinion was created
    console.log("");
    console.log("🔍 Verifying opinion...");
    const opinion = await opinionCore.getOpinionDetails(opinionId);
    console.log("✅ Question:", opinion.question);
    console.log("✅ Answer:", opinion.currentAnswer);
    console.log("✅ Creator:", opinion.creator);
    console.log("✅ Active:", opinion.isActive);
    console.log("✅ Categories:", await opinionCore.getOpinionCategories(opinionId));

  } catch (error) {
    console.log("❌ Failed to create opinion:", error);
  }

  console.log("");
  console.log("🎉 Opinion creation completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });