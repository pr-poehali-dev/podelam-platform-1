import Icon from "@/components/ui/icon";
import { Message, Phase, Templates, MetricDef } from "./progressEngine";

type Props = {
  messages: Message[];
  phase: Phase;
  currentMetric: MetricDef | undefined;
  metricIndex: number;
  totalMetrics: number;
  sliderVal: number;
  onSliderChange: (val: number) => void;
  onSubmitMetric: () => void;
  focusOptions: string[];
  onSubmitFocus: (opt: string) => void;
  thought: string;
  onThoughtChange: (val: string) => void;
  onSubmitThought: () => void;
  onStartNew: () => void;
  onExit?: () => void;
  paidOnce?: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
};

export default function ProgressChat({
  messages,
  phase,
  currentMetric,
  metricIndex,
  totalMetrics,
  sliderVal,
  onSliderChange,
  onSubmitMetric,
  focusOptions,
  onSubmitFocus,
  thought,
  onThoughtChange,
  onSubmitThought,
  onStartNew,
  onExit,
  paidOnce,
  bottomRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl mx-auto w-full">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
          {msg.from === "bot" && (
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BarChart3" size={13} className="text-blue-600" />
            </div>
          )}
          <div
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
              msg.from === "user"
                ? "gradient-brand text-white rounded-tr-sm"
                : "bg-white border border-border rounded-tl-sm"
            }`}
          >
            {msg.text.split("\n").map((line, i) => {
              if (line === "") return <div key={i} className="h-1.5" />;
              const isBold = /^(📊|📈|🔁|🧭)/.test(line);
              return (
                <p
                  key={i}
                  className={`leading-relaxed ${isBold ? "font-bold mt-1" : ""} ${msg.from === "user" ? "text-white" : "text-foreground"}`}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      ))}

      {phase === "metrics" && currentMetric && (
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
            <Icon name="BarChart3" size={13} className="text-blue-600" />
          </div>
          <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 w-full max-w-sm">
            <p className="font-semibold text-foreground text-sm mb-4">
              {currentMetric.label}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                (шаг {metricIndex + 1} из {totalMetrics})
              </span>
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted-foreground w-4">1</span>
              <input
                type="range"
                min={1} max={10} step={1}
                value={sliderVal}
                onChange={(e) => onSliderChange(Number(e.target.value))}
                className="flex-1 accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-4 text-right">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-blue-600">{sliderVal}</span>
              <button
                onClick={onSubmitMetric}
                className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Далее
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "focus" && (
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
            <Icon name="BarChart3" size={13} className="text-blue-600" />
          </div>
          <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm w-full">
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onSubmitFocus(opt)}
                  className="px-3 py-1.5 rounded-xl border border-border text-sm text-foreground hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "thought" && (
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
            <Icon name="BarChart3" size={13} className="text-blue-600" />
          </div>
          <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm w-full">
            <input
              type="text"
              value={thought}
              onChange={(e) => onThoughtChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmitThought()}
              placeholder="Короткая фраза..."
              maxLength={120}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
              autoFocus
            />
            <button
              onClick={onSubmitThought}
              disabled={!thought.trim()}
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm disabled:opacity-40"
            >
              Завершить
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex justify-center pt-4 gap-2">
          {paidOnce ? (
            <button
              onClick={onExit}
              className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-200 transition-colors text-sm"
            >
              Вернуться в кабинет
            </button>
          ) : (
            <button
              onClick={onStartNew}
              className="bg-blue-100 text-blue-700 font-semibold px-5 py-2.5 rounded-2xl hover:bg-blue-200 transition-colors text-sm"
            >
              Новая запись
            </button>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}