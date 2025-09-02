# OpinionMarketCap Frontend

A modern, responsive trading interface for the OpinionMarketCap prediction market platform. Built with Next.js, wagmi, and RainbowKit for seamless Web3 integration.

## Features

- **Real-time Trading Table**: Live opinion data with sortable columns
- **Smart Contract Integration**: Direct interaction with deployed Base Sepolia contracts  
- **Wallet Connection**: Seamless wallet integration with RainbowKit
- **Opinion Creation**: User-friendly form for creating new opinions
- **Answer Trading**: Buy answer ownership with automatic price calculations
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Updates**: Automatic refresh from blockchain events

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Blockchain**: wagmi, viem, RainbowKit
- **Styling**: Tailwind CSS with custom components
- **TypeScript**: Full type safety
- **State Management**: React hooks with real-time blockchain data

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your WalletConnect Project ID
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Contract Integration

The app connects to your deployed contracts on Base Sepolia:

- **OpinionCore**: `0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc`
- **Mock USDC**: `0xAb462fb7F8c952C63b62EF4371A60020e2abcA95` 
- **PriceCalculator**: `0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113`

## Key Components

### TradingTable
- Real-time opinion data display
- Sortable columns (price, volume, change)
- Buy answer functionality
- Mobile responsive design

### CreateOpinionModal  
- Form validation with real-time fee calculation
- Category selection from contract
- Optional IPFS and link support
- Transaction flow with progress tracking

### BuyAnswerModal
- Submit new answers to existing opinions
- Automatic USDC approval and transaction flow
- Real-time price display

## Fee Model Integration

The interface correctly implements your new fee model:
- **Price Range**: 1-100 USDC (updated from 2-100)
- **Creation Fee**: 20% of initial price (minimum 5 USDC)
- **User Payment**: Only creation fee (not full initial price)

## API Routes

- `GET /api/opinions` - Fetch all active opinions
- `GET /api/opinion/[id]` - Get specific opinion details  
- `GET /api/opinion/[id]/history` - Get answer history

## Development

### Project Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes for contract interaction
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Main trading page
│   └── providers.tsx     # Web3 providers setup
├── components/           # React components
│   ├── TradingTable.tsx  # Main trading interface
│   ├── BuyAnswerModal.tsx # Answer submission modal
│   ├── CreateOpinionModal.tsx # Opinion creation modal
│   └── Header.tsx        # Navigation header
└── lib/                  # Utilities and configuration
    ├── contracts.ts      # Contract addresses and ABIs
    ├── wagmi.ts         # wagmi configuration
    ├── types.ts         # TypeScript interfaces
    └── utils.ts         # Helper functions
```

### Key Features Implementation

1. **Real-time Updates**: Uses `useBlockNumber` hook to trigger data refresh
2. **Price Calculations**: Implements your 20% fee model with 5 USDC minimum
3. **Error Handling**: Comprehensive error states and user feedback
4. **Mobile First**: Responsive design that works on all devices
5. **Transaction Flow**: Multi-step transactions with progress indicators

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (recommended):
   ```bash
   npx vercel
   ```

3. **Environment Variables**: Set up the same environment variables in your deployment platform

## Configuration

### WalletConnect Setup
1. Get a Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Add it to your `.env.local` file
3. Configure allowed domains in WalletConnect dashboard

### Contract Updates
If you redeploy contracts, update the addresses in:
- `lib/contracts.ts`
- `.env.local`

## User Experience

### Trading Flow
1. **Connect Wallet** → RainbowKit modal
2. **Browse Opinions** → Sortable trading table
3. **Buy Answer** → Modal with price calculation and transaction flow  
4. **Create Opinion** → Form with fee preview and category selection

### Mobile Experience  
- Collapsible mobile menu
- Touch-friendly buttons
- Optimized table layouts
- Swipe gestures support

The interface provides a professional trading experience that makes opinion ownership feel valuable and accessible to all users.