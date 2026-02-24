import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

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



const audience = [
  { emoji: "💼", title: "Ищут доп. доход", text: "Хотите монетизировать навыки или найти подработку, которая не будет в тягость" },
  { emoji: "😮‍💨", title: "Выгорели", text: "Устали от текущей работы и не знаете, куда двигаться дальше" },
  { emoji: "🔀", title: "Меняют сферу", text: "Готовы к переходу, но боитесь ошибиться и потерять время" },
];

const faqs = [
  { q: "Как работают тесты?", a: "Тесты основаны на психологических методиках (Голланд, MBTI-адаптации, анализ ценностей). Вы отвечаете на вопросы, система строит профиль и подбирает направления по алгоритму совместимости." },
  { q: "Сколько времени занимает прохождение?", a: "Один тест — 15–20 минут. Можно прерваться и продолжить позже — прогресс сохраняется." },
  { q: "Результаты точные?", a: "Точность зависит от честности ответов. Чем искреннее вы отвечаете, тем точнее рекомендации. Платформа не даёт универсальных ответов — она помогает увидеть ваши склонности." },
  { q: "Можно ли пройти тест повторно?", a: "Да, через 3–6 месяцев повторное прохождение покажет динамику изменений. В личном кабинете доступна функция сравнения результатов." },
  { q: "Как происходит оплата?", a: "Картой через безопасный платёжный шлюз. После оплаты тест сразу становится доступен в личном кабинете." },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "bg-white shadow-sm" : "bg-white/60"}`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-[15px] leading-snug">{q}</span>
        <span className={`shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <Icon name="Plus" size={20} className="text-primary" />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground text-[14px] leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("pdd_user");
  const [activeTest, setActiveTest] = useState<null | "склонности" | "психологический">(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const demoQuestions = [
    {
      text: "Когда ты помогаешь другому человеку решить его проблему, ты чувствуешь...",
      options: ["Настоящее удовольствие и энергию", "Удовлетворение, но это не главное", "Усталость, хотя понимаю важность", "Скорее раздражение, чем радость"],
    },
    {
      text: "В свободное время тебя больше всего привлекает...",
      options: ["Создавать что-то своими руками", "Читать, учиться, анализировать", "Общаться и придумывать идеи вместе", "Организовывать, выстраивать системы"],
    },
    {
      text: "Ты скорее предпочтёшь работу, где...",
      options: ["Каждый день разные задачи", "Чёткая структура и понятный результат", "Много контактов с людьми", "Можно работать самостоятельно и в тишине"],
    },
  ];

  const handleAnswer = (qi: number, ai: number) => {
    setAnswers({ ...answers, [qi]: ai });
    if (qi < demoQuestions.length - 1) {
      setTimeout(() => setStep(qi + 1), 300);
    } else {
      setStep(demoQuestions.length);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <button onClick={() => scrollTo("how")} className="hover:text-foreground transition-colors">Как работает</button>
            <button onClick={() => scrollTo("tools")} className="hover:text-foreground transition-colors">Инструменты</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">FAQ</button>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/cabinet")}
              className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Icon name="LayoutDashboard" size={15} />
              В кабинет
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Начать тест
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 mb-6 text-sm text-primary font-medium shadow-sm">
              <Icon name="Sparkles" size={14} />
              Психологическое ориентирование
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.15] text-foreground mb-5">
              Узнай, какое дело{" "}
              <span className="text-gradient">тебе подходит</span>{" "}
              и не приведёт к выгоранию
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              Платформа анализирует твои психологические склонности и предлагает конкретные направления для роста и дохода.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo("demo")}
                className="gradient-brand text-white font-bold px-7 py-4 rounded-2xl hover:opacity-90 transition-all hover:shadow-lg text-[15px]"
              >
                Пройти тест — 299 ₽
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="bg-white border border-border text-foreground font-semibold px-7 py-4 rounded-2xl hover:bg-secondary transition-colors text-[15px]"
              >
                Узнать своё предназначение
              </button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Icon name="Shield" size={14} className="text-primary" />Гарантия возврата</div>
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
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-border">
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
      <section className="py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-6">
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
              По данным исследований, <span className="font-bold text-primary">62% людей</span> работают не в той сфере, которая соответствует их природным склонностям.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
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

      {/* DEMO TEST */}
      <section id="demo" className="py-20 bg-white/60">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Демо</p>
            <h2 className="text-3xl font-black text-foreground">Попробуй прямо сейчас</h2>
            <p className="text-muted-foreground mt-2">Три вопроса из настоящего теста</p>
          </div>

          <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
            {step < demoQuestions.length ? (
              <div className="animate-fade-in-up" key={step}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted-foreground">Вопрос {step + 1} из {demoQuestions.length}</span>
                  <div className="flex gap-1.5">
                    {demoQuestions.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-8 gradient-brand" : "w-4 bg-secondary"}`} />
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-6 leading-snug">{demoQuestions[step].text}</h3>
                <div className="space-y-3">
                  {demoQuestions[step].options.map((opt, ai) => (
                    <button
                      key={ai}
                      onClick={() => handleAnswer(step, ai)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border text-[14px] font-medium transition-all duration-200 ${
                        answers[step] === ai
                          ? "border-primary bg-accent text-primary"
                          : "border-border bg-secondary/30 text-foreground hover:border-primary/40 hover:bg-secondary"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center animate-scale-in">
                <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon name="CheckCircle" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">Отлично!</h3>
                <p className="text-muted-foreground mb-2">На основе твоих ответов видно склонность к</p>
                <div className="gradient-brand text-white font-bold text-lg rounded-2xl px-6 py-3 inline-block mb-5">
                  🎨 Творческой и коммуникативной деятельности
                </div>
                <p className="text-muted-foreground text-sm mb-8">Полный тест даст точный профиль из 40+ вопросов и конкретные рекомендации</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/auth")}
                    className="gradient-brand text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    Получить полный результат
                  </button>
                  <button
                    onClick={() => { setStep(0); setAnswers({}); }}
                    className="border border-border text-foreground font-medium px-6 py-3.5 rounded-2xl hover:bg-secondary transition-colors text-sm"
                  >
                    Пройти снова
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Инструменты</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">6 инструментов для поиска себя</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Каждый помогает разобраться в себе с разных сторон — от склонностей до конкретного плана действий</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "Brain", color: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100", name: "Психологический анализ", desc: "Глубокий разбор твоей личности: тип мышления, мотивация, риски выгорания. Помогает понять, в каких условиях тебе комфортно работать" },
              { icon: "ShieldAlert", color: "bg-rose-50", iconColor: "text-rose-600", border: "border-rose-100", name: "Барьеры и тревога", desc: "Выявляет страхи, синдром самозванца и прокрастинацию. Показывает, что именно мешает двигаться вперёд и как с этим работать" },
              { icon: "Banknote", color: "bg-green-50", iconColor: "text-green-600", border: "border-green-100", name: "Подбор дохода", desc: "Анализирует навыки и предпочтения, подбирает подходящие варианты заработка — от фриланса до своего дела" },
              { icon: "Map", color: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100", name: "Шаги развития", desc: "Составляет персональный план на 3 месяца с конкретными шагами — от первых действий до результата" },
              { icon: "BarChart3", color: "bg-blue-50", iconColor: "text-blue-600", border: "border-blue-100", name: "Прогресс развития", desc: "Отслеживает динамику твоего состояния: энергия, мотивация, удовлетворённость. Видна реальная картина изменений" },
              { icon: "BookOpen", color: "bg-violet-50", iconColor: "text-violet-600", border: "border-violet-100", name: "Дневник самоанализа", desc: "Пространство для рефлексии и фиксации мыслей. ИИ помогает находить паттерны и делать выводы" },
            ].map((tool) => (
              <div key={tool.name} className={`rounded-3xl p-6 border ${tool.border} ${tool.color} card-hover`}>
                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon name={tool.icon} size={22} className={tool.iconColor} />
                </div>
                <h3 className="font-bold text-foreground text-[17px] mb-2">{tool.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/auth")}
              className="gradient-brand text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-[15px]"
            >
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Кому подойдёт</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audience.map((a) => (
              <div key={a.title} className="flex gap-4 bg-white rounded-3xl p-6 border border-border card-hover">
                <div className="text-3xl shrink-0">{a.emoji}</div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Доверие</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Почему нам доверяют</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "BookOpen", title: "Научная методология", text: "Тесты основаны на валидированных методиках: теория типов Голланда, анализ мотивационных профилей и модели ценностей Шварца" },
              { icon: "BarChart3", title: "Адаптивный алгоритм", text: "Система учитывает историю ответов и адаптирует рекомендации на основе паттернов — чем больше данных, тем точнее результат" },
              { icon: "RefreshCw", title: "Гарантия возврата", text: "Если результаты окажутся для вас нерелевантными, вернём деньги в течение 7 дней без лишних вопросов" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-7 border border-border card-hover text-center">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                  <Icon name={item.icon as "BookOpen"} size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white/60">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-brand rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Начни с одного шага</h2>
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                15 минут сегодня могут изменить направление на годы вперёд
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("demo")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
                >
                  Попробовать бесплатно
                </button>
                <button
                  onClick={() => scrollTo("tariffs")}
                  className="border border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-[15px]"
                >
                  Смотреть тарифы
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={14} className="text-white" />
            </div>
            <span className="font-bold text-foreground">ПоДелам</span>
          </div>
          <div className="text-center text-sm text-muted-foreground space-y-0.5">
            <p>© 2025 ПоДелам. Найди своё дело.</p>
            <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <InstallPWA />
            <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
          </div>
        </div>
      </footer>
    </div>
  );
}