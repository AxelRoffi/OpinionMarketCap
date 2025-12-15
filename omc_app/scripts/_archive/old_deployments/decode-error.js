const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 DECODING CONTRACT ERROR 0xe2517d3f");
    console.log("======================================");
    
    const errorSelector = "0xe2517d3f";
    
    // Common error signatures to check
    const errorSignatures = [
        "InsufficientAllowance(uint256,uint256)",
        "PoolInvalidPoolId(uint256)", 
        "PoolInvalidOpinionId(uint256)",
        "PoolSameAnswerAsCurrentAnswer(uint256,string)",
        "PoolDeadlineTooShort(uint256,uint256)",
        "PoolDeadlineTooLong(uint256,uint256)",
        "PoolInitialContributionTooLow(uint256,uint256)",
        "PoolInvalidProposedAnswer()",
        "PoolNotActive(uint256,uint8)",
        "PoolDeadlinePassed(uint256,uint256)",
        "PoolContributionTooLow(uint256,uint256)",
        "PoolInsufficientFunds(uint256,uint256)",
        "PoolExecutionFailed(uint256)",
        "PoolAlreadyExecuted(uint256)",
        "PoolNoContribution(uint256,address)",
        "PoolNotExpired(uint256,uint256)",
        "PoolAlreadyRefunded(uint256,address)",
        "PoolAlreadyFunded(uint256)",
        "PoolInvalidNameLength()",
        "ZeroAddressNotAllowed()",
        "InvalidTokenTransfer()",
        "OpinionNotFound()",
        "OpinionNotActive()",
        "UnauthorizedCreator()",
        "NotTheOwner(address,address)",
        "InvalidQuestionLength()",
        "InvalidAnswerLength()",
        "InvalidCategory()",
        "NoFeesToClaim()",
        "FeeTooHigh(uint8,uint256,uint256)"
    ];
    
    console.log("🔍 Calculating error selectors...");
    
    for (const signature of errorSignatures) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
        const selector = hash.slice(0, 10); // First 4 bytes
        
        if (selector.toLowerCase() === errorSelector.toLowerCase()) {
            console.log("✅ MATCH FOUND:");
            console.log("   Error signature:", signature);
            console.log("   Selector:", selector);
            
            // Try to decode the data if we have it
            const errorData = "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1";
            
            try {
                console.log("\n🔍 Decoding error data:");
                console.log("   Raw data:", errorData);
                
                // Remove the selector (first 4 bytes)
                const dataWithoutSelector = "0x" + errorData.slice(10);
                
                // Try different decoding approaches based on the signature
                if (signature.includes("uint256,uint256")) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                        ["uint256", "uint256"], 
                        dataWithoutSelector
                    );
                    console.log("   Decoded values:", decoded[0].toString(), decoded[1].toString());
                } else if (signature.includes("uint256")) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                        ["uint256"], 
                        dataWithoutSelector
                    );
                    console.log("   Decoded value:", decoded[0].toString());
                } else if (signature.includes("address,address")) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                        ["address", "address"], 
                        dataWithoutSelector
                    );
                    console.log("   Decoded addresses:", decoded[0], decoded[1]);
                }
                
            } catch (decodeError) {
                console.log("   Could not decode error data:", decodeError.message);
            }
            
            return;
        }
    }
    
    console.log("❌ No match found in common error signatures");
    console.log("   Error selector:", errorSelector);
    console.log("   This might be a custom error not in our list");
    
    // Manual calculation for debugging
    console.log("\n🔍 Manual calculations:");
    console.log("   InsufficientAllowance(uint256,uint256):", ethers.keccak256(ethers.toUtf8Bytes("InsufficientAllowance(uint256,uint256)")).slice(0, 10));
    console.log("   PoolInvalidOpinionId(uint256):", ethers.keccak256(ethers.toUtf8Bytes("PoolInvalidOpinionId(uint256)")).slice(0, 10));
    console.log("   InvalidTokenTransfer():", ethers.keccak256(ethers.toUtf8Bytes("InvalidTokenTransfer()")).slice(0, 10));
    
    // Look at the error data more carefully
    console.log("\n🔍 Analyzing error data structure:");
    const errorData = "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1";
    console.log("   Selector:", errorData.slice(0, 10));
    console.log("   Data:", errorData.slice(10));
    console.log("   Data length:", (errorData.length - 10) / 2, "bytes");
    
    // Try to decode as addresses
    try {
        const dataWithoutSelector = "0x" + errorData.slice(10);
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address", "bytes32"], 
            dataWithoutSelector
        );
        console.log("   Possible address:", decoded[0]);
        console.log("   Possible bytes32:", decoded[1]);
    } catch (e) {
        console.log("   Could not decode as address+bytes32");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });