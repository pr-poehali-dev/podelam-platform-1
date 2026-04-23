import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import {
  getBalance,
  syncFromServer,
  payForSimulator,
  SIMULATOR_PRICE,
  SIMULATOR_DAYS,
  hasSimulatorAccess,
  simulatorAccessExpires,
} from "@/lib/access";

const META = {
  title: "Симулятор решений PRO — просчитай любой жизненный сценарий | ПоДелам",
  description:
    "Симулятор решений PRO: просчитай ипотеку, смену работы, бизнес, переезд или покупку авто. Сравни до 3 вариантов, получи PDF-отчёт. 490 ₽ / 7 дней.",
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

const SCENARIOS = [
  { icon: "Home", label: "Ипотека и недвижимость", desc: "Купить или снимать? Считаем реальную выгоду на 20 лет" },
  { icon: "Briefcase", label: "Смена работы", desc: "Стоит ли уходить? Сравниваем доход, риски и рост" },
  { icon: "TrendingUp", label: "Открытие бизнеса", desc: "Когда окупится и сколько реально заработаешь" },
  { icon: "MapPin", label: "Переезд в другой город", desc: "Стоимость жизни, карьера, качество — всё в сравнении" },
  { icon: "Car", label: "Покупка авто", desc: "Кредит сейчас или накопить? Честная математика" },
  { icon: "Sparkles", label: "Любой другой сценарий", desc: "Настрой параметры под свою ситуацию" },
];

const FEELINGS = [
  {
    icon: "Brain",
    title: "Ясность вместо тумана",
    text: "Ты видишь цифры, а не догадки. «Стоит ли оно того?» больше не висит в воздухе — у тебя есть ответ.",
  },
  {
    icon: "Shield",
    title: "Уверенность в решении",
    text: "Ты принял это решение не на эмоциях, а на данных. Оглядываться назад незачем — ты всё посчитал.",
  },
  {
    icon: "Zap",
    title: "Освобождение от тревоги",
    text: "Когда сценарий просчитан — тревога «а вдруг» уходит. Ты знаешь, к чему приведёт каждый путь.",
  },
  {
    icon: "Award",
    title: "Чувство контроля",
    text: "Ты управляешь ситуацией, а не плывёшь по течению. Симулятор даёт ощущение взрослого выбора.",
  },
];

const FEATURES = [
  { icon: "GitBranch", title: "До 3 вариантов одновременно", desc: "Сравни «купить», «снять» и «подождать» в одном экране" },
  { icon: "CalendarDays", title: "Горизонт до 30 лет", desc: "Видишь, что будет через 5, 10 и 20 лет по каждому варианту" },
  { icon: "BarChart3", title: "5 измерений качества жизни", desc: "Финансы, время, стресс, стабильность, риски — всё в одном" },
  { icon: "FileDown", title: "PDF-отчёт для себя и банка", desc: "Сохрани расчёт, покажи партнёру или финансовому консультанту" },
  { icon: "Layers", title: "Готовые шаблоны сценариев", desc: "5 готовых шаблонов — заполни автоматически и смотри результат" },
  { icon: "SlidersHorizontal", title: "Гибкие параметры", desc: "Инфляция, рост дохода, вероятность риска — учитывай реальность" },
];

const STEPS = [
  { num: "01", title: "Выбираешь тип решения", desc: "Ипотека, бизнес, переезд — или создаёшь сценарий с нуля." },
  { num: "02", title: "Задаёшь параметры", desc: "Доход, расходы, ставки, сроки — всё под твою ситуацию." },
  { num: "03", title: "Сравниваешь варианты", desc: "До трёх сценариев рядом: финансы, время, стресс, риски." },
  { num: "04", title: "Получаешь расчёт и PDF", desc: "Наглядные графики и подробный отчёт — можно сохранить и поделиться." },
];

const QUOTES = [
  {
    text: "Три месяца думал об ипотеке. Загрузил данные в симулятор — за 20 минут увидел всё: переплату, точку безубыточности, сравнение с арендой. Взял ипотеку. Без сомнений.",
    name: "Роман, 37 лет",
    role: "Принял решение об ипотеке",
  },
  {
    text: "Хотела уйти из найма. Симулятор посчитал три сценария: остаться, уйти сейчас, уйти через год. Результат меня удивил — оказалось, что «через год» выгоднее на 40%. Подождала. Не пожалела.",
    name: "Алина, 31 год",
    role: "Спланировала переход в бизнес",
  },
  {
    text: "Показал расчёт жене. Она скептически относилась к переезду в Москву. После PDF-отчёта с цифрами по 10 годам — согласилась. Данные убеждают лучше слов.",
    name: "Никита, 34 года",
    role: "Переехал и не пожалел",
  },
];

export default function SimulatorProLanding() {
  const navigate = useNavigate();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [balance, setBalance] = useState(getBalance());
  const [showTopUp, setShowTopUp] = useState(false);
  const [hasAccess, setHasAccess] = useState(hasSimulatorAccess());
  const [expiry, setExpiry] = useState<Date | null>(simulatorAccessExpires());
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
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 5500);
    return () => clearInterval(t);
  }, []);

  function refreshBalance() {
    setBalance(getBalance());
    setHasAccess(hasSimulatorAccess());
    setExpiry(simulatorAccessExpires());
  }

  async function handlePaymentConfirm() {
    setPaying(true);
    await syncFromServer().catch(() => {});
    refreshBalance();
    if (getBalance() < SIMULATOR_PRICE) {
      setPaying(false);
      setShowPayment(false);
      setShowTopUp(true);
      return;
    }
    const ok = await payForSimulator();
    setPaying(false);
    if (ok) {
      refreshBalance();
      setShowPayment(false);
      navigate("/pro/simulator");
    }
  }

  function handleCTA() {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    if (hasAccess) {
      navigate("/pro/simulator");
      return;
    }
    setBalance(getBalance());
    setShowPayment(true);
  }

  const expiryFormatted = expiry
    ? new Date(expiry).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : null;

  return (
    <div className="min-h-screen bg-white font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />

      {/* HERO */}
      <section className="pt-16 sm:pt-20 pb-0 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 pb-12 sm:pb-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Cpu" size={13} />
                Симулятор решений
                <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">PRO</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1] mb-5 sm:mb-6">
                Просчитай решение<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400">до того, как сделаешь</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Симулятор просчитывает любые жизненные сценарии — без ИИ, на чистой логике и данных.
                Сравни до трёх вариантов, увидь последствия на 30 лет вперёд и прими решение уверенно.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
                <button
                  onClick={handleCTA}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-slate-900/20"
                >
                  {hasAccess ? "Открыть симулятор" : "Начать за 490 ₽"}
                </button>
                <button
                  onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-50 transition-colors"
                >
                  Как это работает
                </button>
              </div>
              {hasAccess && expiryFormatted ? (
                <p className="text-xs text-emerald-600 font-semibold">Доступ активен · действует до {expiryFormatted}</p>
              ) : (
                <p className="text-xs text-slate-400">490 ₽ / 7 дней · Отдельно от подписки · Без ИИ</p>
              )}
            </div>
            <div className="w-full lg:w-[460px] xl:w-[520px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/2b9532a8-3a6a-463b-9e33-d4b9cffdea45.jpg"
                  alt="Симулятор решений PRO"
                  className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ипотека vs Аренда · 20 лет</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Расчёт готов</span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[11px] text-slate-400">Ипотека</p>
                        <p className="text-base font-black text-slate-900">+4.2 млн ₽</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div>
                        <p className="text-[11px] text-slate-400">Аренда</p>
                        <p className="text-base font-black text-slate-400">−1.8 млн ₽</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div>
                        <p className="text-[11px] text-slate-400">PDF готов</p>
                        <Icon name="FileDown" size={18} className="text-slate-600 mt-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENARIOS STRIP */}
      <section className="py-10 sm:py-14 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Какие решения просчитывает симулятор</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SCENARIOS.map((s) => (
              <div key={s.label} className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug hidden sm:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Что ты чувствуешь после расчёта</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Не просто цифры — ощущение правоты</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">Когда важное решение просчитано — что-то меняется внутри. Это не эйфория. Это спокойствие.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className="flex gap-5 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={22} className="text-slate-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Возможности</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Всё, что нужно для серьёзного решения</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={20} className="text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">4 шага к ясному решению</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                <span className="text-3xl font-black text-slate-100 leading-none shrink-0 select-none">{s.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-14 sm:py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории решений</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Что происходит, когда считаешь, а не гадаешь</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[210px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon name="User" size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{q.name}</p>
                    <p className="text-xs text-slate-400">{q.role}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-6 justify-center">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-slate-800" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING BLOCK */}
      <section id="pricing" className="py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Доступ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Один раз заплатить — один раз решить правильно</h2>
            <p className="text-slate-500 mt-3 text-base max-w-lg mx-auto">Симулятор оплачивается отдельно от подписки на тренажёры. 7 дней — достаточно, чтобы просчитать любое важное решение.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative bg-white rounded-3xl border-2 border-slate-900 shadow-xl p-8">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">PRO ДОСТУП</span>
              </div>

              <div className="text-center mt-2 mb-8">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-black text-slate-900">{SIMULATOR_PRICE}</span>
                  <span className="text-2xl font-bold text-slate-400 mb-1.5">₽</span>
                </div>
                <p className="text-slate-500 text-sm">/ {SIMULATOR_DAYS} дней · отдельно от подписки</p>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  { icon: "GitBranch", text: "До 20 сценариев и до 3 вариантов каждый" },
                  { icon: "CalendarDays", text: "Горизонт расчёта до 30 лет" },
                  { icon: "BarChart3", text: "Индексы: финансы, стресс, стабильность, риски" },
                  { icon: "FileDown", text: "PDF-отчёт — сохрани и поделись" },
                  { icon: "Layers", text: "5 готовых шаблонов сценариев" },
                  { icon: "Eye", text: "Просмотр прошлых сценариев всегда бесплатен" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="Check" size={11} className="text-slate-700" />
                    </div>
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </li>
                ))}
              </ul>

              {hasAccess ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-center">
                    <p className="text-emerald-700 font-bold text-sm">Доступ активен</p>
                    {expiryFormatted && <p className="text-emerald-600 text-xs mt-0.5">Действует до {expiryFormatted}</p>}
                  </div>
                  <button
                    onClick={() => navigate("/pro/simulator")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-base transition-colors"
                  >
                    Открыть симулятор
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCTA}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-slate-900/20"
                >
                  {isLoggedIn ? `Получить доступ за ${SIMULATOR_PRICE} ₽` : "Войти и получить доступ"}
                </button>
              )}

              <p className="text-center text-xs text-slate-400 mt-4">
                Без ИИ · Чистая логика и данные · Результат мгновенно
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "Lock", label: "Без ИИ" },
                { icon: "Clock", label: "За 20 минут" },
                { icon: "RefreshCw", label: "7 дней доступа" },
              ].map((b) => (
                <div key={b.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <Icon name={b.icon} size={16} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 sm:py-20 px-4 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Одно правильное решение<br className="hidden sm:block" /> стоит гораздо больше 490 ₽
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Ипотека на 20 лет. Смена работы. Открытие бизнеса. Это не те решения, в которых стоит гадать.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCTA}
              className="bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl text-base hover:bg-slate-100 transition-colors shadow-lg"
            >
              {hasAccess ? "Открыть симулятор" : `Начать за ${SIMULATOR_PRICE} ₽`}
            </button>
            <button
              onClick={() => navigate("/trainers-info")}
              className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-700 transition-colors"
            >
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-6">490 ₽ / 7 дней · Отдельно от подписки на тренажёры</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <Icon name="Cpu" size={13} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Симулятор решений PRO</span>
            </div>
            <p className="text-xs text-slate-400 text-center">Часть платформы ПоДелам</p>
            <button
              onClick={() => navigate("/trainers-info")}
              className="text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors"
            >
              Все тренажёры →
            </button>
          </div>
        </div>
      </footer>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPayment(false)}
        >
          <div
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="Cpu" size={30} className="text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Симулятор решений</h3>
              <p className="text-sm text-slate-500 mt-1">Полный доступ на {SIMULATOR_DAYS} дней</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">{SIMULATOR_PRICE}</span>
                <span className="text-xl font-bold text-slate-400 mb-1">₽</span>
              </div>
              <p className="text-xs text-slate-400">/ {SIMULATOR_DAYS} дней · отдельно от подписки</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {["До 20 сценариев", "До 3 вариантов", "PDF-отчёт"].map((t) => (
                  <span key={t} className="text-[11px] bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {balance > 0 && (
              <p className="text-center text-xs text-slate-500 mb-3">
                На балансе: <span className="font-semibold text-slate-700">{balance} ₽</span>
                {balance < SIMULATOR_PRICE && (
                  <span className="text-orange-500"> · не хватает {SIMULATOR_PRICE - balance} ₽</span>
                )}
              </p>
            )}

            <button
              onClick={handlePaymentConfirm}
              disabled={paying}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-sm transition-colors disabled:opacity-60 mb-2"
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Оплачиваем...
                </span>
              ) : balance >= SIMULATOR_PRICE ? (
                `Списать ${SIMULATOR_PRICE} ₽ с баланса`
              ) : (
                "Пополнить баланс"
              )}
            </button>
            <button
              onClick={() => setShowPayment(false)}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            setShowTopUp(false);
            refreshBalance();
            setShowPayment(true);
          }}
        />
      )}

      <InstallPWA />
    </div>
  );
}