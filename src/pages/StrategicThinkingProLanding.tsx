import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  getProAccess,
  proAccessExpiresFormatted,
  getSavedSessions,
} from "@/lib/proTrainerAccess";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import { getBalance } from "@/lib/access";

const TRAINER_ID = "strategic-thinking" as const;

const META = {
  title: "Стратегическое мышление PRO — симулятор стратегических решений | ПоДелам",
  description:
    "Прокачай стратегическое мышление. 7 этапов анализа, 6 индексов, OSI-балл, PDF-отчёт. Без ИИ — чистая логика. От 3 590 ₽.",
};

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const FEELINGS = [
  {
    icon: "Crosshair",
    title: "Стратегическая ясность",
    text: "Туман «не знаю, правильно ли я думаю» рассеивается. Ты видишь своё решение как на ладони — со всеми связями, рисками и точками рычага.",
  },
  {
    icon: "Shield",
    title: "Уверенность без самообмана",
    text: "Ты уже не просто «чувствуешь», что решение верное. Ты знаешь это — потому что проверил на 7 этапах. Это другой уровень уверенности.",
  },
  {
    icon: "Eye",
    title: "Видишь то, что раньше пропускал",
    text: "Слепые зоны, якорные ошибки, скрытые зависимости — всё это выходит на поверхность. Ты начинаешь думать шире, чем когда-либо раньше.",
  },
  {
    icon: "Award",
    title: "Ощущение стратега",
    text: "После сессии ты чувствуешь себя иначе. Не «принял решение». А «построил стратегию». Это разные вещи — и ты это ощущаешь.",
  },
];

const STAGES = [
  { num: "01", title: "Цель и контекст", desc: "Формулируешь решение точно — не «хочу расти», а конкретная ставка с ясным горизонтом." },
  { num: "02", title: "Факторный анализ", desc: "Картируешь все силы, которые влияют на исход. Внутренние и внешние, сильные и слабые." },
  { num: "03", title: "Сценарное моделирование", desc: "Строишь 3 сценария: оптимистичный, реалистичный, пессимистичный. Видишь развилки." },
  { num: "04", title: "Стресс-тест", desc: "Проверяешь стратегию на прочность: что сломается первым, если пойдёт не по плану?" },
  { num: "05", title: "Точки рычага", desc: "Находишь 2–3 действия, которые дают максимальный эффект при минимуме ресурсов." },
  { num: "06", title: "Риск-профиль", desc: "Оцениваешь критические риски и строишь план Б для каждого." },
  { num: "07", title: "OSI-индекс и PDF", desc: "Получаешь итоговый балл стратегического мышления и полный PDF-отчёт для себя и команды." },
];

const METRICS = [
  { value: "7", label: "этапов анализа" },
  { value: "6", label: "индексов мышления" },
  { value: "1", label: "итоговый OSI-балл" },
  { value: "PDF", label: "полный отчёт" },
];

const FOR_WHO = [
  { icon: "Briefcase", who: "Предприниматели", reason: "Проверить бизнес-идею или стратегию до того, как вложить деньги и время" },
  { icon: "Users", who: "Руководители", reason: "Принимать решения не на интуиции, а на системном анализе факторов и рисков" },
  { icon: "GraduationCap", who: "Начинающие стратеги", reason: "Научиться мыслить сценариями, видеть связи и управлять неопределённостью" },
  { icon: "Lightbulb", who: "Продакт-менеджеры", reason: "Оценить запуск фичи или продукта: риски, сценарии, точки рычага" },
];

const QUOTES = [
  {
    text: "Я думал, что умею мыслить стратегически. После первой сессии понял — я просто умею убеждать себя. Тренажёр показал три слепые зоны, которые я игнорировал месяцами. Перестроил план. Запустился в срок.",
    name: "Павел, основатель SaaS-стартапа",
    role: "Принял решение о пивоте",
  },
  {
    text: "OSI-балл 61 из 100. Я ожидал больше. Но именно это меня и встряхнуло — увидеть точно, где дыры. Не «где-то в стратегии», а конкретно: слабый стресс-тест и единственный сценарий. Теперь у меня три.",
    name: "Анна, директор по развитию",
    role: "Перестроила стратегию выхода на рынок",
  },
  {
    text: "Показал PDF-отчёт инвесторам. Они сказали: «Это серьёзно». Не потому что красиво — а потому что там было видно, что я думал системно. Это другой разговор.",
    name: "Михаил, 39 лет",
    role: "Привлёк раунд после стратегической сессии",
  },
];

const CHECKLIST = [
  "Неограниченные сессии за весь период",
  "История решений и сравнение стратегий",
  "6 индексов: факторный, сценарный, стресс, рычаги, риски, OSI",
  "PDF-отчёт после каждой сессии",
  "Без ИИ — чистая математика и формулы",
  "Просмотр прошлых сессий всегда бесплатен",
];

export default function StrategicThinkingProLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [balance, setBalance] = useState(getBalance());
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
      setHasHistory(getSavedSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
      setBalance(getBalance());
    };
    refresh();
    window.addEventListener("pdd_balance_change", refresh);
    return () => window.removeEventListener("pdd_balance_change", refresh);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5500);
    return () => clearInterval(t);
  }, []);

  function handleCTA(planId?: string) {
    const plan = planId ?? "pro";
    navigate(`/strategic-thinking?plan=${plan}`);
  }

  const pricingSingle = trainer.pricing.find((p) => p.id === "single");
  const pricingPro = trainer.pricing.find((p) => p.id === "pro");

  return (
    <div className="min-h-screen bg-white font-golos">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/trainers-info")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <Icon name="ArrowLeft" size={16} />
            Тренажёры
          </button>
          <div className="flex items-center gap-3">
            {access && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold rounded-full px-3 py-1">
                Доступ активен
              </span>
            )}
            <button
              onClick={() => access ? navigate("/strategic-thinking") : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              {access ? "Открыть" : "Получить доступ"}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-14 bg-slate-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-0 lg:gap-12">
            <div className="flex-1 py-16 sm:py-20 lg:py-28 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 border border-slate-700 rounded-full px-4 py-1.5 mb-7">
                <Icon name="Brain" size={13} className="text-slate-400" />
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">PRO-тренажёр · Стратегическое мышление</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-[56px] font-black text-white leading-[1.08] mb-6">
                Перестань угадывать.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">Начни строить стратегии.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Симулятор стратегических решений. 7 этапов анализа — без ИИ, на чистой логике.
                Проверь своё мышление, найди слепые зоны, получи OSI-балл и PDF-отчёт.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <button
                  onClick={() => access ? navigate("/strategic-thinking") : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white text-slate-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-slate-100 transition-colors shadow-lg"
                >
                  {access ? "Перейти к тренажёру" : "Получить доступ"}
                </button>
                {hasHistory && !access && (
                  <button
                    onClick={() => navigate("/strategic-thinking")}
                    className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-700 transition-colors"
                  >
                    <Icon name="BarChart3" size={18} />
                    Моя история
                  </button>
                )}
                {!access && (
                  <button
                    onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-700 transition-colors"
                  >
                    Как работает
                  </button>
                )}
              </div>
              {access && expiresLabel && (
                <p className="text-xs text-slate-500">Доступ активен · до {expiresLabel}</p>
              )}
              {!access && (
                <p className="text-xs text-slate-600">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Без ИИ · PDF-отчёт</p>
              )}
            </div>
            <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 self-end">
              <div className="relative">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/c7023783-9c1f-4a32-af03-8bddcc3b2e04.jpg"
                  alt="Стратегическое мышление PRO"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[560px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="grid grid-cols-4 gap-2">
                    {METRICS.map((m) => (
                      <div key={m.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Что ты чувствуешь после сессии</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Не просто анализ. Трансформация мышления.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Когда видишь своё решение системно — что-то меняется внутри. Навсегда.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className="flex gap-5 p-7 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY STRATEGIES FAIL */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Проблема</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Почему 80% стратегий проваливаются?</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Не потому что идея плохая. А потому что решение принималось без системного анализа — на интуиции, в спешке, без проверки на прочность.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {[
              { icon: "Eye", bg: "bg-red-50", ic: "text-red-500", title: "Слепые зоны", desc: "Вы видите 5 факторов, а на решение влияют 15. Скрытые зависимости ломают даже идеальные планы." },
              { icon: "Dice5", bg: "bg-amber-50", ic: "text-amber-600", title: "Один сценарий", desc: "Большинство планируют только «как должно быть». Когда реальность отклоняется — нет плана Б. И паника." },
              { icon: "Anchor", bg: "bg-blue-50", ic: "text-blue-500", title: "Якорение", desc: "Мозг цепляется за первый вариант и фильтрует всё, что ему противоречит. Вы уверены в плане, а он уже устарел." },
            ].map((c) => (
              <div key={c.title} className={`rounded-3xl ${c.bg} p-7`}>
                <div className={`w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-5`}>
                  <Icon name={c.icon} size={20} className={c.ic} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-slate-950 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-4">
              Тренажёр — это <span className="text-amber-400">рентген</span> для твоих решений
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Берёшь реальное решение — запуск продукта, смена стратегии, инвестиция — и пропускаешь через 7 этапов анализа. На выходе видишь не «правильно/нет», а точную карту: где мышление сильное, а где — дыры.
            </p>
          </div>
        </div>
      </section>

      {/* 7 STAGES */}
      <section id="how" className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">7 этапов стратегического анализа</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Каждый этап — отдельный инструмент мышления. Вместе они дают полную картину.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {STAGES.map((s) => (
              <div key={s.num} className={`flex gap-5 p-6 rounded-3xl border bg-white ${s.num === "07" ? "sm:col-span-2 sm:max-w-md sm:mx-auto w-full" : ""}`}>
                <span className="text-2xl font-black text-slate-100 leading-none shrink-0 select-none">{s.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Для кого</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Тренажёр для тех, кто принимает серьёзные решения</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {FOR_WHO.map((item) => (
              <div key={item.who} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} className="text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{item.who}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории решений</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Когда думаешь системно — видишь больше</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[220px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center shrink-0">
                    <Icon name="User" size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{q.name}</p>
                    <p className="text-xs text-slate-400">{q.role}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-6 justify-center">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-slate-900" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Доступ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Одна сессия меняет то, как ты думаешь</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Оплачивается отдельно от подписки на тренажёры. Без ИИ — только твоё мышление и алгоритм.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            {/* Single */}
            {pricingSingle && (
              <div className="relative bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{pricingSingle.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-slate-900">{pricingSingle.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-slate-400 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">/ {pricingSingle.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pricingSingle.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-slate-600" />
                      </div>
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCTA("single")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
                >
                  Начать за {pricingSingle.price.toLocaleString("ru-RU")} ₽
                </button>
              </div>
            )}

            {/* PRO */}
            {pricingPro && (
              <div className="relative bg-slate-950 rounded-3xl border-2 border-slate-900 p-8 flex flex-col shadow-2xl shadow-slate-950/30">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-slate-900 text-xs font-black px-4 py-1.5 rounded-full tracking-wide">РЕКОМЕНДУЕМ</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{pricingPro.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{pricingPro.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-slate-500 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">/ {pricingPro.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {CHECKLIST.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                      <span className="text-sm text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                {access ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 text-center">
                      <p className="text-emerald-400 font-bold text-sm">Доступ активен</p>
                      {expiresLabel && <p className="text-emerald-500/70 text-xs mt-0.5">до {expiresLabel}</p>}
                    </div>
                    <button
                      onClick={() => navigate("/strategic-thinking")}
                      className="w-full bg-white text-slate-950 font-bold py-3.5 rounded-2xl text-sm hover:bg-slate-100 transition-colors"
                    >
                      Открыть тренажёр
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCTA("pro")}
                    className="w-full bg-white text-slate-950 hover:bg-slate-100 font-bold py-3.5 rounded-2xl text-sm transition-colors"
                  >
                    Получить PRO за {pricingPro.price.toLocaleString("ru-RU")} ₽
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[
              { icon: "Lock", label: "Без ИИ" },
              { icon: "FileDown", label: "PDF-отчёт" },
              { icon: "Eye", label: "История всегда" },
            ].map((b) => (
              <div key={b.label} className="bg-white rounded-2xl p-3 border border-slate-100">
                <Icon name={b.icon} size={15} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            Одно стратегическое решение<br className="hidden sm:block" /> стоит дороже любого тренинга
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Запуск бизнеса. Смена стратегии. Ключевая инвестиция. Это не те решения, где стоит угадывать.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => access ? navigate("/strategic-thinking") : handleCTA("pro")}
              className="bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl text-base hover:bg-slate-100 transition-colors shadow-lg"
            >
              {access ? "Открыть тренажёр" : "Начать стратегическую сессию"}
            </button>
            <button
              onClick={() => navigate("/trainers-info")}
              className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-700 transition-colors"
            >
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-6">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Оплата отдельно от подписки</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center">
              <Icon name="Brain" size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Стратегическое мышление PRO</span>
          </div>
          <p className="text-xs text-slate-400">Часть платформы ПоДелам</p>
          <button onClick={() => navigate("/trainers-info")} className="text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors">
            Все тренажёры →
          </button>
        </div>
      </footer>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => setShowTopUp(false)}
        />
      )}

      <InstallPWA />
    </div>
  );
}
