// BaseScan API Verification Script
// This bypasses the web interface and uses the API directly with viaIR support

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;
const CONTRACT_ADDRESS = '0xC47bFEc4D53C51bF590beCEA7dC935116E210E97';

async function verifyContract() {
    console.log('🔧 BaseScan API Verification with viaIR');
    console.log('=====================================\n');

    // Read the flattened source code
    const sourceCode = fs.readFileSync('./flattened-opinioncore-viair.sol', 'utf8');
    
    // Prepare the verification payload
    const data = {
        apikey: BASESCAN_API_KEY,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: CONTRACT_ADDRESS,
        sourceCode: sourceCode,
        contractname: 'OpinionCoreSimplified',
        compilerversion: 'v0.8.20+commit.a1b79de6',
        optimizationUsed: '1',
        runs: '1',
        evmversion: 'paris', // or 'london' depending on your deployment
        // CRITICAL: These additional parameters enable viaIR
        viaIR: '1', // This is the key parameter
        licenseType: '3', // MIT
        libraryname1: 'PriceCalculator',
        libraryaddress1: '0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7',
        // No constructor arguments for upgradeable contracts
        constructorArguements: ''
    };

    try {
        console.log('📤 Submitting verification request...');
        console.log(`Contract: ${CONTRACT_ADDRESS}`);
        console.log(`Compiler: v0.8.20`);
        console.log(`Optimization: Yes (1 run)`);
        console.log(`Via IR: ENABLED ✅`);
        console.log(`Library: PriceCalculator at ${data.libraryaddress1}`);
        
        const response = await axios.post(
            'https://api.basescan.org/api',
            new URLSearchParams(data),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('\n📥 Response:', response.data);

        if (response.data.status === '1') {
            console.log('\n✅ Verification request submitted successfully!');
            console.log(`GUID: ${response.data.result}`);
            console.log('\nChecking verification status...');
            
            // Check status after a delay
            setTimeout(() => checkStatus(response.data.result), 10000);
        } else {
            console.error('\n❌ Verification failed:', response.data.result);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

async function checkStatus(guid) {
    const statusData = {
        apikey: BASESCAN_API_KEY,
        module: 'contract',
        action: 'checkverifystatus',
        guid: guid
    };

    try {
        const response = await axios.get('https://api.basescan.org/api', {
            params: statusData
        });

        console.log('\n📊 Status Check:', response.data);
        
        if (response.data.status === '1') {
            console.log('\n🎉 CONTRACT VERIFIED SUCCESSFULLY!');
            console.log(`View at: https://basescan.org/address/${CONTRACT_ADDRESS}#code`);
        } else if (response.data.result === 'Pending in queue') {
            console.log('\n⏳ Still processing... checking again in 10 seconds');
            setTimeout(() => checkStatus(guid), 10000);
        } else {
            console.log('\n❌ Verification status:', response.data.result);
        }
    } catch (error) {
        console.error('\n❌ Status check error:', error.message);
    }
}

// Alternative approach using standard input JSON
async function verifyWithStandardJson() {
    console.log('\n🔄 Alternative: Using Standard JSON Input');
    console.log('=====================================\n');

    // Read the Hardhat compilation output
    const artifactPath = './artifacts/contracts/core/OpinionCoreNoMod.sol/OpinionCoreSimplified.json';
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Create standard JSON input that matches your hardhat config
    const standardJson = {
        language: "Solidity",
        sources: {
            "OpinionCoreNoMod.sol": {
                content: fs.readFileSync('./flattened-opinioncore-viair.sol', 'utf8')
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 1
            },
            viaIR: true, // CRITICAL: This must be true
            outputSelection: {
                "*": {
                    "*": ["*"]
                }
            },
            libraries: {
                "OpinionCoreNoMod.sol": {
                    "PriceCalculator": "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"
                }
            }
        }
    };

    // Save standard JSON for manual submission if needed
    fs.writeFileSync('./standard-input.json', JSON.stringify(standardJson, null, 2));
    console.log('✅ Saved standard-input.json for manual submission');
    
    // Try API submission with standard JSON
    const data = {
        apikey: BASESCAN_API_KEY,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: CONTRACT_ADDRESS,
        sourceCode: JSON.stringify(standardJson),
        contractname: 'OpinionCoreNoMod.sol:OpinionCoreSimplified',
        compilerversion: 'v0.8.20+commit.a1b79de6',
        optimizationUsed: '1',
        runs: '1',
        viaIR: '1'
    };

    try {
        const response = await axios.post(
            'https://api.basescan.org/api',
            new URLSearchParams(data)
        );
        
        console.log('\n📥 Response:', response.data);
        
        if (response.data.status === '1') {
            console.log('\n✅ Standard JSON verification submitted!');
            setTimeout(() => checkStatus(response.data.result), 10000);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Check if API key is set
if (!BASESCAN_API_KEY) {
    console.error('❌ Please set BASESCAN_API_KEY in your .env file');
    process.exit(1);
}

// Run verification
console.log('Choose verification method:');
console.log('1. Direct source code verification');
console.log('2. Standard JSON verification');
console.log('\nRunning both methods...\n');

verifyContract()
    .then(() => {
        // Also try standard JSON method
        return verifyWithStandardJson();
    })
    .catch(console.error);