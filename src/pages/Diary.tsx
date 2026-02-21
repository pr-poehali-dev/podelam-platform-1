import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const STORAGE_KEY = "diary_history";
const MAX_HISTORY = 30;

const STARTER =
  "Опишите ситуацию, которая сегодня вас зацепила.\n\nЧто произошло?\nКакие мысли появились?\nКакие эмоции вы почувствовали?\nКак отреагировало тело?\nЧто вы сделали?";

function formatText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isBold = /^\*\*(.*)\*\*$/.test(line.trim());
    if (isBold) {
      const inner = line.trim().replace(/^\*\*|\*\*$/g, "");
      return (
        <p key={i} className="font-bold text-foreground">
          {inner}
        </p>
      );
    }
    if (line.startsWith("###")) {
      return (
        <p key={i} className="font-bold text-foreground mt-2">
          {line.replace(/^###\s*/, "")}
        </p>
      );
    }
    if (line.startsWith("##")) {
      return (
        <p key={i} className="font-bold text-foreground mt-2">
          {line.replace(/^##\s*/, "")}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <p key={i} className="text-foreground pl-3 before:content-['•'] before:mr-2 before:text-primary">
          {line.replace(/^[-*]\s/, "")}
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-foreground leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function Diary() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgId, setMsgId] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let history: Message[] = stored ? JSON.parse(stored) : [];
    if (history.length === 0) {
      const starter: Message = { id: 0, from: "bot", text: STARTER };
      history = [starter];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
    setMessages(history);
    setMsgId(history.length);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMsg = (from: "bot" | "user", text: string, id: number) => {
    const msg: Message = { id, from, text };
    setMessages((prev) => {
      const next = [...prev, msg];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-MAX_HISTORY)));
      return next;
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsgId = msgId;
    setMsgId((n) => n + 1);
    addMsg("user", text, userMsgId);
    setLoading(true);

    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Message[];
    const chatHistory = history.map((m) => ({
      role: m.from === "bot" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const url = (func2url as Record<string, string>)["diary-ai"];
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const data = await res.json();
      const botMsgId = msgId + 1;
      setMsgId((n) => n + 1);
      addMsg("bot", data.reply ?? "Не удалось получить ответ.", botMsgId);
    } catch {
      const botMsgId = msgId + 1;
      setMsgId((n) => n + 1);
      addMsg("bot", "Ошибка соединения. Попробуй ещё раз.", botMsgId);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const starter: Message = { id: 0, from: "bot", text: STARTER };
    setMessages([starter]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([starter]));
    setMsgId(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate("/cabinet")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-medium">Кабинет</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon name="BookOpen" size={14} className="text-violet-600" />
          </div>
          <span className="font-bold text-sm text-foreground">Дневник самоанализа</span>
        </div>

        <button
          onClick={clearHistory}
          title="Очистить историю"
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Icon name="Trash2" size={17} />
        </button>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="BookOpen" size={13} className="text-violet-600" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm space-y-1 ${
                msg.from === "user"
                  ? "gradient-brand text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm"
              }`}
            >
              {msg.from === "bot" ? (
                formatText(msg.text)
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BookOpen" size={13} className="text-violet-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Напишите, что вас зацепило сегодня..."
            disabled={loading}
            className="flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 leading-relaxed"
            style={{ minHeight: "42px", maxHeight: "160px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Icon name="Send" size={16} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Enter — отправить · Shift+Enter — новая строка
        </p>
      </div>
    </div>
  );
}