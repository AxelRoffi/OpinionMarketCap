/**
 * Single source of truth for every sound used in the videos.
 *
 * To swap in real "product video" stock audio (Epidemic / Artlist / Pixabay /
 * Mixkit / YouTube Audio Library): drop your files in `public/audio/custom/`
 * and repoint the path here. Paths are relative to `public/`. Any format
 * Remotion supports works (mp3 / wav / m4a).
 *
 * Defaults below point to the synthesized fallback sounds. Replace freely —
 * no other file needs to change; all compositions read through this map.
 */
export const AUDIO_FILES: Record<string, string> = {
  // music bed (looped under every video)
  "music-modern.wav": "audio/music-modern.wav",
  // one-shot SFX
  "pop.wav": "audio/pop.wav", // element / card pops in
  "whoosh.wav": "audio/whoosh.wav", // scene transition swish
  "chaching.wav": "audio/chaching.wav", // money / payout
  "sparkle.wav": "audio/sparkle.wav", // logo / highlight shimmer
  "impact.wav": "audio/impact.wav", // big reveal boom
  "riser.wav": "audio/riser.wav", // price-climb build
};

/** Resolve a logical sound name to its public-relative file path. */
export const resolveAudio = (name: string): string =>
  AUDIO_FILES[name] ?? `audio/${name}`;
