# Answer Shares Frontend - Feature Migration Plan

## Overview

Migrate all features from Hot Potato (`apps/web`) to Answer Shares (`apps/shares`).

---

## Contract Events (V2)

### Core Trading Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `QuestionCreated` | New question created | Home page updates, notifications |
| `AnswerProposed` | New answer added | Question detail updates |
| `SharesBought` | Shares purchased (with fee breakdown) | Trade history, price charts, leaderboard |
| `SharesSold` | Shares sold (with fee breakdown) | Trade history, price charts, leaderboard |

### Leadership Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `LeaderChanged` | New answer became leader | Real-time leader badge updates, notifications |

### Milestone Events (Gamification)

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `PriceMilestoneReached` | Answer hit $10/$100/$1K/$10K | Achievements, notifications, badges |
| `NewAllTimeHigh` | New ATH for answer | Charts, notifications, trending |
| `HolderMilestoneReached` | 10/50/100/500/1K holders | Social proof, badges |

### Holder Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `NewHolder` | Someone bought shares for first time | Activity feed, holder count |
| `HolderExited` | Someone sold all shares | Activity feed, holder count |

### Question Marketplace Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `QuestionListed` | Question listed for sale | Marketplace page |
| `QuestionListingCancelled` | Listing cancelled | Marketplace page |
| `QuestionBought` | Question sold | Marketplace page, notifications |
| `QuestionTransferred` | Free transfer | Activity feed |

### Fee Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `FeesAccumulated` | Creator earned fees | Profile page, earnings tracker |
| `FeesClaimed` | User claimed fees | Profile page, transaction history |

### Admin Events

| Event | Purpose | Frontend Use |
|-------|---------|--------------|
| `ContractPaused` | Emergency pause | Banner warning |
| `ContractUnpaused` | Resume operations | Clear warning |
| `GlobalStatsSnapshot` | Periodic stats dump | Analytics, charts |

---

### Key Model Differences

| Aspect | Hot Potato | Answer Shares |
|--------|------------|---------------|
| **Trading Unit** | Whole opinion ownership | Fractional shares |
| **Ownership** | 1 owner per opinion | Multiple shareholders per answer |
| **Pricing** | Fixed price changes | Bonding curve (price = poolValue/totalShares) |
| **Exit** | Must find buyer | Sell to pool anytime |
| **Per Question** | 1 current answer | Multiple competing answers |
| **Leading** | Current answer wins | Highest market cap answer wins |

---

## Phase 1: Core Data Layer (Priority: HIGH)

### 1.1 Enhanced Hooks
**Files to create/update in `src/hooks/`**

| Hook | Purpose | Status |
|------|---------|--------|
| `useQuestions.ts` | Paginated questions with search/filter | EXISTS - needs pagination |
| `useQuestion.ts` | Single question + leading answer | EXISTS |
| `useAnswers.ts` | All answers for a question | EXISTS |
| `useAnswer.ts` | Single answer details | NEW |
| `useUserPositions.ts` | User's positions across answers | EXISTS - needs enhancement |
| `useAllUserPositions.ts` | All positions for portfolio | NEW |
| `useLeaderboard.ts` | Leaderboard data | NEW |
| `useMarketStats.ts` | Platform-wide stats | NEW |
| `useUserStats.ts` | User profile stats | NEW |
| `useQuestionsByCreator.ts` | Questions by creator | EXISTS |
| `useTradeHistory.ts` | User's trade history (from events) | NEW |
| `usePriceHistory.ts` | Answer price history (from events) | NEW |

### 1.2 Types Enhancement
**Update `src/lib/contracts.ts`**

```typescript
// Add these interfaces
interface QuestionWithLeading extends Question {
  leadingAnswerId: bigint;
  leadingMarketCap: bigint;
  leadingAnswerText: string;
}

interface AnswerWithHolders extends Answer {
  holderCount: bigint;
  rank: number;
}

interface UserPortfolio {
  totalValue: bigint;
  totalCostBasis: bigint;
  totalPnL: bigint;
  positionCount: number;
  positions: PositionWithAnswer[];
}

interface TradeEvent {
  type: 'buy' | 'sell';
  answerId: bigint;
  shares: bigint;
  amount: bigint;
  price: bigint;
  timestamp: number;
  txHash: string;
}
```

---

## Phase 2: Home Page Enhancement

### Current State (shares app)
- Basic question grid
- Search by text
- Sort by hot/new/top
- Stats: volume, questions, answers

