import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const RESULTS = [
  { icon: "TrendingDown", text: "Снижение тревоги и страха" },
  { icon: "Rocket", text: "Меньше откладывания важных шагов" },
  { icon: "Lightbulb", text: "Больше ясных решений" },
  { icon: "Shield", text: "Укрепление внутренней опоры" },
  { icon: "Wallet", text: "Спокойствие в финансовой сфере" },
  { icon: "Target", text: "Рост дисциплины и осознанных действий" },
];

interface LandingPricingProps {
  goTrainers: () => void;
}

export default function LandingPricing({ goTrainers }: LandingPricingProps) {
  return (
    <>
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
                desc: "1 тренажер на выбор",
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
                desc: "Все тренажеры · полная аналитика",
                features: [
                  "Все 5 тренажеров",
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
                  "Все 5 тренажеров",
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
            Начало работы с тренажерами — первый шаг к устойчивой внутренней
            опоре и осознанным решениям.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={goTrainers}
              className="gradient-brand text-white font-bold px-8 py-6 rounded-2xl text-base border-0 shadow-lg shadow-violet-200/50 hover:shadow-xl transition-shadow"
            >
              <Icon name="Dumbbell" size={18} className="mr-2" />
              Выбрать тренажер
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
    </>
  );
}