import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import LandingFooter from "@/components/landing/LandingFooter";

const tools = [
  {
    icon: "Brain",
    title: "Тест профориентации",
    desc: "Выявляет ваши глубинные склонности и таланты",
    href: "/career-test",
  },
  {
    icon: "BarChart2",
    title: "Психологический анализ",
    desc: "Понимание внутренних паттернов и установок",
    href: "/psych-analysis-info",
  },
  {
    icon: "Shield",
    title: "Работа с барьерами",
    desc: "Инструмент для преодоления ментальных блоков",
    href: "/barrier-info",
  },
  {
    icon: "TrendingUp",
    title: "Доход и мышление",
    desc: "Финансовое мышление для роста",
    href: "/financial-thinking-info",
  },
  {
    icon: "Target",
    title: "Стратегическое мышление",
    desc: "Принятие решений на уровне стратегии",
    href: "/strategic-thinking-info",
  },
  {
    icon: "Layers",
    title: "Pro-тренажёры",
    desc: "Комплексная работа над собой и бизнесом",
    href: "/pro-trainers",
  },
];

const values = [
  {
    num: "01",
    title: "Запрос",
    desc: "Формулируем, что происходит и что важно изменить.",
  },
  {
    num: "02",
    title: "Исследование",
    desc: "Изучаем паттерны, выборы и то, что за ними стоит.",
  },
  {
    num: "03",
    title: "Устойчивость",
    desc: "Новая внутренняя опора, которая остаётся после завершения работы.",
  },
];

export default function About() {
  const navigate = useNavigate();
  const scrollTo = () => {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IndexNav isLoggedIn={false} scrollTo={scrollTo} useHashNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,60%,48%,0.06)] via-background to-[hsl(280,40%,92%,0.3)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                <Icon name="Sparkles" size={14} />
                14 лет частной практики
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Анна<br />
                <span className="text-gradient">Уварова</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Бизнес-психолог для собственников и руководителей
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Индивидуальная работа на уровне стратегических решений. Помогаю принимать сложные решения, проходить личные и профессиональные кризисы — чтобы масштабировать бизнес без потери себя.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://t.me/AnnaUvaro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Icon name="Send" size={16} />
                  Запросить установочную встречу
                </a>
                <button
                  onClick={() => navigate("/career-test")}
                  className="bg-secondary text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Play" size={16} />
                  Начать с теста
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-300/30 blur-2xl scale-110" />
                <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/bucket/0da5595a-ef3f-4b1f-aa56-c8f64709ef74.jpg"
                    alt="Анна Уварова — бизнес-психолог"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote / Mission */}
      <section className="bg-primary py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Icon name="Quote" size={32} className="text-white/40 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-semibold text-white leading-relaxed mb-6">
            «Личность. Семья. Наследие. Три измерения, которые определяют, какой бизнес вы строите — и кем становитесь в этом процессе.»
          </blockquote>
          <p className="text-white/70 text-lg">— Анна Уварова</p>
        </div>
      </section>

      {/* When scale grows */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                Когда растёт масштаб —<br />
                <span className="text-gradient">растёт внутренняя нагрузка</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Собственники и руководители чаще всего остаются один на один со своими сомнениями, усталостью и страхом ошибиться. Снаружи — всё под контролем. Внутри — нарастает тяжесть.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Я создала ПоДелам именно для этого: чтобы у вас был инструмент самопознания и поддержки — доступный в любой момент, без осуждения, без лишних слов. Тесты, тренажёры и боты на платформе — это не просто упражнения. Это путь к себе, выстроенный по той же логике, что и моя работа с клиентами.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "Anchor", label: "Внутренняя опора" },
                { icon: "Eye", label: "Ясность" },
                { icon: "Wind", label: "Спокойствие" },
                { icon: "Compass", label: "Стратегическое видение" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Icon name={item.icon} size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">О подходе</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Работаю в экзистенциально-гуманистическом подходе. Это внимание к смыслам, выборам и ответственности — а не к симптомам или техникам быстрого исправления.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-14">
            {[
              "Экзистенциально-гуманистический подход",
              "Психология лидерства",
              "Зрелость управленческой позиции",
              "Устойчивость при высоких ставках",
            ].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm"
              >
                <div className="w-8 h-1 rounded-full gradient-brand mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.num} className="bg-white rounded-2xl border border-border p-7 shadow-sm">
                <div className="text-4xl font-bold text-primary/20 mb-4">{v.num}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What I work with */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">С какими задачами работаю</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Стратегические решения",
              "Пересборка роли",
              "Поведенческие паттерны",
              "Ментальные барьеры",
              "Коммуникации",
              "Эмоциональная устойчивость",
              "Кризисы роста",
              "Управленческая усталость",
              "Поиск смыслов",
            ].map((tag) => (
              <span
                key={tag}
                className="bg-primary/8 text-primary font-medium px-4 py-2 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ПоДелам connection */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <Icon name="Compass" size={14} />
              Платформа ПоДелам
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Инструменты, которые я создала<br />
              <span className="text-gradient">специально для вас</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ПоДелам — это цифровое продолжение моей практики. Каждый инструмент построен на тех же принципах, что и индивидуальная работа: честность, глубина, уважение к вашему темпу.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-12">
            {tools.map((tool) => (
              <button
                key={tool.title}
                onClick={() => navigate(tool.href)}
                className="group bg-white rounded-2xl border border-border p-6 text-left shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon name={tool.icon} size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium">
                  Узнать подробнее <Icon name="ArrowRight" size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
            Моя миссия и философия
          </h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              Я убеждена: устойчивый бизнес строится устойчивым человеком. Не тем, кто не устаёт — а тем, кто умеет восстанавливаться. Не тем, кто всегда прав — а тем, кто умеет принимать сложные решения, оставаясь собой.
            </p>
            <p>
              За 14 лет практики я работала с сотнями собственников и руководителей. Снова и снова я видела одно: внешний успех может расти, а внутренняя пустота — тоже. Моя задача — помочь вам двигаться в обе стороны одновременно.
            </p>
            <p>
              ПоДелам — это не просто набор тестов. Это пространство, где вы можете честно встретиться с собой: с вашими страхами, желаниями, выборами. И сделать следующий шаг — осознанно.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Готовы начать?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Начните с бесплатного теста на платформе — или запросите личную встречу.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/AnnaUvaro"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Send" size={16} />
              Запросить встречу
            </a>
            <button
              onClick={() => navigate("/career-test")}
              className="bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Sparkles" size={16} />
              Пройти тест бесплатно
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}