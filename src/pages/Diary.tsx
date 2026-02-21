import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = { id: number; from: "bot" | "user"; text: string };

type DiaryEntry = {
  date: string;
  situation: string;
  thoughts: string;
  emotions: string;
  body: string;
  action: string;
  emotion_tags: string[];
  pattern_tags: string[];
  intensity_score: number;
};

type Templates = {
  steps: { key: string; question: string }[];
  emotion_labels: Record<string, string>;
  pattern_labels: Record<string, string>;
  summary: string;
  emotions_found: string;
  emotions_none: string;
  patterns_new: string;
  patterns_repeat: string;
  dynamic_up: string;
  dynamic_down: string;
  dynamic_same: string;
  questions: string[];
  start_message: string;
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const CHAT_KEY    = "diary_chat";
const ENTRIES_KEY = "diary_entries";

// ─── Engine ──────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[.,!?;:()«»"]/g, " ").split(/\s+/).filter(Boolean);
}

function matchKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw));
}

function detectEmotions(
  texts: string[],
  dict: Record<string, string[]>
): { tags: string[]; score: number } {
  const combined = texts.join(" ");
  const tags: string[] = [];
  let score = 0;

  for (const [cat, keywords] of Object.entries(dict)) {
    const hits = matchKeywords(combined, keywords);
    if (hits.length > 0) {
      tags.push(cat);
      if (hits.length >= 4) score += 2;
      else if (hits.length >= 2) score += 1;
    }
  }

  return { tags, score };
}

function detectPatterns(
  texts: string[],
  rules: Record<string, string[]>
): string[] {
  const combined = texts.join(" ");
  const tags: string[] = [];
  for (const [pat, phrases] of Object.entries(rules)) {
    if (matchKeywords(combined, phrases).length > 0) tags.push(pat);
  }
  return tags;
}

