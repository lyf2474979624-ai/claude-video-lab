import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {Backdrop} from "../components/Backdrop";

type Props = {readonly accentColor: string};
const steps = [
  {number: "01", title: "你描述", note: "主题、时长、画幅、风格"},
  {number: "02", title: "Agent 写代码", note: "场景、动画、字幕、音频"},
  {number: "03", title: "Remotion 渲染", note: "逐帧生成、导出 MP4"},
];

export const WorkflowScene: React.FC<Props> = ({accentColor}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Backdrop accentColor={accentColor} />
      <Interactive.Div
        name="工作流标题"
        style={{
          position: "absolute",
          left: 110,
          top: 100,
          color: "#f8f7ff",
          fontSize: 76,
          fontWeight: 850,
          letterSpacing: -3,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        它到底是怎么生成的？
      </Interactive.Div>
      <div style={{position: "absolute", left: 110, right: 110, top: 300, display: "flex", gap: 34}}>
        {steps.map((step, index) => (
          <div
            key={step.number}
            style={{
              flex: 1,
              minHeight: 430,
              padding: "48px 44px",
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,.14)",
              backgroundColor: "rgba(255,255,255,.055)",
              boxShadow: "0 24px 80px rgba(0,0,0,.28)",
              opacity: interpolate(frame, [18 + index * 16, 38 + index * 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [18 + index * 16, 38 + index * 16], ["0px 80px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <div style={{color: accentColor, fontSize: 28, fontWeight: 800, letterSpacing: 3}}>{step.number}</div>
            <div style={{color: "#ffffff", fontSize: 56, lineHeight: 1.18, fontWeight: 800, marginTop: 80}}>{step.title}</div>
            <div style={{color: "rgba(255,255,255,.58)", fontSize: 30, lineHeight: 1.55, marginTop: 28}}>{step.note}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
