#!/bin/bash

echo "🔍 Simple Ownership Verification for Base Mainnet Contract"
echo "Contract: 0x64997bd18520d93e7f0da87c69582d06b7f265d5"
echo "="*60

# Your EOA address
EOA="0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3"

# Common Safe addresses (you might have used one of these)
SAFE1="0xFb7eF00D5C2a87d282F273632e834f9105795067"  # Treasury from config
SAFE2="0xAe78a6c716DEA5C1580bca0B05C4A4ca6337C94a"  # Enhanced Safe from config

# Role constants
DEFAULT_ADMIN_ROLE="0x0000000000000000000000000000000000000000000000000000000000000000"
ADMIN_ROLE="0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775"
RPC="https://mainnet.base.org"
CONTRACT="0x64997bd18520d93e7f0da87c69582d06b7f265d5"

echo "🔑 Checking Role Assignments:"
echo ""

# Check your EOA
echo "👤 Your EOA ($EOA):"
DEFAULT_ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $DEFAULT_ADMIN_ROLE $EOA --rpc-url $RPC 2>/dev/null || echo "error")
ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $ADMIN_ROLE $EOA --rpc-url $RPC 2>/dev/null || echo "error")

if [[ "$DEFAULT_ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ DEFAULT_ADMIN_ROLE"
else
    echo "  ❌ DEFAULT_ADMIN_ROLE"
fi

if [[ "$ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ ADMIN_ROLE"
else
    echo "  ❌ ADMIN_ROLE"
fi

echo ""

# Check Safe 1
echo "🛡️  Treasury Safe ($SAFE1):"
DEFAULT_ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $DEFAULT_ADMIN_ROLE $SAFE1 --rpc-url $RPC 2>/dev/null || echo "error")
ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $ADMIN_ROLE $SAFE1 --rpc-url $RPC 2>/dev/null || echo "error")

if [[ "$DEFAULT_ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ DEFAULT_ADMIN_ROLE"
    echo "  🎯 Treasury Safe HAS ADMIN ACCESS!"
else
    echo "  ❌ DEFAULT_ADMIN_ROLE"
fi

if [[ "$ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ ADMIN_ROLE"
    echo "  🎯 Treasury Safe HAS ADMIN ACCESS!"
else
    echo "  ❌ ADMIN_ROLE"
fi

echo ""

# Check Safe 2
echo "🛡️  Enhanced Safe ($SAFE2):"
DEFAULT_ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $DEFAULT_ADMIN_ROLE $SAFE2 --rpc-url $RPC 2>/dev/null || echo "error")
ADMIN=$(cast call $CONTRACT "hasRole(bytes32,address)" $ADMIN_ROLE $SAFE2 --rpc-url $RPC 2>/dev/null || echo "error")

if [[ "$DEFAULT_ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ DEFAULT_ADMIN_ROLE"
    echo "  🎯 Enhanced Safe HAS ADMIN ACCESS!"
else
    echo "  ❌ DEFAULT_ADMIN_ROLE"
fi

if [[ "$ADMIN" == *"0x0000000000000000000000000000000000000000000000000000000000000001"* ]]; then
    echo "  ✅ ADMIN_ROLE"
    echo "  🎯 Enhanced Safe HAS ADMIN ACCESS!"
else
    echo "  ❌ ADMIN_ROLE"
fi

echo ""

# Check if contract is initialized
echo "📊 Contract Status:"
NEXT_OPINION_ID=$(cast call $CONTRACT "nextOpinionId()(uint256)" --rpc-url $RPC 2>/dev/null || echo "error")
if [[ "$NEXT_OPINION_ID" == "error" ]]; then
    echo "  ❌ Contract not initialized or has errors"
else
    echo "  ✅ Contract initialized (nextOpinionId: $NEXT_OPINION_ID)"
fi

PAUSED=$(cast call $CONTRACT "paused()(bool)" --rpc-url $RPC 2>/dev/null || echo "error")
if [[ "$PAUSED" == *"true"* ]]; then
    echo "  ⏸️  Contract is PAUSED"
elif [[ "$PAUSED" == *"false"* ]]; then
    echo "  ▶️  Contract is ACTIVE"
else
    echo "  ❓ Contract pause status unknown"
fi

echo ""
echo "💡 Summary:"
echo "- If any Safe shows ✅, you can use that Safe to manage the contract"
echo "- If all show ❌, you may need to check other Safe addresses or investigate deployment"
echo "- Access your Safe at: https://app.safe.global/"