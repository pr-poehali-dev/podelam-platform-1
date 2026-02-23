import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { Message, Phase } from "./diaryEngine";

type Props = {
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onFinish: () => void;
  onStartNew: () => void;
  phase: Phase;
  bottomRef: React.RefObject<HTMLDivElement>;
  answersCount: number;
};

export default function DiaryChat({ messages, input, onInputChange, onSend, onFinish, onStartNew, phase, bottomRef, answersCount }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "bot" && (
                <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Icon name="BookOpen" size={13} className="text-violet-600" />
                </div>
              )}
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.from === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm text-foreground"
              }`}>
                {msg.text.split("\n").map((line, i) => {
                  if (line === "") return <div key={i} className="h-2" />;
                  if (line === "---") return <hr key={i} className="border-border my-2" />;
                  const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                  return <p key={i} className={line.startsWith("**") ? "font-semibold" : ""} dangerouslySetInnerHTML={{ __html: bold }} />;
                })}
              </div>
            </div>
            {msg.widget === "finish_btn" && phase === "conversation" && answersCount > 0 && idx === messages.length - 1 && (
              <div className="flex justify-start ml-9 mt-2">
                <button
                  onClick={onFinish}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-violet-600 bg-white border border-border hover:border-violet-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Icon name="Check" size={12} />
                  Завершить на сегодня
                </button>
              </div>
            )}
          </div>
        ))}

        {phase === "finishing" && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BookOpen" size={13} className="text-violet-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Подвожу итог...
              </div>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex justify-center pt-3">
            <button
              onClick={onStartNew}
              className="flex items-center gap-2 gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Icon name="PenLine" size={15} />
              Новая запись
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {phase === "conversation" && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-3 max-w-2xl mx-auto w-full">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Напиши, что чувствуешь..."
              rows={1}
              className="flex-1 resize-none border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-secondary/30 transition-all"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Shift+Enter — перенос строки · Пиши столько, сколько хочешь
          </p>
        </div>
      )}
    </>
  );
}
