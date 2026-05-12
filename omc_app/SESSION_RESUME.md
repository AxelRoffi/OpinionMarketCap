# Session Resume — Redesign the Dapp (`apps/web`) in Poster Arcade

**Last session:** May 12, 2026 — Landing redesign shipped to production.
**Next session goal:** Apply the same Poster Arcade design system to the Web3 trading app at `apps/web` (deployed at **app.opinionmarketcap.xyz**).

---

## Where the landing left off (done — for context)

The marketing landing at `opinionmarketcap.xyz` is fully redesigned, live in production, and serving the **Poster Arcade — "Sticker Confidence" (D3)** system. Auto-deploys from `apps/landing/` on push to `main`.

Commits:
```
80e5e6b docs(claude.md): continuous-reassessment rule for plugins/skills
bb3a265 Phase 6 — swap Poster Arcade into production routes
2417fb0 SectionTitle on every H2 + dual marquee ticker
89980ed Tier 3 motion — confetti, click wobble, halftone drift, line-stagger hero
83e0db7 Tier 2 motion + prediction-markets contrast on 3 pages
36520a1 Poster Arcade design system + 6 redesigned routes + Tier 1 motion
```

Verification of live landing: 14× `#FFE94D`, 88× `font-display`, 47× `rounded-sticker`, zero old dark-theme signatures.

---

## The mission for next session

**Apply Poster Arcade to the dapp at `apps/web`** so it looks and feels like a continuation of the landing — yellow canvas, ink borders, hard offset shadows, Inter Tight + JetBrains Mono — while keeping every Web3 flow working (wallet connect, trades, pools, claims, self-exit, vacant reclaim).

### Why this is harder than the landing

- **It's not marketing.** Every component is connected to live state (wagmi/viem hooks → on-chain V4 contracts on Base mainnet). One broken hook = a broken transaction.
- **51,778 lines of TS/TSX** across 38+ components, 25+ hooks, 20 routes.
- **Wallet UX is non-negotiable.** RainbowKit modal, connection persistence (custom localStorage wrapper in `wagmi.ts`), USDC approval flows, transaction error parsing — all working today; must keep working tomorrow.
- **Active users.** Unlike the landing (where downtime = lost click), the dapp has real positions on-chain. Breakage has financial consequences.

---

## Current state of `apps/web`

### Stack
- Next.js 15.1.11 · React 19 · App Router
- Tailwind (config likely in shared root, not local — check at start)
- Wagmi + viem + RainbowKit (connection persistence via custom `createPersistentStorage()` in `src/lib/wagmi.ts`)
- @tanstack/react-query
- framer-motion 12.16.0 (already installed — re-use Poster Arcade primitives directly)
- Base mainnet (`base` chain from `wagmi/chains`)

### Routes (20 pages)
```
/                      — main trading floor (1332 lines)
/opinions/[id]         — single-opinion trading page
/opinions/[id]/[slug]  — SEO-friendly opinion URL
/create                — mint a new question
/mint                  — alt mint flow
/pools                 — pools index (800 lines)
/pools/[id]            — single pool page
/portfolio             — user positions
/profile               — current user profile
/profile/[address]     — public profile
/marketplace           — question marketplace (528 lines)
/leaderboard           — top traders
/referrals             — referral program
/watchlist             — user watchlist
/admin                 — admin panel (1828 lines — biggest)
/admin/interact        — direct contract interaction
/simple, /debug, /debug-inline, /test-wallet  — dev tools (probably skip in redesign)
```

### Components (38 in `src/components` + many per-route)
**Foundational:** `GlobalNavbar`, `Footer`, `Navigation`, `ConnectButton`, `WalletConnectionStatus`, `WalletPersistence`, `WalletRoutePersistence`, `EnvironmentBanner`, `ErrorBoundary`
**Trading:** `TradingModal`, `SubmitAnswerModal`, `SimpleSubmitModal`, `EnhancedSubmitModal`, `ModernTradingTable`, `EnhancedTradingTable`, `PriceHistoryChart`
**Domain:** `AdminAccessChecker`, `AdminModerationPanel`, `AdultContentModal`, `ENSComponents`, `ModeratedAnswersNotification`, `TreasuryBalanceChecker`
**Subfolders:** `ui/`, `modals/`, `transaction/`, `gamification/`, `onboarding/`, `safety/`, `notifications/`, `education/`, `referral/`, `providers/`

### Hooks (25+)
`useUSDCBalance`, `useTradingFlow`, `useTransactionError`, `useAllOpinions`, `usePaginatedOpinions`, `useIndexedOpinions`, `useAnswerHistory`, `usePriceHistory`, `useOpinionEvents`, `useOpinionLockStatus`, `useSelfExit`, `useReclaimSlot`, `usePoolStaleExit`, `usePoolDetails`, `useCompletePool`, `usePoolCompletion`, `usePoolOwnerDisplay`, `useLeaderboardData`, `useEnhancedAnalytics`, `useAccurateTradeCounts`, `useReferral`, `useENSProfile`, `useContentFiltering`, `useTextLimits`, `useAnimatedCounter`

