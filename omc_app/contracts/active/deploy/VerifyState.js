const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying contract state on Base Mainnet...\n");

    const pool = await ethers.getContractAt("PoolManager", "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e");
    const admin = await ethers.getContractAt("OpinionAdmin", "0x4F0A1938E8707292059595275F9BBD067A301FD2");
    const ext = await ethers.getContractAt("OpinionExtensions", "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA");

    const poolCore = await pool.opinionCore();
    const adminCore = await admin.coreContract();
    const extCore = await ext.coreContract();

    const target = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";

    console.log("PoolManager.opinionCore:      ", poolCore, poolCore.toLowerCase() === target.toLowerCase() ? "✅" : "❌");
    console.log("OpinionAdmin.coreContract:    ", adminCore, adminCore.toLowerCase() === target.toLowerCase() ? "✅" : "❌");
    console.log("OpinionExtensions.coreContract:", extCore, extCore.toLowerCase() === target.toLowerCase() ? "✅" : "❌");

    if (poolCore.toLowerCase() === target.toLowerCase() &&
        adminCore.toLowerCase() === target.toLowerCase() &&
        extCore.toLowerCase() === target.toLowerCase()) {
        console.log("\n🎉 ALL CONTRACTS LINKED!");
    }
}

main().catch(console.error);
