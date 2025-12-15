import { ethers } from "hardhat";

async function main() {
    // Base Sepolia USDC addresses to check
    const addresses = [
        "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Current
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC  
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", // Alternative
        "0xf175520c52418dfe19c8098071a252da48cd1c19", // Another option
    ];
    
    console.log("🔍 Checking USDC addresses on Base Sepolia...");
    
    for (const address of addresses) {
        try {
            const code = await ethers.provider.getCode(address);
            console.log(`\n📍 ${address}:`);
            
            if (code === "0x") {
                console.log("❌ No contract code");
                continue;
            }
            
            console.log("✅ Contract exists");
            
            // Try to get ERC20 info
            try {
                const contract = await ethers.getContractAt("IERC20", address);
                
                // Try calling decimals
                try {
                    const decimals = await contract.decimals();
                    console.log("   Decimals:", decimals);
                } catch (e) {
                    console.log("   ❌ No decimals() function");
                }
                
                // Try calling symbol
                try {
                    const symbol = await contract.symbol();
                    console.log("   Symbol:", symbol);
                } catch (e) {
                    console.log("   ❌ No symbol() function");
                }
                
                // Try calling name
                try {
                    const name = await contract.name();
                    console.log("   Name:", name);
                } catch (e) {
                    console.log("   ❌ No name() function");
                }
                
            } catch (e: any) {
                console.log("   ❌ Not a valid ERC20:", e.message);
            }
            
        } catch (e: any) {
            console.log(`❌ Error checking ${address}:`, e.message);
        }
    }
    
    // Check what's actually deployed at our current address
    console.log("\n🔍 Detailed analysis of current USDC address...");
    const currentAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const code = await ethers.provider.getCode(currentAddress);
        console.log("Code length:", code.length);
        console.log("First 100 chars:", code.substring(0, 100));
        
        // Try different ABI approaches
        const erc20Abi = [
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function name() view returns (string)",
            "function balanceOf(address) view returns (uint256)",
            "function allowance(address,address) view returns (uint256)"
        ];
        
        const contract = new ethers.Contract(currentAddress, erc20Abi, ethers.provider);
        
        console.log("Testing direct calls...");
        try {
            const decimals = await contract.decimals();
            console.log("✅ Decimals work:", decimals);
        } catch (e: any) {
            console.log("❌ Decimals failed:", e.message);
        }
        
    } catch (e: any) {
        console.log("Error in detailed analysis:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });