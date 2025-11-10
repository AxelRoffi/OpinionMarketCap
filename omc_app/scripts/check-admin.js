const { ethers } = require('hardhat');
const deployedAddresses = require('../deployed-addresses.json');

const OPINION_CORE_ABI = [
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MODERATOR_ROLE", 
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
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  }
];

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Checking from account:', signer.address);
  
  const opinionCore = new ethers.Contract(
    '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f', // OpinionCore from contracts.ts
    OPINION_CORE_ABI,
    signer
  );
  
  const targetAddress = '0x3e41d4f16ccee680dbd4eac54de7cc2e3d0ca1e3'; // lowercase
  
  try {
    // Get role identifiers
    const adminRole = await opinionCore.ADMIN_ROLE();
    const moderatorRole = await opinionCore.MODERATOR_ROLE();
    
    console.log('Admin Role Hash:', adminRole);
    console.log('Moderator Role Hash:', moderatorRole);
    
    // Check roles for target address
    const hasAdmin = await opinionCore.hasRole(adminRole, targetAddress);
    const hasModerator = await opinionCore.hasRole(moderatorRole, targetAddress);
    
    console.log(`\nRole check for ${targetAddress}:`);
    console.log('Has Admin Role:', hasAdmin);
    console.log('Has Moderator Role:', hasModerator);
    
    // Check who has admin role (signer)
    const signerHasAdmin = await opinionCore.hasRole(adminRole, signer.address);
    console.log(`\nSigner ${signer.address} has admin:`, signerHasAdmin);
    
    if (signerHasAdmin && !hasAdmin) {
      console.log('\n🔧 Your target address needs admin role. Grant it?');
      console.log('Run: npx hardhat run scripts/grant-admin.js --network baseSepolia');
    }
    
  } catch (error) {
    console.error('Error checking admin status:', error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});