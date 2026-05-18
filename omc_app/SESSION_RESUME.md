# Session Resume — Post-Parity-Round

**Last session ended:** May 18, 2026 — explicit user wrap.
**Status:** 13 commits shipped to `main` over one session, all auto-deployed via Vercel. **`tsc` clean. Untested with a real wallet on prod.** The Poster Arcade redesign is now the production dapp with no remaining mock data on live surfaces and the V4 contract fully wired (mint · take · reclaim · selfExit · pool create + join · list/buy/cancel questions · claim fees).

---

## What shipped (this session's commits)

```
9b3039f  feat(web): claim-fees panel on /profile/[address] (self view)
3c1aef3  feat(web): /tutorial — Poster Arcade tutorial + nav tab
2c4bf3f  fix(web): strip mock data from every live surface
bae85e0  feat(web): /listings page + LISTINGS nav tab
34cac2e  feat(web): question marketplace — list / buy / cancel
3d98cf8  feat(web): /pools/new — create-pool flow wired to V2 PoolManager
e2bddfc  fix(web): /create category picker uses the chain whitelist
c66c0c9  feat(web): show + link every 0x address across the app
c8e8fc4  feat(web): KingPanel — V4 self-exit UI for the current owner
1acf8a2  feat(web): wire /leaderboard to on-chain data
8b0e30a  fix(web): restore /mint → /create permanent redirect
2cb1832  feat(web): on-chain category labels + canonical slug URL
9f740eb  feat(web): wire V4 reclaimVacantSlot into TradeSlip
17735e1  feat(web): Poster Arcade chrome + palette on every route
```

### What each commit did

| Commit | Subject |
|---|---|
| `17735e1` | Moved `/admin` + dev routes into `(poster)/` group; color-mapped admin to Poster palette; stripped legacy `GlobalNavbar`/`Footer` chrome from `client-layout.tsx` |
| `9f740eb` | Wired `useReclaimSlot` into `TradeSlip` — vacant slots now route through `reclaimVacantSlot()` instead of reverting `submitAnswer` with `SlotIsVacant()` |
| `2cb1832` | TakeCard chip + opinion-detail "OTHER TAKES IN" heading + pool chips now render `take.categoryLabel` (raw on-chain string) instead of the 8-bucket fallback. Opinion route moved to optional catch-all `/opinions/[id]/[[...slug]]` with new `slugifyTake` + `takeHref` helpers; all 8 internal hrefs now generate canonical slug URLs |
| `8b0e30a` | `/mint` → `/create` permanent 308 redirect via `next.config.ts` |
| `1acf8a2` | `/leaderboard` reads `useLeaderboardData` (chain) instead of mock `getLeaderboard`. Adapter maps `LeaderboardUser` → `LeaderboardRow`, best-take pulled from `useTakes`, profile-link href uses full 0x not handle. Period tabs decorative ("showing all-time" note) — proper period filter still needs event-log scanning |
| `c8e8fc4` | `KingPanel` component on opinion detail. Visible only when caller is `opinion.currentAnswerOwner`; shows locked stake, cooldown countdown, "EXIT MY SLOT · RECOVER 80%" button calling V4 `selfExit()`. Uses `useSelfExit` + `useOpinionLockStatus` hooks (already existed, unwired) |
| `c66c0c9` | Every 0x address in the UI is now a Link to `/profile/[address]`. New shared `AddressLink` component. TakeCard restructured so address strip lives outside the detail-page Link (no nested `<a>`). Opinion hero gets a "minted by" column. HolderTimeline rows link. Pool detail link uses real 0x via new `pool.creatorAddress` field on `Pool` type |
| `e2bddfc` | `/create` category picker reads `OpinionExtensions.getAvailableCategories()` (40 chain categories) via new `useChainCategories` hook. Submits raw chain string (no reverse-mapping). Likely root cause of mint reverts — the previous hardcoded 8 mappings could drift from the chain whitelist |
| `3d98cf8` | `/pools/new` full page wired to V2 `PoolManager.createPool`. Form gates on `nextPrice ≥ 100 USDC`, deadline 2–60 days, min 1 USDC contribution. Adds `createPool` / `poolCount` / `poolCreationFee` / `minPoolDuration` / `maxPoolDuration` to `POOL_MANAGER_ABI`. New `useCreatePool` hook handles approve→submit. `/pools` "OPEN A POOL" toast → real href |
| `34cac2e` | V4 question marketplace: `listQuestionForSale` / `buyQuestion` / `cancelQuestionSale`. New `useQuestionListing` hook. `QuestionOwnership` card now renders the right CTA per viewer (owner-not-listed → list input; owner-listed → cancel; non-owner-listed → buy with approve fallback). Contract splits 10% platform / 90% seller via `FeeManager.accumulateFee` — claimable on portfolio |
| `bae85e0` | `/listings` page — every chain take with `salePriceUSDC > 0`, sorted cheapest first. New "Listings" tab in nav between Marketplace and Leaderboard. ListingCard links to `/opinions/[id]/[slug]` where the actual buy flow lives |
| `2c4bf3f` | Stripped all `MOCK_TAKES` / `MOCK_POOLS` / `getTakeDetail` / `getPriceHistory` / `getReferralData` fallbacks from every user-visible surface. Each empty state replaced with a Poster Arcade sticker + CTA. `/referrals` rewritten as "🚧 NOT WIRED YET" (V4 has no on-chain referral registry). StreakRail with hardcoded "🔥 4-day streak · 12 takes · $1,247 bag" removed |
| `3c1aef3` | `/tutorial` page — distilled from the legacy 522-line landing tutorial. 8 sections: hero · 3-thing setup · trade loop · fee split (95/3/2) · mint fields · pools · question sale · CTA. "Tutorial" tab added to nav. Numbers sourced from CLAUDE.md V4 config so they stay in sync |
| `9b3039f` | Big cyan **CLAIM FEES** panel on `/profile/[address]` — only visible when connected wallet matches the profile address. Uses existing `useClaimFees` hook. Resolves the discoverability gap (claim only existed on `/portfolio` before) |

