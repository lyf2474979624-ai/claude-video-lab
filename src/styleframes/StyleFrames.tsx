import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, Interactive} from "remotion";

const sans =
  'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
const serif = 'Iowan Old Style, Baskerville, "Times New Roman", serif';

const Shell: React.FC<{
  children: ReactNode;
  background: string;
  label: string;
}> = ({children, background, label}) => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        color: "#f4f7ff",
        background,
        fontFamily: sans,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.13,
          mixBlendMode: "screen",
          backgroundImage:
            "repeating-radial-gradient(circle at 17% 31%, rgba(255,255,255,.42) 0 0.55px, transparent 0.75px 3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "1px solid rgba(186,210,255,0.08)",
          pointerEvents: "none",
        }}
      />
      <Interactive.Div
        name="Frame index"
        style={{
          position: "absolute",
          right: 70,
          top: 54,
          color: "rgba(220,232,255,0.38)",
          fontFamily: sans,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 5,
        }}
      >
        {label}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const Seed: React.FC<{left: number; top: number; size?: number; color?: string}> = ({
  left,
  top,
  size = 32,
  color = "#8ff7ff",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        rotate: "45deg",
        border: `1px solid ${color}`,
        boxShadow: `0 0 24px ${color}, inset 0 0 18px ${color}55`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 5,
          height: 5,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: `0 0 18px 5px ${color}`,
        }}
      />
    </div>
  );
};

const Meta: React.FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => {
  return (
    <div
      style={{
        position: "absolute",
        color: "rgba(212,226,255,0.48)",
        fontSize: 13,
        lineHeight: 1.7,
        letterSpacing: 3,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const IgnitionFrame: React.FC = () => {
  return (
    <Shell
      label="01 / IGNITION"
      background="radial-gradient(circle at 73% 48%, #10283b 0%, #071018 18%, #020407 48%, #010203 100%)"
    >
      <div
        style={{
          position: "absolute",
          left: 1375,
          top: 177,
          width: 430,
          height: 430,
          border: "1px solid rgba(125,238,255,0.12)",
          borderRadius: "50%",
          boxShadow: "0 0 100px rgba(47,210,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1450,
          top: 252,
          width: 280,
          height: 280,
          border: "1px dashed rgba(125,238,255,0.22)",
          borderRadius: "50%",
          rotate: "-16deg",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1556,
          top: 358,
          width: 68,
          height: 68,
          border: "1px solid rgba(125,238,255,0.34)",
          borderRadius: "50%",
          boxShadow: "0 0 65px rgba(95,238,255,0.22)",
        }}
      />
      <Seed left={1572} top={374} size={36} />

      <Interactive.Div
        name="Opening eyebrow"
        style={{
          position: "absolute",
          left: 116,
          top: 112,
          color: "#8ff7ff",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 7,
        }}
      >
        THE FIRST SIGNAL
      </Interactive.Div>
      <Interactive.Div
        name="Opening title"
        style={{
          position: "absolute",
          left: 106,
          top: 260,
          width: 950,
          color: "#f4f7ff",
          fontFamily: serif,
          fontSize: 94,
          fontWeight: 400,
          lineHeight: 1.14,
          letterSpacing: -3,
        }}
      >
        一个念头，
        <br />
        如何成为画面？
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 530,
          width: 72,
          height: 1,
          background: "#8ff7ff",
          boxShadow: "0 0 14px #8ff7ff",
        }}
      />
      <Meta style={{left: 112, bottom: 62}}>
        THOUGHT → FORM
        <br />
        A STUDY IN GENERATED MOTION
      </Meta>
    </Shell>
  );
};

export const DriftFrame: React.FC = () => {
  const arcs = Array.from({length: 15}, (_, index) => index);
  const rays = Array.from({length: 17}, (_, index) => index);

  return (
    <Shell
      label="02 / DRIFT"
      background="radial-gradient(ellipse at 70% 72%, #12365a 0%, #081526 27%, #020509 64%, #010203 100%)"
    >
      <svg
        width="1920"
        height="804"
        viewBox="0 0 1920 804"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id="drift-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6feaff" stopOpacity="0" />
            <stop offset="0.62" stopColor="#6feaff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#bca8ff" stopOpacity="0.05" />
          </linearGradient>
          <filter id="drift-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {rays.map((index) => {
          const y = 170 + index * 31;
          const targetY = 410 + (index - 8) * 2.4;
          return (
            <path
              key={`ray-${index}`}
              d={`M 120 ${y} C 620 ${y - 46}, 1080 ${targetY}, 1520 410`}
              fill="none"
              stroke="url(#drift-line)"
              strokeWidth={index === 8 ? 1.7 : 0.8}
            />
          );
        })}
        {arcs.map((index) => (
          <ellipse
            key={`arc-${index}`}
            cx="1520"
            cy="410"
            rx={42 + index * 48}
            ry={13 + index * 14}
            fill="none"
            stroke="#7feeff"
            strokeOpacity={0.33 - index * 0.015}
            strokeWidth="0.8"
          />
        ))}
        <path
          d="M 146 540 C 590 500, 900 294, 1210 352 S 1530 430, 1800 184"
          fill="none"
          stroke="#b8f9ff"
          strokeOpacity="0.72"
          strokeWidth="2"
          filter="url(#drift-glow)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 1460,
          top: 350,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(105,232,255,0.04)",
          boxShadow: "0 0 120px 26px rgba(71,207,255,0.15)",
        }}
      />
      <Seed left={1502} top={392} size={36} />
      <Interactive.Div
        name="Drift title"
        style={{
          position: "absolute",
          left: 108,
          top: 84,
          color: "rgba(238,247,255,0.92)",
          fontFamily: serif,
          fontSize: 72,
          fontWeight: 400,
          letterSpacing: -2,
        }}
      >
        它开始寻找形状。
      </Interactive.Div>
      <Interactive.Div
        name="Drift subtitle"
        style={{
          position: "absolute",
          left: 114,
          top: 182,
          color: "rgba(143,247,255,0.68)",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: 5,
        }}
      >
        IT BEGINS TO SEARCH FOR FORM
      </Interactive.Div>
      <Meta style={{right: 106, bottom: 52, textAlign: "right"}}>
        15 TRAJECTORIES
        <br />
        ONE ATTRACTOR
      </Meta>
    </Shell>
  );
};

