import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ParticleWorld } from "./ParticleWorld";
import timing from "./timing.json";

const eventDecay = (time: number, at: number, rate: number) =>
  time < at ? 0 : Math.exp(-(time - at) * rate);

export const BecomingFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const warm = interpolate(time, [15.4, 19], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const center =
    eventDecay(time, timing.spark, 5) * 0.5 +
    eventDecay(time, timing.gather, 3) * 0.28 +
    eventDecay(time, timing.break, 9) * 0.9 +
    eventDecay(time, timing.release, 2) * 0.6;
  const flash =
    eventDecay(time, timing.break, 16) * 0.6 +
    eventDecay(time, timing.release, 10) * 0.23;
  return (
    <AbsoluteFill style={{ backgroundColor: "#010205", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 48%, rgba(${Math.round(9 + warm * 25)},${Math.round(17 + warm * 1)},${Math.round(29 - warm * 19)},.72),transparent 62%)`,
        }}
      />
      <ParticleWorld />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 48%, rgba(${warm > 0.5 ? "255,185,92" : "104,211,255"},${center * 0.45}),transparent 29%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundColor: "#d8eeff",
          opacity: flash,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center,transparent 47%,rgba(0,0,0,.60) 100%)",
        }}
      />
      <Interactive.Div
        name="End title"
        style={{
          position: "absolute",
          bottom: 98,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: '"Songti SC", "Noto Serif CJK SC", serif',
          fontSize: 42,
          letterSpacing: 18,
          color: "#f7e9cf",
          opacity: interpolate(frame, [1464, 1512, 1572, 1638], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [1464, 1512], ["0px 14px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        成形
      </Interactive.Div>
      <AbsoluteFill
        style={{
          background: "#000000",
          pointerEvents: "none",
          opacity: interpolate(frame, [0, 30, 1620, 1679], [1, 0, 0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Audio
        name="Synchronized sound design — no speech"
        src={staticFile("audio/becoming-v2/sound-design.wav")}
      />
    </AbsoluteFill>
  );
};
