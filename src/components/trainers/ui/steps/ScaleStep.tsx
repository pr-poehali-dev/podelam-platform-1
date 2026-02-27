import { useEffect, useState, useCallback } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
  step: ScenarioStep;
  onSubmit: (value: number) => void;
};

export default function ScaleStep({ step, onSubmit }: Props) {
  const min = step.scaleMin ?? 1;
  const max = step.scaleMax ?? 10;
  const mid = Math.round((min + max) / 2);

  const [value, setValue] = useState(mid);
  const [mounted, setMounted] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setValue(mid);
    setTouched(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [step.id, mid]);

  const handleChange = useCallback((vals: number[]) => {
    setValue(vals[0]);
    setTouched(true);
  }, []);

  const markers = [];
  for (let i = min; i <= max; i++) {
    markers.push(i);
  }

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={`flex flex-col px-1 transition-all duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
        {step.title}
      </h2>
      {step.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {step.description}
        </p>
      )}

      <div className="relative mb-3 px-1">
        {/* Floating value bubble */}
        <div
          className="absolute -top-10 transition-all duration-150 ease-out pointer-events-none"
          style={{ left: `calc(${pct}% - 18px)` }}
        >
          <div
            className={`
              w-9 h-9 rounded-xl bg-primary text-primary-foreground
              flex items-center justify-center text-sm font-bold shadow-md
              transition-all duration-200
              ${touched ? "scale-100 opacity-100" : "scale-90 opacity-60"}
            `}
          >
            {value}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary mx-auto" />
        </div>

        {/* Slider */}
        <Slider
          min={min}
          max={max}
          step={1}
          value={[value]}
          onValueChange={handleChange}
          className="w-full"
        />
      </div>

      {/* Number markers */}
      <div className="flex justify-between px-1 mb-2">
        {markers.map((n) => (
          <span
            key={n}
            className={`text-xs transition-colors duration-150 ${
              n === value
                ? "text-primary font-semibold"
                : "text-muted-foreground/60"
            }`}
            style={{ width: markers.length > 10 ? "auto" : undefined }}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Min/Max labels */}
      {step.scaleLabels && (
        <div className="flex justify-between px-1 mb-8">
          <span className="text-xs text-muted-foreground max-w-[40%] leading-tight">
            {step.scaleLabels.min}
          </span>
          <span className="text-xs text-muted-foreground max-w-[40%] text-right leading-tight">
            {step.scaleLabels.max}
          </span>
        </div>
      )}

      <Button
        onClick={() => onSubmit(value)}
        className="w-full h-12 text-base font-medium rounded-xl transition-all duration-200"
      >
        Продолжить
      </Button>
    </div>
  );
}
