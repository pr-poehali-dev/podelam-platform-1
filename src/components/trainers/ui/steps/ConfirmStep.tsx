import { useEffect, useState } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onSubmit: (value: string) => void;
};

export default function ConfirmStep({ step, onSubmit }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [step.id]);

  const handleSelect = (val: string) => {
    if (selected) return;
    setSelected(val);
    setTimeout(() => onSubmit(val), 500);
  };

  return (
    <div
      className={`flex flex-col items-center px-1 transition-all duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Icon name="HelpCircle" className="w-8 h-8 text-primary" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2 leading-tight text-center">
        {step.title}
      </h2>
      {step.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 text-center max-w-sm">
          {step.description}
        </p>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        <Button
          onClick={() => handleSelect("yes")}
          disabled={selected !== null}
          className={`flex-1 h-12 text-base font-medium rounded-xl gap-2 transition-all duration-300 ${
            selected === "yes" ? "ring-2 ring-primary/30 scale-105" : ""
          } ${selected === "no" ? "opacity-40" : ""}`}
        >
          <Icon name="Check" className="w-4 h-4" />
          Да
        </Button>
        <Button
          onClick={() => handleSelect("no")}
          disabled={selected !== null}
          variant="outline"
          className={`flex-1 h-12 text-base font-medium rounded-xl gap-2 transition-all duration-300 ${
            selected === "no" ? "ring-2 ring-destructive/30 scale-105" : ""
          } ${selected === "yes" ? "opacity-40" : ""}`}
        >
          <Icon name="X" className="w-4 h-4" />
          Нет
        </Button>
      </div>
    </div>
  );
}