### Features to Add

| Feature | Hot Potato Source | Implementation |
|---------|------------------|----------------|
| Category filtering | `page.tsx` CategoryFilter | Add categories to contract or off-chain |
| Quality filter | `page.tsx` qualityThreshold | Filter by market cap threshold |
| Status badges (Hot/New/Trending) | `page.tsx` getBadges() | Calculate from volume/time/trades |
| Market stats cards | `page.tsx` MarketStats | Total market cap, 24h volume, traders |
| Pagination (100/page) | `page.tsx` pagination | Smart client/server pagination |
| Tab navigation | All Markets / Hot / New | Already have similar |

### New Components Needed
```
src/components/home/
├── MarketStatsBar.tsx      # Platform stats strip
├── CategoryFilter.tsx      # Category dropdown/pills
├── QualityFilter.tsx       # Min market cap filter
└── PaginationControls.tsx  # CMC-style pagination
```

### Execution Steps
1. [ ] Add market stats hook and component
2. [ ] Implement category system (contract or off-chain)
3. [ ] Add pagination with 100 items/page
4. [ ] Add status badge logic (Hot if >$100 vol, New if <24h, etc.)
5. [ ] Add quality threshold filter

---

## Phase 3: Question Detail Page Enhancement

### Current State
- Question header
- Answer list with buy/sell
- User positions per answer

### Features to Add

| Feature | Hot Potato Source | Implementation |
|---------|------------------|----------------|
| SEO metadata | `opinions/[id]/page.tsx` | Add generateMetadata() |
| Slug-based URLs | `/opinions/[id]/[slug]` | Add `[slug]` route |
| Answer ranking | Show rank badges | Sort by poolValue, add rank |
| Price charts | TradingChart component | Port chart component |
| Trade history | Events list | Parse SharesBought/Sold events |
| Share modal | Social sharing | Add share functionality |

### New Components Needed
```
src/components/questions/
├── QuestionHeader.tsx      # Enhanced header with SEO
├── AnswerRankBadge.tsx     # 1st/2nd/3rd badges
├── PriceChart.tsx          # Price history chart
└── TradeHistory.tsx        # Recent trades list
```

### Execution Steps
1. [ ] Add generateMetadata for SEO
2. [ ] Create `[id]/[slug]` route with redirect
3. [ ] Add price chart using recharts
4. [ ] Parse events for trade history
5. [ ] Add social share functionality

---

## Phase 4: Create Question Page Enhancement

### Current State
- Basic form with question + description
- Submit transaction

### Features to Add

| Feature | Hot Potato Source | Implementation |
|---------|------------------|----------------|
| Multi-step form | `/create` components | 3-step wizard |
| Character counters | Input validation | Add remaining char display |
| Category selection | CategorySelector | Add category picker |
| Preview step | ReviewStep | Show before submit |
| Success redirect | Navigate to question | Redirect on success |

### New Components Needed
```
src/components/create/
├── StepIndicator.tsx       # Step 1/2/3 progress
├── QuestionStep.tsx        # Question + description
├── CategoryStep.tsx        # Category selection
├── ReviewStep.tsx          # Confirm before submit
└── CreateSidebar.tsx       # Progress summary
```

### Execution Steps
1. [ ] Create step indicator component
2. [ ] Split form into 3 steps
3. [ ] Add category selection (if contract supports)
4. [ ] Add review step with all data
5. [ ] Improve success state with redirect

---

## Phase 5: Admin Dashboard

### Features to Implement

| Feature | Hot Potato Source | Implementation |
|---------|------------------|----------------|
| Stats cards | Total questions, volume, status | Read from contract |
| Moderation tab | Deactivate/flag answers | Use MODERATOR_ROLE |
| Settings tab | Fee updates, max answers | Use ADMIN_ROLE |
| Roles tab | Grant/revoke roles | AccessControl functions |
| Pause control | Emergency pause | pause()/unpause() |

### Page Structure
```
src/app/admin/
├── page.tsx                # Main admin dashboard
└── components/
    ├── AdminStats.tsx      # Stats cards
    ├── ModerationTab.tsx   # Moderate answers
    ├── SettingsTab.tsx     # Contract settings
    ├── RolesTab.tsx        # Role management
    └── ContractsTab.tsx    # Address updates
```

