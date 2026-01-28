# UX Enhancement Plan - OpinionMarketCap dApp

## Executive Summary

**Goal**: Boost retention (users return to trade) and MAU via fluid UX
**Priorities**: 1-3 for core UX, 4-6 for advanced features
**Analytics**: Mixpanel integration for KPI tracking

---

## Existing vs New Features Matrix

| Feature | Existing Code | Status | Action Required |
|---------|---------------|--------|-----------------|
| Onboarding Tutorial | `OnboardingWizard.tsx` | ✅ DONE | 6-step interactive wizard with simulation |
| Personal Dashboard | `/profile` page | Complete | ENHANCE - Add notifications |
| Leaderboard | `/leaderboard` page | ✅ DONE | Category filters, ranking types, time periods |
| Search & Filters | Homepage components | Complete | POLISH - Minor UX improvements |
| Watchlist | `/watchlist` page | Complete | KEEP - Already works well |
| Pools Management | `/pools` page | ✅ DONE | Demo mode, animations, confetti celebration |
| Gamification/Badges | `BadgeDisplay.tsx` | ✅ DONE | 25 badges, XP system, level progression |
| Analytics | `lib/analytics.ts` | ✅ DONE | Mixpanel integration with all events |
| Notifications | `NotificationCenter.tsx` | ✅ DONE | In-app notifications with preferences |

---

## Implementation Plan

### Phase 1: Core UX (Priority 1-3)

#### 1.1 Interactive Onboarding Wizard
**File**: `src/components/onboarding/OnboardingWizard.tsx` (NEW)

**Current State**: `UserEducationModal` exists with steps but is a simple modal

**Enhancements**:
- [ ] Convert to full-screen wizard with progress indicator
- [ ] Step 1: Connect Wallet (with wallet selection guide)
- [ ] Step 2: Explore opinions (interactive tour of homepage)
- [ ] Step 3: Simulate a trade (gas-free mock transaction)
- [ ] Step 4: Create your first opinion (guided creation)
- [ ] Mobile-first responsive design
- [ ] Skip option with "Don't show again"
- [ ] Completion callback to track in analytics

**New Files**:
```
src/components/onboarding/
├── OnboardingWizard.tsx        # Main wizard component
├── steps/
│   ├── WelcomeStep.tsx         # Welcome + wallet connect
│   ├── ExploreStep.tsx         # Interactive tour
│   ├── SimulateTradeStep.tsx   # Gas-free simulation
│   └── CreateOpinionStep.tsx   # Guided creation
├── OnboardingProgress.tsx      # Progress bar
└── useOnboarding.ts            # State management hook
```

**KPIs**:
- Completion rate > 80%
- Time to first action < 1min
- D1 retention > 40%

---

#### 1.2 Notification System
**Files**: `src/components/notifications/` (NEW)

**Current State**: Only toast notifications exist (`sonner`)

**Enhancements**:
- [ ] Create notification center in navbar
- [ ] Real-time trade alerts ("Your opinion was traded!")
- [ ] Pool milestone alerts ("Pool 80% funded!")
- [ ] Leaderboard rank changes
- [ ] New answer submissions on owned questions
- [ ] WalletConnect push integration (optional)
- [ ] Notification preferences in profile

**New Files**:
```
src/components/notifications/
├── NotificationCenter.tsx      # Dropdown in navbar
├── NotificationItem.tsx        # Individual notification
├── NotificationBadge.tsx       # Unread count badge
├── NotificationPreferences.tsx # Settings component
└── useNotifications.ts         # Hook for notification state
```

**Backend Integration**:
- Listen to on-chain events via existing Alchemy webhook
- Store notifications in localStorage (or backend if available)
- Mark as read functionality

**KPIs**:
- DAU +30%
- Sessions per user > 3/day

---

#### 1.3 Enhanced Leaderboard with Categories ✅ DONE
**File**: `src/app/leaderboard/page.tsx` (ENHANCED)

**Status**: Implemented January 22, 2025

**Completed Features**:
- [x] Add category filter dropdown (21 categories)
- [x] Time period selector (24h, 7d, 30d, All-time)
- [x] Multiple ranking types:
  - By Total Earnings
  - By ROI %
  - By Volume Generated
  - By Questions Created
