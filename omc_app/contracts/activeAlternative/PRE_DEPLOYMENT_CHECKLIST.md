# 📋 Pre-Deployment Checklist - OpinionMarketCap Modular

## ✅ Commit Status
**Latest Commit**: `2efa757` - Creation fee updated to 2 USDC minimum ✅  
**GitHub Status**: All changes pushed ✅

---

## 🏗️ Configuration Requise

### 1. Adresses Critiques à Définir

#### **Admin Address** 
```
✅ CONFIGURED: 0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3
```

#### **Treasury Address**
```
✅ CONFIGURED: 0x644541778b26D101b6E6516B7796768631217b68
```

#### **USDC Token** (Base Mainnet)
```
Fixed: 0x036CbD53842c5426634e7929541eC2318f3dCF7e ✅
```

### 2. Safe Wallet - Recommandations

#### **🔒 Pour Admin: Safe Wallet FORTEMENT RECOMMANDÉ**
**Pourquoi ?**
- ✅ **Sécurité multi-sig**: Protection contre erreurs/hacks
- ✅ **Fonctions critiques**: Pause, emergency withdraw, treasury changes
- ✅ **Upgrades**: Contrats upgradeables nécessitent sécurité max
- ✅ **Funds management**: Treasury recevra des fees importantes

#### **💰 Pour Treasury: Safe Wallet OBLIGATOIRE**
**Pourquoi ?**
- ✅ **Volume élevé**: Recevra tous les fees platform (2%) + création
- ✅ **Attaque vector**: Cible attractive pour hackers
- ✅ **Emergency funds**: Fonction emergency withdraw

#### **⚡ Alternative Simplifiée (Non Recommandée)**
Si vous voulez éviter Safe Wallet:
- Utiliser un wallet hardware (Ledger/Trezor) minimum
- Séparer Admin et Treasury sur 2 wallets différents
- Prévoir migration vers Safe plus tard

---

## 📄 Fichiers de Configuration

### 1. Modifier le Script de Déploiement

**Fichier**: `deploy/DeployModularContracts.js`

```javascript
// MODIFICATION REQUISE - Ligne 13-15
const USDC_TOKEN = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // ✅ OK
const TREASURY = "VOTRE_ADRESSE_TREASURY";    // ❓ À MODIFIER
const ADMIN = "VOTRE_ADRESSE_ADMIN";          // ❓ À MODIFIER
```

### 2. Configuration Réseau Hardhat

**Fichier**: `hardhat.config.js`
```javascript
networks: {
  base: {
    url: "https://mainnet.base.org",
    accounts: ["VOTRE_PRIVATE_KEY"], // ❓ À CONFIGURER
    gasPrice: "auto",
    gas: "auto"
  }
}
```

---

## 💰 Estimation Coûts de Déploiement

### Gas Estimé par Contrat
| Contrat | Gas Estimé | Coût ETH (20 gwei) |
|---------|-----------|-------------------|
| FeeManager | ~2.5M gas | ~0.05 ETH |
| PoolManager | ~3.2M gas | ~0.064 ETH |
| OpinionAdmin | ~1.8M gas | ~0.036 ETH |
| OpinionExtensions | ~2.1M gas | ~0.042 ETH |
| OpinionCore | ~2.8M gas | ~0.056 ETH |
| **TOTAL** | **~12.4M gas** | **~0.248 ETH** |

**💡 Recommandation**: Avoir 0.5 ETH sur Base pour le déploiement

---

## 🔐 Configuration Sécurité

### 1. Roles et Permissions

#### **Admin Role** (Adresse Admin)
- ✅ Modifier paramètres contrats (fees, limites, etc.)
- ✅ Pause/unpause system
- ✅ Emergency withdraw
- ✅ Upgrade contrats
- ✅ Gestion treasury (avec timelock 48h)

#### **Treasury Role** (Peut être même que Admin)
- ✅ Confirmer changements treasury après 48h
- ✅ Withdrawal fees accumulées

### 2. Paramètres Timelocks

```javascript
TREASURY_CHANGE_DELAY = 48 hours  // ✅ Sécurité treasury
parameterUpdateCooldown = 1 days  // ✅ Limite changements fees
```

---

## 🧪 Tests Pre-Déploiement

### 1. Tests Locaux Obligatoires

```bash
# Test compilation contrats
npx hardhat compile

# Test tailles contrats  
npx hardhat run contracts/activeAlternative/test/ContractSizeTest.sol

# Test linking contrats
npx hardhat run contracts/activeAlternative/test/OpinionContractsLinking.test.sol
```

### 2. Test Sepolia (Optionnel mais Recommandé)

```bash
# Déploiement test sur Base Sepolia
npx hardhat run deploy/DeployModularContracts.js --network baseSepolia

# Vérification interactions
# Frontend test avec contrats Sepolia
```

---

## 📋 Checklist Final Avant Déploiement

### Configuration
- [ ] **Admin address** définie et confirmée
- [ ] **Treasury address** définie (Safe Wallet recommandé)
- [ ] **Private key** configurée dans hardhat.config.js
- [ ] **Balance ETH** suffisant pour déploiement (0.5 ETH+)

### Sécurité
- [ ] **Safe Wallet** configuré pour Admin (fortement recommandé)
- [ ] **Safe Wallet** configuré pour Treasury (obligatoire)
- [ ] **Backup** des clés privées/phrases seed
- [ ] **Test** fonctions admin sur Sepolia (optionnel)

### Technique
- [ ] **Compilation** réussie sans erreurs
- [ ] **Tests** de tailles contrats passent
- [ ] **Tests** de linking passent
- [ ] **Script** de déploiement modifié avec bonnes adresses

### Post-Déploiement
- [ ] **Vérification** contrats sur BaseScan
- [ ] **Test** création opinion + answer
- [ ] **Test** fonction admin (pause/unpause)
- [ ] **Backup** addresses déployées
- [ ] **Update** frontend avec nouvelles adresses

---

## 🚀 Commande de Déploiement

```bash
# Déploiement Base Mainnet
npx hardhat run contracts/activeAlternative/deploy/DeployModularContracts.js --network base

# Vérification contrats
npx hardhat verify --network base DEPLOYED_ADDRESS

# Backup addresses
cp deployments/modular-opinion-deployment.json ./BACKUP_DEPLOYMENT_$(date +%Y%m%d).json
```

---

## 🆘 Plan d'Urgence

### En Cas de Problème
1. **Pause immédiate**: Function `pause()` via Admin
2. **Emergency withdraw**: Récupération funds si nécessaire
3. **Rollback**: Déployer nouvelle version avec fix
4. **Communication**: Informer communauté si impact users

### Contacts d'Urgence
- **Admin wallet**: [VOTRE_CONTACT]
- **Treasury wallet**: [VOTRE_CONTACT] 
- **Tech support**: Claude Code session backup

---

## ❓ Questions à Résoudre

1. **Admin Address**: Quelle adresse utiliser ? Safe Wallet ou EOA ?
2. **Treasury Address**: Changer l'actuelle ou la garder ?
3. **Safe Wallet**: Voulez-vous configurer Safe ou rester simple ?
4. **Test Sepolia**: Déployer d'abord sur testnet ou direct mainnet ?
5. **Monitoring**: Voulez-vous configurer des alerts post-déploiement ?

**⏰ Prêt pour déploiement dès que ces éléments sont clarifiés !**