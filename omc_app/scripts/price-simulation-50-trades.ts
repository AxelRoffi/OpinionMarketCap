/**
 * Price Simulation: Expected Value After 50 Trades
 * Compares current market regime system vs simple growth
 */

interface MarketRegime {
  name: string;
  probability: number;
  minChange: number;
  maxChange: number;
}

interface ActivityLevel {
  name: string;
  regimes: MarketRegime[];
}

// Current system probabilities and ranges
const WARM_ACTIVITY: ActivityLevel = {
  name: "WARM (Normal)",
  regimes: [
    { name: "CONSOLIDATION", probability: 25, minChange: -10, maxChange: 15 },
    { name: "BULLISH_TRENDING", probability: 60, minChange: 5, maxChange: 40 },
    { name: "MILD_CORRECTION", probability: 13, minChange: -20, maxChange: 5 },
    { name: "PARABOLIC", probability: 2, minChange: 40, maxChange: 80 }
  ]
};

const COLD_ACTIVITY: ActivityLevel = {
  name: "COLD (Low Activity)",
  regimes: [
    { name: "CONSOLIDATION", probability: 40, minChange: -10, maxChange: 15 },
    { name: "BULLISH_TRENDING", probability: 45, minChange: 5, maxChange: 40 },
    { name: "MILD_CORRECTION", probability: 13, minChange: -20, maxChange: 5 },
    { name: "PARABOLIC", probability: 2, minChange: 40, maxChange: 80 }
  ]
};

const HOT_ACTIVITY: ActivityLevel = {
  name: "HOT (High Activity)",
  regimes: [
    { name: "CONSOLIDATION", probability: 15, minChange: -10, maxChange: 15 },
    { name: "BULLISH_TRENDING", probability: 62, minChange: 5, maxChange: 40 },
    { name: "MILD_CORRECTION", probability: 13, minChange: -20, maxChange: 5 },
    { name: "PARABOLIC", probability: 10, minChange: 40, maxChange: 80 }
  ]
};

function calculateExpectedValue(activityLevel: ActivityLevel): number {
  let expectedChange = 0;
  
  for (const regime of activityLevel.regimes) {
    // Calculate average change for this regime
    const avgChange = (regime.minChange + regime.maxChange) / 2;
    // Weight by probability
    expectedChange += (regime.probability / 100) * avgChange;
  }
  
  return expectedChange;
}

function simulateNTrades(startingPrice: number, trades: number, activityLevel: ActivityLevel): {
  finalPrice: number;
  expectedFinalPrice: number;
  regimeBreakdown: { [key: string]: number };
  simulationResults: Array<{ trade: number; price: number; regime: string; change: number }>;
} {
  const expectedChangePerTrade = calculateExpectedValue(activityLevel);
  const expectedFinalPrice = startingPrice * Math.pow(1 + expectedChangePerTrade / 100, trades);
  
  // Monte Carlo simulation
  const numSimulations = 10000;
  const finalPrices: number[] = [];
  const regimeCount: { [key: string]: number } = {};
  
  // Initialize regime counter
  activityLevel.regimes.forEach(regime => {
    regimeCount[regime.name] = 0;
  });
  
  for (let sim = 0; sim < numSimulations; sim++) {
    let price = startingPrice;
    
    for (let trade = 0; trade < trades; trade++) {
      // Select regime based on probabilities
      const random = Math.random() * 100;
      let cumulative = 0;
      let selectedRegime: MarketRegime | null = null;
      
      for (const regime of activityLevel.regimes) {
        cumulative += regime.probability;
        if (random < cumulative) {
          selectedRegime = regime;
          break;
        }
      }
      
      if (!selectedRegime) selectedRegime = activityLevel.regimes[1]; // fallback to bullish
      
      // Count regime usage
      regimeCount[selectedRegime.name]++;
      
      // Calculate price change within regime range
      const changePercent = selectedRegime.minChange + 
        Math.random() * (selectedRegime.maxChange - selectedRegime.minChange);
      
      price = price * (1 + changePercent / 100);
    }
    
    finalPrices.push(price);
  }
  
  // Calculate regime percentages
  const totalRegimeSelections = trades * numSimulations;
  const regimeBreakdown: { [key: string]: number } = {};
  for (const [regime, count] of Object.entries(regimeCount)) {
    regimeBreakdown[regime] = (count / totalRegimeSelections) * 100;
  }
  
  // Sample simulation for detailed view
  let samplePrice = startingPrice;
  const simulationResults: Array<{ trade: number; price: number; regime: string; change: number }> = [];
  
  for (let trade = 1; trade <= Math.min(trades, 10); trade++) {
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedRegime: MarketRegime | null = null;
    
    for (const regime of activityLevel.regimes) {
      cumulative += regime.probability;
      if (random < cumulative) {
        selectedRegime = regime;
        break;
      }
    }
    
    if (!selectedRegime) selectedRegime = activityLevel.regimes[1];
    
    const changePercent = selectedRegime.minChange + 
      Math.random() * (selectedRegime.maxChange - selectedRegime.minChange);
    
    const oldPrice = samplePrice;
    samplePrice = samplePrice * (1 + changePercent / 100);
    
    simulationResults.push({
      trade,
      price: samplePrice,
      regime: selectedRegime.name,
      change: changePercent
    });
  }
  
  const avgFinalPrice = finalPrices.reduce((sum, price) => sum + price, 0) / finalPrices.length;
  
  return {
    finalPrice: avgFinalPrice,
    expectedFinalPrice,
    regimeBreakdown,
    simulationResults
  };
}