- [ ] User comparison feature ("Compare with...") - Future
- [ ] Share rank to social media - Future

**Files Created/Modified**:
```
src/app/leaderboard/page.tsx                    # Added filter state management
src/app/leaderboard/components/
├── LeaderboardFilters.tsx                      # NEW - Filter UI
├── LeaderboardStats.tsx                        # ENHANCED - Category-aware stats
└── LeaderboardTable.tsx                        # ENHANCED - Accept filters
src/hooks/useLeaderboardData.ts                 # ENHANCED - Category filtering, ranking types
```

**KPIs**:
- Leaderboard views > 50% of sessions

---

### Phase 2: Discovery & Engagement (Priority 3-4)

#### 2.1 Search & Filter Polish
**Files**: Homepage components (POLISH)

**Current State**: Search, filters, sorting all work

**Minor Enhancements**:
- [ ] Sticky search bar on scroll
- [ ] Recent searches dropdown
- [ ] "Clear all filters" button
- [ ] Save filter presets
- [ ] Improved card design with key metrics visible

**KPIs**:
- Search usage > 60% sessions
- Bounce rate < 30%

---

#### 2.2 Pools UX Improvements ✅ DONE
**Files**: `/pools` page (ENHANCED)

**Status**: Implemented January 24, 2025

**Completed Features**:
- [x] Percentage-based contribution slider (1-100% of remaining)
- [x] Quick preset buttons (25%, 50%, 75%, 100%)
- [x] Progress bar animation with glow effects
- [x] Success celebration animation with confetti
- [x] Demo mode to preview UX without 100+ USDC questions
- [ ] Contributor avatars (ENS/address) - Future
- [ ] Pool deadline countdown - Future

**Files Created/Modified**:
```
src/app/pools/page.tsx                              # Added demo mode toggle
src/app/pools/components/
├── DemoPoolCard.tsx                                # NEW - Demo with mock data
└── JoinPoolModal.tsx                               # ENHANCED - Slider contribution
```

**KPIs**:
- Pools created > 10/week
- Avg contribution > 200 USDC
- Success rate > 70%

---

### Phase 3: Gamification (Priority 5)

#### 3.1 Badge & Achievement System ✅ DONE
**Files**: `src/components/gamification/` (IMPLEMENTED)

**Status**: Implemented January 24, 2025

**Completed Features**:
- [x] 25 badges across 4 categories (Trading, Creation, Community, Leaderboard)
- [x] 4 rarity levels (Common, Rare, Epic, Legendary)
- [x] XP reward system with 10 progression levels
- [x] Badge progress tracking with percentage completion
- [x] Badge unlock detection and notification toasts
- [x] Achievement modal with detailed progress
- [x] Profile page integration with "Badges" tab
- [x] Compact badge showcase for quick view

**Files Created**:
```
src/components/gamification/
├── index.ts                            # Export file
├── useBadges.ts                        # Main hook for badge state
├── BadgeDisplay.tsx                    # Grid display, showcase, level UI
├── BadgeModal.tsx                      # Detail modal, achievement unlock
├── BadgeNotification.tsx               # Toast notifications
└── badges/
    ├── badgeDefinitions.ts             # 25 badges, XP levels, helpers
    ├── badgeLogic.ts                   # Unlock conditions, progress
    └── badgeIcons.tsx                  # 25 custom SVG icons
```

**Badge Categories**:
```
TRADING BADGES:
- First Trade        - Complete your first trade
- Volume Master      - Trade 1000+ USDC total
- Winning Streak     - 5 profitable trades in a row
- Diamond Hands      - Hold a position for 30+ days

CREATION BADGES:
- First Mint         - Create your first opinion
- Prolific Creator   - Create 10+ opinions
- Trending Topic     - Have an opinion go "Hot"
- Royalty King       - Earn 100+ USDC in creator fees

COMMUNITY BADGES:
- Pool Pioneer       - Create your first pool
- Whale Contributor  - Contribute 500+ USDC to pools
- Social Butterfly   - Share 5 opinions on social media
- Early Adopter      - Joined before X date

LEADERBOARD BADGES:
- Top 10             - Reach top 10 on leaderboard
- Category Champion  - #1 in any category
- Rising Star        - Biggest rank improvement in 7 days
```

