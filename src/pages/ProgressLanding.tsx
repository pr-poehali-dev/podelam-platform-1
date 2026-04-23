import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Прогресс развития — отслеживай своё состояние | ПоДелам",
  description:
    "Отслеживает динамику твоего состояния: энергия, мотивация, удовлетворённость. Видна реальная картина изменений — а не ощущения, которые меняются каждый день.",
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
    icon: "BarChart3",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "Объективность",
    text: "Перестаёшь оценивать себя по настроению сегодняшнего дня. Видишь реальную динамику за недели.",
  },
  {
    icon: "TrendingUp",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
    title: "Рост",
    text: "Замечаешь прогресс, который раньше был невидим. Маленькие изменения накапливаются — и это заметно.",
  },
  {
    icon: "Lightbulb",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Понимание",
    text: "Видишь паттерны: когда падает энергия, что влияет на мотивацию и откуда берётся удовлетворённость.",
  },
  {
    icon: "Shield",
    color: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Контроль",
    text: "Знаешь своё состояние — значит, можешь на него влиять. А не просто реагировать, когда уже плохо.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "Zap",
    title: "Уровень энергии",
    desc: "Как меняется твой ресурс: когда ты на подъёме, когда на спаде и что на это влияет.",
  },
  {
    icon: "Flame",
    title: "Мотивация",
    desc: "Динамика внутреннего драйва. Растёт, падает или стоит на месте — видно чётко и честно.",
  },
  {
    icon: "Heart",
    title: "Удовлетворённость",
    desc: "Насколько ты доволен жизнью и работой прямо сейчас. Не «в целом», а в измеримых показателях.",
  },
  {
    icon: "Activity",
    title: "Динамика за период",
    desc: "График изменений по неделям. Видишь тренд — а не застываешь в ощущении одного плохого дня.",
  },
  {
    icon: "AlertCircle",
    title: "Зоны риска",
    desc: "Если что-то стабильно падает — система это выделяет. Лучше знать заранее, чем пропустить.",
  },
];

const STEPS = [
  { num: "01", title: "Заходишь раз в неделю", desc: "5–7 минут на короткий опросник о своём состоянии. Без лишних усилий." },
  { num: "02", title: "Отвечаешь честно", desc: "Никаких правильных ответов. Только твои реальные ощущения прямо сейчас." },
  { num: "03", title: "Видишь динамику", desc: "После нескольких отметок появляется график. Паттерны становятся видны." },
  { num: "04", title: "Принимаешь решения", desc: "Знаешь, когда нужно притормозить, а когда — давить на газ. Данные есть." },
];

const QUOTES = [
  {
    text: "Я думала, что ничего не меняется. Потом посмотрела на график за 6 недель — и увидела, что энергия выросла почти в два раза. Просто я этого не замечала изнутри.",
    name: "Ольга, 36 лет",
    role: "Менеджер, работает над выгоранием",
  },
  {
    text: "Оказалось, что каждый понедельник у меня провал мотивации. Это не случайность — это паттерн. Как только увидел — смог с этим работать.",
    name: "Михаил, 30 лет",
    role: "Фрилансер",
  },
  {
    text: "Раньше я оценивала прогресс по настроению. Это плохой инструмент. Теперь есть цифры — и они честнее.",
    name: "Виктория, 44 года",
    role: "Руководитель отдела",
  },
];

export default function ProgressLanding() {
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
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />

      {/* HERO */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="BarChart3" size={14} />
                Прогресс развития
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Ты меняешься<br />
                <span className="text-blue-600">Просто не видишь этого</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Настроение врёт — данные нет. Прогресс развития отслеживает твою энергию, мотивацию и удовлетворённость
                в динамике. Видишь реальную картину — а не ощущение одного плохого дня.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/progress")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Начать отслеживать — 290 ₽
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Все инструменты — 990 ₽/мес
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">290 ₽ · 5 минут в неделю · Результат виден через 3–4 отметки</p>
            </div>
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/a31f2cc0-27f6-4636-be9d-ae8f3c00560b.jpg"
                  alt="Отслеживание прогресса"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Что даёт трекинг</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Когда видишь себя в динамике</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Данные меняют угол зрения. Ты перестаёшь оценивать себя по худшему дню и начинаешь видеть тренд.
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
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Кажется, что ничего не меняется — хотя ты точно что-то делаешь.",
                "Один плохой день — и кажется, что весь прогресс куда-то исчез.",
                "Не понимаешь, когда у тебя обычно больше сил, а когда лучше отдохнуть.",
                "Выгораешь — но замечаешь это слишком поздно, когда уже тяжело.",
                "Хочешь видеть рост — но нет инструмента, который бы его фиксировал.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-blue-700" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Без регулярного трекинга ты управляешь собой вслепую. 5 минут в неделю — и картина становится ясной.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Что отслеживается</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Твои показатели под контролем</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Данные честнее ощущений</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Ощущения субъективны и меняются каждый час. График за 6 недель — нет.
                </p>
              </div>
              <button
                onClick={() => navigate("/progress")}
                className="mt-6 bg-white text-blue-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors w-full sm:w-auto"
              >
                Начать отслеживать
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Просто и без лишних усилий</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-blue-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-blue-50 border border-blue-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Clock" size={20} className="text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-blue-700 font-medium">5 минут в неделю — и динамика видна</p>
            <p className="text-xs text-blue-500 mt-1">
              Первые паттерны появляются после 3–4 отметок. Полная картина складывается за 6–8 недель.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Что увидели другие</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-blue-100 mb-4" />
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-blue-600" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Начни видеть себя в динамике
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              Первая отметка занимает 5 минут. Через месяц у тебя будет данных о себе больше, чем за годы самонаблюдения.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/progress")}
                className="bg-white text-blue-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-blue-50 transition-colors"
              >
                Начать отслеживать — 290 ₽
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-white/25 transition-colors"
              >
                Все инструменты — 990 ₽/мес
              </button>
            </div>
            <p className="text-white/60 text-xs mt-5">
              Разовый платёж · Результат сохранится в личном кабинете
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
