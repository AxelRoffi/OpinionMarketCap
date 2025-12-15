import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  const [signer] = await ethers.getSigners();
  console.log('Testing submitAnswer for address:', signer.address);
  
  // Check basic contract state
  const opinionAbi = [
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))",
    "function submitAnswer(uint256 opinionId, string answer, string description) external"
  ];
  
  const contract = new ethers.Contract(contractAddress, opinionAbi, signer);
  
  try {
    // Get opinion 1 details
    console.log('\n=== CHECKING OPINION 1 ===');
    const opinion = await contract.getOpinionDetails(1);
    console.log('✅ Opinion exists');
    console.log('- Active:', opinion.isActive);
    console.log('- Current Answer:', opinion.currentAnswer);
    console.log('- Current Owner:', opinion.currentAnswerOwner);
    console.log('- Creator:', opinion.creator);
    console.log('- Next Price (USDC):', ethers.formatUnits(opinion.nextPrice, 6));
    
    // Check if same owner
    if (opinion.currentAnswerOwner.toLowerCase() === signer.address.toLowerCase()) {
      console.log('❌ ERROR: You are already the current answer owner (SameOwner)');
      return;
    }
    
    // Check USDC allowance
    console.log('\n=== CHECKING USDC ALLOWANCE ===');
    const usdcAbi = ["function allowance(address,address) view returns (uint256)", "function balanceOf(address) view returns (uint256)"];
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    
    const allowance = await usdc.allowance(signer.address, contractAddress);
    const balance = await usdc.balanceOf(signer.address);
    const requiredPrice = opinion.nextPrice;
    
    console.log('- USDC Balance:', ethers.formatUnits(balance, 6));
    console.log('- USDC Allowance:', ethers.formatUnits(allowance, 6));
    console.log('- Required Price:', ethers.formatUnits(requiredPrice, 6));
    
    if (allowance < requiredPrice) {
      console.log('❌ ERROR: Insufficient allowance');
      console.log('Need to approve at least:', ethers.formatUnits(requiredPrice, 6), 'USDC');
      return;
    }
    
    if (balance < requiredPrice) {
      console.log('❌ ERROR: Insufficient USDC balance');
      return;
    }
    
    console.log('✅ USDC checks passed');
    
    // Try to submit answer
    console.log('\n=== TESTING SUBMIT ANSWER ===');
    console.log('Submitting answer: "Messi" with description: "Greatest of all time"');
    
    const tx = await contract.submitAnswer(
      1,
      "Messi",
      "Greatest of all time"
    );
    
    console.log('Transaction sent:', tx.hash);
    await tx.wait();
    console.log('✅ Answer submitted successfully!');
    
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
    
    // Check for specific error patterns
    if (error.message.includes('SameOwner')) {
      console.log('→ You are already the current answer owner');
    } else if (error.message.includes('InsufficientAllowance')) {
      console.log('→ Need to approve more USDC');
    } else if (error.message.includes('OpinionNotFound')) {
      console.log('→ Opinion does not exist');
    } else if (error.message.includes('OpinionNotActive')) {
      console.log('→ Opinion is not active');
    } else if (error.message.includes('EmptyString')) {
      console.log('→ Answer cannot be empty');
    } else {
      console.log('→ Unknown error, check contract state');
    }
  }
}

main().catch(console.error);