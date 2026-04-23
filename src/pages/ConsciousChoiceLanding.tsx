import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Осознанный выбор — тренажёр принятия решений | ПоДелам",
  description:
    "Тренажёр помогает принимать решения без сомнений и страха. Прокачай навык решительности: выходи из неопределённости, видь последствия выбора, фиксируй шаги. Индекс решительности.",
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
    icon: "Compass",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Ясность",
    text: "Туман рассеивается. Вместо «не знаю, что выбрать» — чёткое понимание, что важно именно тебе.",
  },
  {
    icon: "Shield",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Спокойствие",
    text: "Тревога «а вдруг ошибусь» уходит. Ты видишь последствия — и перестаёшь бояться выбора.",
  },
  {
    icon: "Zap",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Решительность",
    text: "Прокачиваешь навык принимать решения быстрее и увереннее. Петля «подумаю ещё раз» исчезает.",
  },
  {
    icon: "TrendingUp",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Движение",
    text: "После каждой сессии — конкретный следующий шаг. Не планы, а действие. Привычка закрепляется.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "GitBranch",
    title: "Выход из неопределённости",
    desc: "Тренажёр раскладывает сложный выбор по полочкам — ценности, последствия, риски. Прокачивай это с каждой сессией.",
  },
  {
    icon: "AlertTriangle",
    title: "Снижение страха",
    desc: "Страх выбора исчезает, когда понимаешь его источник. Тренажёр помогает найти и назвать его.",
  },
  {
    icon: "Eye",
    title: "Картина последствий",
    desc: "Видишь, к чему реально приведёт каждый вариант — не в идеале, а в твоей конкретной ситуации.",
  },
  {
    icon: "ListChecks",
    title: "Первые шаги",
    desc: "После каждой сессии — список конкретных действий. Решение не висит в воздухе, оно уже в движении.",
  },
  {
    icon: "BarChart3",
    title: "Индекс решительности",
    desc: "Показывает, как ты прокачиваешь навык принимать решения. Растёт от сессии к сессии.",
  },
];

const STEPS = [
  { num: "01", title: "Описываешь ситуацию", desc: "Рассказываешь о выборе, который стоит перед тобой. Тренажёр задаёт уточняющие вопросы." },
  { num: "02", title: "Анализируешь с алгоритмом", desc: "Система помогает разложить варианты по ценностям, последствиям и рискам." },
  { num: "03", title: "Видишь картину целиком", desc: "Получаешь структурированный разбор с выводами — без советов «просто реши»." },
  { num: "04", title: "Прокачиваешь привычку", desc: "Каждая новая сессия тренирует навык решительности. Со временем ты делаешь это быстрее и точнее." },
];

const QUOTES = [
  {
    text: "Я полгода не мог решить, уходить ли из найма. Одна сессия — и я наконец увидел, чего на самом деле боюсь. Не потери дохода. Потери статуса. Как только это понял — решение пришло само.",
    name: "Кирилл, 34 года",
    role: "Ушёл в собственный проект",
  },
  {
    text: "Думала, что нерешительность — это мой характер. Оказалось, я просто никогда не раскладывала выбор по ценностям. Прокачала этот навык за месяц — и это меняет всё.",
    name: "Наталья, 29 лет",
    role: "Приняла решение о переезде",
  },
  {
    text: "Тренажёр не говорит тебе, что выбрать. Он тренирует тебя делать это самому. Это важно — потому что ты живёшь с этим решением, а не он.",
    name: "Антон, 41 год",
    role: "Менял карьерное направление",
  },
];

