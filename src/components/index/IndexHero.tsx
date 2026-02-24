import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/e85cccde-a68c-43c5-8e98-e53c3460428b.jpg";

const problems = [
  { emoji: "🔥", title: "Выгорание", text: "Работаешь много, а удовлетворения нет. Сил становится меньше, а смысла — ещё меньше." },
  { emoji: "🎭", title: "Не своё место", text: "Ощущение, что занимаешься не тем. Коллеги кажутся «на своём месте», а ты — нет." },
  { emoji: "🔄", title: "Бесконечный поиск", text: "Меняешь работу или пробуешь новое, но снова оказываешься в тупике через пару лет." },
];

const steps = [
  { num: "01", title: "Отвечаешь на вопросы", text: "Простые, но точные вопросы о твоих реакциях, ценностях и предпочтениях. 15–20 минут." },
  { num: "02", title: "Анализируем профиль", text: "Алгоритм строит твой психологический портрет и анализирует историю ответов." },
  { num: "03", title: "Получаешь рекомендации", text: "Конкретные направления деятельности, форматы работы и план первых шагов." },
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
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 mb-6 text-sm text-primary font-medium shadow-sm">
              <Icon name="Sparkles" size={14} />
              Психологическое ориентирование
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] text-foreground mb-5">
              Узнай, какое дело{" "}
              <span className="text-gradient">тебе подходит</span>{" "}
              и не приведёт к выгоранию
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              Платформа раскрывает твою внутреннюю мотивацию и предлагает конкретные направления для роста и дохода.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo("demo")}
                className="gradient-brand text-white font-bold px-7 py-4 rounded-2xl hover:opacity-90 transition-all hover:shadow-lg text-[15px]"
              >
                Пройти тест бесплатно
              </button>
              <button
                onClick={() => scrollTo("tools")}
                className="bg-white border border-border text-foreground font-semibold px-7 py-4 rounded-2xl hover:bg-secondary transition-colors text-[15px]"
              >
                Узнать свои ценности
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Icon name="Sparkles" size={14} className="text-primary" />Первый тест бесплатно</div>
              <div className="flex items-center gap-1.5"><Icon name="Clock" size={14} className="text-primary" />15–20 минут</div>
              <div className="flex items-center gap-1.5"><Icon name="Users" size={14} className="text-primary" />2 400+ прошли</div>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 gradient-brand rounded-3xl opacity-10 blur-3xl scale-110" />
            <img
              src={HERO_IMAGE}
              alt="Найди своё дело"
              className="relative w-full rounded-3xl shadow-2xl object-cover aspect-square glow-soft"
            />
            <div className="absolute -bottom-4 left-2 sm:-left-4 bg-white rounded-2xl shadow-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 border border-border">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Icon name="TrendingUp" size={18} className="text-green-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Нашли направление</div>
                <div className="font-bold text-sm text-foreground">87% пользователей</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-12 md:py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Проблема</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Узнаёшь себя?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p) => (
              <div key={p.title} className="bg-white rounded-3xl p-7 border border-border card-hover">
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[14px]">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-accent/40 border border-accent rounded-3xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-foreground font-medium">
              По данным исследований, <span className="font-bold text-primary">62% людей</span> работают не в той сфере, которая соответствует их природным ценностям
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Решение</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Как работает сервис</h2>
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
