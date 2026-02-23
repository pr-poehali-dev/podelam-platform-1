import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, saveToolCompletion, getLatestCareerResult } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
};

type Scores = {
  score_body: number;
  score_sales: number;
  score_online: number;
  score_creative: number;
  score_soft: number;
};

type ResultKey = "body" | "sales" | "online" | "creative" | "soft";

type Plan = {
  title: string;
  steps: string[];
};

const QUESTIONS = [
  {
    key: "goal",
    text: "Что для тебя важнее всего в дополнительном доходе?",
    options: ["Стабильность и предсказуемость", "Свобода и реализация", "Максимум денег", "Попробовать что-то новое"],
  },
  {
    key: "income_target",
    text: "Сколько ты хочешь зарабатывать дополнительно в месяц?",
    options: ["До 20 000 ₽", "20 000 – 50 000 ₽", "50 000 – 100 000 ₽", "Более 100 000 ₽"],
  },
  {
    key: "time_per_week",
    text: "Сколько часов в неделю ты готов(а) уделять этому?",
    options: ["До 5 часов", "5–10 часов", "10–20 часов", "Более 20 часов"],
  },
  {
    key: "offline_available",
    text: "Есть ли возможность работать офлайн (встречаться с людьми лично)?",
    options: ["Да", "Нет", "По ситуации"],
  },
  {
    key: "online_available",
    text: "Есть ли возможность работать онлайн (из дома, с компьютером)?",
    options: ["Да", "Нет"],
  },
  {
    key: "experience",
    text: "Есть ли у тебя опыт в каком-либо деле, который ценят другие?",
    options: ["Да, есть конкретный навык", "Есть, но не уверен(а) в ценности", "Пока нет"],
  },
  {
    key: "strength",
    text: "Что у тебя получается лучше всего?",
    options: ["Работаю руками / физически", "Общаюсь и убеждаю", "Создаю и придумываю", "Организую и управляю"],
  },
  {
    key: "likes_people",
    text: "Как ты относишься к общению с незнакомыми людьми?",
    options: ["Очень люблю", "Нормально, без проблем", "Предпочитаю минимум контакта"],
  },
  {
    key: "body_interest",
    text: "Интересна ли тебе работа, связанная с телом, здоровьем или красотой?",
    options: ["Да", "Возможно", "Нет"],
  },
  {
    key: "touch_comfort",
    text: "Комфортно ли тебе физически контактировать с клиентами (массаж, уход и т.п.)?",
    options: ["Да", "Скорее да", "Нет"],
  },
  {
    key: "physical_load",
    text: "Как ты относишься к физическим нагрузкам в работе?",
    options: ["Хорошо, люблю активность", "Нормально, если не перебор", "Предпочитаю без физики"],
  },
  {
    key: "energy_level",
    text: "Как бы ты описал(а) свой обычный уровень энергии?",
    options: ["Высокий — всегда в движении", "Средний — по настроению", "Низкий — устаю быстро"],
  },
  {
    key: "start_ready",
    text: "Насколько ты готов(а) начать действовать прямо сейчас? (1 — совсем не готов, 10 — готов прямо сейчас)",
    options: ["1–3 (мне нужно подумать)", "4–6 (почти готов)", "7–9 (готов скоро)", "10 (начну сегодня)"],
  },
];

