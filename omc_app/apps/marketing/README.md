# OpinionMarketCap — Marketing Videos (Remotion)

Brand-accurate motion graphics for opinionmarketcap.xyz / app.opinionmarketcap.xyz.
Built with [Remotion](https://remotion.dev). Look = "Sticker Confidence" (yellow
canvas, ink borders, hard shadows, pink + cyan), pulled straight from the live
design tokens in `brand.ts`.

## Assets

| Composition id      | Format     | ~Length | Use                             |
| ------------------- | ---------- | ------- | ------------------------------- |
| `HeroExplainer`     | 1920×1080  | ~23s    | Site hero, YouTube, X header    |
| `OutbidShort`       | 1080×1920  | ~13s    | TikTok / Reels / Shorts         |
| `PriceLoop`         | 1080×1080  | ~10s    | X / Instagram feed (loops)      |
| `LogoSting`         | 1920×1080  | ~2.5s   | Intro / outro                   |
| `LogoStingVertical` | 1080×1920  | ~2.5s   | Vertical intro / outro          |

### Explainer thread (square, one clip per concept)

`Concept01Idea` … `Concept11CTA` — 11 × 1080×1080 clips (~11s each), one per
concept (what OMC is, minting, the 95/3/2 split, get-paid-when-outbid, 3%
royalties, dynamic pricing, self-exit, reclaim, pools, vs Polymarket, CTA).
Each = one tweet. `ExplainerThread` chains all 11 into one ~2-min square video.

Ready-to-paste tweet copy for the whole thread: **[THREAD.md](./THREAD.md)**.

```bash
npm run render:thread --workspace marketing   # → out/thread/
```

Concept data + copy lives in `src/compositions/Concepts.tsx`; the animated
visuals in `src/components/concept-visuals.tsx`.

### Audio

SFX + a warm, mellow melodic-house music bed (`music-modern.wav`), all
synthesized (100% original, no copyright) by `scripts/gen-audio.mjs` →
`public/audio/`. Regenerate with `node scripts/gen-audio.mjs`. Wiring lives in
`src/components/audio.tsx` (`MusicBed` defaults to `music-modern.wav`).

## Preview (live editor)

```bash
npm run dev --workspace marketing      # opens Remotion Studio in the browser
```

## Render

```bash
npm run render:hero   --workspace marketing
npm run render:short  --workspace marketing
npm run render:loop   --workspace marketing      # mp4
npm run render:loop-gif --workspace marketing    # gif for social
npm run render:sting  --workspace marketing
npm run render:all    --workspace marketing      # everything → out/
```

Output lands in `apps/marketing/out/`.

## Editing copy / numbers

- Brand colors, fonts, shadows: `src/brand.ts`
- Reusable card + counters + stickers: `src/components/`
- One file per video: `src/compositions/`
- Durations / dimensions: `src/Root.tsx`

All copy is plain JSX text — change a headline in the relevant composition and
re-render. The demo prices are illustrative; swap them for real on-chain numbers
anytime.