### Current visual signal
Old design uses `bg-gray-600/700`, `bg-slate-600/700`, `bg-zinc-600/700`, `from-purple`-style gradients. **This is the dark/glassmorphism vibe** — clean but generic. The Poster Arcade migration will replace this.

---

## The Poster Arcade design system (already shipped in `apps/landing/`)

Re-use is the right strategy. The primitives are battle-tested.

### Tokens (from `apps/landing/src/lib/design-tokens.ts`)
```ts
color   = { canvas: '#FFE94D', ink: '#15120D', pop: '#FF4D6B', cool: '#4DFFE0', paper: '#FFFFFF' }
shadow  = '5px 5px 0 #15120D' // hard, no blur
border  = '2.5px solid #15120D'
radius  = { card: 14, pill: 999 }
type    = Inter Tight 900 display · Inter Tight 600 body · JetBrains Mono 800 numbers
motion  = sticker slap-in spring · hover lift · CTA wobble · halftone drift · line-stagger headlines
```

### Reusable primitives in `apps/landing/src/app/_components/`
| Component | Purpose |
|---|---|
| `Sticker` | The atom. Tilted card with hard shadow + slap-in + hover lift + click wobble. |
| `CatChip` | Pop-in category pill. |
| `BtnPrimary`, `BtnSecondary`, `BtnNav` | Heartbeat + wobble buttons. |
| `Halftone` | Background dot overlay. |
| `Nav` | Top dashed-rule nav with ★ logo. |
| `SiteFooter` | 4-column links + risk disclaimer + ink bottom rail. |
| `HeroTitle`, `HeroEyebrow`, `HeroLede` | Hero typography with line-stagger entry. |
| `SectionTitle` | H2 with scroll-triggered line-stagger. |
| `AnimatedNumber`, `AnimatedBar` | Tick + bar-fill on viewport entry. |
| `LivePulse` | Pop-pink dot + expanding halo. |
| `Marquee` | Infinite horizontal scroll strip. |
| `ConfettiCTA` | Big CTA with on-click confetti burst. |
| `TakeCard` | Standard hot-take sticker (used in trending walls). |

**Decision for next session:** Should we (a) **copy** these primitives into `apps/web/src/components/poster-arcade/` so each app owns its own copy, or (b) **promote** them to a shared package (e.g. `packages/ui-poster-arcade/`) consumed by both apps? Recommend (b) — cleaner and lets us iterate once instead of twice. Decide on day one.

### Tailwind tokens to mirror in `apps/web`
The landing's `tailwind.config.ts` was extended with `canvas`, `ink`, `pop`, `cool`, `paper` colors + `sticker`/`cta` shadows + `font-display`/`font-mono` families + `rounded-sticker`. Copy that block into `apps/web`'s tailwind config (check root or app-local).

### Halftone CSS + marquee keyframes
Lives in `apps/landing/src/app/poster-arcade.css`. Copy verbatim into `apps/web`.

### Fonts
Loaded via `next/font` in the landing's root `layout.tsx`. Do the same in `apps/web/src/app/layout.tsx`.

---

## Suggested phasing for the dapp redesign

Mirror the landing approach: build in parallel under a feature flag, then swap.

### Phase 0 — Foundation (1 commit)
- Decide: shared package vs duplicated primitives. Recommend shared `packages/ui-poster-arcade/` (extract from landing, both apps consume).
- Add Tailwind tokens + Inter Tight + JetBrains Mono + `poster-arcade.css` to `apps/web`.
- Test that fonts + tokens load without breaking the existing dapp.

### Phase 1 — Audit + scope (no code)
- Walk the current dapp end-to-end and decide route-by-route what gets redesigned vs preserved.
- **Always-redesign:** `/`, `/opinions/[id]`, `/pools`, `/pools/[id]`, `/marketplace`, `/portfolio`, `/profile`, `/profile/[address]`, `/create`, `/leaderboard`, `/watchlist`, `/referrals`.
- **Keep functional, light restyle:** `/admin`, `/admin/interact` (admin tools — usability over beauty).
- **Skip:** `/simple`, `/debug`, `/debug-inline`, `/test-wallet`, `/mint` (legacy).
- Identify the 5–10 highest-traffic flows and prioritize them. The trading modal is THE money flow — start there.

### Phase 2 — Global chrome (1 commit)
- Replace `GlobalNavbar` + `Footer` with poster-arcade `Nav` + `SiteFooter`.
- Wallet connect button must stay functional. Re-style `ConnectButton` to look like a poster-arcade `BtnNav` while preserving RainbowKit modal behavior.
- `EnvironmentBanner` — restyle to a yellow/ink banner.

### Phase 3 — The main trading floor (`/`)
- Biggest file (1332 lines). Probably worth breaking up.
- Replace `ModernTradingTable` / `EnhancedTradingTable` with a Poster Arcade equivalent (rows as horizontal stickers).
- `LivePulse` for live-trade indicators. `AnimatedNumber` for stats.

