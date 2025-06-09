import { ethers } from "hardhat";

async function main() {
    console.log("🔓 Approving USDC for OpinionMarket contract...");
    
    const [deployer] = await ethers.getSigners();
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const CONTRACT_ADDRESS = "0x74D301e0623608C9CE44390C1654D5340c8eCa1C";
    
    // Connect to USDC
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("📝 Account:", deployer.address);
    console.log("💰 USDC Contract:", USDC_ADDRESS);
    console.log("🏦 OpinionMarket Contract:", CONTRACT_ADDRESS);
    
    // Check current status
    const balance = await usdcContract.balanceOf(deployer.address);
    const currentAllowance = await usdcContract.allowance(deployer.address, CONTRACT_ADDRESS);
    
    console.log("\n📊 Current Status:");
    console.log("   USDC Balance:", ethers.formatUnits(balance, 6), "USDC");
    console.log("   Current Allowance:", ethers.formatUnits(currentAllowance, 6), "USDC");
    
    if (balance === 0n) {
        console.log("\n❌ No USDC balance! Get USDC from faucet first:");
        console.log("   https://faucet.circle.com/");
        return;
    }
    
    // Approve 100 USDC
    const approveAmount = ethers.parseUnits("100", 6);
    console.log("\n🔓 Approving 100 USDC...");
    
    const tx = await usdcContract.approve(CONTRACT_ADDRESS, approveAmount);
    console.log("📡 Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Approval confirmed!");
    console.log("   Gas used:", receipt?.gasUsed.toString());
    
    // Verify
    const newAllowance = await usdcContract.allowance(deployer.address, CONTRACT_ADDRESS);
    console.log("   New Allowance:", ethers.formatUnits(newAllowance, 6), "USDC");
    
    console.log("\n🎉 Ready! You can now call createOpinion on the contract!");
    console.log("🔗 View transaction: https://sepolia.basescan.org/tx/" + tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Approval failed:", error);
        process.exit(1);
    });