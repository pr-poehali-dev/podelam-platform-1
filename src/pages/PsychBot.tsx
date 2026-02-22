import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import PsychBotPaywall from "@/components/psych-bot/PsychBotPaywall";
import PsychBotChat from "@/components/psych-bot/PsychBotChat";
import {
  BotState,
  Message,
  Widget,
  INITIAL_STATE,
  applyAnswer,
  getTopSegment,
  getPrimaryMotivation,
  rankProfessions,
  buildReport,
  TOTAL_QUESTIONS,
} from "@/components/psych-bot/psychBotEngine";
import { QUESTIONS, SEGMENT_NAMES, PROFILE_MATRIX, SEGMENT_PROFESSIONS, MOTIVATION_NAMES } from "@/components/psych-bot/psychBotData";

const WELCOME_TEXT = `Привет! Я помогу определить, в каком направлении тебе будет легко и энергично работать.

Это психологический тест из **${TOTAL_QUESTIONS} вопросов**. Для каждого вопроса выбери один вариант — тот, что откликается сильнее.

Никакого AI — только алгоритм на основе твоих реальных ответов.

Готов начать?`;

export default function PsychBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<BotState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMsg = (from: "bot" | "user", text: string, widget?: Widget) => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, from, text, widget }]);
  };

  const botReply = (text: string, widget?: Widget, delay = 500) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addMsg("bot", text, widget);
    }, delay);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData = JSON.parse(u);

    const paid = localStorage.getItem(`psych_paid_${userData.email}`);
    if (paid === "true") setHasAccess(true);

    const savedMessages = localStorage.getItem(`psych_chat3_${userData.email}`);
    const savedState = localStorage.getItem(`psych_state3_${userData.email}`);

    if (savedMessages && savedState) {
      setMessages(JSON.parse(savedMessages));
      setBotState(JSON.parse(savedState));
    } else {
      setTimeout(() => {
        addMsg("bot", WELCOME_TEXT, { type: "button_list", options: ["Да, начнём!"] });
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
      localStorage.setItem(`psych_chat3_${userData.email}`, JSON.stringify(messages));
      localStorage.setItem(`psych_state3_${userData.email}`, JSON.stringify(botState));
    }
  }, [messages, botState]);

  const savePsychResult = (
    topSeg: string,
    primMotiv: string,
    selectedProf: string,
    segScores: Record<string, number>,
    motivScores: Record<string, number>
  ) => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);

    const totalSeg = Object.values(segScores).reduce((a, b) => a + b, 0) || 1;
    const topSegScore = Math.round(((segScores[topSeg] ?? 0) / totalSeg) * 100);

    const topSegs = Object.entries(segScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([s, v]) => ({ key: s, name: SEGMENT_NAMES[s], pct: Math.round((v / totalSeg) * 100) }));

    const totalMotiv = Object.values(motivScores).reduce((a, b) => a + b, 0) || 1;
    const topMotivations = Object.entries(motivScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([, v]) => v > 0)
      .map(([m, v]) => ({ key: m, name: MOTIVATION_NAMES[m], pct: Math.round((v / totalMotiv) * 100) }));

    const profileName = PROFILE_MATRIX[primMotiv]?.[topSeg] ?? "Уникальный профиль";

    const professions = (SEGMENT_PROFESSIONS[topSeg] ?? []).slice(0, 4).map((p) => ({
      name: p.name,
      match: p.tags.includes(primMotiv) ? Math.floor(Math.random() * 8 + 85) : Math.floor(Math.random() * 10 + 70),
    }));

    const psychResult = {
      profileName,
      topSeg,
      primMotiv,
      selectedProf,
      topSegs,
      topMotivations,
      topSegScore,
      professions,
    };

    localStorage.setItem(`psych_result_${userData.email}`, JSON.stringify(psychResult));

    const tests: { id: string; type: string; date: string; score: number }[] = JSON.parse(
      localStorage.getItem("pdd_tests") || "[]"
    );
    const existingIdx = tests.findIndex((t) => t.type === "Психологический тест");
    const newEntry = {
      id: existingIdx >= 0 ? tests[existingIdx].id : Date.now().toString(),
      type: "Психологический тест",
      date: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
      score: topSegScore,
    };
    if (existingIdx >= 0) {
      tests[existingIdx] = newEntry;
    } else {
      tests.push(newEntry);
    }
    localStorage.setItem("pdd_tests", JSON.stringify(tests));
  };

  const handlePay = () => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    localStorage.setItem(`psych_paid_${userData.email}`, "true");
    setHasAccess(true);
  };

  const handleReset = () => {
    const u = localStorage.getItem("pdd_user");
    if (!u) return;
    const userData = JSON.parse(u);
    localStorage.removeItem(`psych_chat3_${userData.email}`);
    localStorage.removeItem(`psych_state3_${userData.email}`);
    setMessages([]);
    setBotState(INITIAL_STATE);
    setTimeout(() => {
      addMsg("bot", WELCOME_TEXT, { type: "button_list", options: ["Да, начнём!"] });
    }, 300);
  };

  // ── ВОПРОС ТЕСТА ──────────────────────────────────────────────────────────

  const askQuestion = (state: BotState, idx: number) => {
    const q = QUESTIONS[idx];
    const progress = `Вопрос ${idx + 1} из ${TOTAL_QUESTIONS}`;
    botReply(
      `**${progress}**\n\n${q.text}`,
      { type: "button_list", options: q.options.map((o) => o.text) },
      400
    );
  };

  // ── ОБРАБОТЧИК КНОПОК ──────────────────────────────────────────────────────

  const handleButtonClick = (option: string) => {
    addMsg("user", option);
    const st = botState;

    // Старт теста
    if (st.step === "welcome") {
      const newState: BotState = { ...st, step: "quiz", currentQuestion: 0 };
      setBotState(newState);
      askQuestion(newState, 0);
      return;
    }

    // Ответ на вопрос теста
    if (st.step === "quiz") {
      const q = QUESTIONS[st.currentQuestion];
      const optionIndex = q.options.findIndex((o) => o.text === option);
      if (optionIndex === -1) return;

      const { segmentScores, motivationScores } = applyAnswer(
        st.segmentScores,
        st.motivationScores,
        st.currentQuestion,
        optionIndex
      );

      const nextQuestion = st.currentQuestion + 1;

      if (nextQuestion < TOTAL_QUESTIONS) {
        const newState: BotState = {
          ...st,
          currentQuestion: nextQuestion,
          segmentScores,
          motivationScores,
          answers: [...st.answers, optionIndex],
        };
        setBotState(newState);
        askQuestion(newState, nextQuestion);
      } else {
        // Тест завершён — вычисляем результат
        const topSeg = getTopSegment(segmentScores);
        const primMotiv = getPrimaryMotivation(motivationScores);
        const profs = rankProfessions(topSeg, primMotiv);

        const newState: BotState = {
          ...st,
          step: "show_professions",
          currentQuestion: nextQuestion,
          segmentScores,
          motivationScores,
          answers: [...st.answers, optionIndex],
          topSegment: topSeg,
          primaryMotivation: primMotiv,
          professions: profs,
        };
        setBotState(newState);

        botReply(
          `Тест завершён! Обрабатываю результаты...`,
          undefined,
          300
        );
        setTimeout(() => {
          setLoading(false);
          addMsg(
            "bot",
            `**Твоё ведущее направление: ${SEGMENT_NAMES[topSeg]}**

Теперь оцени профессии в этом направлении по шкале от 1 до 5 — насколько тебя привлекает каждая из них.

Не думай слишком долго — доверяй первому ощущению.`,
            { type: "rating_list", professions: profs.map((p) => p.name) }
          );
        }, 1400);
      }
      return;
    }

    // Финальный выбор из нескольких профессий
    if (st.step === "ask_final_choice") {
      const topSeg = st.topSegment!;
      const primMotiv = st.primaryMotivation!;

      setBotState((s) => ({ ...s, step: "report", selectedProfession: option }));
      savePsychResult(topSeg, primMotiv, option, st.segmentScores, st.motivationScores);
      botReply(`Зафиксировал: **«${option}»** — твой выбор.\n\nГенерирую персональный отчёт...`, undefined, 400);
      setTimeout(() => {
        const report = buildReport(topSeg, primMotiv, option, st.segmentScores, st.motivationScores);
        addMsg("bot", report);
        setLoading(false);
      }, 1600);
      return;
    }
  };

  // ── ОБРАБОТЧИК ОЦЕНОК ──────────────────────────────────────────────────────

  const handleRatingsSubmit = (ratings: Record<string, number>) => {
    const ratingsText = Object.entries(ratings).map(([p, s]) => `${p}: ${s}⭐`).join(", ");
    addMsg("user", `Оценки выставлены: ${ratingsText}`);

    const highRated = Object.entries(ratings).filter(([, s]) => s >= 4).map(([p]) => p);
    const st = botState;
    const topSeg = st.topSegment!;
    const primMotiv = st.primaryMotivation!;

    if (highRated.length === 0) {
      setBotState((s) => ({ ...s, step: "collect_ratings", ratings }));
      botReply(
        `Ни одна профессия не набрала 4+ баллов. Попробуй пересмотреть — возможно, ты оцениваешь слишком строго.`,
        { type: "rating_list", professions: st.professions.map((p) => p.name) }
      );
      return;
    }

    if (highRated.length === 1) {
      const prof = highRated[0];
      setBotState((s) => ({ ...s, step: "report", ratings, highRated, selectedProfession: prof }));
      savePsychResult(topSeg, primMotiv, prof, st.segmentScores, st.motivationScores);
      botReply(`Зафиксировал: **«${prof}»** — твой главный выбор.\n\nГенерирую персональный отчёт...`, undefined, 400);
      setTimeout(() => {
        const report = buildReport(topSeg, primMotiv, prof, st.segmentScores, st.motivationScores);
        addMsg("bot", report);
        setLoading(false);
      }, 1600);
      return;
    }

    setBotState((s) => ({ ...s, step: "ask_final_choice", ratings, highRated }));
    botReply(
      `Несколько профессий тебе откликнулись. Выбери одну — с чего начнёшь уже в этом месяце?`,
      { type: "button_list", options: highRated }
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  if (!hasAccess) {
    return <PsychBotPaywall onPay={handlePay} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
          <Icon name="Brain" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Психологический тест</p>
          {botState.step === "quiz" && (
            <p className="text-xs text-gray-500">{botState.currentQuestion} из {TOTAL_QUESTIONS} вопросов</p>
          )}
          {botState.step !== "quiz" && botState.step !== "welcome" && (
            <p className="text-xs text-gray-500">Анализ завершён</p>
          )}
        </div>
        {/* Прогресс-бар */}
        {botState.step === "quiz" && (
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${(botState.currentQuestion / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        )}
        {messages.length > 1 && (
          <button onClick={handleReset} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Начать заново">
            <Icon name="RotateCcw" size={16} />
          </button>
        )}
      </div>

      {/* Chat */}
      <PsychBotChat
        messages={messages}
        loading={loading}
        bottomRef={bottomRef}
        onButtonClick={handleButtonClick}
        onRatingsSubmit={handleRatingsSubmit}
        onReset={handleReset}
        step={botState.step}
      />
    </div>
  );
}