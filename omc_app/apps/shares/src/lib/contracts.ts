// Contract addresses - TO BE DEPLOYED
export const CONTRACTS = {
  // Base Mainnet
  mainnet: {
    ANSWER_SHARES_CORE: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  // Base Sepolia (Testnet)
  testnet: {
    ANSWER_SHARES_CORE: "0x0000000000000000000000000000000000000000", // TODO: Deploy
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
  },
};

// Get contracts for current chain
export function getContracts(chainId: number) {
  if (chainId === 8453) {
    return CONTRACTS.mainnet;
  }
  return CONTRACTS.testnet;
}
