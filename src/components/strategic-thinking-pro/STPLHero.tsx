import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

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

interface STPLHeroProps {
  access: boolean;
  hasHistory: boolean;
  expiresLabel: string | null;
  pricingSinglePrice?: number;
  onGetAccess: (planId?: string) => void;
}

export default function STPLHero({
  access,
  hasHistory,
  expiresLabel,
  pricingSinglePrice,
  onGetAccess,
}: STPLHeroProps) {
  const navigate = useNavigate();

  return (
    <>
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
                <p className="text-xs text-slate-600">от {pricingSinglePrice?.toLocaleString("ru-RU")} ₽ · Без ИИ · PDF-отчёт</p>
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
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-5">
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
          <div className="mt-10 text-center">
            <button
              onClick={() => onGetAccess("pro")}
              className="bg-slate-950 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-slate-800 transition-colors"
            >
              Начать стратегическую сессию
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
