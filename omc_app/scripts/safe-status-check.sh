#!/bin/bash

echo "🛡️  Safe Wallet Status Check"
echo "="*40

# Your EOA
EOA="0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3"

# Known Safe addresses from your config
SAFE1="0xFb7eF00D5C2a87d282F273632e834f9105795067"
SAFE2="0xAe78a6c716DEA5C1580bca0B05C4A4ca6337C94a"

RPC="https://mainnet.base.org"

echo "Checking Safe wallets for EOA: $EOA"
echo ""

check_safe() {
    local safe_addr=$1
    local safe_name=$2
    
    echo "🔍 $safe_name ($safe_addr):"
    
    # Check if address has code (is a contract)
    local code=$(cast code $safe_addr --rpc-url $RPC 2>/dev/null)
    if [[ ${#code} -le 4 ]]; then
        echo "  ❌ No contract code - not a Safe wallet"
        return
    fi
    
    # Check if it's a Safe by calling getThreshold
    local threshold=$(cast call $safe_addr "getThreshold()(uint256)" --rpc-url $RPC 2>/dev/null || echo "error")
    if [[ "$threshold" == "error" ]]; then
        echo "  ❓ Contract exists but may not be a Safe wallet"
        return
    fi
    
    echo "  ✅ Valid Safe wallet"
    echo "  📊 Threshold: $threshold"
    
    # Check if your EOA is an owner
    local is_owner=$(cast call $safe_addr "isOwner(address)" $EOA --rpc-url $RPC 2>/dev/null || echo "error")
    if [[ "$is_owner" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
        echo "  ✅ Your EOA IS an owner of this Safe"
        echo "  🎯 You can use this Safe!"
    else
        echo "  ❌ Your EOA is NOT an owner of this Safe"
    fi
    
    # Get owners list
    local owners_data=$(cast call $safe_addr "getOwners()(address[])" --rpc-url $RPC 2>/dev/null || echo "error")
    if [[ "$owners_data" != "error" ]]; then
        echo "  👥 Owners: $owners_data"
    fi
    
    echo ""
}

check_safe $SAFE1 "Treasury Safe"
check_safe $SAFE2 "Enhanced Safe"

echo "💡 Troubleshooting Tips:"
echo "1. Make sure you're connected to Base Mainnet in your wallet"
echo "2. If you own a Safe, go to: https://app.safe.global/welcome"
echo "3. Connect your EOA and select the correct Safe"
echo "4. Check that the network is set to Base (chain ID 8453)"