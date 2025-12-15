import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  
  // Get both wallets
  const [signer1] = await ethers.getSigners(); // First wallet
  
  const privateKey2 = process.env.PRIVATE_KEY_2;
  if (!privateKey2) {
    throw new Error('PRIVATE_KEY_2 not found in environment variables');
  }
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const signer2 = new ethers.Wallet(privateKey2, provider);
  
  console.log('Wallet 1 (sender):', signer1.address);
  console.log('Wallet 2 (receiver):', signer2.address);
  
  try {
    // Check balances
    const balance1 = await ethers.provider.getBalance(signer1.address);
    const balance2 = await ethers.provider.getBalance(signer2.address);
    
    console.log('\n=== INITIAL BALANCES ===');
    console.log('Wallet 1 ETH:', ethers.formatEther(balance1));
    console.log('Wallet 2 ETH:', ethers.formatEther(balance2));
    
    // Send 0.01 ETH to second wallet for gas
    if (balance2 < ethers.parseEther("0.005")) {
      console.log('\n=== SENDING ETH FOR GAS ===');
      const ethAmount = ethers.parseEther("0.01"); // 0.01 ETH should be enough
      
      const sendTx = await signer1.sendTransaction({
        to: signer2.address,
        value: ethAmount
      });
      
      console.log('Sending 0.01 ETH to wallet 2...');
      console.log('Transaction:', sendTx.hash);
      await sendTx.wait();
      console.log('✅ ETH sent successfully');
      
      // Check new balance
      const newBalance2 = await ethers.provider.getBalance(signer2.address);
      console.log('Wallet 2 new ETH balance:', ethers.formatEther(newBalance2));
    }
    
    // Now submit the answer with wallet 2
    console.log('\n=== SUBMITTING ANSWER WITH WALLET 2 ===');
    
    const opinionAbi = [
      "function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))",
      "function submitAnswer(uint256 opinionId, string answer, string description) external"
    ];
    
    const contract = new ethers.Contract(contractAddress, opinionAbi, signer2);
    
    // Check opinion details
    const opinion = await contract.getOpinionDetails(1);
    console.log('Current answer:', opinion.currentAnswer);
    console.log('Required price:', ethers.formatUnits(opinion.nextPrice, 6), 'USDC');
    
    // Approve USDC
    const usdcAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer2);
    
    console.log('Approving USDC...');
    const approveTx = await usdc.approve(contractAddress, opinion.nextPrice);
    await approveTx.wait();
    console.log('✅ USDC approved');
    
    // Submit answer
    console.log('Submitting answer: Messi...');
    const submitTx = await contract.submitAnswer(
      1, // opinionId
      "Messi", // new answer
      "WC & CL winners and 20 seasons at top level" // description
    );
    
    console.log('Transaction:', submitTx.hash);
    await submitTx.wait();
    console.log('✅ Answer submitted successfully!');
    
    // Check updated opinion
    const updatedOpinion = await contract.getOpinionDetails(1);
    console.log('\n=== UPDATED OPINION ===');
    console.log('New answer:', updatedOpinion.currentAnswer);
    console.log('New owner:', updatedOpinion.currentAnswerOwner);
    console.log('New price:', ethers.formatUnits(updatedOpinion.nextPrice, 6), 'USDC');
    
  } catch (error: any) {
    console.log('❌ ERROR:', error.message);
  }
}

main().catch(console.error);