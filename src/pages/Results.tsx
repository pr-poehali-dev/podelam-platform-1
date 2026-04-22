import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  PROFILE_MATRIX,
} from "@/components/psych-bot/psychBotData";
import { checkAccess, payFromBalanceOnce, getBalance, TOOL_PRICE } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

type TestResult = { id: string; type: string; date: string; score: number };

type PsychResult = {
  profileName: string;
  topSeg: string;
  primMotiv: string;
  selectedProf: string;
  topSegs: { key: string; name: string; pct: number }[];
  topMotivations: { key: string; name: string; pct: number }[];
  topSegScore: number;
  professions: { name: string; match: number }[];
};

// ─── Персонализированные тексты по сегменту ───────────────────────────────────

const IDENTITY_PHRASES: Record<string, string[]> = {
  creative: [
    "Ты человек, у которого в голове постоянно рождаются идеи — даже когда ты этого не хочешь",
    "Тебе сложно работать по чужим шаблонам — внутри всегда ощущение, что можно сделать лучше",
    "Ты откладываешь старт не из лени, а потому что внутри слишком высокая планка к себе",
  ],
  help_people: [
    "Ты чувствуешь чужую боль острее, чем свою — и это одновременно твоя сила и уязвимость",
    "Ты часто ставишь потребности других выше своих, и это тебя выматывает",
    "Внутри у тебя есть ощущение, что твоя помощь важна — но ты не всегда понимаешь, как её монетизировать",
  ],
  analytics: [
    "Ты видишь закономерности там, где другие видят хаос — и это отличает тебя от большинства",
    "Тебе сложно действовать без достаточного количества информации: хочется просчитать всё наперёд",
    "Иногда ты застреваешь в анализе и откладываешь действие — мозг требует ещё данных",
  ],
  business: [
    "Ты мыслишь категориями возможностей — там, где другие видят риски, ты видишь точки роста",
    "Тебе тесно в найме: внутри постоянно ощущение, что ты мог бы делать больше и зарабатывать больше",
    "Ты умеешь убеждать и продавать, но часто не знаешь, с чего начать именно свой проект",
  ],
  education: [
    "Ты объясняешь сложное простыми словами — и люди это замечают и ценят",
    "Внутри у тебя есть знания, которые ты ещё не передал миру — и это создаёт ощущение незавершённости",
    "Тебе важно, чтобы твоя работа оставляла след — безликая рутина тебя опустошает",
  ],
  communication: [
    "Тебе легко входить в контакт с людьми — ты быстро находишь общий язык с любым человеком",
    "Ты хочешь, чтобы тебя слышали и замечали — и это не тщеславие, а реальная потребность",
    "Иногда ты берёшь на себя слишком много в общении и чувствуешь опустошение",
  ],
  management: [
    "Ты видишь, как можно организовать процесс лучше — даже когда тебя никто об этом не просит",
    "Тебе некомфортно, когда всё хаотично: внутренняя потребность в порядке и контроле очень сильная",
    "Ты умеешь брать ответственность, но часто несёшь её в одиночку — и это изматывает",
  ],
  practical: [
    "Ты человек результата: тебе важно видеть то, что ты сделал руками или головой",
    "Долгие обсуждения без конкретных действий тебя раздражают — ты хочешь просто взять и сделать",
    "Внутри у тебя высокий стандарт качества, который ты не всегда можешь объяснить другим",
  ],
  research: [
    "Тебе важно понять суть — ты не успокоишься, пока не найдёшь настоящий ответ",
    "Поверхностные решения тебя не устраивают: ты всегда копаешь глубже, чем того требует задача",
    "Иногда ты погружаешься в тему так глубоко, что теряешь ощущение времени",
  ],
  freedom: [
    "Ты физически не можешь долго работать по чужим правилам — внутри возникает сопротивление",
    "Ты ценишь свободу выше стабильности — и это часто вступает в конфликт с тем, что ожидают от тебя",
    "Тебе нужны свои условия, чтобы выдавать лучший результат — это не каприз, а особенность твоей психики",
  ],
};

