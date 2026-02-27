import { useEffect, useState } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onNext: () => void;
  color?: string;
};

export default function IntroStep({ step, onNext, color }: Props) {
  const [visible, setVisible] = useState(false);
  const [barFilled, setBarFilled] = useState(false);

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setVisible(true));
    const t2 = setTimeout(() => setBarFilled(true), 100);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, []);

  const gradientClass = color || "from-primary to-primary/80";

  return (
    <div
      className={`flex flex-col items-center text-center px-2 transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Icon name="Sparkles" className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
        {step.title}
      </h2>

      {step.description && (
        <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-8">
          {step.description}
        </p>
      )}

      <div className="w-full max-w-xs mb-8">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-[1500ms] ease-out`}
            style={{ width: barFilled ? "100%" : "0%" }}
          />
        </div>
      </div>

      <Button
        onClick={onNext}
        className={`bg-gradient-to-r ${gradientClass} text-white border-0 px-8 h-12 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200`}
      >
        <Icon name="Play" className="w-4 h-4 mr-2" />
        Начать
      </Button>
    </div>
  );
}
