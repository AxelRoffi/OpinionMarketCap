const fs = require('fs');
const path = require('path');

// Read the compiled FixedOpinionMarket artifact
const artifactPath = path.join(__dirname, '../artifacts/contracts/fixed/FixedOpinionMarket.sol/FixedOpinionMarket.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Extract only the functions the frontend needs
const frontendFunctions = [
    'nextOpinionId',
    'getOpinion',
    'opinions',
    'submitAnswer',
    'createOpinion'
];

const relevantFunctions = artifact.abi.filter(item => {
    return item.type === 'function' && frontendFunctions.includes(item.name);
});

console.log('// FixedOpinionMarket ABI for frontend');
console.log('export const OPINION_CORE_ABI = [');

relevantFunctions.forEach((func, index) => {
    const isLast = index === relevantFunctions.length - 1;
    console.log('  ' + JSON.stringify(func, null, 2).replace(/\n/g, '\n  ') + (isLast ? '' : ','));
});

console.log('] as const;');

console.log('\n// Function signatures:');
relevantFunctions.forEach(func => {
    const inputs = func.inputs.map(i => i.type).join(', ');
    const outputs = func.outputs?.map(o => o.type).join(', ') || 'void';
    console.log(`// ${func.name}(${inputs}) -> ${outputs}`);
});