### Phase 4 — The trading modal
- `TradingModal` is THE conversion surface. Keep all behavior, restyle entirely:
  - Inputs in poster-arcade style (ink borders, hard shadows)
  - Fee breakdown as a sticker
  - Approve/Submit buttons as `BtnPrimary` with confetti on success
- Trading-flow state from `useTradingFlow` — DO NOT MODIFY THE HOOK. Style only.

### Phase 5 — Pools (`/pools`, `/pools/[id]`)
- Pool list as sticker grid.
- Pool detail page with contribution progress bar (`AnimatedBar`).
- Pool stale-exit panel — already wired via `usePoolStaleExit`, restyle only.

### Phase 6 — Self-exit + reclaim panels
- Already-shipped V4 panels: `SelfExitPanel`, `VacantSlotReclaimPanel`, `PoolStaleExitPanel`.
- Marketing copy aligned with `/v2/page.tsx` Self-Exit card on landing — re-use the same explainer + worked example structure.

### Phase 7 — Portfolio + Profile
- Position list as sticker rows.
- Trader summary, category breakdown, creator stats — repurpose `Sticker` + `AnimatedNumber` + `AnimatedBar`.

### Phase 8 — Marketplace + Leaderboard
- Question list as sticker grid.
- Leaderboard rows.

### Phase 9 — Create / Mint
- Form fields as poster-arcade inputs.
- Live preview of the question as a `TakeCard`.
- Confetti on successful mint.

### Phase 10 — Admin (last, lightest touch)
- Keep functional. Add poster-arcade colors but don't add motion that obscures admin signals.

### Phase 11 — QA + ship
- Run on Base mainnet preview branch.
- Smoke-test every Web3 flow (connect, trade, pool, claim, self-exit, reclaim).
- Deploy to app.opinionmarketcap.xyz.

---

## V4 + V2 contract addresses (Base mainnet — for reference)

```
OpinionCoreV4       0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1
PoolManagerV2       0x34537a749F4b16E7542a59e5322338372A6a1E3c
FeeManager          0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA
OpinionAdmin        0x202Bc4E3aB50147212bee0506bF5f2B544333b5D
OpinionExtensionsV2 0x2eD0DC454043A768cB3FA7e480c41Be7b8954394
SelfExitLib         0x30c465f5772dc86555d37fE1376218Cbf79a4D93
PriceCalculator     0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7
ValidationLibrary   0x95a60C951BCB6E77644081f0501c9d2dDDfDb681
USDC (Base)         0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

Treasury            0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9
Admin               0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C
```

V4 feature flags are **FALSE in production** (admin must enable manually). Until enabled, self-exit + reclaim panels in the dapp will show but their on-chain actions will revert. Plan: enable flags via admin tx **after** the dapp redesign is deployed, so user-facing copy ships first.

---

## Hard rules for the next session

1. **Never modify the contract-facing hooks** (`useTradingFlow`, `useSelfExit`, `useReclaimSlot`, `usePoolStaleExit`, etc.) without verifying against the V4 contracts. Style-only is safe; logic changes need contract tests.
2. **Wallet connection persistence must keep working.** The `createPersistentStorage()` wrapper in `wagmi.ts` is load-bearing — leave it alone unless explicitly fixing a bug there.
3. **No silent removal of wallet flows.** RainbowKit modal must remain reachable from every page.
4. **Test on a wallet with USDC on Base** before declaring any trade flow "done."
5. **The dapp is already deployed.** Use the parallel-route-group strategy (like the landing's `(v2)/` group) so the live site keeps working until the swap.
6. **Plugin reassessment.** Per the new CLAUDE.md rule, drop/swap plugins as the work pivots. Likely trajectory: `brainstorming` → `gsd-map-codebase` / `Explore` → `writing-plans` → `frontend-design` + `vercel-nextjs` → `systematic-debugging` → `verification-before-completion`.

---

## To resume

```
cd /Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app
git checkout main && git pull
```

Read this file + `CLAUDE.md` (latest version has the new Tooling rules). Then say to Claude:

> Let's redesign the dapp at `apps/web` in the Poster Arcade design system. Start with Phase 0 (foundation + decide whether to share primitives via a package or duplicate from `apps/landing`). Read `SESSION_RESUME.md` for full context.

The session should:
1. Confirm the shared-package vs duplicate decision.
2. Inventory the dapp routes route-by-route.
3. Propose a sharper phasing plan (the one above is a starting point — refine based on actual code).
4. Get user sign-off before touching anything.

---

## Open questions for the next session to answer

- [ ] Shared `packages/ui-poster-arcade/` or duplicate in each app?
- [ ] Parallel `(v2)/` route group strategy (like the landing did), or feature-flag toggle, or yolo in-place edits?
- [ ] When to enable V4 feature flags in production (admin tx) — before or after dapp redesign deploys?
- [ ] Which routes to skip entirely (`/simple`, `/mint`, `/debug*`, `/test-wallet` — confirm)?
- [ ] Mobile-first redesign or desktop-first? (Landing was responsive top-down — dapp users skew mobile per trading apps; might need mobile-first this time.)
- [ ] How to handle the admin panel — keep functional with light restyle, or full redesign?
