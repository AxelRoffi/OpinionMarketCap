import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  // Create contract instance with ABI directly
  const opinionCoreABI = [
    {
      inputs: [],
      name: 'nextOpinionId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'opinionId', type: 'uint256' }],
      name: 'getOpinionDetails',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'creator', type: 'address' },
            { internalType: 'address', name: 'questionOwner', type: 'address' },
            { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
            { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
            { internalType: 'bool', name: 'isActive', type: 'bool' },
            { internalType: 'string', name: 'question', type: 'string' },
            { internalType: 'string', name: 'currentAnswer', type: 'string' },
            { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
            { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
            { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
            { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
            { internalType: 'string', name: 'ipfsHash', type: 'string' },
            { internalType: 'string', name: 'link', type: 'string' },
            { internalType: 'string[]', name: 'categories', type: 'string[]' },
          ],
          internalType: 'struct OpinionStructs.Opinion',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    }
  ];
  
  const [signer] = await ethers.getSigners();
  const opinionCore = new ethers.Contract(contractAddress, opinionCoreABI, signer);
  
  try {
    // Check nextOpinionId
    const nextOpinionId = await opinionCore.nextOpinionId();
    console.log('nextOpinionId:', nextOpinionId.toString());
    
    // Check opinion 1 details
    const opinionDetails = await opinionCore.getOpinionDetails(1);
    console.log('\n=== Opinion 1 Details ===');
    console.log('Question:', `"${opinionDetails.question}"`);
    console.log('Current Answer:', `"${opinionDetails.currentAnswer}"`);
    console.log('Is Active:', opinionDetails.isActive);
    console.log('Creator:', opinionDetails.creator);
    console.log('Question Owner:', opinionDetails.questionOwner);
    console.log('Current Answer Owner:', opinionDetails.currentAnswerOwner);
    console.log('Last Price (USDC):', ethers.formatUnits(opinionDetails.lastPrice, 6));
    console.log('Next Price (USDC):', ethers.formatUnits(opinionDetails.nextPrice, 6));
    console.log('Total Volume (USDC):', ethers.formatUnits(opinionDetails.totalVolume, 6));
    console.log('Categories:', opinionDetails.categories);
    console.log('Link:', `"${opinionDetails.link}"`);
    console.log('IPFS Hash:', `"${opinionDetails.ipfsHash}"`);
    console.log('Answer Description:', `"${opinionDetails.currentAnswerDescription}"`);
    
    // Check if all key fields are populated
    console.log('\n=== Field Analysis ===');
    console.log('Question empty?', opinionDetails.question === '');
    console.log('Answer empty?', opinionDetails.currentAnswer === '');
    console.log('Categories empty?', opinionDetails.categories.length === 0);
    console.log('Is actually active?', opinionDetails.isActive);
    
  } catch (error) {
    console.error('Error checking opinion:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});