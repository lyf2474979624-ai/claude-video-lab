import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const file = path.resolve(process.argv[2] ?? "out/becoming-v2.mp4");
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
  { encoding: "utf8" },
);
if (probe.status !== 0) throw new Error(probe.stderr);
const metadata = JSON.parse(probe.stdout);
const video = metadata.streams.find((s) => s.codec_type === "video");
const audio = metadata.streams.find((s) => s.codec_type === "audio");
const [num, den] = video.avg_frame_rate.split("/").map(Number);
const fps = num / den;
const width = 160,
  height = 68,
  frameSize = width * height;
const decode = spawnSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-i",
    file,
    "-map",
    "0:v:0",
    "-vf",
    `scale=${width}:${height},format=gray`,
    "-f",
    "rawvideo",
    "pipe:1",
  ],
  { maxBuffer: 80 * 1024 * 1024 },
);
if (decode.status !== 0) throw new Error(decode.stderr.toString());
const frames = Math.floor(decode.stdout.length / frameSize);
let identical = 0,
  longest = 0,
  run = 0;
const windows = [];
let sum = 0,
  samples = 0,
  maximum = 0;
for (let f = 1; f < frames; f++) {
  let diff = 0;
  for (let p = 0; p < frameSize; p++)
    diff += Math.abs(
      decode.stdout[f * frameSize + p] - decode.stdout[(f - 1) * frameSize + p],
    );
  const mean = diff / frameSize;
  if (diff === 0) {
    identical++;
    run++;
    longest = Math.max(longest, run);
  } else run = 0;
  sum += mean;
  samples++;
  maximum = Math.max(maximum, mean);
  if (f % fps === 0 || f === frames - 1) {
    windows.push({
      second: Math.floor(f / fps),
      meanAdjacentFrameDifference: Number((sum / samples).toFixed(4)),
      maxDifference: Number(maximum.toFixed(4)),
    });
    sum = 0;
    samples = 0;
    maximum = 0;
  }
}
const result = {
  file,
  width: video.width,
  height: video.height,
  fps,
  frames,
  duration: Number(metadata.format.duration),
  audio: audio
    ? {
        codec: audio.codec_name,
        channels: audio.channels,
        sampleRate: audio.sample_rate,
      }
    : null,
  consecutiveIdenticalPairs: identical,
  longestIdenticalRunSeconds: Number((longest / fps).toFixed(3)),
  windows,
  interpretation:
    "Adjacent-frame changes verify motion exists; they do not measure artistic quality. Black opening/ending frames can legitimately match.",
};
writeFileSync(
  file.replace(/\.mp4$/, ".motion-check.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      fps,
      frames,
      duration: result.duration,
      audio: result.audio,
      consecutiveIdenticalPairs: identical,
      longestIdenticalRunSeconds: result.longestIdenticalRunSeconds,
    },
    null,
    2,
  ),
);
if (
  !audio ||
  frames < 60 ||
  windows.slice(1, -1).some((w) => w.meanAdjacentFrameDifference === 0)
)
  process.exitCode = 1;
