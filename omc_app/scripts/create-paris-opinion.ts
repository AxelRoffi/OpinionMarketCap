import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  const abi = [
    "function createOpinion(string question, string answer, string description, uint96 initialPrice, string[] categories) external"
  ];
  
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  try {
    console.log('Creating Paris opinion...');
    console.log('Signer:', signer.address);
    
    const tx = await contract.createOpinion(
      "Most beautiful city",
      "Paris", 
      "history, culture, fine dining...most visited city in the world !",
      ethers.parseUnits("2", 6), // 2 USDC
      ["Entertainment"]
    );
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    await tx.wait();
    console.log('✅ Paris opinion created successfully!');
    
    // Check nextOpinionId
    const nextOpinionIdAbi = ["function nextOpinionId() view returns (uint256)"];
    const readContract = new ethers.Contract(contractAddress, nextOpinionIdAbi, signer);
    const nextOpinionId = await readContract.nextOpinionId();
    console.log('nextOpinionId is now:', nextOpinionId.toString());
    
  } catch (error) {
    console.error('❌ Error creating opinion:', error);
  }
}

main().catch(console.error);