import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

type Message = { id: number; from: "bot" | "user"; text: string };
type ChatMessage = { role: "user" | "assistant"; content: string };

const PSYCH_BOT_URL = func2url["psych-bot"];

const WELCOME_MESSAGE = `Добро пожаловать в профориентационный анализ 🧠

Я помогу тебе:
• Найти, где твоя естественная энергия
• Понять, где ты НЕ будешь выгорать
• Превратить это в деньги

Это персональная сессия из 5 этапов. Будь честен с собой — чем точнее ответы, тем точнее анализ.

Готов начать?`;

function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-base font-bold mt-3 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="text-lg font-bold mt-3 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h2>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="my-2 border-gray-200" />;
    }
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <p key={i} className="flex gap-1.5 my-0.5 text-sm leading-relaxed">
          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-*]\s*/, "") }} />
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="my-0.5 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function PsychBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgId, setMsgId] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const nextId = () => {
    let id = 0;
    setMsgId((prev) => { id = prev + 1; return id; });
    return id;
  };

  const addMsg = (from: "bot" | "user", text: string) => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, from, text }]);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }

    const userData = JSON.parse(u);
    const paid = localStorage.getItem(`psych_paid_${userData.email}`);
    if (paid === "true") {
      setHasAccess(true);
    }

    const saved = localStorage.getItem(`psych_chat_${userData.email}`);
    const savedHistory = localStorage.getItem(`psych_history_${userData.email}`);

    if (saved && savedHistory) {
      setMessages(JSON.parse(saved));
      setHistory(JSON.parse(savedHistory));
    } else {
      setTimeout(() => {
        addMsg("bot", WELCOME_MESSAGE);
      }, 400);
    }
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    if (messages.length > 0) {
      localStorage.setItem(`psych_chat_${userData.email}`, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    if (history.length > 0) {
      localStorage.setItem(`psych_history_${userData.email}`, JSON.stringify(history));
    }
  }, [history]);

  const handlePay = () => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    localStorage.setItem(`psych_paid_${userData.email}`, "true");
    setHasAccess(true);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    addMsg("user", text);
    const newHistory: ChatMessage[] = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(PSYCH_BOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await resp.json();
      const reply: string = data.reply ?? "Произошла ошибка. Попробуй ещё раз.";
      addMsg("bot", reply);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch {
      addMsg("bot", "Нет соединения. Проверь интернет и попробуй снова.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    localStorage.removeItem(`psych_chat_${userData.email}`);
    localStorage.removeItem(`psych_history_${userData.email}`);
    setMessages([]);
    setHistory([]);
    setTimeout(() => addMsg("bot", WELCOME_MESSAGE), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/cabinet")}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
          <Icon name="Brain" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Психологический анализ</p>
          <p className="text-xs text-gray-500">Профориентация и предотвращение выгорания</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            title="Начать заново"
          >
            <Icon name="RotateCcw" size={16} />
          </button>
        )}
      </div>

      {/* Paywall */}
      {!hasAccess && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Icon name="Brain" size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Психологический анализ</h2>
              <p className="text-indigo-100 text-sm">Профориентация и предотвращение выгорания</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {[
                  "Определит твою естественную предрасположенность",
                  "Выявит ведущую мотивацию",
                  "Предложит направления без риска выгорания",
                  "Составит план монетизации на 30 дней",
                  "Оценит риск выгорания в каждом направлении",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Icon name="CheckCircle" size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">299 ₽</span>
                <span className="text-gray-500 text-sm ml-1">одноразово</span>
              </div>
              <button
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Начать анализ — 299 ₽
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Персональная AI-сессия · ~20–30 минут
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      {hasAccess && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Icon name="Brain" size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.from === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800"
                  }`}
                >
                  {msg.from === "bot" ? (
                    <div className="text-sm leading-relaxed">{renderText(msg.text)}</div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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

          {/* Input */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите ответ..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50 max-h-32 leading-relaxed"
                style={{ minHeight: "44px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
              >
                <Icon name="Send" size={18} className="text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5">Enter — отправить · Shift+Enter — новая строка</p>
          </div>
        </>
      )}
    </div>
  );
}
