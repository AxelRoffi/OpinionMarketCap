# How to Interact with Your Contract Functions

Since BaseScan verification is blocked, here are immediate alternatives:

## Option 1: Louper.dev (Recommended - Most Similar to Etherscan)

1. Go to https://louper.dev/
2. Enter your contract: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
3. Select "Base" network
4. It will automatically load from Sourcify verification
5. You'll get Read/Write tabs just like BaseScan!

## Option 2: Base Blockscout (Alternative Explorer)

1. Go to https://base.blockscout.com/
2. Search for: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
3. Look for "Read Contract" / "Write Contract" tabs
4. They may auto-import from Sourcify

## Option 3: Cast CLI (Quick Commands)

```bash
# Read functions
cast call 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 "nextOpinionId()" --rpc-url https://mainnet.base.org
cast call 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 "isPublicCreationEnabled()" --rpc-url https://mainnet.base.org
cast call 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 "getOpinionDetails(uint256)" 1 --rpc-url https://mainnet.base.org

# Write functions (need private key)
cast send 0xC47bFEc4D53C51bF590beCEA7dC935116E210E97 "togglePublicCreation()" --private-key $PK --rpc-url https://mainnet.base.org
```

## Option 4: Quick Web Interface

Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contract Interface</title>
    <script src="https://cdn.ethers.io/lib/ethers-5.7.2.esm.min.js" type="module"></script>
</head>
<body>
    <h1>OpinionCore Contract Interface</h1>
    <button id="connect">Connect Wallet</button>
    <div id="functions" style="display:none;">
        <h2>Read Functions</h2>
        <button onclick="readNextId()">Get Next Opinion ID</button>
        <button onclick="readPublicCreation()">Check Public Creation</button>
        
        <h2>Write Functions</h2>
        <button onclick="togglePublic()">Toggle Public Creation</button>
    </div>
    <div id="result"></div>

    <script type="module">
        import { ethers } from "https://cdn.ethers.io/lib/ethers-5.7.2.esm.min.js";
        
        const contractAddress = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
        const abi = [
            "function nextOpinionId() view returns (uint256)",
            "function isPublicCreationEnabled() view returns (bool)",
            "function togglePublicCreation()"
        ];
        
        let provider, signer, contract;
        
        document.getElementById('connect').onclick = async () => {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            document.getElementById('functions').style.display = 'block';
        }
        
        window.readNextId = async () => {
            const id = await contract.nextOpinionId();
            document.getElementById('result').innerText = `Next ID: ${id}`;
        }
        
        window.readPublicCreation = async () => {
            const enabled = await contract.isPublicCreationEnabled();
            document.getElementById('result').innerText = `Public Creation: ${enabled}`;
        }
        
        window.togglePublic = async () => {
            const tx = await contract.togglePublicCreation();
            document.getElementById('result').innerText = `Transaction: ${tx.hash}`;
            await tx.wait();
            document.getElementById('result').innerText = `✅ Public creation toggled!`;
        }
    </script>
</body>
</html>
```

Save this as `contract-interface.html` and open in browser!

## Option 5: Tenderly Dashboard

1. Go to https://dashboard.tenderly.co/
2. Add Base network
3. Import contract: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
4. Full debugging and interaction interface

## Option 6: Direct from Frontend Console

While your dApp is running, open browser console:

```javascript
// Get contract instance
const contract = await window.ethereum.request({method: 'eth_requestAccounts'})
  .then(() => new ethers.Contract(
    "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97",
    ["function nextOpinionId() view returns (uint256)"],
    new ethers.providers.Web3Provider(window.ethereum).getSigner()
  ));

// Call functions
await contract.nextOpinionId()
```

## Most BaseScan-Like Experience:

**Louper.dev** is your best bet - it's specifically designed for this and will give you the familiar Read/Write Contract interface you want!