# OpinionMarketCap Deployment Guide

## 🚀 Quick Start

### Local Development

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Run the startup script**:
   ```bash
   ./start.sh
   ```
   
   Or manually:
   ```bash
   npm install
   npm run dev
   ```

3. **Open** [http://localhost:3000](http://localhost:3000)

### Environment Setup

1. **Get WalletConnect Project ID**:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID

2. **Update .env.local**:
   ```bash
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   ```

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add OpinionMarketCap frontend"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repo to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**:
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_OPINION_CORE_ADDRESS=0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc
   NEXT_PUBLIC_MOCK_USDC_ADDRESS=0xAb462fb7F8c952C63b62EF4371A60020e2abcA95
   NEXT_PUBLIC_PRICE_CALCULATOR_ADDRESS=0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113
   ```

### Option 2: Netlify

1. **Build the application**:
   ```bash
   npm run build
   npm run export  # for static export
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repo

### Option 3: Custom Server

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## 📱 Testing on Mobile

### Using ngrok (for local testing)

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Expose local server**:
   ```bash
   ngrok http 3000
   ```

3. **Test on mobile** using the ngrok URL

## 🔗 Contract Updates

If you redeploy your smart contracts:

1. **Update contract addresses** in:
   - `lib/contracts.ts`
   - `.env.local`
   - Deployment environment variables

2. **Update ABIs** if contract interfaces change:
   - `lib/contracts.ts`

## 🐛 Troubleshooting

### Common Issues

1. **Wallet connection fails**:
   - Check WalletConnect Project ID
   - Ensure you're on Base Sepolia network
   - Clear browser cache

2. **Contract calls fail**:
   - Verify contract addresses
   - Check network (Base Sepolia)
   - Ensure sufficient gas/ETH

3. **API routes don't work**:
   - Check Next.js API routes are enabled
   - Verify contract addresses in environment

### Development Issues

1. **Module not found errors**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript errors**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

3. **Build failures**:
   - Check all environment variables are set
   - Ensure all imports are correct
   - Verify no circular dependencies

## 📊 Performance Optimization

### For Production

1. **Enable compression** in your hosting platform
2. **Set up CDN** for static assets
3. **Configure caching** headers
4. **Monitor bundle size** with `npm run build`

### Code Splitting

The app already uses Next.js automatic code splitting:
- Components are loaded on demand
- API routes are separate from client code
- Wagmi hooks are optimized for performance

## 🔐 Security Considerations

1. **Environment Variables**:
   - Never commit `.env.local` to git
   - Use different WalletConnect projects for dev/prod
   - Validate all user inputs

2. **Smart Contract Interactions**:
   - Always validate transaction parameters
   - Handle contract errors gracefully
   - Use proper gas estimation

3. **User Data**:
   - No sensitive data is stored locally
   - All blockchain interactions are transparent
   - Use HTTPS in production

## 📈 Monitoring

### Analytics Setup

1. **Add Google Analytics** (optional):
   ```javascript
   // In app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   ```

2. **Error Monitoring** with Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

### Performance Monitoring

- Use Vercel Analytics for performance insights
- Monitor API response times
- Track wallet connection success rates

## 🔄 Updates and Maintenance

### Regular Updates

1. **Dependencies**:
   ```bash
   npm audit
   npm update
   ```

2. **Wagmi/RainbowKit**:
   - Follow upgrade guides for major versions
   - Test wallet connections after updates

3. **Contract Interactions**:
   - Test all trading flows after updates
   - Verify fee calculations remain accurate

Your OpinionMarketCap frontend is now ready for production deployment! 🎉