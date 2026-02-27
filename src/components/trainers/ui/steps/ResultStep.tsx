import { useEffect, useState } from "react";
import { ScenarioStep } from "../../types";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onFinish: () => void;
};

export default function ResultStep({ step, onFinish }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const auto = setTimeout(() => onFinish(), 300);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(auto);
    };
  }, [step.id, onFinish]);

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center transition-all duration-500 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon name="Loader2" className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm">
        Подготавливаем результат...
      </p>
    </div>
  );
}
