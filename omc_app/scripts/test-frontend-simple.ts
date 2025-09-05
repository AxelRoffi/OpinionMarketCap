import { ethers } from "hardhat";

async function main() {
    const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
    const contract = await ethers.getContractAt("SimpleOpinionMarket", CONTRACT_ADDRESS);
    
    console.log("Testing contract:", CONTRACT_ADDRESS);
    
    // Test nextOpinionId
    const nextId = await contract.nextOpinionId();
    console.log("nextOpinionId:", nextId.toString());
    
    // Test each opinion
    for (let i = 1; i <= 3; i++) {
        const opinion = await contract.opinions(i);
        console.log(`Opinion ${i}:`, {
            question: opinion.question,
            answer: opinion.currentAnswer,
            active: opinion.isActive
        });
    }
}

main().catch(console.error);