**Implementation**:
```
src/components/gamification/
├── BadgeDisplay.tsx            # Show earned badges
├── BadgeModal.tsx              # Badge details + progress
├── BadgeNotification.tsx       # "You earned a badge!" toast
├── AchievementProgress.tsx     # Progress toward badges
├── badges/
│   ├── badgeDefinitions.ts     # Badge metadata
│   ├── badgeLogic.ts           # Unlock conditions
│   └── badgeIcons.tsx          # Badge SVG icons
└── useBadges.ts                # Hook for badge state
```

**On-Chain Integration**:
- Listen to events: `AnswerSubmitted`, `QuestionCreated`, `PoolContributed`
- Track cumulative stats in localStorage or backend
- Optional: Badge NFTs for top achievements

**KPIs**:
- Badge earners > 50% users
- MAU +25%
- Repeat trades > 60%

---

### Phase 4: Analytics & Trust (Priority 6)

#### 4.1 Mixpanel Integration
**Files**: `src/lib/analytics.ts` (NEW)

**Events to Track**:
```typescript
// Onboarding
track('onboarding_started')
track('onboarding_step_completed', { step: 1 })
track('onboarding_completed')
track('onboarding_skipped')

// Trading
track('trade_initiated', { opinionId, amount })
track('trade_completed', { opinionId, amount, price })
track('trade_failed', { reason })

// Creation
track('opinion_create_started')
track('opinion_created', { opinionId, category })

// Engagement
track('page_viewed', { page })
track('search_performed', { query })
track('filter_applied', { filter })
track('watchlist_added', { opinionId })
track('leaderboard_viewed', { category })
track('badge_earned', { badgeId })

// Pools
track('pool_created', { poolId })
track('pool_contributed', { poolId, amount })
```

**User Properties**:
```typescript
identify(address, {
  wallet_type: 'metamask',
  first_seen: timestamp,
  total_trades: count,
  total_volume: amount,
  badges_earned: count,
  referral_source: source
})
```

**Dashboard KPIs**:
- Tutorial completion rate
- Time to first action
- D1/D7/D30 retention
- DAU/MAU
- Trades per user
- Search usage rate

---

#### 4.2 Trust & Security Display
**Files**: `src/components/trust/` (NEW)

**Components**:
- [ ] Audit badge in footer ("Smart contracts audited")
- [ ] Security tips tooltip on wallet connect
- [ ] Personal profit/loss summary in profile
- [ ] Transaction success rate display
- [ ] Network health indicator

**New Files**:
```
src/components/trust/
├── AuditBadge.tsx              # "Audited by X" display
├── SecurityTips.tsx            # Wallet safety tips
├── ProfitSummary.tsx           # Personal analytics widget
└── NetworkHealth.tsx           # System status indicator
```

**Existing Enhancement**:
- Profile page: Add "Your Profits: +X USDC" card prominently

**KPIs**:
- Trust score surveys > 4/5
- Error rate < 1%
- Wallet connects > 95% success

---

## File Structure Summary

```
src/
├── components/
│   ├── onboarding/           # NEW - Interactive wizard
│   ├── notifications/        # NEW - Notification system
│   ├── gamification/         # NEW - Badges & achievements
│   ├── trust/                # NEW - Security displays
│   └── leaderboard/          # ENHANCE - Category filters
├── hooks/
│   ├── useOnboarding.ts      # NEW
│   ├── useNotifications.ts   # NEW
│   └── useBadges.ts          # NEW
├── lib/
│   └── analytics.ts          # NEW - Mixpanel
└── app/
    ├── leaderboard/          # ENHANCE
    └── profile/              # ENHANCE
```

---

## Implementation Order

### Sprint 1 (Core UX)
1. Mixpanel setup (foundation for all KPIs)
2. Onboarding wizard enhancement
3. Notification system

### Sprint 2 (Engagement)
4. Leaderboard category filters
5. Search/filter polish
6. Pools UX improvements

