// BaseScan V2 API Verification
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

if (!BASESCAN_API_KEY) {
    console.error('❌ BASESCAN_API_KEY not found in .env file');
    process.exit(1);
}

async function verifyContractV2() {
    console.log('🚀 BaseScan V2 API Verification');
    console.log('================================\n');
    
    // Read source code
    const sourceCode = fs.readFileSync('./flattened-opinioncore-viair.sol', 'utf8');
    
    // Create multipart form data for V2 API
    const boundary = '----FormBoundary' + Math.random().toString(36);
    
    const formData = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="apikey"',
        '',
        BASESCAN_API_KEY,
        `--${boundary}`,
        'Content-Disposition: form-data; name="module"',
        '',
        'contract',
        `--${boundary}`,
        'Content-Disposition: form-data; name="action"',
        '',
        'verifysourcecode',
        `--${boundary}`,
        'Content-Disposition: form-data; name="chainId"',
        '',
        '8453', // Base mainnet
        `--${boundary}`,
        'Content-Disposition: form-data; name="contractaddress"',
        '',
        '0xC47bFEc4D53C51bF590beCEA7dC935116E210E97',
        `--${boundary}`,
        'Content-Disposition: form-data; name="sourceCode"',
        '',
        sourceCode,
        `--${boundary}`,
        'Content-Disposition: form-data; name="codeformat"',
        '',
        'solidity-single-file',
        `--${boundary}`,
        'Content-Disposition: form-data; name="contractname"',
        '',
        'OpinionCoreSimplified',
        `--${boundary}`,
        'Content-Disposition: form-data; name="compilerversion"',
        '',
        'v0.8.20+commit.a1b79de6',
        `--${boundary}`,
        'Content-Disposition: form-data; name="optimizationUsed"',
        '',
        '1',
        `--${boundary}`,
        'Content-Disposition: form-data; name="runs"',
        '',
        '1',
        `--${boundary}`,
        'Content-Disposition: form-data; name="viaIR"',
        '',
        '1',
        `--${boundary}`,
        'Content-Disposition: form-data; name="evmversion"',
        '',
        'paris',
        `--${boundary}`,
        'Content-Disposition: form-data; name="licenseType"',
        '',
        '3', // MIT
        `--${boundary}`,
        'Content-Disposition: form-data; name="libraryname1"',
        '',
        'PriceCalculator',
        `--${boundary}`,
        'Content-Disposition: form-data; name="libraryaddress1"',
        '',
        '0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7',
        `--${boundary}--`
    ].join('\r\n');
    
    const options = {
        hostname: 'api.basescan.org',
        port: 443,
        path: '/v2/api',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(formData)
        }
    };
    
    console.log('📤 Sending V2 API verification request...');
    console.log('Contract: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97');
    console.log('Compiler: v0.8.20 with viaIR enabled');
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('\n📥 Raw response:', data);
                try {
                    const response = JSON.parse(data);
                    
                    if (response.status === '1' || response.message === 'OK') {
                        console.log('\n✅ Verification request submitted!');
                        if (response.result) {
                            console.log(`GUID: ${response.result}`);
                            setTimeout(() => checkStatus(response.result), 15000);
                        }
                    } else {
                        console.error('\n❌ Verification failed:', response);
                        
                        // If it's a specific error, provide guidance
                        if (response.result && response.result.includes('already verified')) {
                            console.log('\n💡 Contract may already be verified. Check:');
                            console.log('https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code');
                        }
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e.message);
                    console.log('Raw response:', data);
                }
                resolve();
            });
        });
        
        req.on('error', reject);
        req.write(formData);
        req.end();
    });
}

function checkStatus(guid) {
    https.get(`https://api.basescan.org/api?apikey=${BASESCAN_API_KEY}&module=contract&action=checkverifystatus&guid=${guid}`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('\n📊 Status check:', response);
            
            if (response.status === '1') {
                console.log('\n🎉 VERIFIED! Contract methods now available on BaseScan!');
                console.log('🔗 https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code');
            } else if (response.result && response.result.includes('Pending')) {
                console.log('⏳ Still processing...');
                setTimeout(() => checkStatus(guid), 15000);
            }
        });
    });
}

// Alternative: Try manual submission instructions
console.log('📝 Manual Alternative:');
console.log('1. Visit: https://basescan.org/verifyContract-solc');
console.log('2. Enter: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97');
console.log('3. Select "Solidity (Standard-Json-Input)"');
console.log('4. Upload the standard-input.json file');
console.log('5. This method includes viaIR in the JSON\n');

// Run verification
verifyContractV2().catch(console.error);