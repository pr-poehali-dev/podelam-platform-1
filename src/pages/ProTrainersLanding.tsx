import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function ProTrainersLanding() {
  const navigate = useNavigate();

  const proTrainers = [
    {
      title: "Стратегическое мышление",
      description: "7 этапов глубокого анализа: системные факторы, сценарное моделирование, стресс-тест стратегии. Индекс ОСИ.",
      tags: ["стратегия", "сценарии", "риски", "ОСИ", "7 этапов"],
      price: "от 3 590 ₽",
      icon: "Brain",
      color: "amber",
      route: "/strategic-thinking-info",
      border: "border-amber-200/80",
      bg: "from-slate-900 to-slate-800",
      overlay: "from-amber-500/10 to-orange-500/5",
      glow: "bg-amber-500/10",
      iconBg: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      badgeText: "text-amber-400",
      badgeBg: "bg-amber-500/20",
      badgeBorder: "border-amber-500/30",
      priceText: "text-amber-400",
      hoverShadow: "hover:shadow-amber-500/10",
      for: "Для предпринимателей, руководителей и тех, кто принимает важные стратегические решения",
      goals: ["Выработать системный взгляд на ситуацию", "Просчитать риски и альтернативные сценарии", "Принять взвешенное долгосрочное решение"],
      result: "Чёткая стратегия с оценкой рисков и индексом ОСИ",
    },
    {
      title: "Финансовое мышление",
      description: "Анализ денежных потоков, стресс-тесты, моделирование целей. Индекс финансового мышления IFMP.",
      tags: ["финансы", "стресс-тест", "цели", "IFMP", "7 этапов"],
      price: "от 2 990 ₽",
      icon: "TrendingUp",
      color: "emerald",
      route: "/financial-thinking-info",
      border: "border-emerald-200/80",
      bg: "from-emerald-900 to-emerald-950",
      overlay: "from-emerald-500/10 to-teal-500/5",
      glow: "bg-emerald-500/10",
      iconBg: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      badgeText: "text-emerald-400",
      badgeBg: "bg-emerald-500/20",
      badgeBorder: "border-emerald-500/30",
      priceText: "text-emerald-400",
      hoverShadow: "hover:shadow-emerald-500/10",
      for: "Для тех, кто хочет разобраться в своих финансах, поставить цели и перестать тревожиться о деньгах",
      goals: ["Понять реальную картину доходов и расходов", "Пройти стресс-тест финансовой устойчивости", "Построить модель достижения финансовых целей"],
      result: "Финансовый план с персональным индексом IFMP",
    },
    {
      title: "Логика мышления",
      description: "Анализ аргументов, причинно-следственные связи, когнитивные искажения. Индекс логики мышления ILMP.",
      tags: ["логика", "аргументы", "искажения", "ILMP", "7 этапов"],
      price: "от 2 590 ₽",
      icon: "Lightbulb",
      color: "indigo",
      route: "/logic-thinking-info",
      border: "border-indigo-200/80",
      bg: "from-indigo-900 to-indigo-950",
      overlay: "from-indigo-500/10 to-violet-500/5",
      glow: "bg-indigo-500/10",
      iconBg: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-500/20",
      badgeText: "text-indigo-400",
      badgeBg: "bg-indigo-500/20",
      badgeBorder: "border-indigo-500/30",
      priceText: "text-indigo-400",
      hoverShadow: "hover:shadow-indigo-500/10",
      isNew: true,
      for: "Для всех, кто хочет мыслить чётче, находить слабые места в рассуждениях и избавиться от когнитивных ловушек",
      goals: ["Научиться строить чёткие причинно-следственные цепочки", "Распознавать когнитивные искажения в своих решениях", "Оценивать силу и слабость любых аргументов"],
      result: "Объективная оценка логики мышления с индексом ILMP",
    },
    {
      title: "Симулятор сценариев",
      description: "Просчитай любой жизненный сценарий: ипотека, бизнес, переезд, работа, авто. Универсальное ядро для принятия взвешенных решений.",
      tags: ["ипотека", "бизнес", "переезд", "работа", "авто"],
      price: "490 ₽ / 7 дней",
      icon: "Zap",
      color: "violet",
      route: "/simulator-pro-info",
      border: "border-violet-200/80",
      bg: "from-violet-900 to-purple-950",
      overlay: "from-violet-500/10 to-fuchsia-500/5",
      glow: "bg-violet-500/10",
      iconBg: "from-violet-500 to-fuchsia-600",
      shadow: "shadow-violet-500/20",
      badgeText: "text-violet-300",
      badgeBg: "bg-violet-500/20",
      badgeBorder: "border-violet-500/30",
      priceText: "text-violet-400",
      hoverShadow: "hover:shadow-violet-500/10",
      for: "Для тех, кто стоит перед сложным жизненным выбором и хочет просчитать последствия",
      goals: ["Смоделировать любой сценарий: переезд, ипотека, смена работы", "Сравнить несколько вариантов по ключевым параметрам", "Принять решение на основе данных, а не интуиции"],
      result: "Готовый анализ сценария с рекомендациями",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-slate-400 text-sm">PRO-тренажёры</span>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Icon name="Crown" size={20} className="text-white" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">PRO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          PRO-тренажёры<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">для глубокой работы</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Продвинутые инструменты для тех, кто хочет не просто пройти тест, а по-настоящему разобраться в ситуации и получить конкретный результат.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proTrainers.map((trainer) => (
            <div
              key={trainer.title}
              onClick={() => navigate(trainer.route)}
              className={`group relative rounded-2xl border ${trainer.border} bg-gradient-to-br ${trainer.bg} overflow-hidden cursor-pointer hover:shadow-xl ${trainer.hoverShadow} transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${trainer.overlay}`} />
              <div className={`absolute top-0 right-0 w-40 h-40 ${trainer.glow} rounded-full blur-3xl -translate-y-10 translate-x-10`} />
              <div className="relative p-6 flex flex-col gap-4">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trainer.iconBg} flex items-center justify-center shrink-0 shadow-lg ${trainer.shadow}`}>
                      <Icon name={trainer.icon} size={22} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trainer.badgeBg} ${trainer.badgeText} border ${trainer.badgeBorder}`}>PRO</span>
                      {trainer.isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">NEW</span>
                      )}
                    </div>
                  </div>
                  <Icon name="ArrowRight" size={18} className="text-slate-500 group-hover:text-slate-300 transition-colors mt-1" />
                </div>

                {/* Title + desc */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{trainer.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{trainer.description}</p>
                </div>

                {/* For whom */}
                <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Для кого</p>
                    <p className="text-sm text-slate-300">{trainer.for}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Цели</p>
                    <ul className="flex flex-col gap-1.5">
                      {trainer.goals.map((goal) => (
                        <li key={goal} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 bg-gradient-to-br ${trainer.iconBg}`} />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Результат</p>
                    <p className="text-sm text-slate-200 font-medium">{trainer.result}</p>
                  </div>
                </div>

                {/* Tags + Price */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <span className={`text-base font-bold ${trainer.priceText}`}>{trainer.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
