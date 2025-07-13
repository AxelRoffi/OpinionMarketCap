import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing different approval amounts...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  
  const usdcAbi = [
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
  ];
  
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
  
  // Test different approval amounts
  const testAmounts = [
    {
      name: "100 USDC",
      amount: ethers.parseUnits("100", 6)
    },
    {
      name: "1000 USDC", 
      amount: ethers.parseUnits("1000", 6)
    },
    {
      name: "1 Million USDC",
      amount: ethers.parseUnits("1000000", 6)
    },
    {
      name: "Conservative Large (1 Trillion)",
      amount: BigInt("1000000000000000000000000") // 1 trillion with 6 decimals
    },
    {
      name: "Max uint256",
      amount: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    }
  ];
  
  for (const test of testAmounts) {
    console.log(`\n🔄 Testing ${test.name}: ${test.amount.toString()}`);
    
    try {
      const tx = await usdc.approve(OPINION_CORE, test.amount);
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      
      const allowance = await usdc.allowance(signer.address, OPINION_CORE);
      console.log(`✅ Success! New allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
      
    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
      if (error.message.includes("user rejected")) {
        console.log("   (User rejected transaction)");
        break;
      }
    }
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});