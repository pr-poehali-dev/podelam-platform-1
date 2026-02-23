import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAccess, saveToolCompletion, getLatestCareerResult } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import Icon from "@/components/ui/icon";
import {
  INITIAL_PLAN_STATE,
  Message,
  PlanBotState,
  UserInputs,
  buildPlan,
  formatPlanAsMarkdown,
  FinalPlan,
  TestProfile,
  SavedPlanEntry,
  loadTestProfile,
  suggestDirection,
  formatTestInsight,
  getSavedPlans,
  savePlanEntry,
} from "@/components/plan-bot/planBotEngine";
import { Direction, DIRECTION_NAMES } from "@/components/plan-bot/planBotData";
import PlanBotHeader from "@/components/plan-bot/PlanBotHeader";
import PlanBotMessages from "@/components/plan-bot/PlanBotMessages";
import PlanBotHistory from "@/components/plan-bot/PlanBotHistory";

type SliderValues = { energy: number; motivation: number; confidence: number };
type ViewTab = "chat" | "history";

export default function PlanBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<PlanBotState>(INITIAL_PLAN_STATE);
  const [loading, setLoading] = useState(false);
  const [sliderValues, setSliderValues] = useState<SliderValues>({ energy: 5, motivation: 5, confidence: 5 });
  const [currentPlan, setCurrentPlan] = useState<FinalPlan | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSourceChoice, setShowSourceChoice] = useState(false);
  const [testProfile, setTestProfile] = useState<TestProfile>({});
  const [savedPlans, setSavedPlans] = useState<SavedPlanEntry[]>([]);
  const [tab, setTab] = useState<ViewTab>("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMsg = (from: "bot" | "user", text: string) => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, from, text }]);
  };

  const botReply = (text: string, delay = 600) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addMsg("bot", text);
    }, delay);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }

    const access = checkAccess("plan-bot");
    if (access === "locked") { setShowPaywall(true); return; }
    setHasAccess(true);

    const profile = loadTestProfile();
    setTestProfile(profile);

    const plans = getSavedPlans();
    setSavedPlans(plans);

    const u2 = JSON.parse(u);
    const em = u2.email;
    const savedMessages = localStorage.getItem(`plan_chat_${em}`);
    const savedState = localStorage.getItem(`plan_state_${em}`);
    const savedPlan = localStorage.getItem(`plan_result_${em}`);

    if (savedMessages && savedState) {
      setMessages(JSON.parse(savedMessages));
      setBotState(JSON.parse(savedState));
      if (savedPlan) setCurrentPlan(JSON.parse(savedPlan));
    } else {
      const hasPsych = !!localStorage.getItem(`psych_result_${u2.email}`);
      const hasCareer = !!getLatestCareerResult();
      const hasAnyTest = hasPsych || hasCareer;

      if (hasAnyTest) {
        startWithTestData(profile);
      } else {
        startFresh();
      }
    }
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const em = JSON.parse(localStorage.getItem("pdd_user") || "{}").email;
    if (messages.length > 0 && em) {
      localStorage.setItem(`plan_chat_${em}`, JSON.stringify(messages));
      localStorage.setItem(`plan_state_${em}`, JSON.stringify(botState));
      if (currentPlan) localStorage.setItem(`plan_result_${em}`, JSON.stringify(currentPlan));
    }
  }, [messages, botState, currentPlan]);

  function startFresh() {
    setTimeout(() => {
      addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Никакого ИИ — только алгоритм на основе твоих реальных показателей.

Сначала отвечу на несколько вопросов, потом выберу стратегию и сформирую пошаговый план под твои условия.`);
      setTimeout(() => {
        addMsg("bot", "**Шаг 1 из 7 — Направление**\n\nВыбери, в каком направлении хочешь развиваться:");
        setBotState((s) => ({ ...s, step: "ask_direction" }));
        setLoading(false);
      }, 800);
    }, 400);
  }

  function startWithTestData(profile: TestProfile) {
    const insight = formatTestInsight(profile);
    const suggestedDir = suggestDirection(profile);
    const suggestedName = suggestedDir ? DIRECTION_NAMES[suggestedDir] : null;

    setTimeout(() => {
      addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Я вижу, что вы уже проходили тесты. Использую эти данные для персонализации плана.

${insight}`);
      setTimeout(() => {
        const dirHint = suggestedName
          ? `\n\nНа основе тестов рекомендую: **${suggestedName}**. Можешь выбрать это или другое направление:`
          : "";
        addMsg("bot", `**Шаг 1 из 7 — Направление**${dirHint}\n\nВыбери направление развития:`);
        setBotState((s) => ({ ...s, step: "ask_direction" }));
        setLoading(false);
      }, 1000);
    }, 400);
  }

  const handleReset = () => {
    const em = JSON.parse(localStorage.getItem("pdd_user") || "{}").email || "";
    localStorage.removeItem(`plan_chat_${em}`);
    localStorage.removeItem(`plan_state_${em}`);
    localStorage.removeItem(`plan_result_${em}`);
    setMessages([]);
    setBotState(INITIAL_PLAN_STATE);
    setCurrentPlan(null);
    setSliderValues({ energy: 5, motivation: 5, confidence: 5 });
    setTab("chat");

    const profile = loadTestProfile();
    setTestProfile(profile);
    const hasAnyTest = !!(profile.careerTopType || profile.psychProfileName);

    if (hasAnyTest) {
      startWithTestData(profile);
    } else {
      startFresh();
    }
  };

  const handleDirection = (dir: string) => {
    addMsg("user", DIRECTION_NAMES[dir as Direction]);
    setBotState((s) => ({ ...s, step: "ask_energy", inputs: { ...s.inputs, direction: dir as Direction } }));
    botReply(`Отлично, «${DIRECTION_NAMES[dir as Direction]}» — хороший выбор.

**Шаг 2 из 7 — Уровень энергии**

Оцени, насколько у тебя сейчас есть силы и ресурсы на развитие в этом направлении:`);
  };

  const handleEnergySubmit = () => {
    const v = sliderValues.energy;
    addMsg("user", `Уровень энергии: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_motivation", inputs: { ...s.inputs, energy_level: v } }));
    botReply(`Зафиксировал: ${v}/10.

**Шаг 3 из 7 — Мотивация**

Насколько сильно ты хочешь развиваться именно в этом направлении прямо сейчас?`);
  };

  const handleMotivationSubmit = () => {
    const v = sliderValues.motivation;
    addMsg("user", `Уровень мотивации: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_confidence", inputs: { ...s.inputs, motivation_level: v } }));
    botReply(`Понял: ${v}/10.

**Шаг 4 из 7 — Уверенность**

Насколько ты уверен в своих навыках и возможностях для работы в этом направлении?`);
  };

  const handleConfidenceSubmit = () => {
    const v = sliderValues.confidence;
    addMsg("user", `Уровень уверенности: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_time", inputs: { ...s.inputs, confidence_level: v } }));
    botReply(`Хорошо.

**Шаг 5 из 7 — Время**

Сколько часов в неделю ты можешь уделять этому направлению? (честно — без перегрузки)`);
  };

  const handleTimeSubmit = (v: number) => {
    addMsg("user", `${v} часов в неделю`);
    setBotState((s) => ({ ...s, step: "ask_income_target", inputs: { ...s.inputs, time_per_week: v } }));
    botReply(`${v} ч/нед — записал.

**Шаг 6 из 7 — Цель по доходу**

Сколько рублей в месяц ты хочешь зарабатывать в этом направлении через 3 месяца?`);
  };

  const handleIncomeTargetSubmit = (v: number) => {
    addMsg("user", `Цель: ${v.toLocaleString("ru")} ₽/мес`);
    setBotState((s) => ({ ...s, step: "ask_current_income", inputs: { ...s.inputs, income_target: v } }));
    botReply(`Цель — **${v.toLocaleString("ru")} ₽/мес**.

**Шаг 7 из 7 — Текущий доход**

Сколько ты уже зарабатываешь в этом направлении сейчас? (если ничего — введи 0)`);
  };

  const handleCurrentIncomeSubmit = (v: number) => {
    addMsg("user", `Сейчас: ${v > 0 ? v.toLocaleString("ru") + " ₽/мес" : "пока ничего"}`);

    const inputs = { ...botState.inputs, current_income: v } as UserInputs;
    setBotState((s) => ({ ...s, step: "building", inputs }));
    setLoading(true);

    setTimeout(() => {
      const plan = buildPlan(inputs);
      setCurrentPlan(plan);

      savePlanEntry(plan, testProfile);
      setSavedPlans(getSavedPlans());

      const dirName = DIRECTION_NAMES[inputs.direction];
      saveToolCompletion("plan-bot", `План: ${dirName}, ${plan.strategyName}`);

      const markdown = formatPlanAsMarkdown(plan, testProfile);
      setLoading(false);
      setBotState((s) => ({ ...s, step: "report" }));
      addMsg("bot", `Анализирую твои данные...`);
      setTimeout(() => {
        addMsg("bot", markdown);
      }, 500);
    }, 1200);
  };

  const handleSliderChange = (key: keyof SliderValues, value: number) => {
    setSliderValues((s) => ({ ...s, [key]: value }));
  };

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col bg-gray-50">
        <PaywallModal
          toolId="plan-bot"
          toolName="Шаги развития"
          onClose={() => navigate("/cabinet?tab=tools")}
          onSuccess={() => { setShowPaywall(false); setHasAccess(true); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col bg-gray-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet?tab=tools")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <Icon name="Map" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Шаги развития</p>
          <p className="text-xs text-gray-500">Персональный план на 3 месяца</p>
        </div>

        {savedPlans.length > 0 ? (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setTab("chat")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              План
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              История ({savedPlans.length})
            </button>
          </div>
        ) : (
          messages.length > 1 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="Начать заново"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
          )
        )}
      </div>

      {tab === "history" ? (
        <PlanBotHistory entries={savedPlans} onNewPlan={handleReset} />
      ) : (
        <PlanBotMessages
          messages={messages}
          loading={loading}
          step={botState.step}
          sliderValues={sliderValues}
          currentPlan={currentPlan}
          bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
          onSliderChange={handleSliderChange}
          onEnergySubmit={handleEnergySubmit}
          onMotivationSubmit={handleMotivationSubmit}
          onConfidenceSubmit={handleConfidenceSubmit}
          onDirectionClick={handleDirection}
          onTimeSubmit={handleTimeSubmit}
          onIncomeTargetSubmit={handleIncomeTargetSubmit}
          onCurrentIncomeSubmit={handleCurrentIncomeSubmit}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
