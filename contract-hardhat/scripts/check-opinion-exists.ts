import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  const abi = [
    "function nextOpinionId() view returns (uint256)",
    "function getOpinionDetails(uint256) view returns (tuple(address creator, address questionOwner, uint96 lastPrice, uint96 nextPrice, bool isActive, string question, string currentAnswer, string currentAnswerDescription, address currentAnswerOwner, uint96 totalVolume, uint96 salePrice, string ipfsHash, string link, string[] categories))"
  ];
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log('=== CHECKING OPINION EXISTENCE ===');
    
    const nextOpinionId = await contract.nextOpinionId();
    console.log('nextOpinionId:', nextOpinionId.toString());
    console.log('Expected opinions: 0 to', (Number(nextOpinionId) - 1));
    
    // If nextOpinionId is 2, opinion 1 should exist
    if (Number(nextOpinionId) > 1) {
      console.log('\nTrying to get opinion 1...');
      try {
        // Try with raw call
        const rawResult = await provider.call({
          to: contractAddress,
          data: contract.interface.encodeFunctionData('getOpinionDetails', [1])
        });
        console.log('Raw result length:', rawResult.length);
        console.log('Raw result:', rawResult);
        
        // Try to decode manually
        const decoded = contract.interface.decodeFunctionResult('getOpinionDetails', rawResult);
        console.log('Decoded result:', decoded);
        
      } catch (error) {
        console.error('Error getting opinion 1:', error.message);
      }
    } else {
      console.log('No opinions exist yet (nextOpinionId is', nextOpinionId.toString(), ')');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);