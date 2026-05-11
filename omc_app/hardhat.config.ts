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
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,  // Optimize for contract size
      },
      // REQUIRED: Contract has stack too deep errors without viaIR
      viaIR: true,
      metadata: {
        bytecodeHash: "none"
      },
      debug: {
        revertStrings: "strip"  // Strip revert strings to save space
      }
    }
  },
  paths: {
    sources: "./contracts/active",  // Only compile active contracts for deployment
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      // Tell Hardhat which hardfork to use locally.
      hardfork: "shanghai",
      // Hardfork history for any chains we might fork from. Required when
      // forking custom L2s like Base — without this, historical-block calls
      // throw "No known hardfork for execution".
      chains: {
        8453: {
          hardforkHistory: {
            shanghai: 0,
          },
        },
      },
      // FORK_BASE=1 enables an in-process Base mainnet fork.
      // Pin to a specific (recent) block so the hardfork lookup doesn't move.
      ...(process.env.FORK_BASE
        ? {
            forking: {
              url: "https://mainnet.base.org",
              blockNumber: 45000000,
            },
          }
        : {}),
    },
    "baseSepolia": {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 100000000, // Reduced gas price (0.1 gwei)
    },
    "base": {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 50000000, // 0.05 gwei — typical Base mainnet level (was 1 gwei = 20× too high)
      gas: 5000000,
      timeout: 300000, // 5 minutes
    },
    "sepolia": {
      url: "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2000000000,
    }
  },
  etherscan: {
    // Etherscan V2 unified API — one key (etherscan.io) covers all chains.
    // Get a free key at https://etherscan.io/myapikey then set ETHERSCAN_API_KEY (or
    // re-use BASESCAN_API_KEY env var with a value that comes from etherscan.io).
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.BASESCAN_API_KEY || "PLACEHOLDER",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
    only: ['OpinionCore', 'OpinionAdmin', 'OpinionExtensions', 'FeeManager', 'PoolManager'],
  },
  paths: {
    sources: "./contracts/active",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 100000
  }
};

export default config;