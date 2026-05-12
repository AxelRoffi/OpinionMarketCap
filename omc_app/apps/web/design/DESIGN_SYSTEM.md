# Poster Arcade — Design System

## 1 · Voice

**Sticker Confidence.** Loud, fluent, Duolingo-bold. Short verbs. Earned bravado. Pop-culture allowed.

- **Do**: "Take it.", "Mint a banger.", "You keep 3% forever — even after they take it from you."
- **Don't**: Be cynical, ironic, or whisper. No "platform". No "leverage". No "ecosystem".

| Surface | Voice |
|---|---|
| Display headline | `TAKE A STAND.` — ALL CAPS, period, blunt |
| Section | `🔥 HOT WALL · TODAY` — emoji + caps + bullet |
| Body | "Pick the answer. Pay the price. Take the floor." |
| CTA | `★ MINT YOUR FIRST TAKE` — star prefix on primary actions |
| Tooltip / micro | "ngmi if u dont mint" — degen wink, lowercase |
| Error | "that's a no from us. try a smaller bid." |

## 2 · Color Tokens

```ts
// Core palette
canvas:  '#FFE94D'   // yellow page bg
ink:     '#15120D'   // type, borders, shadows
pop:     '#FF4D6B'   // primary CTA, hot, alerts
cool:    '#4DFFE0'   // gains, accents, secondary CTA
paper:   '#FFFFFF'   // cards

// Semantic
gain:    '#4DFFE0'   // = cool. green-coded via cool
loss:    '#FF4D6B'   // = pop. red-coded via pop
warn:    '#FFE94D'   // = canvas, used as inverted bg
neutral: '#15120D'   // = ink
muted:   'rgba(21,18,13,0.65)'

// Categories (chip backgrounds)
sport:   '#FF4D6B'   // pop
crypto:  '#4DFFE0'   // cool
cinema:  '#FFFFFF'
ai:      '#FFE94D'   // canvas
food:    '#FFFFFF'   // with emoji
life:    '#FFFFFF'
music:   '#FF4D6B'
```

**Rules**:
- Page is always `canvas` (yellow).
- Borders are always `ink`. Never gray.
- Primary CTAs: `ink` bg + `canvas` text + `pop` shadow. OR: `pop` bg + `paper` text + `ink` shadow.
- Gain numbers: `cool`. Loss numbers: `pop`. Neutral: `ink`.

## 3 · Type

| Role | Font | Weight | Size | Tracking | Notes |
|---|---|---|---|---|---|
| Display | Inter Tight | 900 | 64–80px | -0.04em | All caps OR sentence — both work |
| H1 / Section | Inter Tight | 900 | 32–42px | -0.03em | Period at end |
| H2 | Inter Tight | 800 | 22px | -0.02em | |
| Body | Inter Tight | 600 | 13–14px | normal | |
| Caption | Inter Tight | 800 | 11px | 0.18em | UPPERCASE |
| Numbers | JetBrains Mono | 800 | 14–24px | normal | Always mono |
| Tag/Chip | Inter Tight | 800 | 11px | normal | With emoji prefix |

Load fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
```

## 4 · Shape & Surface

- **Border radius**: 14px for cards, 12px for inputs, 999px (pill) for buttons + chips, 8px for inline tags.
- **Borders**: 2.5px solid `#15120D` on cards and primary CTAs. 2px on chips and inputs. Never 1px.
- **Shadow**: hard offset only. `4px 4px 0 #15120D` for cards, `5px 5px 0 #15120D` for floating, `4px 4px 0 #FF4D6B` for ink-bg CTAs. **Never** `blur` or `rgba` shadows.
- **Tilt**: every standalone sticker card rotates `-2deg` to `+2deg`. Use `rotate(-1.5deg)`, `rotate(2deg)`, etc. Never `0deg`. Tilt is the brand.
- **Dot bg**: every page has a 7%-opacity dot grid overlay. CSS: `background-image: radial-gradient(#15120D 1.5px, transparent 1.5px); background-size: 18px 18px; opacity: 0.07; position: absolute; inset: 0; pointer-events: none;`
- **Hatch divider**: 2px dashed `#15120D` for in-card separators.

## 5 · Components

### Button (primary)

```tsx
<button className="
  bg-ink text-canvas
  border-[2.5px] border-ink rounded-full
  px-5 py-3 font-black text-sm tracking-wider
  shadow-[4px_4px_0_var(--pop)]
  hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--pop)]
  active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--pop)]
  transition-all
">★ MINT THIS TAKE</button>
```

### Button (pop CTA — buy/take)

