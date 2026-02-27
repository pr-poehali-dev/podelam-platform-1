import { useEffect, useState, useRef } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onSubmit: (value: string[]) => void;
};

export default function MultipleChoiceStep({ step, onSubmit }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisibleCount(0);
    setSelected(new Set());
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

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size > 0) {
      onSubmit(Array.from(selected));
    }
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

      <div className="flex flex-col gap-2.5 mb-6">
        {step.options?.map((option, idx) => {
          const isVisible = idx < visibleCount;
          const isChecked = selected.has(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              className={`
                relative w-full text-left px-4 py-3.5 rounded-xl border
                transition-all duration-200 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }
                ${
                  isChecked
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]"
                }
              `}
              style={{
                transitionDelay: isVisible ? "0ms" : `${idx * 50}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      isChecked
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }
                  `}
                >
                  {isChecked && (
                    <Icon
                      name="Check"
                      className="w-3 h-3 text-white animate-scale-in"
                    />
                  )}
                </div>
                <span
                  className={`text-sm leading-snug ${
                    isChecked
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

      <Button
        onClick={handleSubmit}
        disabled={selected.size === 0}
        className="w-full h-12 text-base font-medium rounded-xl transition-all duration-200"
      >
        Продолжить
        {selected.size > 0 && (
          <span className="ml-1.5 text-xs opacity-70">
            ({selected.size})
          </span>
        )}
      </Button>
    </div>
  );
}
