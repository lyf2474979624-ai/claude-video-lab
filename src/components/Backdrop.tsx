import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export const Backdrop: React.FC<{readonly accentColor: string}> = ({accentColor}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 16% 18%, #21183d 0%, #0b0b16 38%, #050508 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: accentColor,
          filter: "blur(150px)",
          opacity: 0.16,
          right: -120,
          top: -240,
          translate: interpolate(frame, [0, 120], ["0px 0px", "-80px 70px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.11,
          backgroundImage: "linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
    </AbsoluteFill>
  );
};
