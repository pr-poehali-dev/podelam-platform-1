import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Message, Widget } from "./barrierBotEngine";
import BarrierBotChart from "./BarrierBotChart";

// ─── РЕНДЕР ТЕКСТА ────────────────────────────────────────────────────────────

function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="text-lg font-bold mt-4 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h2>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="my-3 border-gray-200" />;
    }
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <p key={i} className="flex gap-1.5 my-0.5 text-sm leading-relaxed">
          <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, "") }} />
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="my-0.5 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

// ─── SLIDER WIDGET ────────────────────────────────────────────────────────────

function SliderWidget({ min, max, label, onSubmit }: { min: number; max: number; label: string; onSubmit: (v: number) => void }) {
  const [val, setVal] = useState<number | null>(null);

  return (
    <div className="mt-3 bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-600 mb-3">{label}</p>
      <div className="flex gap-1.5 flex-wrap justify-center mb-3">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) => (
          <button
            key={v}
            onClick={() => setVal(v)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
              val === v
                ? "bg-rose-500 text-white shadow-md scale-110"
                : "bg-white border border-gray-200 text-gray-700 hover:border-rose-400"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      {val !== null && (
        <button
          onClick={() => onSubmit(val)}
          className="w-full bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-colors text-sm mt-1"
        >
          Подтвердить →
        </button>
      )}
    </div>
  );
}

// ─── TEXT INPUT WIDGET ────────────────────────────────────────────────────────

function TextInputWidget({ placeholder, onSubmit }: { placeholder: string; onSubmit: (v: string) => void }) {
  const [val, setVal] = useState("");

  return (
    <div className="mt-3">
      <textarea
        rows={2}
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 resize-none"
      />
      {val.trim().length >= 3 && (
        <button
          onClick={() => { onSubmit(val.trim()); setVal(""); }}
          className="w-full mt-2 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-colors text-sm"
        >
          Продолжить →
        </button>
      )}
    </div>
  );
}

// ─── MULTI CHOICES WIDGET ─────────────────────────────────────────────────────

function MultiChoicesWidget({ options, max, onSubmit }: { options: string[]; max: number; onSubmit: (v: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      setSelected([...selected, opt]);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
              selected.includes(opt)
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white border-gray-200 text-gray-700 hover:border-rose-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          onClick={() => onSubmit(selected)}
          className="w-full bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-colors text-sm mt-2"
        >
          Выбрать {selected.length > 1 ? `(${selected.length})` : ""} →
        </button>
      )}
    </div>
  );
}

// ─── CHOICES WIDGET ───────────────────────────────────────────────────────────

function ChoicesWidget({ options, onSubmit }: { options: string[]; onSubmit: (v: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSubmit(opt)}
          className="px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-rose-50 transition-all"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── WIDGET RENDERER ──────────────────────────────────────────────────────────

function WidgetRenderer({ widget, onAnswer, isLast }: { widget: Widget; onAnswer: (v: string | number | string[]) => void; isLast: boolean }) {
  if (!isLast) return null;

  if (widget.type === "choices") {
    return <ChoicesWidget options={widget.options} onSubmit={onAnswer} />;
  }
  if (widget.type === "multi_choices") {
    return <MultiChoicesWidget options={widget.options} max={widget.max} onSubmit={onAnswer} />;
  }
  if (widget.type === "slider") {
    return <SliderWidget min={widget.min} max={widget.max} label={widget.label} onSubmit={(v) => onAnswer(v)} />;
  }
  if (widget.type === "text_input") {
    return <TextInputWidget placeholder={widget.placeholder} onSubmit={onAnswer} />;
  }
  if (widget.type === "chart") {
    return <BarrierBotChart steps={widget.steps} breakStep={widget.breakStep} newY={widget.newY} />;
  }
  if (widget.type === "confirm") {
    return (
      <button
        onClick={() => onAnswer("ok")}
        className="mt-3 w-full bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-colors text-sm"
      >
        Понятно, продолжить →
      </button>
    );
  }
  return null;
}

// ─── КОМПОНЕНТ ЧАТА ───────────────────────────────────────────────────────────

type Props = {
  messages: Message[];
  loading: boolean;
  onAnswer: (answer: string | number | string[]) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
};

export default function BarrierBotChat({ messages, loading, onAnswer, bottomRef }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg, idx) => {
        const isLast = idx === messages.length - 1;
        return (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="flex items-end gap-2 max-w-[90%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shrink-0 mb-1">
                  <Icon name="ShieldAlert" size={14} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 text-gray-800 max-w-full">
                  {renderText(msg.text)}
                  {msg.widget && (
                    <WidgetRenderer widget={msg.widget} onAnswer={onAnswer} isLast={isLast} />
                  )}
                </div>
              </div>
            )}
            {msg.from === "user" && (
              <div className="bg-rose-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm">
                {msg.text}
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-start">
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shrink-0">
              <Icon name="ShieldAlert" size={14} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-rose-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
