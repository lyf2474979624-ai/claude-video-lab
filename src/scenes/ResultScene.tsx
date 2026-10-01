import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {Backdrop} from "../components/Backdrop";

type Props = {readonly accentColor: string};

export const ResultScene: React.FC<Props> = ({accentColor}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Backdrop accentColor={accentColor} />
      <Interactive.Div
        name="结果标题"
        style={{
          position: "absolute",
          left: 110,
          top: 142,
          color: "#f8f7ff",
          fontSize: 102,
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: -5,
          opacity: interpolate(frame, [0, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 22], ["0px 70px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        今天的样片，<br />明天就是你的模板。
      </Interactive.Div>
      <Interactive.Div
        name="命令卡片"
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          bottom: 130,
          padding: "36px 44px",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,.16)",
          backgroundColor: "rgba(10,10,18,.78)",
          color: "#e9e4ff",
          fontFamily: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 34,
          boxShadow: `0 0 80px ${accentColor}22`,
          opacity: interpolate(frame, [28, 50, 104, 119], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
        }}
      >
        <span style={{color: accentColor}}>$</span> npm run render
        <span style={{float: "right", color: "rgba(255,255,255,.45)"}}>out/claude-video-demo.mp4</span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
