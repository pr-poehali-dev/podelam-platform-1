import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import type { ProTrainerPricing } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getFinancialSessions,
} from "@/lib/proTrainerAccess";

const TRAINER_ID = "financial-thinking" as const;

const META = {
  title: "Тренажёр финансового мышления — ПоДелам",
  description:
    "Развивайте финансовое мышление: анализ денежных потоков, стресс-тесты, моделирование целей. Формульная модель без ИИ. От 990 ₽/мес.",
};

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(
    `meta[${attr}="${name}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const LEARN_POINTS = [
  { icon: "ArrowRightLeft", text: "Системное понимание денежных потоков" },
  { icon: "Shield", text: "Навык расчёта финансовой устойчивости" },
  { icon: "AlertTriangle", text: "Умение видеть риски в деньгах" },
  { icon: "Target", text: "Финансовая дисциплина и самоконтроль" },
  { icon: "GitBranch", text: "Способность просчитывать последствия решений" },
];

const HOW_STEPS = [
  { icon: "FileText", title: "Исходные данные", desc: "Доходы, расходы, долги, накопления, цели" },
  { icon: "PieChart", title: "Структура расходов", desc: "Распределение по категориям и анализ импульсных трат" },
  { icon: "Activity", title: "Финансовая устойчивость", desc: "Расчёт индекса устойчивости на основе денежного потока" },
  { icon: "Flame", title: "Стресс-тестирование", desc: "Проверка финансов при падении дохода и росте расходов" },
  { icon: "Target", title: "Моделирование цели", desc: "Расчёт достижимости финансовой цели при текущих параметрах" },
  { icon: "Scale", title: "Финансовые решения", desc: "Моделирование трёх сценариев: доход, расходы, долг" },
  { icon: "Brain", title: "Поведенческий анализ", desc: "Оценка финансовых привычек и дисциплины" },
];

const RESULTS_LIST = [
  { icon: "Gauge", title: "IFMP-индекс", desc: "Единый балл от 0 до 100 — интегральная оценка финансового мышления" },
  { icon: "Radar", title: "Профиль показателей", desc: "Радар из 6 осей: устойчивость, дисциплина, диверсификация, цели, стресс, структура" },
  { icon: "BarChart3", title: "Стресс-тест", desc: "Сравнение показателей до и после стрессового сценария" },
  { icon: "FileDown", title: "PDF-отчёт", desc: "Полный отчёт с графиками, индексами и проекцией цели" },
];

export default function FinancialThinkingLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    setMeta("og:url", "https://podelam.su/financial-thinking-info", true);
    setMeta("og:type", "website", true);
    setMeta("twitter:title", META.title);
    setMeta("twitter:description", META.description);
    setMeta("twitter:card", "summary_large_image");
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    setAccess(hasProAccess(TRAINER_ID));
    setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
    setHasHistory(
      getFinancialSessions(TRAINER_ID).some((s) => s.completedAt && s.results)
    );

    const handler = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
      setHasHistory(
        getFinancialSessions(TRAINER_ID).some((s) => s.completedAt && s.results)
      );
    };
    window.addEventListener("pdd_balance_change", handler);
    return () => window.removeEventListener("pdd_balance_change", handler);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/financial-thinking?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-in {
          animation: fadeInUp 0.7s ease-out both;
        }
        .anim-d1 { animation-delay: 0.1s; }
        .anim-d2 { animation-delay: 0.2s; }
        .anim-d3 { animation-delay: 0.3s; }
        .anim-d4 { animation-delay: 0.4s; }
        .anim-d5 { animation-delay: 0.5s; }
        .anim-d6 { animation-delay: 0.6s; }
        .anim-d7 { animation-delay: 0.7s; }
        .anim-d8 { animation-delay: 0.8s; }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-b border-emerald-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/trainers")}
            className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Тренажёры</span>
          </button>
          {access && (
            <span className="text-xs text-emerald-400 border border-emerald-400/30 rounded-full px-3 py-1">
              Доступ активен
            </span>
          )}
        </div>
      </nav>

      <section className="bg-emerald-950 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="anim-in anim-d1 inline-flex items-center gap-2 border border-emerald-700 rounded-full px-4 py-1.5 mb-8">
            <Icon name="TrendingUp" size={16} className="text-white" />
            <span className="text-xs text-emerald-300 uppercase tracking-widest">PRO-тренажёр</span>
          </div>

          <h1 className="anim-in anim-d2 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Финансовое мышление PRO
          </h1>

          <p className="anim-in anim-d3 text-base md:text-lg text-emerald-300 mb-4 max-w-xl mx-auto">
            Симулятор финансовых решений
          </p>

          <p className="anim-in anim-d4 text-sm text-emerald-400/70 mb-10 max-w-lg mx-auto">
            Развивайте финансовую дисциплину и системное понимание денежных потоков. Без ИИ — чистая математика и формулы.
          </p>

          <div className="anim-in anim-d5 flex flex-col sm:flex-row items-center gap-3 justify-center">
            {access ? (
              <Button
                onClick={() => navigate("/financial-thinking")}
                className="bg-white text-emerald-950 hover:bg-emerald-50 h-12 px-8 text-base font-medium rounded-lg"
              >
                Перейти к тренажёру
                <Icon name="ArrowRight" size={18} />
              </Button>
            ) : (
              <Button
                onClick={scrollToPricing}
                className="bg-white text-emerald-950 hover:bg-emerald-50 h-12 px-8 text-base font-medium rounded-lg"
              >
                Получить доступ
                <Icon name="ArrowDown" size={18} />
              </Button>
            )}
            {hasHistory && !access && (
              <Button
                onClick={() => navigate("/financial-thinking")}
                className="bg-emerald-800 text-white border border-emerald-600 hover:bg-emerald-700 h-12 px-6 text-base font-medium rounded-lg"
              >
                <Icon name="BarChart3" size={18} />
                Моя история
              </Button>
            )}
          </div>

          {access && expiresLabel && (
            <p className="anim-in anim-d6 text-xs text-emerald-500 mt-4">
              Доступ до {expiresLabel}
            </p>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Зачем считать, если можно чувствовать?
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Потому что интуиция в финансах подводит. 70% людей не знают свой реальный денежный поток, а 85% не готовы к финансовому стрессу. Этот тренажёр покажет вам точную картину.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl bg-red-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Icon name="EyeOff" size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Слепые зоны</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Вы знаете сколько зарабатываете, но не знаете куда уходят деньги. Импульсные траты съедают до 20% бюджета незаметно.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Icon name="TrendingDown" size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Иллюзия стабильности</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Пока всё хорошо — кажется, что так будет всегда. Но стресс-тест показывает: одно увольнение — и финансовая подушка тает за месяц.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Icon name="Target" size={20} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Цели без плана</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                «Хочу миллион» — не стратегия. Без расчёта PMT и KDG вы не знаете, достижима ли цель при вашем текущем потоке.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              Этот тренажёр — <span className="text-emerald-400">формульный анализ</span> ваших финансов
            </h3>
            <p className="text-sm md:text-base text-emerald-300/70 max-w-2xl mx-auto leading-relaxed mb-6">
              Вы вводите реальные данные — доходы, расходы, долги, цели — и пропускаете их через 7 этапов финансового анализа. На выходе: точные индексы, стресс-тест, проекция цели и оценка дисциплины.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">7</p>
                <p className="text-xs text-emerald-400/60">этапов анализа</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">10</p>
                <p className="text-xs text-emerald-400/60">индексов</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">1</p>
                <p className="text-xs text-emerald-400/60">итоговый IFMP-балл</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Чему вы научитесь
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Навыки, которые останутся после каждой сессии
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto mb-10">
            {LEARN_POINTS.map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={point.icon} size={18} className="text-emerald-700" />
                </div>
                <p className="text-sm font-medium text-slate-900">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-5 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon name="TrendingUp" size={24} className="text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base font-semibold text-slate-900 mb-1">Сравнивайте результаты</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Проходите тренажёр регулярно и наблюдайте, как растёт ваш финансовый индекс. История сохраняется.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
            Как это работает
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
            Семь последовательных этапов. Каждый влияет на итоговый индекс.
          </p>

          <div className="space-y-0">
            {HOW_STEPS.map((step, i) => (
              <div
                key={i}
                className="anim-in group flex items-start gap-5 py-6 border-b border-slate-100 last:border-0"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center">
                  <Icon name={step.icon} size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                      Этап {i}
                    </span>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-emerald-950">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Что вы получите
          </h2>
          <p className="anim-in anim-d1 text-sm text-emerald-400/60 text-center mb-14 max-w-md mx-auto">
            Детальный анализ вашего финансового мышления
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESULTS_LIST.map((item, i) => (
              <div
                key={i}
                className="anim-in border border-emerald-800 rounded-xl p-6"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={18} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-emerald-400/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
            Тарифы
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
            Выберите подходящий формат доступа
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainer.pricing.map((plan, i) => {
              const activeAccess = getProAccess(TRAINER_ID);
              const isActive = access && activeAccess?.planId === plan.id;
              const isPro = plan.id === "pro";

              return (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isPro={isPro}
                  isActive={isActive}
                  delay={0.2 + i * 0.15}
                  onSelect={() => handlePlanClick(plan.id)}
                  onNavigate={() => navigate("/financial-thinking")}
                />
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="Compass" size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">ПоДелам</span>
            </div>
            <div className="text-center text-sm text-slate-500 space-y-0.5">
              <p>© 2025 ПоДелам. Найди своё дело.</p>
              <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              <a href="/pricing" className="hover:text-slate-900 transition-colors">Тарифы</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Политика конфиденциальности</a>
              <a href="/oferta" className="hover:text-slate-900 transition-colors">Оферта</a>
              <a href="/partner" className="hover:text-slate-900 transition-colors">Партнёрская программа</a>
              <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Icon name="Send" size={14} />
                Контакты
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-200/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-slate-400 text-center">
            <p>
              Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
              информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
              Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
              с <a href="/privacy" className="underline hover:text-slate-500 transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-slate-500 transition-colors">Офертой</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  plan,
  isPro,
  isActive,
  delay,
  onSelect,
  onNavigate,
}: {
  plan: ProTrainerPricing;
  isPro: boolean;
  isActive: boolean;
  delay: number;
  onSelect: () => void;
  onNavigate: () => void;
}) {
  return (
    <div
      className={`anim-in relative rounded-xl border p-6 md:p-8 transition-all ${
        isPro
          ? "border-emerald-800 bg-emerald-950"
          : "border-slate-200 bg-white"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {isPro && (
        <div className="absolute -top-3 left-6 bg-white text-emerald-950 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          Рекомендуем
        </div>
      )}

      <h3
        className={`text-lg font-bold mb-1 ${
          isPro ? "text-white" : "text-slate-900"
        }`}
      >
        {plan.name}
      </h3>

      <div className="flex items-baseline gap-1 mb-6">
        <span
          className={`text-3xl font-bold ${
            isPro ? "text-white" : "text-slate-900"
          }`}
        >
          {plan.price.toLocaleString("ru-RU")} &#8381;
        </span>
        <span
          className={`text-sm ${isPro ? "text-emerald-400/60" : "text-slate-400"}`}
        >
          / {plan.period}
        </span>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-center gap-3">
            <Icon
              name="Check"
              size={14}
              className={isPro ? "text-white" : "text-slate-900"}
            />
            <span
              className={`text-sm ${
                isPro ? "text-emerald-300" : "text-slate-600"
              }`}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {isActive ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Icon name="Check" size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">
              Доступ активен
            </span>
          </div>
          <Button
            onClick={onNavigate}
            className={`w-full h-12 rounded-lg text-base font-medium ${
              isPro
                ? "bg-white text-emerald-950 hover:bg-emerald-50"
                : "bg-emerald-950 text-white hover:bg-emerald-800"
            }`}
          >
            Перейти к тренажёру
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      ) : (
        <Button
          onClick={onSelect}
          className={`w-full h-12 rounded-lg text-base font-medium ${
            isPro
              ? "bg-white text-emerald-950 hover:bg-emerald-50"
              : "bg-emerald-950 text-white hover:bg-emerald-800"
          }`}
        >
          Выбрать
        </Button>
      )}
    </div>
  );
}