import Icon from "@/components/ui/icon";

const HOW_STEPS = [
  { icon: "FileText", title: "Исходная задача", desc: "Формулируете утверждение и своё решение с уровнем уверенности" },
  { icon: "Scale", title: "Структура аргумента", desc: "Выстраиваете тезис, минимум 5 аргументов «за» и 3 «против»" },
  { icon: "GitBranch", title: "Причинно-следственные связи", desc: "Строите цепочки: Фактор → Следствие → Результат" },
  { icon: "Lightbulb", title: "Альтернативные гипотезы", desc: "Предлагаете минимум 3 альтернативных объяснения" },
  { icon: "Database", title: "Работа с данными", desc: "Разделяете факты, предположения и неизвестные" },
  { icon: "AlertTriangle", title: "Проверка на ошибки", desc: "Проходите чек-лист когнитивных искажений" },
  { icon: "RotateCcw", title: "Пересборка решения", desc: "Переформулируете решение на основе проведённого анализа" },
];

const RESULTS_LIST = [
  { icon: "Gauge", title: "Индекс логического мышления (ILMP)", desc: "Главный показатель от 0 до 100 на основе всех этапов анализа" },
  { icon: "Radar", title: "Radar-диаграмма", desc: "6 осей: аргументация, причинная логика, альтернативность, фактичность, гибкость, искажения" },
  { icon: "BarChart3", title: "Анализ решения", desc: "Сравнение уверенности до и после, выявление ригидности или гибкости мышления" },
  { icon: "ShieldAlert", title: "Предупреждения", desc: "Система выявляет перекос подтверждения, низкую фактичность, когнитивные искажения" },
];

export default function LogicLandingContent() {
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
            {HOW_STEPS.map((step, i) => (
              <div
                key={i}
                className="anim-in group flex items-start gap-3 sm:gap-5 py-5 sm:py-6 border-b border-slate-100 last:border-0"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
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

      <section className="py-20 md:py-28 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Что вы получите
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-400 text-center mb-14 max-w-md mx-auto">
            Детальный анализ вашего логического мышления
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {RESULTS_LIST.map((item, i) => (
              <div
                key={i}
                className="anim-in border border-slate-700 rounded-xl p-4 sm:p-6"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}