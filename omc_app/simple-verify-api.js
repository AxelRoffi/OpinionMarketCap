// Simple BaseScan API verification - focused approach
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
require('dotenv').config();

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

if (!BASESCAN_API_KEY) {
    console.error('❌ BASESCAN_API_KEY not found in .env file');
    process.exit(1);
}

async function verifyContract() {
    console.log('🚀 BaseScan API Direct Verification');
    console.log('===================================\n');
    
    // Read the flattened source
    const sourceCode = fs.readFileSync('./flattened-opinioncore-viair.sol', 'utf8');
    
    // Prepare data exactly as BaseScan expects
    const postData = querystring.stringify({
        apikey: BASESCAN_API_KEY,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: '0xC47bFEc4D53C51bF590beCEA7dC935116E210E97',
        sourceCode: sourceCode,
        contractname: 'OpinionCoreSimplified',
        compilerversion: 'v0.8.20+commit.a1b79de6',
        optimizationUsed: '1',
        runs: '1',
        // CRITICAL FLAGS
        viaIR: '1',
        evmversion: 'paris',
        licenseType: '3', // MIT
        libraryname1: 'PriceCalculator',
        libraryaddress1: '0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7'
    });
    
    const options = {
        hostname: 'api.basescan.org',
        port: 443,
        path: '/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    console.log('📤 Sending verification request...');
    console.log('Contract: 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97');
    console.log('Via IR: ENABLED ✅');
    console.log('Library: PriceCalculator linked\n');
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('📥 Response:', response);
                    
                    if (response.status === '1') {
                        console.log('\n✅ SUCCESS! Verification submitted');
                        console.log(`GUID: ${response.result}`);
                        console.log('\nChecking status in 20 seconds...');
                        
                        setTimeout(() => {
                            checkVerificationStatus(response.result);
                        }, 20000);
                    } else {
                        console.error('\n❌ Failed:', response.result);
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e.message);
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`❌ Request error: ${e.message}`);
            reject(e);
        });
        
        req.write(postData);
        req.end();
    });
}

function checkVerificationStatus(guid) {
    const params = querystring.stringify({
        apikey: BASESCAN_API_KEY,
        module: 'contract',
        action: 'checkverifystatus',
        guid: guid
    });
    
    https.get(`https://api.basescan.org/api?${params}`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('\n📊 Status:', response);
            
            if (response.status === '1') {
                console.log('\n🎉 CONTRACT VERIFIED ON BASESCAN!');
                console.log('✅ You can now use Read/Write Contract features');
                console.log('🔗 https://basescan.org/address/0xC47bFEc4D53C51bF590beCEA7dC935116E210E97#code');
            } else if (response.result.includes('Pending')) {
                console.log('⏳ Still pending... checking again in 20 seconds');
                setTimeout(() => checkVerificationStatus(guid), 20000);
            } else {
                console.log('❌ Verification issue:', response.result);
            }
        });
    });
}

// Run it
verifyContract().catch(console.error);