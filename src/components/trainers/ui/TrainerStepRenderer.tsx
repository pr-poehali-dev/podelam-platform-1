import { ScenarioStep } from "../types";
import IntroStep from "./steps/IntroStep";
import SingleChoiceStep from "./steps/SingleChoiceStep";
import MultipleChoiceStep from "./steps/MultipleChoiceStep";
import ScaleStep from "./steps/ScaleStep";
import TextInputStep from "./steps/TextInputStep";
import InfoStep from "./steps/InfoStep";
import ResultStep from "./steps/ResultStep";
import TimerStep from "./steps/TimerStep";
import ConfirmStep from "./steps/ConfirmStep";

type Props = {
  step: ScenarioStep;
  onAnswer: (value: string | string[] | number) => void;
  onSkip: () => void;
  isAnimating: boolean;
  trainerColor?: string;
};

export default function TrainerStepRenderer({
  step,
  onAnswer,
  onSkip,
  isAnimating,
  trainerColor,
}: Props) {
  const wrapClass = `transition-all duration-500 ease-out ${
    isAnimating
      ? "opacity-0 translate-y-4"
      : "opacity-100 translate-y-0"
  }`;

  return (
    <div className={wrapClass}>
      {step.type === "intro" && (
        <IntroStep step={step} onNext={onSkip} color={trainerColor} />
      )}
      {step.type === "single-choice" && (
        <SingleChoiceStep step={step} onSelect={(v) => onAnswer(v)} />
      )}
      {step.type === "multiple-choice" && (
        <MultipleChoiceStep step={step} onSubmit={(v) => onAnswer(v)} />
      )}
      {step.type === "scale" && (
        <ScaleStep step={step} onSubmit={(v) => onAnswer(v)} />
      )}
      {step.type === "text-input" && (
        <TextInputStep step={step} onSubmit={(v) => onAnswer(v)} />
      )}
      {step.type === "info" && (
        <InfoStep step={step} onNext={onSkip} />
      )}
      {step.type === "result" && (
        <ResultStep step={step} onFinish={onSkip} />
      )}
      {step.type === "timer" && (
        <TimerStep step={step} onSubmit={(v) => onAnswer(v)} />
      )}
      {step.type === "confirm" && (
        <ConfirmStep step={step} onSubmit={(v) => onAnswer(v)} />
      )}
    </div>
  );
}
