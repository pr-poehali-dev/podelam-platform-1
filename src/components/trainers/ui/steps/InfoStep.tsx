import { useEffect, useState } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onNext: () => void;
};

export default function InfoStep({ step, onNext }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [step.id]);

  return (
    <div
      className={`flex flex-col items-center px-1 transition-all duration-600 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="w-full rounded-2xl bg-gradient-to-br from-primary/5 to-accent/30 border border-primary/10 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon
              name="Lightbulb"
              className="w-5 h-5 text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
              {step.title}
            </h3>
            {step.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full h-12 text-base font-medium rounded-xl transition-all duration-200"
      >
        Далее
        <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
