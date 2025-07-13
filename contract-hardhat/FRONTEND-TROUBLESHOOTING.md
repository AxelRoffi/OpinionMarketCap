# 🔧 Frontend Connection Troubleshooting Guide

## 🎯 Current Status
- ✅ **Contract:** Working perfectly with 3 active opinions
- ✅ **Contract Address:** `0x21d8Cff98E50b1327022e786156749CcdBcE9d5e`
- ✅ **Network:** Base Sepolia (Chain ID: 84532)
- ✅ **ABI:** Matches deployed contract
- ❌ **Frontend:** Shows "Total Opinions: 0"

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open your browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for any red error messages
4. Common errors to look for:
   - Network connection errors
   - RainbowKit initialization errors
   - Contract call failures
   - Chain mismatch warnings

### Step 2: Verify Wallet Connection
1. **Check Network:** Ensure MetaMask/wallet is connected to **Base Sepolia**
   - Network Name: `Base Sepolia`
   - Chain ID: `84532`
   - RPC URL: `https://sepolia.base.org`
   - Block Explorer: `https://sepolia.basescan.org`

2. **Add Base Sepolia if missing:**
   ```
   Network Name: Base Sepolia
   New RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer URL: https://sepolia.basescan.org
   ```

### Step 3: Clear Browser Cache
1. **Hard Refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear Cache:** 
   - Chrome: Settings → Privacy and Security → Clear browsing data
   - Firefox: Settings → Privacy & Security → Clear Data
3. **Restart Browser**

### Step 4: Check RainbowKit Connection
1. Look for the "Connect Wallet" button
2. If already connected, try disconnecting and reconnecting
3. Make sure the connected address shows in the UI

### Step 5: Manual Network Test
Open browser console and run:
```javascript
// Check if window.ethereum exists
console.log('Ethereum provider:', !!window.ethereum);

// Check current chain ID
window.ethereum.request({ method: 'eth_chainId' })
  .then(chainId => console.log('Current Chain ID:', parseInt(chainId, 16)));

// Should log: Current Chain ID: 84532
```

## 🔧 Common Solutions

### Solution 1: Wrong Network
**Problem:** Wallet connected to different network
**Fix:** Switch to Base Sepolia in your wallet

### Solution 2: RPC Issues  
**Problem:** Base Sepolia RPC not responding
**Fix:** Try alternative RPC endpoints:
- `https://base-sepolia-rpc.publicnode.com`
- `https://sepolia.base.org`

### Solution 3: Cached Data
**Problem:** Old contract data cached
**Fix:** Clear browser storage:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

### Solution 4: RainbowKit Config
**Problem:** Wagmi/RainbowKit misconfiguration
**Fix:** Check `frontend/src/lib/wagmi.ts` contains:
```typescript
chains: [BASE_SEPOLIA]  // Make sure this matches our config
```

## 🧪 Quick Contract Test

To verify the contract is working, visit BaseScan:
https://sepolia.basescan.org/address/0x21d8Cff98E50b1327022e786156749CcdBcE9d5e#readContract

**Test these functions:**
1. `nextOpinionId()` → Should return `4`
2. `opinions(1)` → Should return opinion data
3. `opinions(2)` → Should return opinion data  
4. `opinions(3)` → Should return opinion data

## 🎯 Expected Frontend Behavior

When working correctly, the frontend should show:
- **Total Opinions:** 3
- **Opinion 1:** "Who will win 2026 World Cup?" → "Brazil" (3.0 USDC)
- **Opinion 2:** "Goat of Soccer ?" → "Zidane" (2.0 USDC)  
- **Opinion 3:** "Most beautiful city ?" → "Paris" (2.0 USDC)

## 📱 Next Steps

1. **Follow debugging steps above**
2. **Share any console errors found**
3. **Confirm wallet is on Base Sepolia**
4. **Try hard refresh + cache clear**

The contract is definitely working - this is purely a frontend connectivity issue that can be resolved with the right network setup!