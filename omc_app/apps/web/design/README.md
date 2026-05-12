# OMC · Poster Arcade — App Redesign Handoff

This package contains everything Claude Code needs to rebuild `apps/web` in the **Poster Arcade** visual direction.

## What's inside

| File | Purpose |
|---|---|
| `README.md` | This file — start here |
| `DESIGN_SYSTEM.md` | Tokens, type, components, voice, motion — read second |
| `SCREENS.md` | Route-by-route brief — what each page does, key states |
| `tokens.ts` | Drop-in TypeScript design tokens |
| `tailwind.config.ts` | Drop-in Tailwind config (palette, fonts, radius, shadow) |
| `globals.css` | Base styles + utility classes (sticker shadow, hatch, dot bg) |
| `screens.html` | Open in browser — visual reference of all screens |
| `screens.jsx` | Source of the preview (React, inline JSX) |
| `screenshots/` | PNG references per screen (open if browser unavailable) |

## How to use this with Claude Code

1. **Drop the whole folder** into the repo at `apps/web/design/` (or wherever you keep design refs).
2. Tell Claude Code:
   > "Rebuild every page under `apps/web/src/app/` in the **Poster Arcade** style. Read `design/DESIGN_SYSTEM.md` and `design/SCREENS.md` first. Apply `design/tailwind.config.ts` and merge `design/globals.css` into the existing `app/globals.css`. Use `design/screens.html` as the visual target."
3. Have it work **route by route**, in the order listed in `SCREENS.md`. Landing → Marketplace → Opinion detail → Create → Portfolio → Profile → Leaderboard → Watchlist → Referrals → Pools.

## Visual DNA in one sentence

> **Sticker confidence.** Loud yellow page + ink borders + hot-pink CTAs. Every opinion is a tilted sticker card with a 5px hard ink shadow. Pill buttons. Monospace numbers. Dotted background. No gradients, no glass, no rounded-corner SaaS.

## Non-negotiables

- **Yellow page background** (`#FFE94D`) everywhere, dot pattern overlay at 7% opacity.
- **2.5px ink borders** on every card and CTA. Never less.
- **Hard offset shadows** (`4–6px 4–6px 0 #15120D`). Never soft drop shadows. Never blur.
- **Tilt rule**: every sticker card has `transform: rotate(-2deg to +2deg)` — never `0deg`.
- **Numbers in monospace** (JetBrains Mono 800). Always.
- **Pill buttons**: `border-radius: 999px`, `2.5px ink border`, hard shadow.

## Existing routes that need to be redesigned

```
/                          → Landing (the hot wall)
/marketplace               → All opinions, filterable
/opinions/[id]             → Opinion detail + trade slip
/create                    → Mint a new take (3-step wizard)
/portfolio                 → Your Room — held + earning takes
/profile/[address]         → Public profile (collector)
/leaderboard               → Hall of Takes
/watchlist                 → Saved takes
/referrals                 → Invite friends, earn 1%
/pools                     → Pools index
/pools/[id]                → Pool detail
/mint                      → (legacy — fold into /create)
/admin                     → Admin (skip — keep current chrome)
```

See `SCREENS.md` for the brief on each.
