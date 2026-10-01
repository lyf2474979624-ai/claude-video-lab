import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {Backdrop} from "../components/Backdrop";

type Props = {readonly title: string; readonly accentColor: string};

export const HookScene: React.FC<Props> = ({title, accentColor}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Backdrop accentColor={accentColor} />
      <Interactive.Div
        name="Claude Code 标签"
        style={{
          position: "absolute",
          left: 110,
          top: 92,
          padding: "14px 24px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.18)",
          color: "#d8ccff",
          backgroundColor: "rgba(139,92,246,.12)",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 1,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        CLAUDE CODE × REMOTION
      </Interactive.Div>
      <Interactive.Div
        name="主标题"
        style={{
          position: "absolute",
          left: 110,
          top: 250,
          width: 1400,
          color: "#f8f7ff",
          fontSize: 122,
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: -6,
          opacity: interpolate(frame, [10, 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [10, 32], ["0px 70px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {title}
      </Interactive.Div>
      <Interactive.Div
        name="副标题"
        style={{
          position: "absolute",
          left: 118,
          bottom: 150,
          color: "rgba(248,247,255,.7)",
          fontSize: 42,
          fontWeight: 500,
          opacity: interpolate(frame, [38, 60, 102, 119], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
        }}
      >
        不是魔法：自然语言 → React 动画 → MP4
      </Interactive.Div>
    </AbsoluteFill>
  );
};
