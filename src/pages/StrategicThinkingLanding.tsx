import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
} from "@/lib/proTrainerAccess";

const TRAINER_ID = "strategic-thinking" as const;

const STEPS = [
  { icon: "FileText", title: "Создание стратегической сессии", desc: "Определите цель, горизонт и параметры решения" },
  { icon: "Network", title: "Системный анализ факторов", desc: "Выявите факторы влияния на четырёх уровнях" },
  { icon: "Target", title: "Определение узловых факторов", desc: "Найдите точки максимального рычага" },
  { icon: "GitBranch", title: "Сценарное моделирование", desc: "Постройте три сценария развития событий" },
  { icon: "ShieldAlert", title: "Анализ рисков", desc: "Оцените вероятность и ущерб каждого риска" },
  { icon: "Flame", title: "Стресс-тест", desc: "Проверьте стратегию в экстремальных условиях" },
  { icon: "Brain", title: "Проверка когнитивной гибкости", desc: "Оцените готовность менять решения" },
];

const RESULTS = [
  { icon: "Gauge", title: "Общий стратегический индекс", desc: "Единый балл от 0 до 100 — интегральная оценка качества стратегического решения" },
  { icon: "User", title: "Профиль мышления", desc: "Ваш тип: Архитектор, Аналитик, Тактик, Риск-игрок или Гибкий стратег" },
  { icon: "Radar", title: "Радар компетенций", desc: "Шесть осей: системность, точность, моделирование, управление рисками, адаптивность, гибкость" },
  { icon: "FileDown", title: "PDF-отчёт", desc: "Полный отчёт с графиками, индексами и рекомендациями для скачивания" },
];

export default function StrategicThinkingLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);

  useEffect(() => {
    setAccess(hasProAccess(TRAINER_ID));
    setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));

    const handler = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
    };
    window.addEventListener("pdd_balance_change", handler);
    return () => window.removeEventListener("pdd_balance_change", handler);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/strategic-thinking?plan=${planId}`);
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/trainers-info")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
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

      <section className="bg-slate-950 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="anim-in anim-d1 inline-flex items-center gap-2 border border-slate-700 rounded-full px-4 py-1.5 mb-8">
            <Icon name="Brain" size={16} className="text-white" />
            <span className="text-xs text-slate-400 uppercase tracking-widest">PRO-тренажёр</span>
          </div>

          <h1 className="anim-in anim-d2 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Стратегическое мышление PRO
          </h1>

          <p className="anim-in anim-d3 text-base md:text-lg text-slate-400 mb-4 max-w-xl mx-auto">
            Инструмент стратегического моделирования решений
          </p>

          <p className="anim-in anim-d4 text-sm text-slate-500 mb-10">
            Это не тест. Это симулятор.
          </p>

          <div className="anim-in anim-d5">
            {access ? (
              <Button
                onClick={() => navigate("/strategic-thinking")}
                className="bg-white text-slate-950 hover:bg-slate-100 h-12 px-8 text-base font-medium rounded-lg"
              >
                Перейти к тренажёру
                <Icon name="ArrowRight" size={18} />
              </Button>
            ) : (
              <Button
                onClick={scrollToPricing}
                className="bg-white text-slate-950 hover:bg-slate-100 h-12 px-8 text-base font-medium rounded-lg"
              >
                Получить доступ
                <Icon name="ArrowDown" size={18} />
              </Button>
            )}
          </div>

          {access && expiresLabel && (
            <p className="anim-in anim-d6 text-xs text-slate-500 mt-4">
              Доступ до {expiresLabel}
            </p>
          )}
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
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="anim-in group flex items-start gap-5 py-6 border-b border-slate-100 last:border-0"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center">
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

      <section className="py-20 md:py-28 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Что вы получите
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
            Детальный анализ вашего стратегического мышления
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESULTS.map((item, i) => (
              <div
                key={i}
                className="anim-in border border-slate-800 rounded-xl p-6"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={18} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
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
              const isActive = access && getProAccess(TRAINER_ID)?.planId === plan.id;
              const isPro = plan.id === "pro";

              return (
                <div
                  key={plan.id}
                  className={`anim-in relative rounded-xl border p-6 md:p-8 transition-all ${
                    isPro
                      ? "border-slate-900 bg-slate-950"
                      : "border-slate-200 bg-white"
                  }`}
                  style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-6 bg-white text-slate-950 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
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
                      className={`text-sm ${
                        isPro ? "text-slate-500" : "text-slate-400"
                      }`}
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
                            isPro ? "text-slate-300" : "text-slate-600"
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
                        onClick={() => navigate("/strategic-thinking")}
                        className={`w-full h-12 rounded-lg text-base font-medium ${
                          isPro
                            ? "bg-white text-slate-950 hover:bg-slate-100"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        Перейти к тренажёру
                      </Button>
                    </div>
                  ) : access ? (
                    <div className="flex items-center justify-center h-12 rounded-lg border border-slate-200 text-sm text-slate-400">
                      У вас другой тариф
                    </div>
                  ) : (
                    <Button
                      onClick={() => handlePlanClick(plan.id)}
                      className={`w-full h-12 rounded-lg text-base font-medium ${
                        isPro
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      Выбрать
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Этот продукт не входит в подписку тренажёров. Отдельная покупка.
            </p>
          </div>
        </div>
      </section>

      <div className="py-10 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <button
            onClick={() => navigate("/trainers-info")}
            className="text-sm text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={14} />
            Вернуться к тренажёрам
          </button>
        </div>
      </div>
    </div>
  );
}