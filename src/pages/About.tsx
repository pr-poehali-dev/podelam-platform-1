import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import LandingFooter from "@/components/landing/LandingFooter";
import func2url from "../../backend/func2url.json";

const tools = [
  {
    icon: "Brain",
    title: "Тест профориентации",
    desc: "Узнайте свои сильные стороны и скрытые таланты",
    href: "/career-test",
  },
  {
    icon: "BarChart2",
    title: "Психологический анализ",
    desc: "Поймите свои внутренние паттерны и установки",
    href: "/psych-analysis-info",
  },
  {
    icon: "Shield",
    title: "Работа с барьерами",
    desc: "Освободитесь от ментальных блоков, которые тормозят",
    href: "/barrier-info",
  },
  {
    icon: "TrendingUp",
    title: "Финансовое мышление",
    desc: "Выстройте здоровые отношения с деньгами и ростом",
    href: "/financial-thinking-info",
  },
  {
    icon: "Target",
    title: "Стратегическое мышление",
    desc: "Принимайте решения с ясной головой и уверенностью",
    href: "/strategic-thinking-info",
  },
  {
    icon: "Crown",
    title: "Pro-тренажёры",
    desc: "Глубокая работа над собой: эмоции, самооценка, смыслы",
    href: "/pro-trainers",
  },
];

export default function About() {
  const navigate = useNavigate();
  const scrollTo = () => {};

  const [form, setForm] = useState({ name: "", contact: "", message: "", agreed: false });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(func2url["feedback"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("ok");
        setForm({ name: "", contact: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IndexNav isLoggedIn={false} scrollTo={scrollTo} useHashNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-50 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                <Icon name="Sparkles" size={14} />
                Автор платформы ПоДелам
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Анна<br />
                <span className="text-gradient">Уварова</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Бизнес-психолог · 14 лет частной практики
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Я создала ПоДелам, чтобы каждый мог работать над собой в своём темпе — без осуждения, без давления, в любое время. Инструменты платформы построены на тех же принципах, что и моя профессиональная практика.
              </p>
              <button
                onClick={() => navigate("/career-test")}
                className="gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Icon name="Play" size={16} />
                Начать с бесплатного теста
              </button>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-300/30 blur-2xl scale-110" />
                <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/bucket/0da5595a-ef3f-4b1f-aa56-c8f64709ef74.jpg"
                    alt="Анна Уварова"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-primary py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Icon name="Quote" size={28} className="text-white/30 mx-auto mb-5" />
          <blockquote className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
            «Устойчивый бизнес строится устойчивым человеком. Который умеет восстанавливаться и принимать решения, оставаясь собой.»
          </blockquote>
        </div>
      </section>

      {/* Why created */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                Почему я создала<br />
                <span className="text-gradient">эту платформу</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  За годы работы я видела одно и то же: люди, которые достигают многого снаружи, нередко чувствуют пустоту или усталость внутри. Им не хватает не знаний — а пространства, где можно честно встретиться с собой.
                </p>
                <p>
                  ПоДелам — это такое пространство. Здесь вы можете разобраться в своих ценностях, страхах, паттернах и сделать следующий шаг осознанно. Без спешки, без осуждения.
                </p>
                <p>
                  Все инструменты открыты для любого, кто хочет больше понять себя — будь вы предприниматель, специалист или просто человек в поиске своего пути.
                </p>
              </div>
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
                  className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center gap-3 text-center shadow-sm"
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
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Подход к работе</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Работаю в экзистенциально-гуманистическом подходе — внимание к смыслам, выборам и ответственности, а не к симптомам или техникам быстрого исправления.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "BookOpen", text: "Экзистенциально-гуманистический подход" },
              { icon: "Users", text: "Психология лидерства" },
              { icon: "Star", text: "Зрелость управленческой позиции" },
              { icon: "Flame", text: "Устойчивость при высоких ставках" },
            ].map((item) => (
              <div key={item.text} className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm">
                <Icon name={item.icon} size={22} className="text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-5">
              <Icon name="Compass" size={14} />
              Инструменты платформы
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              С чего начать?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Каждый инструмент — это шаг к лучшему пониманию себя. Выберите любой, который откликается прямо сейчас.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
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
                  Подробнее <Icon name="ArrowRight" size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback form */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-purple-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Есть пожелание или запрос?
            </h2>
            <p className="text-muted-foreground text-lg">
              Напишите — я читаю всё лично. Ваши идеи помогают делать платформу лучше.
            </p>
          </div>

          {status === "ok" ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="Check" size={26} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Сообщение отправлено</h3>
              <p className="text-muted-foreground">Спасибо! Я прочту и учту ваши слова.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Как вас зовут?</label>
                <input
                  type="text"
                  placeholder="Необязательно"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Контакт для ответа</label>
                <input
                  type="text"
                  placeholder="Email, Telegram или другой — необязательно"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Ваш запрос или пожелание <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Что хотели бы видеть на платформе? Какой инструмент нужен? Что откликается или не откликается?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background resize-none"
                />
              </div>
              <div className="flex items-start gap-3">
                <input
                  id="agreed"
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agreed" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  Я принимаю{" "}
                  <a href="/privacy" target="_blank" className="text-primary underline hover:opacity-80 transition-opacity">Политику конфиденциальности</a>
                  {" "}и{" "}
                  <a href="/oferta" target="_blank" className="text-primary underline hover:opacity-80 transition-opacity">Оферту</a>
                </label>
              </div>
              {status === "error" && (
                <p className="text-sm text-destructive">Что-то пошло не так. Попробуйте позже.</p>
              )}
              <button
                type="submit"
                disabled={status === "loading" || !form.message.trim() || !form.agreed}
                className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <><Icon name="Loader2" size={16} className="animate-spin" /> Отправляю...</>
                ) : (
                  <><Icon name="Send" size={16} /> Отправить</>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}