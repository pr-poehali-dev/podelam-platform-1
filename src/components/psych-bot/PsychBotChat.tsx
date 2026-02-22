import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Message, Widget, BotState } from "./psychBotEngine";

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
          <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, "") }} />
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="my-0.5 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

// ─── ВИДЖЕТ ОЦЕНОК ────────────────────────────────────────────────────────────

function RatingWidget({ professions, onSubmit }: { professions: string[]; onSubmit: (ratings: Record<string, number>) => void }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const allRated = professions.every((p) => ratings[p] !== undefined);

  return (
    <div className="mt-2 space-y-3">
      {professions.map((prof) => (
        <div key={prof} className="bg-gray-50 rounded-xl p-3">
          <p className="text-sm font-medium text-gray-800 mb-2">{prof}</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setRatings((r) => ({ ...r, [prof]: score }))}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  ratings[prof] === score
                    ? "bg-indigo-600 text-white shadow-md scale-110"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      ))}
      {allRated && (
        <button
          onClick={() => onSubmit(ratings)}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors text-sm mt-2"
        >
          Отправить оценки →
        </button>
      )}
    </div>
  );
}

// ─── КОМПОНЕНТ ЧАТА ───────────────────────────────────────────────────────────

type Props = {
  messages: Message[];
  botState: BotState;
  loading: boolean;
  onButtonClick: (option: string) => void;
  onRatingsSubmit: (ratings: Record<string, number>) => void;
  onTextSubmit: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
};

export default function PsychBotChat({
  messages,
  botState,
  loading,
  onButtonClick,
  onRatingsSubmit,
  onTextSubmit,
  bottomRef,
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showInput = botState.step === "collect_activities" || botState.step === "ask_segment_why";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onTextSubmit(input);
      setInput("");
    }
  };

  const handleSend = () => {
    onTextSubmit(input);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Icon name="Brain" size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[88%] ${msg.from === "user" ? "" : "w-full"}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.from === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm ml-auto inline-block"
                  : "bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800"
              }`}>
                {msg.from === "bot" ? (
                  <div className="text-sm leading-relaxed">{renderText(msg.text)}</div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {msg.from === "bot" && msg.widget && (
                <div className="mt-2 ml-0">
                  {msg.widget.type === "button_list" && (
                    <div className="flex flex-wrap gap-2">
                      {msg.widget.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => onButtonClick(opt)}
                          disabled={botState.step === "report"}
                          className="bg-white border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all disabled:opacity-40 disabled:cursor-default"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.widget.type === "rating_list" && (
                    <RatingWidget
                      professions={msg.widget.professions}
                      onSubmit={onRatingsSubmit}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Icon name="Brain" size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showInput && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                botState.step === "collect_activities"
                  ? "Пишите каждый вид деятельности с новой строки..."
                  : "Напишите, почему это направление вам близко..."
              }
              disabled={loading}
              rows={3}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50 leading-relaxed"
              style={{ minHeight: "72px", maxHeight: "200px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 200) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 self-end"
            >
              <Icon name="Send" size={18} className="text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-1.5">Enter — отправить · Shift+Enter — новая строка</p>
        </div>
      )}
    </>
  );
}
