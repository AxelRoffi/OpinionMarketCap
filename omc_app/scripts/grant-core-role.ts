import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const opinionCoreAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const feeManagerAddress = '0x384af1318feF882B2a068A2656870436D3fb41FB';
  
  console.log('Granting CORE_CONTRACT_ROLE to OpinionCore...');
  
  // Grant role to OpinionCore
  const feeManagerAbi = [
    "function grantRole(bytes32 role, address account) external",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function CORE_CONTRACT_ROLE() view returns (bytes32)"
  ];
  
  const feeManager = new ethers.Contract(feeManagerAddress, feeManagerAbi, deployer);
  
  // Get the role hash
  const coreContractRole = await feeManager.CORE_CONTRACT_ROLE();
  console.log('CORE_CONTRACT_ROLE:', coreContractRole);
  
  // Check if already has role
  const hasRole = await feeManager.hasRole(coreContractRole, opinionCoreAddress);
  console.log('OpinionCore already has role:', hasRole);
  
  if (!hasRole) {
    console.log('Granting role...');
    const grantTx = await feeManager.grantRole(coreContractRole, opinionCoreAddress);
    await grantTx.wait();
    console.log('✅ Role granted');
  }
  
  // Verify
  const nowHasRole = await feeManager.hasRole(coreContractRole, opinionCoreAddress);
  console.log('OpinionCore now has role:', nowHasRole);
  
  if (nowHasRole) {
    console.log('🎉 PERMISSION FIXED!');
    console.log('OpinionCore can now call FeeManager functions');
    console.log('submitAnswer should work now!');
  }
}

main().catch(console.error);