### Contract Functions to Wire
```solidity
// Read
paused()
platformFeeBps()
creatorFeeBps()
questionCreationFee()
answerProposalStake()
maxAnswersPerQuestion()

// Write (ADMIN_ROLE)
pause()
unpause()
setFees(platformBps, creatorBps)
setQuestionCreationFee(fee)
setAnswerProposalStake(stake)
setMaxAnswers(max)
setTreasury(address)

// Write (MODERATOR_ROLE)
deactivateQuestion(id)
reactivateQuestion(id)
deactivateAnswer(id)
reactivateAnswer(id)
flagAnswer(id, reason)
```

### Execution Steps
1. [ ] Create admin page with role check
2. [ ] Add stats cards component
3. [ ] Implement moderation tab
4. [ ] Implement settings tab
5. [ ] Implement roles tab
6. [ ] Test all admin functions

---

## Phase 6: Profile Page Enhancement

### Current State (shares app)
- Basic portfolio with stats
- Positions list
- Fee claiming

### Features to Add from Hot Potato

| Feature | Source | Implementation |
|---------|--------|----------------|
| Trader summary card | `profile/components/trader-summary.tsx` | Port component |
| Category breakdown | `profile/components/category-breakdown.tsx` | Port component |
| Creator stats | `profile/components/creator-stats.tsx` | Port component |
| Badge system | `profile/components/badge-showcase.tsx` | Design badges |
| 5-tab layout | Overview/Positions/Trading/Pools/Badges | Implement tabs |
| P&L calculations | Position tracking | Calculate from events |
| Win rate | Trade analysis | Track profitable trades |

### New Components Needed
```
src/app/profile/
├── page.tsx                # Enhanced profile
└── components/
    ├── ProfileHeader.tsx   # Avatar, address, ENS
    ├── TraderSummary.tsx   # Stats card
    ├── CategoryBreakdown.tsx
    ├── CreatorStats.tsx
    ├── PositionsTab.tsx    # All positions
    ├── TradingTab.tsx      # Trade history
    ├── BadgesTab.tsx       # Achievements
    └── OverviewTab.tsx     # Summary view
```

### Execution Steps
1. [ ] Enhance profile header with ENS
2. [ ] Add trader summary calculations
3. [ ] Create positions tab with P&L
4. [ ] Create trading history from events
5. [ ] Design and implement badge system
6. [ ] Add public profile route `/profile/[address]`

---

## Phase 7: Leaderboard Page

### Features to Implement

| Feature | Hot Potato Source | Implementation |
|---------|------------------|----------------|
| Ranking types | Earnings/Volume/Win Rate/Trades | Calculate from events |
| Time filters | All time/30d/7d/24h | Filter by timestamp |
| Category filter | By category trades | Track per-category |
| Platform stats | Aggregate stats | Total traders, volume |
| User rank badge | Current user position | Highlight if connected |

### Data Requirements
- Parse all SharesBought/SharesSold events
- Track per-user: volume, P&L, trade count
- Calculate win rate (profitable sells / total sells)

### New Files
```
src/app/leaderboard/
├── page.tsx
└── components/
    ├── LeaderboardTable.tsx
    ├── LeaderboardStats.tsx
    ├── LeaderboardFilters.tsx
    └── UserRankBadge.tsx
```

### Execution Steps
1. [ ] Create event parsing hook
2. [ ] Build leaderboard data aggregation
3. [ ] Create leaderboard table with sorting
4. [ ] Add time period filters
5. [ ] Add user rank badge

---

## Phase 8: Watchlist Page

### Features to Implement
- Local storage + per-wallet sync
- Add/remove questions from watchlist
- Price change tracking since added
- Quick navigation to questions

### New Files
```
src/app/watchlist/
├── page.tsx
└── components/
    ├── WatchlistCard.tsx
    └── EmptyWatchlist.tsx

src/hooks/
└── useWatchlist.ts         # Local storage hook
```

### Execution Steps
1. [ ] Create useWatchlist hook with localStorage
2. [ ] Add bookmark button to QuestionCard
3. [ ] Create watchlist page with cards
4. [ ] Track price at time of adding

---

## Phase 9: Marketplace (Question Trading)

### Concept Adaptation
Hot Potato: Buy/sell question ownership for royalties
Answer Shares: Same concept - trade question creator rights

### Features
- List questions for sale
- Buy listed questions
- Transfer creator fee rights
- Royalty display (creator earnings)

