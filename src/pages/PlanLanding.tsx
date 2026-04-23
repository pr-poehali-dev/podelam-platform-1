import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Шаги развития — персональный план на 3 месяца | ПоДелам",
  description:
    "Составляет персональный план действий на 3 месяца: от первых шагов до результата. Конкретные задачи под твою ситуацию — без воды и общих советов.",
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
    icon: "Map",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Маршрут",
    text: "Вместо тумана — чёткий путь. Знаешь, что делать на этой неделе, в этом месяце и через три месяца.",
  },
  {
    icon: "CheckCircle",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Завершённость",
    text: "Наконец начинаешь доводить до конца. Не потому что стало легче — потому что знаешь следующий шаг.",
  },
  {
    icon: "Flame",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    title: "Мотивация",
    text: "Маленькие победы каждую неделю накапливаются. Это топливо, которое не заканчивается.",
  },
  {
    icon: "Target",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
    title: "Результат",
    text: "Через 3 месяца — не мечта, а конкретное достижение. То, что ты сам наметил и дошёл до него.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "ListChecks",
    title: "Конкретные задачи",
    desc: "Не «развивай навыки», а «сделай вот это до пятницы». Понятно, измеримо, выполнимо.",
  },
  {
    icon: "Calendar",
    title: "Разбивка по неделям",
    desc: "Plan разделён на 12 недель. Каждая неделя — отдельный блок с задачами и ориентиром результата.",
  },
  {
    icon: "User",
    title: "Под твою ситуацию",
    desc: "Plan строится на основе твоего профиля: навыков, барьеров, целей и доступного времени.",
  },
  {
    icon: "TrendingUp",
    title: "Нарастающая сложность",
    desc: "Первые шаги — маленькие и безопасные. Каждый следующий месяц — чуть больше, чуть выше.",
  },
  {
    icon: "Repeat",
    title: "Встроенные чекпоинты",
    desc: "В конце каждого месяца — точка сверки. Смотришь на результат и корректируешь путь при необходимости.",
  },
];

const STEPS = [
  { num: "01", title: "Рассказываешь о себе", desc: "Где ты сейчас, куда хочешь прийти и сколько времени готов вкладывать." },
  { num: "02", title: "Алгоритм строит план", desc: "Система формирует персональный маршрут на 3 месяца с конкретными шагами." },
  { num: "03", title: "Получаешь план", desc: "Разбивка по неделям, задачи, ориентиры и чекпоинты по месяцам." },
  { num: "04", title: "Двигаешься и видишь рост", desc: "Каждый выполненный шаг приближает к результату. Прогресс виден сразу." },
];

const QUOTES = [
  {
    text: "Раньше я ставила цели — и они зависали в воздухе. Появился план с конкретными задачами по неделям — и за три месяца я сделала больше, чем за предыдущий год.",
    name: "Наталья, 33 года",
    role: "Запустила свой онлайн-продукт",
  },
  {
    text: "Самое ценное — это маленькие шаги в начале. Не страшно, не overwhelming. Просто делаешь — и оно работает.",
    name: "Сергей, 27 лет",
    role: "Сменил сферу деятельности",
  },
  {
    text: "Я человек, которому нужна структура. Без плана я хожу по кругу. С планом — двигаюсь. Это именно то, что мне было нужно.",
    name: "Татьяна, 41 год",
    role: "Продвинулась по карьере",
  },
];

export default function PlanLanding() {
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
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Map" size={14} />
                Шаги развития
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Хватит планировать<br />
                <span className="text-amber-600">Пора идти по плану</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Персональный план на 3 месяца с конкретными шагами под твою ситуацию.
                Не вдохновляющие цели, а понятные задачи на каждую неделю — от первого действия до результата.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/plan-bot")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Получить план — 290 ₽
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Все инструменты — 990 ₽/мес
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">290 ₽ · Без AI-галлюцинаций · 15–20 минут</p>
            </div>
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/2eae650a-33e6-48a8-b85c-e9ba40c22f00.jpg"
                  alt="Планирование и развитие"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Что изменится</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Когда есть план — ты другой человек</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Структура снимает тревогу. Понятный следующий шаг — лучший антидепрессант.
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
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-amber-700 font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Ставишь цели на год — и в декабре обнаруживаешь, что они не сдвинулись.",
                "Много думаешь о том, что хочешь изменить — но непонятно, с чего начать прямо сейчас.",
                "Начинаешь несколько дел сразу — и ни одно не доводишь до результата.",
                "Мотивация есть в воскресенье вечером — и исчезает к вторнику.",
                "Знаешь направление, но не знаешь конкретных шагов. И это ощущение тупика изматывает.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-amber-700" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Проблема не в лени и не в характере. Проблема в отсутствии конкретного следующего шага. Plan это исправляет.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Что внутри</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что ты получишь на руки</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Не шаблон, а твой план</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Два человека с разными целями получат разные планы. Алгоритм учитывает твою точку старта.
                </p>
              </div>
              <button
                onClick={() => navigate("/plan-bot")}
                className="mt-6 bg-white text-amber-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-amber-50 transition-colors w-full sm:w-auto"
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
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">4 шага — и план у тебя в руках</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-amber-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-amber-50 border border-amber-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Lock" size={20} className="text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-amber-700 font-medium">Никакого AI при анализе ответов</p>
            <p className="text-xs text-amber-500 mt-1">
              Только алгоритм на основе твоих реальных данных. Один и тот же ответ — всегда один и тот же результат.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Когда план есть — всё меняется</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-amber-100 mb-4" />
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-amber-500" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Через 3 месяца ты либо будешь там, либо — снова здесь
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              Разница только в одном — есть ли у тебя план. Получи его прямо сейчас и начни двигаться сегодня.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/plan-bot")}
                className="bg-white text-amber-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-amber-50 transition-colors"
              >
                Получить план — 290 ₽
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
