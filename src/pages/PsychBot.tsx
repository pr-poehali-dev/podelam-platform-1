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
  segmentActivities,
  getTop2,
  analyzeMotivation,
  getPrimaryMotivation,
  rankProfessions,
  buildReport,
} from "@/components/psych-bot/psychBotEngine";
import { SEGMENT_NAMES, MOTIVATION_NAMES } from "@/components/psych-bot/psychBotData";

const WELCOME_TEXT = `Привет! Я помогу определить, в каком направлении тебе будет легко и энергично работать.

Это анализ из 5 этапов. Никакого AI — только алгоритм на основе твоих реальных ответов.

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

  const botReply = (text: string, widget?: Widget, delay = 600) => {
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

    const savedMessages = localStorage.getItem(`psych_chat2_${userData.email}`);
    const savedState = localStorage.getItem(`psych_state2_${userData.email}`);

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
      localStorage.setItem(`psych_chat2_${userData.email}`, JSON.stringify(messages));
      localStorage.setItem(`psych_state2_${userData.email}`, JSON.stringify(botState));
    }
  }, [messages, botState]);

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
    localStorage.removeItem(`psych_chat2_${userData.email}`);
    localStorage.removeItem(`psych_state2_${userData.email}`);
    setMessages([]);
    setBotState(INITIAL_STATE);
    setTimeout(() => {
      addMsg("bot", WELCOME_TEXT, { type: "button_list", options: ["Да, начнём!"] });
    }, 300);
  };

  // ── ОБРАБОТЧИК КНОПОК ──────────────────────────────────────────────────────

  const handleButtonClick = (option: string) => {
    addMsg("user", option);
    const st = botState;

    if (st.step === "welcome") {
      setBotState((s) => ({ ...s, step: "collect_activities" }));
      botReply(`Отлично! 

**Этап 1 из 5 — Список желаний**

В течение 5 минут напиши все виды деятельности, которыми тебе хотелось бы заниматься.

• Не оценивай реальность
• Можно писать даже невозможные варианты
• Минимум 15 пунктов, каждый с новой строки

Просто пиши — я подожду 👇`);
      return;
    }

    if (st.step === "show_top2" && st.top2) {
      const [seg1, seg2] = st.top2;
      const chosen = option.includes(SEGMENT_NAMES[seg1]) ? seg1 : seg2;
      setBotState((s) => ({ ...s, step: "ask_segment_why", chosenSegment: chosen }));
      botReply(`Хороший выбор!

**Этап 3 из 5 — Анализ мотивации**

Напиши в свободной форме: почему именно «${SEGMENT_NAMES[chosen]}» откликается тебе сильнее?

Что в этом направлении привлекает — деньги, свобода, смысл, признание, процесс? Чем честнее, тем точнее анализ.`);
      return;
    }

    if (st.step === "ask_final_choice") {
      setBotState((s) => ({ ...s, step: "report", selectedProfession: option }));
      const report = buildReport(
        st.chosenSegment!,
        st.primaryMotivation,
        option,
        st.segmentScores,
        st.motivationScores
      );
      botReply(`Отлично, финальный выбор зафиксирован.\n\nГенерирую твой персональный отчёт...`, undefined, 400);
      setTimeout(() => {
        addMsg("bot", report);
        setLoading(false);
      }, 1800);
      return;
    }
  };

  // ── ОБРАБОТЧИК ОЦЕНОК ──────────────────────────────────────────────────────

  const handleRatingsSubmit = (ratings: Record<string, number>) => {
    const ratingsText = Object.entries(ratings).map(([p, s]) => `${p}: ${s}`).join(", ");
    addMsg("user", `Оценки: ${ratingsText}`);

    const highRated = Object.entries(ratings).filter(([, s]) => s >= 4).map(([p]) => p);
    const st = botState;

    if (highRated.length === 0) {
      setBotState((s) => ({ ...s, step: "show_professions", ratings }));
      botReply(`Ни одно направление не набрало 4+ баллов. Давай ещё раз посмотрим на список — возможно, ты оцениваешь слишком строго.

