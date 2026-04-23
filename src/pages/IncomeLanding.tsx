import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Подбор дохода — найди свой способ зарабатывать | ПоДелам",
  description:
    "Анализирует твои навыки и предпочтения, подбирает подходящие варианты заработка — от фриланса до своего дела. Без универсальных советов — только твоя ситуация.",
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
    icon: "Banknote",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Конкретность",
    text: "Вместо «попробуй фриланс» — точные направления, которые подходят именно тебе с твоими навыками.",
  },
  {
    icon: "Compass",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    title: "Направление",
    text: "Больше не нужно перебирать всё подряд. Ты знаешь, куда двигаться — и почему это сработает.",
  },
  {
    icon: "Zap",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Импульс",
    text: "Появляется энергия, которой не было. Когда видишь реальный путь — хочется идти.",
  },
  {
    icon: "TrendingUp",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    title: "Рост",
    text: "Перестаёшь работать больше — начинаешь работать точнее. Доход растёт без выгорания.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "Search",
    title: "Анализ навыков",
    desc: "Что ты уже умеешь, что даётся легко и за что люди готовы платить — даже если ты этого не замечаешь.",
  },
  {
    icon: "Heart",
    title: "Твои предпочтения",
    desc: "Как ты хочешь работать: с людьми или в одиночку, руками или головой, стабильно или гибко.",
  },
  {
    icon: "Layers",
    title: "Варианты заработка",
    desc: "Подходящие форматы: фриланс, консультации, продукт, наём — с объяснением, почему именно они.",
  },
  {
    icon: "DollarSign",
    title: "Потенциал дохода",
    desc: "Реалистичный диапазон заработка по каждому варианту на старте и через 6–12 месяцев.",
  },
  {
    icon: "Footprints",
    title: "Первый шаг",
    desc: "С чего начать именно в твоей ситуации — без лишних действий и без «сначала нужно ещё».",
  },
];

const STEPS = [
  { num: "01", title: "Отвечаешь о себе", desc: "Вопросы про навыки, опыт, желаемый формат и доход. 15–20 минут." },
  { num: "02", title: "Система анализирует", desc: "Алгоритм сопоставляет твой профиль с реальными рыночными нишами." },
  { num: "03", title: "Получаешь список", desc: "Конкретные варианты заработка с объяснением, почему они подходят." },
  { num: "04", title: "Делаешь первый шаг", desc: "Ясный следующий шаг — без пустых советов «развивай личный бренд»." },
];

const QUOTES = [
  {
    text: "Работала бухгалтером 10 лет и думала, что единственный вариант — найти другую компанию. Анализ показал три направления, о которых я не думала. Сейчас веду консультации онлайн.",
    name: "Ирина, 38 лет",
    role: "Перешла в онлайн-консультирование",
  },
  {
    text: "Всё время казалось, что мои навыки «обычные» и за них не заплатят. Оказалось — ещё как. Просто я искал не там и не в том формате.",
    name: "Павел, 32 года",
    role: "Запустил фриланс-проект",
  },
  {
    text: "После подбора дохода наконец перестала хвататься за всё подряд. Сфокусировалась на одном — и результат пришёл быстрее, чем ожидала.",
    name: "Юлия, 29 лет",
    role: "Дизайнер, нашла свою нишу",
  },
];

export default function IncomeLanding() {
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
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Banknote" size={14} />
                Подбор дохода
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Твои навыки стоят<br />
                <span className="text-emerald-600">больше, чем ты думаешь</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Алгоритм анализирует, что ты умеешь и как хочешь работать — и подбирает конкретные варианты заработка.
                Не «попробуй фриланс», а точный список с объяснением, почему это подойдёт именно тебе.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/income-bot")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Подобрать доход — 290 ₽
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
            {/* Image */}
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/be69e269-e879-46ce-b124-aedf80b400d3.jpg"
                  alt="Работа, которая приносит доход"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">После подбора</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что изменится для тебя</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Ясность в деньгах — это не про цифры. Это про уверенность, что ты двигаешься в правильную сторону.
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
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-emerald-700 font-semibold text-sm uppercase tracking-widest mb-4">Знакомо?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Понимаешь, что можешь зарабатывать больше — но непонятно, за счёт чего именно.",
                "Пересмотрел десятки статей про «как зарабатывать онлайн» — и всё равно нет ясности.",
                "Боишься уйти в никуда: вдруг не получится, вдруг навыки недостаточно ценные.",
                "Хочешь дополнительный доход, но не знаешь, с чего начать и сколько это реально займёт.",
                "Слышишь «развивай личный бренд» и «выходи на международный рынок» — но это не про тебя.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-emerald-700" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Проблема не в тебе. Проблема в том, что советы универсальные, а ситуация — твоя. Подбор дохода работает с твоим конкретным профилем.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Результат</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что получишь в итоге</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Не список идей, а твой план</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Каждый вариант подобран под тебя. Никаких «а вдруг подойдёт» — только то, что совпадает с твоим профилем.
                </p>
              </div>
              <button
                onClick={() => navigate("/income-bot")}
                className="mt-6 bg-white text-emerald-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors w-full sm:w-auto"
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
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">4 шага до твоего варианта дохода</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-emerald-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-emerald-50 border border-emerald-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Lock" size={20} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-emerald-700 font-medium">Никакого AI при анализе ответов</p>
            <p className="text-xs text-emerald-500 mt-1">
              Только математические формулы и реальный анализ рыночных ниш. Один и тот же ответ — всегда один и тот же результат.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Как нашли свой доход другие</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-emerald-100 mb-4" />
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-emerald-600" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Хватит гадать, что может принести деньги
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              20 минут — и у тебя будет конкретный список вариантов заработка, подобранных под тебя.
              Не теория. Не вдохновение. Реальный следующий шаг.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/income-bot")}
                className="bg-white text-emerald-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-emerald-50 transition-colors"
              >
                Подобрать доход — 290 ₽
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
