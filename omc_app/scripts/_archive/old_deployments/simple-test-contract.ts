import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  // Create a simple contract interface
  const abi = [
    "function nextOpinionId() view returns (uint256)",
    "function getOpinionDetails(uint256) view returns (tuple(address creator, address questionOwner, uint96 lastPrice, uint96 nextPrice, bool isActive, string question, string currentAnswer, string currentAnswerDescription, address currentAnswerOwner, uint96 totalVolume, uint96 salePrice, string ipfsHash, string link, string[] categories))"
  ];
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log('=== TESTING CONTRACT ===');
    console.log('Contract Address:', contractAddress);
    
    // Test nextOpinionId
    console.log('\n1. Testing nextOpinionId...');
    const nextOpinionId = await contract.nextOpinionId();
    console.log('nextOpinionId:', nextOpinionId.toString());
    
    // Test getOpinionDetails
    console.log('\n2. Testing getOpinionDetails(1)...');
    const opinion = await contract.getOpinionDetails(1);
    console.log('Opinion data:', {
      creator: opinion.creator,
      questionOwner: opinion.questionOwner,
      question: opinion.question,
      currentAnswer: opinion.currentAnswer,
      isActive: opinion.isActive,
      lastPrice: ethers.formatUnits(opinion.lastPrice, 6),
      nextPrice: ethers.formatUnits(opinion.nextPrice, 6),
      categories: opinion.categories
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);