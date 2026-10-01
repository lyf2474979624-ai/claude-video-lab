import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const timing = JSON.parse(
  readFileSync(path.join(project, "src/film-v2/timing.json"), "utf8"),
);
const dir = path.join(project, "public/audio/becoming-v2");
mkdirSync(dir, { recursive: true });
const sr = 48000;
const length = Math.round(timing.duration * sr);
const left = new Float64Array(length);
const right = new Float64Array(length);
const TAU = Math.PI * 2;
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, t) => {
  const p = clamp((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};
let seed = 18727;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};
const events = [];

function sound(name, start, duration, fn, pan = () => 0, level = 1) {
  events.push({ name, start, duration });
  const begin = Math.round(start * sr);
  const n = Math.round(duration * sr);
  for (let j = 0; j < n; j++) {
    const i = begin + j;
    if (i < 0 || i >= length) continue;
    const age = j / sr;
    const value = fn(age, j) * level;
    const p = Math.max(-1, Math.min(1, pan(age)));
    left[i] += value * Math.cos(((p + 1) * Math.PI) / 4);
    right[i] += value * Math.sin(((p + 1) * Math.PI) / 4);
  }
}

// A quiet moving air bed; leaves headroom for foreground actions.
let air = 0;
sound(
  "space / moving air",
  0,
  28,
  (t) => {
    air = 0.985 * air + 0.015 * noise();
    const opening = smooth(0, 2, t);
    const ending = 1 - smooth(25.5, 28, t);
    const hush = 1 - 0.9 * smooth(11.6, 12.3, t) * (1 - smooth(12.8, 13, t));
    const breath = 0.62 + 0.38 * Math.sin(t * 0.45) ** 2;
    return (
      (air * 0.105 +
        Math.sin(TAU * 32.7 * t) * 0.012 +
        Math.sin(TAU * 49 * t) * 0.006) *
      opening *
      ending *
      hush *
      breath
    );
  },
  (t) => Math.sin(t * 0.23) * 0.6,
);

function bell(name, start, freq, amp, duration = 1.8, pan = 0) {
  sound(
    name,
    start,
    duration,
    (t) => {
      const attack = 1 - Math.exp(-t * 190);
      const body = Math.sin(TAU * freq * t) * Math.exp(-t * 2.9);
      const metal =
        0.28 * Math.sin(TAU * freq * 2.71 * t) * Math.exp(-t * 5.1) +
        0.14 * Math.sin(TAU * freq * 4.13 * t) * Math.exp(-t * 8.5);
      return (
        attack *
        (body + metal) *
        amp *
        (1 - smooth(duration - 0.22, duration, t))
      );
    },
    () => pan,
  );
}

function sweep(name, start, duration, amp, direction = 1) {
  let low = 0,
    slow = 0,
    phase = 0;
  sound(
    name,
    start,
    duration,
    (t) => {
      const p = t / duration;
      const raw = noise();
      low += (0.028 + 0.27 * p) * (raw - low);
      slow += 0.018 * (low - slow);
      phase += (TAU * (90 + 1400 * p * p)) / sr;
      const shape = Math.sin(Math.PI * p) ** 2.4;
      return ((low - slow) * 1.5 + 0.032 * Math.sin(phase)) * shape * amp;
    },
    (t) => direction * ((1.6 * t) / duration - 0.8),
  );
}

function impact(name, start, amp, pitch = 72) {
  let phase = 0,
    low = 0;
  sound(name, start, 2.1, (t) => {
    phase += (TAU * (31 + pitch * Math.exp(-t * 17))) / sr;
    low = 0.74 * low + 0.26 * noise();
    const thud = Math.sin(phase) * Math.exp(-t * 5) * (1 - Math.exp(-t * 350));
    const snap = low * 0.6 * Math.exp(-t * 40);
    const metal =
      0.085 *
      (Math.sin(TAU * 387 * t) + Math.sin(TAU * 613 * t)) *
      Math.exp(-t * 9);
    return (thud + snap + metal) * amp * (1 - smooth(1.6, 2.1, t));
  });
}

bell("first spark", timing.spark, 1380, 0.095, 2.1, -0.25);
bell("answering spark", timing.spark + 0.2, 2070, 0.035, 1.2, 0.6);
sweep("particles drawn into core", 0.8, 3, 0.21, -1);
impact("core closes", timing.gather, 0.18, 115);
sweep("launch / inhalation", 4.25, 1.05, 0.34, 1);
impact("launch / bass release", timing.launch, 0.25, 95);

timing.passes.forEach((at, i) => {
  sweep(
    `ring pass ${i + 1}`,
    at - 0.33,
    0.68,
    0.24 + i * 0.018,
    i % 2 === 0 ? 1 : -1,
  );
  bell(
    `ring edge ${i + 1}`,
    at,
    330 * Math.pow(2, (i % 4) / 5),
    0.032,
    0.5,
    i % 2 === 0 ? 0.7 : -0.7,
  );
});
sweep("compression pressure", 10.55, 1.8, 0.25, -1);
let compressionPhase = 0;
sound(
  "tightening filament",
  timing.compression,
  1.6,
  (t) => {
    compressionPhase += (TAU * (140 + 980 * (t / 1.6) ** 3)) / sr;
    return (
      Math.sin(compressionPhase) * 0.07 * Math.sin((Math.PI * t) / 1.6) ** 1.4
    );
  },
  (t) => Math.sin(t * 9) * 0.25,
);

impact("crystal rupture", timing.break, 0.66, 155);
timing.aftershocks.forEach((at, i) =>
  impact(
    `fracture aftershock ${i + 1}`,
    at,
    0.11 / (1 + i * 0.6),
    105 + i * 40,
  ),
);
for (let i = 0; i < 55; i++) {
  const offset = 0.035 + ((noise() + 1) / 2) ** 1.5 * 2.5;
  const freq = 1200 + (noise() + 1) * 3600;
  const pan = noise() * 0.92;
  bell(
    `flying shard ${i + 1}`,
    timing.break + offset,
    freq,
    0.013 + ((noise() + 1) / 2) * 0.025,
    0.28 + ((noise() + 1) / 2) * 0.9,
    pan,
  );
}

sweep("reassembly / long inhalation", 14.15, 2.1, 0.27, -1);
impact("wave ignition", timing.release, 0.38, 65);
timing.waves.forEach((at, i) => {
  sweep(
    `expanding wave ${i + 1}`,
    at - 0.6,
    1.45,
    0.24 - i * 0.025,
    i % 2 ? 1 : -1,
  );
  bell(
    `wave resonance ${i + 1}`,
    at,
    164.81 * Math.pow(1.5, i),
    0.07,
    3.2,
    (i - 1) * 0.45,
  );
});

sound(
  "warm resonating structure",
  16.2,
  8.3,
  (t) => {
    const swell = smooth(0, 1.6, t) * (1 - smooth(4.2, 8.3, t));
    return (
      (0.024 * Math.sin(TAU * 82.4069 * t) +
        0.018 * Math.sin(TAU * 123.4708 * t) +
        0.009 * Math.sin(TAU * 164.8138 * t)) *
      swell *
      (0.8 + 0.2 * Math.sin(t * 1.7))
    );
  },
  (t) => Math.sin(t * 0.38) * 0.35,
);
sweep("final sphere gathers", 21.1, 1.3, 0.19, 1);
bell("form / final resonance", timing.resolve, 329.6276, 0.105, 5, 0);
bell(
  "form / upper resonance",
  timing.resolve + 0.19,
  493.8833,
  0.052,
  4.6,
  -0.4,
);
bell("last point of light", timing.end, 1318.51, 0.019, 1.5, 0.3);

// Short cross-channel reflections create depth without burying the transients.
const dryL = left.slice(),
  dryR = right.slice();
for (const [delay, gain] of [
  [0.113, 0.13],
  [0.227, 0.095],
  [0.389, 0.065],
  [0.617, 0.04],
]) {
  const samples = Math.round(delay * sr);
  for (let i = samples; i < length; i++) {
    left[i] += dryR[i - samples] * gain;
    right[i] += dryL[i - samples] * gain;
  }
}
let peak = 0;
for (let i = 0; i < length; i++)
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
const gain = 0.87 / Math.max(peak, 0.87);
const data = Buffer.alloc(44 + length * 4);
data.write("RIFF", 0);
data.writeUInt32LE(data.length - 8, 4);
data.write("WAVEfmt ", 8);
data.writeUInt32LE(16, 16);
data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22);
data.writeUInt32LE(sr, 24);
data.writeUInt32LE(sr * 4, 28);
data.writeUInt16LE(4, 32);
data.writeUInt16LE(16, 34);
data.write("data", 36);
data.writeUInt32LE(length * 4, 40);
for (let i = 0; i < length; i++) {
  const fade = smooth(0, 0.04, i / sr) * (1 - smooth(27.35, 28, i / sr));
  data.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, left[i] * gain * fade)) * 32767),
    44 + i * 4,
  );
  data.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, right[i] * gain * fade)) * 32767),
    46 + i * 4,
  );
}
const raw = path.join(dir, "sound-design-raw.wav");
const output = path.join(dir, "sound-design.wav");
writeFileSync(raw, data);
const normalize = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    raw,
    "-af",
    "loudnorm=I=-18:TP=-1.5:LRA=12",
    "-ar",
    "48000",
    "-c:a",
    "pcm_s24le",
    output,
    "-loglevel",
    "error",
  ],
  { stdio: "inherit" },
);
if (normalize.status !== 0) process.exit(normalize.status ?? 1);
writeFileSync(
  path.join(dir, "events.json"),
  JSON.stringify(
    { duration: timing.duration, sampleRate: sr, events },
    null,
    2,
  ) + "\n",
);
console.log(
  `Generated ${events.length} synchronized sound layers; stereo, 48 kHz, ${timing.duration}s. No speech.`,
);
