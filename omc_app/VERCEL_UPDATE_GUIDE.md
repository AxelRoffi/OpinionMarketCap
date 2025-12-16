# Vercel Deployment Update Guide

## 🚨 Important: Repository Structure Has Changed!

The repository has been reorganized. You need to update your Vercel projects to reflect the new structure.

## 📋 Step-by-Step Vercel Updates

### 1️⃣ Update dApp Project (test.opinionmarketcap.xyz)

1. **Go to Vercel Dashboard**
   - Navigate to your dApp project
   
2. **Update Root Directory**
   ```
   Settings → General → Root Directory
   Change from: frontend
   Change to: apps/web
   ```

3. **Add Production Domain**
   ```
   Settings → Domains → Add Domain
   Domain: app.opinionmarketcap.xyz
   ```

4. **Update Environment Variables**
   ```
   Settings → Environment Variables
   
   Add/Update for Production:
   NEXT_PUBLIC_ENVIRONMENT=mainnet
   NEXT_PUBLIC_CHAIN_ID=8453
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=d6c2fada7d8b7f5a4cefb2e8d4a1b7e9
   ```

### 2️⃣ Update Landing Project (opinionmarketcap.xyz)

1. **Go to Vercel Dashboard**
   - Navigate to your landing project
   
2. **Update Root Directory**
   ```
   Settings → General → Root Directory
   Change from: landing
   Change to: apps/landing
   ```

### 3️⃣ Redeploy Both Projects

After updating the root directories:

1. **Trigger New Deployments**
   ```
   Each project → Deployments → Redeploy
   ```

2. **Wait for builds to complete**

### 4️⃣ DNS Configuration

For app.opinionmarketcap.xyz, add this DNS record:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

## ✅ Verification Checklist

After deployment:

- [ ] test.opinionmarketcap.xyz still works
- [ ] app.opinionmarketcap.xyz shows mainnet
- [ ] opinionmarketcap.xyz shows landing page
- [ ] Wallet connection works on app subdomain
- [ ] Environment shows "Base Mainnet" not testnet

## 🔧 Troubleshooting

If builds fail:

1. **Check Build Command**
   - Should be: `npm run build` or `next build`
   - Install command: `npm install`

2. **Framework Preset**
   - Should auto-detect as Next.js
   - If not, manually select Next.js

3. **Node Version**
   - Ensure Node 18+ is selected

## 📝 Notes

- The new structure uses Turborepo for monorepo management
- Each app is now in the `/apps` directory
- Shared code can go in `/packages` (future enhancement)
- Smart contracts are cleaned up in `/contracts`
- The `/docs` directory contains documentation (preserved from original repo)

## 🚀 After Successful Update

1. Merge the reorganization PR:
   ```bash
   git checkout main
   git merge refactor/repo-cleanup
   git push origin main
   ```

2. Delete the old branch:
   ```bash
   git branch -d refactor/repo-cleanup
   git push origin --delete refactor/repo-cleanup
   ```

---

Need help? Check the deployment logs in Vercel Dashboard.

---
*Updated: 2025-12-16*