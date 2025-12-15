import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  const [signer] = await ethers.getSigners();
  
  // First approve USDC
  const usdcAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
  
  console.log('Approving 5 USDC for contract...');
  const approveTx = await usdc.approve(contractAddress, ethers.parseUnits("5", 6));
  await approveTx.wait();
  console.log('✅ USDC approved');
  
  // Then create opinion
  const opinionAbi = [
    "function createOpinion(string question, string answer, string description, uint96 initialPrice, string[] categories) external"
  ];
  const contract = new ethers.Contract(contractAddress, opinionAbi, signer);
  
  console.log('Creating Paris opinion...');
  const tx = await contract.createOpinion(
    "Most beautiful city",
    "Paris", 
    "history, culture, fine dining...most visited city in the world !",
    ethers.parseUnits("2", 6), // 2 USDC
    ["Entertainment"]
  );
  
  console.log('Transaction sent:', tx.hash);
  await tx.wait();
  console.log('✅ Paris opinion created successfully!');
  
  // Check nextOpinionId
  const nextOpinionIdAbi = ["function nextOpinionId() view returns (uint256)"];
  const readContract = new ethers.Contract(contractAddress, nextOpinionIdAbi, signer);
  const nextOpinionId = await readContract.nextOpinionId();
  console.log('nextOpinionId is now:', nextOpinionId.toString());
}

main().catch(console.error);