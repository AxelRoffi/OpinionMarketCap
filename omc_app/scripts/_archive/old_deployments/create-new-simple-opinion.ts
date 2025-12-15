import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f';
  
  const abi = [
    "function createOpinion(string question, string answer, uint96 initialPrice, string description, string[] categories, string link)"
  ];
  
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  try {
    console.log('Creating simple opinion...');
    console.log('Signer:', signer.address);
    
    const tx = await contract.createOpinion(
      "Is Bitcoin going to 100k?",
      "Yes",
      ethers.parseUnits("1", 6), // 1 USDC
      "Bitcoin price prediction",
      ["Crypto", "Finance"],
      "https://bitcoin.org"
    );
    
    console.log('Transaction sent:', tx.hash);
    await tx.wait();
    console.log('Opinion created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);