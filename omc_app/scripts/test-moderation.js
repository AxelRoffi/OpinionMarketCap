const { ethers } = require('hardhat');

const OPINION_CORE_ADDRESS = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';

const ABI = [
  {
    "inputs": [],
    "name": "nextOpinionId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "opinionId", "type": "uint256"}],
    "name": "getOpinionDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "uint96", "name": "lastPrice", "type": "uint96" },
          { "internalType": "uint96", "name": "nextPrice", "type": "uint96" },
          { "internalType": "uint96", "name": "totalVolume", "type": "uint96" },
          { "internalType": "uint96", "name": "salePrice", "type": "uint96" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "address", "name": "questionOwner", "type": "address" },
          { "internalType": "address", "name": "currentAnswerOwner", "type": "address" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "string", "name": "question", "type": "string" },
          { "internalType": "string", "name": "currentAnswer", "type": "string" },
          { "internalType": "string", "name": "currentAnswerDescription", "type": "string" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "link", "type": "string" },
          { "internalType": "string[]", "name": "categories", "type": "string[]" },
        ],
        "internalType": "struct OpinionStructs.Opinion",
        "name": "",
        "type": "tuple",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [{"internalType": "uint256", "name": "opinionId", "type": "uint256"}, {"internalType": "string", "name": "reason", "type": "string"}],
    "name": "moderateAnswer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Testing moderation from account:', signer.address);
  
  const contract = new ethers.Contract(OPINION_CORE_ADDRESS, ABI, signer);
  
  try {
    // Get total opinions
    const nextOpinionId = await contract.nextOpinionId();
    console.log('Total opinions created:', Number(nextOpinionId) - 1);
    
    // Check opinion details for existing opinions
    for (let i = 1; i < Math.min(Number(nextOpinionId), 6); i++) {
      try {
        console.log(`\n=== Opinion ${i} ===`);
        const opinion = await contract.getOpinionDetails(i);
        console.log('Question:', opinion.question);
        console.log('Current Answer:', opinion.currentAnswer);
        console.log('Creator:', opinion.creator);
        console.log('Current Answer Owner:', opinion.currentAnswerOwner);
        console.log('Is Active:', opinion.isActive);
        
        // Check if we can moderate this opinion
        const canModerate = opinion.currentAnswerOwner !== opinion.creator;
        console.log('Can moderate (not creator):', canModerate);
        
        if (canModerate && opinion.isActive) {
          console.log(`✅ Opinion ${i} can be moderated`);
          
          // Test gas estimation for moderation
          try {
            const gasEstimate = await contract.moderateAnswer.estimateGas(i, "Test moderation");
            console.log('✅ Gas estimate:', gasEstimate.toString());
            
            // Actually try to moderate (uncomment to execute)
            // console.log('Executing moderation...');
            // const tx = await contract.moderateAnswer(i, "Test moderation - reverting to original answer");
            // const receipt = await tx.wait();
            // console.log('✅ Moderation successful, tx:', receipt.transactionHash);
            
          } catch (gasError) {
            console.log('❌ Gas estimation failed:', gasError.message);
            if (gasError.message.includes('revert')) {
              console.log('🔍 Revert reason detected - opinion may not be moderatable');
            }
          }
        } else {
          console.log(`❌ Opinion ${i} cannot be moderated - ${!canModerate ? 'creator still owns answer' : 'not active'}`);
        }
        
      } catch (error) {
        console.log(`Opinion ${i} not found or error:`, error.message);
      }
    }
    
    // Test simple admin functions that should work
    console.log('\n=== Testing Simple Admin Functions ===');
    
    try {
      const toggleGas = await contract.togglePublicCreation.estimateGas();
      console.log('✅ togglePublicCreation gas estimate:', toggleGas.toString());
      
      console.log('Executing togglePublicCreation...');
      const tx = await contract.togglePublicCreation();
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ togglePublicCreation successful, block:', receipt.blockNumber);
      
      // Toggle back
      const tx2 = await contract.togglePublicCreation();
      await tx2.wait();
      console.log('✅ Toggled back to original state');
      
    } catch (error) {
      console.log('❌ togglePublicCreation failed:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main().catch(console.error);