function pickQuestions(all: string[], count = 3): string[] {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildResult(
  entry: DiaryEntry,
  history: DiaryEntry[],
  tpl: Templates
): string {
  const lines: string[] = [];

  // 1. Summary
  lines.push(tpl.summary.replace("{situation}", entry.situation));

  // 2. Emotions
  if (entry.emotion_tags.length > 0) {
    const list = entry.emotion_tags
      .map((t) => tpl.emotion_labels[t] ?? t)
      .join(", ");
    lines.push(tpl.emotions_found.replace("{emotion_list}", list));
  } else {
    lines.push(tpl.emotions_none);
  }

  // 3. Patterns
  if (entry.pattern_tags.length > 0) {
    const list = entry.pattern_tags
      .map((t) => tpl.pattern_labels[t] ?? t)
      .join(", ");
    lines.push(tpl.patterns_new.replace("{pattern_list}", list));

    const repeatCount = history.filter((e) =>
      entry.pattern_tags.some((p) => e.pattern_tags.includes(p))
    ).length;
    if (repeatCount >= 2) lines.push(tpl.patterns_repeat);
  }

  // 4. Dynamics
  if (history.length > 0) {
    const prev = history[history.length - 1];
    if (entry.intensity_score > prev.intensity_score) lines.push(tpl.dynamic_up);
    else if (entry.intensity_score < prev.intensity_score) lines.push(tpl.dynamic_down);
    else lines.push(tpl.dynamic_same);
  }

  // 5. Questions
  const qs = pickQuestions(tpl.questions);
  lines.push("Вопросы для размышления:");
  qs.forEach((q, i) => lines.push(`${i + 1}. ${q}`));

  return lines.join("\n\n");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Diary() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(-1); // -1 = init, 0-4 = questions, 5 = done
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [msgId, setMsgId] = useState(0);

  const [tpl, setTpl] = useState<Templates | null>(null);
  const [emoDict, setEmoDict] = useState<Record<string, string[]> | null>(null);
  const [patRules, setPatRules] = useState<Record<string, string[]> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);

  // ── Load JSON files ────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch("/diary_templates.json").then((r) => r.json()),
      fetch("/emotion_dictionary.json").then((r) => r.json()),
      fetch("/pattern_rules.json").then((r) => r.json()),
    ]).then(([t, e, p]) => {
      setTpl(t);
      setEmoDict(e);
      setPatRules(p);
    });
  }, []);

  // ── Init chat ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!tpl) return;

    const stored = localStorage.getItem(CHAT_KEY);
    if (stored) {
      const parsed: Message[] = JSON.parse(stored);
      setMessages(parsed);
      idRef.current = parsed.length + 1;
      setStep(5); // already finished a session; show done state
      return;
    }

    // Fresh start
    const intro: Message = {
      id: idRef.current++,
      from: "bot",
      text: tpl.start_message,
    };
    const q0: Message = {
      id: idRef.current++,
      from: "bot",
      text: tpl.steps[0].question,
    };
    const init = [intro, q0];
    setMessages(init);
    saveChat(init);
    setStep(0);
  }, [tpl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function saveChat(msgs: Message[]) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
  }

  function addBotMsg(text: string, current: Message[]): Message[] {
    const msg: Message = { id: idRef.current++, from: "bot", text };
    const next = [...current, msg];
    saveChat(next);
    return next;
  }

  function addUserMsg(text: string, current: Message[]): Message[] {
    const msg: Message = { id: idRef.current++, from: "user", text };
    const next = [...current, msg];
    saveChat(next);
    return next;
  }

  // ── Send ──────────────────────────────────────────────────────────────────

  function send() {
    if (!input.trim() || step === 5 || !tpl || !emoDict || !patRules) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const stepKey = tpl.steps[step]?.key ?? "";
    const newAnswers = { ...answers, [stepKey]: text };
    setAnswers(newAnswers);

    let msgs = addUserMsg(text, messages);

    const nextStep = step + 1;

    if (nextStep < tpl.steps.length) {
      // Next question
      msgs = addBotMsg(tpl.steps[nextStep].question, msgs);
      setMessages(msgs);
      setStep(nextStep);
    } else {
      // All answers collected — analyse
      const allText = [
        newAnswers.situation ?? "",
        newAnswers.thoughts ?? "",
        newAnswers.emotions ?? "",
        newAnswers.body ?? "",
        newAnswers.action ?? "",
      ];

      const { tags: emoTags, score } = detectEmotions(allText, emoDict);
      const patTags = detectPatterns(allText, patRules);

      const history: DiaryEntry[] = JSON.parse(
        localStorage.getItem(ENTRIES_KEY) ?? "[]"
      );

      const entry: DiaryEntry = {
        date: new Date().toISOString(),
        situation: newAnswers.situation ?? "",
        thoughts: newAnswers.thoughts ?? "",
        emotions: newAnswers.emotions ?? "",
        body: newAnswers.body ?? "",
        action: newAnswers.action ?? "",
        emotion_tags: emoTags,
        pattern_tags: patTags,
        intensity_score: score,
      };

      history.push(entry);
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(history));

      const resultText = buildResult(entry, history.slice(0, -1), tpl);
      msgs = addBotMsg(resultText, msgs);
      setMessages(msgs);
      setStep(5);
    }
  }

  function startNew() {
    localStorage.removeItem(CHAT_KEY);
    setAnswers({});
    setStep(-1);
    setMessages([]);

    if (!tpl) return;
    const intro: Message = { id: idRef.current++, from: "bot", text: tpl.start_message };
    const q0: Message = { id: idRef.current++, from: "bot", text: tpl.steps[0].question };
    const init = [intro, q0];
    setMessages(init);
    saveChat(init);
    setStep(0);
  }

  function clearAll() {
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(ENTRIES_KEY);
    startNew();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const entries: DiaryEntry[] = JSON.parse(
    localStorage.getItem(ENTRIES_KEY) ?? "[]"
  );

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
          <span className="font-bold text-sm text-foreground">Дневник</span>
          {entries.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {entries.length} {entries.length === 1 ? "запись" : entries.length < 5 ? "записи" : "записей"}
            </span>
          )}
        </div>

        <button
          onClick={clearAll}
          title="Очистить всё"
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Icon name="Trash2" size={17} />
        </button>
      </header>

      {/* PROGRESS BAR */}
      {step >= 0 && step < 5 && tpl && (
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-violet-400 transition-all duration-500"
            style={{ width: `${((step) / tpl.steps.length) * 100}%` }}
          />
        </div>
      )}

      {/* MESSAGES */}
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
              {msg.text.split("\n\n").map((block, bi) => (
                <p key={bi} className={`leading-relaxed ${bi > 0 ? "mt-2" : ""} ${msg.from === "user" ? "text-white" : "text-foreground"}`}>
                  {block}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Done state */}
        {step === 5 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={startNew}
              className="bg-violet-100 text-violet-700 font-semibold px-5 py-2.5 rounded-2xl hover:bg-violet-200 transition-colors text-sm"
            >
              Новая запись
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      {step >= 0 && step < 5 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-3 shrink-0">
          <div className="max-w-2xl mx-auto">
            {tpl && (
              <p className="text-xs text-muted-foreground mb-2">
                Шаг {step + 1} из {tpl.steps.length}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Напишите ответ..."
                className="flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-300 leading-relaxed"
                style={{ minHeight: "42px", maxHeight: "160px" }}
              />
              <button
                onClick={send}
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
    </div>
  );
}