### Sprint 3 (Gamification)
7. Badge system implementation
8. Achievement tracking
9. Badge display in profile

### Sprint 4 (Trust & Polish)
10. Trust badges and security display
11. Personal analytics enhancement
12. Mobile responsiveness audit

---

## Dependencies

**NPM Packages to Add**:
```json
{
  "mixpanel-browser": "^2.x",      // Analytics
  "framer-motion": "^10.x",        // Animations (may exist)
  "react-joyride": "^2.x",         // Interactive tours
  "@radix-ui/react-popover": "^1.x" // Notification dropdown
}
```

---

## Success Metrics Summary

| Feature | Primary KPI | Target |
|---------|-------------|--------|
| Onboarding | Completion rate | > 80% |
| Onboarding | Time to first action | < 1 min |
| Onboarding | D1 Retention | > 40% |
| Dashboard | DAU increase | +30% |
| Dashboard | Sessions/user | > 3/day |
| Leaderboard | Views per session | > 50% |
| Search | Usage rate | > 60% sessions |
| Search | Bounce rate | < 30% |
| Pools | Created per week | > 10 |
| Pools | Avg contribution | > 200 USDC |
| Pools | Success rate | > 70% |
| Badges | Earners | > 50% users |
| Badges | MAU increase | +25% |
| Badges | Repeat trades | > 60% |
| Trust | Survey score | > 4/5 |
| Trust | Error rate | < 1% |
| Trust | Wallet connects | > 95% |

---

## Notes

### What Already Exists (No Duplication)
- ✅ Profile dashboard with portfolio stats, positions, fees, history
- ✅ Basic leaderboard with global rankings
- ✅ Search bar with category filters and sorting
- ✅ Watchlist functionality
- ✅ Pools create/join with progress tracking
- ✅ Safety modals and transaction warnings
- ✅ UserEducationModal (base for onboarding)

### What Needs Enhancement
- 🔄 Onboarding: Convert modal to wizard with simulation
- 🔄 Leaderboard: Add category filters
- 🔄 Profile: Add notification preferences, profit summary
- 🔄 Pools: One-click contribute UX

### What's Completely New
- 🆕 Notification system with real-time alerts
- 🆕 Badge/achievement system
- 🆕 Mixpanel analytics integration
- 🆕 Audit/trust badges

---

## Product Roadmap - Mass Adoption Features

**Goal**: Features that drive user acquisition, increase time on dApp, and improve retention.
**Last Updated**: January 28, 2025

### Legend
- ✅ = Already implemented
- 🔄 = Partially implemented
- ❌ = Not yet implemented

---

### 1. User Acquisition - Social Proof & Viral Loops

| Feature | Status | Notes |
|---------|--------|-------|
| **Opinion Cards for Social Sharing** | ❌ | Auto-generated OG images with opinion stats |
| One-click share to Twitter/Farcaster | ❌ | With tracking |
| "I'm bullish on [X] at $[price]" templates | ❌ | Pre-filled share messages |
| Profit/loss sharing after position closes | ❌ | Bragging rights mechanic |
| **Referral Program** | 🔄 | `ReferralDashboard.tsx` exists |
| Tiered rewards (5% → 10% → 15%) | ❌ | Escalating referral bonuses |
| Referral codes in opinion URLs | ❌ | Embedded tracking |
| Weekly referral leaderboard | ❌ | With bonus USDC prizes |

---

### 2. User Acquisition - Simplified Onboarding

| Feature | Status | Notes |
|---------|--------|-------|
| **Guest Mode / Demo Trading** | 🔄 | Demo mode exists for pools only |
| Paper trade without wallet | ❌ | Browse and simulate trades |
| "If you bought at $2, you'd be up 340%" | ❌ | Potential P&L display |
| One-click wallet creation | ❌ | Coinbase Smart Wallet, Privy |
| **Fiat On-Ramp Integration** | ❌ | MoonPay/Transak partnership |
| "Buy $50 USDC" button in trading modal | ❌ | Direct USDC purchase |

---

### 3. Engagement - Notifications & Alerts

