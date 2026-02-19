# Solana Deployment & Cross-Chain Solutions

## Overview

This document outlines options for making the Answer Shares contract accessible to Solana users, either through a native Solana port or cross-chain integration.

---

## Part 1: Solana Smart Contract Development

### The Language: Rust with Anchor Framework

Solana smart contracts are called **Programs** and are written in **Rust**. Most developers use the **Anchor framework** which provides macros and abstractions similar to Hardhat/Foundry for Solidity.

| Ethereum/Base | Solana |
|---------------|--------|
| Solidity | Rust |
| Hardhat/Foundry | Anchor |
| Contract | Program |
| Storage variables | Accounts (PDAs) |
| msg.sender | Signer |
| mapping | PDA accounts |

### Key Architectural Differences

| Aspect | EVM (Current) | Solana |
|--------|---------------|--------|
| **State Storage** | Contract stores all data internally | Data stored in separate **Accounts** |
| **Account Model** | Single contract address holds state | Program + multiple data accounts |
| **Execution** | Sequential | Parallel (if accounts don't overlap) |
| **Gas/Fees** | Gas units, variable cost | Compute units + rent for storage |
| **Upgrades** | Proxy pattern (UUPS) | Native upgradeable programs |
| **Token Standard** | ERC-20 | SPL Token |

### Solana's Account Model (Critical Difference)

In Solana, **programs are stateless**. All data lives in **accounts**:

```
EVM (current contract):
┌─────────────────────────────────┐
│ AnswerSharesCore Contract       │
│ ├── questions mapping           │
│ ├── answers mapping             │
│ ├── userShares mapping          │
│ └── all state in one place      │
└─────────────────────────────────┘

Solana:
┌──────────────────┐     ┌─────────────────┐
│ Program (code)   │────▶│ Question #1 PDA │
│ (stateless)      │     ├─────────────────┤
└──────────────────┘     │ Question #2 PDA │
                         ├─────────────────┤
                         │ Answer #1 PDA   │
                         ├─────────────────┤
                         │ UserShares PDA  │
                         └─────────────────┘
```

**PDA** = Program Derived Address (deterministic account addresses owned by your program)

---

## Part 2: Sample Anchor/Rust Implementation

```rust
// lib.rs - Anchor program for Answer Shares

use anchor_lang::prelude::*;

declare_id!("YourProgramIdHere...");

#[program]
pub mod answer_shares {
    use super::*;

    pub fn create_question(
        ctx: Context<CreateQuestion>,
        question_text: String,
        description: String,
    ) -> Result<()> {
        let question = &mut ctx.accounts.question;
        question.id = ctx.accounts.global_state.question_count;
        question.creator = ctx.accounts.creator.key();
        question.question_text = question_text;
        question.description = description;
        question.created_at = Clock::get()?.unix_timestamp;
        question.is_active = true;

        // Transfer creation fee (SPL token transfer)
        // ...

        Ok(())
    }

    pub fn buy_shares(
        ctx: Context<BuyShares>,
        usdc_amount: u64,
    ) -> Result<()> {
        let answer = &mut ctx.accounts.answer;
        let user_position = &mut ctx.accounts.user_position;

        // Calculate shares from bonding curve
        let shares = calculate_shares(answer.pool_value, answer.total_shares, usdc_amount);

        // Update state
        answer.pool_value += usdc_amount;
        answer.total_shares += shares;
        user_position.shares += shares;

        // SPL token transfer from user to pool
        // ...

        Ok(())
    }

    pub fn sell_shares(
        ctx: Context<SellShares>,
        shares_to_sell: u64,
    ) -> Result<()> {
        let answer = &mut ctx.accounts.answer;
        let user_position = &mut ctx.accounts.user_position;

        require!(user_position.shares >= shares_to_sell, ErrorCode::InsufficientShares);

        // Calculate USDC return from bonding curve
        let usdc_return = calculate_usdc_return(answer.pool_value, answer.total_shares, shares_to_sell);

        // Update state
        answer.pool_value -= usdc_return;
        answer.total_shares -= shares_to_sell;
        user_position.shares -= shares_to_sell;

        // SPL token transfer from pool to user
        // ...

        Ok(())
    }
}

// Account structures (like Solidity structs)
#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub question_count: u64,
    pub answer_count: u64,
    pub platform_fee_bps: u16,      // 150 = 1.5%
    pub creator_fee_bps: u16,       // 50 = 0.5%
    pub question_creation_fee: u64, // 2 USDC (6 decimals)
    pub answer_proposal_stake: u64, // 5 USDC (6 decimals)
    pub is_paused: bool,
}

#[account]
pub struct Question {
    pub id: u64,
    pub creator: Pubkey,
    pub owner: Pubkey,
    pub question_text: String,      // max 60 chars
    pub description: String,        // max 280 chars
    pub created_at: i64,
    pub is_active: bool,
    pub answer_count: u64,
    pub total_volume: u64,
    pub sale_price: u64,            // 0 = not for sale
}

#[account]
pub struct Answer {
    pub id: u64,
    pub question_id: u64,
    pub proposer: Pubkey,
    pub answer_text: String,        // max 60 chars
    pub pool_value: u64,            // USDC in pool (6 decimals)
    pub total_shares: u64,          // Total shares (2 decimals)
    pub holder_count: u32,
    pub all_time_high: u64,
    pub is_active: bool,
    pub created_at: i64,
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub answer_id: u64,
    pub shares: u64,
    pub cost_basis: u64,
}

#[account]
pub struct AccumulatedFees {
    pub user: Pubkey,
    pub amount: u64,
}

// Context structs define which accounts each instruction needs
#[derive(Accounts)]
pub struct CreateQuestion<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Question::SIZE,
        seeds = [b"question", global_state.question_count.to_le_bytes().as_ref()],
        bump
    )]
    pub question: Account<'info, Question>,

    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK: USDC token account
    #[account(mut)]
    pub creator_usdc: AccountInfo<'info>,

    /// CHECK: Treasury USDC account
    #[account(mut)]
    pub treasury_usdc: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub answer: Account<'info, Answer>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + UserPosition::SIZE,
        seeds = [b"position", buyer.key().as_ref(), answer.id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub question: Account<'info, Question>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient shares to sell")]
    InsufficientShares,
    #[msg("Contract is paused")]
    ContractPaused,
    #[msg("Question not active")]
    QuestionNotActive,
    #[msg("Answer not active")]
    AnswerNotActive,
    #[msg("Unauthorized")]
    Unauthorized,
}
```

---

## Part 3: Effort Estimate for Full Port

| Component | Complexity | Time Estimate |
|-----------|------------|---------------|
| **Learn Rust basics** | High | 2-4 weeks |
| **Learn Anchor framework** | Medium | 1-2 weeks |
| **Core program (questions, answers, shares)** | High | 2-3 weeks |
| **SPL token integration (USDC)** | Medium | 1 week |
| **Testing suite** | Medium | 1-2 weeks |
| **Frontend changes (wagmi → @solana/web3.js)** | Medium | 1-2 weeks |
| **Total** | | **8-12 weeks** |

### Key Rewrite Challenges

1. **No mappings** - Need to create PDA accounts for each question, answer, user position
2. **Account size limits** - Each account max 10KB, design data structures carefully
3. **Rent** - Must pay rent for storage (or make accounts rent-exempt)
4. **Different token model** - SPL tokens work differently than ERC-20
5. **No inheritance** - Rust doesn't have class inheritance like Solidity
6. **Access control** - No OpenZeppelin, implement roles manually

### Solana Development Tools

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli

# Create new project
anchor init answer_shares_solana
cd answer_shares_solana

# Build & test
anchor build
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

---

## Part 4: Cross-Chain Solutions (Keep Base, Add Solana Access)

### Option A: Manual Bridging (Zero Code)

Users bridge assets themselves and use separate wallets:

```
Solana User                        Base
─────────────────────────────────────────────
SOL/USDC on Solana
      │
      ▼ (Bridge: Wormhole, Portal, Allbridge)
      │
USDC on Base ──────────────────▶ Trade on OMC with MetaMask
```

**Available Bridges:**
- **Wormhole/Portal** - https://portalbridge.com
- **Allbridge** - https://allbridge.io
- **deBridge** - https://debridge.finance

**Pros:** No development work
**Cons:** Poor UX, user needs MetaMask for Base

---

### Option B: Neon EVM (Deploy Solidity on Solana)

Neon EVM lets you deploy **exact Solidity contracts** on Solana's infrastructure:

```
AnswerSharesCore.sol (same code)
        │
        ▼
   Neon EVM (runs on Solana)
        │
        ▼
Solana users interact with Phantom wallet
```

**Setup:**
```bash
# Add Neon network to Hardhat
networks: {
  neonDevnet: {
    url: "https://devnet.neonevm.org",
    chainId: 245022926,
    accounts: [PRIVATE_KEY]
  },
  neonMainnet: {
    url: "https://neon-proxy-mainnet.solana.p2p.org",
    chainId: 245022934,
    accounts: [PRIVATE_KEY]
  }
}

# Deploy
npx hardhat run scripts/deploy.js --network neonMainnet
```

**Pros:** Same contract code, Solana-native UX
**Cons:** Separate market/liquidity from Base deployment

---

### Option C: Wormhole Cross-Chain Messaging

True cross-chain: Solana users sign on Solana, trade executes on Base:

```
Solana User (Phantom)
        │
        ▼ Signs message + USDC
   Wormhole Relayer
        │
        ▼ Bridges USDC + executes call
   AnswerSharesCore.sol (Base)
        │
        ▼ Trade confirmation relayed back
   Solana User sees result
```

**Contract Addition:**
```solidity
// Add to AnswerSharesCore.sol
import "@wormhole/IWormholeRelayer.sol";

contract AnswerSharesCore {
    IWormholeRelayer public wormholeRelayer;

    // Receive cross-chain buy order from Solana
    function receiveBuyOrder(
        bytes memory payload,
        bytes[] memory additionalVaas,
        bytes32 sourceAddress,
        uint16 sourceChain,      // 1 = Solana
        bytes32 deliveryHash
    ) external payable {
        require(msg.sender == address(wormholeRelayer), "Only relayer");

        // Decode payload
        (address user, uint256 answerId, uint256 usdcAmount) = abi.decode(
            payload,
            (address, uint256, uint256)
        );

        // Execute buy on behalf of cross-chain user
        _buySharesFor(user, answerId, usdcAmount);
    }
}
```

**Pros:** Unified liquidity, seamless UX
**Cons:** Complex integration, relayer costs

---

### Option D: Wormhole Connect Widget (Best Quick Win)

Embed a bridge UI directly in your app:

```bash
npm install @wormhole-foundation/wormhole-connect
```

```tsx
// apps/shares/src/app/bridge/page.tsx
import WormholeConnect from '@wormhole-foundation/wormhole-connect';

export default function BridgePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Bridge to Base</h1>
      <p className="text-muted-foreground mb-8">
        Bridge USDC from Solana to Base to start trading on Answer Shares.
      </p>

      <WormholeConnect
        config={{
          networks: ["solana", "base"],
          tokens: ["USDC"],
          rpcs: {
            solana: "https://api.mainnet-beta.solana.com",
            base: "https://mainnet.base.org"
          }
        }}
      />
    </div>
  );
}
```

**Pros:** Quick to implement (1 day), professional UI
**Cons:** User still needs MetaMask for Base trading

---

### Option E: Intent-Based / Solver Networks

Protocols like **Socket**, **Across**, **UniswapX** use market makers (solvers):

```
Solana User: "Buy 10 shares of Answer #5"
        │
        ▼
   Solver Network (Socket, Across)
        │
   Solver has funds on both chains
        │
        ▼
   Executes on Base immediately with solver's funds
        │
        ▼
   User gets shares (mapped to their address)
   Solver rebalances later via bridges
```

**Pros:** Best UX, feels native
**Cons:** Requires partnership, solver liquidity

---

## Part 5: Comparison Matrix

| Option | Dev Effort | UX Quality | Liquidity | Cost |
|--------|------------|------------|-----------|------|
| Manual bridging | None | Poor | Unified | Free |
| Neon EVM deploy | Low (1 week) | Good | Split | Gas fees |
| Wormhole widget | Low (1-2 days) | Medium | Unified | Free |
| Wormhole relayer | High (4-6 weeks) | Great | Unified | Relayer fees |
| Solver network | High (partnership) | Best | Unified | Solver fees |
| Full Solana port | Very High (12 weeks) | Native | Split | Dev time |

---

## Part 6: Recommended Path

### Short Term (This Week)
1. Add bridge instructions to docs/UI
2. Implement Wormhole Connect widget on `/bridge` page

### Medium Term (1-2 Months)
1. Evaluate Neon EVM for separate Solana market
2. Research solver network partnerships (Socket Protocol)

### Long Term (3+ Months)
1. Full Wormhole relayer integration for seamless cross-chain
2. Or: Native Solana port if user demand justifies

---

## Part 7: Implementation Checklist

### Wormhole Connect Widget (Quick Win)

- [ ] Install `@wormhole-foundation/wormhole-connect`
- [ ] Create `/bridge` page in shares app
- [ ] Add navigation link to bridge page
- [ ] Test Solana → Base USDC bridge flow
- [ ] Add user guide/FAQ for bridging

### Neon EVM Deployment (If Pursuing)

- [ ] Add Neon network config to hardhat.config.ts
- [ ] Test deployment on Neon devnet
- [ ] Update frontend for multi-chain support
- [ ] Deploy to Neon mainnet
- [ ] Verify contracts on Neon explorer

### Full Solana Port (If Pursuing)

- [ ] Set up Anchor development environment
- [ ] Port GlobalState, Question, Answer accounts
- [ ] Implement create_question instruction
- [ ] Implement propose_answer instruction
- [ ] Implement buy_shares instruction
- [ ] Implement sell_shares instruction
- [ ] Implement fee accumulation and claiming
- [ ] Write comprehensive test suite
- [ ] Deploy to Solana devnet
- [ ] Update frontend with @solana/web3.js
- [ ] Deploy to Solana mainnet

---

## Resources

### Solana Development
- [Solana Docs](https://docs.solana.com/)
- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)

### Cross-Chain
- [Wormhole Docs](https://docs.wormhole.com/)
- [Wormhole Connect](https://docs.wormhole.com/wormhole/quick-start/wh-connect)
- [Neon EVM](https://docs.neonevm.org/)
- [Socket Protocol](https://docs.socket.tech/)

### Bridges
- [Portal Bridge](https://portalbridge.com/)
- [Allbridge](https://allbridge.io/)
- [deBridge](https://debridge.finance/)
