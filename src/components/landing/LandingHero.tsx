import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  goTrainers: () => void;
  goPricing: () => void;
}

export default function LandingHero({ goTrainers, goPricing }: LandingHeroProps) {
  return (
    <>
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
                <Icon name="CheckCircle" size={20} className="text-emerald-500" />
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
    </>
  );
}
