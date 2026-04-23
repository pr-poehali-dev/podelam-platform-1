import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function TrainerPricingBlock() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Базовый доступ",
      period: "1 месяц",
      price: "990",
      desc: "1 тренажёр на выбор",
      features: [
        "Пакет из 4 сессий",
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
  ];

  const results = [
    { icon: "TrendingDown", text: "Снижение тревоги и страха" },
    { icon: "Rocket", text: "Меньше откладывания важных шагов" },
    { icon: "Lightbulb", text: "Больше ясных решений" },
    { icon: "Shield", text: "Укрепление внутренней опоры" },
    { icon: "Wallet", text: "Спокойствие в финансовой сфере" },
    { icon: "Target", text: "Рост дисциплины и осознанных действий" },
  ];

  return (
    <>
      {/* Pricing */}
      <section className="py-12 sm:py-16 px-4 bg-white border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Тарифы</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">Формат доступа</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Глубокие изменения требуют системной работы и повторяемости
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  p.accent
                    ? "border-primary bg-primary/[0.02] shadow-md shadow-primary/10"
                    : "bg-background border-border"
                }`}
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
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-foreground">{p.price} ₽</span>
                  <span className="text-sm text-muted-foreground">/ {p.period}</span>
                </div>
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Icon
                        name="Check"
                        size={16}
                        className={`shrink-0 mt-0.5 ${p.accent ? "text-primary" : "text-muted-foreground"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/trainers")}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    p.accent
                      ? "gradient-brand text-white hover:opacity-90"
                      : "border border-border hover:bg-muted text-foreground"
                  }`}
                >
                  Выбрать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Результаты через 30–90 дней
            </h2>
            <p className="text-muted-foreground text-sm">Пользователи замечают</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r) => (
              <div key={r.text} className="flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon name={r.icon} size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-foreground">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
