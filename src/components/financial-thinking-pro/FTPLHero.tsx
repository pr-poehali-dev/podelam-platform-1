import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const FEELINGS = [
  {
    icon: "Eye",
    title: "Видишь деньги как они есть",
    text: "Впервые — без иллюзий. Ты видишь точную картину своих потоков: откуда приходит, куда уходит, что реально остаётся. Это другое ощущение.",
  },
  {
    icon: "Shield",
    title: "Финансовая уверенность",
    text: "Ты знаешь свой стресс-порог. Знаешь, сколько месяцев выдержишь при падении дохода. Тревога «а вдруг» заменяется конкретными цифрами.",
  },
  {
    icon: "Target",
    title: "Цели становятся реальными",
    text: "«Хочу накопить» превращается в «достигну через X месяцев при Y откладываний». Это не мечта — это план с математикой.",
  },
  {
    icon: "Award",
    title: "Ощущение контроля",
    text: "Деньги перестают быть источником тревоги. Ты управляешь ими — а не они тобой. Это фундаментальный сдвиг.",
  },
];

const STAGES = [
  { num: "01", title: "Денежный поток", desc: "Вводишь доходы и расходы. Тренажёр считает реальный поток — без округлений и иллюзий." },
  { num: "02", title: "Структура расходов", desc: "Разбиваешь траты по категориям. Видишь, где деньги уходят незаметно." },
  { num: "03", title: "Финансовая устойчивость", desc: "Рассчитывается подушка безопасности и индекс устойчивости — сколько месяцев ты в безопасности." },
  { num: "04", title: "Стресс-тест", desc: "Моделируется сценарий падения дохода на 30–50%. Видишь точку уязвимости." },
  { num: "05", title: "Цели и проекция", desc: "Вводишь финансовую цель — тренажёр считает реалистичный срок достижения по формуле PMT." },
  { num: "06", title: "Качество решений", desc: "Анализируется последнее финансовое решение: импульсность, обоснованность, последствия." },
  { num: "07", title: "IFMP-балл и PDF", desc: "Получаешь итоговый индекс финансового мышления и полный PDF-отчёт." },
];

const METRICS = [
  { value: "7", label: "этапов анализа" },
  { value: "10", label: "индексов" },
  { value: "1", label: "IFMP-балл" },
  { value: "PDF", label: "полный отчёт" },
];

const PROBLEMS = [
  { icon: "EyeOff", bg: "bg-red-50", ic: "text-red-500", title: "Слепые зоны", desc: "Вы знаете сколько зарабатываете, но не знаете куда уходят деньги. Импульсные траты съедают до 20% бюджета незаметно." },
  { icon: "TrendingDown", bg: "bg-amber-50", ic: "text-amber-600", title: "Иллюзия стабильности", desc: "Пока всё хорошо — кажется, что так будет всегда. Но стресс-тест показывает: одно увольнение — и подушка тает за месяц." },
  { icon: "Target", bg: "bg-blue-50", ic: "text-blue-500", title: "Цели без плана", desc: "«Хочу миллион» — не стратегия. Без расчёта PMT и KDG вы не знаете, достижима ли цель при вашем текущем потоке." },
];

interface FTPLHeroProps {
  access: boolean;
  hasHistory: boolean;
  expiresLabel: string | null;
  pricingSinglePrice?: number;
  onGetAccess: (planId?: string) => void;
}

export default function FTPLHero({
  access,
  hasHistory,
  expiresLabel,
  pricingSinglePrice,
  onGetAccess,
}: FTPLHeroProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="pt-14 bg-emerald-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-0 lg:gap-12">
            <div className="flex-1 py-16 sm:py-20 lg:py-28 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 border border-emerald-700 rounded-full px-4 py-1.5 mb-7">
                <Icon name="TrendingUp" size={13} className="text-emerald-400" />
                <span className="text-[11px] text-emerald-400 uppercase tracking-widest font-semibold">PRO-тренажёр · Финансовое мышление</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-[56px] font-black text-white leading-[1.08] mb-6">
                Перестань догадываться<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-600">Начни считать точно</span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-300/80 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Симулятор финансовых решений. 7 этапов анализа — без ИИ, на чистых формулах.
                Узнай реальный денежный поток, пройди стресс-тест и получи IFMP-балл.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <button
                  onClick={() => access ? navigate("/financial-thinking") : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white text-emerald-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  {access ? "Перейти к тренажёру" : "Получить доступ"}
                </button>
                {hasHistory && !access && (
                  <button
                    onClick={() => navigate("/financial-thinking")}
                    className="bg-emerald-900 border border-emerald-700 text-emerald-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-emerald-800 transition-colors"
                  >
                    <Icon name="BarChart3" size={18} />
                    Моя история
                  </button>
                )}
                {!access && (
                  <button
                    onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-emerald-900 border border-emerald-700 text-emerald-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-emerald-800 transition-colors"
                  >
                    Как работает
                  </button>
                )}
              </div>
              {access && expiresLabel && (
                <p className="text-xs text-emerald-500">Доступ активен · до {expiresLabel}</p>
              )}
              {!access && (
                <p className="text-xs text-emerald-700">от {pricingSinglePrice?.toLocaleString("ru-RU")} ₽ · Без ИИ · PDF-отчёт</p>
              )}
            </div>
            <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 self-end">
              <div className="relative">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/7e8391fb-a9c2-4e66-9ff5-5b28452e7c3e.jpg"
                  alt="Финансовое мышление PRO"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[560px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="grid grid-cols-4 gap-2">
                    {METRICS.map((m) => (
                      <div key={m.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <p className="text-[10px] text-emerald-300 leading-tight">{m.label}</p>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Не просто цифры. Другое отношение к деньгам.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Когда видишь финансы системно — что-то меняется. Тревога уходит. Приходит контроль.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className="flex gap-5 p-7 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 flex items-center justify-center shrink-0">
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Зачем считать, если можно чувствовать?</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Потому что интуиция в финансах подводит. 70% людей не знают свой реальный денежный поток, а 85% не готовы к финансовому стрессу.</p>
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
          <div className="rounded-3xl bg-emerald-950 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-4">
              Тренажёр — это <span className="text-emerald-400">формульный анализ</span> твоих финансов
            </h3>
            <p className="text-emerald-300/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Вводишь реальные данные — доходы, расходы, долги, цели — и пропускаешь через 7 этапов анализа. На выходе: точные индексы, стресс-тест, проекция цели и оценка финансовой дисциплины.
            </p>
          </div>
        </div>
      </section>

      {/* 7 STAGES */}
      <section id="how" className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">7 этапов финансового анализа</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Каждый этап — отдельный финансовый инструмент. Вместе они дают полную картину.</p>
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
              className="bg-emerald-950 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-emerald-900 transition-colors"
            >
              Начать финансовый анализ
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
