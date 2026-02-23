import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, saveToolCompletion } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import DiaryChat from "@/components/diary/DiaryChat";
import DiaryHistory from "@/components/diary/DiaryHistory";
import {
  Message,
  DiaryEntry,
  Phase,
  CHAT_KEY,
  ENTRIES_KEY,
  getOpener,
  getNextQuestion,
  buildSupport,
  detectEmotions,
} from "@/components/diary/diaryEngine";

type ViewTab = "chat" | "history";

export default function Diary() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [tab, setTab] = useState<ViewTab>("chat");
  const [currentQuestion, setCurrentQuestion] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const access = checkAccess("diary");
    if (access === "locked") setShowPaywall(true);
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem(CHAT_KEY());
    if (stored) {
      const parsed: Message[] = JSON.parse(stored);
      setMessages(parsed);
      idRef.current = parsed.length + 1;
      setPhase("done");
      return;
    }
    freshStart();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  function save(msgs: Message[]) {
    localStorage.setItem(CHAT_KEY(), JSON.stringify(msgs));
  }

  function addBot(text: string, current: Message[], widget?: "finish_btn"): Message[] {
    const msg: Message = { id: idRef.current++, from: "bot", text, widget };
    const next = [...current, msg];
    save(next);
    return next;
  }

  function addUser(text: string, current: Message[]): Message[] {
    const msg: Message = { id: idRef.current++, from: "user", text };
    const next = [...current, msg];
    save(next);
    return next;
  }

  function freshStart() {
    const opener = getOpener();
    setCurrentQuestion(opener);
    const intro: Message = { id: idRef.current++, from: "bot", text: "Это твой личный дневник самоанализа.\n\nЗдесь можно записать всё, что на душе: чувства, мысли, события, сомнения, победы. Я буду задавать открытые вопросы, чтобы помочь тебе разобраться в себе.\n\nНикакого ИИ — только алгоритм, который реагирует на твои эмоции и помогает копнуть глубже. Все записи сохраняются и доступны в истории.\n\n**На любом шаге можешь нажать «Завершить на сегодня»** — я подведу итог и дам поддержку." };
    const q: Message = { id: idRef.current++, from: "bot", text: opener, widget: "finish_btn" };
    const init = [intro, q];
    setMessages(init);
    save(init);
    setPhase("conversation");
    setAnswers([]);
  }

  function send() {
    if (!input.trim() || phase !== "conversation") return;
    const text = input.trim();
    setInput("");

    const newAnswers = [...answers, { question: currentQuestion, answer: text }];
    setAnswers(newAnswers);

    let msgs = addUser(text, messages);

    const nextQ = getNextQuestion(newAnswers, newAnswers.length);

    if (nextQ) {
      setCurrentQuestion(nextQ);
      setTimeout(() => {
        msgs = addBot(nextQ, msgs, "finish_btn");
        setMessages(msgs);
      }, 500);
    } else {
      finishSession(msgs, newAnswers);
    }
  }

  function finishSession(currentMsgs?: Message[], currentAnswers?: { question: string; answer: string }[]) {
    const ans = currentAnswers || answers;
    if (ans.length === 0) return;

    const msgs = currentMsgs || messages;
    setPhase("finishing");

    const support = buildSupport(ans);
    const { tags, intensity } = detectEmotions(ans.map(a => a.answer));

    const entry: DiaryEntry = {
      date: new Date().toISOString(),
      answers: ans,
      emotion_tags: tags,
      intensity,
      supportText: support,
    };

    const history: DiaryEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");
    history.push(entry);
    localStorage.setItem(ENTRIES_KEY(), JSON.stringify(history));

    saveToolCompletion("diary", `Запись: ${tags.join(", ")}`);

    setTimeout(() => {
      const finalMsgs = addBot(support, msgs);
      setMessages(finalMsgs);
      setPhase("done");
    }, 600);
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

        {entries.length > 0 ? (
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
              История ({entries.length})
            </button>
          </div>
        ) : <div className="w-16" />}
      </header>

      {tab === "history" ? (
        <DiaryHistory entries={entries} />
      ) : (
        <DiaryChat
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={send}
          onFinish={() => finishSession()}
          onStartNew={startNew}
          phase={phase}
          bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
          answersCount={answers.length}
        />
      )}
    </div>
  );
}