const CONSEQUENCES: Record<string, string[]> = {
  creative: [
    "Из-за этого ты регулярно не доводишь идеи до конца — начинаешь много, заканчиваешь мало",
    "Тебе сложнее монетизировать свои способности, потому что не понимаешь, за что именно платить",
    "Это снижает уверенность в себе — ты видишь талант, но не видишь путь",
  ],
  help_people: [
    "Из-за этого ты быстро эмоционально выгораешь и теряешь ресурс",
    "Тебе сложно выставлять границы — ты часто делаешь больше, чем нужно, и меньше получаешь",
    "Это мешает зарабатывать по-настоящему: помогающие профессии часто недооценены именно теми, кто в них работает",
  ],
  analytics: [
    "Из-за этого ты затягиваешь принятие решений — ждёшь идеального момента, который не наступает",
    "Тебе сложнее делать рискованные шаги — мозг всегда находит новый аргумент «не сейчас»",
    "Это снижает скорость твоего движения к целям в разы",
  ],
  business: [
    "Из-за этого ты застреваешь в найме или в неподходящих проектах дольше, чем хотел бы",
    "Тебе сложнее собрать фокус — слишком много идей конкурируют между собой",
    "Это создаёт внутреннее напряжение: знаешь, что можешь больше, но не знаешь с чего начать",
  ],
  education: [
    "Из-за этого ты откладываешь запуск своего курса или продукта — кажется, что ещё не готов",
    "Тебе сложно поставить цену на своё знание: кажется, что это «само собой разумеется»",
    "Это тормозит твою монетизацию и признание в разы",
  ],
  communication: [
    "Из-за этого ты тратишь огромное количество энергии и часто не понимаешь, куда она уходит",
    "Тебе сложнее выстраивать глубокие профессиональные отношения — много поверхностных контактов",
    "Это создаёт ощущение, что ты много делаешь, но результат не соответствует усилиям",
  ],
  management: [
    "Из-за этого ты часто делаешь за других то, что они должны были сделать сами",
    "Тебе сложнее делегировать — кажется, что только ты сделаешь правильно",
    "Это приводит к постоянной перегрузке и ощущению, что ты один тянешь всё на себе",
  ],
  practical: [
    "Из-за этого ты часто недооцениваешь свою работу — кажется, что это «просто» и «любой так может»",
    "Тебе сложнее продвигать себя — ты умеешь делать, но не умеешь рассказывать об этом",
    "Это значительно снижает твой реальный доход относительно твоей ценности",
  ],
  research: [
    "Из-за этого ты теряешь время в поиске идеального ответа, пока жизнь требует действий",
    "Тебе сложно коммуницировать свои выводы так, чтобы другие это оценили",
    "Это создаёт разрыв между тем, что ты знаешь, и тем, что ты зарабатываешь",
  ],
  freedom: [
    "Из-за этого ты часто бросаешь стабильные варианты раньше, чем они начинают работать",
    "Тебе сложнее выстраивать долгосрочные обязательства — даже когда это в твоих интересах",
    "Это создаёт нестабильность: то взлёт, то провал — без системного движения вперёд",
  ],
};

