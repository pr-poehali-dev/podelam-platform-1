import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";
import TrainerPricingBlock from "@/components/trainers/TrainerPricingBlock";

const META = {
  title: "Антипрокрастинация — тренажёр запуска действий | ПоДелам",
  description:
    "Тренажёр помогает начать делать, а не откладывать. Малый шаг, дисциплина, индекс действия. Прокачай навык запускать важное — без насилия над собой.",
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
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Лёгкий старт",
    text: "Ты начинаешь — не потому что «надо», а потому что шаг маленький. Сопротивление уходит, когда задача не пугает.",
  },
  {
    icon: "Flame",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    title: "Импульс движения",
    text: "Один шаг запускает следующий. Тренажёр помогает удержать инерцию и не остановиться на полпути.",
  },
  {
    icon: "CheckCircle",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Завершённость",
    text: "Дела, которые висели неделями, закрываются. Ты чувствуешь удовлетворение — не от объёма, а от того, что сделал.",
  },
  {
    icon: "TrendingUp",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Рост индекса AI",
    text: "Индекс действия растёт с каждой сессией. Ты видишь, как прокачиваешь способность запускать важное.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "Footprints",
    title: "Малый шаг",
    desc: "Тренажёр разбивает любую задачу до размера, с которого легко начать. Никакого «сделаю всё сразу».",
  },
  {
    icon: "Brain",
    title: "Источник сопротивления",
    desc: "Понимаешь, почему откладываешь именно это. Страх, перфекционизм, туман — тренажёр называет причину.",
  },
  {
    icon: "Clock",
    title: "Конкретный план",
    desc: "Выходишь из сессии с первым шагом, временем и условием старта. Не «займусь этим» — а «делаю сегодня в 18:00».",
  },
  {
    icon: "BarChart3",
    title: "Индекс AI",
    desc: "Индекс действия отслеживает, как ты прокачиваешь навык запускать задачи. Виден рост от сессии к сессии.",
  },
  {
    icon: "Repeat",
    title: "Привычка завершать",
    desc: "Со временем малый шаг становится автоматическим. Прокрастинация уходит не силой воли — а системой.",
  },
];

const STEPS = [
  { num: "01", title: "Называешь задачу", desc: "Говоришь тренажёру, что откладываешь. Без оценок — просто факт." },
  { num: "02", title: "Находишь причину", desc: "Вместе разбираетесь, что стоит за откладыванием. Это меняет подход." },
  { num: "03", title: "Формируешь малый шаг", desc: "Тренажёр помогает найти действие, с которого легко начать прямо сейчас." },
  { num: "04", title: "Фиксируешь старт", desc: "Устанавливаешь время, место и первое движение. Слова становятся действием." },
];

const QUOTES = [
  {
    text: "Я откладывал один проект три месяца. Тренажёр спросил: «Какой самый маленький шаг ты готов сделать сегодня?» Я сказал «написать заголовок». И написал. Потом ещё два часа работал.",
    name: "Артём, 36 лет",
    role: "Запустил проект после трёх месяцев откладывания",
  },
  {
    text: "Думала, что я просто ленивая. Оказалось — перфекционизм. Я боялась начать, потому что хотела сделать идеально. Малый шаг снял это ожидание. Теперь я просто делаю.",
    name: "Катя, 31 год",
    role: "Закрыла 14 висящих задач за месяц",
  },
  {
    text: "Меня поразило, что тренажёр не давит и не мотивирует криком. Он просто помогает понять, почему не идёшь. И тогда идти становится легче.",
    name: "Сергей, 44 года",
    role: "Перестал копить незакрытые дела",
  },
];

export default function AntiprocrastinationLanding() {
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
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Zap" size={14} />
                Тренажёр 3 · Антипрокрастинация. Малый шаг
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Хватит ждать<br />
                <span className="text-amber-600">подходящего момента</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Тренажёр «Антипрокрастинация» прокачивает навык запускать действия.
                Малый шаг — и ты уже в движении. Делай, а не откладывай.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/trainers")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Прокачать действие
                </button>
                <button
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Смотреть тарифы
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">от 990 ₽ · 15–20 минут на сессию</p>
            </div>
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/674eaf5e-fdf4-4f98-b648-92ccd03dd625.jpg"
                  alt="Антипрокрастинация — малый шаг в действие"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
                  <p className="text-white text-xs font-semibold">Индекс AI</p>
                  <p className="text-white/70 text-[11px]">Способность запускать действия</p>
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
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Что прокачивает тренажёр</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">После сессии ты чувствуешь</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEELINGS.map((f) => (
              <div key={f.title} className={`rounded-2xl border ${f.border} ${f.bg} p-6`}>
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon name={f.icon} size={24} className={f.color} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Что ты получаешь</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">5 ключевых результатов</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHAT_YOU_GET.map((item, i) => (
              <div
                key={item.title}
                className={`flex gap-4 p-5 rounded-2xl border bg-white shadow-sm ${i === 4 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">4 шага от откладывания к действию</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 p-5 rounded-2xl border bg-white">
                <span className="text-2xl font-black text-amber-100 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории пользователей</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Что меняется на практике</h2>
          </div>
          <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm p-7 sm:p-10 min-h-[200px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-7 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-5 italic">«{q.text}»</p>
                <div>
                  <p className="font-bold text-foreground text-sm">{q.name}</p>
                  <p className="text-xs text-amber-600">{q.role}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-6 justify-center">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === quoteIdx ? "bg-amber-500" : "bg-amber-100"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OTHER TRAINERS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-widest mb-3">Другие тренажёры</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Прокачай другие навыки</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "Compass", bg: "bg-indigo-50", color: "text-indigo-600", title: "Осознанный выбор", desc: "Принятие решений без сомнений", path: "/trainer-conscious-choice-info" },
              { icon: "Heart", bg: "bg-rose-50", color: "text-rose-600", title: "Эмоции в действии", desc: "Управление чувствами и реакциями", path: "/trainer-emotions-info" },
              { icon: "Star", bg: "bg-emerald-50", color: "text-emerald-600", title: "Самооценка", desc: "Уверенность без масок", path: "/trainer-selfesteem-info" },
            ].map((t) => (
              <button
                key={t.title}
                onClick={() => navigate(t.path)}
                className="w-full group flex items-start gap-4 rounded-2xl border bg-white p-5 text-left transition-all hover:border-amber-200 hover:shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                  <Icon name={t.icon} size={18} className={t.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{t.title}</p>
                  <p className="text-muted-foreground text-xs">{t.desc}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Сделай первый шаг — прямо сейчас
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              Одна сессия — и ты уже в движении. Месяц тренировок — и откладывание перестаёт быть твоей привычкой.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/trainers")}
                className="bg-white text-amber-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-amber-50 transition-colors"
              >
                Прокачать действие
              </button>
              <button
                onClick={() => navigate("/trainers-info")}
                className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-white/25 transition-colors"
              >
                Смотреть тарифы
              </button>
            </div>
            <p className="text-white/60 text-xs mt-5">от 990 ₽ · История сессий сохраняется</p>
          </div>
        </div>
      </section>

      <div id="pricing">
        <TrainerPricingBlock />
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Icon name="Zap" size={14} className="text-white" />
              </div>
              <span className="font-bold text-foreground text-sm">ПоДелам</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Тренажёр «Антипрокрастинация» — часть платформы ПоДелам
            </p>
            <button
              onClick={() => navigate("/trainers")}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Все тренажёры →
            </button>
          </div>
        </div>
      </footer>

      <InstallPWA />
    </div>
  );
}