---

## Live URL map (unchanged from previous session)

| URL | Status |
|---|---|
| `/` | Hot Wall — chain-backed, empty state when 0 takes |
| `/marketplace` | The Floor — filter/sort/search over chain takes |
| `/listings` | **NEW** — questions currently listed for sale |
| `/opinions/[id]/[[...slug]]` | Detail + TradeSlip + KingPanel + QuestionOwnership |
| `/create` | MINT wizard — pulls 40 categories from chain |
| `/pools` | Active + filled pools, "OPEN A POOL" → `/pools/new` |
| `/pools/new` | **NEW** — create-pool form (5 steps) |
| `/pools/[id]` | Pool detail + JOIN |
| `/portfolio` | Your Room — chain holdings + CASH OUT footer |
| `/profile/me` → `/profile/<addr>` | Public profile + **new claim panel** when self |
| `/leaderboard` | Hall of Takes — chain-backed (was mock) |
| `/watchlist` | Saved ids resolved against chain takes |
| `/referrals` | 🚧 NOT WIRED YET placeholder (was mock data) |
| `/tutorial` | **NEW** — quick guide |
| `/admin/*` | Poster Arcade chrome (legacy GlobalNavbar gone) |
| `/v2`, `/v2/*` | 301 → root via `middleware.ts` |
| `/mint` | 308 → `/create` via `next.config.ts` |

---

## ⚠️ Pre-merge verification — NOT DONE, only YOU can do this

Everything in this session was code-level + headless smoke. **No real-wallet test happened.** Each of these flows needs a Base mainnet wallet with USDC to confirm:

1. **MINT** (`/create`) — pick a chain category, set price, mint. Confirms the category-fix is real and prior mint reverts are gone.
2. **TAKE** (`/opinions/<filled>/[slug]`) — submit a new answer on a take with a current owner. Confirms `submitAnswer` still works.
3. **RECLAIM** (`/opinions/<vacant>/[slug]`) — take over a vacant slot. Confirms `reclaimVacantSlot` + the V4 feature flag are both correct.
4. **SELF-EXIT** (`/opinions/<one you own>/[slug]`) — exit your own slot once cooldown elapses. Confirms KingPanel renders + `selfExit` works.
5. **CREATE POOL** (`/pools/new`) — open a pool on any take with floor ≥ $100. Confirms `useCreatePool` approve→submit.
6. **JOIN POOL** (`/pools/<id>`) — contribute USDC to an active pool.
7. **LIST QUESTION** (`/opinions/<one you minted>/[slug]`) — list the question for sale at a price, then check `/listings` to confirm it shows up.
8. **BUY QUESTION** (from a different wallet) — `/listings` → click VIEW & BUY → approve + buy. Confirm ownership transfers + sale proceeds appear in seller's accumulated fees.
9. **CLAIM** (`/profile/<your address>` OR `/portfolio`) — CASH OUT. Confirm USDC lands in wallet.

If any revert, paste the error to next session.

---

## Known gaps still on the table (medium priority — none blocking)

- **Price chart** on opinion detail — currently Sparkline from answer-history. Legacy had a richer `OpinionChart`. Not critical.
- **Activity feed** on opinion detail — currently HolderTimeline. Legacy had `OpinionActivity` with more event detail.
- **Detailed trading history** + **advanced position management** on profile/portfolio — legacy had both.
- **Pool share modal** — legacy had it, new build doesn't.
- **Leaderboard period filter** (24h/week/month) — currently decorative; chain data is all-time. Needs event-log scanning to implement properly.
- **ENS resolution** — `/profile/vitalik.eth` shows "EMPTY ROOM" sticker. Wire `wagmi`'s `useEnsAddress` to resolve handles.
- **`useTake(id)` performance** — still fetches all opinions then `.find`s one. Add a `useSingleTake(id)` calling `getOpinionDetails(id)` directly.
- **`useCreateOpinionFlow` race** — captures `newOpinionId` from `nextOpinionId` BEFORE submit; concurrent mints could land the deep-link on the wrong take. Switch to parsing `OpinionCreated` from the receipt.
- **StreakRail** — removed (was hardcoded fake stats). Reintroduce wired to real `useUserRoom` data once we have a `streak` field on chain (event-log derived).
- **MAKE OFFER on questions** — currently disabled, marked roadmap. V4 has no offer-matching engine.

