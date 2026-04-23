import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";
import TrainerPricingBlock from "@/components/trainers/TrainerPricingBlock";

const META = {
  title: "Эмоции в действии — тренажёр эмоционального интеллекта | ПоДелам",
  description:
    "Тренажёр помогает распознавать эмоции, снижать импульсивность и реагировать зрело. Прокачай эмоциональный интеллект: понимай себя, управляй реакциями, расти. Индекс EMI.",
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
    icon: "Heart",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    title: "Понимание себя",
    text: "Ты начинаешь различать, что именно чувствуешь — не «плохо», а точно: тревога, обида, страх. Это меняет всё.",
  },
  {
    icon: "Wind",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
    title: "Меньше срывов",
    text: "Импульсивные реакции уходят, когда ты видишь их источник. Тренажёр помогает поймать эмоцию до того, как она управляет тобой.",
  },
  {
    icon: "Shield",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Зрелые реакции",
    text: "Вместо «выстрелить словами» — пауза, осознание, ответ. Это навык. Он тренируется.",
  },
  {
    icon: "TrendingUp",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Рост EMI",
    text: "Индекс эмоциональной зрелости растёт с каждой сессией. Ты видишь прогресс в цифрах — это мотивирует продолжать.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "Search",
    title: "Распознавание эмоций",
    desc: "Тренажёр помогает назвать то, что ты чувствуешь — точно и без обобщений. Это первый шаг к управлению собой.",
  },
  {
    icon: "Flame",
    title: "Снижение импульсивности",
    desc: "Понимаешь, что запускает твои резкие реакции. Со временем пауза между стимулом и ответом становится привычкой.",
  },
  {
    icon: "Layers",
    title: "Стратегии реагирования",
    desc: "Получаешь конкретные техники — не советы, а проверенные алгоритмы для разных эмоциональных ситуаций.",
  },
  {
    icon: "BarChart3",
    title: "Индекс EMI",
    desc: "Индекс эмоциональной зрелости отслеживает твой рост сессия за сессией. Видишь, как меняешься в динамике.",
  },
  {
    icon: "Users",
    title: "Лучшие отношения",
    desc: "Управление эмоциями напрямую влияет на качество общения — с близкими, коллегами, партнёрами.",
  },
];

const STEPS = [
  { num: "01", title: "Описываешь ситуацию", desc: "Рассказываешь, что произошло и что почувствовал. Тренажёр задаёт уточняющие вопросы." },
  { num: "02", title: "Находишь источник", desc: "Система помогает разобраться, откуда пришла эмоция — триггер, убеждение, прошлый опыт." },
  { num: "03", title: "Получаешь стратегию", desc: "Видишь конкретные варианты зрелого реагирования — без советов «просто успокойся»." },
  { num: "04", title: "Прокачиваешь навык", desc: "Каждая сессия тренирует эмоциональную зрелость. Со временем управление собой становится автоматическим." },
];

const QUOTES = [
  {
    text: "Я думала, что просто «вспыльчивая». Тренажёр помог понять: за злостью прячется страх. Когда я это увидела — реакции стали другими. За месяц — ни одного срыва на работе.",
    name: "Марина, 32 года",
    role: "Улучшила отношения в команде",
  },
  {
    text: "Три сессии — и я наконец разобрался, почему так остро реагирую на критику. Оказалось, дело не в критике, а в том, что я делаю из неё. Это было открытие.",
    name: "Дмитрий, 38 лет",
    role: "Руководитель отдела",
  },
  {
    text: "Тренажёр не говорит «дыши и успокойся». Он помогает понять себя. Это другой уровень работы с эмоциями — я не ожидала, что так можно.",
    name: "Ольга, 27 лет",
    role: "Повысила эмоциональную устойчивость",
  },
];

export default function EmotionsLanding() {
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
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Heart" size={14} />
                Тренажёр 2 · Эмоции в действии
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Перестань быть<br />
                <span className="text-rose-600">заложником эмоций</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Тренажёр «Эмоции в действии» прокачивает эмоциональный интеллект.
                С каждой сессией ты учишься понимать себя и реагировать зрело — пока это не станет твоей нормой.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/trainers")}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Прокачать эмоциональный интеллект
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
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/96bd87f3-ffe1-4ffa-8dce-6b3b1081ce98.jpg"
                  alt="Эмоции в действии — эмоциональный интеллект"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
                  <p className="text-white text-xs font-semibold">Индекс EMI</p>
                  <p className="text-white/70 text-[11px]">Эмоциональная зрелость растёт</p>
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
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Что прокачивает тренажёр</p>
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
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Что ты получаешь</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">5 ключевых результатов</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHAT_YOU_GET.map((item, i) => (
              <div
                key={item.title}
                className={`flex gap-4 p-5 rounded-2xl border bg-white shadow-sm ${i === 4 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} className="text-rose-600" />
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
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">4 шага к зрелой реакции</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 p-5 rounded-2xl border bg-white">
                <span className="text-2xl font-black text-rose-100 leading-none shrink-0">{s.num}</span>
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
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории пользователей</p>
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
                  <p className="text-xs text-rose-600">{q.role}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-6 justify-center">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === quoteIdx ? "bg-rose-600" : "bg-rose-100"}`}
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
              { icon: "Timer", bg: "bg-amber-50", color: "text-amber-600", title: "Антипрокрастинация", desc: "Делать, а не откладывать", path: "/trainer-antiprocrastination-info" },
              { icon: "Star", bg: "bg-violet-50", color: "text-violet-600", title: "Самооценка", desc: "Уверенность без масок", path: "/trainer-selfesteem-info" },
            ].map((t) => (
              <button
                key={t.title}
                onClick={() => navigate(t.path)}
                className="w-full group flex items-start gap-4 rounded-2xl border bg-white p-5 text-left transition-all hover:border-rose-200 hover:shadow-md"
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
          <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Прокачай эмоциональный интеллект — начни сегодня
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              Одна сессия — и ты уже видишь себя иначе. Месяц тренировок — и срывы уходят в прошлое.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/trainers")}
                className="bg-white text-rose-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-rose-50 transition-colors"
              >
                Прокачать эмоции
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
              Тренажёр «Эмоции в действии» — часть платформы ПоДелам
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
