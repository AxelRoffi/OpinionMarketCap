import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  // Use PRIVATE_KEY_2 for the second wallet
  const privateKey2 = process.env.PRIVATE_KEY_2;
  if (!privateKey2) {
    throw new Error('PRIVATE_KEY_2 not found in environment variables');
  }
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const signer2 = new ethers.Wallet(privateKey2, provider);
  
  console.log('Using wallet:', signer2.address);
  console.log('Changing opinion 2 from "Paris" to "Roma"');
  
  const opinionAbi = [
    "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))",
    "function submitAnswer(uint256 opinionId, string answer, string description) external"
  ];
  
  const contract = new ethers.Contract(contractAddress, opinionAbi, signer2);
  
  try {
    // Check opinion 2 details
    console.log('\n=== CHECKING OPINION 2 ===');
    const opinion = await contract.getOpinionDetails(2);
    console.log('- Question:', opinion.question);
    console.log('- Current Answer:', opinion.currentAnswer);
    console.log('- Current Owner:', opinion.currentAnswerOwner);
    console.log('- Next Price (USDC):', ethers.formatUnits(opinion.nextPrice, 6));
    console.log('- Active:', opinion.isActive);
    
    // Check if this wallet can submit (different from current owner)
    if (opinion.currentAnswerOwner.toLowerCase() === signer2.address.toLowerCase()) {
      console.log('❌ This wallet is the current owner, using first wallet instead');
      
      // Use first wallet
      const [signer1] = await ethers.getSigners();
      const contract1 = new ethers.Contract(contractAddress, opinionAbi, signer1);
      
      // Check USDC and approve
      const usdcAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
      const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer1);
      
      console.log('Approving USDC for first wallet...');
      const approveTx = await usdc.approve(contractAddress, opinion.nextPrice);
      await approveTx.wait();
      
      console.log('Submitting answer with first wallet...');
      const tx = await contract1.submitAnswer(
        2, // opinionId
        "Roma", // new answer
        "Eternal City, history, art, Colosseum, Vatican... capital of beauty!" // description
      );
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('✅ Answer submitted successfully!');
      
    } else {
      // Use second wallet
      const usdcAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
      const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer2);
      
      console.log('Approving USDC...');
      const approveTx = await usdc.approve(contractAddress, opinion.nextPrice);
      await approveTx.wait();
      
      console.log('Submitting answer: "Roma"...');
      const tx = await contract.submitAnswer(
        2, // opinionId
        "Roma", // new answer
        "Eternal City, history, art, Colosseum, Vatican... capital of beauty!" // description
      );
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('✅ Answer submitted successfully!');
    }
    
    // Check updated opinion
    console.log('\n=== UPDATED OPINION 2 ===');
    const updatedOpinion = await contract.getOpinionDetails(2);
    console.log('- Question:', updatedOpinion.question);
    console.log('- New Answer:', updatedOpinion.currentAnswer);
    console.log('- New Owner:', updatedOpinion.currentAnswerOwner);
    console.log('- New Price (USDC):', ethers.formatUnits(updatedOpinion.nextPrice, 6));
    
    console.log('\n🎉 SUCCESS! Opinion 2 changed from "Paris" to "Roma"');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);