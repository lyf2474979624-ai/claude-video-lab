import {Series} from "remotion";
import {HookScene} from "./scenes/HookScene";
import {ResultScene} from "./scenes/ResultScene";
import {WorkflowScene} from "./scenes/WorkflowScene";

export type DemoProps = {
  readonly title: string;
  readonly accentColor: string;
};

export const ClaudeVideoDemo: React.FC<DemoProps> = ({title, accentColor}) => {
  return (
    <Series>
      <Series.Sequence name="01 开场" durationInFrames={120}>
        <HookScene title={title} accentColor={accentColor} />
      </Series.Sequence>
      <Series.Sequence name="02 工作流" durationInFrames={120}>
        <WorkflowScene accentColor={accentColor} />
      </Series.Sequence>
      <Series.Sequence name="03 成片" durationInFrames={120}>
        <ResultScene accentColor={accentColor} />
      </Series.Sequence>
    </Series>
  );
};
