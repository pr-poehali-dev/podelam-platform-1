import Icon from "@/components/ui/icon";

export default function LandingOffer() {
  return (
    <>
      <section className="py-20 md:py-28 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Почему 80% стратегий проваливаются?
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Не потому что идея плохая. А потому что решение принималось без&nbsp;системного анализа — на интуиции, в&nbsp;спешке, без проверки на&nbsp;прочность.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl bg-red-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Icon name="Eye" size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Слепые зоны</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Вы видите 5 факторов, а на решение влияют 15. Скрытые зависимости ломают даже идеальные планы.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Icon name="Dice5" size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Один сценарий</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Большинство планируют только «как должно быть». Когда реальность отклоняется — нет плана Б. И&nbsp;паника.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Icon name="Anchor" size={20} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Якорение на первом решении</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Мозг цепляется за первый вариант и фильтрует всё, что ему противоречит. Вы уверены в&nbsp;плане, а&nbsp;он&nbsp;уже&nbsp;устарел.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              Этот тренажёр — <span className="text-amber-400">рентген</span> для ваших решений
            </h3>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
              Вы берёте реальное решение — запуск продукта, смена стратегии, инвестиция — и пропускаете его через 7 этапов стратегического анализа. На выходе вы видите не «правильно/неправильно», а точную карту: где ваше мышление сильно, а где — дыры.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">7</p>
                <p className="text-xs text-slate-500">этапов анализа</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">6</p>
                <p className="text-xs text-slate-500">индексов мышления</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">1</p>
                <p className="text-xs text-slate-500">итоговый OSI-балл</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Для кого это
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Тренажёр полезен каждому, кто принимает решения с последствиями
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: "Briefcase", who: "Предприниматели", reason: "Проверить бизнес-идею или стратегию до того, как вложить деньги и время" },
              { icon: "Users", who: "Руководители", reason: "Принимать решения не на интуиции, а на системном анализе факторов и рисков" },
              { icon: "GraduationCap", who: "Начинающие стратеги", reason: "Научиться мыслить сценариями, видеть связи и управлять неопределённостью" },
              { icon: "Lightbulb", who: "Продакт-менеджеры", reason: "Оценить запуск фичи или продукта: риски, сценарии, точки рычага" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} size={20} className="text-slate-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.who}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Что вы узнаете о себе
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Каждая сессия даёт развёрнутый отчёт с расшифровкой и рекомендациями
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "Gauge", label: "OSI-балл", desc: "Единый индекс от 0 до 100. Показывает общее качество стратегического мышления." },
              { icon: "Network", label: "Системность", desc: "Насколько полно вы видите факторы влияния и связи между ними на 4 уровнях." },
              { icon: "Target", label: "Точность приоритетов", desc: "Попадаете ли вы в точки рычага — или тратите силы на второстепенное." },
              { icon: "GitBranch", label: "Сценарное мышление", desc: "Готовы ли вы к разным вариантам — или живёте в одном «должно быть»." },
              { icon: "ShieldAlert", label: "Управление рисками", desc: "Видите ли вы риски и можете ли ими управлять, а не просто бояться." },
              { icon: "Brain", label: "Когнитивная гибкость", desc: "Готовы ли менять решение, когда данные говорят — план устарел." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-white border border-slate-200 p-5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center mb-3">
                  <Icon name={item.icon} size={16} className="text-white" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{item.label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon name="TrendingUp" size={24} className="text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base font-semibold text-slate-900 mb-1">Сравнивайте результаты</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Проходите тренажёр на разных решениях и наблюдайте, как растёт ваш стратегический индекс. История сохраняется — прогресс виден на графике.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Чем это отличается от тестов
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-12">
            Тесты проверяют знания. Тренажёр проверяет мышление — на&nbsp;вашем реальном кейсе.
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-4 font-medium text-slate-500"></th>
                  <th className="p-4 font-medium text-slate-400">Обычный тест</th>
                  <th className="p-4 font-semibold text-slate-900 bg-slate-100">Этот тренажёр</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Данные", "Абстрактные вопросы", "Ваш реальный кейс"],
                  ["Результат", "«Вы стратег 7/10»", "Карта сильных и слабых сторон с рекомендациями"],
                  ["Методика", "Опросник", "Математическая модель из 6 индексов"],
                  ["Стресс-тест", "Нет", "Проверка стратегии при -30% доходов"],
                  ["Повторное прохождение", "Бессмысленно", "Новый кейс — новые инсайты"],
                ].map(([label, test, trainer], i) => (
                  <tr key={i}>
                    <td className="p-4 text-left font-medium text-slate-700">{label}</td>
                    <td className="p-4 text-center text-slate-400">{test}</td>
                    <td className="p-4 text-center text-slate-900 font-medium bg-slate-50">{trainer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
