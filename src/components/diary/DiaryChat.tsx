import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { Message } from "./diaryEngine";

type Props = {
  messages: Message[];
  step: number;
  totalSteps: number;
  reflectionIdx: number;
  reflectionTotal: number;
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onStartNew: () => void;
  bottomRef: React.RefObject<HTMLDivElement>;
};

export default function DiaryChat({
  messages,
  step,
  totalSteps,
  reflectionIdx,
  reflectionTotal,
  input,
  onInputChange,
  onSend,
  onStartNew,
  bottomRef,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInputActive = (step >= 0 && step < 5) || step === 6;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="BookOpen" size={13} className="text-violet-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.from === "user"
                  ? "gradient-brand text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm"
              }`}
            >
              {msg.text.split("\n\n").map((block, bi) => {
                if (block === "---") return <hr key={bi} className="my-2 border-gray-200" />;
                const formatted = block
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                return (
                  <p
                    key={bi}
                    className={`leading-relaxed ${bi > 0 ? "mt-2" : ""} ${msg.from === "user" ? "text-white" : "text-foreground"}`}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {step === 7 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onStartNew}
              className="bg-violet-100 text-violet-700 font-semibold px-5 py-2.5 rounded-2xl hover:bg-violet-200 transition-colors text-sm flex items-center gap-2"
            >
              <Icon name="Plus" size={15} />
              Новая запись
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {isInputActive && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-3 shrink-0">
          <div className="max-w-2xl mx-auto">
            {step >= 0 && step < 5 && (
              <p className="text-xs text-muted-foreground mb-2">
                Шаг {step + 1} из {totalSteps}
              </p>
            )}
            {step === 6 && (
              <p className="text-xs text-violet-600 font-medium mb-2">
                Рефлексия — вопрос {reflectionIdx + 1} из {reflectionTotal}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={step === 6 ? "Ваш ответ на вопрос..." : "Напишите ответ..."}
                className="flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-300 leading-relaxed"
                style={{ minHeight: "42px", maxHeight: "160px" }}
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center shrink-0 hover:bg-violet-600 transition-colors disabled:opacity-40"
              >
                <Icon name="Send" size={16} className="text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Enter — отправить · Shift+Enter — новая строка
            </p>
          </div>
        </div>
      )}
    </>
  );
}