function calcScores(answers: Record<string, string>): Scores {
  const s: Scores = { score_body: 0, score_sales: 0, score_online: 0, score_creative: 0, score_soft: 0 };

  const body_interest = answers.body_interest?.toLowerCase() ?? "";
  const touch_comfort = answers.touch_comfort?.toLowerCase() ?? "";
  const physical_load = answers.physical_load?.toLowerCase() ?? "";
  const offline_available = answers.offline_available?.toLowerCase() ?? "";
  const start_ready_raw = answers.start_ready ?? "";
  const likes_people = answers.likes_people?.toLowerCase() ?? "";
  const energy_level = answers.energy_level?.toLowerCase() ?? "";
  const income_target = answers.income_target ?? "";
  const online_available = answers.online_available?.toLowerCase() ?? "";
  const goal = answers.goal?.toLowerCase() ?? "";
  const strength = answers.strength?.toLowerCase() ?? "";
  const time_per_week = answers.time_per_week ?? "";

  const startReadyHigh = start_ready_raw.includes("7") || start_ready_raw.includes("9") || start_ready_raw.includes("10");
  const startReadyLow = start_ready_raw.includes("1") || start_ready_raw.includes("4") || start_ready_raw.includes("5") || start_ready_raw.includes("6");

  // score_body
  if (body_interest.includes("да")) s.score_body += 3;
  else if (body_interest.includes("возможно")) s.score_body += 2;
  if (touch_comfort.includes("да") && !touch_comfort.includes("скорее")) s.score_body += 3;
  else if (touch_comfort.includes("скорее")) s.score_body += 2;
  if (physical_load.includes("хорошо")) s.score_body += 2;
  else if (physical_load.includes("нормально")) s.score_body += 1;
  if (offline_available.includes("да")) s.score_body += 1;
  if (startReadyHigh) s.score_body += 1;

  // score_sales
  if (likes_people.includes("очень")) s.score_sales += 3;
  else if (likes_people.includes("нормально")) s.score_sales += 1;
  if (energy_level.includes("высокий")) s.score_sales += 2;
  else if (energy_level.includes("средний")) s.score_sales += 1;
  if (income_target.includes("50") || income_target.includes("100")) s.score_sales += 1;

  // score_online
  if (online_available.includes("да")) s.score_online += 2;
  if (likes_people.includes("минимум")) s.score_online += 3;
  if (offline_available.includes("нет")) s.score_online += 2;

  // score_creative
  if (goal.includes("реализация")) s.score_creative += 2;
  if (strength.includes("создаю") || strength.includes("придумываю")) s.score_creative += 2;

  // score_soft
  if (energy_level.includes("низкий")) s.score_soft += 3;
  if (startReadyLow) s.score_soft += 2;
  if (time_per_week.includes("до 5") || time_per_week.includes("5 часов")) s.score_soft += 1;

  return s;
}

function pickResult(s: Scores): ResultKey {
  const priority: ResultKey[] = ["body", "sales", "online", "creative", "soft"];
  const scoreMap: Record<ResultKey, number> = {
    body: s.score_body,
    sales: s.score_sales,
    online: s.score_online,
    creative: s.score_creative,
    soft: s.score_soft,
  };
  const max = Math.max(...Object.values(scoreMap));
  return priority.find((k) => scoreMap[k] === max) ?? "soft";
}

