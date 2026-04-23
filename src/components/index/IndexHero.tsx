import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/8bbeea67-de00-46a1-adbc-96a5a0544a98.jpg";

const problems = [
  { icon: "EyeOff", color: "text-orange-500", bg: "bg-orange-50", title: "Успех ≠ должность", text: "Ты думаешь об успехе через то, кем работаешь и чем занимаешься. Но это лишь поверхность. Настоящее — глубже." },
  { icon: "HeartCrack", color: "text-rose-500", bg: "bg-rose-50", title: "Тело и чувства знают", text: "Усталость без причины, тревога по утрам, ощущение пустоты после «хорошего» дня — это сигналы. Их важно услышать." },
  { icon: "Compass", color: "text-indigo-500", bg: "bg-indigo-50", title: "Что-то мешает", text: "Страхи, чужие ожидания, старые убеждения — всё это работает тихо, но мощно. И именно это держит тебя там, где ты есть." },
];

const steps = [
  { num: "01", title: "Пройди тест", text: "Честные вопросы о твоих реакциях, ощущениях и ценностях. Без правильных ответов. 15–20 минут." },
  { num: "02", title: "Увидишь картину", text: "Алгоритм покажет, что действительно движет тобой: твои ценности, барьеры, скрытые ресурсы." },
  { num: "03", title: "Разберись и действуй", text: "Конкретные шаги — что менять, куда двигаться и как убрать то, что мешает настоящему успеху." },
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
              Что на самом деле мешает тебе стать успешным
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] text-foreground mb-5">
              Успех — это не профессия{" "}
              <span className="text-gradient">Это ощущение внутри</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Ты мыслишь об успехе через работу и должность — но суть глубже. Пройди тест и мы поможем разобраться: что ты чувствуешь на самом деле и что именно держит тебя на месте.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
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
                Как мы помогаем
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
              alt="Найди своё дело"
              className="relative w-full rounded-3xl shadow-2xl object-cover aspect-square glow-soft"
            />
            <div className="absolute -bottom-4 left-2 sm:-left-4 bg-white rounded-2xl shadow-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 border border-border">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Icon name="TrendingUp" size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Нашли своё — и почувствовали разницу</div>
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
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Узнаёшь себя?</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">То, что ты чувствуешь — не случайно</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg leading-relaxed">
              Это не лень и не слабость. Это сигналы о том, что ты живёшь не в согласии с собой.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p) => (
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
              <span className="font-bold text-primary">78% людей</span> не осознают, что именно мешает им быть счастливыми и успешными — пока не начинают разбираться
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Три шага к ясности</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Не советы из интернета. Не мотивационные цитаты. Реальный разбор — твоего конкретного случая.
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