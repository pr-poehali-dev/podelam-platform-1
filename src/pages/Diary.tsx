import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";

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
  reflectionAnswers?: string[];
  supportText?: string;
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

const CHAT_KEY = "diary_chat";
const ENTRIES_KEY = "diary_entries";

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
): { analysis: string; questions: string[] } {
  const lines: string[] = [];

  lines.push(tpl.summary.replace("{situation}", entry.situation));

  if (entry.emotion_tags.length > 0) {
    const list = entry.emotion_tags
      .map((t) => tpl.emotion_labels[t] ?? t)
      .join(", ");
    lines.push(tpl.emotions_found.replace("{emotion_list}", list));
  } else {
    lines.push(tpl.emotions_none);
  }

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

  if (history.length > 0) {
    const prev = history[history.length - 1];
    if (entry.intensity_score > prev.intensity_score) lines.push(tpl.dynamic_up);
    else if (entry.intensity_score < prev.intensity_score) lines.push(tpl.dynamic_down);
    else lines.push(tpl.dynamic_same);
  }

  const qs = pickQuestions(tpl.questions);
  return { analysis: lines.join("\n\n"), questions: qs };
}

const SUPPORT_TEMPLATES = [
  {
    keywords: ["тревога", "страх", "нервничаю", "переживаю", "волнуюсь", "паника", "беспокоюсь"],
    texts: [
      "Тревога — это сигнал, а не приговор. Ты уже делаешь важный шаг — наблюдаешь за ней вместо того, чтобы убегать.",
      "Когда мы признаём тревогу, она теряет часть своей силы. Ты справляешься — и это видно по твоим ответам.",
    ],
  },
  {
    keywords: ["злость", "раздражение", "бесит", "злюсь", "агрессия", "ненавижу"],
    texts: [
      "Злость — это энергия. Вопрос не в том, чтобы её подавить, а в том, куда её направить. Ты уже начал разбираться.",
      "Раздражение часто говорит о нарушенных границах. Это здоровая реакция — и важно, что ты её заметил.",
    ],
  },
  {
    keywords: ["грусть", "печаль", "тоска", "пустота", "одиночество", "одинок", "плачу"],
    texts: [
      "Грусть — это часть жизни, и она не делает тебя слабым. Наоборот, способность чувствовать — это твоя сила.",
      "Ты не один в этом. Само решение записать свои мысли — уже акт заботы о себе.",
    ],
  },
  {
    keywords: ["устал", "нет сил", "выгорание", "выдохся", "истощён", "не могу"],
    texts: [
      "Усталость — это тело говорит: «Нужна пауза». Ты не ленишься — ты заслуживаешь восстановления.",
      "Когда энергии мало, даже маленькие шаги считаются. И эта запись — один из них.",
    ],
  },
  {
    keywords: ["вина", "виноват", "стыдно", "стыд", "должен был"],
    texts: [
      "Чувство вины часто значит, что тебе не всё равно. Но самокритика без действия только отнимает силы. Ты уже на пути.",
      "Ты не обязан быть идеальным. Достаточно быть честным с собой — и ты это делаешь прямо сейчас.",
    ],
  },
];

