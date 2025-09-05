const { ethers } = require('hardhat');

async function main() {
  console.log('\n🔍 CHECKING OPINION #3 OWNERSHIP STATUS');
  console.log('=====================================\n');

  const [deployer] = await ethers.getSigners();
  console.log('🔐 Checking from address:', deployer.address);

  // Contract address and library address from deployment
  const OPINION_CORE_ADDRESS = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const PRICE_CALCULATOR_ADDRESS = '0x045ba1478c5ECAbB9eef1a269852C27cE168b372';
  
  try {
    // Connect to the contract with library linking
    const OpinionCore = await ethers.getContractFactory('OpinionCore', {
      libraries: {
        PriceCalculator: PRICE_CALCULATOR_ADDRESS,
      },
    });
    const opinionCore = OpinionCore.attach(OPINION_CORE_ADDRESS);
    
    console.log('📍 Connected to OpinionCore at:', OPINION_CORE_ADDRESS);
    console.log('📚 Using PriceCalculator library at:', PRICE_CALCULATOR_ADDRESS);
    
    // Check Opinion #3 specifically
    console.log('\n🎯 CHECKING OPINION #3 (The reported case):');
    console.log('============================================');
    
    const opinionId = 3;
    const opinion3 = await opinionCore.getOpinionDetails(opinionId);
    
    console.log(`📋 Opinion #${opinionId} Details:`);
    console.log(`   Question: "${opinion3.question}"`);
    console.log(`   Original Creator: ${opinion3.creator}`);
    console.log(`   Current Owner: ${opinion3.questionOwner}`);
    console.log(`   Sale Price: ${ethers.formatUnits(opinion3.salePrice, 6)} USDC`);
    console.log(`   Is Active: ${opinion3.isActive}`);
    console.log(`   Current Answer: "${opinion3.currentAnswer}"`);
    console.log(`   Current Answer Owner: ${opinion3.currentAnswerOwner}`);
    
    // Expected addresses from the bug report
    const originalCreator = '0x644541778b26D101b6E6516B7796768631217b68';
    const newOwner = '0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87';
    
    console.log('\n🔍 OWNERSHIP ANALYSIS:');
    console.log('=====================');
    
    console.log(`   Expected Original: ${originalCreator}`);
    console.log(`   Actual Original:   ${opinion3.creator}`);
    console.log(`   Match: ${opinion3.creator.toLowerCase() === originalCreator.toLowerCase() ? '✅' : '❌'}`);
    
    console.log(`\n   Expected New Owner: ${newOwner}`);
    console.log(`   Actual Owner:       ${opinion3.questionOwner}`);
    console.log(`   Match: ${opinion3.questionOwner.toLowerCase() === newOwner.toLowerCase() ? '✅' : '❌'}`);
    
    // Check if ownership has been transferred
    const isTransferred = opinion3.creator.toLowerCase() !== opinion3.questionOwner.toLowerCase();
    console.log(`\n   Ownership Transferred: ${isTransferred ? '✅ YES' : '❌ NO'}`);
    console.log(`   Currently For Sale: ${opinion3.salePrice > 0 ? '✅ YES' : '❌ NO'}`);
    
    if (isTransferred) {
      console.log('\n✅ OWNERSHIP TRANSFER STATUS: SUCCESS');
      console.log('   The buyQuestion() function worked correctly.');
      console.log('   Question ownership has been transferred.');
      
      if (opinion3.questionOwner.toLowerCase() === newOwner.toLowerCase()) {
        console.log('   ✅ New owner matches expected address.');
        console.log('   ✅ Creator fees will now go to new owner (after our fix).');
      } else {
        console.log('   ⚠️  New owner does not match expected address.');
        console.log('   📋 Actual owner:', opinion3.questionOwner);
        console.log('   📋 Expected owner:', newOwner);
      }
    } else {
      console.log('\n❌ OWNERSHIP TRANSFER STATUS: FAILED');
      console.log('   The buyQuestion() function may not have been called yet,');
      console.log('   or there may be an issue with the transfer mechanism.');
    }
    
    // Check other opinions for comparison
    console.log('\n📊 CHECKING OTHER OPINIONS FOR COMPARISON:');
    console.log('==========================================');
    
    for (let i = 1; i <= 5; i++) {
      if (i === 3) continue; // Skip opinion 3, already checked
      
      try {
        const opinion = await opinionCore.getOpinionDetails(i);
        const transferred = opinion.creator.toLowerCase() !== opinion.questionOwner.toLowerCase();
        const forSale = opinion.salePrice > 0;
        
        console.log(`   Opinion #${i}: ${transferred ? 'TRANSFERRED' : 'ORIGINAL OWNER'} | ${forSale ? 'FOR SALE' : 'NOT FOR SALE'}`);
        
        if (transferred) {
          console.log(`     From: ${opinion.creator}`);
          console.log(`     To: ${opinion.questionOwner}`);
        }
      } catch (error) {
        console.log(`   Opinion #${i}: Does not exist`);
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n🎉 Ownership check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });