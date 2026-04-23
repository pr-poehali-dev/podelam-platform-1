import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getLogicSessions,
} from "@/lib/proTrainerAccess";

const TRAINER_ID = "logic-thinking" as const;

const META = {
  title: "Логика мышления PRO — тренажёр анализа рассуждений | ПоДелам",
  description:
    "Прокачай логику мышления. Структурирование аргументов, причинно-следственные связи, когнитивные искажения. Формульная модель без ИИ. От 2 590 ₽.",
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
    icon: "Brain",
    title: "Видишь дыры в собственных рассуждениях",
    text: "Ты впервые смотришь на свои аргументы снаружи. То, что казалось железной логикой — оказывается полным допущений. Это неудобно. И очень ценно.",
  },
  {
    icon: "Link",
    title: "Цепочки становятся прозрачными",
    text: "Причины и следствия, которые раньше сливались в ощущение — теперь раскладываются по полочкам. Ты видишь, где цепочка рвётся.",
  },
  {
    icon: "Shield",
    title: "Устойчивость к манипуляциям",
    text: "Когнитивные искажения перестают работать, когда ты умеешь их называть. Ты начинаешь замечать ошибки в чужих аргументах — и в своих.",
  },
  {
    icon: "Award",
    title: "Ощущение точности мышления",
    text: "После сессии ты думаешь иначе. Не быстрее — точнее. Это другое качество решений и разговоров.",
  },
];

const STAGES = [
  { num: "01", title: "Тезис и контекст", desc: "Формулируешь утверждение, которое нужно проверить. Тренажёр задаёт уточняющие вопросы о контексте и ставках." },
  { num: "02", title: "Анализ аргументов", desc: "Разбираешь аргументы «за» и «против». Оцениваешь силу, обоснованность и уязвимость каждого." },
  { num: "03", title: "Причинно-следственные связи", desc: "Строишь цепочку: что из чего следует, где есть корреляция без причинности." },
  { num: "04", title: "Альтернативы и допущения", desc: "Находишь скрытые допущения в рассуждении. Проверяешь альтернативные объяснения." },
  { num: "05", title: "Качество данных", desc: "Оцениваешь источники и доказательную базу. Видишь, где аргумент держится на воздухе." },
  { num: "06", title: "Когнитивные искажения", desc: "Тренажёр находит искажения в рассуждении: якорение, подтверждение, ложная дихотомия и другие." },
  { num: "07", title: "LQI-балл и PDF", desc: "Получаешь итоговый индекс качества логики и полный PDF-отчёт с разбором." },
];

const METRICS = [
  { value: "7", label: "этапов анализа" },
  { value: "6+", label: "индексов" },
  { value: "1", label: "LQI-балл" },
  { value: "PDF", label: "полный отчёт" },
];

const PROBLEMS = [
  { icon: "GitMerge", bg: "bg-red-50", ic: "text-red-500", title: "Корреляция = причина", desc: "«После — значит из-за» — самая частая логическая ошибка. Вы принимаете решения на основе совпадений, а не причин." },
  { icon: "Filter", bg: "bg-amber-50", ic: "text-amber-600", title: "Подтверждение своего", desc: "Мозг ищет факты, которые подтверждают то, что уже решено. Аргументы против — не замечаются или обесцениваются." },
  { icon: "Minus", bg: "bg-indigo-50", ic: "text-indigo-500", title: "Ложная дихотомия", desc: "«Или то, или это» — но почти всегда есть третий вариант. Упрощение убивает лучшее решение." },
];

const FOR_WHO = [
  { icon: "Briefcase", who: "Менеджеры и руководители", reason: "Принимать решения без когнитивных ловушек, выявлять слабые аргументы в обсуждениях" },
  { icon: "MessageSquare", who: "Переговорщики и консультанты", reason: "Видеть структуру чужих аргументов и строить безупречные собственные" },
  { icon: "GraduationCap", who: "Студенты и аналитики", reason: "Развить навык структурного мышления и критического анализа информации" },
  { icon: "Lightbulb", who: "Все, кто думает", reason: "Замечать, когда тебя убеждают ошибочно — и когда ошибаешься сам" },
];