```tsx
className="bg-pop text-white border-[2.5px] border-ink rounded-full px-5 py-3 font-black text-sm shadow-[4px_4px_0_var(--ink)]"
```

### Button (secondary — outline)

```tsx
className="bg-white text-ink border-[2.5px] border-ink rounded-full px-5 py-3 font-extrabold text-sm shadow-[4px_4px_0_var(--ink)]"
```

### Sticker card (opinion)

Anatomy:
- Tilted container, 14px radius, 2.5px ink border, 5px hard shadow
- Category chip (pill, emoji + caps label)
- Question (italic-ish small, 85% opacity)
- Answer (display 28–32px, weight 900, -0.03em tracking)
- Price + delta row (mono, weight 800)

```tsx
<div style={{ transform: 'rotate(-1.5deg)' }}
     className="bg-pop text-white border-[2.5px] border-ink rounded-2xl p-4 shadow-[5px_5px_0_var(--ink)]">
  <span className="inline-block bg-white text-ink border-2 border-ink rounded-full px-2 py-0.5 text-[10px] font-extrabold">🏀 SPORTS</span>
  <div className="text-[11px] font-bold mt-1 opacity-85">"GOAT BASKETBALL?"</div>
  <div className="font-black text-3xl leading-none tracking-tighter mt-1">JORDAN.</div>
  <div className="flex justify-between font-mono font-extrabold mt-2"><span>$142</span><span>+18%</span></div>
</div>
```

### Chip / tag

```tsx
<span className="bg-white text-ink border-2 border-ink rounded-full px-2.5 py-0.5 text-[11px] font-extrabold">🌍 LIFE</span>
```

### Input

```tsx
<input className="w-full bg-transparent text-ink border-2 border-ink rounded-lg px-3 py-1.5 font-semibold text-sm focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all" />
```

### Streak bar (bottom rail)

```tsx
<div className="bg-ink text-canvas px-4 py-2 flex justify-between font-extrabold text-xs tracking-wide">
  <span>🔥 4-day streak · keep it going</span>
  <span>★ 12 takes · $1,247 bag · +$214 royalties</span>
</div>
```

## 6 · Motion

| Event | Animation | Duration |
|---|---|---|
| Card tap | press-down (-2px y) + shadow collapses (4px → 2px) | 120ms |
| Hover card | tilt amplifies by 0.5° | 200ms |
| Take success | confetti burst (5–8 particles, ink + pop + cool) + tilt wobble | 250ms |
| Streak counter | odometer flip on +1 | 400ms |
| Price up | scale 1 → 1.08 → 1, color flash from ink to cool | 300ms |
| Price down | shake (translateX ±2px, 3 cycles), color flash to pop | 300ms |
| Page enter | yellow fill from bottom (250ms) + content fade in (350ms) |
| Modal open | scale from 0.95 + opacity 0 → 1, with tilt(-1deg) | 250ms |

Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for any "pop" feel. Use linear for confetti and ticker.

## 7 · Iconography

- Use emoji for categories: 🏀 sports, ⚡ crypto, 🎬 cinema, 🤖 ai, 🍕 food, 🌍 life, 🎵 music, 🚀 founders.
- Use ★ as the universal "OMC" symbol — in nav logo, on primary CTAs (`★ MINT`).
- Use 🔥 for streaks and hot.
- No outline icons. No Lucide. No SF Symbols.

## 8 · Layout

- Page padding: 22–26px on desktop, 16px on mobile.
- Card grid gap: 14px desktop, 8px mobile.
- Max content width: none — let it bleed yellow.
- Nav: top, sticky, 60px tall, with `border-bottom: 2.5px dashed #15120D`.
- Footer: ink bar, full-bleed, single line with streak + royalties + "who's online".

## 9 · Accessibility

- Yellow + ink = 12.4:1 contrast — passes AAA.
- Pop + white = 4.1:1 — passes AA at 14px+.
- Pop + ink = 4.9:1 — passes AA for body.
- Cool is decorative — never put body text on cool alone.
- All interactive elements ≥44px hit target on mobile.
- Focus ring: 3px outline `#15120D`, offset 2px.

## 10 · Don'ts

- ❌ No gradients. Anywhere.
- ❌ No soft shadows (`rgba`, `blur > 0`).
- ❌ No purple, no teal-blue, no navy. Stay in the palette.
- ❌ No card with `rotate(0deg)`.
- ❌ No system font fallback in display type — load Inter Tight properly.
- ❌ No tooltips on price changes — use the inline +/- delta.
- ❌ No spinners — use a tilted card that says `loading…` with a wobble animation.
