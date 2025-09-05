import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  // Get contract instance
  const OpinionCore = await ethers.getContractFactory('OpinionCore');
  const opinionCore = OpinionCore.attach(contractAddress);
  
  try {
    // Check nextOpinionId
    const nextOpinionId = await opinionCore.nextOpinionId();
    console.log('nextOpinionId:', nextOpinionId.toString());
    
    // Check opinion 1 details
    const opinionDetails = await opinionCore.getOpinionDetails(1);
    console.log('\nOpinion 1 Details:');
    console.log('Question:', opinionDetails.question);
    console.log('Current Answer:', opinionDetails.currentAnswer);
    console.log('Is Active:', opinionDetails.isActive);
    console.log('Creator:', opinionDetails.creator);
    console.log('Last Price:', ethers.formatUnits(opinionDetails.lastPrice, 6));
    console.log('Next Price:', ethers.formatUnits(opinionDetails.nextPrice, 6));
    console.log('Categories:', opinionDetails.categories);
    console.log('Current Answer Owner:', opinionDetails.currentAnswerOwner);
    
    // Check if opinion exists in opinions mapping (old structure)
    try {
      const opinionMappingData = await opinionCore.opinions(1);
      console.log('\nOpinions mapping data:');
      console.log('Creator:', opinionMappingData.creator);
      console.log('Question:', opinionMappingData.question);
      console.log('Current Answer:', opinionMappingData.currentAnswer);
      console.log('Is Active (mapping):', opinionMappingData.isActive);
    } catch (error) {
      console.log('\nOpinions mapping not accessible or different structure');
    }
    
  } catch (error) {
    console.error('Error checking opinion:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});