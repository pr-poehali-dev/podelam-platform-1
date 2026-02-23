import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import DiaryChat from "@/components/diary/DiaryChat";
import DiaryHistory from "@/components/diary/DiaryHistory";
import {
  Message,
  DiaryEntry,
  Templates,
  CHAT_KEY,
  ENTRIES_KEY,
  detectEmotions,
  detectPatterns,
  buildResult,
  generateSupport,
} from "@/components/diary/diaryEngine";

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
    const stored = localStorage.getItem(CHAT_KEY());
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
    localStorage.setItem(CHAT_KEY(), JSON.stringify(msgs));
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
        const history: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");

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

        const history2: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");
        history2.push(entry);
        localStorage.setItem(ENTRIES_KEY(), JSON.stringify(history2));

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
    localStorage.removeItem(CHAT_KEY());
    idRef.current = 0;
    setMessages([]);
    setTab("chat");
    freshStart();
  }

  const entries: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="diary"
          toolName="Дневник самоанализа"
          onClose={() => navigate("/cabinet?tab=tools")}
          onSuccess={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate("/cabinet?tab=tools")}
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
        <DiaryHistory entries={entries} onNewEntry={startNew} />
      ) : (
        <DiaryChat
          messages={messages}
          step={step}
          totalSteps={tpl?.steps.length ?? 5}
          reflectionIdx={reflectionIdx}
          reflectionTotal={reflectionQs.length}
          input={input}
          onInputChange={setInput}
          onSend={send}
          onStartNew={startNew}
          bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
        />
      )}
    </div>
  );
}