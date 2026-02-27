import { RefObject } from "react";
import Icon from "@/components/ui/icon";

const TRAINERS = [
  {
    icon: "Compass",
    color: "from-indigo-500 to-violet-600",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    title: "Осознанный выбор",
    desc: "Для принятия решений без сомнений.",
    features: [
      "Помогает выйти из состояния неопределённости",
      "Снижает страх и тревогу",
      "Показывает последствия выбора",
      "Фиксирует шаги для реализации",
    ],
    index: "Индекс решительности отображает прогресс по принятым решениям.",
  },
  {
    icon: "Heart",
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    title: "Эмоции в действии",
    desc: "Для управления чувствами и реакциями.",
    features: [
      "Распознаёт эмоции и их источник",
      "Снижает импульсивность",
      "Предлагает зрелые стратегии реакции",
      "Отслеживает эмоциональную зрелость",
    ],
    index: "Индекс EMI отображает уровень эмоциональной зрелости.",
  },
  {
    icon: "Zap",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Антипрокрастинация. Малый шаг",
    desc: "Для запуска действий и снижения сопротивления.",
    features: [
      "Помогает начать с мини-шагов",
      "Формирует дисциплину и привычку завершать",
      "Отслеживает прогресс и индекс действия",
    ],
    index: "Индекс AI отображает способность запускать действия.",
  },
  {
    icon: "Shield",
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Самооценка и внутренняя опора",
    desc: "Для устойчивой самоценности и независимости от внешней оценки.",
    features: [
      "Фокус на фактах и достижениях",
      "Укрепляет внутреннюю опору",
      "Формирует стабильную самооценку",
      "Снижает колебания в эмоциональной реакции",
    ],
    index: "Индекс IVO отражает рост внутренней устойчивости.",
  },
  {
    icon: "Wallet",
    color: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    title: "Деньги без тревоги",
    desc: "Для спокойного и осознанного управления финансами.",
    features: [
      "Выявляет денежные страхи",
      "Показывает ограничивающие установки",
      "Переводит тревогу в конкретные финансовые действия",
      "Отслеживает индекс финансовой устойчивости",
    ],
    index: "Индекс FSI показывает рост финансовой зрелости.",
  },
];

const FOR_WHO = [
  "Стремятся к личному росту и развитию",
  "Хотят принимать решения без страха и сомнений",
  "Хотят выстраивать внутреннюю устойчивость",
  "Стремятся к дисциплине и системным действиям",
  "Хотят управлять тревогой и стрессом",
];

const HOW_IT_WORKS = [
  { icon: "Cpu", text: "Работают по алгоритмам без ИИ" },
  { icon: "LineChart", text: "Сохраняют динамику действий и эмоций" },
  { icon: "Calculator", text: "Рассчитывают ключевые индексы развития" },
  { icon: "Repeat", text: "Формируют повторяемую систему привычек" },
  { icon: "Footprints", text: "Предлагают осознанные шаги к результату" },
];

interface LandingTrainersListProps {
  trainersRef: RefObject<HTMLDivElement>;
}

export default function LandingTrainersList({ trainersRef }: LandingTrainersListProps) {
  return (
    <>
      {/* 5 trainers */}
      <section
        ref={trainersRef}
        className="max-w-5xl mx-auto px-4 py-16 sm:py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            5 флагманских тренажёров
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Каждый тренажёр решает конкретную задачу и считает индекс прогресса
          </p>
        </div>

        <div className="space-y-5">
          {TRAINERS.map((t, idx) => (
            <div
              key={t.title}
              className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                <div
                  className={`
                    sm:w-48 h-24 sm:h-auto bg-gradient-to-br ${t.color}
                    flex items-center justify-center shrink-0 relative overflow-hidden
                  `}
                >
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/5" />
                  <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon name={t.icon} className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
                      Тренажёр {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.desc}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {t.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <Icon
                          name="Check"
                          size={14}
                          className={`${t.iconColor} shrink-0 mt-0.5`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-primary/70 italic">{t.index}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Как устроены тренажёры
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((h) => (
              <div
                key={h.text}
                className="flex items-center gap-3.5 rounded-2xl border bg-[hsl(248,50%,98%)] p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name={h.icon} size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {h.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Для кого
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Тренажёры подходят людям, которые:
          </p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {FOR_WHO.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
