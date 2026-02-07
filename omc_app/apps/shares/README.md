# Opinion Shares

Trade opinions like memecoins. A bonding curve-based opinion trading platform.

## Overview

This is the new "Answer Shares" model for OpinionMarketCap. Instead of the "hot potato" model where one answer exists at a time, this model allows:

- **Multiple answers** can exist simultaneously
- **Buy/sell shares** in any answer (bonding curve pricing)
- **Exit anytime** - sell to the pool, no need to find a buyer
- **Leading answer** = highest market cap

## Quick Start

```bash
# Install dependencies
cd apps/shares
npm install

# Run development server
npm run dev
# Opens on http://localhost:3003
```

## Structure

```
apps/shares/
├── contracts/
│   └── AnswerSharesCore.sol    # Main trading contract
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage with trading UI
│   │   ├── providers.tsx       # Wagmi/RainbowKit providers
│   │   └── globals.css         # Tailwind styles
│   ├── components/             # UI components (TODO)
│   ├── hooks/                  # React hooks (TODO)
│   └── lib/
│       ├── contracts.ts        # Contract addresses
│       ├── utils.ts            # Helper functions
│       └── wagmi.ts            # Wallet config
└── public/                     # Static assets
```

## Smart Contract

### AnswerSharesCore.sol

Main functions:
- `createQuestion(text, description)` - Create a new question ($2 fee)
- `proposeAnswer(questionId, text)` - Propose an answer ($5 stake → first shares)
- `buyShares(answerId, amount, minSharesOut)` - Buy shares (2% fee)
- `sellShares(answerId, shares, minUsdcOut)` - Sell shares (3% fee)

### Pricing

Simple bonding curve:
```
price = poolValue / totalShares
```

When you buy:
- USDC goes into pool
- New shares are minted
- Price goes up

When you sell:
- Shares are burned
- USDC comes from pool
- Price goes down

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| Question creation fee | $2 | Cost to create a question |
| Answer proposal stake | $5 | Stake to propose (becomes shares) |
| Buy fee | 2% | Fee on purchases |
| Sell fee | 3% | Fee on sales |
| Max answers | 10 | Max answers per question |

## TODO

### Contracts
- [ ] Deploy to Base Sepolia
- [ ] Write unit tests
- [ ] Deploy to Base Mainnet
- [ ] Verify on Basescan

### Frontend
- [ ] Connect to contract (hooks)
- [ ] Buy/Sell modals
- [ ] Create question modal
- [ ] Propose answer modal
- [ ] Portfolio page
- [ ] User positions display
- [ ] Price charts

## Comparison with Hot Potato

| Feature | Hot Potato (web/) | Answer Shares (shares/) |
|---------|------------------|------------------------|
| Answers per question | 1 | Multiple |
| Exit strategy | Need next buyer | Sell to pool |
| Max loss | 100% | Partial |
| Pricing | Market regimes | Bonding curve |
| Complexity | Simple | Medium |

## Development

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Run production
npm start
```

## License

MIT