### Cleanup tasks (no urgency)

- Delete `apps/web/src/app/_legacy/` once a full deploy cycle has passed without regression.
- Delete the orphaned `_data/*` mock helpers now that no live surface imports them:
  - `MOCK_TAKES` array (keep types + `CAT_MAP` + `fmtUSD` + `fmtDelta`)
  - `MOCK_POOLS` + `getPool` (keep `Pool` type + `fundingPct`)
  - All of `_data/leaderboard.ts`, `_data/referrals.ts`, `_data/take-detail.ts` synthesizers
  - `getProfileRoom` + `getBestTakeId` from `_data/room.ts` (keep types)
- `next lint` shows pre-existing warnings in legacy hooks (`src/hooks/use*.ts`, `src/lib/wagmi-*.ts`) — `Unexpected any`, unused vars. Build passes (`eslint.ignoreDuringBuilds: true`). Worth a cleanup pass when those legacy files become reachable again or before turning lint blocking.
- Drop wagmi/pino-pretty deprecation warnings (cosmetic, from wagmi's pino dep).

---

## Repo state at session end

```
git log --oneline -3
9b3039f feat(web): claim-fees panel on /profile/[address] (self view)
3c1aef3 feat(web): /tutorial — Poster Arcade tutorial + nav tab
2c4bf3f fix(web): strip mock data from every live surface

git status
clean (post-commit)

local vs origin/main
0 ahead, 0 behind

tsc --noEmit       → exit 0
next lint          → not re-run this session (pre-existing warnings stable)
dev server         → still running on :3000 (lsof -ti:3000 | xargs kill to stop)
deploy             → main is on Vercel; every commit auto-deployed
```

---

## V4 feature flag state (per admin screenshot in-session)

All three V4 self-exit flags were **ON** as of last admin visit:
- `selfExitEnabled` = ON (king can call `selfExit` after cooldown)
- `reclaimVacantSlotEnabled` = ON (anyone can `reclaimVacantSlot` on a vacant slot)
- `stalePoolExitEnabled` = ON

If you need to disable a feature for prod (e.g. emergency), the admin UI is at `/admin/page.tsx` → Self-Exit (V4) tab → toggle.

---

## How to resume next session

1. Open this file.
2. `cd /Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app/`
3. `git log --oneline | head -15` — confirm you're at `9b3039f` or beyond.
4. **First thing: do the real-wallet smoke pass** above. Anything that reverts gets a hot-fix.
5. After smoke passes: pick from the "Known gaps" list based on priority — the biggest visible-to-users items are price chart, activity feed, and detailed trading history. Or wait for user feedback on what they hit during real use.

---

## Notes for the next-session model

- The user is **decisive** — when given option A/B/C, they pick fast and expect you to plow through. Don't over-deliberate. Make the proposal short, get the green light, execute.
- The user **wants commits pushed individually**, not batched at the end. They explicitly want Vercel deploys to fire per commit so they see progress.
- **Mock data is forbidden on live surfaces.** When chain has nothing, render an empty state with a CTA, never fabricate. The user called this out explicitly.
- **Categories on chain are 40 entries via `OpinionExtensions.getAvailableCategories()`.** Never hardcode the list — the chain whitelist can be updated by admin and the UI must follow.
- **Every address must be clickable** to `/profile/[address]`. The new `AddressLink` component centralizes this. Don't introduce raw `@0xabc…def` strings.
- **Question owner ≠ creator** in V4. Creator is fixed at mint; question owner can change via `buyQuestion`. The question-marketplace flow (this session) is now active.
- **Don't delete `_legacy/`** until at least one deploy cycle confirms nothing regressed. Same for the orphan `_data/*` mock helpers.
- **V4 splits the take-it path by vacancy** — `submitAnswer` reverts on vacant slots with `SlotIsVacant()`, vacant must go through `reclaimVacantSlot`. The TradeSlip already branches on `take.heldBy === 'vacant'`.
- The user's admin/owner address is `0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C` — when testing as "self" on profile/portfolio, that's the wallet.
- **`useReadContract` hooks must be called unconditionally** — the pool detail page hit this pitfall when introducing early-returns for the loading state. Always call all hooks first, then branch on render.
- The Vercel CLI in this environment isn't logged in. The deploy verification happens by polling the prod URL for a known marker — `pa-root` class works as a freshness signal. CLI status checks require `vercel login` first.
- The user's wallet flow expectations: USDC approve → tx submit, with a "needs approve" / "approving…" / "submitting…" / "success" state machine. Pattern is consistent across `useTakeFlow` / `useReclaimSlot` / `useCreatePool` / `useQuestionListing`. Follow it.
- **Tutorial copy follows CLAUDE.md V4 numbers** — flat $2 spam fee, 95/3/2 split, $100 min pool floor, 2–60 day pool duration, 20% early-exit penalty, 1 USDC min pool contribution. If any of those change on chain, the tutorial must update.