export const FractureFrame: React.FC = () => {
  return (
    <Shell
      label="03 / FRACTURE"
      background="linear-gradient(112deg, #010307 0%, #07101b 52%, #19071a 100%)"
    >
      <div
        style={{
          position: "absolute",
          left: 1035,
          top: -220,
          width: 2,
          height: 1250,
          rotate: "23deg",
          background: "linear-gradient(180deg, transparent, #6cf1ff, #ff4fc8, transparent)",
          boxShadow: "0 0 32px #8ceeffaa",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: -180,
          width: 360,
          height: 1200,
          rotate: "23deg",
          background:
            "linear-gradient(90deg, rgba(70,225,255,0.03), rgba(255,57,195,0.18), transparent)",
          filter: "blur(18px)",
        }}
      />
      <Interactive.Div
        name="Fracture word back"
        style={{
          position: "absolute",
          left: 94,
          top: 197,
          color: "rgba(85,227,255,0.16)",
          fontFamily: sans,
          fontSize: 188,
          fontWeight: 800,
          lineHeight: 0.84,
          letterSpacing: -12,
          translate: "-12px 0px",
        }}
      >
        失真
      </Interactive.Div>
      <Interactive.Div
        name="Fracture word front"
        style={{
          position: "absolute",
          left: 114,
          top: 197,
          color: "rgba(255,245,253,0.96)",
          fontFamily: sans,
          fontSize: 188,
          fontWeight: 800,
          lineHeight: 0.84,
          letterSpacing: -12,
          textShadow: "14px 0 0 rgba(255,52,191,0.20)",
        }}
      >
        失真
      </Interactive.Div>
      <Interactive.Div
        name="Fracture English"
        style={{
          position: "absolute",
          left: 112,
          top: 405,
          color: "rgba(143,247,255,0.9)",
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: 17,
        }}
      >
        DISTORTION
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 913,
          top: 329,
          width: 162,
          height: 162,
          rotate: "45deg",
          border: "1px solid rgba(126,240,255,0.55)",
          boxShadow:
            "-22px 12px 0 rgba(70,226,255,0.08), 22px -12px 0 rgba(255,65,196,0.11), 0 0 80px rgba(206,86,255,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 980,
          top: 380,
          width: 18,
          height: 18,
          rotate: "45deg",
          background: "#ffffff",
          boxShadow: "0 0 35px 12px #e85bffaa",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 108,
          right: 108,
          top: 520,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(130,242,255,0.62), transparent 37%, transparent 65%, rgba(255,71,196,0.44))",
        }}
      />
      <Meta style={{left: 112, bottom: 57}}>
        THE SIGNAL RESISTS ITS OWN SHAPE
      </Meta>
      <Interactive.Div
        name="Fracture caption"
        style={{
          position: "absolute",
          right: 112,
          bottom: 54,
          width: 520,
          color: "rgba(240,232,247,0.54)",
          fontFamily: serif,
          fontSize: 24,
          fontStyle: "italic",
          textAlign: "right",
          letterSpacing: 1,
        }}
      >
        不是每一种形状，都能装下它。
      </Interactive.Div>
    </Shell>
  );
};

