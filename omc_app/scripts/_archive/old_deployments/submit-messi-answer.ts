import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  // Use PRIVATE_KEY_2 from environment
  const privateKey2 = process.env.PRIVATE_KEY_2;
  if (!privateKey2) {
    throw new Error('PRIVATE_KEY_2 not found in environment variables');
  }
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const signer = new ethers.Wallet(privateKey2, provider);
  
  console.log('Using second wallet:', signer.address);
  
  // Check opinion 1 details first
  const opinionAbi = [
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))",
    "function submitAnswer(uint256 opinionId, string answer, string description) external"
  ];
  
  const contract = new ethers.Contract(contractAddress, opinionAbi, signer);
  
  try {
    console.log('\n=== CHECKING OPINION 1 ===');
    const opinion = await contract.getOpinionDetails(1);
    console.log('✅ Opinion exists');
    console.log('- Question:', opinion.question);
    console.log('- Current Answer:', opinion.currentAnswer);
    console.log('- Current Owner:', opinion.currentAnswerOwner);
    console.log('- Next Price (USDC):', ethers.formatUnits(opinion.nextPrice, 6));
    console.log('- Active:', opinion.isActive);
    
    // Check if this wallet is different from current owner
    if (opinion.currentAnswerOwner.toLowerCase() === signer.address.toLowerCase()) {
      console.log('❌ ERROR: This wallet is also the current owner!');
      return;
    }
    
    console.log('✅ Different wallet - can submit answer');
    
    // Check USDC balance and allowance
    const usdcAbi = [
      "function allowance(address,address) view returns (uint256)", 
      "function balanceOf(address) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ];
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    
    const balance = await usdc.balanceOf(signer.address);
    const allowance = await usdc.allowance(signer.address, contractAddress);
    const requiredPrice = opinion.nextPrice;
    
    console.log('\n=== CHECKING USDC ===');
    console.log('- Balance:', ethers.formatUnits(balance, 6), 'USDC');
    console.log('- Allowance:', ethers.formatUnits(allowance, 6), 'USDC');
    console.log('- Required:', ethers.formatUnits(requiredPrice, 6), 'USDC');
    
    if (balance < requiredPrice) {
      console.log('❌ ERROR: Insufficient USDC balance');
      console.log('Need at least:', ethers.formatUnits(requiredPrice, 6), 'USDC');
      return;
    }
    
    if (allowance < requiredPrice) {
      console.log('⚠️  Need to approve USDC first...');
      const approveTx = await usdc.approve(contractAddress, requiredPrice);
      console.log('Approval transaction:', approveTx.hash);
      await approveTx.wait();
      console.log('✅ USDC approved');
    }
    
    // Submit the answer
    console.log('\n=== SUBMITTING ANSWER ===');
    console.log('Changing answer from "Zidane" to "Messi"');
    console.log('Description: "WC & CL winners and 20 seasons at top level"');
    
    const tx = await contract.submitAnswer(
      1, // opinionId
      "Messi", // new answer
      "WC & CL winners and 20 seasons at top level" // description
    );
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    await tx.wait();
    console.log('✅ Answer submitted successfully!');
    
    // Check the updated opinion
    console.log('\n=== UPDATED OPINION ===');
    const updatedOpinion = await contract.getOpinionDetails(1);
    console.log('- New Answer:', updatedOpinion.currentAnswer);
    console.log('- New Owner:', updatedOpinion.currentAnswerOwner);
    console.log('- New Price (USDC):', ethers.formatUnits(updatedOpinion.nextPrice, 6));
    
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
    
    if (error.message.includes('SameOwner')) {
      console.log('→ Cannot submit answer to your own opinion');
    } else if (error.message.includes('InsufficientAllowance')) {
      console.log('→ Need to approve more USDC');
    } else if (error.message.includes('insufficient funds')) {
      console.log('→ Need more USDC in wallet');
    } else {
      console.log('→ Check wallet has USDC and approve contract');
    }
  }
}

main().catch(console.error);