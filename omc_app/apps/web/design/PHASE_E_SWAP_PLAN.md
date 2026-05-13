# Phase E — `/v2/*` → `/` Production Swap Plan

> **Status:** Plan only. Not executed yet. See "Sign-off needed" below.
> **Risk:** High — touches the canonical URLs of a live mainnet dapp.
> **Reversibility:** `git revert` brings everything back; mainnet state untouched.

---

## What gets swapped

`/v2/foo` URLs become `/foo`. The Poster Arcade redesign becomes the production dapp at `app.opinionmarketcap.xyz`.

| Today | After Phase E |
|---|---|
| `/` (legacy dark theme) | `/` (Poster Arcade Hot Wall) |
| `/marketplace` (legacy) | `/marketplace` (Poster Arcade) |
| `/opinions/[id]` (legacy) | `/opinions/[id]` (Poster Arcade detail) |
| `/create` (legacy) | `/create` (Poster Arcade mint wizard) |
| `/portfolio` (legacy) | `/portfolio` (Poster Arcade Your Room) |
| `/profile/[address]` (legacy) | `/profile/[address]` (Poster Arcade profile) |
| `/leaderboard` (legacy) | `/leaderboard` (Hall of Takes) |
| `/watchlist` (legacy) | `/watchlist` (Saved takes) |
| `/referrals` (legacy) | `/referrals` (Bring your crew) |
| `/pools` (legacy) | `/pools` (Poster Arcade pools) |
| `/pools/[id]` (legacy) | `/pools/[id]` (Poster Arcade pool) |
| `/v2/*` URLs | 301 redirect → root equivalent |
| `/admin/*` | unchanged — legacy chrome retained |
| `/mint` (legacy alt) | removed (folded into `/create`) |
| `/debug*`, `/simple`, `/test-wallet` | unchanged — dev routes |

---

## Mechanics

### Step 1 — Route-group reshape (the actual move)

Move `apps/web/src/app/v2/*` → `apps/web/src/app/(poster)/*`.

`(poster)` is a Next.js route group — folders wrapped in parens don't add segments to the URL. So:

| File path | URL |
|---|---|
| `app/(poster)/page.tsx` | `/` |
| `app/(poster)/marketplace/page.tsx` | `/marketplace` |
| `app/(poster)/opinions/[id]/page.tsx` | `/opinions/[id]` |
| `app/(poster)/layout.tsx` | wraps every route in the group |

This collapses `/v2/foo` to `/foo` **without** moving files to colliding paths first — the route group buys us atomic-feeling moves via `git mv`.

### Step 2 — Archive legacy

Move legacy route folders into `apps/web/src/app/_legacy/`. Underscore-prefixed folders are **private** in Next.js routing — they don't generate URLs but the files remain in the codebase for reference / partial reuse.

Legacy files to archive:

- `app/page.tsx` (1332 lines — the existing dark-theme Hot Wall)
- `app/marketplace/`
- `app/opinions/`
- `app/create/`
- `app/mint/` (alt mint flow, folded into `/create` in Poster Arcade)
- `app/portfolio/`
- `app/profile/`
- `app/leaderboard/`
- `app/watchlist/`
- `app/referrals/`
- `app/pools/`

**Keep at root, untouched:**

- `app/admin/` + `app/admin/interact/`
- `app/api/`
- `app/debug/`, `app/debug-inline/`, `app/debug-test.tsx`
- `app/simple/`, `app/test-wallet/`
- `app/layout.tsx`, `app/client-layout.tsx`, `app/providers.tsx`
- `app/globals.css`, `app/favicon.ico`, `app/robots.ts`, `app/sitemap.ts`
- `app/v2/` after move — empty; deleted in the same commit

### Step 3 — Invert the ClientLayout chrome guard

Today (`src/app/client-layout.tsx:24`):

```ts
const isV2 = pathname?.startsWith('/v2') ?? false;
// isV2 → skip legacy chrome
```

After swap, the inversion: **everything is Poster Arcade by default**, legacy chrome is only used for admin + dev routes.

```ts
const useLegacyChrome =
  pathname?.startsWith('/admin') ||
  pathname?.startsWith('/debug') ||
  pathname === '/simple' ||
  pathname === '/test-wallet';
```

The Poster Arcade `(poster)/layout.tsx` already provides its own chrome (Nav, halftone, BottomTabBar, StreakRail), so the root ClientLayout no longer needs to render `GlobalNavbar` / `Footer` for non-legacy routes.

### Step 4 — Internal link rewrites

Every `href="/v2/..."` / `Link href="/v2/..."` / `redirect('/v2/...')` becomes the root equivalent.

Files touched (grep `/v2/`):

