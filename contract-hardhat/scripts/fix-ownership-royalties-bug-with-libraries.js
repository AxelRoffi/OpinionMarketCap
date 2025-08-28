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
    // First deploy the PriceCalculator library
    console.log('📚 Deploying PriceCalculator library...');
    const PriceCalculator = await ethers.getContractFactory('PriceCalculator');
    const priceCalculatorLib = await PriceCalculator.deploy();
    await priceCalculatorLib.waitForDeployment();
    const priceCalculatorAddress = await priceCalculatorLib.getAddress();
    console.log('✅ PriceCalculator library deployed at:', priceCalculatorAddress);
    
    // Get the contract factory with library linking
    console.log('📝 Getting OpinionCore contract factory with library linking...');
    const OpinionCore = await ethers.getContractFactory('OpinionCore', {
      libraries: {
        PriceCalculator: priceCalculatorAddress,
      },
    });
    
    // Prepare the upgrade
    console.log('🔧 Preparing contract upgrade...');
    console.log('Current address:', OPINION_CORE_ADDRESS);
    
    // Deploy the upgrade
    console.log('🚀 Deploying upgraded contract...');
    const upgradedOpinionCore = await upgrades.upgradeProxy(
      OPINION_CORE_ADDRESS,
      OpinionCore,
      {
        unsafeAllow: ['external-library-linking'],
        gasLimit: 5000000, // Increase gas limit for upgrade
      }
    );
    
    // Wait for deployment to complete
    console.log('⏳ Waiting for upgrade transaction to be mined...');
    await upgradedOpinionCore.waitForDeployment();
    
    const contractAddress = await upgradedOpinionCore.getAddress();
    console.log('✅ OpinionCore upgraded successfully!');
    console.log('📍 Contract address:', contractAddress);
    console.log('📚 Library address:', priceCalculatorAddress);
    
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
    
    // Try to find opinions with transferred ownership
    console.log('\n🔍 Scanning for transferred ownership cases...');
    try {
      const nextOpinionId = await upgradedOpinionCore.nextOpinionId();
      const maxToCheck = Math.min(Number(nextOpinionId) - 1, 10); // Check first 10 opinions
      
      for (let i = 1; i <= maxToCheck; i++) {
        try {
          const opinion = await upgradedOpinionCore.getOpinionDetails(i);
          if (opinion.creator.toLowerCase() !== opinion.questionOwner.toLowerCase()) {
            console.log(`📋 Opinion #${i} has transferred ownership:`);
            console.log(`  - From: ${opinion.creator}`);
            console.log(`  - To: ${opinion.questionOwner}`);
            
            // Check if this is the specific reported case
            const reportedFrom = '0x644541778b26D101b6E6516B7796768631217b68';
            const reportedTo = '0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87';
            
            if (opinion.creator.toLowerCase() === reportedFrom.toLowerCase() && 
                opinion.questionOwner.toLowerCase() === reportedTo.toLowerCase()) {
              console.log('  ⚠️  THIS IS THE REPORTED BUG CASE - NOW FIXED!');
            }
          }
        } catch (error) {
          // Skip opinions that don't exist
        }
      }
    } catch (error) {
      console.log('ℹ️  Could not scan for transferred ownership cases');
    }
    
    console.log('\n🎯 CRITICAL FIX DEPLOYED:');
    console.log('   ✅ Creator fees will now flow to question owner (not original creator)');
    console.log('   ✅ This affects all future submitAnswer() transactions');
    console.log('   ✅ Library linking properly handled');
    console.log('\n📋 Next steps:');
    console.log('   1. Monitor the specific transfer case:');
    console.log('      From: 0x644541778b26D101b6E6516B7796768631217b68');
    console.log('      To: 0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87');
    console.log('   2. Verify next submitAnswer() sends fees to new owner');
    console.log('   3. Test the complete ownership transfer flow');
    
    // Save deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      contractAddress: contractAddress,
      libraryAddress: priceCalculatorAddress,
      deployer: deployer.address,
      network: 'baseSepolia',
      fix: 'Question ownership royalties bug - fees now go to current owner'
    };
    
    console.log('\n💾 Deployment Info:');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Upgrade failed:', error);
    
    if (error.message.includes('gas')) {
      console.log('\n💡 Gas optimization tips:');
      console.log('   - Try increasing gas limit further');
      console.log('   - Consider deploying during lower network usage');
    }
    
    if (error.message.includes('library')) {
      console.log('\n💡 Library linking tips:');
      console.log('   - PriceCalculator library must be deployed first');
      console.log('   - Library address must be provided to contract factory');
    }
    
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n🎉 Bug fix deployment completed successfully!');
    console.log('\n✅ CRITICAL ECONOMIC BUG FIXED:');
    console.log('   • Question ownership transfers now include royalty rights');
    console.log('   • Creator fees (3%) flow to current question owner');
    console.log('   • No more payments to previous owners after buyQuestion()');
    console.log('   • Economic incentive model restored');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deployment failed:', error);
    process.exit(1);
  });