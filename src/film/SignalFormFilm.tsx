import {Audio} from "@remotion/media";
import type {ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  AfterimageFrame,
  DriftFrame,
  EmergenceFrame,
  FractureFrame,
  IgnitionFrame,
} from "../styleframes/StyleFrames";
import {CinematicCaptions} from "./CinematicCaptions";

const ScenePlate: React.FC<{
  children: ReactNode;
  durationInFrames: number;
  first?: boolean;
  last?: boolean;
  zoomFrom: number;
  zoomTo: number;
}> = ({children, durationInFrames, first, last, zoomFrom, zoomTo}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [0, 18, durationInFrames - 18, durationInFrames],
          [first ? 1 : 0, 1, 1, last ? 1 : 0],
          {
            easing: Easing.inOut(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        scale: interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
          easing: Easing.inOut(Easing.quad),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const FracturePlate: React.FC<{durationInFrames: number}> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const burst = frame > 55 && frame < 88;
  const offset = burst ? Math.sin(frame * 3.7) * 9 : 0;

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [0, 6, durationInFrames - 18, durationInFrames],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        translate: `${offset}px 0px`,
        scale: interpolate(frame, [0, durationInFrames], [1.05, 1.01], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <FractureFrame />
      {burst ? (
        <AbsoluteFill
          style={{
            opacity: 0.11,
            background:
              "repeating-linear-gradient(0deg, transparent 0 23px, #7df1ff 24px 25px, transparent 26px 49px)",
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const FilmTexture: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,.62) 112%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: interpolate(frame, [0, 990], [-40, 844], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 1,
          opacity: 0.12,
          background:
            "linear-gradient(90deg, transparent, #89f3ff 35%, #ffffff 50%, #89f3ff 65%, transparent)",
          boxShadow: "0 0 11px rgba(126,240,255,.38)",
        }}
      />
    </>
  );
};

export const SignalFormFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: "#000000"}}>
      <Sequence name="01 Ignition" durationInFrames={195}>
        <ScenePlate
          durationInFrames={195}
          first
          zoomFrom={1.035}
          zoomTo={1.005}
        >
          <IgnitionFrame />
        </ScenePlate>
      </Sequence>

      <Sequence name="02 Drift" from={180} durationInFrames={225}>
        <ScenePlate durationInFrames={225} zoomFrom={1.02} zoomTo={1.065}>
          <DriftFrame />
        </ScenePlate>
      </Sequence>

      <Sequence name="03 Fracture" from={390} durationInFrames={195}>
        <FracturePlate durationInFrames={195} />
      </Sequence>

      <Sequence name="04 Emergence" from={570} durationInFrames={225}>
        <ScenePlate durationInFrames={225} zoomFrom={1.07} zoomTo={1.005}>
          <EmergenceFrame />
        </ScenePlate>
      </Sequence>

      <Sequence name="05 Afterimage" from={780} durationInFrames={210}>
        <ScenePlate
          durationInFrames={210}
          last
          zoomFrom={1.015}
          zoomTo={1.045}
        >
          <AfterimageFrame />
        </ScenePlate>
      </Sequence>

      <FilmTexture />

      <Interactive.Div name="Subtitle zone">
        <CinematicCaptions
          captions={[
            {
              text: "一切画面，都从一个还没有形状的念头开始。",
              startMs: 800,
              endMs: 5130,
              timestampMs: 800,
              confidence: null,
              pageBreakAfter: true,
            },
            {
              text: "它寻找方向，寻找节奏，也寻找能够承载它的结构。",
              startMs: 6800,
              endMs: 12030,
              timestampMs: 6800,
              confidence: null,
              pageBreakAfter: true,
            },
            {
              text: "但第一次成形，往往伴随着失真。",
              startMs: 13800,
              endMs: 17190,
              timestampMs: 13800,
              confidence: null,
              pageBreakAfter: true,
            },
            {
              text: "当颜色、声音和运动彼此回应，结构就开始发光。",
              startMs: 19800,
              endMs: 24910,
              timestampMs: 19800,
              confidence: null,
              pageBreakAfter: true,
            },
            {
              text: "画面不是装饰。它是一个念头，终于被看见的瞬间。",
              startMs: 26800,
              endMs: 31720,
              timestampMs: 26800,
              confidence: null,
              pageBreakAfter: true,
            },
          ]}
        />
      </Interactive.Div>

      <Audio
        name="Ambient score"
        src={staticFile("audio/signal-form/score.wav")}
        volume={(mediaFrame) =>
          interpolate(mediaFrame, [0, 60, 870, 990], [0, 0.38, 0.38, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      <Audio
        name="Voice 01"
        from={24}
        src={staticFile("audio/signal-form/voice-01.wav")}
        volume={0.95}
      />
      <Audio
        name="Voice 02"
        from={204}
        src={staticFile("audio/signal-form/voice-02.wav")}
        volume={0.95}
      />
      <Audio
        name="Voice 03"
        from={414}
        src={staticFile("audio/signal-form/voice-03.wav")}
        volume={0.95}
      />
      <Audio
        name="Voice 04"
        from={594}
        src={staticFile("audio/signal-form/voice-04.wav")}
        volume={0.95}
      />
      <Audio
        name="Voice 05"
        from={804}
        src={staticFile("audio/signal-form/voice-05.wav")}
        volume={0.95}
      />

      <Audio
        name="Ignition pulse"
        from={20}
        src={staticFile("audio/signal-form/pulse.wav")}
        volume={0.7}
      />
      <Audio
        name="Fracture hit"
        from={445}
        src={staticFile("audio/signal-form/fracture.wav")}
        volume={0.75}
      />
      <Audio
        name="Emergence chord"
        from={590}
        src={staticFile("audio/signal-form/emergence.wav")}
        volume={0.62}
      />
      <Audio
        name="Afterimage pulse"
        from={800}
        src={staticFile("audio/signal-form/pulse.wav")}
        toneFrequency={0.62}
        volume={0.42}
      />
    </AbsoluteFill>
  );
};
