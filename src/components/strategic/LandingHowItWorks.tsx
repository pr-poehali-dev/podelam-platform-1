import Icon from "@/components/ui/icon";

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

export default function LandingHowItWorks() {
  return (
    <>
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
    </>
  );
}