export default function IncomeBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [msgId, setMsgId] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSourceChoice, setShowSourceChoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMsg = (from: "bot" | "user", text: string) => {
    setMsgId((prev) => {
      const id = prev + 1;
      setMessages((m) => [...m, { id, from, text }]);
      return id;
    });
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }

    const access = checkAccess("income-bot");
    if (access === "locked") { setShowPaywall(true); return; }

    const u2 = JSON.parse(u);
    const hasPsych = !!localStorage.getItem(`psych_result_${u2.email}`);
    const hasCareer = !!getLatestCareerResult();
    if (hasPsych && hasCareer) { setShowSourceChoice(true); return; }

    setTimeout(() => {
      addMsg("bot", "Привет! Я помогу подобрать тебе подходящий вариант дополнительного дохода.");
      setTimeout(() => {
        addMsg("bot", QUESTIONS[0].text);
      }, 700);
    }, 300);
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, analyzing]);

  const handleOption = (option: string) => {
    if (finished || analyzing) return;
    const currentQ = QUESTIONS[step];
    addMsg("user", option);

    const newAnswers = { ...answers, [currentQ.key]: option };
    setAnswers(newAnswers);

    const nextStep = step + 1;

    if (nextStep < QUESTIONS.length) {
      setTimeout(() => addMsg("bot", "Записал."), 400);
      setTimeout(() => addMsg("bot", QUESTIONS[nextStep].text), 900);
      setStep(nextStep);
    } else {
      setFinished(true);
      setAnalyzing(true);
      setTimeout(() => addMsg("bot", "Анализирую ответы..."), 400);
      setTimeout(async () => {
        const scores = calcScores(newAnswers);
        const key = pickResult(scores);
        try {
          const [resResult, resPlan] = await Promise.all([
            fetch("/results.json"),
            fetch("/plans.json"),
          ]);
          const resultData = await resResult.json();
          const planData = await resPlan.json();
          setResult(resultData[key] ?? "Результат не найден.");
          setPlan(planData[key] ?? null);
        } catch {
          setResult("Не удалось загрузить результат. Попробуй обновить страницу.");
        }
        setAnalyzing(false);
        saveToolCompletion("income-bot", "Подбор дохода завершён");
      }, 2200);
    }
  };

  const startBot = (hint?: string) => {
    setShowSourceChoice(false);
    setTimeout(() => {
      addMsg("bot", hint
        ? `Привет! Подбираю доход с учётом ${hint}.\n\nОтвечай честно — результат зависит от точности ответов.`
        : "Привет! Я помогу подобрать тебе подходящий вариант дополнительного дохода."
      );
      setTimeout(() => addMsg("bot", QUESTIONS[0].text), 700);
    }, 300);
  };

  const currentOptions = !finished && step < QUESTIONS.length ? QUESTIONS[step].options : [];

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="income-bot"
          toolName="Подбор дохода"
          onClose={() => navigate("/cabinet?tab=tools")}
          onSuccess={() => { setShowPaywall(false); startBot(); }}
        />
      </div>
    );
  }

  if (showSourceChoice) {
    const career = getLatestCareerResult();
    return (
      <div className="min-h-screen font-golos flex flex-col items-center justify-center px-6" style={{ background: "hsl(248, 50%, 98%)" }}>
        <div className="w-full max-w-md space-y-5 animate-fade-in-up">
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="GitCompare" size={24} className="text-green-600" />
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">На основе какого профиля?</h2>
            <p className="text-muted-foreground text-sm">У тебя два результата. Выбери, от чего отталкиваться при подборе дохода.</p>
          </div>
          <button
            onClick={() => startBot(`тестового профиля (${career?.topTypeName})`)}
            className="w-full bg-white border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-5 text-left transition-all"
          >
            <div className="font-bold text-foreground mb-1">🧭 Тест — {career?.topTypeName}</div>
            <div className="text-xs text-muted-foreground">Рациональный профиль</div>
          </button>
          <button
            onClick={() => startBot("психологического анализа (глубинный профиль)")}
            className="w-full gradient-brand text-white rounded-2xl p-5 text-left"
          >
            <div className="font-bold mb-1">🧠 Психологический анализ</div>
            <div className="text-xs text-white/80">Истинные таланты</div>
          </button>
          <button onClick={() => navigate("/cabinet?tab=tools")} className="w-full text-sm text-muted-foreground py-2 hover:text-foreground transition-colors">
            ← В кабинет
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet?tab=tools")} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0">
          <Icon name="Banknote" size={15} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-foreground leading-tight">Подбор дохода</div>
          <div className="text-xs text-muted-foreground">Автоматический навигатор</div>
        </div>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-auto px-4 py-6 max-w-2xl w-full mx-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="Banknote" size={13} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.from === "bot"
                  ? "bg-white border border-border text-foreground rounded-tl-sm"
                  : "gradient-brand text-white rounded-tr-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {analyzing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {result && !analyzing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="max-w-[85%] bg-white border-2 border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm leading-relaxed whitespace-pre-line text-foreground">
              {result}
            </div>
          </div>
        )}

        {result && !analyzing && plan && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="Banknote" size={13} className="text-white" />
            </div>
            <div className="max-w-[85%] bg-white border-2 border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-foreground space-y-3">
              <p className="font-bold leading-snug">{plan.title}</p>
              <ul className="space-y-2">
                {plan.steps.map((step, i) => (
                  <li key={i} className="leading-relaxed text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result && !analyzing && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate("/cabinet?tab=tools")}
              className="gradient-brand text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity text-sm"
            >
              Вернуться в кабинет
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* OPTIONS */}
      {currentOptions.length > 0 && !analyzing && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-4">
          <div className="max-w-2xl mx-auto grid grid-cols-1 gap-2">
            {currentOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleOption(opt)}
                className="w-full text-left px-4 py-3 rounded-2xl border border-border bg-white hover:bg-secondary hover:border-primary/30 transition-all text-sm font-medium text-foreground"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}