#!/usr/bin/env node

/**
 * Quick test script to verify MCP servers are working
 */

const { spawn } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const MCP_SERVERS = [
  'security-auditor',
  'contract-guardian', 
  'mainnet-deployment',
  'frontend-hardening',
  'frontend-testing',
  'web3-integrations',
  'deployment-pipeline',
  'web3-development'
];

async function testMCPServer(serverName) {
  const serverPath = join('mcp-servers', serverName);
  const indexPath = join(serverPath, 'index.js');
  const packagePath = join(serverPath, 'package.json');
  
  console.log(`\n🧪 Testing ${serverName}...`);
  
  // Check if files exist
  if (!existsSync(packagePath)) {
    console.log(`❌ Missing package.json for ${serverName}`);
    return false;
  }
  
  if (!existsSync(indexPath)) {
    console.log(`⚠️  Missing index.js for ${serverName} (create it next)`);
    return 'missing-index';
  }
  
  try {
    // Check package.json is valid
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log(`✅ package.json valid - ${pkg.name}`);
    
    // Test if dependencies are installed
    const nodeModulesPath = join(serverPath, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      console.log(`✅ Dependencies installed`);
    } else {
      console.log(`❌ Dependencies not installed - run: cd mcp-servers/${serverName} && npm install`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error testing ${serverName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 OpinionMarketCap MCP Server Health Check\n');
  
  const results = {};
  
  for (const server of MCP_SERVERS) {
    results[server] = await testMCPServer(server);
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  
  let ready = 0;
  let needsIndex = 0;
  let failed = 0;
  
  for (const [server, status] of Object.entries(results)) {
    if (status === true) {
      console.log(`✅ ${server} - READY`);
      ready++;
    } else if (status === 'missing-index') {
      console.log(`⚠️  ${server} - NEEDS INDEX.JS`);
      needsIndex++;
    } else {
      console.log(`❌ ${server} - FAILED`);
      failed++;
    }
  }
  
  console.log(`\n📈 Status: ${ready} ready, ${needsIndex} need index.js, ${failed} failed`);
  
  if (ready > 0) {
    console.log('\n🎯 Ready to use MCP servers:');
    console.log('You can now access these through Claude Code!');
    console.log('\nExample commands:');
    console.log('- security-auditor full_security_audit');
    console.log('- mainnet-deployment deploy_to_mainnet --dryRun=true');
    console.log('- frontend-hardening comprehensive_frontend_audit');
  }
  
  if (needsIndex > 0 || failed > 0) {
    console.log('\n🔧 Next steps:');
    if (needsIndex > 0) {
      console.log('- Create missing index.js files for MCP servers');
    }
    if (failed > 0) {
      console.log('- Install missing dependencies');
    }
  }
}

main().catch(console.error);