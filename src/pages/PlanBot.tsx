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
} from "@/components/plan-bot/planBotEngine";
import { Direction, DIRECTION_NAMES } from "@/components/plan-bot/planBotData";
import PlanBotHeader from "@/components/plan-bot/PlanBotHeader";
import PlanBotMessages from "@/components/plan-bot/PlanBotMessages";

type SliderValues = { energy: number; motivation: number; confidence: number };

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

    const u2 = JSON.parse(u);
    const savedMessages = localStorage.getItem("plan_chat");
    const savedState = localStorage.getItem("plan_state");
    const savedPlan = localStorage.getItem("plan_result");

    if (savedMessages && savedState) {
      setMessages(JSON.parse(savedMessages));
      setBotState(JSON.parse(savedState));
      if (savedPlan) setCurrentPlan(JSON.parse(savedPlan));
    } else {
      const hasPsych = !!localStorage.getItem(`psych_result_${u2.email}`);
      const hasCareer = !!getLatestCareerResult();
      if (hasPsych && hasCareer) { setShowSourceChoice(true); return; }
      setTimeout(() => {
        addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Никакого ИИ — только алгоритм на основе твоих реальных показателей. 

Сначала отвечу на несколько вопросов, потом выберу стратегию и сформирую пошаговый план под твои условия.

Готов? Нажми кнопку ниже 👇`);
        setTimeout(() => {
          addMsg("bot", "**Шаг 1 из 7 — Направление**\n\nВыбери, в каком направлении хочешь развиваться:");
          setBotState((s) => ({ ...s, step: "ask_direction" }));
          setLoading(false);
        }, 800);
      }, 400);
    }
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("plan_chat", JSON.stringify(messages));
      localStorage.setItem("plan_state", JSON.stringify(botState));
      if (currentPlan) localStorage.setItem("plan_result", JSON.stringify(currentPlan));
    }
  }, [messages, botState, currentPlan]);

  const handleReset = () => {
    localStorage.removeItem("plan_chat");
    localStorage.removeItem("plan_state");
    localStorage.removeItem("plan_result");
    setMessages([]);
    setBotState(INITIAL_PLAN_STATE);
    setCurrentPlan(null);
    setSliderValues({ energy: 5, motivation: 5, confidence: 5 });
    setTimeout(() => {
      addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Никакого ИИ — только алгоритм на основе твоих реальных показателей. 

Готов? Начнём с выбора направления:`);
      setBotState((s) => ({ ...s, step: "ask_direction" }));
    }, 300);
  };

  // ── ВЫБОР НАПРАВЛЕНИЯ ────────────────────────────────────────────────────────

  const handleDirection = (dir: string) => {
    addMsg("user", DIRECTION_NAMES[dir as Direction]);
    setBotState((s) => ({ ...s, step: "ask_energy", inputs: { ...s.inputs, direction: dir as Direction } }));
    botReply(`Отлично, «${DIRECTION_NAMES[dir as Direction]}» — хороший выбор.

**Шаг 2 из 7 — Уровень энергии**

Оцени, насколько у тебя сейчас есть силы и ресурсы на развитие в этом направлении:`);
  };

  // ── ОБРАБОТЧИКИ СЛАЙДЕРОВ ────────────────────────────────────────────────────

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

  // ── ЧИСЛОВЫЕ ПОЛЯ ────────────────────────────────────────────────────────────

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
      const markdown = formatPlanAsMarkdown(plan);
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

  const startFromSource = (source: "career" | "psych") => {
    setShowSourceChoice(false);
    const hint = source === "career"
      ? "Использую результат теста профессий (рациональный профиль)."
      : "Использую результат психологического анализа (глубинный профиль).";
    setTimeout(() => {
      addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

${hint}

Сначала несколько вопросов — потом пошаговый план.`);
      setTimeout(() => {
        addMsg("bot", "**Шаг 1 из 7 — Направление**\n\nВыбери, в каком направлении хочешь развиваться:");
        setBotState((s) => ({ ...s, step: "ask_direction" }));
      }, 800);
    }, 300);
  };

  if (showPaywall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        <PlanBotHeader onBack={() => navigate("/cabinet")} onReset={() => {}} showReset={false} />
        <PaywallModal
          toolId="plan-bot"
          toolName="Шаги развития"
          onClose={() => navigate("/cabinet")}
          onSuccess={() => { setShowPaywall(false); setHasAccess(true); }}
        />
      </div>
    );
  }

  if (showSourceChoice) {
    const career = getLatestCareerResult();
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        <PlanBotHeader onBack={() => navigate("/cabinet")} onReset={() => {}} showReset={false} />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-5 animate-fade-in-up">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="GitCompare" size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2">Два результата</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                У тебя есть рациональный тест и глубинный психологический анализ. От какого хочешь строить план?
              </p>
            </div>
            <button
              onClick={() => startFromSource("career")}
              className="w-full bg-white border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-5 text-left transition-all"
            >
              <div className="font-bold text-foreground mb-1">🧭 Тест профессий — {career?.topTypeName}</div>
              <div className="text-xs text-muted-foreground">Рациональный взгляд — что ты думаешь о своих склонностях</div>
            </button>
            <button
              onClick={() => startFromSource("psych")}
              className="w-full gradient-brand text-white rounded-2xl p-5 text-left"
            >
              <div className="font-bold mb-1">🧠 Психологический анализ</div>
              <div className="text-xs text-white/80">Глубинный профиль — истинные таланты и мотивация</div>
            </button>
            <button
              onClick={() => startFromSource("career")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Сделать оба варианта плана →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <PlanBotHeader
        onBack={() => navigate("/cabinet")}
        onReset={handleReset}
        showReset={messages.length > 1}
      />
      <PlanBotMessages
        messages={messages}
        loading={loading}
        step={botState.step}
        sliderValues={sliderValues}
        currentPlan={currentPlan}
        bottomRef={bottomRef}
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
    </div>
  );
}