// Маппинг сегментов на тренажёры
const SEGMENT_TRAINERS: Record<string, { id: string; title: string; why: string; effect: string; icon: string }[]> = {
  creative: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Ты часто зависаешь между идеями — этот тренажёр научит выбирать опираясь на ценности, а не на страх", effect: "Снизит внутренний паралич выбора", icon: "Compass" },
    { id: "anti-procrastination", title: "Антипрокрастинация", why: "Высокая планка к себе блокирует старт — тренажёр разбивает это на первый шаг длиной 15 минут", effect: "Ты начнёшь делать, а не только думать", icon: "Zap" },
  ],
  help_people: [
    { id: "self-esteem", title: "Самооценка и внутренняя опора", why: "Ты даёшь другим больше, чем получаешь сам — этот тренажёр восстановит внутренний баланс", effect: "Научишься ценить себя и выставлять границы", icon: "Shield" },
    { id: "money-anxiety", title: "Деньги без тревоги", why: "Помогающие профессии часто связаны с денежной тревогой — тренажёр снимет это напряжение", effect: "Ты сможешь брать адекватную цену за свою работу", icon: "Wallet" },
  ],
  analytics: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Ты застываешь в анализе — этот тренажёр даёт алгоритм принятия решений даже при неполных данных", effect: "Скорость решений вырастет в 2–3 раза", icon: "Compass" },
    { id: "anti-procrastination", title: "Антипрокрастинация", why: "Ожидание идеального момента — главный враг аналитика. Тренажёр разрушает этот паттерн", effect: "Ты перестанешь откладывать действие", icon: "Zap" },
  ],
  business: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Слишком много идей — тренажёр поможет выбрать одну и запустить её", effect: "Фокус вместо рассеивания энергии", icon: "Compass" },
    { id: "money-anxiety", title: "Деньги без тревоги", why: "Предпринимательство без денежной психологии — путь к срывам. Тренажёр проработает финансовые установки", effect: "Ты перестанешь бояться больших чисел", icon: "Wallet" },
  ],
  education: [
    { id: "self-esteem", title: "Самооценка и внутренняя опора", why: "«Ещё не готов» — это ловушка самооценки. Тренажёр даст опору изнутри", effect: "Ты запустишь продукт вместо того, чтобы откладывать", icon: "Shield" },
    { id: "anti-procrastination", title: "Антипрокрастинация", why: "Перфекционизм в образовании блокирует старт — тренажёр учит двигаться малыми шагами", effect: "Первый шаг станет возможным уже сегодня", icon: "Zap" },
  ],
  communication: [
    { id: "emotions-in-action", title: "Эмоции в действии", why: "Коммуникаторы сильно зависят от эмоционального фона — тренажёр научит управлять им", effect: "Меньше эмоционального выгорания после интенсивного общения", icon: "Heart" },
    { id: "self-esteem", title: "Самооценка и внутренняя опора", why: "Публичность требует внутренней опоры — без неё она истощает", effect: "Ты будешь восстанавливаться быстрее после нагрузки", icon: "Shield" },
  ],
  management: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Управленцы принимают по 50+ решений в день — тренажёр создаст систему вместо хаоса", effect: "Ты перестанешь делать за других и начнёшь делегировать", icon: "Compass" },
    { id: "emotions-in-action", title: "Эмоции в действии", why: "Постоянный контроль создаёт накопленное напряжение — тренажёр научит его снимать", effect: "Снизится внутренняя перегрузка", icon: "Heart" },
  ],
  practical: [
    { id: "self-esteem", title: "Самооценка и внутренняя опора", why: "Мастера часто недооценивают себя — тренажёр построит опору на реальных фактах", effect: "Ты начнёшь брать цену, которую заслуживаешь", icon: "Shield" },
    { id: "anti-procrastination", title: "Антипрокрастинация", why: "Даже практикам нужен старт — тренажёр даёт импульс через 15-минутный шаг", effect: "Перестанешь откладывать важные дела", icon: "Zap" },
  ],
  research: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Исследователи теряются в данных — тренажёр научит выходить в действие из любого анализа", effect: "Знания начнут превращаться в результаты", icon: "Compass" },
    { id: "money-anxiety", title: "Деньги без тревоги", why: "Исследователи часто не знают цены своей экспертизе — тренажёр проработает этот блок", effect: "Ты научишься монетизировать то, что знаешь", icon: "Wallet" },
  ],
  freedom: [
    { id: "conscious-choice", title: "Осознанный выбор", why: "Свободные люди чаще всего страдают от слишком большого выбора — тренажёр даёт ясность", effect: "Ты перестанешь метаться и выберешь путь", icon: "Compass" },
    { id: "money-anxiety", title: "Деньги без тревоги", why: "Нестабильный доход создаёт хроническую тревогу — тренажёр убирает денежный стресс в основе", effect: "Финансовая нестабильность перестанет тебя парализовать", icon: "Wallet" },
  ],
};

// Аналитика событий
function trackEvent(event: string, params?: Record<string, string | number>) {
  try {
    window.ym?.(107022183, "reachGoal", event, params);
  } catch { /* ignore */ }
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [funnelStep, setFunnelStep] = useState<"emotion" | "pain" | "offer" | "unlocked">("emotion");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(() => getBalance());

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData = JSON.parse(u);

    const tests: TestResult[] = JSON.parse(localStorage.getItem(`pdd_tests_${userData.email}`) || "[]");
    const found = tests.find((t) => t.id === id);
    if (found) {
      setResult(found);
      if (found.type === "Тест на призвание") {
        const saved = localStorage.getItem(`psych_result_${userData.email}`);
        if (saved) {
          setPsychResult(JSON.parse(saved));
        } else if (userData.id) {
          fetch("https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "load", userId: userData.id, toolType: "psych-bot" }),
          })
            .then((r) => r.json())
            .then((data) => {
              const sessions = data.sessions || [];
              if (sessions.length > 0) {
                const latest = sessions[sessions.length - 1];
                const sd = latest.session_data || latest;
                if (sd.topSeg) {
                  setPsychResult(sd);
                  localStorage.setItem(`psych_result_${userData.email}`, JSON.stringify(sd));
                }
              }
            })
            .catch(() => {});
        }
      }
    } else if (userData.id) {
      fetch("https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", userId: userData.id, toolType: "psych-bot" }),
      })
        .then((r) => r.json())
        .then((data) => {
          const sessions = data.sessions || [];
          if (sessions.length > 0) {
            const latest = sessions[sessions.length - 1];
            const sd = latest.session_data || latest;
            if (sd.topSeg && sd.profileName) {
              const topSegScore = sd.topSegScore ?? 0;
              const restoredResult: TestResult = {
                id: id || Date.now().toString(),
                type: "Тест на призвание",
                date: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
                score: topSegScore,
              };
              setResult(restoredResult);
              setPsychResult(sd);
              localStorage.setItem(`psych_result_${userData.email}`, JSON.stringify(sd));
              const allTests: TestResult[] = JSON.parse(localStorage.getItem(`pdd_tests_${userData.email}`) || "[]");
              if (!allTests.find((t) => t.type === "Тест на призвание")) {
                allTests.push(restoredResult);
                localStorage.setItem(`pdd_tests_${userData.email}`, JSON.stringify(allTests));
              }
            }
          }
        })
        .catch(() => {});
    }

    // Проверяем, оплачен ли уже psych-bot
    const access = checkAccess("psych-bot");
    if (access === "paid_once" || access === "subscribed") {
      setFunnelStep("unlocked");
    }

    trackEvent("results_view");
  }, [id, navigate]);

  const topSeg = psychResult?.topSeg ?? "analytics";
  const primMotiv = psychResult?.primMotiv ?? "meaning";
  const profileName = psychResult?.profileName ?? PROFILE_MATRIX[primMotiv]?.[topSeg] ?? result?.type ?? "";
  const selectedProf = psychResult?.selectedProf ?? "";
  const topSegs = psychResult?.topSegs ?? [];
  const topMotivations = psychResult?.topMotivations ?? [];
  const professions = psychResult?.professions ?? [];

  const description = psychResult ? (PROFILE_DESCRIPTIONS[primMotiv]?.[topSeg] ?? "") : "";
  const energyText = psychResult ? (ENERGY_TEXT[topSeg] ?? "") : "";
  const burnoutText = psychResult ? (BURNOUT_TEXT[topSeg] ?? "") : "";
  const formatText = psychResult ? (FORMAT_TEXT[topSeg] ?? "") : "";

  const identityPhrases = IDENTITY_PHRASES[topSeg] ?? IDENTITY_PHRASES["analytics"];
  const consequences = CONSEQUENCES[topSeg] ?? CONSEQUENCES["analytics"];
  const trainers = SEGMENT_TRAINERS[topSeg] ?? SEGMENT_TRAINERS["analytics"];

  const steps = psychResult
    ? [
        selectedProf ? `Изучи, что делает «${selectedProf}» в реальных проектах — найди 2–3 кейса` : `Изучи 2–3 реальных кейса по направлению «${SEGMENT_NAMES[topSeg]}»`,
        "Найди одного человека в этой сфере и задай ему 3 вопроса про вход в профессию",
        "Пройди 1 бесплатный урок или мини-курс по выбранному направлению",
        "Сделай первый маленький проект — даже учебный — и покажи кому-нибудь",
        "Сформулируй своё предложение в 2 предложениях и предложи помощь 3 людям бесплатно",
      ]
    : [
        "Сформулируй 3 направления, которые тебя давно привлекают",
        "Пройди 1–2 бесплатных онлайн-урока по каждому из них",
        "Найди первый пет-проект или волонтёрскую задачу для практики",
        "Собери портфолио из 3–5 работ — даже учебных",
        "Поговори с 2–3 людьми, которые уже работают в этих сферах",
      ];

  const handlePayClick = async () => {
    setPayError("");
    // Если баланс достаточный — списываем сразу
    if (balance >= TOOL_PRICE) {
      setPayLoading(true);
      trackEvent("results_pay_click");
      try {
        const ok = await payFromBalanceOnce("psych-bot");
        if (ok) {
          setFunnelStep("unlocked");
          setBalance(getBalance());
          trackEvent("results_pay_success", { method: "balance" });
        } else {
          setPayError("Ошибка списания. Попробуйте ещё раз.");
        }
      } catch {
        setPayError("Ошибка оплаты. Попробуйте ещё раз.");
      } finally {
        setPayLoading(false);
      }
    } else {
      // Открываем модал пополнения
      trackEvent("results_pay_click");
      setShowTopUp(true);
    }
  };

  if (!result) return (
    <div className="min-h-screen gradient-soft flex items-center justify-center font-golos">
      <div className="text-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Загружаем результаты...</p>
      </div>
    </div>
  );

  return (
    <>
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/cabinet")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Icon name="ChevronLeft" size={18} />
            Кабинет
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ═══════════════════════════════════════════════════════════
            ШАГ 1 — ЭМОЦИОНАЛЬНОЕ ПОПАДАНИЕ (всегда виден)
        ═══════════════════════════════════════════════════════════ */}
        <div className="gradient-brand rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 text-6xl opacity-10 select-none">🧠</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{result.type}</span>
              <span className="text-white/60 text-xs">{result.date}</span>
            </div>
            <h1 className="text-2xl font-black mb-1">{profileName}</h1>
            <p className="text-white/75 text-sm mb-4">{SEGMENT_NAMES[topSeg]}{topMotivations[0] ? ` · ${topMotivations[0].name}` : ""}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                <div className="text-xl font-black">{result.score}%</div>
                <div className="text-xs text-white/70">совпадение</div>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                <div className="text-xl font-black">{professions.length || topSegs.length || 4}</div>
                <div className="text-xs text-white/70">направления</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Кто ты на самом деле ─── */}
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Icon name="User" size={16} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-foreground">Вот кто ты на самом деле</h2>
          </div>
          <div className="space-y-3">
            {identityPhrases.map((phrase, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Check" size={11} className="text-violet-600" />
                </div>
                <p className="text-foreground text-sm leading-relaxed">{phrase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            ШАГ 2 — УСИЛЕНИЕ БОЛИ
        ═══════════════════════════════════════════════════════════ */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Icon name="AlertTriangle" size={16} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-amber-900">Что это значит в твоей жизни</h2>
          </div>
          <div className="space-y-3">
            {consequences.map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="ArrowRight" size={11} className="text-amber-700" />
                </div>
                <p className="text-amber-800 text-sm leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            ШАГ 3 — НЕДОСКАЗАННОСТЬ + ОФФЕР 290₽
        ═══════════════════════════════════════════════════════════ */}
        {funnelStep !== "unlocked" && (
          <div className="bg-white rounded-2xl border-2 border-violet-200 overflow-hidden">
            {/* Заблюренный превью */}
            <div className="relative">
              <div className="p-5 blur-[3px] pointer-events-none select-none opacity-60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Icon name="Lock" size={16} className="text-violet-400" />
                  </div>
                  <h2 className="font-bold text-foreground">Полная картина твоего состояния</h2>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                  <div className="h-4 bg-gray-200 rounded w-full mt-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2">
                  <Icon name="Lock" size={14} />
                  Скрыто
                </div>
              </div>
            </div>

            {/* Оффер */}
            <div className="p-5 border-t border-violet-100 bg-violet-50/50">
              <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide mb-2">Это только базовый уровень</p>
              <h3 className="text-lg font-black text-foreground mb-1">Мы ещё не показали главное</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Самые важные скрытые параметры — где ты теряешь энергию, какие установки блокируют рост и какие конкретные инструменты тебе подходят.
              </p>

              <div className="space-y-2 mb-5">
                {[
                  "Что с тобой происходит на глубоком уровне",
                  "Где именно ты теряешь ресурс и почему",
                  "Какие конкретные действия подходят твоему профилю",
                  "Персональные тренажёры под твои задачи",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={15} className="text-violet-600 shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {payError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3 border border-red-100">
                  {payError}
                </div>
              )}

              <button
                onClick={handlePayClick}
                disabled={payLoading}
                className="w-full gradient-brand text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
              >
                {payLoading ? (
                  <><Icon name="Loader2" size={18} className="animate-spin" /> Обработка...</>
                ) : (
                  <><Icon name="Unlock" size={18} /> Получить полный разбор за 290 ₽</>
                )}
              </button>
              <p className="text-center text-xs text-muted-foreground mt-2">Разовый платёж · Доступ навсегда</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ПОСЛЕ ОПЛАТЫ — ПОЛНЫЙ РАЗБОР
        ═══════════════════════════════════════════════════════════ */}
        {funnelStep === "unlocked" && (
          <>
            {/* Баннер успеха */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Icon name="CheckCircle" size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-800 text-sm">Полный разбор открыт</p>
                <p className="text-emerald-600 text-xs">Теперь ты видишь полную картину</p>
              </div>
            </div>

            {/* ─── Психологический портрет ─── */}
            {description && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Icon name="Brain" size={16} className="text-violet-600" />
                  </div>
                  <h2 className="font-bold text-foreground">Твой психологический портрет</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            )}

            {/* ─── Состояние по секциям ─── */}
            <div className="grid grid-cols-2 gap-3">
              {energyText && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="Zap" size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Энергия</span>
                  </div>
                  <p className="text-emerald-800 text-xs leading-relaxed line-clamp-4">{energyText}</p>
                </div>
              )}
              {burnoutText && (
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="AlertTriangle" size={14} className="text-rose-600" />
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Выгорание</span>
                  </div>
                  <p className="text-rose-800 text-xs leading-relaxed line-clamp-4">{burnoutText}</p>
                </div>
              )}
              {formatText && (
                <div className="col-span-2 bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="Briefcase" size={14} className="text-sky-600" />
                    <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Формат работы</span>
                  </div>
                  <p className="text-sky-800 text-xs leading-relaxed">{formatText}</p>
                </div>
              )}
            </div>

            {/* ─── Ведущие направления ─── */}
            {topSegs.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <h2 className="font-bold text-foreground mb-3">Ведущие направления</h2>
                <div className="space-y-3">
                  {topSegs.map((seg) => (
                    <div key={seg.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{seg.name}</span>
                        <span className="text-primary font-bold">{seg.pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${seg.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Профессии ─── */}
            {professions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <h2 className="font-bold text-foreground mb-3">Твои направления</h2>
                <div className="space-y-2">
                  {professions.slice(0, 6).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-xs">{p.match}%</span>
                      </div>
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProf && (
              <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
                <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-1">Выбранная профессия</p>
                <p className="text-violet-800 text-lg font-black">{selectedProf}</p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                МОСТ К ИНСТРУМЕНТАМ — персональные тренажёры
            ═══════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon name="Dumbbell" size={16} className="text-indigo-600" />
                </div>
                <h2 className="font-bold text-foreground">Твои инструменты под тебя</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4 ml-10">Подобраны под твой профиль — не общий список</p>

              <div className="space-y-3">
                {trainers.map((t) => (
                  <div key={t.id} className="border border-border rounded-2xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                        <Icon name={t.icon as "Compass"} size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t.why}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon name="TrendingUp" size={13} className="text-emerald-500" />
                        <span className="text-xs text-emerald-700 font-medium">{t.effect}</span>
                      </div>
                      <button
                        onClick={() => {
                          trackEvent("results_trainer_click", { trainer: t.id });
                          navigate(`/trainers`);
                        }}
                        className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors px-3 py-1.5 bg-violet-50 rounded-xl hover:bg-violet-100 shrink-0 ml-3"
                      >
                        Попробовать →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Как использовать систему ─── */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center">
                  <Icon name="Map" size={16} className="text-slate-600" />
                </div>
                <h2 className="font-bold text-foreground">Как использовать систему</h2>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Определи слабую зону из своего профиля выше" },
                  { step: "2", text: "Запусти подходящий тренажёр — первая сессия займёт 7–10 минут" },
                  { step: "3", text: "Повторяй через 2–3 дня — система отслеживает динамику" },
                  { step: "4", text: "Отследи изменения через 2 недели — ты почувствуешь разницу" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center shrink-0 text-white font-black text-xs">
                      {item.step}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Триггер действия ─── */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Важно</p>
              <h3 className="font-black text-lg mb-2">Твоё состояние актуально прямо сейчас</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Изменения возможны уже после первых сессий. Лучше начать сегодня — завтра это легко отложить ещё на месяц.
              </p>
              <button
                onClick={() => {
                  trackEvent("results_go_trainers");
                  navigate("/trainers");
                }}
                className="w-full bg-white text-violet-700 font-black py-3.5 rounded-2xl text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="Dumbbell" size={17} />
                Хочу улучшить своё состояние
              </button>
            </div>

            {/* ─── План развития ─── */}
            <div className="bg-white rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Icon name="Target" size={16} className="text-amber-600" />
                </div>
                <h2 className="font-bold text-foreground">Первые шаги к результату</h2>
              </div>
              <div className="space-y-2.5">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 text-white font-black text-xs">
                      {i + 1}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── Нижняя навигация ─── */}
        <div className="pb-6 pt-2">
          <button
            onClick={() => navigate("/cabinet")}
            className="w-full border-2 border-border text-foreground font-bold py-3.5 rounded-2xl text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            В личный кабинет
          </button>
        </div>

      </div>
    </div>

    {showTopUp && (
      <BalanceTopUpModal
        onClose={() => setShowTopUp(false)}
        onSuccess={() => {
          setBalance(getBalance());
          setShowTopUp(false);
          setTimeout(async () => {
            const newBalance = getBalance();
            if (newBalance >= TOOL_PRICE) {
              const ok = await payFromBalanceOnce("psych-bot");
              if (ok) {
                setFunnelStep("unlocked");
                setBalance(getBalance());
                trackEvent("results_pay_success", { method: "topup_then_balance" });
              }
            }
          }, 300);
        }}
      />
    )}
    </>
  );
}