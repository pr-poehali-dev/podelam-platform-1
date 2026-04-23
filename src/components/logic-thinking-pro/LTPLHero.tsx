import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

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

interface LTPLHeroProps {
  access: boolean;
  hasHistory: boolean;
  expiresLabel: string | null;
  pricingSinglePrice?: number;
  onGetAccess: (planId?: string) => void;
}

export default function LTPLHero({
  access,
  hasHistory,
  expiresLabel,
  pricingSinglePrice,
  onGetAccess,
}: LTPLHeroProps) {
  const navigate = useNavigate();

  return (
    <>
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
                <p className="text-xs text-indigo-700">от {pricingSinglePrice?.toLocaleString("ru-RU")} ₽ · Без ИИ · PDF-разбор</p>
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
          <div className="mt-10 text-center">
            <button
              onClick={() => onGetAccess("pro")}
              className="bg-indigo-950 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-900 transition-colors"
            >
              Начать логический анализ
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
