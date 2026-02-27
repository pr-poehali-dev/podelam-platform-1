import { useEffect, useState, useRef } from "react";
import { ScenarioStep } from "../../types";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onSelect: (value: string) => void;
};

export default function SingleChoiceStep({ step, onSelect }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisibleCount(0);
    setSelected(null);
    if (!step.options) return;

    let count = 0;
    const total = step.options.length;

    const tick = () => {
      count += 1;
      setVisibleCount(count);
      if (count < total) {
        timerRef.current = setTimeout(tick, 50);
      }
    };

    timerRef.current = setTimeout(tick, 80);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step.id, step.options]);

  const handleSelect = (optionId: string) => {
    if (selected) return;
    setSelected(optionId);
    setTimeout(() => onSelect(optionId), 600);
  };

  return (
    <div className="flex flex-col px-1">
      <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
        {step.title}
      </h2>
      {step.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {step.description}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {step.options?.map((option, idx) => {
          const isVisible = idx < visibleCount;
          const isSelected = selected === option.id;
          const isDimmed = selected !== null && !isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={selected !== null}
              className={`
                relative w-full text-left px-4 py-3.5 rounded-xl border
                transition-all duration-200 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }
                ${
                  isSelected
                    ? "border-primary bg-primary/5 border-l-4 border-l-primary shadow-sm"
                    : isDimmed
                    ? "border-border bg-card opacity-50"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-sm"
                }
              `}
              style={{
                transitionDelay: isVisible ? "0ms" : `${idx * 50}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }
                  `}
                >
                  {isSelected && (
                    <Icon
                      name="Check"
                      className="w-3 h-3 text-white animate-scale-in"
                    />
                  )}
                </div>
                <span
                  className={`text-sm leading-snug ${
                    isSelected
                      ? "text-foreground font-medium"
                      : "text-foreground/80"
                  }`}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
