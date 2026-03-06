import Icon from "@/components/ui/icon";

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

export default function FinancialLandingContent() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
            Как это работает
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
            Семь последовательных этапов. Каждый влияет на итоговый индекс.
          </p>

          <div className="space-y-0">
            {HOW_STEPS.map((step, i) => (
              <div
                key={i}
                className="anim-in group flex items-start gap-3 sm:gap-5 py-6 border-b border-slate-100 last:border-0"
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
          <h2 className="anim-in text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Что вы получите
          </h2>
          <p className="anim-in anim-d1 text-sm text-emerald-400/60 text-center mb-14 max-w-md mx-auto">
            Детальный анализ вашего финансового мышления
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {RESULTS_LIST.map((item, i) => (
              <div
                key={i}
                className="anim-in border border-emerald-800 rounded-xl p-4 sm:p-6"
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
    </>
  );
}