function formatUSDC(price: number): string {
  return `$${(price / 1_000_000).toFixed(2)}`;
}

function analyzeMarketRegimes() {
  console.log("🎯 MARKET REGIME ANALYSIS - 50 TRADES SIMULATION");
  console.log("=".repeat(60));
  
  const startingPrice = 2_000_000; // $2.00 USDC
  const trades = 50;
  
  console.log(`Starting Price: ${formatUSDC(startingPrice)}`);
  console.log(`Number of Trades: ${trades}`);
  console.log();
  
  // Analyze each activity level
  const activityLevels = [COLD_ACTIVITY, WARM_ACTIVITY, HOT_ACTIVITY];
  
  activityLevels.forEach(level => {
    console.log(`📊 ${level.name} ACTIVITY LEVEL`);
    console.log("-".repeat(40));
    
    // Calculate expected value per trade
    const expectedChangePerTrade = calculateExpectedValue(level);
    console.log(`Expected Change Per Trade: ${expectedChangePerTrade.toFixed(2)}%`);
    
    // Run simulation
    const results = simulateNTrades(startingPrice, trades, level);
    
    console.log(`Expected Final Price (Mathematical): ${formatUSDC(results.expectedFinalPrice)}`);
    console.log(`Simulated Average Final Price: ${formatUSDC(results.finalPrice)}`);
    
    const totalGrowth = ((results.finalPrice / startingPrice - 1) * 100);
    console.log(`Total Growth: ${totalGrowth.toFixed(1)}%`);
    console.log(`Average Growth Per Trade: ${(totalGrowth / trades).toFixed(2)}%`);
    
    console.log("\nRegime Usage Breakdown:");
    for (const [regime, percentage] of Object.entries(results.regimeBreakdown)) {
      console.log(`  ${regime}: ${percentage.toFixed(1)}%`);
    }
    
    console.log("\nSample Simulation (First 10 trades):");
    results.simulationResults.forEach(result => {
      const sign = result.change >= 0 ? "+" : "";
      console.log(`  Trade ${result.trade}: ${formatUSDC(result.price)} (${sign}${result.change.toFixed(1)}%) [${result.regime}]`);
    });
    
    console.log();
  });
  
  // Compare with simple 8-10% growth
  console.log("🚀 SIMPLE 8-10% GROWTH COMPARISON");
  console.log("-".repeat(40));
  
  const simpleGrowthRates = [8, 9, 10];
  simpleGrowthRates.forEach(rate => {
    const finalPrice = startingPrice * Math.pow(1 + rate / 100, trades);
    const totalGrowth = ((finalPrice / startingPrice - 1) * 100);
    console.log(`${rate}% per trade: ${formatUSDC(finalPrice)} (${totalGrowth.toFixed(1)}% total growth)`);
  });
  
  console.log();
  
  // Risk analysis
  console.log("⚠️ RISK ANALYSIS");
  console.log("-".repeat(40));
  
  activityLevels.forEach(level => {
    let negativeRegimeProb = 0;
    let maxLossPerTrade = 0;
    
    level.regimes.forEach(regime => {
      if (regime.minChange < 0) {
        negativeRegimeProb += regime.probability;
        maxLossPerTrade = Math.min(maxLossPerTrade, regime.minChange);
      }
    });
    
    console.log(`${level.name}: ${negativeRegimeProb}% chance of loss per trade, max loss: ${maxLossPerTrade}%`);
  });
}

// Run the analysis
analyzeMarketRegimes();