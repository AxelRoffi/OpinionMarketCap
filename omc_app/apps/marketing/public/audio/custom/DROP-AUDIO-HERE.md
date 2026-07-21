# Drop your real "product video" audio here

The videos already handle all the timing + mixing. To replace the synthesized
sounds with real stock audio, drop files in **this folder** and repoint them in
`src/audio-config.ts` (one line each). mp3 / wav / m4a all work.

## What to drop (suggested filenames)

| Logical sound | Used for                         | Suggested file        |
| ------------- | -------------------------------- | --------------------- |
| music         | the music bed (loops everywhere) | `music.mp3`           |
| pop           | element / card pops in           | `pop.mp3`             |
| whoosh        | scene transitions                | `whoosh.mp3`          |
| chaching      | money / payout moments           | `chaching.mp3`        |
| sparkle       | logo / highlight shimmer         | `sparkle.mp3`         |
| impact        | big reveal boom                  | `impact.mp3`          |
| riser         | price-climb build                | `riser.mp3`           |

Then in `src/audio-config.ts`:

```ts
export const AUDIO_FILES = {
  "music-modern.wav": "audio/custom/music.mp3",
  "pop.wav":          "audio/custom/pop.mp3",
  "whoosh.wav":       "audio/custom/whoosh.mp3",
  "chaching.wav":     "audio/custom/chaching.mp3",
  "sparkle.wav":      "audio/custom/sparkle.mp3",
  "impact.wav":       "audio/custom/impact.mp3",
  "riser.wav":        "audio/custom/riser.mp3",
};
```

Re-render and you're done. (You don't need all of them — any file you don't
replace keeps the synthesized fallback.)

## Where to get them — free for commercial use, no copyright strikes

- **YouTube Audio Library** (studio.youtube.com → Audio Library) — free music +
  SFX, no attribution, no API. Easiest.
- **Pixabay** (pixabay.com/sound-effects, /music) — free commercial, no
  attribution.
- **Mixkit** (mixkit.co/free-sound-effects, /free-stock-music) — free commercial.
- **Uppbeat** (uppbeat.io) — free tier (attribution on free).

If you have **Epidemic Sound** or **Artlist**, even better — drop those.

Search terms that get the "product video" sound:
`whoosh transition`, `ui pop`, `cash register`, `magic sparkle`, `cinematic
boom impact`, `riser sweep up`; music: `corporate upbeat`, `modern technology`,
`lo-fi`, `future bass`.
