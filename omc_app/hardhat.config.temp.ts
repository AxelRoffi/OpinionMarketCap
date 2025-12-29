import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,  // Optimize for contract size
      },
      viaIR: true,
      metadata: {
        bytecodeHash: "none"
      },
      debug: {
        revertStrings: "strip"
      }
    }
  },
  paths: {
    sources: "./contracts/active",  // Only compile active contracts
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    },
    "baseSepolia": {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 100000000,
    },
    "base": {
      url: "https://mainnet.base.org", 
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      gas: 5000000,
      timeout: 300000,
      confirmations: 2,
    }
  }
};

export default config;