// Verify Mainnet Deployment Script
// Run this after deployment to check everything is working

const { ethers } = require('ethers');

// Configuration
const MAINNET_RPC = 'https://mainnet.base.org';
const CONTRACTS = {
  OPINION_CORE: '0xC47bFEc4D53C51bF590beCEA7dC935116E210E97',
  FEE_MANAGER: '0x64997bd18520d93e7f0da87c69582d06b7f265d5',
  POOL_MANAGER: '0xd6f4125e1976c5eee6fc684bdb68d1719ac34259',
  USDC_TOKEN: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};

// Minimal ABI for testing
const OPINION_CORE_ABI = [
  'function nextOpinionId() view returns (uint256)',
  'function getOpinionDetails(uint256) view returns (tuple(uint96 lastPrice, uint96 nextPrice, uint96 totalVolume, uint96 salePrice, address creator, address questionOwner, address currentAnswerOwner, bool isActive, string question, string currentAnswer, string currentAnswerDescription, string ipfsHash, string link, string[] categories))',
  'event OpinionAction(uint256 indexed opinionId, uint8 actionType, string content, address indexed actor, uint256 price)'
];

const USDC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

async function verifyMainnetDeployment() {
  console.log('🔍 Verifying OpinionMarketCap Mainnet Deployment...\n');

  try {
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
    const network = await provider.getNetwork();
    
    console.log(`✅ Connected to ${network.name} (chainId: ${network.chainId})`);
    
    if (network.chainId !== 8453n) {
      console.error('❌ Not connected to Base Mainnet!');
      return;
    }

    // Check contracts
    console.log('\n📋 Verifying Contracts:');
    
    // Check OpinionCore
    const opinionCore = new ethers.Contract(CONTRACTS.OPINION_CORE, OPINION_CORE_ABI, provider);
    const nextId = await opinionCore.nextOpinionId();
    console.log(`✅ OpinionCore: ${CONTRACTS.OPINION_CORE}`);
    console.log(`   Next Opinion ID: ${nextId}`);

    // Get latest opinion if exists
    if (nextId > 1) {
      const latestOpinionId = Number(nextId) - 1;
      const opinion = await opinionCore.getOpinionDetails(latestOpinionId);
      console.log(`   Latest Opinion (#${latestOpinionId}): "${opinion.question.substring(0, 50)}..."`);
      console.log(`   Current Answer: "${opinion.currentAnswer}"`);
      console.log(`   Next Price: $${Number(opinion.nextPrice) / 1_000_000}`);
    }

    // Check USDC
    console.log(`\n✅ USDC Token: ${CONTRACTS.USDC_TOKEN}`);
    const usdc = new ethers.Contract(CONTRACTS.USDC_TOKEN, USDC_ABI, provider);
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);

    // Check recent events
    console.log('\n📊 Recent Activity:');
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000); // Last 1000 blocks
    
    const filter = opinionCore.filters.OpinionAction();
    const events = await opinionCore.queryFilter(filter, fromBlock, currentBlock);
    
    console.log(`   Found ${events.length} OpinionAction events in last 1000 blocks`);
    
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      const actionTypes = ['Create', 'Answer', 'Deactivate', 'Reactivate'];
      console.log(`   Latest: ${actionTypes[latestEvent.args.actionType]} by ${latestEvent.args.actor.substring(0, 8)}...`);
    }

    // Frontend checks
    console.log('\n🌐 Frontend Verification:');
    console.log('   Please manually verify:');
    console.log('   1. ✓ https://app.opinionmarketcap.xyz is accessible');
    console.log('   2. ✓ Shows "Base Mainnet" in the UI');
    console.log('   3. ✓ Wallet connects successfully');
    console.log('   4. ✓ Can view existing opinions');
    console.log('   5. ✓ Create opinion redirects properly after success');

    console.log('\n✅ Mainnet deployment verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyMainnetDeployment();