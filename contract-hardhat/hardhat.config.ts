import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
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
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false
    },
    "baseSepolia": {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "PLACEHOLDER",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
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