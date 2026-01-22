# UX Enhancement Plan - OpinionMarketCap dApp

## Executive Summary

**Goal**: Boost retention (users return to trade) and MAU via fluid UX
**Priorities**: 1-3 for core UX, 4-6 for advanced features
**Analytics**: Mixpanel integration for KPI tracking

---

## Existing vs New Features Matrix

| Feature | Existing Code | Status | Action Required |
|---------|---------------|--------|-----------------|
| Onboarding Tutorial | `UserEducationModal.tsx` | Partial | ENHANCE - Add wizard flow, simulation |
| Personal Dashboard | `/profile` page | Complete | ENHANCE - Add notifications |
| Leaderboard | `/leaderboard` page | Basic | ENHANCE - Add category filters |
| Search & Filters | Homepage components | Complete | POLISH - Minor UX improvements |
| Watchlist | `/watchlist` page | Complete | KEEP - Already works well |
| Pools Management | `/pools` page | Complete | POLISH - One-click contribute |
| Gamification/Badges | Rank badge only | Minimal | NEW - Build badge system |
| Analytics | None | Missing | NEW - Mixpanel integration |
| Notifications | Toast only | Missing | NEW - Push notifications |

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

#### 1.3 Enhanced Leaderboard with Categories
**File**: `src/app/leaderboard/page.tsx` (ENHANCE)

**Current State**: Basic global leaderboard exists

**Enhancements**:
- [ ] Add category filter dropdown (top by category)
- [ ] Time period selector (24h, 7d, 30d, All-time)
- [ ] Multiple ranking types:
  - By earnings (current)
  - By ROI %
  - By volume traded
  - By questions created
- [ ] User comparison feature ("Compare with...")
- [ ] Share rank to social media

**Modified Files**:
```
src/app/leaderboard/page.tsx           # Add filters
src/components/leaderboard/
├── LeaderboardFilters.tsx             # NEW - Filter UI
├── CategoryLeaderboard.tsx            # NEW - Category-specific
└── LeaderboardTable.tsx               # ENHANCE - Add columns
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

#### 2.2 Pools UX Improvements
**Files**: `/pools` page (POLISH)

**Current State**: Full pool system works

**Enhancements**:
- [ ] One-click contribute with preset amounts (10, 50, 100 USDC)
- [ ] Progress bar animation on contribution
- [ ] Contributor avatars (ENS/address)
- [ ] Pool deadline countdown
- [ ] Success celebration animation on threshold reached

**KPIs**:
- Pools created > 10/week
- Avg contribution > 200 USDC
- Success rate > 70%

---

### Phase 3: Gamification (Priority 5)

#### 3.1 Badge & Achievement System
**Files**: `src/components/gamification/` (NEW)

**Current State**: Only rank badge exists

**New Badge Categories**:
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