export const EmergenceFrame: React.FC = () => {
  const rings = Array.from({length: 9}, (_, index) => index);
  const spokes = Array.from({length: 28}, (_, index) => index);

  return (
    <Shell
      label="04 / EMERGENCE"
      background="radial-gradient(ellipse at 50% 82%, #fb8a65 0%, #a85aff 13%, #2858a7 28%, #081427 47%, #010307 73%)"
    >
      <div
        style={{
          position: "absolute",
          left: 270,
          right: 270,
          top: 605,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #69edff 18%, #ffffff 50%, #ff9e74 82%, transparent)",
          boxShadow: "0 0 40px 10px rgba(130,202,255,0.45)",
        }}
      />
      <svg
        width="1920"
        height="804"
        viewBox="0 0 1920 804"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id="emergence-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#67eaff" stopOpacity="0.08" />
            <stop offset="0.52" stopColor="#f8f5ff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ff9f78" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {rings.map((index) => (
          <ellipse
            key={`ring-${index}`}
            cx="960"
            cy="606"
            rx={105 + index * 94}
            ry={32 + index * 32}
            fill="none"
            stroke="url(#emergence-ring)"
            strokeWidth={index === 0 ? 2 : 0.8}
          />
        ))}
        {spokes.map((index) => {
          const x = 110 + index * 63;
          const spread = (x - 960) * 0.43;
          return (
            <line
              key={`spoke-${index}`}
              x1="960"
              y1="606"
              x2={960 + spread}
              y2="804"
              stroke="#95eaff"
              strokeOpacity="0.11"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 850,
          top: 496,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #ffffff 0%, #a9f8ff 4%, rgba(132,98,255,.88) 18%, rgba(255,113,92,.24) 39%, transparent 68%)",
          boxShadow: "0 0 150px rgba(146,110,255,0.42)",
        }}
      />
      <Interactive.Div
        name="Emergence title"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 142,
          color: "#f8f8ff",
          fontFamily: serif,
          fontSize: 86,
          fontWeight: 400,
          letterSpacing: -2,
          textAlign: "center",
          textShadow: "0 0 38px rgba(122,190,255,0.22)",
        }}
      >
        直到结构开始发光。
      </Interactive.Div>
      <Interactive.Div
        name="Emergence subtitle"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 258,
          color: "rgba(191,236,255,0.72)",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: 7,
          textAlign: "center",
        }}
      >
        FORM BECOMES LIGHT
      </Interactive.Div>
      <Meta style={{left: 86, bottom: 52}}>
        COLOR RELEASE / 04
      </Meta>
      <Meta style={{right: 86, bottom: 52, textAlign: "right"}}>
        THE WARMEST FRAME
      </Meta>
    </Shell>
  );
};

export const AfterimageFrame: React.FC = () => {
  return (
    <Shell
      label="05 / AFTERIMAGE"
      background="radial-gradient(circle at 84% 72%, #071520 0%, #020509 17%, #010203 45%, #000000 100%)"
    >
      <Interactive.Div
        name="Afterimage question"
        style={{
          position: "absolute",
          left: 118,
          top: 212,
          color: "rgba(248,250,255,0.98)",
          fontFamily: serif,
          fontSize: 82,
          fontWeight: 400,
          letterSpacing: -2,
        }}
      >
        画面从哪里开始？
      </Interactive.Div>
      <Interactive.Div
        name="Afterimage answer"
        style={{
          position: "absolute",
          left: 122,
          top: 352,
          color: "rgba(143,247,255,0.74)",
          fontSize: 24,
          fontWeight: 400,
          letterSpacing: 5,
        }}
      >
        从一个被看见的念头。
      </Interactive.Div>
      <Interactive.Div
        name="Afterimage English"
        style={{
          position: "absolute",
          left: 122,
          top: 414,
          color: "rgba(214,226,244,0.3)",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 4,
        }}
      >
        AN IMAGE BEGINS WHEN A THOUGHT IS SEEN.
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 508,
          width: 52,
          height: 1,
          background: "rgba(143,247,255,0.58)",
          boxShadow: "0 0 12px rgba(143,247,255,0.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 238,
          bottom: 116,
          width: 126,
          height: 126,
          borderRadius: "50%",
          border: "1px solid rgba(126,240,255,0.11)",
          boxShadow: "0 0 90px rgba(75,203,255,0.08)",
        }}
      />
      <Seed left={1618} top={613} size={28} color="#7eeaff" />
      <Meta style={{left: 122, bottom: 52}}>END / BEGIN AGAIN</Meta>
    </Shell>
  );
};