| Feature | Status | Notes |
|---------|--------|-------|
| **Notification System** | ✅ | `NotificationCenter.tsx` implemented |
| Real-time trade alerts | ✅ | "Your opinion was traded!" |
| Pool milestone alerts | ✅ | "Pool 80% funded!" |
| Leaderboard rank changes | ✅ | Implemented |
| New answer submissions | ✅ | On owned questions |
| Notification preferences | ✅ | In profile settings |
| **Price Alerts** | ❌ | "Notify me when [opinion] hits $X" |
| Daily digest email | ❌ | "Your opinions moved +$X today" |
| Telegram bot notifications | ❌ | Push via external channel |
| **Activity Feed** | ❌ | Real-time: "0x123... bought Answer #3" |
| Filter by followed users | ❌ | Social activity stream |

---

### 4. Engagement - Advanced Gamification

| Feature | Status | Notes |
|---------|--------|-------|
| **Badge System** | ✅ | 25 badges, 4 categories, 4 rarities |
| XP & Level System | ✅ | 10 progression levels |
| Badge unlock notifications | ✅ | Toast notifications |
| Profile badge display | ✅ | "Badges" tab in profile |
| **Daily Challenges** | ❌ | "Trade 3 opinions in Sports today" |
| Challenge rewards (XP/badges) | ❌ | Incentive for completion |
| Weekly prediction challenges | ❌ | With prize pools |
| **Streaks** | ❌ | 7-day trading streak bonuses |
| Streak multiplier on earnings | ❌ | Reward consistency |
| **Seasonal Competitions** | ❌ | Monthly trading tournaments |
| Category-specific competitions | ❌ | "DeFi Degen of the Month" |
| NFT trophies for winners | ❌ | On Base blockchain |

---

### 5. Discovery - Opinion Finding

| Feature | Status | Notes |
|---------|--------|-------|
| **Search & Filters** | ✅ | Homepage components complete |
| Category filtering | ✅ | 40 categories |
| Sorting options | ✅ | Price, volume, date |
| **Watchlist** | ✅ | `/watchlist` page works |
| Sticky search bar on scroll | ❌ | Minor UX polish |
| Recent searches dropdown | ❌ | Quick access |
| "Clear all filters" button | ❌ | Reset functionality |
| Save filter presets | ❌ | Custom saved views |
| **"For You" Algorithm** | ❌ | Personalized feed based on history |
| "Because you traded in Crypto..." | ❌ | Recommendation engine |
| Trending by category | ❌ | Not just overall trending |
| **Collections/Portfolios** | ❌ | "AI Stocks Bundle" - curated sets |
| User-created collections | ❌ | Shareable opinion groups |
| Index tracking | ❌ | Average performance of collection |

---

### 6. Social Layer

| Feature | Status | Notes |
|---------|--------|-------|
| **User Profiles** | 🔄 | `/profile` has portfolio stats |
| Trading stats (win rate, volume) | 🔄 | Basic stats exist |
| Favorite categories display | ❌ | Profile enhancement |
| **Follow System** | ❌ | See what top traders buy |
| Following/followers count | ❌ | Social graph |
| **Reputation Score** | ❌ | Based on prediction accuracy |
| **Comments & Discussion** | ❌ | Threaded comments on opinions |
| Upvote/downvote system | ❌ | Community moderation |
| Creator pinned comments | ❌ | Highlight top comment |
| Gas-free comments | ❌ | Off-chain with signatures |

---

### 7. Analytics Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| **Mixpanel Integration** | ✅ | `lib/analytics.ts` implemented |
| Onboarding tracking | ✅ | Completion, steps, skip |
| Trade tracking | ✅ | Initiated, completed, failed |
| Page views | ✅ | All pages tracked |
| **Portfolio Tracker** | 🔄 | Basic stats in profile |
| Total value display | 🔄 | Exists |
| P&L by opinion | ❌ | Detailed breakdown |
| Historical performance chart | ❌ | Over time visualization |
| "Your best trade" highlight | ❌ | Gamification element |
| Export to CSV | ❌ | For tax purposes |
| **Market Analytics** | ❌ | Volume by category over time |
| Price heatmaps | ❌ | Visual market overview |
| "Hot opinions" detection | ❌ | Algorithm-based |
| Creator performance rankings | ❌ | Public leaderboard |

---

### 8. Creator Tools

| Feature | Status | Notes |
|---------|--------|-------|
| **Opinion Creation** | ✅ | Full creation flow exists |
| 40 categories | ✅ | Implemented |
| Description validation | ✅ | Spam prevention added |
| **Creator Dashboard** | ❌ | Total fees earned, top opinions |
| Audience analytics | ❌ | Who's trading your opinions |
| **Creator Tiers** | ❌ | Verified badge, featured placement |
| Creator fee analytics | 🔄 | Basic in profile |
| **Opinion Templates** | ❌ | Pre-filled structures |
| "Poll style" opinions | ❌ | Multiple answers format |
| Time-locked opinions | ❌ | Resolves on date X |

---

### 9. Pools Enhancement

| Feature | Status | Notes |
|---------|--------|-------|
| **Pools Page** | ✅ | `/pools` complete |
| Demo mode | ✅ | Preview UX without 100+ USDC |
| Percentage slider | ✅ | 1-100% contribution |
| Quick presets (25/50/75/100%) | ✅ | One-click amounts |
| Progress bar animation | ✅ | With glow effects |
| Success confetti | ✅ | Celebration animation |
| Contributor avatars (ENS) | ❌ | Show who contributed |
| Pool deadline countdown | ❌ | Time remaining display |
| Pool chat/discussion | ❌ | Coordination channel |

---

### 10. Leaderboard Enhancement

| Feature | Status | Notes |
|---------|--------|-------|
| **Leaderboard Page** | ✅ | `/leaderboard` complete |
| Category filters | ✅ | 21 categories |
| Time period selector | ✅ | 24h, 7d, 30d, All-time |
| Multiple ranking types | ✅ | Earnings, ROI, Volume, Created |
| User comparison ("Compare with...") | ❌ | Side-by-side stats |
| Share rank to social media | ❌ | Brag about position |
| Mini-leaderboard widget | ❌ | On homepage |

---

### 11. Trust & Security

| Feature | Status | Notes |
|---------|--------|-------|
| Safety modals | ✅ | Transaction warnings exist |
| Wallet connect guidance | ✅ | In onboarding |
| Audit badge in footer | ❌ | "Smart contracts audited" |
| Security tips tooltip | ❌ | On wallet connect |
| Personal profit/loss summary | ❌ | Prominent in profile |
| Transaction success rate | ❌ | Display reliability |
| Network health indicator | ❌ | System status |
| **Transaction Error Handling** | ❌ | **HIGH PRIORITY** - Known issue |
| Parse revert reasons from contracts | ❌ | Decode on-chain error messages |
| User-friendly error mapping | ❌ | Map technical errors to plain English |
| Pre-submission validation | 🔄 | Some validation exists, needs expansion |
| Insufficient balance detection | ❌ | "You need X more USDC" |
| Insufficient allowance detection | ❌ | "Approve USDC first" prompt |
| Slippage/price change errors | ❌ | "Price changed, retry?" |
| Gas estimation failure handling | ❌ | Explain why tx would fail |
| Network congestion warnings | ❌ | "Base is busy, tx may be slow" |
| Transaction retry with guidance | ❌ | One-click retry with fix applied |

**Common Error Messages to Handle:**
```
Contract Error → User-Friendly Message
─────────────────────────────────────────────────────────
"Description too long"        → "Description must be under 120 characters"
"Invalid category"            → "Please select a valid category"
"Insufficient allowance"      → "Please approve USDC spending first"
"Price changed"               → "Price updated while you were reviewing. New price: $X"
"Opinion not active"          → "This opinion has been deactivated"
"Already answered"            → "You've already submitted an answer"
"Below minimum price"         → "Minimum price is 1 USDC"
"Above maximum price"         → "Maximum initial price is 100 USDC"
"Pool threshold not met"      → "Pool needs $X more to activate"
"Insufficient balance"        → "You need $X USDC (you have $Y)"
"execution reverted"          → "Transaction failed - [specific reason]"
```

**Files to Modify:**
```
apps/web/src/
├── lib/
│   └── errors.ts                           # NEW - Error parsing utilities
├── hooks/
│   └── useTransactionError.ts              # NEW - Error handling hook
├── components/
│   └── transaction/
│       ├── TransactionErrorModal.tsx       # NEW - User-friendly error display
│       └── PreSubmitValidation.tsx         # NEW - Client-side checks
├── app/
│   ├── create/components/forms/
│   │   └── review-submit-form.tsx          # MODIFY - Add error handling
│   └── opinion/[id]/
│       └── trade-modal.tsx                 # MODIFY - Add error handling
```

---

### 12. SEO & Discoverability

| Feature | Status | Notes |
|---------|--------|-------|
| **Basic Metadata** | 🔄 | Only title/description in layout.tsx |
| Title tag | ✅ | "OpinionMarketCap" |
| Meta description | ✅ | Basic description exists |
| **Open Graph Tags** | ❌ | For social sharing previews |
| og:title per page | ❌ | Dynamic titles |
| og:description per page | ❌ | Dynamic descriptions |
| og:image per opinion | ❌ | Auto-generated preview cards |
| og:type (website/article) | ❌ | Proper content typing |
| **Twitter Card Meta** | ❌ | For Twitter/X previews |
| twitter:card (summary_large_image) | ❌ | Large preview cards |
| twitter:site (@opinionmarketcap) | ❌ | Brand handle |
| twitter:creator per opinion | ❌ | Creator attribution |
| **Dynamic Metadata** | ❌ | Per-page generateMetadata() |
| Opinion pages `/opinion/[id]` | ❌ | Question as title, stats in description |
| Category pages `/category/[slug]` | ❌ | Category-specific metadata |
| Profile pages `/profile/[address]` | ❌ | User stats in metadata |
| Leaderboard `/leaderboard` | ❌ | "Top traders" metadata |
| **Technical SEO** | ❌ | Infrastructure |
| sitemap.xml generation | ❌ | Dynamic sitemap with all opinions |
| robots.txt | ❌ | Crawl directives |
| Canonical URLs | ❌ | Prevent duplicate content |
| Structured Data (JSON-LD) | ❌ | Rich snippets in search |
| Schema.org Product markup | ❌ | For opinion listings |
| BreadcrumbList schema | ❌ | Navigation in SERPs |
| **Performance (Core Web Vitals)** | 🔄 | Affects SEO ranking |
| LCP (Largest Contentful Paint) | ❌ | Target < 2.5s |
| FID (First Input Delay) | ❌ | Target < 100ms |
| CLS (Cumulative Layout Shift) | ❌ | Target < 0.1 |
| Image optimization (next/image) | 🔄 | Partially used |
| Font optimization | ✅ | next/font used |
| **URL Structure** | 🔄 | Clean URLs exist |
| SEO-friendly slugs | ❌ | `/opinion/will-eth-hit-5k` vs `/opinion/123` |
| Category URL hierarchy | ❌ | `/crypto/ethereum/opinions` |
| **Content SEO** | ❌ | |
| Landing page H1/H2 hierarchy | ❌ | Proper heading structure |
| Alt text for images | ❌ | Accessibility + SEO |
| Internal linking strategy | ❌ | Related opinions, categories |
| **Local/International** | ❌ | |
| hreflang tags | ❌ | If multi-language in future |
| **Monitoring** | ❌ | |
| Google Search Console setup | ❌ | Track indexing, errors |
| Bing Webmaster Tools | ❌ | Secondary search engine |
| SEO audit tool integration | ❌ | Lighthouse CI, Ahrefs |

**Priority SEO Tasks (High Impact):**
1. Add Open Graph + Twitter meta to layout.tsx
2. Create dynamic generateMetadata() for opinion pages
3. Generate sitemap.xml with all opinions
4. Add robots.txt
5. Implement auto-generated OG images for social sharing

**Files to Create:**
```
apps/web/src/app/
├── sitemap.ts                    # Dynamic sitemap generation
├── robots.ts                     # Robots.txt configuration
├── opengraph-image.tsx           # Default OG image
├── opinion/[id]/
│   ├── opengraph-image.tsx       # Dynamic OG image per opinion
│   └── page.tsx                  # Add generateMetadata()
├── category/[slug]/
│   └── page.tsx                  # Add generateMetadata()
└── lib/
    └── seo.ts                    # SEO utility functions
```

---

### 13. Moonshot Features (Future Vision)

| Feature | Status | Notes |
|---------|--------|-------|
| **Answer History & Hall of Fame** | ❌ | Track all previous answers + who submitted them |
| "Answer streak" tracking | ❌ | Longest time an answer stayed unchanged |
| Historical answer leaderboard | ❌ | Who held answers the longest |
| **Question Bundles** | ❌ | Create themed question packs (e.g., "Sports Hot Takes") |
| Bundle discount pricing | ❌ | Cheaper to create multiple related questions |
| **Mobile PWA** | ❌ | Install on home screen |
| Push notifications | ❌ | Native mobile experience |
| Offline portfolio browsing | ❌ | Cached data |
| Quick trade from notification | ❌ | Deep links |
| **$OMC Token** | ❌ | Future tokenomics |
| Fee discounts for holders | ❌ | Utility |
| Stake to earn platform fees | ❌ | Revenue share |
| Governance voting | ❌ | DAO structure |
| Creator grants | ❌ | Funded by DAO |
| **Cross-chain Expansion** | ❌ | Deploy on Arbitrum, Optimism |
| Same questions across chains | ❌ | Unified answer state via bridge |

---

### Prioritized Implementation Roadmap

| Phase | Features | Primary Goal |
|-------|----------|--------------|
| **Q1** | **Transaction error handling**, SEO foundation (OG tags, sitemap, robots), Social sharing cards | **Reduce drop-off, 10x organic traffic** |
| **Q2** | Price alerts, Dynamic OG images, Guest mode, Daily challenges | **10x signups, 3x DAU** |
| **Q3** | Streaks, User profiles/follow, Fiat on-ramp, Mobile PWA | **Mass market ready** |
| **Q4** | Market analytics, Question bundles, Token launch | **Sustainability** |

---

### Quick Wins (< 1 week each)

| Feature | Effort | Impact |
|---------|--------|--------|
| Social share buttons with pre-filled text | 2 days | High |
| "Trending" badge on high-volume opinions | 1 day | Medium |
| Email capture for price notifications | 3 days | High |
| "My Opinions" tab showing user's opinions | 2 days | Medium |
| Copy trading link with referral embedded | 1 day | High |
| Sticky search bar on scroll | 1 day | Low |
| **SEO: Add Open Graph meta to layout.tsx** | 1 day | **High** |
| **SEO: Create robots.txt** | 0.5 day | **High** |
| **SEO: Create basic sitemap.ts** | 1 day | **High** |
| **SEO: Add generateMetadata to opinion pages** | 2 days | **High** |
| **SEO: Google Search Console setup** | 0.5 day | **High** |
| **TX Errors: Create error parsing lib** | 2 days | **Critical** |
| **TX Errors: Add balance/allowance checks** | 1 day | **Critical** |
| **TX Errors: User-friendly error modal** | 2 days | **High** |

---

### Implementation Status Summary

| Category | Total Features | ✅ Done | 🔄 Partial | ❌ Not Started |
|----------|---------------|---------|------------|----------------|
| User Acquisition | 14 | 0 | 2 | 12 |
| Notifications | 11 | 6 | 0 | 5 |
| Gamification | 12 | 4 | 0 | 8 |
| Discovery | 13 | 4 | 0 | 9 |
| Social Layer | 10 | 0 | 2 | 8 |
| Analytics | 13 | 5 | 2 | 6 |
| Creator Tools | 9 | 3 | 1 | 5 |
| Pools | 9 | 6 | 0 | 3 |
| Leaderboard | 6 | 4 | 0 | 2 |
| Trust/Security | 16 | 2 | 1 | 13 |
| **SEO & Discoverability** | **32** | **3** | **4** | **25** |
| Moonshot | 16 | 0 | 0 | 16 |
| **TOTAL** | **161** | **37 (23%)** | **12 (7%)** | **112 (70%)** |
