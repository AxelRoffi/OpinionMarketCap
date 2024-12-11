import { ethers } from "hardhat";

const INITIAL_OPINIONS = [
  {
    question: "Goat of soccer",
    price: "1000000" // 1 USDC (6 decimals)
  },
  {
    question: "Greatest nft project",
    price: "1000000"
  },
  {
    question: "Top OnlyFan account",
    price: "1000000"
  },
  {
    question: "Favourite fragrance for female",
    price: "1000000"
  },
  {
    question: "Best Pizza in NY",
    price: "1000000"
  },
  {
    question: "Goat of Basket-Ball",
    price: "1000000"
  },
  {
    question: "Most trusted crypto-exchange",
    price: "1000000"
  },
  {
    question: "Best Hip Hop Album ever",
    price: "1000000"
  },
  {
    question: "Best novel ever",
    price: "1000000"
  },
  {
    question: "Most influential prophet",
    price: "1000000"
  },
  {
    question: "Best SF movie ever",
    price: "1000000"
  },
  {
    question: "Most beautiful city",
    price: "1000000"
  },
  {
    question: "Best watch brand",
    price: "1000000"
  },
  {
    question: "Most iconic luxury brand",
    price: "1000000"
  }
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Mock Tokens for testnet
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const weth = await MockERC20.deploy("Wrapped ETH", "WETH");
  const usdc = await MockERC20.deploy("USD Coin", "USDC");

  console.log("WETH deployed to:", await weth.getAddress());
  console.log("USDC deployed to:", await usdc.getAddress());

  // Deploy OpinionMarket
  const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
  const opinionMarket = await OpinionMarket.deploy();
  await opinionMarket.waitForDeployment();

  console.log("OpinionMarket deployed to:", await opinionMarket.getAddress());

  // Configure tokens
  await opinionMarket.configureTokens(
    await weth.getAddress(),
    await usdc.getAddress()
  );
  console.log("Tokens configured");

  // Create initial opinions
  console.log("Creating initial opinions...");
  
  for (const opinion of INITIAL_OPINIONS) {
    const tx = await opinionMarket.createOpinion(
      opinion.question,
      opinion.price,
      [] // empty labels
    );
    await tx.wait();
    console.log(`Created opinion: ${opinion.question}`);
  }

  console.log("\nDeployment summary:");
  console.log("-------------------");
  console.log(`OpinionMarket: ${await opinionMarket.getAddress()}`);
  console.log(`WETH: ${await weth.getAddress()}`);
  console.log(`USDC: ${await usdc.getAddress()}`);
  console.log(`Number of opinions created: ${INITIAL_OPINIONS.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });