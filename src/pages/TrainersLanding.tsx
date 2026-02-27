import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

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

const RESULTS = [
  { icon: "TrendingDown", text: "Снижение тревоги и страха" },
  { icon: "Rocket", text: "Меньше откладывания важных шагов" },
  { icon: "Lightbulb", text: "Больше ясных решений" },
  { icon: "Shield", text: "Укрепление внутренней опоры" },
  { icon: "Wallet", text: "Спокойствие в финансовой сфере" },
  { icon: "Target", text: "Рост дисциплины и осознанных действий" },
];

const HOW_IT_WORKS = [
  { icon: "Cpu", text: "Работают по алгоритмам без ИИ" },
  { icon: "LineChart", text: "Сохраняют динамику действий и эмоций" },
  { icon: "Calculator", text: "Рассчитывают ключевые индексы развития" },
  { icon: "Repeat", text: "Формируют повторяемую систему привычек" },
  { icon: "Footprints", text: "Предлагают осознанные шаги к результату" },
];

export default function TrainersLanding() {
  const navigate = useNavigate();
  const trainersRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem("pdd_user");

  const goTrainers = () => navigate("/trainers");
  const goPricing = () => {
    trainersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen font-golos bg-[hsl(248,50%,98%)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-foreground">
              ПоДелам
            </span>
          </button>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                onClick={goTrainers}
                className="gradient-brand text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-0"
              >
                <Icon name="Dumbbell" size={15} className="mr-1.5" />
                К тренажёрам
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="gradient-brand text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-0"
              >
                Начать
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-100/30 blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-border/50 shadow-sm mb-6">
            <Icon name="Dumbbell" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              5 тренажёров для осознанной жизни
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground leading-tight mb-4">
            Тренажёры{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              ПоДелам
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-3">
            Осознанные решения. Устойчивые действия. Реальные результаты.
          </p>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Система тренажёров переводит мысли, страхи и цели в конкретные
            действия. Без мотивации и «воды». Только проверенные алгоритмы для
            развития осознанности и внутренней устойчивости.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={goTrainers}
              className="gradient-brand text-white font-bold px-8 py-6 rounded-2xl text-base border-0 shadow-lg shadow-violet-200/50 hover:shadow-xl transition-shadow"
            >
              <Icon name="Play" size={18} className="mr-2" />
              Начать с первого тренажёра
            </Button>
            <Button
              onClick={goPricing}
              variant="outline"
              className="px-8 py-6 rounded-2xl text-base font-semibold"
            >
              <Icon name="Eye" size={18} className="mr-2" />
              Посмотреть все инструменты
            </Button>
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Почему это работает
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            В чём отличие от привычных подходов к саморазвитию
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                Большинство людей
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Понимают, но не действуют",
                "Чувствуют, но избегают",
                "Откладывают важные шаги",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon name="X" size={16} className="text-red-400 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-6 sm:p-8 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                Тренажёры позволяют
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Структурировать мышление",
                "Принимать осознанные решения",
                "Снижать тревогу и стресс",
                "Формировать привычку действий",
                "Укреплять внутреннюю опору",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-foreground/80">
                  <Icon name="Check" size={16} className="text-emerald-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

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

      {/* Pricing */}
      <section className="bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Формат доступа
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Глубокие изменения требуют системной работы и повторяемости
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: "Базовый доступ",
                period: "1 месяц",
                price: "990",
                desc: "1 тренажёр на выбор",
                features: [
                  "До 4 сессий в месяц",
                  "Базовая аналитика",
                  "Сохранение результатов",
                ],
                accent: false,
              },
              {
                name: "Углублённый",
                period: "3 месяца",
                price: "2 490",
                desc: "Все тренажёры · полная аналитика",
                features: [
                  "Все 5 тренажёров",
                  "Неограниченные сессии",
                  "Индексы EMI, AI, IVO, FSI",
                  "Трекер прогресса",
                ],
                accent: true,
              },
              {
                name: "Системный рост",
                period: "1 год",
                price: "6 990",
                desc: "Максимальная глубина проработки",
                features: [
                  "Все 5 тренажёров",
                  "Годовая динамика индексов",
                  "Анализ паттернов",
                  "Глубокая проработка",
                ],
                accent: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`
                  relative flex flex-col rounded-2xl border p-6 transition-all
                  ${
                    p.accent
                      ? "border-primary bg-primary/[0.02] shadow-md shadow-primary/10"
                      : "bg-[hsl(248,50%,98%)]"
                  }
                `}
              >
                {p.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold gradient-brand text-white shadow-sm">
                      Популярный
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.desc}
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-foreground">
                    {p.price} ₽
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {p.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-2 mb-5 flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <Icon
                        name="Check"
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          p.accent ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={goTrainers}
                  variant={p.accent ? "default" : "outline"}
                  className={`w-full h-10 rounded-xl text-sm font-medium ${
                    p.accent
                      ? "gradient-brand text-white border-0 shadow-sm"
                      : ""
                  }`}
                >
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Результаты через 30–90 дней
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Пользователи замечают
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {RESULTS.map((r) => (
            <div
              key={r.text}
              className="flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon name={r.icon} size={20} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {r.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Why no AI */}
      <section className="bg-white border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 mb-6">
            <Icon name="Cpu" size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Без ИИ — и вот почему
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6">
            Почему без ИИ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left max-w-3xl mx-auto">
            {[
              {
                icon: "Brain",
                title: "Самостоятельная осознанность",
                desc: "Важна собственная работа мышления, а не подсказки алгоритма.",
              },
              {
                icon: "Navigation",
                title: "Направление, не замена",
                desc: "Система направляет, решение принимает пользователь.",
              },
              {
                icon: "LineChart",
                title: "Фиксация динамики",
                desc: "Алгоритмы фиксируют прогресс, но не заменяют личное осознание.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-[hsl(248,50%,98%)] p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                  <Icon name={item.icon} size={20} className="text-amber-600" />
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-50/80 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-foreground leading-tight mb-4">
            Жить по Делам —{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              значит действовать осознанно
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Начало работы с тренажёрами — первый шаг к устойчивой внутренней
            опоре и осознанным решениям.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={goTrainers}
              className="gradient-brand text-white font-bold px-8 py-6 rounded-2xl text-base border-0 shadow-lg shadow-violet-200/50 hover:shadow-xl transition-shadow"
            >
              <Icon name="Dumbbell" size={18} className="mr-2" />
              Выбрать тренажёр
            </Button>
            <Button
              onClick={goTrainers}
              variant="outline"
              className="px-8 py-6 rounded-2xl text-base font-semibold"
            >
              <Icon name="CreditCard" size={18} className="mr-2" />
              Оформить доступ
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>ПоДелам — тренажёры для осознанной жизни</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
              Конфиденциальность
            </button>
            <button onClick={() => navigate("/oferta")} className="hover:text-foreground transition-colors">
              Оферта
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
