# Session Resume — Post-Phase-E

**Last session ended:** May 13, 2026 — context limit reached after Phase E swap.
**Status:** Poster Arcade redesign is now the production dapp at root URLs. `tsc` clean. **Untested in browser / on real wallet.**

---

## What shipped (recap of this session's commits)

```
21b408e  feat(web): Phase E — swap Poster Arcade to root URLs            ← THE SWAP
db4611c  fix(web): remove Offer tab; add QuestionOwnership card
135fc65  fix(web): Offer tab — explain what it is, before showing the form  (superseded by db4611c)
8f16f6f  fix(web): TradeSlip — add link field, wire to submitAnswer's 4th arg
6689446  fix(web): /v2 hero stickers — don't truncate, wrap to 2 lines instead
56c94e7  docs(web): Phase E swap plan
bb5aabe  feat(web): Phase 9C-2 + 9C-3 — pools + watchlist on chain
a36fcd9  feat(web): Phase 9C-1 — /v2/portfolio + /v2/profile/[address] on chain
2371ede  feat(web): Phase 9B-4 — /v2/pools/[id] JOIN POOL wired to PoolManager
a949ca6  feat(web): Phase 9B-3 — /v2/create wired to createOpinion
3245393  feat(web): Phase 9B-2 — TradeSlip Take-it wired to submitAnswer
38ea62a  feat(web): Phase 9B-1 — Poster Arcade wallet connect in Nav
1c15c0f  feat(web): Phase 9A — wire /v2 to live on-chain data (read-only)
b5b1634  fix(web): /v2/create mint fee — V4 is flat $2 spamFee, not V3's 20%
b71cf2d  fix(web): Phase D polish — a11y, reduced-motion, mobile keyboards, disabled UX
9c157a5  feat(web): Phase 8  — /v2/pools + /v2/pools/[id]
25fc0a3  feat(web): Phase 7  — /v2/referrals invite loop
fde4bee  feat(web): Phase 6  — /v2/leaderboard + /v2/watchlist
63d0f76  feat(web): Phase 5  — /v2/portfolio + /v2/profile/[address]
9292c64  feat(web): Phase 4  — /v2/create 3-step mint wizard
49c1a2e  feat(web): Phase 3  — /v2/opinions/[id] + trade slip
3ff52e1  feat(web): Phase 2  — /v2/marketplace with filters/sort/search
5aa9bc0  feat(web): Phase 1  — Poster Arcade primitives + /v2 Hot Wall
22c58c0  feat(web): Phase 0  — Poster Arcade foundation
```

---

## Where the URLs landed (Post-E)

Phase E `/v2/foo` → `/foo`. The `/v2/*` URLs return **HTTP 301 → root** via `middleware.ts`.

| Live URL | What |
|---|---|
| `/` | Hot Wall (was `/v2`) — chain-backed top takes + hero stickers |
| `/marketplace` | The Floor — filter / sort / search over all chain takes |
| `/opinions/[id]` | Opinion detail + Take-it slip + Question Ownership card |
| `/create` | MINT wizard wired to `createOpinion(question,answer,description,price,categories[])` |
| `/portfolio` | Your Room — chain holdings, earning royalties, CASH OUT button (`claimAccumulatedFees`) |
| `/profile` | Redirects to `/profile/me` |
| `/profile/[address]` | Public profile, `"me"` sentinel resolves to connected wallet |
| `/leaderboard` | Hall of Takes (mock — `useLeaderboardData` wiring is the natural 9D job) |
| `/watchlist` | Saved ids resolve against chain takes |
| `/referrals` | Mock (no on-chain referral data on V4) |
| `/pools` | Chain-backed `useChainPools()` over `getPoolDetails(0..poolCount-1)` |
| `/pools/[id]` | Chain pool + JOIN wired to `contributeToPool` |
| `/admin/*` | **Unchanged legacy chrome** (GlobalNavbar/Footer). Inverted guard in `client-layout.tsx`. |
| `/debug*`, `/simple`, `/test-wallet` | Legacy dev routes, untouched |
| `/v2`, `/v2/*` | 301 → root equivalent via `middleware.ts` |

Archived: `apps/web/src/app/_legacy/` holds every legacy route (folders + `home-page.tsx` + `PriceHistoryChart.tsx`). Underscore-prefixed → excluded from Next routing + from tsc (`tsconfig.json` exclude).

---

## ⚠️ Pre-deploy verification — DO NOT MERGE without these

1. **Boot the dev server** locally:
   ```
   cd apps/web
   npm run dev
   open http://localhost:3000
   ```
   Expect: Poster Arcade Hot Wall, NOT the legacy dark-theme home.
2. **Smoke every URL in the table above.** No 404, no white screen, no infinite Wobble.
3. **Real-wallet flows** on a Base mainnet wallet with USDC:
   - `/opinions/[id]` Take-it (approve + submitAnswer)
   - `/create` (approve + createOpinion)
   - `/pools/[id]` JOIN POOL (approve + contributeToPool)
   - `/portfolio` CASH OUT (claimAccumulatedFees, only if you have royalties)
