import "./index.css";
import {Composition, Folder, Still} from "remotion";
import { ClaudeVideoDemo } from "./ClaudeVideoDemo";
import { HookScene } from "./scenes/HookScene";
import { ResultScene } from "./scenes/ResultScene";
import { WorkflowScene } from "./scenes/WorkflowScene";
import {SignalFormFilm} from "./film/SignalFormFilm";
import {BecomingFilm} from "./film-v2/BecomingFilm";
import {
  AfterimageFrame,
  DriftFrame,
  EmergenceFrame,
  FractureFrame,
  IgnitionFrame,
} from "./styleframes/StyleFrames";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BecomingFilmV2"
        component={BecomingFilm}
        durationInFrames={1680}
        fps={60}
        width={1920}
        height={804}
      />
      <Composition
        id="ClaudeVideoDemo"
        component={ClaudeVideoDemo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "一句话，生成一支视频",
          accentColor: "#8b5cf6",
        }}
      />
      <Composition
        id="SignalFormFilm"
        component={SignalFormFilm}
        durationInFrames={990}
        fps={30}
        width={1920}
        height={804}
      />
      <Folder name="Demo-Scenes">
        <Composition
          id="HookScene"
          component={HookScene}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "一句话，生成一支视频",
            accentColor: "#8b5cf6",
          }}
        />
        <Composition
          id="WorkflowScene"
          component={WorkflowScene}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{accentColor: "#8b5cf6"}}
        />
        <Composition
          id="ResultScene"
          component={ResultScene}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{accentColor: "#8b5cf6"}}
        />
      </Folder>
      <Folder name="Styleframes">
        <Still
          id="Styleframe-01-Ignition"
          component={IgnitionFrame}
          width={1920}
          height={804}
        />
        <Still
          id="Styleframe-02-Drift"
          component={DriftFrame}
          width={1920}
          height={804}
        />
        <Still
          id="Styleframe-03-Fracture"
          component={FractureFrame}
          width={1920}
          height={804}
        />
        <Still
          id="Styleframe-04-Emergence"
          component={EmergenceFrame}
          width={1920}
          height={804}
        />
        <Still
          id="Styleframe-05-Afterimage"
          component={AfterimageFrame}
          width={1920}
          height={804}
        />
      </Folder>
    </>
  );
};
