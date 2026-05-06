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
            <Icon name="ScanSearch" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Персональный разбор · Конкретные шаги
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground leading-tight mb-4">
            Пойми, что тебя тормозит,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              и узнай, как зарабатывать без выгорания
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-3">
            Персональный разбор твоих решений, поведения и модели дохода
          </p>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Пройди тест — и получи конкретные выводы: что мешает двигаться, где
            теряешь энергию и деньги, и какой формат работы подходит именно тебе.
            Без «воды» и абстракций.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={goTrainers}
              className="gradient-brand text-white font-bold px-8 py-6 rounded-2xl text-base border-0 shadow-lg shadow-violet-200/50 hover:shadow-xl transition-shadow"
            >
              <Icon name="Play" size={18} className="mr-2" />
              Пройти тест
            </Button>
            <Button
              onClick={goPricing}
              variant="outline"
              className="px-8 py-6 rounded-2xl text-base font-semibold"
            >
              <Icon name="Eye" size={18} className="mr-2" />
              Посмотреть инструменты
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-sm text-muted-foreground">
            {["Без «воды» и абстракций", "Конкретные выводы и шаги", "Результат под тебя"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Icon name="Check" size={14} className="text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition block */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Ты стараешься, но как будто стоишь на месте
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Скорее всего, ты узнаешь себя
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                Знакомо?
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Не понимаешь, куда двигаться дальше",
                "Начинаешь и быстро бросаешь",
                "Доход не растёт, несмотря на усилия",
                "Чувствуешь усталость и перегруз",
                "Пробовал разные способы — ни один не зашёл",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon name="X" size={16} className="text-red-400 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-foreground/70 border-t pt-4">
              В какой-то момент появляется ощущение: «Со мной что-то не так»
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 sm:p-8 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                С тобой всё нормально
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Проблема не в лени и не в отсутствии дисциплины. Большинство людей
              застревают, потому что действуют не по своей модели:
            </p>
            <ul className="space-y-3">
              {[
                "Берут неподходящую нагрузку",
                "Выбирают не тот формат работы",
                "Пытаются зарабатывать «как все»",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-foreground/80">
                  <Icon name="Check" size={16} className="text-emerald-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-foreground/70 border-t pt-4">
              Итог — выгорание, сомнения и отсутствие результата
            </p>
          </div>
        </div>
      </section>

      {/* Example result card */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Вот как выглядит твой разбор
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ты увидишь не абстрактное описание, а конкретную картину — под тебя
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border-2 border-violet-200 bg-white overflow-hidden shadow-lg shadow-violet-100/50">
            {/* Header */}
            <div className="gradient-brand px-6 py-5 text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Пример разбора</span>
                <span className="text-white/60 text-xs">Психологический анализ</span>
              </div>
              <h3 className="text-xl font-black mt-3">Финансово свободный</h3>
              <p className="text-white/75 text-sm">Аналитика и системность · Деньги и доход</p>
            </div>

            {/* Blocks */}
            <div className="p-5 space-y-4">
              <div className="flex gap-3 items-start bg-red-50 rounded-2xl p-4 border border-red-100">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Icon name="AlertOctagon" size={18} className="text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Главный блок</div>
                  <p className="text-sm text-red-800 leading-relaxed">Паралич анализа — ты ждёшь идеального момента, который никогда не наступит</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Icon name="TrendingDown" size={18} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">Где теряешь деньги</div>
                  <p className="text-sm text-orange-800 leading-relaxed">На промедлении — пока анализируешь, возможности уходят к другим</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Icon name="Wallet" size={18} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Твоя модель дохода</div>
                  <p className="text-sm text-emerald-800 leading-relaxed">Экспертный сервис: аудиты, аналитика под заказ, долгосрочные контракты с системными клиентами</p>
                </div>
              </div>

              {/* Blurred "What next" */}
              <div className="relative rounded-2xl overflow-hidden border border-violet-100">
                <div className="p-4 blur-[4px] select-none pointer-events-none">
                  <div className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-2">Что делать дальше</div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-violet-100 rounded w-full" />
                    <div className="h-3 bg-violet-100 rounded w-4/5" />
                    <div className="h-3 bg-violet-100 rounded w-3/5" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <div className="flex items-center gap-2 bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                    <Icon name="Lock" size={13} />
                    Открывается после теста
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Мы покажем, что именно тебя тормозит
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Пройди тест — и получи персональный разбор
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", icon: "ClipboardList", title: "Отвечаешь на вопросы", desc: "Простые ситуации и выборы, которые отражают твои реальные реакции" },
              { step: "2", icon: "ScanSearch", title: "Анализируем твои паттерны", desc: "Определяем, как ты принимаешь решения и где возникают затыки" },
              { step: "3", icon: "FileText", title: "Получаешь разбор", desc: "Чёткую картину: что происходит и что с этим делать прямо сейчас" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border bg-[hsl(248,50%,98%)] p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon name={item.icon} size={22} className="text-primary" />
                </div>
                <div className="text-xs font-black text-primary/50 tracking-widest uppercase mb-2">Шаг {item.step}</div>
                <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Результат, который можно применить сразу
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ты увидишь не абстрактное описание, а конкретную картину
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: "Brain", title: "Твой тип мышления", desc: "Как ты принимаешь решения и работаешь" },
            { icon: "AlertOctagon", title: "Главный блок", desc: "Что именно тормозит твой рост" },
            { icon: "TrendingDown", title: "Где ты теряешь деньги", desc: "Ошибки, которые не дают зарабатывать больше" },
            { icon: "Wallet", title: "Твоя модель дохода", desc: "Формат, который подходит именно тебе" },
            { icon: "Rocket", title: "Что делать дальше", desc: "Конкретные шаги без лишней теории" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3.5 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name={item.icon} size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}