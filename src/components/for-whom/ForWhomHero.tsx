import Icon from "@/components/ui/icon";

const recognizeCards = [
  {
    icon: "Layers",
    title: "Есть потенциал, но нет структуры",
    text: "Ты чувствуешь, что можешь больше — но сложно собраться и выстроить понятный путь. Много идей, мало движения.",
  },
  {
    icon: "GitBranch",
    title: "Постоянные сомнения в выборе",
    text: "Распыляешься между направлениями и не можешь сосредоточиться на одном. Каждое решение даётся с трудом.",
  },
  {
    icon: "BatteryLow",
    title: "Быстро теряешь энергию",
    text: "Работаешь, стараешься — но ресурс заканчивается. Хочется большего, но не понимаешь, куда двигаться.",
  },
  {
    icon: "Compass",
    title: "Нет ясности и опоры на себя",
    text: "Пробовал разные варианты, но ощущения «это моё» так и не появилось. Чувствуешь, что теряешь ориентир.",
  },
];

interface ForWhomHeroProps {
  isLoggedIn: boolean;
  onNavigate: (path: string) => void;
}

export default function ForWhomHero({ isLoggedIn, onNavigate }: ForWhomHeroProps) {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,60%,48%,0.06)] via-transparent to-[hsl(280,40%,92%,0.3)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Icon name="Users" size={15} />
                Для кого ПоДелам
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
                Для тех, кто чувствует, что способен на большее — но нет ясности, как это реализовать
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl lg:max-w-none">
                ПоДелам помогает собрать себя в систему: понять сильные стороны, найти свою модель роста и дохода — и двигаться увереннее без выгорания.
              </p>
              <button
                onClick={() => onNavigate(isLoggedIn ? "/cabinet" : "/auth")}
                className="gradient-brand text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
              >
                Пройти разбор
              </button>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground justify-center lg:justify-start">
                <div className="flex items-center gap-1.5"><Icon name="XCircle" size={14} className="text-muted-foreground" />Без абстрактной психологии</div>
                <div className="flex items-center gap-1.5"><Icon name="Target" size={14} className="text-primary" />Конкретные выводы</div>
                <div className="flex items-center gap-1.5"><Icon name="User" size={14} className="text-primary" />Под тебя, а не «для всех»</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/741564a6-c2d0-4428-b0e2-641da5b4bbc2.jpg"
                  alt="Пойми свои сильные стороны и выстрой свою модель"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* УЗНАЁШЬ СЕБЯ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Узнаёшь себя?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Ты чувствуешь, что способен на большее
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Дело не в усилиях — дело в том, что ты ещё не собрал себя в систему.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {recognizeCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <Icon name={card.icon} fallback="Circle" size={22} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-accent/40 border border-accent rounded-2xl p-5 text-center max-w-2xl mx-auto">
            <p className="text-foreground font-medium text-sm">
              👉 И в какой-то момент начинаешь <span className="font-bold text-primary">терять опору на себя</span> — хотя потенциал никуда не делся
            </p>
          </div>
        </div>
      </section>

      {/* CTA mid */}
      <section className="py-10 px-4 bg-gradient-to-r from-[hsl(252,60%,48%)] to-[hsl(280,60%,52%)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/90 text-base sm:text-lg font-medium mb-4">
            Если хоть один пункт откликнулся — разбор создан для тебя
          </p>
          <button
            onClick={() => onNavigate(isLoggedIn ? "/cabinet" : "/auth")}
            className="bg-white text-primary font-bold px-7 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            Пройти разбор
          </button>
        </div>
      </section>
    </>
  );
}