- `src/components/poster-arcade/Nav.tsx` — TABS array, default ctaHref
- `src/components/poster-arcade/BottomTabBar.tsx` — TABS array
- `src/app/(poster)/page.tsx` — hero CTAs, hot-wall card links
- `src/app/(poster)/_components/TakeCard.tsx` — link to /opinions/[id]
- `src/app/(poster)/_components/EarningRow.tsx` — link to /opinions/[id]
- `src/app/(poster)/marketplace/page.tsx` — none after refactor (TakeCard owns links)
- `src/app/(poster)/opinions/[id]/page.tsx` — breadcrumb, profile links
- `src/app/(poster)/opinions/[id]/_components/TradeSlip.tsx` — "see watchlist" link
- `src/app/(poster)/opinions/[id]/_components/RelatedTakesRow.tsx` — TakeCard
- `src/app/(poster)/create/page.tsx` — breadcrumb, success-state CTAs
- `src/app/(poster)/portfolio/page.tsx` — empty-state CTAs, footer CTAs
- `src/app/(poster)/profile/page.tsx` — redirect target
- `src/app/(poster)/profile/[address]/page.tsx` — breadcrumb, footer CTAs
- `src/app/(poster)/leaderboard/page.tsx` — handle + best-take links
- `src/app/(poster)/watchlist/page.tsx` — CTAs
- `src/app/(poster)/referrals/page.tsx` — back-to-portfolio CTA
- `src/app/(poster)/pools/page.tsx` — pool card links
- `src/app/(poster)/pools/[id]/page.tsx` — breadcrumb, profile links, take links

One scripted sed pass at the start; spot-check the rest manually. Search/replace pairs:

```
'/v2/marketplace' → '/marketplace'
'/v2/opinions/'   → '/opinions/'
'/v2/create'      → '/create'
'/v2/portfolio'   → '/portfolio'
'/v2/profile/'    → '/profile/'
'/v2/profile'     → '/profile'
'/v2/leaderboard' → '/leaderboard'
'/v2/watchlist'   → '/watchlist'
'/v2/referrals'   → '/referrals'
'/v2/pools/'      → '/pools/'
'/v2/pools'       → '/pools'
'/v2'             → '/'           ← careful: order matters; this last
```

### Step 5 — Backwards-compat redirect middleware

Add `apps/web/src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';

const V2_PREFIX = '/v2';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === V2_PREFIX || pathname.startsWith(`${V2_PREFIX}/`)) {
    const stripped = pathname.slice(V2_PREFIX.length) || '/';
    return NextResponse.redirect(new URL(`${stripped}${search}`, req.url), 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/v2', '/v2/:path*'],
};
```

301 redirect preserves SEO + lets anyone with a saved `/v2/*` link land in the right place.

### Step 6 — Sitemap

Update `app/sitemap.ts` if it lists v2 routes (it shouldn't — but verify).

### Step 7 — Verify

```
npx tsc --noEmit
npx next lint --dir src/app --dir src/components
PORT=3000 npm run dev
curl http://localhost:3000           # was legacy, now Poster Arcade
curl http://localhost:3000/v2        # → 301 → /
curl http://localhost:3000/marketplace
curl http://localhost:3000/opinions/1
curl http://localhost:3000/create
curl http://localhost:3000/portfolio
curl http://localhost:3000/admin     # unchanged legacy
```

Manually verify in browser with a real wallet that the **Take-it**, **MINT**, and **JOIN POOL** flows still work end-to-end on Base mainnet.

### Step 8 — Commit

Single atomic commit so a future `git revert` brings the legacy dapp back wholesale:

```
feat(web): Phase E — swap /v2/* to root; archive legacy at _legacy/

Poster Arcade is now the production dapp.
- (poster) route group reshapes /v2/foo → /foo
- legacy routes archived under _legacy/ (excluded from routing via _)
- ClientLayout guard inverted: legacy chrome only on /admin + /debug*
- middleware.ts 301-redirects /v2/* → /* for SEO + bookmarks
- ~30 internal link rewrites from /v2/foo to /foo
- admin + api + dev routes untouched
- mock data + /v2/_lib hooks stay in place (no logic change)
```

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Real users hit broken page after deploy | The swap is atomic — one commit. `git revert <sha>` reinstates legacy entirely. |
| Bookmarks to `/v2/*` break | middleware.ts 301s those to root equivalents — bookmarks survive. |
| External backlinks to legacy `/marketplace` etc. | These already worked; Poster Arcade replaces them at the same URL, no link rot. |
| New `/create` differs from old `/create` (different form, different field set) | Both target the same V4 `createOpinion` — observed parity in 9B-3. |
| Admin loses its chrome | Inverted guard explicitly preserves admin under legacy `ClientLayout` shell. |
| Hidden references to `/v2/` in seo.ts / og-image / sitemap | Grep before commit; rewrite if found. |
| Wallet provider re-mount during the swap could disconnect | Providers live in root `client-layout.tsx`, untouched. No disconnect. |

---

## What does NOT change

- Smart contract addresses (V4 OpinionCore, PoolManagerV2, etc.) — same
- Wallet provider stack (RainbowKit, wagmi, viem versions) — same
- Mock data + `/v2/_lib` hooks — they live in `(poster)/_lib` after the move
- Admin panel UI
- The legacy dark-theme code — preserved in `_legacy/` for reference

---

## Sign-off needed

Confirm before I execute:

1. Are you OK with the legacy dark-theme dapp going to `_legacy/` (still reachable via filesystem, not via URL)? **Yes / No**
2. Are you OK that `/mint` is permanently removed (folded into `/create`)? **Yes / No**
3. Are you OK to ship to production immediately after this commit lands on `main`? **Yes / Stage on preview first**
4. Anything else you want preserved or migrated specially?

Say **"go E"** with answers, or **"hold E"** if you want adjustments first.
