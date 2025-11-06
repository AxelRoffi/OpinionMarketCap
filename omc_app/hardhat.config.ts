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
      // Enable IR pipeline to resolve stack too deep errors
      viaIR: true,
      metadata: {
        bytecodeHash: "none"
      }
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true  // Allow large contracts for testing
    },
    "baseSepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 100000000, // Reduced gas price (0.1 gwei)
    },
    "base": {
      url: "https://mainnet.base.org",
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei (mainnet)
      gas: 5000000,
      timeout: 300000, // 5 minutes
      confirmations: 2, // Wait for 2 confirmations on mainnet
    },
    "sepolia": {
      url: "https://rpc.sepolia.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 2000000000,
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "PLACEHOLDER",
      base: process.env.BASESCAN_API_KEY || "PLACEHOLDER",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['OpinionMarket'],
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 100000
  }
};

export default config;