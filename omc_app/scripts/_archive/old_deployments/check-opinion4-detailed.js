const { ethers } = require('hardhat');

async function main() {
  console.log('\n🔍 DETAILED CHECK: Opinion #4 Sale Status');
  console.log('==========================================\n');

  const [deployer] = await ethers.getSigners();
  console.log('🔐 Checking from address:', deployer.address);

  // Contract addresses
  const OPINION_CORE_ADDRESS = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const PRICE_CALCULATOR_ADDRESS = '0x045ba1478c5ECAbB9eef1a269852C27cE168b372';
  
  try {
    // Connect to the contract
    const OpinionCore = await ethers.getContractFactory('OpinionCore', {
      libraries: {
        PriceCalculator: PRICE_CALCULATOR_ADDRESS,
      },
    });
    const opinionCore = OpinionCore.attach(OPINION_CORE_ADDRESS);
    
    console.log('📍 Connected to OpinionCore at:', OPINION_CORE_ADDRESS);
    
    // Check Opinion #4 specifically
    console.log('\n📋 OPINION #4 DETAILED STATUS:');
    console.log('==============================');
    
    const opinionId = 4;
    const opinion4 = await opinionCore.getOpinionDetails(opinionId);
    
    console.log('📊 Current Blockchain State:');
    console.log(`   Opinion ID: ${opinionId}`);
    console.log(`   Question: "${opinion4.question}"`);
    console.log(`   Original Creator: ${opinion4.creator}`);
    console.log(`   Current Owner: ${opinion4.questionOwner}`);
    console.log(`   Sale Price: ${ethers.formatUnits(opinion4.salePrice, 6)} USDC`);
    console.log(`   Is Active: ${opinion4.isActive}`);
    console.log(`   Current Answer: "${opinion4.currentAnswer}"`);
    console.log(`   Current Answer Owner: ${opinion4.currentAnswerOwner}`);
    console.log(`   Total Volume: ${ethers.formatUnits(opinion4.totalVolume, 6)} USDC`);
    console.log(`   Next Price: ${ethers.formatUnits(opinion4.nextPrice, 6)} USDC`);
    console.log(`   Last Price: ${ethers.formatUnits(opinion4.lastPrice, 6)} USDC`);
    
    // Analyze the ownership status
    console.log('\n🔍 OWNERSHIP ANALYSIS:');
    console.log('======================');
    
    const isTransferred = opinion4.creator.toLowerCase() !== opinion4.questionOwner.toLowerCase();
    const isForSale = opinion4.salePrice > 0n;
    
    console.log(`   Ownership Transferred: ${isTransferred ? '✅ YES' : '❌ NO'}`);
    console.log(`   Currently For Sale: ${isForSale ? '✅ YES' : '❌ NO'}`);
    
    if (isTransferred) {
      console.log('   ✅ SALE HAPPENED - Ownership was successfully transferred');
      console.log(`   📍 From: ${opinion4.creator}`);
      console.log(`   📍 To: ${opinion4.questionOwner}`);
      console.log(`   💰 Sale completed at some point (salePrice reset to 0)`);
    } else {
      console.log('   ❌ NO SALE - Original owner still owns the question');
      if (isForSale) {
        console.log('   📝 Question is currently listed for sale');
        console.log(`   💰 Sale Price: ${ethers.formatUnits(opinion4.salePrice, 6)} USDC`);
      } else {
        console.log('   📝 Question is not listed for sale');
      }
    }
    
    // Check recent events by looking at other opinions for comparison
    console.log('\n📊 COMPARISON WITH OTHER OPINIONS:');
    console.log('==================================');
    
    for (let i = 1; i <= 6; i++) {
      try {
        const opinion = await opinionCore.getOpinionDetails(i);
        const transferred = opinion.creator.toLowerCase() !== opinion.questionOwner.toLowerCase();
        const forSale = opinion.salePrice > 0n;
        
        console.log(`   Opinion #${i}: ${transferred ? 'TRANSFERRED' : 'ORIGINAL'} | ${forSale ? `FOR SALE (${ethers.formatUnits(opinion.salePrice, 6)} USDC)` : 'NOT FOR SALE'}`);
        
        if (i === 4) {
          console.log('     ⭐ THIS IS THE OPINION YOU TRIED TO SELL');
        }
      } catch (error) {
        console.log(`   Opinion #${i}: Does not exist`);
      }
    }
    
    console.log('\n🕵️ INVESTIGATING THE ISSUE:');
    console.log('============================');
    
    if (isTransferred && !isForSale) {
      console.log('✅ CONCLUSION: The sale DID happen successfully!');
      console.log('   - The blockchain shows ownership was transferred');
      console.log('   - Sale price was reset to 0 (normal after successful sale)');
      console.log('   - The UI showing success was correct');
      console.log('');
      console.log('❓ If you think the sale didn\'t happen, possible reasons:');
      console.log('   1. You were looking at cached/stale frontend data');
      console.log('   2. The buyer was a different address than expected');
      console.log('   3. The sale happened but took time to reflect in UI');
    } else if (!isTransferred && isForSale) {
      console.log('❌ CONCLUSION: The sale did NOT happen');
      console.log('   - The blockchain shows original owner still owns it');
      console.log('   - Question is still listed for sale');
      console.log('   - The UI showing success was incorrect');
      console.log('');
      console.log('🔧 POSSIBLE ISSUES:');
      console.log('   1. Transaction failed silently');
      console.log('   2. Insufficient USDC balance or allowance');
      console.log('   3. UI bug showing false success');
      console.log('   4. Transaction reverted but UI didn\'t catch it');
    } else if (!isTransferred && !isForSale) {
      console.log('❓ CONCLUSION: Unclear state');
      console.log('   - No ownership transfer occurred');
      console.log('   - Question is not for sale');
      console.log('   - Either never listed or listing was cancelled');
    }
    
    console.log('\n💡 NEXT STEPS TO INVESTIGATE:');
    console.log('=============================');
    console.log('1. Check browser console for transaction hash');
    console.log('2. Look up transaction on Base Sepolia explorer');
    console.log('3. Verify buyer\'s USDC balance and allowance');
    console.log('4. Check if transaction was rejected/reverted');
    console.log('5. Test the buy flow again with detailed logging');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n🎉 Detailed check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });