# OpinionMarketCap: Market Model Comparison & Smart Contract Analysis

## Executive Summary

This document compares the current **Hot Potato** model with a proposed **Answer Shares** model, analyzes smart contract implications, and provides recommendations for implementation.

---

## Table of Contents

1. [Model Comparison](#1-model-comparison)
2. [Adoption & Revenue Analysis](#2-adoption--revenue-analysis)
3. [Current Contract Architecture](#3-current-contract-architecture)
4. [Proposed Contract Changes](#4-proposed-contract-changes)
5. [Migration Strategy](#5-migration-strategy)
6. [Implementation Recommendations](#6-implementation-recommendations)
7. [Security Analysis & Attack Vectors](#7-security-analysis--attack-vectors)
8. [Built-in Protections](#8-built-in-protections)

---

## 1. Model Comparison

### 1.1 Hot Potato (Current Model)

**Core Mechanics:**
- One answer exists at a time per question
- User pays current price to replace the answer with their own
- Previous holder receives the payment (minus fees)
- Price adjusts based on market regime (-20% to +80%)
- No resolution - questions stay open indefinitely

**Example Flow:**
```
Question: "Best L2 for DeFi?"

1. Alice pays $10 → Answer: "Base" → Price becomes $13
2. Bob pays $13 → Answer: "Arbitrum" → Alice receives $12.35 (profit $2.35)
3. Carol pays $13 → Answer: "Base" → Bob receives $12.35
4. Dave pays $11 → Answer: "Optimism" → Carol receives $10.45 (LOSS $2.55)
5. Nobody buys after Dave → Dave holds the bag (potential total loss)
```

**Money Flow:**
```
Alice ($10) → Bob ($13) → Carol ($13) → Dave ($11) → ???
                                                    ↓
                                              Dave stuck (bag holder)
```

**Characteristics:**
| Aspect | Description |
|--------|-------------|
| Liquidity | None - need next buyer |
| Exit strategy | Find greater fool |
| Risk profile | High (can lose 100%) |
| Answer creation | Anyone, by paying current price |
| Resolution | Never |
| Winner determination | Current holder |

---

### 1.2 Answer Shares (Proposed Model)

**Core Mechanics:**
- Multiple answers can exist simultaneously per question
- Each answer has its own liquidity pool (bonding curve)
- Users buy/sell shares of answers they believe in
- Price adjusts based on supply/demand (bonding curve math)
- Can exit anytime by selling to the pool
- "Winning" answer = highest market cap

**Example Flow:**
```
Question: "Best L2 for DeFi?"

1. Alice proposes "Base" with $10 stake → Gets 10 shares @ $1.00
2. Bob proposes "Arbitrum" with $10 stake → Gets 10 shares @ $1.00
3. Carol buys 20 shares of "Base" for $25 → Base price rises to $1.40
4. Dave buys 15 shares of "Arbitrum" for $20 → Arbitrum price rises to $1.30
5. Alice sells her 10 shares of "Base" → Gets $14 from pool (profit $4)

Current state:
- Base: 20 shares, $1.40/share, Market Cap: $28 ← LEADING
- Arbitrum: 25 shares, $1.30/share, Market Cap: $32.50 ← Actually leading!
```

**Money Flow:**
```
        ┌──→ Alice buys $10 ──┐
        │                     │
        ├──→ Carol buys $25 ──┼──→ POOL ($35)
        │                     │
        └──→ Alice sells ◄────┘ Gets $14 from pool

Pool is the counterparty, not individual users.
```

**Characteristics:**
| Aspect | Description |
|--------|-------------|
| Liquidity | Always (pool is counterparty) |
| Exit strategy | Sell to pool anytime |
| Risk profile | Medium (partial losses, not 100%) |
| Answer creation | Anyone, with stake (becomes first shares) |
| Resolution | Never (opinions are subjective) |
| Winner determination | Highest market cap |

---

### 1.3 Side-by-Side Comparison

| Feature | Hot Potato | Answer Shares |
|---------|-----------|---------------|
| **Answers per question** | 1 at a time | Multiple simultaneous |
| **Can exit anytime?** | No (need buyer) | Yes (sell to pool) |
| **Maximum loss** | 100% | ~30-50% typically |
| **Entry barrier** | Current price ($1-$100+) | Any amount ($1+) |
| **Profit source** | Next buyer directly | Pool growth |
| **Feels like** | Musical chairs | Stock market |
| **User psychology** | "Will I get rugged?" | "Will this answer gain popularity?" |
| **Complexity** | Simple | Medium |
| **Excitement** | High (all-or-nothing) | Medium (gradual) |
| **Retention** | Low (losers leave) | Higher (losses manageable) |

---

### 1.4 Resolution & Money Flow

#### Why No Resolution?

Both models have **no resolution** because:
- Opinions are **subjective** ("Best L2" has no objective answer)
- No oracle can determine "truth" for opinions
- Unlike prediction markets ("Will ETH hit $5k?"), there's no verifiable outcome

#### Money Flow Comparison

**Hot Potato - Zero Sum (Direct):**
```
Every dollar won = dollar lost by specific next person
Winner: Those who sell before price drops
Loser: Last holder (bag holder) - loses everything
```

**Answer Shares - Zero Sum (Distributed):**
```
Every dollar won = dollars lost by multiple late buyers (spread out)
Winner: Early buyers who sell after pool grows
Loser: Late buyers if answer loses popularity (partial losses)
```

**Key Insight:** Same total money movement, but Answer Shares **distributes losses** across many users instead of concentrating on one bag holder.

---

## 2. Adoption & Revenue Analysis

### 2.1 Adoption Metrics

| Metric | Hot Potato | Answer Shares | Winner |
|--------|-----------|---------------|--------|
| Understandability | ⭐⭐ | ⭐⭐⭐⭐⭐ | Answer Shares |
| Low entry barrier | ⭐⭐ | ⭐⭐⭐⭐⭐ | Answer Shares |
| Low risk perception | ⭐ | ⭐⭐⭐⭐ | Answer Shares |
| User retention | ⭐⭐ | ⭐⭐⭐⭐ | Answer Shares |
| Viral/excitement | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Hot Potato |
| **Total** | **12/25** | **21/25** | **Answer Shares** |

### 2.2 Fee Structure Comparison

**Hot Potato (Current):**
```
Per trade:
├── Platform fee: 2%
├── Creator fee: 3%
└── Total: 5%
```

**Answer Shares (Proposed):**
```
Buy (entry):
├── Platform fee: 1%
├── Creator fee: 1%
└── Total: 2%

Sell (exit):
├── Platform fee: 1.5%
├── Creator fee: 1.5%
└── Total: 3%

Answer creation: $5 USDC (split platform/question creator)
Question creation: $2 USDC (same as current)

Round-trip total: 5% (same as Hot Potato)
```

### 2.3 Revenue Projection

**Scenario: 1,000 users try the platform**

| Metric | Hot Potato | Answer Shares |
|--------|-----------|---------------|
| Retention rate | 20% (losers leave) | 60% (losses manageable) |
| Active users | 200 | 600 |
| Trades per user | 5 | 15 |
| Total trades | 1,000 | 9,000 |
| Avg trade size | $20 | $10 |
| Total volume | $20,000 | $90,000 |
| Platform revenue (1-1.5%) | $400 | $2,250 |

**Answer Shares generates ~5.6x more revenue** due to higher retention and trade frequency.

---

## 3. Current Contract Architecture

### 3.1 Deployed Contracts (Base Mainnet)

| Contract | Purpose | Size | Proxy Address |
|----------|---------|------|---------------|
| **ValidationLibrary** | Input validation | 0.02 KB | `0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5` |
| **FeeManager** | Fee collection & distribution | 10.5 KB | `0x31D604765CD76Ff098A283881B2ca57e7F703199` |
| **PoolManager** | Collective funding pools | 18.1 KB | `0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e` |
| **OpinionAdmin** | Admin functions | 9.6 KB | `0x4F0A1938E8707292059595275F9BBD067A301FD2` |
| **OpinionExtensions** | Categories, extensions | 13.2 KB | `0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA` |
| **OpinionCore** | Core trading (Hot Potato) | 19.0 KB | `0x7b5d97fb78fbf41432F34f46a901C6da7754A726` |

### 3.2 Current PoolManager Purpose

The **existing PoolManager** is for **collective funding**, NOT bonding curve pools:

```solidity
// Current: Users pool money together to afford expensive answer changes
function createPool(
    uint256 opinionId,
    string calldata proposedAnswer,  // The answer they want to set
    uint256 deadline,
    uint256 initialContribution,
    ...
)

// When pool reaches target (NextPrice), it executes the answer change
// All contributors share ownership proportionally
```

**This is a DIFFERENT concept** from Answer Shares bonding curve pools.

### 3.3 What Each Contract Does

```
┌─────────────────────────────────────────────────────────────────┐
│                        OpinionCore (V3)                         │
│  - Create questions                                             │
│  - Submit answers (Hot Potato logic)                            │
│  - Dynamic pricing (PriceCalculator library)                    │
│  - Transfer ownership                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   FeeManager    │ │   PoolManager   │ │ OpinionExtensions│
│                 │ │                 │ │                 │
│ - Collect fees  │ │ - Collective    │ │ - Categories    │
│ - Creator fees  │ │   funding pools │ │ - Validation    │
│ - Platform fees │ │ - Pool rewards  │ │ - Future slots  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 4. Proposed Contract Changes

### 4.1 Option A: Upgrade Existing Contracts (NOT Recommended)

**Challenges:**
- OpinionCore's data structures are designed for single-answer model
- Would require massive storage layout changes
- High risk of breaking existing data
- Complex migration of existing positions

**Verdict:** Too risky for production contracts with real money.

### 4.2 Option B: New Contract Set (Recommended)

Deploy a **parallel contract system** for Answer Shares:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: AnswerSharesCore                        │
│  - Create questions (multi-answer)                              │
│  - Propose answers (with stake)                                 │
│  - Buy/sell shares (bonding curve)                              │
│  - Track market caps                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   FeeManager    │ │  NEW: Bonding   │ │ OpinionExtensions│
│   (REUSE)       │ │  CurveManager   │ │   (REUSE)       │
│                 │ │                 │ │                 │
│ - Same fee logic│ │ - Price calc    │ │ - Categories    │
│ - Add new role  │ │ - Pool math     │ │ - Validation    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 4.3 New Contracts Needed

#### 1. AnswerSharesCore (~20 KB)

**Purpose:** Main trading contract for Answer Shares model

```solidity
// Key data structures
struct Question {
    uint256 id;
    string text;
    address creator;
    uint256 createdAt;
    string[] categories;
    bool isActive;
}

struct Answer {
    uint256 id;
    uint256 questionId;
    string text;
    address proposer;
    uint256 totalShares;
    uint256 poolValue;      // USDC in the pool
    uint256 createdAt;
}

struct SharePosition {
    uint256 shares;
    uint256 avgBuyPrice;    // For P&L tracking
}

// Key mappings
mapping(uint256 => Question) public questions;
mapping(uint256 => Answer) public answers;
mapping(uint256 => uint256[]) public questionAnswers;  // questionId => answerIds
mapping(uint256 => mapping(address => SharePosition)) public positions;  // answerId => user => position

// Key functions
function createQuestion(string calldata text, string[] calldata categories) external;
function proposeAnswer(uint256 questionId, string calldata answerText) external payable;
function buyShares(uint256 answerId, uint256 usdcAmount) external;
function sellShares(uint256 answerId, uint256 shareAmount) external;
function getLeadingAnswer(uint256 questionId) external view returns (uint256 answerId);
function getSharePrice(uint256 answerId) external view returns (uint256);
```

#### 2. BondingCurveManager (~8 KB)

**Purpose:** Price calculation for bonding curves

```solidity
// Simple linear bonding curve: price = basePrice + (slope * supply)
// Or: price = poolValue / totalShares (constant product style)

function calculateBuyPrice(
    uint256 currentSupply,
    uint256 poolValue,
    uint256 sharesToBuy
) external pure returns (uint256 cost);

function calculateSellReturn(
    uint256 currentSupply,
    uint256 poolValue,
    uint256 sharesToSell
) external pure returns (uint256 returnAmount);

function calculateNewPrice(
    uint256 newSupply,
    uint256 newPoolValue
) external pure returns (uint256 price);
```

### 4.4 Contracts to Reuse

| Contract | Changes Needed |
|----------|----------------|
| **FeeManager** | Add `ANSWER_SHARES_ROLE` for new core contract |
| **OpinionExtensions** | No changes (categories work the same) |
| **ValidationLibrary** | Minor additions for new validations |
| **OpinionAdmin** | Add functions for new contract admin |

### 4.5 Contracts No Longer Needed

| Contract | Status | Reason |
|----------|--------|--------|
| **PoolManager** | **DEPRECATED** for Answer Shares | Collective funding not needed when anyone can buy shares at any price |
| **PriceCalculator** | **DEPRECATED** for Answer Shares | Market regimes replaced by bonding curve math |

**Note:** Keep PoolManager deployed for existing Hot Potato mode if running both models.

---

## 5. Migration Strategy

### 5.1 Recommended Approach: Parallel Deployment

```
Phase 1: Deploy Answer Shares contracts alongside existing
Phase 2: Frontend supports both modes
Phase 3: New questions default to Answer Shares
Phase 4: Eventually deprecate Hot Potato (optional)
```

### 5.2 Contract Deployment Order

```
1. Deploy BondingCurveManager (library)
2. Deploy AnswerSharesCore (with library linking)
3. Grant CORE_CONTRACT_ROLE to AnswerSharesCore on FeeManager
4. Link AnswerSharesCore to OpinionExtensions (for categories)
5. Configure parameters (fees, limits)
6. Test on testnet
7. Deploy to mainnet
```

### 5.3 Frontend Changes

```
Create Question Modal:
┌─────────────────────────────────────────┐
│ Question Type:                          │
│ ○ Classic (Hot Potato)                  │
│   One answer, winner takes all          │
│                                         │
│ ● Market (Answer Shares) [Recommended]  │
│   Trade shares in multiple answers      │
└─────────────────────────────────────────┘
```

---

## 6. Implementation Recommendations

### 6.1 Summary: What to Build

| Item | Action | Effort |
|------|--------|--------|
| AnswerSharesCore | **NEW CONTRACT** | High |
| BondingCurveManager | **NEW LIBRARY** | Medium |
| FeeManager | Add role, minor update | Low |
| OpinionExtensions | No changes | None |
| ValidationLibrary | Minor additions | Low |
| PoolManager | Keep for Hot Potato, not used in Answer Shares | None |
| PriceCalculator | Keep for Hot Potato, not used in Answer Shares | None |
| OpinionCore | Keep for Hot Potato | None |

### 6.2 Recommended Bonding Curve

**Simple Linear Curve:**
```
Price = BasePrice + (Slope × TotalSupply)

Example with BasePrice = $1, Slope = $0.01:
- 0 shares: $1.00
- 100 shares: $2.00
- 500 shares: $6.00
- 1000 shares: $11.00
```

**Or Constant Product (AMM-style):**
```
Price = PoolValue / TotalShares

Example:
- Pool: $100, Shares: 100 → Price: $1.00
- Pool: $200, Shares: 150 → Price: $1.33
- Pool: $500, Shares: 200 → Price: $2.50
```

**Recommendation:** Start with Constant Product - simpler and users understand AMMs.

### 6.3 Key Parameters

| Parameter | Suggested Value | Notes |
|-----------|-----------------|-------|
| Question creation fee | $2 USDC | Same as current |
| Answer proposal stake | $5-10 USDC | Becomes first shares |
| Buy fee | 2% (1% platform, 1% creator) | Lower to encourage entry |
| Sell fee | 3% (1.5% platform, 1.5% creator) | Higher to discourage churn |
| Minimum share purchase | $1 USDC | Low barrier |
| Base share price | $1.00 | Starting price for new answers |

### 6.4 Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| Design | Finalize specs, data structures | 1 week |
| Development | Write AnswerSharesCore + BondingCurveManager | 2-3 weeks |
| Testing | Unit tests, integration tests | 1-2 weeks |
| Audit | Security review | 2-4 weeks |
| Testnet | Deploy and test on Base Sepolia | 1 week |
| Mainnet | Deploy to Base Mainnet | 1 day |

**Total: 7-11 weeks** for production-ready Answer Shares

---

## Appendix A: Answer Shares Core Contract Skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AnswerSharesCore is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // === STRUCTS ===

    struct Question {
        uint256 id;
        string text;
        string description;
        address creator;
        uint48 createdAt;
        bool isActive;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        string text;
        address proposer;
        uint128 totalShares;
        uint128 poolValue;  // USDC backing this answer
        uint48 createdAt;
    }

    struct Position {
        uint128 shares;
        uint128 costBasis;  // Total USDC spent (for P&L)
    }

    // === STATE ===

    IERC20 public usdcToken;
    IFeeManager public feeManager;

    uint256 public nextQuestionId;
    uint256 public nextAnswerId;

    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(uint256 => uint256[]) public questionAnswerIds;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(uint256 => address[]) public answerHolders;

    // === CONFIGURATION ===

    uint96 public questionCreationFee;
    uint96 public answerProposalStake;
    uint16 public buyFeeBps;   // basis points (100 = 1%)
    uint16 public sellFeeBps;

    // === EVENTS ===

    event QuestionCreated(uint256 indexed questionId, address indexed creator, string text);
    event AnswerProposed(uint256 indexed answerId, uint256 indexed questionId, address indexed proposer, string text);
    event SharesBought(uint256 indexed answerId, address indexed buyer, uint256 shares, uint256 cost);
    event SharesSold(uint256 indexed answerId, address indexed seller, uint256 shares, uint256 returnAmount);

    // === CORE FUNCTIONS ===

    function createQuestion(
        string calldata text,
        string calldata description,
        string[] calldata categories
    ) external returns (uint256 questionId) {
        // Collect creation fee
        // Create question
        // Emit event
    }

    function proposeAnswer(
        uint256 questionId,
        string calldata answerText
    ) external returns (uint256 answerId) {
        // Collect stake as first shares
        // Create answer with initial pool
        // Give proposer their shares
        // Emit event
    }

    function buyShares(
        uint256 answerId,
        uint256 usdcAmount
    ) external returns (uint256 sharesBought) {
        // Calculate shares from bonding curve
        // Collect USDC (minus fees)
        // Add to pool
        // Mint shares to buyer
        // Emit event
    }

    function sellShares(
        uint256 answerId,
        uint256 shareAmount
    ) external returns (uint256 usdcReturned) {
        // Calculate return from bonding curve
        // Burn shares
        // Remove from pool
        // Send USDC to seller (minus fees)
        // Emit event
    }

    // === VIEW FUNCTIONS ===

    function getSharePrice(uint256 answerId) public view returns (uint256) {
        Answer storage answer = answers[answerId];
        if (answer.totalShares == 0) return 1e6; // $1 base price
        return (answer.poolValue * 1e6) / answer.totalShares;
    }

    function getLeadingAnswer(uint256 questionId) public view returns (uint256 answerId, uint256 marketCap) {
        uint256[] storage answerIds = questionAnswerIds[questionId];
        for (uint i = 0; i < answerIds.length; i++) {
            Answer storage answer = answers[answerIds[i]];
            if (answer.poolValue > marketCap) {
                marketCap = answer.poolValue;
                answerId = answerIds[i];
            }
        }
    }

    function getUserPosition(uint256 answerId, address user) public view returns (
        uint256 shares,
        uint256 currentValue,
        int256 profitLoss
    ) {
        Position storage pos = positions[answerId][user];
        shares = pos.shares;
        currentValue = (shares * getSharePrice(answerId)) / 1e6;
        profitLoss = int256(currentValue) - int256(uint256(pos.costBasis));
    }
}
```

---

## Appendix B: Bonding Curve Math

### Constant Product Formula

```
poolValue / totalShares = pricePerShare

When buying:
1. Calculate average price for the shares being bought
2. Add USDC to pool
3. Mint new shares

When selling:
1. Calculate average price for shares being sold
2. Burn shares
3. Remove USDC from pool
```

### Simple Implementation

```solidity
library BondingCurve {

    /// @notice Calculate cost to buy shares
    /// @param currentShares Current total supply
    /// @param currentPool Current pool value
    /// @param sharesToBuy Number of shares to buy
    /// @return cost USDC cost for the shares
    function calculateBuyCost(
        uint256 currentShares,
        uint256 currentPool,
        uint256 sharesToBuy
    ) internal pure returns (uint256 cost) {
        if (currentShares == 0) {
            // First buyer: base price of $1 per share
            return sharesToBuy * 1e6;
        }

        // Average price during purchase
        // Integral of price curve from currentShares to currentShares + sharesToBuy
        uint256 startPrice = (currentPool * 1e6) / currentShares;
        uint256 endPrice = ((currentPool + sharesToBuy * startPrice / 1e6) * 1e6) / (currentShares + sharesToBuy);

        // Simplified: use average of start and end price
        cost = (sharesToBuy * (startPrice + endPrice)) / (2 * 1e6);
    }

    /// @notice Calculate return from selling shares
    /// @param currentShares Current total supply
    /// @param currentPool Current pool value
    /// @param sharesToSell Number of shares to sell
    /// @return returnAmount USDC returned for the shares
    function calculateSellReturn(
        uint256 currentShares,
        uint256 currentPool,
        uint256 sharesToSell
    ) internal pure returns (uint256 returnAmount) {
        require(sharesToSell <= currentShares, "Not enough shares");

        // Proportional return from pool
        returnAmount = (currentPool * sharesToSell) / currentShares;
    }
}
```

---

## 7. Security Analysis & Attack Vectors

This section analyzes potential gaming possibilities, attack vectors, and exploits that rogue actors and bots could attempt in the Answer Shares model.

### 7.1 Risk Matrix Overview

| Attack | Risk Level | Impact | Mitigation Difficulty |
|--------|------------|--------|----------------------|
| Sandwich/MEV | 🔴 HIGH | Medium | Medium |
| Wash Trading | 🟡 MEDIUM | Low | Easy |
| Pump & Dump | 🔴 HIGH | High | Medium |
| Sybil Proposals | 🟡 MEDIUM | Medium | Easy |
| Flash Loan | 🟢 LOW | High | Built-in resistant |
| Answer Spam | 🟡 MEDIUM | Medium | Easy |
| Pool Drain (Math) | 🔴 HIGH | Critical | Hard (audit required) |
| Sniper Bots | 🟡 MEDIUM | Medium | Medium |
| Coordinated Pump | 🟡 MEDIUM | Medium | Hard (mostly social) |

### 7.2 Attack Vector Details

#### 7.2.1 Sandwich Attacks (MEV)

**How it works:**
```
1. Bot monitors mempool for Alice's pending "buy 100 shares of Base" tx
2. Bot front-runs: buys shares → price rises
3. Alice's transaction executes at inflated price
4. Bot back-runs: sells shares at higher price
5. Result: Alice overpaid, bot profits from the spread
```

**Risk Level:** 🔴 HIGH (common on all AMM-style systems)

**Impact:** Users consistently overpay; bad UX; sophisticated actors extract value

**Mitigations:**
- Slippage protection (minSharesOut parameter)
- Transaction deadline parameter
- Private mempool integration (Flashbots Protect)
- Commit-reveal scheme (more complex)

---

#### 7.2.2 Wash Trading

**How it works:**
```
Attacker controls 2 wallets (A and B):

1. Wallet A buys 100 shares → price rises
2. Wallet B buys 50 shares → price rises more
3. Wallet A sells 100 shares → takes some profit from B's added liquidity
4. Wallet B sells 50 shares → small loss

Result: Creates fake volume signals, may induce FOMO in others
```

**Risk Level:** 🟡 MEDIUM

**Impact:** Fake volume metrics; potential to mislead other users

**Why less effective in Answer Shares:**
- Fees eat into profits (5% round-trip)
- No guaranteed profit (unlike order book manipulation)
- Pool is counterparty, not direct user-to-user

**Mitigations:**
- Cooldown period between buy and sell
- Progressive sell fee based on hold time
- Volume-weighted analysis (off-chain)

---

#### 7.2.3 Pump and Dump

**How it works:**
```
1. Attacker proposes answer "zkSync" (gets first shares at $1)
2. Attacker buys more shares quietly → price rises to $1.50
3. Attacker shills on Twitter: "zkSync mooning on OpinionMarketCap! 🚀"
4. Retail buyers FOMO in → price rises to $3.00
5. Attacker dumps all shares → price crashes to $0.80
6. Retail left holding depreciated shares
```

**Risk Level:** 🔴 HIGH (classic crypto attack)

**Impact:** Retail users lose money; platform reputation damage

**Mitigations:**
- Vesting period for large proposers/buyers
- Daily sell limits (% of holdings)
- Whale concentration warnings (UI)
- Proposer shares locked for minimum period

---

#### 7.2.4 Sybil Attack on Answer Proposals

**How it works:**
```
1. Attacker creates 100 wallets
2. Each wallet proposes a different answer with minimum stake ($5 each = $500 total)
3. Attacker now controls 100 potential answers
4. If any answer gains traction, attacker has first-mover advantage
5. Attacker dumps profitable positions
```

**Risk Level:** 🟡 MEDIUM

**Impact:** Early-bird advantage; spam; reduced signal quality

**Mitigations:**
- Higher proposal stake ($10+)
- Non-refundable proposal fee + stake (fee burned, stake becomes shares)
- Limit answers per question (MAX_ANSWERS = 10)
- Rate limit proposals per address per day
- Proposal vesting period

---

#### 7.2.5 Flash Loan Attack

**How it works:**
```
1. Borrow $1M USDC via flash loan (0 collateral)
2. Buy massive shares → price skyrockets
3. ??? (need external dependency to exploit)
4. Sell shares → price crashes
5. Repay loan in same transaction
```

**Risk Level:** 🟢 LOW (bonding curves are inherently flash-loan resistant)

**Why it doesn't work:**
- Buy raises price, sell lowers price
- In same transaction: buy at X, sell at X (minus fees)
- No external oracle to manipulate
- Net result: attacker loses fees

**Potential vulnerabilities to watch:**
- If share price is used as oracle elsewhere (DON'T do this)
- Cross-contract interactions that rely on instantaneous price
- Governance votes weighted by share holdings

**Mitigations:**
- Don't use share price as oracle
- Time-weighted average price (TWAP) for any external use
- Snapshot-based governance (not live balances)

---

#### 7.2.6 Answer Spam / Griefing

**How it works:**
```
Attacker creates many garbage/malicious answers:
- "asdfasdf" (gibberish)
- "Base" + "base" + "BASE" (duplicates with case variations)
- Offensive/illegal content
- Misleading phishing text

Goal: Make questions unusable; waste user attention; legal liability
```

**Risk Level:** 🟡 MEDIUM

**Impact:** Poor UX; moderation burden; potential legal issues

**Mitigations:**
- Economic barrier (higher proposal stake)
- Duplicate detection (case-insensitive hash comparison)
- Minimum/maximum text length requirements
- Moderator flagging system
- Community reporting mechanism

---

#### 7.2.7 Pool Draining (Math Exploit)

**How it works:**
```
Find edge case in bonding curve math:
- Rounding errors that accumulate
- Integer overflow/underflow
- Division by zero edge cases
- First share / last share boundary conditions
```

**Example vulnerability:**
```solidity
// BAD: Rounding exploit
function sellShares(uint256 shares) {
    uint256 returnAmount = (poolValue * shares) / totalShares;
    // If poolValue = 100, totalShares = 3, shares = 1
    // returnAmount = 33 (not 33.33...)
    // Repeat 3 times: get 99 total, pool has 1 left (rounding errors accumulate)
}
```

**Risk Level:** 🔴 HIGH (if math is wrong)

**Impact:** Complete pool drainage; total loss of user funds

**Mitigations:**
- Minimum pool reserve (always keep $1 in pool)
- Higher precision arithmetic internally (1e18)
- Extensive unit tests for edge cases
- Formal verification of math
- Professional security audit
- Use battle-tested formulas (Uniswap, Balancer)

---

#### 7.2.8 Early Bird / Sniper Bots

**How it works:**
```
1. Bot monitors blockchain for new question creation events
2. Immediately proposes the "obvious" answer (e.g., "Ethereum" for any ETH question)
3. Gets first shares at base price ($1)
4. Organic users buy after → price rises
5. Bot sells for guaranteed profit

Result: Bot taxes all new questions; unfair advantage
```

**Risk Level:** 🟡 MEDIUM

**Impact:** First-mover advantage always goes to bots; unfair to organic users

**Mitigations:**
- Creator sets first answer (creator advantage, not bot)
- Delayed answer proposals (answers open 1 hour after question creation)
- Auction for first proposal slot
- Whitelist for early proposers

---

#### 7.2.9 Coordinated Market Manipulation

**How it works:**
```
Discord/Telegram group coordinates:

Leader: "Everyone buy ARBITRUM answer at 3pm UTC. Let's pump it!"
- Organizers (leaders) buy early at $1.20
- Group members FOMO in at 3pm → price pumps to $2.50
- Organizers dump on members → price crashes to $0.90
- Members left holding bags
```

**Risk Level:** 🟡 MEDIUM

**Impact:** Retail users lose to coordinated groups; platform becomes "insider" game

**Mitigations (mostly off-chain):**
- Terms of Service prohibiting coordination
- Community moderation of Discord/Telegram
- On-chain: sell cooldowns, whale limits
- Transparency: show holder concentration in UI
- Warnings: "⚠️ 80% held by 3 wallets"

---

### 7.3 Hot Potato vs Answer Shares: Gaming Comparison

| Attack Vector | Hot Potato Risk | Answer Shares Risk | Notes |
|---------------|----------------|-------------------|-------|
| MEV/Sandwich | 🟡 Medium | 🔴 High | More trades = more MEV opportunity |
| Wash Trading | 🟢 Low | 🟡 Medium | No benefit in hot potato (direct transfer) |
| Pump & Dump | 🟡 Medium | 🔴 High | Multiple positions enable coordination |
| Flash Loan | 🟢 Low | 🟢 Low | Both resistant |
| Answer Spam | N/A | 🟡 Medium | New vector in Answer Shares |
| Pool Math Exploit | N/A | 🔴 High | New attack surface |
| Sniper Bots | 🟢 Low | 🟡 Medium | First-mover more valuable in Answer Shares |
| Bag Holding | 🔴 High | 🟡 Medium | Distributed in Answer Shares |

**Summary:** Answer Shares introduces NEW attack vectors (bonding curve math, coordination attacks) but removes the catastrophic "bag holder" risk from Hot Potato.

---

## 8. Built-in Protections

### 8.1 Protection Parameters (TO BE DISCUSSED)

> ⚠️ **OPEN FOR DISCUSSION**: The values below are suggestions. The goal is to balance security vs trading friction. Too many rules = less adoption. We want to encourage trading while preventing obvious exploits.

#### Option A: Maximum Protection (Restrictive)
```solidity
uint256 public constant MIN_HOLD_TIME = 1 hours;        // Cooldown before selling
uint256 public constant MAX_SELL_PER_DAY_BPS = 2000;    // 20% max daily sell
uint256 public constant PROPOSER_VESTING = 24 hours;    // Proposer lock period
uint256 public constant MIN_PROPOSAL_STAKE = 10e6;      // $10 minimum to propose
uint256 public constant PROPOSAL_FEE = 5e6;             // $5 non-refundable fee
```
- ✅ Strong anti-manipulation
- ❌ Feels restrictive, less fun, slower trading

#### Option B: Balanced Protection (Recommended)
```solidity
uint256 public constant MIN_HOLD_TIME = 10 minutes;     // Short cooldown
uint256 public constant MAX_SELL_PER_DAY_BPS = 5000;    // 50% max daily sell
uint256 public constant PROPOSER_VESTING = 1 hours;     // Light proposer lock
uint256 public constant MIN_PROPOSAL_STAKE = 5e6;       // $5 to propose
uint256 public constant PROPOSAL_FEE = 0;               // No extra fee
```
- ✅ Reasonable protection
- ✅ Still feels like free trading

#### Option C: Minimal Protection (Free Market)
```solidity
uint256 public constant MIN_HOLD_TIME = 0;              // No cooldown
uint256 public constant MAX_SELL_PER_DAY_BPS = 10000;   // No daily limit (100%)
uint256 public constant PROPOSER_VESTING = 0;           // No vesting
uint256 public constant MIN_PROPOSAL_STAKE = 5e6;       // $5 to propose (anti-spam only)
uint256 public constant PROPOSAL_FEE = 0;               // No extra fee
```
- ✅ Maximum trading freedom
- ✅ Simple rules, easy to understand
- ❌ More vulnerable to pump & dump
- ❌ Proposers can dump immediately

#### Always Keep (Non-Negotiable)
```solidity
uint256 public constant MIN_POOL_RESERVE = 1e6;         // $1 always in pool (math safety)
uint8 public constant MAX_ANSWERS_PER_QUESTION = 10;    // Prevent answer spam
```

### Parameter Trade-offs Discussion

| Parameter | Restrictive | Balanced | Minimal | Trade-off |
|-----------|-------------|----------|---------|-----------|
| **Sell Cooldown** | 1 hour | 10 min | None | Anti-dump vs trading speed |
| **Daily Sell Limit** | 20% | 50% | 100% | Whale control vs freedom |
| **Proposer Vesting** | 24h | 1h | None | Anti-pump vs proposer reward |
| **Proposal Stake** | $10 | $5 | $5 | Spam prevention vs accessibility |
| **Proposal Fee** | $5 | $0 | $0 | Revenue vs barrier |

### Questions to Decide

1. **Do we want a sell cooldown at all?**
   - Pro: Prevents instant flip arbitrage
   - Con: Frustrating if user changes mind

2. **Daily sell limits?**
   - Pro: Prevents whale dumps crashing price
   - Con: Feels like "your money is locked"

3. **Proposer vesting?**
   - Pro: Proposer can't pump & dump their own answer
   - Con: Reduces incentive to propose good answers

4. **Proposal stake vs fee?**
   - Stake: Gets converted to shares (user keeps value)
   - Fee: Burned/to treasury (pure cost, stronger anti-spam)

### 8.2 Anti-MEV Protection

```solidity
/// @notice Buy shares with slippage and deadline protection
/// @param answerId The answer to buy shares in
/// @param usdcAmount Amount of USDC to spend
/// @param minSharesOut Minimum shares to receive (slippage protection)
/// @param deadline Transaction must execute before this timestamp
function buyShares(
    uint256 answerId,
    uint256 usdcAmount,
    uint256 minSharesOut,
    uint256 deadline
) external nonReentrant {
    // Deadline check
    require(block.timestamp <= deadline, "Transaction expired");

    // Calculate shares
    uint256 sharesToMint = _calculateSharesForAmount(answerId, usdcAmount);

    // Slippage check
    require(sharesToMint >= minSharesOut, "Slippage exceeded");

    // ... rest of buy logic
}

/// @notice Sell shares with slippage protection
/// @param answerId The answer to sell shares from
/// @param shareAmount Number of shares to sell
/// @param minUsdcOut Minimum USDC to receive (slippage protection)
function sellShares(
    uint256 answerId,
    uint256 shareAmount,
    uint256 minUsdcOut
) external nonReentrant {
    uint256 returnAmount = _calculateReturnForShares(answerId, shareAmount);

    // Slippage check
    require(returnAmount >= minUsdcOut, "Slippage exceeded");

    // ... rest of sell logic
}
```

### 8.3 Anti-Dump Protection

```solidity
// === STORAGE FOR ANTI-DUMP ===

mapping(uint256 => mapping(address => uint256)) public lastBuyTime;
mapping(uint256 => mapping(address => uint256)) public soldToday;
mapping(uint256 => mapping(address => uint256)) public lastSellDay;
mapping(uint256 => mapping(address => uint256)) public vestedUntil;

/// @notice Sell shares with anti-dump protections
function sellShares(
    uint256 answerId,
    uint256 shareAmount,
    uint256 minUsdcOut
) external nonReentrant {
    Position storage pos = positions[answerId][msg.sender];
    require(pos.shares >= shareAmount, "Insufficient shares");

    // === COOLDOWN CHECK ===
    require(
        block.timestamp >= lastBuyTime[answerId][msg.sender] + MIN_HOLD_TIME,
        "Cooldown: must wait 1 hour after buying"
    );

    // === VESTING CHECK (for proposers) ===
    require(
        block.timestamp >= vestedUntil[answerId][msg.sender],
        "Shares still vesting"
    );

    // === DAILY SELL LIMIT ===
    uint256 today = block.timestamp / 1 days;
    if (lastSellDay[answerId][msg.sender] < today) {
        // Reset daily counter
        soldToday[answerId][msg.sender] = 0;
        lastSellDay[answerId][msg.sender] = today;
    }

    uint256 maxSellableToday = (pos.shares * MAX_SELL_PER_DAY_BPS) / 10000;
    require(
        soldToday[answerId][msg.sender] + shareAmount <= maxSellableToday,
        "Daily sell limit exceeded (20% max)"
    );

    // Update daily sold counter
    soldToday[answerId][msg.sender] += shareAmount;

    // === SLIPPAGE CHECK ===
    uint256 returnAmount = _calculateReturnForShares(answerId, shareAmount);
    require(returnAmount >= minUsdcOut, "Slippage exceeded");

    // === POOL RESERVE CHECK ===
    Answer storage answer = answers[answerId];
    require(
        answer.poolValue - returnAmount >= MIN_POOL_RESERVE,
        "Would drain pool below reserve"
    );

    // ... proceed with sell
}
```

### 8.4 Anti-Spam Protection

```solidity
// === STORAGE FOR ANTI-SPAM ===

mapping(uint256 => mapping(bytes32 => bool)) public answerTextExists;
mapping(address => uint256) public lastProposalTime;
mapping(address => mapping(uint256 => uint8)) public dailyProposalCount;

/// @notice Propose a new answer with anti-spam protections
function proposeAnswer(
    uint256 questionId,
    string calldata answerText
) external nonReentrant returns (uint256 answerId) {
    // === QUESTION EXISTS CHECK ===
    require(questions[questionId].isActive, "Question not found");

    // === MAX ANSWERS CHECK ===
    require(
        questionAnswerIds[questionId].length < MAX_ANSWERS_PER_QUESTION,
        "Maximum answers reached for this question"
    );

    // === TEXT LENGTH CHECK ===
    require(bytes(answerText).length >= 2, "Answer too short");
    require(bytes(answerText).length <= 60, "Answer too long");

    // === DUPLICATE CHECK (case-insensitive) ===
    bytes32 textHash = keccak256(bytes(_toLowerCase(answerText)));
    require(
        !answerTextExists[questionId][textHash],
        "Duplicate answer already exists"
    );
    answerTextExists[questionId][textHash] = true;

    // === RATE LIMIT CHECK ===
    uint256 today = block.timestamp / 1 days;
    require(
        dailyProposalCount[msg.sender][today] < 5,
        "Max 5 proposals per day"
    );
    dailyProposalCount[msg.sender][today]++;

    // === COLLECT PROPOSAL FEE (non-refundable) ===
    usdcToken.safeTransferFrom(msg.sender, treasury, PROPOSAL_FEE);

    // === COLLECT STAKE (becomes first shares) ===
    usdcToken.safeTransferFrom(msg.sender, address(this), MIN_PROPOSAL_STAKE);

    // === CREATE ANSWER ===
    answerId = nextAnswerId++;
    answers[answerId] = Answer({
        id: answerId,
        questionId: questionId,
        text: answerText,
        proposer: msg.sender,
        totalShares: uint128(MIN_PROPOSAL_STAKE / 1e6),  // 10 shares at $1 each
        poolValue: uint128(MIN_PROPOSAL_STAKE),
        createdAt: uint48(block.timestamp)
    });

    questionAnswerIds[questionId].push(answerId);

    // === GIVE PROPOSER THEIR SHARES (with vesting) ===
    positions[answerId][msg.sender] = Position({
        shares: uint128(MIN_PROPOSAL_STAKE / 1e6),
        costBasis: uint128(MIN_PROPOSAL_STAKE)
    });

    // Proposer shares vested for 24 hours
    vestedUntil[answerId][msg.sender] = block.timestamp + PROPOSER_VESTING;

    emit AnswerProposed(answerId, questionId, msg.sender, answerText);
}

/// @notice Convert string to lowercase for duplicate detection
function _toLowerCase(string memory str) internal pure returns (string memory) {
    bytes memory bStr = bytes(str);
    bytes memory bLower = new bytes(bStr.length);
    for (uint i = 0; i < bStr.length; i++) {
        if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
            bLower[i] = bytes1(uint8(bStr[i]) + 32);
        } else {
            bLower[i] = bStr[i];
        }
    }
    return string(bLower);
}
```

### 8.5 Pool Math Safety

```solidity
// === PRECISION CONSTANTS ===
uint256 internal constant PRECISION = 1e18;

/// @notice Calculate shares to mint for a given USDC amount (safe math)
function _calculateSharesForAmount(
    uint256 answerId,
    uint256 usdcAmount
) internal view returns (uint256 shares) {
    Answer storage answer = answers[answerId];

    if (answer.totalShares == 0) {
        // First purchase: 1 share per $1
        return usdcAmount / 1e6;
    }

    // shares = (usdcAmount * totalShares) / poolValue
    // Use high precision to avoid rounding errors
    shares = (usdcAmount * PRECISION * answer.totalShares) / (answer.poolValue * PRECISION);

    require(shares > 0, "Amount too small");
}

/// @notice Calculate USDC return for selling shares (safe math)
function _calculateReturnForShares(
    uint256 answerId,
    uint256 shareAmount
) internal view returns (uint256 returnAmount) {
    Answer storage answer = answers[answerId];

    require(answer.totalShares > 0, "No shares exist");
    require(shareAmount <= answer.totalShares, "Not enough shares in pool");

    // returnAmount = (shareAmount * poolValue) / totalShares
    // Use high precision
    returnAmount = (shareAmount * PRECISION * answer.poolValue) / (answer.totalShares * PRECISION);

    // Ensure pool reserve
    require(
        answer.poolValue - returnAmount >= MIN_POOL_RESERVE,
        "Would violate pool reserve"
    );
}

/// @notice Get current share price with precision
function getSharePrice(uint256 answerId) public view returns (uint256 pricePerShare) {
    Answer storage answer = answers[answerId];

    if (answer.totalShares == 0) {
        return 1e6; // Base price: $1.00
    }

    // Price = poolValue / totalShares (in USDC with 6 decimals)
    pricePerShare = (answer.poolValue * 1e6) / answer.totalShares;
}
```

### 8.6 Transparency & Monitoring

```solidity
// === VIEW FUNCTIONS FOR TRANSPARENCY ===

/// @notice Get holder concentration for an answer
/// @return topHolderPercent Percentage held by largest holder
/// @return top5HoldersPercent Percentage held by top 5 holders
/// @return uniqueHolders Number of unique holders
function getHolderConcentration(uint256 answerId) public view returns (
    uint256 topHolderPercent,
    uint256 top5HoldersPercent,
    uint256 uniqueHolders
) {
    Answer storage answer = answers[answerId];
    address[] storage holders = answerHolders[answerId];
    uniqueHolders = holders.length;

    if (uniqueHolders == 0 || answer.totalShares == 0) {
        return (0, 0, 0);
    }

    // Find top holders (simplified - in production, use sorted data structure)
    uint256[5] memory topBalances;

    for (uint i = 0; i < holders.length; i++) {
        uint256 balance = positions[answerId][holders[i]].shares;

        // Insert into top 5 if qualifies
        for (uint j = 0; j < 5; j++) {
            if (balance > topBalances[j]) {
                // Shift down
                for (uint k = 4; k > j; k--) {
                    topBalances[k] = topBalances[k-1];
                }
                topBalances[j] = balance;
                break;
            }
        }
    }

    topHolderPercent = (topBalances[0] * 10000) / answer.totalShares;

    uint256 top5Total = 0;
    for (uint i = 0; i < 5; i++) {
        top5Total += topBalances[i];
    }
    top5HoldersPercent = (top5Total * 10000) / answer.totalShares;
}

/// @notice Check if an answer has concerning concentration
/// @return isConcentrated True if top holder has >50% or top 5 have >80%
function isConcentrated(uint256 answerId) public view returns (bool) {
    (uint256 topHolder, uint256 top5, ) = getHolderConcentration(answerId);
    return topHolder > 5000 || top5 > 8000;  // >50% or >80%
}
```

### 8.7 Events for Monitoring

```solidity
// === SECURITY EVENTS ===

event SuspiciousActivity(
    address indexed user,
    uint256 indexed answerId,
    string activityType,
    uint256 amount
);

event LargeTrade(
    address indexed user,
    uint256 indexed answerId,
    bool isBuy,
    uint256 shares,
    uint256 usdcAmount,
    uint256 newPrice
);

event ConcentrationWarning(
    uint256 indexed answerId,
    address indexed topHolder,
    uint256 percentHeld
);

event ProposerDump(
    uint256 indexed answerId,
    address indexed proposer,
    uint256 sharesSold,
    uint256 percentOfHoldings
);
```

### 8.8 Protection Summary

> 💬 **Values marked with ❓ are open for discussion**

| Protection | Restrictive | Balanced | Minimal | Required? |
|------------|-------------|----------|---------|-----------|
| **Anti-MEV (slippage)** | User sets | User sets | User sets | ✅ Yes |
| **Sell Cooldown** | 1 hour ❓ | 10 min ❓ | None ❓ | ❓ Optional |
| **Daily Sell Limit** | 20% ❓ | 50% ❓ | None ❓ | ❓ Optional |
| **Proposer Vesting** | 24h ❓ | 1h ❓ | None ❓ | ❓ Optional |
| **Pool Reserve** | $1 | $1 | $1 | ✅ Yes (math) |
| **Max Answers** | 10 | 10 | 10 | ✅ Yes (UX) |
| **Duplicate Detection** | Yes | Yes | Yes | ✅ Yes |
| **Proposal Stake** | $10 ❓ | $5 ❓ | $5 ❓ | ✅ Yes (anti-spam) |
| **Proposal Fee** | $5 ❓ | $0 ❓ | $0 ❓ | ❓ Optional |
| **Rate Limit** | 5/day ❓ | 10/day ❓ | None ❓ | ❓ Optional |

### Philosophy: Encourage Trading

**Principle:** Let the market be free. Only add rules that prevent:
1. **Math exploits** (pool draining) → Always protect
2. **Spam** (garbage answers) → Minimum stake required
3. **MEV** (sandwich attacks) → User-controlled slippage

**Don't over-protect against:**
- Pump & dump → Users should DYOR (do your own research)
- Whale manipulation → Transparency (show holder %) is enough
- Fast trading → That's the fun part!

### Minimum Viable Protection

If we want maximum trading freedom, the **absolute minimum** protections are:

```solidity
// REQUIRED - Math & UX safety
uint256 public constant MIN_POOL_RESERVE = 1e6;         // Prevent math edge cases
uint8 public constant MAX_ANSWERS_PER_QUESTION = 10;    // Prevent UI spam

// REQUIRED - Anti-spam
uint256 public constant MIN_PROPOSAL_STAKE = 5e6;       // $5 stake (becomes shares)

// OPTIONAL - User-controlled
// slippage protection (minSharesOut) - user decides tolerance
// deadline - user decides expiry

// EVERYTHING ELSE - Skip it
// No cooldowns, no daily limits, no vesting
// Let people trade freely
```

This gives us:
- ✅ Safe math
- ✅ Clean UX (limited answers)
- ✅ Anti-spam (costs $5 to propose)
- ✅ MEV protection (user-controlled)
- ✅ Maximum trading freedom
- ✅ Simple rules everyone understands

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2025 | Claude | Initial comparison and analysis |
| 1.1 | Feb 2025 | Claude | Added security analysis and built-in protections |
