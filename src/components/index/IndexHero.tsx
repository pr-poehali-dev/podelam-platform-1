import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/8bbeea67-de00-46a1-adbc-96a5a0544a98.jpg";

const pains = [
  { icon: "Zap", color: "text-orange-500", bg: "bg-orange-50", title: "Прокрастинация", text: "Откладываешь важное снова и снова. Понимаешь, что надо, но не можешь начать — и злишься на себя." },
  { icon: "BatteryLow", color: "text-rose-500", bg: "bg-rose-50", title: "Выгорание", text: "Работаешь, стараешься — но энергии нет. Хочется просто лечь и не вставать. Это не лень, это сигнал." },
  { icon: "TrendingDown", color: "text-indigo-500", bg: "bg-indigo-50", title: "Деньги не растут", text: "Усилия есть, а дохода — нет. Чувствуешь, что работаешь много, а финансово топчешься на месте." },
];

const steps = [
  { num: "01", title: "Находим твои блоки", text: "Что именно тормозит тебя: страх, перегруз, хаос или расфокус. Без догадок — только точный анализ." },
  { num: "02", title: "Определяем модель дохода", text: "Какой способ заработка подходит именно тебе, исходя из твоего типа личности и энергетики." },
  { num: "03", title: "Даём конкретные шаги", text: "Не советы из интернета — персональный план: что делать, что убрать, куда двигаться." },
];

interface IndexHeroProps {
  scrollTo: (id: string) => void;
}

export default function IndexHero({ scrollTo }: IndexHeroProps) {
  return (
    <>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 md:pt-24 md:pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 mb-6 text-sm text-primary font-medium shadow-sm">
              <Icon name="Sparkles" size={14} />
              Ты не ленивый — тебе просто не подходит текущая модель
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] text-foreground mb-5">
              Почему ты застрял{" "}
              <span className="text-gradient">и как зарабатывать без выгорания</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Пройди тест и получи разбор своих внутренних блоков и персональную модель дохода
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => scrollTo("demo")}
                className="gradient-brand text-white font-bold px-7 py-4 rounded-2xl hover:opacity-90 transition-all hover:shadow-lg text-[15px]"
              >
                Узнать свою модель дохода
              </button>
              <button
                onClick={() => scrollTo("tools")}
                className="bg-white border border-border text-foreground font-semibold px-7 py-4 rounded-2xl hover:bg-secondary transition-colors text-[15px]"
              >
                Как это работает
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Icon name="Sparkles" size={14} className="text-primary" />Первый тест бесплатно</div>
              <div className="flex items-center gap-1.5"><Icon name="Clock" size={14} className="text-primary" />15–20 минут</div>
              <div className="flex items-center gap-1.5"><Icon name="Users" size={14} className="text-primary" />2 400+ прошли</div>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 gradient-brand rounded-3xl opacity-10 blur-3xl scale-110" />
            <img
              src={HERO_IMAGE}
              alt="Найди свою модель дохода"
              className="relative w-full rounded-3xl shadow-2xl object-cover aspect-square glow-soft"
            />
            <div className="absolute -bottom-4 left-2 sm:-left-4 bg-white rounded-2xl shadow-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 border border-border">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Icon name="TrendingUp" size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Нашли свою модель и почувствовали разницу</div>
                <div className="font-bold text-sm text-foreground">87% пользователей</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="py-12 md:py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Узнаёшь себя?</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Ты вроде стараешься, но...</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg leading-relaxed">
              Это не слабость и не лень. Так работает несовпадение между тобой и моделью, в которой ты сейчас живёшь.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pains.map((p) => (
              <div key={p.title} className="bg-white rounded-3xl p-7 border border-border card-hover">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${p.bg} mb-5`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Icon name={p.icon as any} size={24} className={p.color} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[14px]">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-accent/40 border border-accent rounded-3xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-foreground font-medium">
              <span className="font-bold text-primary">78% людей</span> не осознают свои внутренние блоки — и продолжают топтаться на месте, думая, что проблема в них самих
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Из хаоса — в понятную систему</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Не мотивашки и не советы. Разбор твоего конкретного случая — что тормозит и как зарабатывать именно тебе.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="text-7xl font-black text-gradient opacity-20 absolute -top-4 -left-2 leading-none select-none">{s.num}</div>
                <div className="relative pt-8">
                  <h3 className="font-bold text-xl text-foreground mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
                {s.num !== "03" && (
                  <div className="hidden md:block absolute top-12 -right-4 text-border">
                    <Icon name="ArrowRight" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