4. **`/v2/*` → root 301** verify:
   ```
   curl -I http://localhost:3000/v2/marketplace
   # → HTTP/1.1 301
   # → Location: /marketplace
   ```
5. **`/admin/*` should look like legacy** (dark-theme GlobalNavbar/Footer, NOT Poster Arcade).
6. **Run `npx next lint`** before pushing.

---

## What's left to do (priorities for next session)

### High priority — finish what's stubbed

| # | What | Why | Where |
|---|---|---|---|
| 1 | Wire `BUY QUESTION` button on `/opinions/[id]` Question Ownership card | V4 `buyQuestion(opinionId)` exists; UI shows the listed price but button is disabled | Add `useBuyQuestion` hook mirroring use-take-flow pattern; spender = OPINION_CORE |
| 2 | Real chain reads for `/leaderboard` | Today fully mock; `useLeaderboardData` hook exists | Adapt existing hook into chain-adapters pattern |
| 3 | Open-a-pool flow | `/pools` "OPEN A POOL" CTA toasts "coming soon" | New wizard at `/pools/new` — pick take, propose answer, set target/deadline |
| 4 | `/v2/profile` route still exists in (poster) but should be `/profile` | After swap, the redirect target was `/profile/me` — verify it still works | Browser test |
| 5 | Production deploy preview | Vercel preview to validate the swap with a real wallet before main | `vercel --prod` after merging Phase E |

### Medium priority — chain accuracy

- **Category mapping is heuristic** (8 visual cats from 40 on-chain). Long term: surface the actual chain category in TakeCard tooltips/details.
- **Delta math** = `(nextPrice - lastPrice) / lastPrice * 100`. That's the "take premium," not 24h change. Real 24h needs event-log scanning.
- **`useTake(id)` fetches ALL opinions to find one** — wasteful. Add a `useSingleTake(id)` calling `getOpinionDetails(id)` directly.
- **streak / memberSince on /portfolio + /profile** still "—" — no on-chain source. Either drop the stats or add event-log enumeration.
- **referrals are mock** — no on-chain referral data on V4.

### Low priority — polish

- Replace `pino-pretty` warnings (cosmetic, from wagmi's pino dep).
- Mobile sanity pass in a real browser at 375px.
- `Sparkline` mobile aspect ratio (slight squish).
- Empty hero stack when chain has fewer than 3 takes — fallback to mocks works but a curated fallback set might look better.

### Cleanup that should happen eventually

- Delete `apps/web/src/app/_legacy/` after a deploy cycle where nothing imports from it. Git history preserves it.
- The chain-adapter's `useTakes()` returns ALL takes — paginate once volume grows.
- `useCreateOpinionFlow` captures `newOpinionId` from `nextOpinionId` BEFORE submit — if two users mint concurrently the deep-link could land on the wrong take. Switch to parsing the `OpinionCreated` event from the receipt.

---

## Repo state at session end

```
git log --oneline -1
21b408e feat(web): Phase E — swap Poster Arcade to root URLs

git status
clean (post-commit)

tsc --noEmit  → exit 0
next lint     → not re-run this session, last run clean
dev server    → NOT RUNNING (port 3000 was killed mid-Phase-E and not restarted)
deploy        → main is on Vercel; Phase E swap is NOT pushed remote yet
```

---

## How to resume

1. Open this file in a new session.
2. `cd /Users/axelroffi/Desktop/OpinionMarketCap/OpinionMarkeCap-ALL/OpinionMarketCap_V1/opinionmarketcap_app/omc_app/`
3. `git log --oneline | head -25` — confirm you're at `21b408e` or beyond.
4. Run the **pre-deploy verification checklist** above before pushing or merging.
5. If verification passes → push to remote → preview deploy → real-wallet test → merge.
6. If verification fails → tell next-session-me the exact symptom and the URL.

---

## Things I'd say to the next-session model

- The swap is mechanically complete and tsc-clean, but **I never ran the dev server after the swap.** Browser smoke is the first thing to do.
- The `(poster)/` route group is the new home for everything Poster Arcade. Don't add files to `app/v2/` — that folder doesn't exist anymore.
- The `_legacy/` folder is **excluded from tsc** via `tsconfig.json`. If you need to reference something from there, copy it to a normal location first.
- The `middleware.ts` matcher is scoped to `/v2` only — touching it could break the 301 path.
- The user flagged two specific UI issues mid-session that we already fixed: hero stickers truncation (commit `6689446`) and the unwanted Offer tab (commit `db4611c`). Don't accidentally re-introduce those.
- The user's priorities ordered: **make it work** (real-wallet smoke), **then polish** (BUY QUESTION wiring, leaderboard chain, pool create flow), **then expand** (anything not on the current roadmap).