export default function ConsciousChoiceLanding() {
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
    return () => { document.title = prevTitle; };
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
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Compass" size={14} />
                Тренажёр 1 · Осознанный выбор
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Хватит крутить одно<br />
                <span className="text-indigo-600">и то же в голове</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Тренажёр «Осознанный выбор» прокачивает навык принятия решений.
                С каждой сессией ты тренируешь решительность — пока она не станет привычкой.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/trainers")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Прокачать решительность — 2 490 ₽
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Все инструменты — 990 ₽/мес
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">2 490 ₽ на 3 месяца · 15–20 минут на сессию</p>
            </div>
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/701249fe-28da-4e22-95de-de7888d16c98.jpg"
                  alt="Осознанный выбор и решительность"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
                  <p className="text-white text-xs font-semibold">Индекс решительности</p>
                  <p className="text-white/70 text-[11px]">Растёт с каждой сессией</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Что прокачивает тренажёр</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что ты почувствуешь уже после первой сессии</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Принятое решение — это не просто выбор. Это ощущение, что ты снова контролируешь свою жизнь.
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
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-indigo-700 font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Думаешь об одном и том же решении неделями — и не можешь сдвинуться с места.",
                "Просишь совета у всех вокруг — а в итоге всё равно не знаешь, что делать.",
                "Принимаешь решение — и тут же начинаешь сомневаться, правильное ли оно.",
                "Боишься ошибиться так сильно, что откладываешь выбор до последнего.",
                "Чувствуешь, что жизнь проходит мимо, пока ты думаешь.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-indigo-700" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Нерешительность — это не черта характера. Это навык, который не прокачан. Тренажёр это исправляет.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Что прокачиваешь</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что происходит в каждой сессии</h2>
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
                <h3 className="font-bold text-xl mb-2">Тренажёр — не советник</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Он не говорит тебе, что делать. Он прокачивает твой навык делать это самому. С каждой сессией — лучше.
                </p>
              </div>
              <button
                onClick={() => navigate("/trainers")}
                className="mt-6 bg-white text-indigo-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors w-full sm:w-auto"
              >
                Начать прокачку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">4 шага от тумана к решению</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-indigo-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-indigo-50 border border-indigo-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="RefreshCw" size={20} className="text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-indigo-700 font-medium">Тренируйся регулярно — навык закрепляется</p>
            <p className="text-xs text-indigo-500 mt-1">
              Каждая новая сессия — новая ситуация. Индекс решительности копится и показывает, как ты прокачиваешься в динамике.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Когда выбор наконец сделан</h2>
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-indigo-600" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OTHER TRAINERS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-widest mb-3">Также в подписке</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Ещё 4 флагманских тренажёра</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "Heart", color: "text-rose-600", bg: "bg-rose-50", title: "Эмоции в действии", desc: "Прокачай управление чувствами и реакциями", link: "/trainer-emotions-info" },
              { icon: "Zap", color: "text-orange-500", bg: "bg-orange-50", title: "Антипрокрастинация", desc: "Прокачай запуск действий с первого шага", link: "/trainer-antiprocrastination-info" },
              { icon: "Shield", color: "text-teal-600", bg: "bg-teal-50", title: "Самооценка и опора", desc: "Прокачай устойчивую самоценность изнутри", link: "/trainer-selfesteem-info" },
              { icon: "Wallet", color: "text-emerald-600", bg: "bg-emerald-50", title: "Деньги без тревоги", desc: "Прокачай спокойное отношение к финансам", link: "/trainer-money-info" },
            ].map((t) => (
              <div
                key={t.title}
                onClick={() => navigate(t.link)}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-border cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                  <Icon name={t.icon} size={18} className={t.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{t.title}</p>
                  <p className="text-muted-foreground text-xs">{t.desc}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Прокачай решительность за 3 месяца
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              Одна сессия — и ты выйдешь с принятым решением и конкретными шагами.
              Три месяца тренировок — и решительность станет твоей привычкой.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/trainers")}
                className="bg-white text-indigo-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-indigo-50 transition-colors"
              >
                Прокачать решительность — 2 490 ₽
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-white/25 transition-colors"
              >
                Все инструменты — 990 ₽/мес
              </button>
            </div>
            <p className="text-white/60 text-xs mt-5">
              2 490 ₽ на 3 месяца · История сессий сохраняется
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
              <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
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
