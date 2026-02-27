import { useEffect, useState } from "react";
import { ScenarioStep } from "../../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  step: ScenarioStep;
  onSubmit: (value: string) => void;
};

const MAX_LENGTH = 500;

export default function TextInputStep({ step, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setText("");
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [step.id]);

  const canSubmit = text.trim().length >= 3;

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
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {step.description}
        </p>
      )}

      {step.hints && step.hints.length > 0 && !text && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {step.hints.map((hint) => (
            <button
              key={hint}
              onClick={() => setText(hint)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          placeholder={step.placeholder || "Напишите здесь..."}
          rows={4}
          className="
            w-full resize-none rounded-xl text-sm leading-relaxed
            border-border bg-card
            focus:border-primary focus:ring-primary/20
            transition-all duration-200
            placeholder:text-muted-foreground/50
          "
        />
      </div>

      <div className="flex justify-end mb-6">
        <span
          className={`text-xs transition-colors duration-200 ${
            text.length > MAX_LENGTH * 0.9
              ? "text-destructive"
              : "text-muted-foreground/50"
          }`}
        >
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <Button
        onClick={() => onSubmit(text.trim())}
        disabled={!canSubmit}
        className="w-full h-12 text-base font-medium rounded-xl transition-all duration-200"
      >
        Продолжить
      </Button>
    </div>
  );
}