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
  const maxSelect = step.maxSelect || Infinity;

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
        timerRef.current = setTimeout(tick, 30);
      }
    };

    timerRef.current = setTimeout(tick, 60);

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
        if (next.size >= maxSelect) {
          const first = next.values().next().value;
          if (first) next.delete(first);
        }
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

  const hasGroups = step.optionGroups && step.optionGroups.length > 0;

  const renderOption = (option: { id: string; label: string }, idx: number) => {
    const isVisible = idx < visibleCount;
    const isChecked = selected.has(option.id);
    const isDisabled = !isChecked && selected.size >= maxSelect && maxSelect !== Infinity;

    return (
      <button
        key={option.id}
        onClick={() => !isDisabled && toggle(option.id)}
        className={`
          relative w-full text-left px-3 py-2.5 rounded-xl border
          transition-all duration-200 ease-out
          ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }
          ${
            isChecked
              ? "border-primary bg-primary/5 shadow-sm"
              : isDisabled
              ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
              : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]"
          }
        `}
        style={{
          transitionDelay: isVisible ? "0ms" : `${idx * 30}ms`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`
              w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center flex-shrink-0
              transition-all duration-200
              ${
                isChecked
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              }
            `}
            style={{ width: 18, height: 18 }}
          >
            {isChecked && (
              <Icon
                name="Check"
                className="w-2.5 h-2.5 text-white animate-scale-in"
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
  };

  let globalIdx = 0;

  return (
    <div className="flex flex-col px-1">
      <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
        {step.title}
      </h2>
      {step.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {step.description}
        </p>
      )}

      {maxSelect < Infinity && (
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <Icon name="Info" className="w-3.5 h-3.5" />
          Можно выбрать до {maxSelect}
          {selected.size > 0 && (
            <span className="text-primary font-medium ml-1">
              (выбрано {selected.size})
            </span>
          )}
        </div>
      )}

      {hasGroups ? (
        <div className="flex flex-col gap-4 mb-5 max-h-[50vh] overflow-y-auto pr-1">
          {step.optionGroups!.map((group) => {
            const groupOptions = group.optionIds
              .map((id) => step.options?.find((o) => o.id === id))
              .filter(Boolean) as { id: string; label: string }[];

            return (
              <div key={group.label}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {groupOptions.map((option) => {
                    const idx = globalIdx++;
                    return renderOption(option, idx);
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mb-6">
          {step.options?.map((option, idx) => renderOption(option, idx))}
        </div>
      )}

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
