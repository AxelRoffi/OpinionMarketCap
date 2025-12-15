import { run } from "hardhat";

async function main() {
    console.log("🔍 Verifying Proxy Contract...");
    
    const PROXY_ADDRESS = "0x3A4457D3bd78fab1023FCa8e31b9Fc0FC38B8093";
    const IMPLEMENTATION_ADDRESS = "0x9376f86156e7647d70b1855b76efa70e5772aa1d";
    
    try {
        console.log("Verifying implementation contract...");
        await run("verify:verify", {
            address: IMPLEMENTATION_ADDRESS,
            constructorArguments: [],
        });
        console.log("✅ Implementation verified!");
        
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("✅ Implementation already verified!");
        } else {
            console.log("⚠️ Implementation verification error:", e.message);
        }
    }
    
    try {
        console.log("Verifying proxy contract...");
        await run("verify:verify", {
            address: PROXY_ADDRESS,
            constructorArguments: [],
        });
        console.log("✅ Proxy verified!");
        
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("✅ Proxy already verified!");
        } else {
            console.log("⚠️ Proxy verification error:", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    });