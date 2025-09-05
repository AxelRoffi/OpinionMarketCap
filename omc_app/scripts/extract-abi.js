const fs = require('fs');
const path = require('path');

// Read the compiled contract artifact
const artifactPath = path.join(__dirname, '../artifacts/contracts/simple/SimpleOpinionMarket.sol/SimpleOpinionMarket.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Extract only the functions we need for the frontend
const relevantFunctions = artifact.abi.filter(item => {
  if (item.type !== 'function') return false;
  
  // Only include functions the frontend actually uses
  const frontendFunctions = [
    'nextOpinionId',
    'opinions', 
    'getOpinion',
    'submitAnswer',
    'createOpinion'
  ];
  
  return frontendFunctions.includes(item.name);
});

console.log('// Updated ABI for SimpleOpinionMarket - Frontend Compatible');
console.log('export const OPINION_CORE_ABI = [');

relevantFunctions.forEach((func, index) => {
  const isLast = index === relevantFunctions.length - 1;
  console.log('  ' + JSON.stringify(func, null, 2).replace(/\n/g, '\n  ') + (isLast ? '' : ','));
});

console.log('] as const;');

console.log('\n// Function signatures verification:');
relevantFunctions.forEach(func => {
  const inputs = func.inputs.map(i => i.type).join(', ');
  const outputs = func.outputs?.map(o => o.type).join(', ') || 'void';
  console.log(`// ${func.name}(${inputs}) -> ${outputs}`);
});