Попробуй снова: что из этого ты мог бы попробовать, даже если сомневаешься?`, {
        type: "rating_list",
        professions: st.professions.map((p) => p.name),
      });
      return;
    }

    if (highRated.length === 1) {
      const prof = highRated[0];
      setBotState((s) => ({ ...s, step: "report", ratings, highRated, selectedProfession: prof }));
      botReply(`Зафиксировал: **«${prof}»** — твой главный выбор.

Генерирую персональный отчёт...`, undefined, 400);
      setTimeout(() => {
        const report = buildReport(
          st.chosenSegment!,
          st.primaryMotivation,
          prof,
          st.segmentScores,
          st.motivationScores
        );
        addMsg("bot", report);
        setLoading(false);
      }, 1800);
      return;
    }

    setBotState((s) => ({ ...s, step: "ask_final_choice", ratings, highRated }));
    botReply(
      `Несколько направлений тебе откликнулись. Если нужно начать уже в этом месяце — что выберешь?`,
      { type: "button_list", options: highRated }
    );
  };

  // ── ОБРАБОТЧИК ТЕКСТОВОГО ВВОДА ────────────────────────────────────────────

  const handleTextSubmit = (text: string) => {
    if (!text.trim()) return;
    addMsg("user", text);
    const st = botState;

    if (st.step === "collect_activities") {
      const activities = text
        .split(/\n|;|,/)
        .map((a) => a.replace(/^\d+[.)]\s*/, "").trim())
        .filter((a) => a.length > 2);

      if (activities.length < 5) {
        botReply(`Маловато! Нужно хотя бы 15 пунктов — так анализ будет точнее.

Попробуй ещё раз: пиши всё, что приходит в голову, даже если кажется нереальным.`);
        return;
      }

      const segScores = segmentActivities(activities);
      const [seg1, seg2] = getTop2(segScores);

      setBotState((s) => ({ ...s, step: "show_top2", activities, segmentScores: segScores, top2: [seg1, seg2] }));

      botReply(
        `Получил ${activities.length} пунктов — хорошо!

**Этап 2 из 5 — Определение профиля**

По твоему списку выделяются два ведущих направления:

1️⃣ **${SEGMENT_NAMES[seg1]}**
2️⃣ **${SEGMENT_NAMES[seg2]}**

Какое откликается сильнее?`,
        { type: "button_list", options: [`1️⃣ ${SEGMENT_NAMES[seg1]}`, `2️⃣ ${SEGMENT_NAMES[seg2]}`] }
      );
      return;
    }

    if (st.step === "ask_segment_why") {
      const motivScores = analyzeMotivation(text);
      const primaryMotivation = getPrimaryMotivation(motivScores);
      const segment = st.chosenSegment!;
      const profs = rankProfessions(segment, primaryMotivation);

      setBotState((s) => ({
        ...s,
        step: "collect_ratings",
        motivationText: text,
        motivationScores: motivScores,
        primaryMotivation,
        professions: profs,
      }));

      const motivName = MOTIVATION_NAMES[primaryMotivation];

      botReply(
        `Понял. Твоя ведущая мотивация — **«${motivName}»**.

**Этап 4 из 5 — Подбор направлений**

Внутри сегмента «${SEGMENT_NAMES[segment]}» — вот конкретные направления для тебя.

Оцени каждое от **1 до 5**:
• 1 — не моё
• 3 — возможно
• 5 — очень откликается`,
        { type: "rating_list", professions: profs.map((p) => p.name) }
      );
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
          <Icon name="Brain" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Психологический анализ</p>
          <p className="text-xs text-gray-500">5 этапов · без AI · только твои ответы</p>
        </div>
        {messages.length > 1 && (
          <button onClick={handleReset} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Начать заново">
            <Icon name="RotateCcw" size={16} />
          </button>
        )}
      </div>

      {!hasAccess && <PsychBotPaywall onPay={handlePay} />}

      {hasAccess && (
        <PsychBotChat
          messages={messages}
          botState={botState}
          loading={loading}
          onButtonClick={handleButtonClick}
          onRatingsSubmit={handleRatingsSubmit}
          onTextSubmit={handleTextSubmit}
          bottomRef={bottomRef}
        />
      )}
    </div>
  );
}
