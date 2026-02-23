import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, saveToolCompletion } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import DiaryChat from "@/components/diary/DiaryChat";
import DiaryHistory from "@/components/diary/DiaryHistory";
import {
  Message, JournalEntry, Phase, InputMode,
  CHAT_KEY, ENTRIES_KEY, CONTEXT_AREAS, ALL_EMOTIONS_CHIPS,
  getAchievementFollowup, getActionsFollowup, getDifficultyFollowup,
  getInsightFollowup, buildReport, stageLabel,
} from "@/components/diary/diaryEngine";

type ViewTab = "chat" | "history";

export default function Diary() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("intro");
  const [showPaywall, setShowPaywall] = useState(false);
  const [tab, setTab] = useState<ViewTab>("chat");

  const [stageNumber, setStageNumber] = useState(1);
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [currentButtons, setCurrentButtons] = useState<string[]>([]);
  const [currentChips, setCurrentChips] = useState<{ label: string; group: string }[]>([]);
  const [currentSlider, setCurrentSlider] = useState<{ min: number; max: number; label: string } | undefined>();

  const [entry, setEntry] = useState<Omit<JournalEntry, "report" | "date">>({
    context_area: "",
    achievements: [],
    actions: [],
    emotions: [],
    body_state: [],
    difficulties: [],
    insights: [],
    gratitude: [],
    energy_level: 0,
    stress_level: 0,
    completion_stage: 0,
  });

  const [pendingEmotions, setPendingEmotions] = useState<string[]>([]);
  const [currentEmotionIdx, setCurrentEmotionIdx] = useState(0);

  const [canAddMore, setCanAddMore] = useState(false);
  const [addMoreLabel, setAddMoreLabel] = useState("");
  const [subItemCount, setSubItemCount] = useState(0);
  const [maxSubItems, setMaxSubItems] = useState(5);
  const [awaitingFollowup, setAwaitingFollowup] = useState(false);

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
    startFresh();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase, inputMode]);

  function save(msgs: Message[]) {
    localStorage.setItem(CHAT_KEY(), JSON.stringify(msgs));
  }

  function addBot(text: string, current: Message[]): Message[] {
    const msg: Message = { id: idRef.current++, from: "bot", text };
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

  function startFresh() {
    idRef.current = 0;
    setEntry({
      context_area: "", achievements: [], actions: [], emotions: [],
      body_state: [], difficulties: [], insights: [], gratitude: [],
      energy_level: 0, stress_level: 0, completion_stage: 0,
    });
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setPendingEmotions([]);
    setCurrentEmotionIdx(0);

    const intro: Message = {
      id: idRef.current++, from: "bot",
      text: "Добро пожаловать в дневник самоанализа.\n\nЗдесь вы фиксируете свои достижения, эмоции, действия и осознания. Я проведу вас через 8 шагов.\n\nНа любом этапе вы можете нажать **«Завершить анализ»** — я подведу итог по тому, что вы успели записать.",
    };
    const q: Message = {
      id: idRef.current++, from: "bot",
      text: "В какой сфере вы сегодня хотите провести анализ?",
    };
    const init = [intro, q];
    setMessages(init);
    save(init);
    setPhase("context");
    setStageNumber(1);
    setInputMode("buttons");
    setCurrentButtons([...CONTEXT_AREAS, "Свой вариант"]);
    setCanAddMore(false);
  }

  function goToAchievements(msgs: Message[]) {
    setStageNumber(2);
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setMaxSubItems(5);
    setPhase("achievements");
    setInputMode("text");
    setCanAddMore(false);

    const m = addBot("Что сегодня получилось? Даже если это мелочь.\n\nМожно добавить до 5 достижений.", msgs);
    setMessages(m);
  }

  function goToActions(msgs: Message[]) {
    setStageNumber(3);
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setMaxSubItems(7);
    setPhase("actions");
    setInputMode("text");
    setCanAddMore(false);

    const m = addBot("Какие конкретные шаги вы сегодня сделали?\n\nМожно добавить до 7 действий.", msgs);
    setMessages(m);
  }

  function goToEmotions(msgs: Message[]) {
    setStageNumber(4);
    setPhase("emotions");
    setInputMode("chips");
    setCurrentChips(ALL_EMOTIONS_CHIPS);
    setCanAddMore(false);

    const m = addBot("Какие эмоции вы сегодня испытывали?\n\nВыберите до 6 эмоций из списка.", msgs);
    setMessages(m);
  }

  function goToEnergy(msgs: Message[]) {
    setStageNumber(5);
    setPhase("energy");
    setInputMode("slider");
    setCurrentSlider({ min: 0, max: 10, label: "Уровень энергии" });
    setCanAddMore(false);

    const m = addBot("Оцените ваш уровень энергии сегодня.", msgs);
    setMessages(m);
  }

  function goToStress(msgs: Message[]) {
    setPhase("stress");
    setInputMode("slider");
    setCurrentSlider({ min: 0, max: 10, label: "Уровень стресса" });
    setCanAddMore(false);

    const m = addBot("Оцените ваш уровень стресса сегодня.", msgs);
    setMessages(m);
  }

  function goToDifficulties(msgs: Message[]) {
    setStageNumber(6);
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setMaxSubItems(5);
    setPhase("difficulties");
    setInputMode("text");
    setCanAddMore(false);

    const m = addBot("С чем вы столкнулись сегодня? С какими сложностями?\n\nМожно добавить до 5 пунктов.", msgs);
    setMessages(m);
  }

  function goToInsights(msgs: Message[]) {
    setStageNumber(7);
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setMaxSubItems(3);
    setPhase("insights");
    setInputMode("text");
    setCanAddMore(false);

    const m = addBot("Какой главный вывод вы сделали сегодня?", msgs);
    setMessages(m);
  }

  function goToGratitude(msgs: Message[]) {
    setStageNumber(8);
    setSubItemCount(0);
    setAwaitingFollowup(false);
    setMaxSubItems(3);
    setPhase("gratitude");
    setInputMode("text");
    setCanAddMore(false);

    const m = addBot("За что вы можете поблагодарить себя сегодня?\n\nДобавьте 1–3 пункта.", msgs);
    setMessages(m);
  }

  function finishSession(currentMsgs?: Message[], forceStage?: number) {
    const msgs = currentMsgs || messages;
    const completionStage = forceStage || stageNumber;
    const finalEntry = { ...entry, completion_stage: completionStage };

    setPhase("finishing");
    setInputMode("none");

    const report = buildReport(finalEntry);
    const fullEntry: JournalEntry = { ...finalEntry, report, date: new Date().toISOString() };

    const history: JournalEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");
    history.push(fullEntry);
    localStorage.setItem(ENTRIES_KEY(), JSON.stringify(history));

    const emotionSummary = fullEntry.emotions.map(e => e.emotion).join(", ") || "без эмоций";
    saveToolCompletion("diary", `Запись: ${emotionSummary}`);

    setTimeout(() => {
      const finalMsgs = addBot(report, msgs);
      setMessages(finalMsgs);
      setPhase("done");
    }, 800);
  }

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    let msgs = addUser(text, messages);

    if (phase === "context") {
      setEntry(prev => ({ ...prev, context_area: text }));
      msgs = addBot(`Сфера: **${text}**`, msgs);
      setMessages(msgs);
      setTimeout(() => goToAchievements(msgs), 400);
      return;
    }

    if (phase === "achievements" || phase === "achievements_follow") {
      if (awaitingFollowup) {
        setAwaitingFollowup(false);
        if (subItemCount >= maxSubItems) {
          setMessages(msgs);
          setTimeout(() => goToActions(msgs), 400);
        } else {
          setCanAddMore(true);
          setAddMoreLabel("Далее — действия");
          msgs = addBot("Хотите добавить ещё достижение?", msgs);
          setMessages(msgs);
          setPhase("achievements");
        }
        return;
      }

      const newCount = subItemCount + 1;
      setSubItemCount(newCount);
      setEntry(prev => ({ ...prev, achievements: [...prev.achievements, text] }));

      const followup = getAchievementFollowup();
      setAwaitingFollowup(true);
      setPhase("achievements_follow");
      setCanAddMore(false);
      msgs = addBot(followup, msgs);
      setMessages(msgs);
      return;
    }

    if (phase === "actions" || phase === "actions_follow") {
      if (awaitingFollowup) {
        setAwaitingFollowup(false);
        if (subItemCount >= maxSubItems) {
          setMessages(msgs);
          setTimeout(() => goToEmotions(msgs), 400);
        } else {
          setCanAddMore(true);
          setAddMoreLabel("Далее — эмоции");
          msgs = addBot("Хотите добавить ещё действие?", msgs);
          setMessages(msgs);
          setPhase("actions");
        }
        return;
      }

      const newCount = subItemCount + 1;
      setSubItemCount(newCount);
      setEntry(prev => ({ ...prev, actions: [...prev.actions, text] }));

      if (newCount >= 2) {
        const followup = getActionsFollowup();
        setAwaitingFollowup(true);
        setPhase("actions_follow");
        setCanAddMore(false);
        msgs = addBot(followup, msgs);
        setMessages(msgs);
      } else {
        setCanAddMore(true);
        setAddMoreLabel("Далее — эмоции");
        setMessages(msgs);
      }
      return;
    }

    if (phase === "emotion_trigger") {
      const emotionName = pendingEmotions[currentEmotionIdx];
      setEntry(prev => ({
        ...prev,
        emotions: [...prev.emotions, { emotion: emotionName, trigger: text }],
      }));

      const nextIdx = currentEmotionIdx + 1;
      if (nextIdx < pendingEmotions.length) {
        setCurrentEmotionIdx(nextIdx);
        msgs = addBot(`В какой момент вы почувствовали: **${pendingEmotions[nextIdx]}**?`, msgs);
        setMessages(msgs);
      } else {
        setMessages(msgs);
        setTimeout(() => goToEnergy(msgs), 400);
      }
      return;
    }

    if (phase === "difficulties" || phase === "difficulty_follow") {
      if (awaitingFollowup) {
        setAwaitingFollowup(false);
        if (subItemCount >= maxSubItems) {
          setMessages(msgs);
          setTimeout(() => goToInsights(msgs), 400);
        } else {
          setCanAddMore(true);
          setAddMoreLabel("Далее — осознания");
          msgs = addBot("Хотите добавить ещё сложность?", msgs);
          setMessages(msgs);
          setPhase("difficulties");
        }
        return;
      }

      const newCount = subItemCount + 1;
      setSubItemCount(newCount);
      setEntry(prev => ({ ...prev, difficulties: [...prev.difficulties, text] }));

      const followup = getDifficultyFollowup();
      setAwaitingFollowup(true);
      setPhase("difficulty_follow");
      setCanAddMore(false);
      msgs = addBot(followup, msgs);
      setMessages(msgs);
      return;
    }

    if (phase === "insights" || phase === "insight_follow") {
      if (awaitingFollowup) {
        setAwaitingFollowup(false);
        if (subItemCount >= maxSubItems) {
          setMessages(msgs);
          setTimeout(() => goToGratitude(msgs), 400);
        } else {
          setCanAddMore(true);
          setAddMoreLabel("Далее — благодарность");
          msgs = addBot("Хотите добавить ещё вывод?", msgs);
          setMessages(msgs);
          setPhase("insights");
        }
        return;
      }

      const newCount = subItemCount + 1;
      setSubItemCount(newCount);
      setEntry(prev => ({ ...prev, insights: [...prev.insights, text] }));

      const followup = getInsightFollowup();
      setAwaitingFollowup(true);
      setPhase("insight_follow");
      setCanAddMore(false);
      msgs = addBot(followup, msgs);
      setMessages(msgs);
      return;
    }

    if (phase === "gratitude") {
      const newCount = subItemCount + 1;
      setSubItemCount(newCount);
      setEntry(prev => ({ ...prev, gratitude: [...prev.gratitude, text] }));

      if (newCount >= maxSubItems) {
        setMessages(msgs);
        finishSession(msgs, 8);
      } else {
        setCanAddMore(true);
        setAddMoreLabel("Завершить");
        msgs = addBot("Хотите добавить ещё?", msgs);
        setMessages(msgs);
      }
      return;
    }

    setMessages(msgs);
  }

  function handleButtonSelect(value: string) {
    if (phase === "context") {
      if (value === "Свой вариант") {
        setInputMode("text");
        setCurrentButtons([]);
        return;
      }
      let msgs = addUser(value, messages);
      setEntry(prev => ({ ...prev, context_area: value }));
      msgs = addBot(`Отлично, сфера: **${value}**`, msgs);
      setMessages(msgs);
      setTimeout(() => goToAchievements(msgs), 400);
    }
  }

  function handleChipsConfirm(selected: string[]) {
    const displayText = selected.join(", ");
    let msgs = addUser(displayText, messages);

    setPendingEmotions(selected);
    setCurrentEmotionIdx(0);

    if (selected.length > 0) {
      setPhase("emotion_trigger");
      setInputMode("text");
      msgs = addBot(`Вы выбрали: **${displayText}**\n\nТеперь уточним каждую эмоцию.\n\nВ какой момент вы почувствовали: **${selected[0]}**?`, msgs);
      setMessages(msgs);
    } else {
      setMessages(msgs);
      setTimeout(() => goToEnergy(msgs), 400);
    }
  }

  function handleSliderConfirm(value: number) {
    let msgs = addUser(String(value), messages);

    if (phase === "energy") {
      setEntry(prev => ({ ...prev, energy_level: value }));

      let note = "";
      if (value <= 3) note = "\nПометка: низкий ресурс.";

      msgs = addBot(`Энергия: **${value}/10**${note}`, msgs);
      setMessages(msgs);
      setTimeout(() => goToStress(msgs), 400);
      return;
    }

    if (phase === "stress") {
      setEntry(prev => ({ ...prev, stress_level: value }));

      let note = "";
      if (value >= 7) note = "\nПометка: высокая нагрузка.";

      msgs = addBot(`Стресс: **${value}/10**${note}`, msgs);
      setMessages(msgs);
      setTimeout(() => goToDifficulties(msgs), 400);
      return;
    }
  }

  function handleAddMore() {
    setCanAddMore(false);

    if (phase === "achievements") {
      if (subItemCount >= maxSubItems) {
        goToActions(messages);
      } else {
        goToActions(messages);
      }
      return;
    }
    if (phase === "actions") {
      goToEmotions(messages);
      return;
    }
    if (phase === "difficulties") {
      goToInsights(messages);
      return;
    }
    if (phase === "insights") {
      goToGratitude(messages);
      return;
    }
    if (phase === "gratitude") {
      finishSession(messages, 8);
      return;
    }
  }

  function handleFinish() {
    finishSession(messages, stageNumber);
  }

  function startNew() {
    localStorage.removeItem(CHAT_KEY());
    setMessages([]);
    setTab("chat");
    startFresh();
  }

  const entries: JournalEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");

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
          {phase !== "done" && phase !== "finishing" && phase !== "intro" && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md ml-1">
              {stageLabel(stageNumber)} ({stageNumber}/8)
            </span>
          )}
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
          onSend={handleSend}
          onButtonSelect={handleButtonSelect}
          onChipsConfirm={handleChipsConfirm}
          onSliderConfirm={handleSliderConfirm}
          onFinish={handleFinish}
          onStartNew={startNew}
          phase={phase}
          currentInputMode={inputMode}
          currentButtons={currentButtons}
          currentChips={currentChips}
          currentSlider={currentSlider}
          bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
          stageNumber={stageNumber}
          canAddMore={canAddMore}
          onAddMore={handleAddMore}
          addMoreLabel={addMoreLabel}
        />
      )}
    </div>
  );
}
