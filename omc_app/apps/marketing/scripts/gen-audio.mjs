/**
 * Generates 100% original, copyright-safe audio for the marketing videos:
 * a set of arcade SFX + a seamless chiptune music loop. Pure synthesis,
 * no samples, no third-party audio. Writes 16-bit mono WAVs to public/audio/.
 *
 * Run:  node scripts/gen-audio.mjs   (from apps/marketing)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
mkdirSync(OUT, { recursive: true });

// ---- WAV writer ----------------------------------------------------------
function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 0x7fff) | 0, 44 + i * 2);
  }
  writeFileSync(join(OUT, name), buf);
  console.log(`  ✓ ${name} (${(n / SR).toFixed(2)}s)`);
}

// ---- oscillators & helpers ----------------------------------------------
const sine = (t, f) => Math.sin(2 * Math.PI * f * t);
const square = (t, f, duty = 0.5) => ((t * f) % 1 < duty ? 1 : -1);
const tri = (t, f) => 2 * Math.abs(2 * ((t * f) % 1) - 1) - 1;
const noise = () => Math.random() * 2 - 1;
const mid = (m) => 440 * Math.pow(2, (m - 69) / 12);
const buffer = (sec) => new Float32Array(Math.floor(sec * SR));
// short percussive envelope
const env = (i, len, a = 0.004, r = 0.06) => {
  const t = i / SR;
  const dur = len / SR;
  const atk = t < a ? t / a : 1;
  const rel = t > dur - r ? Math.max(0, (dur - t) / r) : 1;
  return atk * rel;
};
// one-pole lowpass with time-varying cutoff (Hz) — also used by the music
function lowpass(buf, cutoffAt) {
  let y = 0;
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const fc = cutoffAt(i / SR);
    const rc = 1 / (2 * Math.PI * fc);
    const a = 1 / SR / (rc + 1 / SR);
    y += a * (buf[i] - y);
    out[i] = y;
  }
  return out;
}
// light comb reverb for a polished "produced" tail
function verb(input, mix = 0.2) {
  const combs = [
    [0.0237, 0.5],
    [0.0307, 0.46],
    [0.0371, 0.44],
    [0.0411, 0.42],
  ];
  const wet = new Float32Array(input.length);
  for (const [dt, fb] of combs) {
    const d = Math.max(1, Math.floor(dt * SR));
    const cb = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) cb[i] = input[i] + (i >= d ? cb[i - d] * fb : 0);
    for (let i = 0; i < input.length; i++) wet[i] += cb[i] / combs.length;
  }
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] * (1 - mix) + wet[i] * mix;
  return out;
}

// ---- SFX -----------------------------------------------------------------
function pop() {
  // the classic UI "bubble pop" — quick sine blip up, soft and short
  const b = buffer(0.1);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = 480 + 380 * Math.min(1, t / 0.022); // 480 → 860 snap
    b[i] = sine(t, f) * Math.min(1, t / 0.003) * Math.exp(-t * 28) * 0.5;
  }
  writeWav("pop.wav", lowpass(b, () => 2800));
}

function whoosh() {
  // standard transition swish — airy noise + tone, with a band that opens & closes
  const dur = 0.45;
  const b = buffer(dur);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const p = t / dur;
    const tone = sine(t, 160 + 520 * p);
    const air = noise();
    const e = Math.sin(Math.PI * p); // amplitude bell
    b[i] = (tone * 0.35 + air * 0.65) * e * 0.4;
  }
  writeWav("whoosh.wav", lowpass(b, (t) => 700 + 1700 * Math.sin(Math.PI * (t / dur))));
}

function chaching() {
  // warm "ka-ching" — two soft ascending mid-range dings (no piercing highs)
  const b = buffer(0.7);
  const hit = (start, freqs, len) => {
    for (let i = 0; i < len * SR; i++) {
      const idx = Math.floor(start * SR) + i;
      if (idx >= b.length) break;
      const t = i / SR;
      let s = 0;
      for (const f of freqs) s += sine(t, f) + tri(t, f) * 0.18;
      s /= freqs.length;
      b[idx] += s * Math.exp(-t * 8) * 0.5;
    }
  };
  hit(0.0, [mid(69), mid(76)], 0.45); // A4 + E5
  hit(0.11, [mid(74), mid(81)], 0.55); // D5 + A5
  writeWav("chaching.wav", verb(lowpass(b, () => 2700), 0.16));
}

function sparkle() {
  // shimmer chime — soft ascending bells with a light reverb tail
  const b = buffer(0.75);
  const notes = [mid(72), mid(76), mid(79), mid(84)]; // C5 E5 G5 C6
  notes.forEach((f, k) => {
    const start = k * 0.06;
    for (let i = 0; i < 0.4 * SR; i++) {
      const idx = Math.floor(start * SR) + i;
      if (idx >= b.length) break;
      const t = i / SR;
      b[idx] += sine(t, f) * Math.exp(-t * 6) * 0.32;
      b[idx] += sine(t, f * 2) * Math.exp(-t * 10) * 0.05;
    }
  });
  writeWav("sparkle.wav", verb(lowpass(b, () => 3200), 0.22));
}

function impact() {
  // cinematic boom — deep sub drop + soft thud, with a reverb tail
  const b = buffer(0.7);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const sub = sine(t, 95 - 50 * Math.min(1, t / 0.12)); // 95 → 45 Hz drop
    const thud = noise() * Math.exp(-t * 40);
    b[i] = (sub * 0.85 * Math.exp(-t * 5) + thud * 0.22) * 0.8;
  }
  writeWav("impact.wav", verb(lowpass(b, () => 1400), 0.28));
}

function riser() {
  // classic white-noise up-riser — rising volume + opening filter + rising tone
  const dur = 2.6;
  const b = buffer(dur);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const p = t / dur;
    const air = noise() * p * p * 0.5; // swells in
    const tone = sine(t, 180 + 340 * p * p) * 0.1 * p;
    b[i] = air + tone;
  }
  // filter opens from dark to bright as it builds (capped so it never pierces)
  writeWav("riser.wav", lowpass(b, (t) => 500 + 3300 * (t / dur)));
}

// ---- saw / supersaw helper ----------------------------------------------
const saw = (t, f) => 2 * ((t * f) % 1) - 1;

// ---- Music: warm, mellow melodic-house bed (light, easy on the ear) ------
function music() {
  const BPM = 120;
  const beat = 60 / BPM;
  const bar = beat * 4;
  const bars = 4;
  const dur = bar * bars; // ~8s
  const N = Math.floor(dur * SR);

  const pad = new Float32Array(N); // soft chords (main element)
  const pluck = new Float32Array(N); // gentle sine arp (delayed)
  const bass = new Float32Array(N); // warm sine bass
  const drums = new Float32Array(N);

  // F minor: Fm7 - Db maj7 - Ab maj7 - Eb maj7  (i - VI - III - VII)
  const chords = [
    [53, 56, 60, 63], // Fm7
    [49, 53, 56, 60], // Dbmaj7
    [56, 60, 63, 67], // Abmaj7
    [51, 55, 58, 63], // Ebmaj7
  ];
  const roots = [41, 37, 44, 39]; // F2 Db2 Ab2 Eb2
  const det = [0.997, 1.0, 1.003]; // tight detune → warm, not beating/harsh

  for (let bi = 0; bi < bars; bi++) {
    const t0 = bi * bar;
    const chord = chords[bi];

    // --- pad: held chord, soft swell (the bed) ---
    for (const m of chord) {
      const f = mid(m);
      const s0 = Math.floor(t0 * SR);
      const L = Math.floor(bar * SR);
      for (let i = 0; i < L; i++) {
        const idx = s0 + i;
        if (idx >= N) break;
        const t = i / SR;
        const atk = Math.min(1, t / 0.35);
        const rel = Math.min(1, (bar - t) / 0.3);
        let v = 0;
        for (const d of det) v += saw(t, f * d);
        pad[idx] += (v / det.length) * atk * rel * 0.11;
      }
    }

    // --- bass: warm sine root, gentle pulse on each beat ---
    for (let bt = 0; bt < 4; bt++) {
      const f = mid(roots[bi]);
      const s0 = Math.floor((t0 + bt * beat) * SR);
      const L = Math.floor(beat * 0.9 * SR);
      for (let i = 0; i < L; i++) {
        const idx = s0 + i;
        if (idx >= N) break;
        const t = i / SR;
        const e = Math.min(1, t / 0.012) * Math.exp(-t * 2.6);
        bass[idx] += (sine(t, f) + sine(t, f * 2) * 0.18) * e * 0.42;
      }
    }

    // --- gentle sine arp: chord top notes, quarter notes (sparse) ---
    for (let q = 0; q < 4; q++) {
      const m = chord[(q + 1) % chord.length] + 12;
      const f = mid(m);
      const s0 = Math.floor((t0 + q * beat) * SR);
      const L = Math.floor(0.4 * SR);
      for (let i = 0; i < L; i++) {
        const idx = s0 + i;
        if (idx >= N) break;
        const t = i / SR;
        pluck[idx] += sine(t, f) * Math.min(1, t / 0.01) * Math.exp(-t * 5) * 0.10;
      }
    }

    // --- drums: soft four-on-the-floor, no harsh highs ---
    for (let bt = 0; bt < 4; bt++) {
      const tb = t0 + bt * beat;
      // soft kick every beat
      {
        const L = Math.floor(0.12 * SR);
        for (let i = 0; i < L; i++) {
          const idx = Math.floor(tb * SR) + i;
          if (idx >= N) break;
          const t = i / SR;
          drums[idx] += sine(t, 120 - 70 * Math.min(1, t / 0.05)) * Math.exp(-t * 16) * 0.5;
        }
      }
      // soft clap on 2 & 4
      if (bt === 1 || bt === 3) {
        const L = Math.floor(0.12 * SR);
        for (let i = 0; i < L; i++) {
          const idx = Math.floor(tb * SR) + i;
          if (idx >= N) break;
          const t = i / SR;
          drums[idx] += noise() * Math.exp(-t * 34) * 0.12;
        }
      }
      // quiet closed hat on the offbeat only
      {
        const th = tb + beat / 2;
        const L = Math.floor(0.025 * SR);
        for (let i = 0; i < L; i++) {
          const idx = Math.floor(th * SR) + i;
          if (idx >= N) break;
          const t = i / SR;
          drums[idx] += noise() * Math.exp(-t * 110) * 0.06;
        }
      }
    }
  }

  // mellow the pad (low cutoff), gentle delay on the arp for space
  const padF = lowpass(pad, (t) => 850 + 450 * (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / dur)));
  const pluckD = new Float32Array(N);
  const dly = Math.floor(beat * 0.75 * SR);
  for (let i = 0; i < N; i++) {
    pluckD[i] = pluck[i] + (i >= dly ? pluckD[i - dly] * 0.38 : 0);
  }

  // mix — gentle, no hard drive
  const mixBuf = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    mixBuf[i] = padF[i] + bass[i] + pluckD[i] * 0.6 + drums[i];
  }
  // master low-pass tames any remaining fizz so it never bites the ear
  const mastered = lowpass(mixBuf, () => 6500);

  const b = buffer(dur);
  for (let i = 0; i < N; i++) b[i] = Math.tanh(mastered[i] * 1.05);

  // normalize to ~0.82 peak (no fades → seamless loop)
  let peak = 0;
  for (let i = 0; i < b.length; i++) peak = Math.max(peak, Math.abs(b[i]));
  const g = peak > 0 ? 0.82 / peak : 1;
  for (let i = 0; i < b.length; i++) b[i] *= g;
  writeWav("music-modern.wav", b);
}

console.log("Generating audio →", OUT);
pop();
whoosh();
chaching();
sparkle();
impact();
riser();
music();
console.log("Done.");
