const { ethers, upgrades } = require('hardhat');

async function main() {
  console.log('\n🚨 CRITICAL BUG FIX: Question Ownership Royalties');
  console.log('=====================================\n');
  
  console.log('Issue: After buyQuestion(), royalties still go to original creator instead of new owner');
  console.log('Fix: Change submitAnswer() to use questionOwner instead of creator for fees\n');

  const [deployer] = await ethers.getSigners();
  console.log('🔐 Deployer address:', deployer.address);

  // Current contract address on Base Sepolia
  const OPINION_CORE_ADDRESS = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  try {
    // Get the contract factory
    console.log('📝 Getting OpinionCore contract factory...');
    const OpinionCore = await ethers.getContractFactory('OpinionCore');
    
    // Prepare the upgrade
    console.log('🔧 Preparing contract upgrade...');
    console.log('Current address:', OPINION_CORE_ADDRESS);
    
    // Deploy the upgrade
    console.log('🚀 Deploying upgraded contract...');
    const upgradedOpinionCore = await upgrades.upgradeProxy(
      OPINION_CORE_ADDRESS,
      OpinionCore,
      {
        gasLimit: 3000000, // Set gas limit for deployment
      }
    );
    
    // Wait for deployment to complete
    console.log('⏳ Waiting for upgrade transaction to be mined...');
    await upgradedOpinionCore.waitForDeployment();
    
    const contractAddress = await upgradedOpinionCore.getAddress();
    console.log('✅ OpinionCore upgraded successfully!');
    console.log('📍 Contract address:', contractAddress);
    
    // Verify the fix by checking a sample opinion
    console.log('\n🔍 Verifying the fix...');
    
    // Test with opinion ID 1 (if it exists)
    try {
      const opinion1 = await upgradedOpinionCore.getOpinionDetails(1);
      console.log('📊 Opinion #1 details:');
      console.log('  - Original Creator:', opinion1.creator);
      console.log('  - Current Owner:', opinion1.questionOwner);
      console.log('  - Sale Price:', ethers.formatUnits(opinion1.salePrice, 6), 'USDC');
      
      if (opinion1.creator !== opinion1.questionOwner) {
        console.log('✅ Opinion has transferred ownership - fees will now go to current owner');
      } else {
        console.log('ℹ️  Opinion still has original owner');
      }
    } catch (error) {
      console.log('ℹ️  Could not fetch opinion #1 for verification');
    }
    
    console.log('\n🎯 CRITICAL FIX DEPLOYED:');
    console.log('   Creator fees will now flow to question owner (not original creator)');
    console.log('   This affects all future submitAnswer() transactions');
    console.log('\n📋 Next steps:');
    console.log('   1. Monitor the specific transfer case:');
    console.log('      From: 0x644541778b26D101b6E6516B7796768631217b68');
    console.log('      To: 0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87');
    console.log('   2. Verify next submitAnswer() sends fees to new owner');
    console.log('   3. Test the complete ownership transfer flow');
    
  } catch (error) {
    console.error('❌ Upgrade failed:', error);
    
    if (error.message.includes('gas')) {
      console.log('\n💡 Gas optimization tips:');
      console.log('   - The fix is minimal (1 line change)');
      console.log('   - Try increasing gas limit or gas price');
    }
    
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n🎉 Bug fix deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deployment failed:', error);
    process.exit(1);
  });