function generateSupport(answers: string[], entry: DiaryEntry): string {
  const combined = [...answers, entry.situation, entry.thoughts, entry.emotions].join(" ").toLowerCase();

  for (const tpl of SUPPORT_TEMPLATES) {
    const matched = tpl.keywords.some((kw) => combined.includes(kw));
    if (matched) {
      return tpl.texts[Math.floor(Math.random() * tpl.texts.length)];
    }
  }

  const generic = [
    "Ты проделал важную работу сегодня. Само наблюдение за собой — это уже шаг к изменениям.",
    "Каждый раз, когда ты останавливаешься и рефлексируешь — ты становишься чуть ближе к себе. Это ценно.",
    "Ты не просто записал мысли — ты дал себе пространство подумать. Это больше, чем кажется.",
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

// step: -1=init, 0-4=questions, 5=analysis shown + reflection questions, 6=answering reflection, 7=done
type ViewTab = "chat" | "history";

export default function Diary() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPaywall, setShowPaywall] = useState(false);
  const [tab, setTab] = useState<ViewTab>("chat");
  const [reflectionQs, setReflectionQs] = useState<string[]>([]);
  const [reflectionIdx, setReflectionIdx] = useState(0);
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);

  const [tpl, setTpl] = useState<Templates | null>(null);
  const [emoDict, setEmoDict] = useState<Record<string, string[]> | null>(null);
  const [patRules, setPatRules] = useState<Record<string, string[]> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);

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

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const access = checkAccess("diary");
    if (access === "locked") setShowPaywall(true);
  }, [navigate]);

  useEffect(() => {
    if (!tpl) return;
    const stored = localStorage.getItem(CHAT_KEY);
    if (stored) {
      const parsed: Message[] = JSON.parse(stored);
      setMessages(parsed);
      idRef.current = parsed.length + 1;
      setStep(7);
      return;
    }
    freshStart();
  }, [tpl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function freshStart() {
    if (!tpl) return;
    const intro: Message = { id: idRef.current++, from: "bot", text: tpl.start_message };
    const q0: Message = { id: idRef.current++, from: "bot", text: tpl.steps[0].question };
    const init = [intro, q0];
    setMessages(init);
    saveChat(init);
    setStep(0);
    setAnswers({});
    setReflectionQs([]);
    setReflectionIdx(0);
    setReflectionAnswers([]);
    setCurrentEntry(null);
  }

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

  function send() {
    if (!input.trim() || !tpl || !emoDict || !patRules) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (step >= 0 && step < 5) {
      const stepKey = tpl.steps[step]?.key ?? "";
      const newAnswers = { ...answers, [stepKey]: text };
      setAnswers(newAnswers);

      let msgs = addUserMsg(text, messages);
      const nextStep = step + 1;

      if (nextStep < tpl.steps.length) {
        msgs = addBotMsg(tpl.steps[nextStep].question, msgs);
        setMessages(msgs);
        setStep(nextStep);
      } else {
        const allText = [
          newAnswers.situation ?? "",
          newAnswers.thoughts ?? "",
          newAnswers.emotions ?? "",
          newAnswers.body ?? "",
          newAnswers.action ?? "",
        ];

        const { tags: emoTags, score } = detectEmotions(allText, emoDict);
        const patTags = detectPatterns(allText, patRules);
        const history: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");

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
        setCurrentEntry(entry);

        const { analysis, questions } = buildResult(entry, history, tpl);
        setReflectionQs(questions);

        let resultText = analysis;
        resultText += "\n\n---\n\nТеперь несколько вопросов для размышления. Ответь на каждый — это поможет мне дать тебе поддержку.";
        resultText += `\n\n**Вопрос 1 из ${questions.length}:**\n${questions[0]}`;

        msgs = addBotMsg(resultText, msgs);
        setMessages(msgs);
        setStep(6);
        setReflectionIdx(0);
      }
    } else if (step === 6) {
      const newRA = [...reflectionAnswers, text];
      setReflectionAnswers(newRA);
      let msgs = addUserMsg(text, messages);

      const nextIdx = reflectionIdx + 1;
      if (nextIdx < reflectionQs.length) {
        msgs = addBotMsg(`**Вопрос ${nextIdx + 1} из ${reflectionQs.length}:**\n${reflectionQs[nextIdx]}`, msgs);
        setMessages(msgs);
        setReflectionIdx(nextIdx);
      } else {
        const entry = currentEntry!;
        entry.reflectionAnswers = newRA;

        const support = generateSupport(newRA, entry);
        entry.supportText = support;

        const history: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
        history.push(entry);
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(history));

        let supportMsg = "---\n\n";
        supportMsg += `${support}\n\n`;
        supportMsg += "Запись сохранена. Ты можешь вернуться к ней в истории.";

        msgs = addBotMsg(supportMsg, msgs);
        setMessages(msgs);
        setStep(7);
      }
    }
  }

  function startNew() {
    localStorage.removeItem(CHAT_KEY);
    idRef.current = 0;
    setMessages([]);
    setTab("chat");
    freshStart();
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

  const entries: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
  const isInputActive = (step >= 0 && step < 5) || step === 6;

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="diary"
          toolName="Дневник самоанализа"
          onClose={() => navigate("/cabinet")}
          onSuccess={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>

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
        </div>

        {entries.length > 0 && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setTab("chat")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Запись
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              История <span className="text-violet-500 ml-0.5">{entries.length}</span>
            </button>
          </div>
        )}
        {entries.length === 0 && <div className="w-16" />}
      </header>

      {tab === "chat" && step >= 0 && step < 5 && tpl && (
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-violet-400 transition-all duration-500"
            style={{ width: `${(step / tpl.steps.length) * 100}%` }}
          />
        </div>
      )}

      {tab === "history" ? (
        <HistoryView entries={entries} onNewEntry={startNew} />
      ) : (
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
                  onClick={startNew}
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
                {step >= 0 && step < 5 && tpl && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Шаг {step + 1} из {tpl.steps.length}
                  </p>
                )}
                {step === 6 && (
                  <p className="text-xs text-violet-600 font-medium mb-2">
                    Рефлексия — вопрос {reflectionIdx + 1} из {reflectionQs.length}
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
        </>
      )}
    </div>
  );
}

function HistoryView({ entries, onNewEntry }: { entries: DiaryEntry[]; onNewEntry: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const sorted = [...entries].reverse();

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <Icon name="BookOpen" size={28} className="text-violet-500" />
        </div>
        <h3 className="font-bold text-lg text-foreground mb-1">Записей пока нет</h3>
        <p className="text-sm text-muted-foreground mb-4">Создайте первую запись — ответьте на 5 вопросов</p>
        <button
          onClick={onNewEntry}
          className="bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-2xl hover:bg-violet-700 transition-colors text-sm"
        >
          Новая запись
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-lg text-foreground">История записей</h2>
        <button
          onClick={onNewEntry}
          className="bg-violet-100 text-violet-700 font-semibold px-4 py-2 rounded-xl hover:bg-violet-200 transition-colors text-xs flex items-center gap-1.5"
        >
          <Icon name="Plus" size={14} />
          Новая
        </button>
      </div>

      {sorted.map((entry, idx) => {
        const isOpen = expanded === idx;
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString("ru-RU", {
          day: "2-digit", month: "long", year: "numeric",
          timeZone: "Europe/Moscow",
        });
        const timeStr = d.toLocaleTimeString("ru-RU", {
          hour: "2-digit", minute: "2-digit",
          timeZone: "Europe/Moscow",
        });

        const emotionLabels: Record<string, string> = {
          anxiety: "Тревога", anger: "Злость", sadness: "Грусть",
          guilt: "Вина", fatigue: "Усталость", shame: "Стыд", loneliness: "Одиночество",
        };

        return (
          <div key={idx} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="w-full text-left px-4 py-3.5 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Icon name="FileText" size={16} className="text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{entry.situation}</div>
                <div className="text-xs text-muted-foreground">{dateStr}, {timeStr} (МСК)</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.emotion_tags.length > 0 && (
                  <div className="flex gap-1">
                    {entry.emotion_tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">
                        {emotionLabels[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                )}
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Что произошло", value: entry.situation },
                    { label: "Мысли", value: entry.thoughts },
                    { label: "Эмоции", value: entry.emotions },
                    { label: "Реакция тела", value: entry.body },
                    { label: "Действие", value: entry.action },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2">
                      <div className="text-[11px] text-muted-foreground font-medium mb-0.5">{item.label}</div>
                      <div className="text-sm text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>

                {entry.emotion_tags.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium mb-1">Определённые эмоции</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.emotion_tags.map((tag) => (
                        <span key={tag} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          {emotionLabels[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.reflectionAnswers && entry.reflectionAnswers.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium mb-1">Рефлексия</div>
                    <div className="space-y-1.5">
                      {entry.reflectionAnswers.map((ans, ri) => (
                        <div key={ri} className="bg-violet-50 rounded-xl px-3 py-2 text-sm text-foreground">
                          {ans}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.supportText && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                    <div className="text-[11px] text-green-600 font-medium mb-1 flex items-center gap-1">
                      <Icon name="Heart" size={11} />
                      Поддержка
                    </div>
                    <div className="text-sm text-green-800">{entry.supportText}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
