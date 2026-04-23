import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Психологический анализ — узнай, кто ты есть на самом деле | ПоДелам",
  description:
    "Глубокий разбор личности: тип мышления, мотивация, риски выгорания. Пройди психологический анализ и узнай, в каких условиях тебе комфортно работать и жить.",
};

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const FEELINGS = [
  {
    icon: "Zap",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Ясность",
    text: "Ты больше не сомневаешься в себе. Понимаешь, почему одни задачи даются легко, а другие выматывают — и это нормально.",
  },
  {
    icon: "Heart",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    title: "Спокойствие",
    text: "Тревога «правильно ли я живу» уходит. Ты знаешь своё место — и оно тебе подходит.",
  },
  {
    icon: "Shield",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Уверенность",
    text: "Принимаешь решения без страха. Умеешь объяснить себе и другим, чего хочешь и почему.",
  },
  {
    icon: "TrendingUp",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Энергия",
    text: "Работа начинает приносить удовольствие, а не истощать. Ты в потоке — потому что занимаешься тем, что соответствует твоей природе.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "Brain",
    title: "Тип мышления",
    desc: "Аналитик, творец, практик или стратег — поймёшь, как работает твой ум и где это даёт результат.",
  },
  {
    icon: "Compass",
    title: "Личная мотивация",
    desc: "Что заставляет тебя двигаться вперёд: признание, свобода, безопасность или смысл. Больше не нужно угадывать.",
  },
  {
    icon: "BatteryLow",
    title: "Риски выгорания",
    desc: "Узнаешь, какие условия тебя истощают — чтобы вовремя выйти из зоны опасности.",
  },
  {
    icon: "Home",
    title: "Комфортная среда",
    desc: "Офис или удалёнка, команда или одиночество, структура или свобода — поймёшь, что даёт тебе энергию.",
  },
  {
    icon: "Target",
    title: "Профессиональный профиль",
    desc: "Конкретные направления работы, в которых твои особенности — это преимущество, а не помеха.",
  },
];

const STEPS = [
  { num: "01", title: "Отвечаешь честно", desc: "20 вопросов о себе. Нет правильных ответов — только твои ощущения." },
  { num: "02", title: "Алгоритм считает", desc: "Математическая модель строит твой психологический профиль по реальным данным." },
  { num: "03", title: "Получаешь отчёт", desc: "Подробный разбор личности с конкретными выводами и рекомендациями." },
  { num: "04", title: "Живёшь осознаннее", desc: "Понимаешь себя — и делаешь выборы, которые тебе подходят." },
];

const QUOTES = [
  {
    text: "Я наконец поняла, почему мне так тяжело давалась работа в большом коллективе. Оказывается, я интроверт-аналитик — и мне нужна тишина для лучшего результата.",
    name: "Мария, 34 года",
    role: "Сменила офис на удалённую работу",
  },
  {
    text: "Всегда думал, что ленюсь. Тест показал, что моя мотивация — смысл, а не деньги. Поменял направление и первый раз за 5 лет не считаю дни до пятницы.",
    name: "Дмитрий, 29 лет",
    role: "Перешёл в некоммерческий сектор",
  },
  {
    text: "Риск выгорания был на максимуме. Хорошо, что узнала об этом до того, как сломалась. Сократила нагрузку и наладила режим.",
    name: "Анна, 41 год",
    role: "Руководитель проектов",
  },
];

export default function PsychAnalysisLanding() {
  const navigate = useNavigate();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const isLoggedIn = !!localStorage.getItem("pdd_user");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} />

      {/* HERO */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
            <Icon name="Brain" size={14} />
            Психологический анализ
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
            Ты уже знаешь ответ.<br />
            <span className="text-primary">Просто не слышишь его.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7 sm:mb-8">
            Психологический анализ помогает разобраться в себе — без гаданий и советов «просто попробуй».
            Только твои настоящие черты, мотивы и ограничения. Честно и по делу.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/psych-bot")}
              className="gradient-brand text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:opacity-90 transition-opacity"
            >
              Пройти бесплатно
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
            >
              Все инструменты — 990 ₽/мес
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Без регистрации · Без AI-галлюцинаций · 20 минут</p>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">После анализа</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Как ты будешь себя чувствовать</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Это не просто тест. Это момент, когда многолетний туман рассеивается.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className={`rounded-3xl p-5 sm:p-6 border ${f.border} ${f.bg}`}>
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon name={f.icon} size={22} className={f.color} />
                </div>
                <h3 className="font-bold text-foreground text-[17px] mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-border rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Делаешь то, что «надо», но ощущения, что это твоё — нет.",
                "Устаёшь быстрее других и не понимаешь почему.",
                "Берёшься за всё, но не доводишь до конца.",
                "Кажется, что все вокруг знают, чего хотят — а ты нет.",
                "Боишься снова ошибиться с выбором работы или направления.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-rose-500" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Это не слабость характера. Это отсутствие знания о себе. Психологический анализ даёт это знание.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Результат</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что ты узнаешь о себе</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">И всё это — бесплатно</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Психологический анализ открыт для всех. Просто войди и ответь на вопросы.
                </p>
              </div>
              <button
                onClick={() => navigate("/psych-bot")}
                className="mt-6 bg-white text-indigo-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors w-full sm:w-auto"
              >
                Начать сейчас
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">4 шага до понимания себя</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-primary/20 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-indigo-50 border border-indigo-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Lock" size={20} className="text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-indigo-700 font-medium">Никакого AI при анализе ответов</p>
            <p className="text-xs text-indigo-500 mt-1">
              Только математические формулы и проверенные психологические модели. Один и тот же ответ — всегда один и тот же результат.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Что изменилось у других</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-indigo-100 mb-4" />
            <p className="text-foreground text-[15px] sm:text-[17px] leading-relaxed mb-6">
              «{QUOTES[quoteIdx].text}»
            </p>
            <div>
              <p className="font-bold text-foreground text-sm">{QUOTES[quoteIdx].name}</p>
              <p className="text-muted-foreground text-xs">{QUOTES[quoteIdx].role}</p>
            </div>
            <div className="flex gap-2 mt-5">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="gradient-brand rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Хватит гадать, кто ты есть.
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              20 минут — и ты будешь знать о себе больше, чем после лет самокопания.
              Честный анализ, конкретные выводы, без воды.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/psych-bot")}
                className="bg-white text-primary font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-indigo-50 transition-colors"
              >
                Пройти анализ бесплатно
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-white/25 transition-colors"
              >
                Все инструменты — 990 ₽/мес
              </button>
            </div>
            <p className="text-white/60 text-xs mt-5">
              Без кредитной карты · Результат сохранится в личном кабинете
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-sm text-muted-foreground">
              <InstallPWA />
              <a href="/pricing" className="hover:text-foreground transition-colors">Тарифы</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
              <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
              <a href="/partner" className="hover:text-foreground transition-colors">Партнёрская программа</a>
              <a
                href="https://t.me/AnnaUvaro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Icon name="Send" size={14} />
                Контакты
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-border/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-muted-foreground/60 text-center">
            <p>
              Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
              информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
              Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
              с <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-muted-foreground transition-colors">Офертой</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
