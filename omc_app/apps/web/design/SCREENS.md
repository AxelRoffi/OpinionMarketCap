# Screens — Route by Route

Build in this order. Each section: **route · purpose · key UI · states · empty/error/loading**.

---

## 1 · `/` — Landing / Hot Wall

**Purpose**: Front door for new visitors AND logged-in home for returning users. Same page, smart hero.

**Above the fold**
- Nav: `★ OMC` logo · Hot · New · Streaks · Hall · `★ NEW TAKE` (primary CTA, top right)
- Hero (logged out): `Take a stand. Get paid for it.` (78px display, "Get paid" in pop) + 3 floating tilted sticker cards on the right + 2 CTAs: `★ MINT YOUR FIRST TAKE` (primary), `browse the floor →` (outline)
- Hero (logged in): replace with **personalized stat strip** — `Welcome back, @0xA1 · 🔥 4-day streak · $1,247 bag · +$214 royalties this week` + `★ MINT NEW TAKE` button

**Hot wall**
- Section title: `🔥 HOT WALL · TODAY` left + `847 takes · $284k vol · 12 fresh` (mono, right)
- 4-column grid of sticker cards (8 visible on desktop, infinite scroll)
- Each card alternates bg between pop / canvas / cool / white. Tilts alternate sign.

**Streak rail (bottom, sticky)**
- Ink bar: streak · bag · royalties · "vitalik · jesse · prag are online"

**States**
- Loading: 4 tilted skeleton cards with "loading…" wobble
- Empty: "no hot takes yet. be the first." + big CTA
- Error: tilted error card on yellow

---

## 2 · `/marketplace` — All Takes

**Purpose**: Browse + filter every opinion.

**Header**
- Title: `THE FLOOR.` (display 64px) + caption "every take, every price"
- Filter row (chips): All · 🏀 Sports · ⚡ Crypto · 🎬 Cinema · 🤖 AI · 🍕 Food · 🌍 Life · 🎵 Music · 🚀 Founders
- Sort dropdown (right): Hot · New · Top gainers · Top losers · Cheapest · Spiciest
- Search bar: pill, inline icon "🔍 find a take"

**Grid**
- 4-column on desktop, 2 on tablet, 1 on mobile
- Each card = sticker. Click → opinion detail
- Card hover: tilt amplifies 0.5°, shadow extends 1px

**Empty filter state**: "no takes match. try another category."

---

## 3 · `/opinions/[id]` — Opinion Detail + Trade Slip

**Purpose**: View one take, see history, take it / make an offer.

**Layout**: 60/40 split desktop, stacked mobile.

**Left — the take**
- Big sticker card (tilted -2°, bg matches category): question (italic, small), current answer (display 96px), held by @who (with avatar), category chip
- Below: price history sparkline (sketchy, dashed) + 24h / 7d / 30d toggle
- Stat row: floor · last sale · trades · royalties paid out · holders count

**Right — trade slip**
- White paper card, 5px hard pink shadow, tilt -1°
- Tab toggle: `Take it` / `Make an offer` / `Watch it`
- **Take it**: shows `bid` (auto-set to 1.15× current), `cost breakdown` (price + 12% premium - 3% royalty = your payout if outbid), big pop CTA `★ TAKE IT · $163`
- **Make an offer**: lowball amount, message field, expiry (24h / 7d / never)
- **Watch it**: just a star toggle

**Below**
- "Who held this take" — vertical timeline of past holders with their price and date
- "Other takes by @vitalik" — horizontal scroll of their stickers
- Comments / replies (optional, post-MVP)

**States**
- Locked (24h grace period after a take): show banner "sealed for 24h · cannot be taken yet"
- Sold to you: confetti + "you hold the floor on this one"

---

## 4 · `/create` — Mint a Take (3-step wizard)

**Purpose**: New opinion in <60s.

**Step 1 · The question**
- Big input: "what's the question?" placeholder
- Category chip selector (single-select, emoji + caps)
- Continue → step 2

**Step 2 · The answer**
- "what's the answer?" placeholder, 24px display input
- Live preview of the sticker card on the right (tilted, with their input updating in realtime)
- Continue → step 3

**Step 3 · Price it**
- Slider: $1 chump · $25 brave · $100 unhinged
- Live preview updates
- Footer: "★ you keep 3% of every flip, forever. even after they take it from you."
- Big pop CTA: `★ MINT THIS TAKE · $25 ★`

**On submit**: confetti + redirect to `/opinions/[new_id]` with success toast "your take is on the wall 🔥"