### Contract Requirements
**Need to add to AnswerSharesCore:**
```solidity
// Question marketplace
mapping(uint256 => uint256) public questionListingPrice;  // 0 = not listed
mapping(uint256 => address) public questionOwner;         // tracks current owner

function listQuestion(uint256 questionId, uint256 price) external;
function buyQuestion(uint256 questionId) external;
function cancelListing(uint256 questionId) external;
function transferQuestion(uint256 questionId, address to) external;  // free transfer
```

### Execution Steps
1. [ ] Evaluate if marketplace needed for MVP
2. [ ] If yes, add contract functions
3. [ ] Create marketplace page
4. [ ] Add listing/buying modals

---

## Phase 10: Pools System

### Concept Adaptation
Hot Potato: Pool funds to change the current answer
Answer Shares: Pool funds to boost an answer's market cap

### Mechanics Difference
- Hot Potato: Pool buys the opinion when threshold met
- Answer Shares: Pool buys shares collectively, distributes to contributors

### Features
- Create pool targeting an answer
- Contribute to pool
- Execute pool (buy shares)
- Distribute shares to contributors
- Early withdrawal with penalty

### Contract Requirements
**Need PoolManager contract or add to AnswerSharesCore:**
```solidity
struct Pool {
    uint256 answerId;
    uint256 targetAmount;
    uint256 currentAmount;
    uint48 deadline;
    bool executed;
    mapping(address => uint256) contributions;
}

function createPool(uint256 answerId, uint256 target, uint48 deadline) external;
function contributeToPool(uint256 poolId, uint256 amount) external;
function executePool(uint256 poolId) external;
function withdrawFromPool(uint256 poolId) external;  // with penalty if not expired
```

### Execution Steps
1. [ ] Design pool mechanics for shares model
2. [ ] Create/adapt PoolManager contract
3. [ ] Create pools list page
4. [ ] Create pool detail page
5. [ ] Add contribution/withdrawal modals

---

## Execution Priority & Timeline

### Week 1-2: Foundation
- [ ] Phase 1: Enhanced hooks and types
- [ ] Phase 2: Home page enhancements
- [ ] Phase 3: Question detail improvements

### Week 3: Core Features
- [ ] Phase 4: Create page wizard
- [ ] Phase 5: Admin dashboard
- [ ] Phase 6: Profile enhancements

### Week 4: Community Features
- [ ] Phase 7: Leaderboard
- [ ] Phase 8: Watchlist
- [ ] Basic analytics

### Week 5+: Advanced Features
- [ ] Phase 9: Marketplace (if needed)
- [ ] Phase 10: Pools system
- [ ] Mobile optimization
- [ ] Performance tuning

---

## Files to Port from Hot Potato

### Direct Port (minimal changes)
```
apps/web/src/components/ui/*           → Already copied
apps/web/src/lib/utils.ts              → Already exists
```

### Adapt & Port
```
apps/web/src/app/page.tsx              → Adapt for shares model
apps/web/src/app/admin/*               → Adapt for new contract
apps/web/src/app/profile/*             → Adapt for positions
apps/web/src/app/leaderboard/*         → Port with new data model
apps/web/src/app/watchlist/*           → Port directly
apps/web/src/components/trading/*      → Already adapted
```

### New Implementation Needed
```
Event parsing for trade history
Bonding curve price calculations
Share distribution logic
Pool mechanics for shares model
```

---

## Summary Checklist

### Must Have (MVP)
- [x] Home page with questions grid
- [x] Question detail with answers
- [x] Buy/sell shares modals
- [x] Create question flow
- [x] Basic portfolio
- [x] Fee claiming
- [ ] Admin dashboard
- [ ] Enhanced profile
- [ ] Leaderboard

### Should Have
- [ ] SEO metadata
- [ ] Price charts
- [ ] Trade history
- [ ] Category filtering
- [ ] Watchlist
- [ ] Public profiles

### Nice to Have
- [ ] Marketplace (question trading)
- [ ] Pools system
- [ ] Badge/achievement system
- [ ] Category breakdown analytics
- [ ] Advanced filtering

---

## Contract Deployment Checklist

Before frontend completion:
- [ ] Deploy AnswerSharesCore to testnet
- [ ] Update contract addresses in `contracts.ts`
- [ ] Test all read functions
- [ ] Test all write functions
- [ ] Deploy to mainnet
- [ ] Verify on BaseScan
