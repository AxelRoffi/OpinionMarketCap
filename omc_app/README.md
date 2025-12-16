# OpinionMarketCap

A decentralized prediction market platform on Base blockchain where users can create questions, submit answers, and trade ownership.

## 🏗 Repository Structure

```
OpinionMarketCap/
├── /apps/
│   ├── /web/         # Main dApp (app.opinionmarketcap.xyz)
│   └── /landing/     # Marketing site (opinionmarketcap.xyz)
├── /contracts/       # Smart contracts
│   ├── /src/        # Contract source code
│   ├── /test/       # Contract tests
│   └── /scripts/    # Deployment scripts
└── /docs/           # Developer documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/AxelRoffi/OpinionMarketCap.git
cd OpinionMarketCap

# Install dependencies
npm install
```

### Development
```bash
# Run all apps in development
npm run dev

# Run specific app
npm run dev:web      # Main dApp
npm run dev:landing  # Landing page
```

### Building
```bash
# Build all apps
npm run build

# Build specific app
npm run build:web
npm run build:landing
```

## 🔗 Live Sites

- **Main App**: [app.opinionmarketcap.xyz](https://app.opinionmarketcap.xyz)
- **Landing**: [opinionmarketcap.xyz](https://opinionmarketcap.xyz)
- **Testnet**: [test.opinionmarketcap.xyz](https://test.opinionmarketcap.xyz)

## 📚 Documentation

- **Technical Docs**: [GitBook](https://docs.opinionmarketcap.xyz)
- **Blog**: [Hashnode](https://blog.opinionmarketcap.xyz)

## 📜 Smart Contracts

### Mainnet (Base)
- **OpinionCore**: `0xC47bFEc4D53C51bF590beCEA7dC935116E210E97`
- **FeeManager**: `0x64997bd18520d93e7f0da87c69582d06b7f265d5`
- **PoolManager**: `0xd6f4125e1976c5eee6fc684bdb68d1719ac34259`

### Contract Development
```bash
# Compile contracts
npm run compile

# Run tests
npm run test:contracts

# Deploy
cd contracts && npx hardhat run scripts/deploy-mainnet.js --network base
```

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Web3**: Wagmi, RainbowKit, Ethers.js
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Blockchain**: Base (Ethereum L2)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔐 Security

For security concerns, please email security@opinionmarketcap.xyz

---

Built with ❤️ by the OpinionMarketCap team