---

## 5 · `/portfolio` — Your Room

**Purpose**: Your bag at a glance.

**Header**
- Title: `YOUR ROOM` + stats row: BAG $1,247 · 7d +18.4% · ROYALTIES +$214 · STREAK 4🔥

**Section 1 · Still holding (4-col grid)**
- Each = sticker card with live price + delta

**Section 2 · Taken but still earning (vertical list)**
- White paper card with rows: emoji · `"question?" → answer taken by @who` · royalty earned (mono, pop color)

**Footer CTAs**: `★ MINT NEW TAKE` · `CASH OUT $214`

**Empty state**: "your room is empty. mint your first take." + CTA

---

## 6 · `/profile/[address]` — Public Profile

**Purpose**: Show another collector's room.

Same layout as portfolio, but:
- Public stats only (bag visible if user opted in, otherwise hidden)
- Their tilted sticker cards
- "Best take" highlighted (biggest royalty earner)
- Follow / unfollow button (post-MVP)

---

## 7 · `/leaderboard` — Hall of Takes

**Purpose**: Loudest minds this week.

**Header**: `HALL OF TAKES` + period toggle: 24H · WEEK · MONTH · ALL

**Podium (top 3, large tilted stickers)**
- 🥇 vitalik.eth — $48,210 (pop bg)
- 🥈 jesse.base — $31,420 (cool bg)
- 🥉 prag.base — $22,860 (canvas bg)

**Table**: rank · who · best take · bag · royalty · flips · streak
- Current user's row is highlighted yellow with `YOU` pop chip
- All numbers mono

---

## 8 · `/watchlist` — Saved Takes

**Purpose**: Things you starred.

- Same grid as marketplace, filtered to saved
- Empty: "nothing saved yet. star a take to watch it." + browse CTA

---

## 9 · `/referrals` — Invite friends

**Purpose**: Viral loop. Each invite gives you 1% of their flips forever.

**Header**: `BRING YOUR CREW` + "you earn 1% of every flip from anyone you bring. forever."

**Card**: Your referral link (mono, click to copy) + stats: invited · joined · earnings

**List**: who you invited, what they minted, what you earned

---

## 10 · `/pools` and `/pools/[id]` — Pools (group-funded takes)

**Purpose**: Multiple users co-own a take.

**Index `/pools`**
- Grid of active pools — each card shows the question, current funding %, deadline, and contributors avatars
- "Open a pool" CTA

**Detail `/pools/[id]`**
- Pool card (tilted, bigger), with funding progress bar (ink track, pop fill, no gradient)
- Contributors list with their share
- "Join the pool" CTA — pick amount
- "Pool closes in 3d 14h" countdown (mono, big)

---

## 11 · Navigation (global)

**Desktop top bar**:
- Left: `★ OMC` logo (clicks to /)
- Center: Hot · Marketplace · Leaderboard · Pools
- Right: search · 🔔 notif bell · `★ NEW TAKE` button · avatar dropdown

**Mobile bottom tab bar** (ink bg, 5 items):
- HOT (home) · ROOM (portfolio) · `★+` (mint, raised pop button) · HALL (leaderboard) · ME (profile)

---

## 12 · Modals

### Mint success
- Yellow scrim + tilted white card + confetti + "your take is on the wall 🔥" + "share sticker" / "go to room" buttons

### Take success (you bought someone's take)
- Same shape, pop card, "you hold the floor on [question]" + "share win"

### Connect wallet
- Centered card, 4 wallet options as tilted sticker buttons (Coinbase, Rainbow, MetaMask, Walletconnect)

### Onboarding (first visit)
- 3-step welcome: Pick · Hold · Earn + "baby step / mint a banger" choice

---

## 13 · Loading / Error / Empty (universal)

- **Loading**: tilted yellow card with "loading…" + wobble animation
- **Error**: tilted pop card with "this went sideways. try again." + retry button
- **Empty**: tilted white card with category-appropriate message + CTA

---

## 14 · Notifications (toast)

- Top right corner, slide in from right
- Yellow bg, ink border, hard pink shadow, tilt -1°
- 4s default duration, auto-dismiss
- Types: ✓ success (cool stripe), ! warning (canvas stripe), ✗ error (pop stripe)

---

## 15 · Out-of-scope (keep current chrome)

- `/admin/*` — internal only
- `/debug*` — dev tools
- `/api/*` — no UI
- `/test-wallet`, `/simple` — dev

Everything else gets the full Poster Arcade treatment.
