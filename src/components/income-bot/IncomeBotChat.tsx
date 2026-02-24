import { useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { Message, Plan } from "./types";

type Props = {
  messages: Message[];
  analyzing: boolean;
  result: string | null;
  plan: Plan | null;
  isDone: boolean;
  currentOptions: string[];
  sessionsCount: number;
  onOptionClick: (option: string) => void;
  onGoToPlan: () => void;
  onNewSession: () => void;
  onShowHistory: () => void;
};

export default function IncomeBotChat({
  messages,
  analyzing,
  result,
  plan,
  isDone,
  currentOptions,
  sessionsCount,
  onOptionClick,
  onGoToPlan,
  onNewSession,
  onShowHistory,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, analyzing]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isDone && (
        <div className="px-4 pt-3 flex flex-col gap-2">
          <button
            onClick={onGoToPlan}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            <Icon name="Map" size={15} />
            Построить шаги развития
          </button>
          <div className="flex gap-2">
            <button
              onClick={onNewSession}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
            >
              <Icon name="RotateCcw" size={15} />
              Новый подбор
            </button>
            {sessionsCount > 0 && (
              <button
                onClick={onShowHistory}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Icon name="History" size={15} />
                История
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto px-4 py-6 max-w-2xl w-full mx-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="Banknote" size={13} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.from === "bot"
                  ? "bg-white border border-border text-foreground rounded-tl-sm"
                  : "gradient-brand text-white rounded-tr-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {analyzing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {result && !analyzing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="max-w-[85%] bg-white border-2 border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm leading-relaxed whitespace-pre-line text-foreground">
              {result}
            </div>
          </div>
        )}

        {result && !analyzing && plan && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="max-w-[85%] bg-white border-2 border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-foreground space-y-3">
              <p className="font-bold leading-snug">{plan.title}</p>
              <ul className="space-y-2">
                {plan.steps.map((s, i) => (
                  <li key={i} className="leading-relaxed text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {currentOptions.length > 0 && !analyzing && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-4">
          <div className="max-w-2xl mx-auto grid grid-cols-1 gap-2">
            {currentOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onOptionClick(opt)}
                className="w-full text-left px-4 py-3 rounded-2xl border border-border bg-white hover:bg-secondary hover:border-primary/30 transition-all text-sm font-medium text-foreground"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
