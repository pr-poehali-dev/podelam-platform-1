import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Дневник самоанализа — пространство для рефлексии | ПоДелам",
  description:
    "Пространство для рефлексии и фиксации мыслей. Алгоритм помогает находить паттерны и делать выводы — чтобы ты лучше понимал себя с каждой записью.",
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
    icon: "BookOpen",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Ясность",
    text: "Мысли, которые крутятся по кругу в голове, выходят на бумагу — и перестают давить.",
  },
  {
    icon: "Eye",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "Самопознание",
    text: "Видишь свои паттерны: как ты реагируешь, что повторяется, что на самом деле важно.",
  },
  {
    icon: "Wind",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Лёгкость",
    text: "После записи голова становится чище. Это не просто ощущение — это реальный эффект рефлексии.",
  },
  {
    icon: "Compass",
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    title: "Направление",
    text: "Анализ записей помогает понять, куда ты движешься — и совпадает ли это с тем, чего ты хочешь.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "PenLine",
    title: "Пространство для мыслей",
    desc: "Структурированные вопросы-подсказки помогают не просто выговориться, а прийти к выводу.",
  },
  {
    icon: "GitBranch",
    title: "Поиск паттернов",
    desc: "Алгоритм анализирует записи и выделяет повторяющиеся темы, реакции и состояния.",
  },
  {
    icon: "Lightbulb",
    title: "Инсайты",
    desc: "Система помогает связать точки — увидеть связи между событиями, мыслями и поведением.",
  },
  {
    icon: "History",
    title: "История записей",
    desc: "Все записи сохраняются. Можно вернуться, сравнить и увидеть, как ты изменился за месяц.",
  },
  {
    icon: "Brain",
    title: "Выводы, а не просто слова",
    desc: "Дневник не просто хранит записи — он помогает вытащить из них понимание.",
  },
];

const STEPS = [
  { num: "01", title: "Открываешь дневник", desc: "В любое время, когда есть что-то на душе или хочется разобраться в себе." },
  { num: "02", title: "Отвечаешь на вопросы", desc: "Алгоритм задаёт точные вопросы, которые помогают не ходить по кругу." },
  { num: "03", title: "Получаешь вывод", desc: "В конце каждой сессии — краткое резюме того, что ты сам сказал о себе." },
  { num: "04", title: "Видишь себя в динамике", desc: "Паттерны проявляются через несколько записей. Начинаешь понимать себя глубже." },
];

const QUOTES = [
  {
    text: "Думала, что не умею вести дневник — всегда бросала через неделю. Здесь по-другому: вопросы ведут тебя, и каждый раз приходишь к чему-то настоящему.",
    name: "Марина, 30 лет",
    role: "Занимается личностным развитием",
  },
  {
    text: "Я не терапевт и не психолог. Но после трёх месяцев записей я понял про себя то, на что раньше уходили годы разговоров ни о чём.",
    name: "Иван, 38 лет",
    role: "Предприниматель",
  },
  {
    text: "Самое ценное — вывод в конце сессии. Иногда читаю его и думаю: это я сам сказал? Но это правда — и именно поэтому так точно.",
    name: "Елена, 34 года",
    role: "Работает над осознанностью",
  },
];

export default function DiaryLanding() {
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
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="BookOpen" size={14} />
                Дневник самоанализа
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Всё уже есть внутри тебя<br />
                <span className="text-violet-600">Нужно только достать</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Дневник самоанализа — это не просто место для мыслей.
                Это структурированная рефлексия, которая помогает находить паттерны, делать выводы и лучше понимать себя с каждой записью.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/diary")}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Открыть дневник — 990 ₽/мес
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Все инструменты — 990 ₽/мес
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Входит в подписку · 10–15 минут на сессию</p>
            </div>
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/add96ea2-b0c7-474b-967b-22cabe48fc15.jpg"
                  alt="Рефлексия и самопознание"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">После сессии</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что происходит, когда начинаешь писать</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Рефлексия — не модное слово. Это конкретный инструмент для понимания себя.
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
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-violet-700 font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Мысли крутятся по кругу — и ты не можешь из них выбраться.",
                "Чувствуешь что-то важное, но не можешь это сформулировать даже для себя.",
                "Ведёшь дневник пару дней — и бросаешь, потому что не знаешь, что писать.",
                "После разговора с кем-то чувствуешь облегчение — но не всегда есть кому говорить.",
                "Хочется понять себя глубже, но не знаешь с чего начать.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-violet-700" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Дневник самоанализа даёт структуру. Не «пиши что хочешь» — а конкретные вопросы, которые ведут к пониманию.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Что внутри</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Как устроен дневник</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Только ты и твои мысли</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Дневник приватный. Никто не читает твои записи. Только алгоритм — чтобы помочь тебе найти паттерны.
                </p>
              </div>
              <button
                onClick={() => navigate("/diary")}
                className="mt-6 bg-white text-violet-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-violet-50 transition-colors w-full sm:w-auto"
              >
                Открыть дневник
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Одна сессия — один шаг к себе</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-violet-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-violet-50 border border-violet-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Lock" size={20} className="text-violet-400 mx-auto mb-2" />
            <p className="text-sm text-violet-700 font-medium">Полная конфиденциальность</p>
            <p className="text-xs text-violet-500 mt-1">
              Твои записи не читают люди. Алгоритм анализирует паттерны — без передачи данных третьим лицам.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Что открыли для себя другие</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-violet-100 mb-4" />
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-violet-600" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Пора наконец услышать себя
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              10 минут первой сессии — и ты уже узнаешь о себе что-то, о чём раньше только догадывался.
              Мысли выходят наружу. Становится легче.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/diary")}
                className="bg-white text-violet-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-violet-50 transition-colors"
              >
                Открыть дневник — 990 ₽/мес
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-white/25 transition-colors"
              >
                Все инструменты — 990 ₽/мес
              </button>
            </div>
            <p className="text-white/60 text-xs mt-5">
              Входит в подписку · Записи сохраняются в личном кабинете
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
