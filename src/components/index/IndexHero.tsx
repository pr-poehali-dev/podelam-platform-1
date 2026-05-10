import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/8bbeea67-de00-46a1-adbc-96a5a0544a98.jpg";

const recognitions = [
  { icon: "Layers", color: "text-indigo-500", bg: "bg-indigo-50", title: "Есть потенциал, нет структуры", text: "Чувствуешь, что можешь больше — но сложно собраться и выстроить понятный путь. Много идей, мало движения." },
  { icon: "GitBranch", color: "text-rose-500", bg: "bg-rose-50", title: "Сомнения и расфокус", text: "Постоянно сомневаешься в выборе. Распыляешься между направлениями и не можешь сосредоточиться на одном." },
  { icon: "BatteryLow", color: "text-orange-500", bg: "bg-orange-50", title: "Энергия уходит — опоры нет", text: "Быстро теряешь ресурс. Хочется большего, но непонятно куда двигаться — и постепенно теряешь опору на себя." },
];

const steps = [
  { num: "01", title: "Отвечаешь на вопросы", text: "О своих реакциях, привычных сценариях и способах принятия решений. Без правильных и неправильных ответов." },
  { num: "02", title: "Система анализирует паттерны", text: "Разбирает твоё мышление, сильные стороны и поведенческие паттерны — без абстрактной психологии." },
  { num: "03", title: "Получаешь персональный разбор", text: "Понимание себя, своего стиля роста и модели дохода — с конкретными рекомендациями под тебя." },
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
              Персональный разбор твоего мышления и сильных сторон
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] text-foreground mb-5">
              Пойми свои сильные стороны{" "}
              <span className="text-gradient">и выстрой свою модель роста и дохода</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Персональный разбор твоего мышления, сильных сторон и внутренних паттернов — чтобы двигаться увереннее, зарабатывать легче и не выгорать
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => scrollTo("demo")}
                className="gradient-brand text-white font-bold px-7 py-4 rounded-2xl hover:opacity-90 transition-all hover:shadow-lg text-[15px]"
              >
                Пройти разбор
              </button>
              <button
                onClick={() => scrollTo("tools")}
                className="bg-white border border-border text-foreground font-semibold px-7 py-4 rounded-2xl hover:bg-secondary transition-colors text-[15px]"
              >
                Как это работает
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Icon name="XCircle" size={14} className="text-muted-foreground" />Без абстрактной психологии</div>
              <div className="flex items-center gap-1.5"><Icon name="Target" size={14} className="text-primary" />Конкретные выводы</div>
              <div className="flex items-center gap-1.5"><Icon name="User" size={14} className="text-primary" />Под тебя, а не «для всех»</div>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 gradient-brand rounded-3xl opacity-10 blur-3xl scale-110" />
            <img
              src={HERO_IMAGE}
              alt="Пойми свои сильные стороны и выстрой модель дохода"
              className="relative w-full rounded-3xl shadow-2xl object-cover aspect-square glow-soft"
            />
            <div className="absolute -bottom-4 left-2 sm:-left-4 bg-white rounded-2xl shadow-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 border border-border">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Icon name="TrendingUp" size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Получили ясность и почувствовали разницу</div>
                <div className="font-bold text-sm text-foreground">87% пользователей</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECOGNITION */}
      <section className="py-12 md:py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Узнаёшь себя?</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Ты чувствуешь, что способен на большее — но нет ясности, как это реализовать</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              Скорее всего, дело не в усилиях. А в том, что ты ещё не собрал себя в систему.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recognitions.map((p) => (
              <div key={p.title} className="bg-white rounded-3xl p-7 border border-border card-hover">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${p.bg} mb-5`}>
                  <Icon name={p.icon as Parameters<typeof Icon>[0]["name"]} size={24} className={p.color} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[14px]">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-accent/40 border border-accent rounded-3xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-foreground font-medium">
              👉 И в какой-то момент начинаешь <span className="font-bold text-primary">терять опору на себя</span> — хотя потенциал никуда не делся
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Суть проблемы</p>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">Проблема не в тебе</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Большинство людей не реализуют свой потенциал не потому, что недостаточно стараются.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "Eye", text: "Не понимают свои сильные стороны" },
                  { icon: "Copy", text: "Пытаются жить «как правильно», а не «как подходит им»" },
                  { icon: "Settings", text: "Выбирают неподходящий формат работы и нагрузки" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-primary" />
                    </div>
                    <p className="text-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-rose-50 border border-rose-100 rounded-2xl p-5">
                <p className="text-foreground font-medium text-sm">
                  👉 В результате — <span className="font-bold text-rose-600">хаос, перегруз и постоянные сомнения</span>. Хотя выход есть.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-border p-8">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-5">Решение</p>
              <h3 className="text-2xl font-black text-foreground mb-4">ПоДелам помогает собрать себя в систему</h3>
              <p className="text-muted-foreground mb-6">Разбор покажет:</p>
              <div className="space-y-3">
                {[
                  "В чём твои сильные стороны",
                  "Как ты принимаешь решения",
                  "Где ты теряешь энергию",
                  "Какой формат реализации тебе подходит",
                  "Как расти и зарабатывать без постоянного напряжения",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center shrink-0">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                    <p className="text-foreground text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-12 md:py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Как проходит разбор</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Три шага — и ты видишь себя по-новому</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Никакой абстрактной психологии. Только конкретные выводы и рекомендации под тебя.
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
