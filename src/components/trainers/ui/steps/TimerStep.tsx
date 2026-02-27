import { useState, useEffect, useRef, useCallback } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  step: ScenarioStep;
  onSubmit: (value: number) => void;
};

export default function TimerStep({ step, onSubmit }: Props) {
  const duration = (step.timerDuration || 15) * 60;
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const elapsedBeforePause = useRef(0);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    setFinished(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(t);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step.id, duration]);

  const tick = useCallback(() => {
    const elapsed = elapsedBeforePause.current + (Date.now() - startTimeRef.current);
    const left = Math.max(0, duration - Math.floor(elapsed / 1000));
    setRemaining(left);
    if (left <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      setFinished(true);
    }
  }, [duration]);

  const start = () => {
    startTimeRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(tick, 250);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    elapsedBeforePause.current += Date.now() - startTimeRef.current;
    setRunning(false);
  };

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(true);
  };

  const elapsed = duration - remaining;
  const progress = Math.min(elapsed / duration, 1);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const radius = 80;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      className={`flex flex-col items-center px-1 transition-all duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h2 className="text-xl font-bold text-foreground mb-2 leading-tight text-center">
        {step.title}
      </h2>
      {step.description && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 text-center max-w-sm">
          {step.description}
        </p>
      )}

      <div className="relative mb-8">
        <svg
          width={(radius + stroke) * 2}
          height={(radius + stroke) * 2}
          className="transform -rotate-90"
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={finished ? "hsl(160, 55%, 42%)" : "hsl(var(--primary))"}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {finished ? (
            <div className="flex flex-col items-center animate-scale-in">
              <Icon name="Check" className="w-8 h-8 text-emerald-500 mb-1" />
              <span className="text-sm text-emerald-600 font-medium">Готово</span>
            </div>
          ) : (
            <>
              <div className="text-4xl font-bold tabular-nums text-foreground">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {running ? "идёт работа" : remaining === duration ? "нажмите старт" : "пауза"}
              </div>
            </>
          )}
        </div>
      </div>

      {!finished && (
        <div className="flex gap-3 w-full max-w-xs mb-4">
          {!running ? (
            <Button
              onClick={start}
              className="flex-1 h-12 text-base font-medium rounded-xl gap-2"
            >
              <Icon name="Play" className="w-4 h-4" />
              {remaining === duration ? "Старт" : "Продолжить"}
            </Button>
          ) : (
            <Button
              onClick={pause}
              variant="outline"
              className="flex-1 h-12 text-base font-medium rounded-xl gap-2"
            >
              <Icon name="Pause" className="w-4 h-4" />
              Пауза
            </Button>
          )}
        </div>
      )}

      {!finished && elapsed > 30 && !running && (
        <button
          onClick={skip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          Завершить досрочно
        </button>
      )}

      {finished && (
        <Button
          onClick={() => onSubmit(elapsed)}
          className="w-full max-w-xs h-12 text-base font-medium rounded-xl"
        >
          Продолжить
        </Button>
      )}
    </div>
  );
}
