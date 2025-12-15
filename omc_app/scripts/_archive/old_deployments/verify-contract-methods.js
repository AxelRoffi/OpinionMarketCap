const { ethers } = require('hardhat');

const OPINION_CORE_ADDRESS = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';

// ABI from the admin page - let's test these methods
const ADMIN_ABI = [
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPublicCreationEnabled",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "togglePublicCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
  console.log('Testing from account:', signer.address);
  console.log('Contract address:', OPINION_CORE_ADDRESS);
  
  const contract = new ethers.Contract(OPINION_CORE_ADDRESS, ADMIN_ABI, signer);
  
  console.log('\n=== READ OPERATIONS TEST ===');
  
  try {
    // Test basic read operations
    const adminRole = await contract.ADMIN_ROLE();
    console.log('✅ ADMIN_ROLE:', adminRole);
    
    const hasAdmin = await contract.hasRole(adminRole, signer.address);
    console.log('✅ hasRole(ADMIN):', hasAdmin);
    
    const isPaused = await contract.paused();
    console.log('✅ paused:', isPaused);
    
    const publicCreation = await contract.isPublicCreationEnabled();
    console.log('✅ isPublicCreationEnabled:', publicCreation);
    
  } catch (error) {
    console.error('❌ Read operation failed:', error.message);
  }
  
  console.log('\n=== WRITE OPERATIONS TEST (DRY RUN) ===');
  
  try {
    // Test write operations with estimateGas (doesn't actually execute)
    
    // Test pause toggle
    const pauseGas = await contract.pause.estimateGas();
    console.log('✅ pause() gas estimate:', pauseGas.toString());
    
    // Test public creation toggle  
    const toggleGas = await contract.togglePublicCreation.estimateGas();
    console.log('✅ togglePublicCreation() gas estimate:', toggleGas.toString());
    
    // Test moderation (with dummy data)
    const moderateGas = await contract.moderateAnswer.estimateGas(1, "Test moderation");
    console.log('✅ moderateAnswer() gas estimate:', moderateGas.toString());
    
  } catch (error) {
    console.error('❌ Write operation gas estimation failed:', error.message);
    
    // Check if it's a revert reason
    if (error.message.includes('revert')) {
      console.log('🔍 This might be a revert due to business logic, not ABI issues');
    }
    
    // Try to get more detailed error
    if (error.data) {
      console.log('🔍 Error data:', error.data);
    }
  }
  
  console.log('\n=== CONTRACT STATE CHECK ===');
  
  // Check if we can execute a simple write operation
  try {
    console.log('🧪 Testing actual togglePublicCreation call...');
    
    // Get current state first
    const currentState = await contract.isPublicCreationEnabled();
    console.log('Current public creation state:', currentState);
    
    // Try to execute the toggle (this will actually send a transaction)
    console.log('Sending transaction...');
    const tx = await contract.togglePublicCreation();
    console.log('✅ Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Check new state
    const newState = await contract.isPublicCreationEnabled();
    console.log('New public creation state:', newState);
    
    if (newState !== currentState) {
      console.log('✅ State change successful!');
      
      // Toggle back to original state
      console.log('Toggling back to original state...');
      const tx2 = await contract.togglePublicCreation();
      await tx2.wait();
      console.log('✅ Reverted to original state');
    }
    
  } catch (error) {
    console.error('❌ Actual transaction failed:', error.message);
    
    if (error.message.includes('user rejected')) {
      console.log('🔍 User rejected the transaction');
    } else if (error.message.includes('insufficient funds')) {
      console.log('🔍 Insufficient funds for gas');
    } else if (error.message.includes('nonce')) {
      console.log('🔍 Nonce issues - try resetting your wallet');
    } else {
      console.log('🔍 Unexpected error - check contract permissions and state');
    }
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});