const QUOTES = [
  {
    text: "LQI-балл 54. Я считал себя логичным человеком. Тренажёр показал три систематических искажения — якорение, ложную дихотомию и апелляцию к авторитету. Я видел их в других. Не в себе.",
    name: "Константин, 36 лет",
    role: "Пересмотрел стратегию переговоров",
  },
  {
    text: "Взяла рассуждение, которым обосновывала уход из проекта. Тренажёр разобрал его на части. Оказалось — половина аргументов «за» были следствием одного страха, а не реальными доводами. Осталась. Не пожалела.",
    name: "Мария, 31 год",
    role: "Приняла взвешенное карьерное решение",
  },
  {
    text: "Показал PDF-разбор коллеге. Мы разбирали его бизнес-кейс — и впервые говорили о логике, а не мнениях. Нашли две ошибки в рассуждении, которые стоили бы нам контракта.",
    name: "Виктор, 44 года",
    role: "Предотвратил ошибку на переговорах",
  },
];

const CHECKLIST = [
  "Неограниченные сессии за весь период",
  "История кейсов и сравнение индексов",
  "6+ индексов: аргументы, причинность, данные, искажения, LQI",
  "PDF-отчёт с разбором после каждой сессии",
  "Без ИИ — формульный анализ рассуждений",
  "Просмотр прошлых сессий всегда бесплатен",
];

