import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    console.log("🚀 Deploying SimpleOpinionMarket WITHOUT PROXY...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Contract parameters
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Real Base Sepolia USDC
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067"; // Your treasury
    
    console.log("USDC Address:", USDC_ADDRESS);
    console.log("Treasury Address:", TREASURY_ADDRESS);
    
    // Deploy SimpleOpinionMarket directly (no proxy)
    console.log("\n📦 Deploying SimpleOpinionMarket...");
    const SimpleOpinionMarketFactory = await ethers.getContractFactory("SimpleOpinionMarket");
    
    // Deploy as regular contract, not proxy
    const contract = await SimpleOpinionMarketFactory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    
    // Initialize the contract
    console.log("\n🔧 Initializing contract...");
    const initTx = await contract.initialize(USDC_ADDRESS, TREASURY_ADDRESS);
    await initTx.wait();
    console.log("✅ Contract initialized");
    
    // Verify contract is working
    console.log("\n🧪 Testing contract...");
    try {
        const treasury = await contract.treasury();
        const usdcToken = await contract.usdcToken();
        const nextOpinionId = await contract.nextOpinionId();
        const isPaused = await contract.paused();
        
        console.log("✅ Treasury:", treasury);
        console.log("✅ USDC Token:", usdcToken);
        console.log("✅ Next Opinion ID:", nextOpinionId.toString());
        console.log("✅ Is Paused:", isPaused);
        
        // Verify addresses match
        if (treasury.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
            throw new Error("Treasury address mismatch");
        }
        if (usdcToken.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
            throw new Error("USDC address mismatch");
        }
        
        console.log("✅ All parameters correctly set");
        
    } catch (error: any) {
        console.log("❌ Contract verification failed:", error.message);
        return;
    }
    
    // Create the same 3 opinions
    console.log("\n📋 Creating initial opinions...");
    
    const opinions = [
        {
            question: "Who will win 2026 World Cup?",
            answer: "Brazil",
            price: ethers.parseUnits("3.0", 6)
        },
        {
            question: "Goat of Soccer ?", 
            answer: "Zidane",
            price: ethers.parseUnits("2.0", 6)
        },
        {
            question: "Most beautiful city ?",
            answer: "Paris", 
            price: ethers.parseUnits("2.0", 6)
        }
    ];
    
    // Approve USDC first
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    const totalAmount = ethers.parseUnits("7.0", 6); // 3 + 2 + 2 = 7 USDC
    
    console.log("💰 Approving USDC...");
    const approveTx = await usdcContract.approve(contractAddress, totalAmount);
    await approveTx.wait();
    console.log("✅ USDC approved");
    
    // Create each opinion
    for (let i = 0; i < opinions.length; i++) {
        const opinion = opinions[i];
        console.log(`\n📝 Creating Opinion ${i + 1}: "${opinion.question}"`);
        
        try {
            const createTx = await contract.createOpinion(
                opinion.question,
                opinion.answer, 
                opinion.price
            );
            await createTx.wait();
            console.log(`✅ Opinion ${i + 1} created successfully`);
            
        } catch (error: any) {
            console.log(`❌ Failed to create opinion ${i + 1}:`, error.message);
        }
    }
    
    // Verify all opinions were created
    console.log("\n🧪 Verifying created opinions...");
    try {
        const finalNextOpinionId = await contract.nextOpinionId();
        const totalCreated = Number(finalNextOpinionId) - 1;
        console.log("✅ Total opinions created:", totalCreated);
        
        for (let i = 1; i <= totalCreated; i++) {
            const opinion = await contract.opinions(i);
            console.log(`\n   Opinion ${i}:`);
            console.log(`     Question: ${opinion.question}`);
            console.log(`     Answer: ${opinion.currentAnswer}`);
            console.log(`     Price: ${ethers.formatUnits(opinion.lastPrice, 6)} USDC`);
            console.log(`     Active: ${opinion.isActive}`);
        }
        
    } catch (error: any) {
        console.log("❌ Opinion verification failed:", error.message);
    }
    
    // Save deployment info  
    const deploymentInfo = {
        contractAddress: contractAddress,
        contractType: "SimpleOpinionMarket (No Proxy)",
        usdcToken: USDC_ADDRESS,
        treasury: TREASURY_ADDRESS,
        deployer: deployer.address,
        network: "baseSepolia",
        deployedAt: new Date().toISOString(),
        isProxy: false,
        opinions: [
            { id: 1, question: "Who will win 2026 World Cup?", answer: "Brazil", price: "3.0 USDC" },
            { id: 2, question: "Goat of Soccer ?", answer: "Zidane", price: "2.0 USDC" },
            { id: 3, question: "Most beautiful city ?", answer: "Paris", price: "2.0 USDC" }
        ]
    };
    
    fs.writeFileSync("deployed-addresses-no-proxy.json", JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎯 DEPLOYMENT COMPLETE!");
    console.log("📄 New Contract Address:", contractAddress);
    console.log("🔗 BaseScan URL: https://sepolia.basescan.org/address/" + contractAddress);
    console.log("📂 Details saved to: deployed-addresses-no-proxy.json");
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Update frontend contract address to:", contractAddress);
    console.log("2. This is NOT a proxy, so BaseScan should show all functions immediately");
    console.log("3. Test frontend with this new address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });