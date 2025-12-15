import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  // Use the corrected ABI
  const abi = [
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
            { internalType: 'uint96', name: 'lastPrice', type: 'uint96' },
            { internalType: 'uint96', name: 'nextPrice', type: 'uint96' },
            { internalType: 'uint96', name: 'totalVolume', type: 'uint96' },
            { internalType: 'uint96', name: 'salePrice', type: 'uint96' },
            { internalType: 'address', name: 'creator', type: 'address' },
            { internalType: 'address', name: 'questionOwner', type: 'address' },
            { internalType: 'address', name: 'currentAnswerOwner', type: 'address' },
            { internalType: 'bool', name: 'isActive', type: 'bool' },
            { internalType: 'string', name: 'question', type: 'string' },
            { internalType: 'string', name: 'currentAnswer', type: 'string' },
            { internalType: 'string', name: 'currentAnswerDescription', type: 'string' },
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
    },
  ];
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const contract = new ethers.Contract(contractAddress, abi, provider);

  console.log('=== TESTING FRONTEND ABI ===');
  console.log('Contract Address:', contractAddress);

  try {
    // Test nextOpinionId
    console.log('\n1. Testing nextOpinionId...');
    const nextId = await contract.nextOpinionId();
    console.log('nextOpinionId:', nextId.toString());

    // Test getOpinionDetails(1)
    console.log('\n2. Testing getOpinionDetails(1)...');
    const opinion1 = await contract.getOpinionDetails(1);
    console.log('Opinion 1:', {
      question: opinion1.question,
      currentAnswer: opinion1.currentAnswer,
      nextPrice: opinion1.nextPrice.toString(),
      totalVolume: opinion1.totalVolume.toString(),
      creator: opinion1.creator,
      isActive: opinion1.isActive,
      categories: opinion1.categories
    });

    // Test getOpinionDetails(2)
    console.log('\n3. Testing getOpinionDetails(2)...');
    const opinion2 = await contract.getOpinionDetails(2);
    console.log('Opinion 2:', {
      question: opinion2.question,
      currentAnswer: opinion2.currentAnswer,
      nextPrice: opinion2.nextPrice.toString(),
      totalVolume: opinion2.totalVolume.toString(),
      creator: opinion2.creator,
      isActive: opinion2.isActive,
      categories: opinion2.categories
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);