export default function LogicThinkingProLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

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
      setHasHistory(getLogicSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
    };
    refresh();
    window.addEventListener("pdd_balance_change", refresh);
    return () => window.removeEventListener("pdd_balance_change", refresh);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const pricingSingle = trainer.pricing.find((p) => p.id === "single");
  const pricingPro = trainer.pricing.find((p) => p.id === "pro");

  function handleCTA(planId?: string) {
    navigate(`/logic-thinking?plan=${planId ?? "pro"}`);
  }

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
              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 font-semibold rounded-full px-3 py-1">
                Доступ активен
              </span>
            )}
            <button
              onClick={() => access ? navigate("/logic-thinking") : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-indigo-950 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-indigo-900 transition-colors"
            >
              {access ? "Открыть" : "Получить доступ"}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-14 bg-indigo-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-0 lg:gap-12">
            <div className="flex-1 py-16 sm:py-20 lg:py-28 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 border border-indigo-700 rounded-full px-4 py-1.5 mb-7">
                <Icon name="Lightbulb" size={13} className="text-indigo-400" />
                <span className="text-[11px] text-indigo-400 uppercase tracking-widest font-semibold">PRO-тренажёр · Логика мышления</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-black px-2 py-0.5 rounded-full tracking-wide">NEW</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-[56px] font-black text-white leading-[1.08] mb-6">
                Думаешь логично?<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500">Проверь это</span>
              </h1>
              <p className="text-base sm:text-lg text-indigo-300/80 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Тренажёр анализа рассуждений и решений. 7 этапов — без ИИ, на чистой логике.
                Найди искажения в своём мышлении, получи LQI-балл и PDF-разбор.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <button
                  onClick={() => access ? navigate("/logic-thinking") : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white text-indigo-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  {access ? "Перейти к тренажёру" : "Получить доступ"}
                </button>
                {hasHistory && !access && (
                  <button
                    onClick={() => navigate("/logic-thinking")}
                    className="bg-indigo-900 border border-indigo-700 text-indigo-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-indigo-800 transition-colors"
                  >
                    <Icon name="BarChart3" size={18} />
                    Моя история
                  </button>
                )}
                {!access && (
                  <button
                    onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-indigo-900 border border-indigo-700 text-indigo-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-indigo-800 transition-colors"
                  >
                    Как работает
                  </button>
                )}
              </div>
              {access && expiresLabel && (
                <p className="text-xs text-indigo-500">Доступ активен · до {expiresLabel}</p>
              )}
              {!access && (
                <p className="text-xs text-indigo-700">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Без ИИ · PDF-разбор</p>
              )}
            </div>
            <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 self-end">
              <div className="relative">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/23185374-5666-49d4-904f-50939b027bd1.jpg"
                  alt="Логика мышления PRO"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[560px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="grid grid-cols-4 gap-2">
                    {METRICS.map((m) => (
                      <div key={m.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <p className="text-[10px] text-indigo-300 leading-tight">{m.label}</p>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Не просто анализ. Ты начинаешь думать точнее.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Когда видишь структуру собственных рассуждений — мышление меняется навсегда.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className="flex gap-5 p-7 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center shrink-0">
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

      {/* PROBLEMS */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Проблема</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Три ловушки, которые ломают логику</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Они незаметны, потому что привычны. Но именно они стоят за большинством плохих решений.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {PROBLEMS.map((c) => (
              <div key={c.title} className={`rounded-3xl ${c.bg} p-7`}>
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-5">
                  <Icon name={c.icon} size={20} className={c.ic} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-indigo-950 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-indigo-400" />
              <span className="text-xs text-indigo-300 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-4">
              Тренажёр — это <span className="text-indigo-400">рентген</span> для твоих рассуждений
            </h3>
            <p className="text-indigo-300/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Берёшь реальный аргумент, рассуждение или решение — и пропускаешь через 7 этапов логического анализа. Видишь не «правильно/нет», а где конкретно твоя логика даёт сбой.
            </p>
          </div>
        </div>
      </section>

      {/* 7 STAGES */}
      <section id="how" className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">7 этапов логического анализа</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Каждый этап — отдельный инструмент для разбора рассуждений.</p>
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Тренажёр для тех, кто хочет думать без ловушек</h2>
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
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Когда видишь свои ошибки — перестаёшь их повторять</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[220px]">
            {QUOTES.map((q, i) => (
              <div key={i} className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-950 flex items-center justify-center shrink-0">
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
                <button key={i} onClick={() => setQuoteIdx(i)}
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-indigo-900" : "w-2 h-2 bg-slate-200"}`} />
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Одна сессия — и ты видишь своё мышление иначе</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Оплачивается отдельно от подписки на тренажёры. Без ИИ — только логика и формулы.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            {pricingSingle && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col">
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
                <button onClick={() => handleCTA("single")}
                  className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors">
                  Начать за {pricingSingle.price.toLocaleString("ru-RU")} ₽
                </button>
              </div>
            )}
            {pricingPro && (
              <div className="relative bg-indigo-950 rounded-3xl border-2 border-indigo-900 p-8 flex flex-col shadow-2xl shadow-indigo-950/30">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-indigo-950 text-xs font-black px-4 py-1.5 rounded-full tracking-wide">РЕКОМЕНДУЕМ</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{pricingPro.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{pricingPro.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-indigo-600 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1">/ {pricingPro.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {CHECKLIST.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                      <span className="text-sm text-indigo-200">{f}</span>
                    </li>
                  ))}
                </ul>
                {access ? (
                  <div className="space-y-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 text-center">
                      <p className="text-indigo-400 font-bold text-sm">Доступ активен</p>
                      {expiresLabel && <p className="text-indigo-500/70 text-xs mt-0.5">до {expiresLabel}</p>}
                    </div>
                    <button onClick={() => navigate("/logic-thinking")}
                      className="w-full bg-white text-indigo-950 font-bold py-3.5 rounded-2xl text-sm hover:bg-indigo-50 transition-colors">
                      Открыть тренажёр
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleCTA("pro")}
                    className="w-full bg-white text-indigo-950 hover:bg-indigo-50 font-bold py-3.5 rounded-2xl text-sm transition-colors">
                    Получить PRO за {pricingPro.price.toLocaleString("ru-RU")} ₽
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[{ icon: "Lock", label: "Без ИИ" }, { icon: "FileDown", label: "PDF-разбор" }, { icon: "Eye", label: "История всегда" }].map((b) => (
              <div key={b.label} className="bg-white rounded-2xl p-3 border border-slate-100">
                <Icon name={b.icon} size={15} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-indigo-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            Хорошее мышление — это навык.<br className="hidden sm:block" /> Его можно прокачать.
          </h2>
          <p className="text-indigo-400/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Переговоры, решения, аргументы — везде важна логика. Начни видеть свои ошибки раньше, чем они станут последствиями.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => access ? navigate("/logic-thinking") : handleCTA("pro")}
              className="bg-white text-indigo-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-colors shadow-lg">
              {access ? "Открыть тренажёр" : "Начать логический анализ"}
            </button>
            <button onClick={() => navigate("/trainers-info")}
              className="bg-indigo-900 border border-indigo-700 text-indigo-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-indigo-800 transition-colors">
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-indigo-800 text-xs mt-6">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Оплата отдельно от подписки</p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center">
              <Icon name="Lightbulb" size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Логика мышления PRO</span>
          </div>
          <p className="text-xs text-slate-400">Часть платформы ПоДелам</p>
          <button onClick={() => navigate("/trainers-info")} className="text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors">
            Все тренажёры →
          </button>
        </div>
      </footer>

      <InstallPWA />
    </div>
  );
}