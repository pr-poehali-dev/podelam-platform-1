import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";

const META = {
  title: "Барьеры и тревога — найди, что тебя останавливает | ПоДелам",
  description:
    "Выявляет страхи, синдром самозванца и прокрастинацию. Узнай, что именно мешает тебе двигаться вперёд — и получи конкретный план работы с этим.",
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
    icon: "Unlock",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    title: "Освобождение",
    text: "Наконец понимаешь, что тебя держало. Не лень, не характер — конкретный барьер, с которым можно работать.",
  },
  {
    icon: "Wind",
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-100",
    title: "Лёгкость",
    text: "Тревога перестаёт быть фоновым шумом. Ты знаешь её источник — и это уже не страшно.",
  },
  {
    icon: "Flame",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Движение",
    text: "Снова появляются силы на то, что раньше казалось непосильным. Первые шаги идут легче.",
  },
  {
    icon: "Shield",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Опора",
    text: "Синдром самозванца теряет власть. Ты видишь себя реально — без самобичевания и без иллюзий.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "AlertTriangle",
    title: "Карта страхов",
    desc: "Какие именно страхи управляют твоими решениями — страх провала, осуждения, успеха или неизвестности.",
  },
  {
    icon: "Ghost",
    title: "Синдром самозванца",
    desc: "Есть ли он у тебя, в какой форме и как именно мешает двигаться вперёд и брать на себя ответственность.",
  },
  {
    icon: "Clock",
    title: "Прокрастинация",
    desc: "Что стоит за откладыванием — страх, перфекционизм или нехватка смысла. Разные причины — разные решения.",
  },
  {
    icon: "Battery",
    title: "Уровень тревоги",
    desc: "Хроническая тревога или ситуативная. Где она нарастает и что именно её запускает в твоей жизни.",
  },
  {
    icon: "Map",
    title: "План работы",
    desc: "Конкретные шаги под твой профиль барьеров — не общие советы, а адресные действия для твоей ситуации.",
  },
];

const STEPS = [
  { num: "01", title: "Отвечаешь честно", desc: "Вопросы про твоё поведение, реакции и ситуации. Нет правильных ответов." },
  { num: "02", title: "Алгоритм определяет", desc: "Система выявляет паттерны и классифицирует барьеры по типам и силе." },
  { num: "03", title: "Получаешь карту", desc: "Подробный разбор: что мешает, как именно и что с этим делать." },
  { num: "04", title: "Действуешь иначе", desc: "Понимаешь механику своих блоков — и знаешь, как их обходить." },
];

const QUOTES = [
  {
    text: "Думала, что просто ленюсь и нет силы воли. Оказалось — страх критики. Как только это увидела, стало намного легче делать и показывать работу.",
    name: "Светлана, 31 год",
    role: "Дизайнер, запустила собственный проект",
  },
  {
    text: "Синдром самозванца буквально останавливал меня перед каждым важным шагом. Разбор показал точную точку, с которой всё начинается. Это изменило многое.",
    name: "Алексей, 35 лет",
    role: "Руководитель, перешёл на новый уровень",
  },
  {
    text: "Откладывала запуск курса почти год. После анализа барьеров поняла — это перфекционизм плюс страх провала. Через две недели запустила.",
    name: "Екатерина, 28 лет",
    role: "Онлайн-преподаватель",
  },
];

export default function BarrierLanding() {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="ShieldAlert" size={14} />
                Барьеры и тревога
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight mb-5 sm:mb-6">
                Ты не ленивый<br />
                <span className="text-rose-600">Тебя просто что-то держит</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Страхи, синдром самозванца и прокрастинация — это не черты характера.
                Это конкретные барьеры с конкретными причинами. Найди их — и они перестанут управлять тобой.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/barrier-bot")}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base transition-colors"
                >
                  Выявить барьеры — 290 ₽
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white border border-border text-foreground font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-muted transition-colors"
                >
                  Все инструменты — 990 ₽/мес
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">290 ₽ · Без AI-галлюцинаций · 20 минут</p>
            </div>
            {/* Image */}
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/d86fccec-7c5d-448d-b445-a5e65ca8f587.jpg"
                  alt="Уверенность и движение вперёд"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEELINGS */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">После разбора</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Как это изменит твою жизнь</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Когда видишь барьер — он теряет силу. Это не метафора, это механика психики.
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
          <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 rounded-3xl p-6 sm:p-8 md:p-10">
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-4">Узнаёшь себя?</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                "Знаешь, что нужно сделать — но снова откладываешь. И сам не понимаешь почему.",
                "Получаешь комплимент — и тут же думаешь: «Просто повезло» или «Они не знают, какой я на самом деле».",
                "Перед важным шагом накрывает тревога, и ты ждёшь, когда она пройдёт. Она не проходит.",
                "Сравниваешь себя с другими — и всегда оказываешься хуже. Хотя окружающие так не думают.",
                "Хочешь перемен, но страх ошибиться оказывается сильнее желания измениться.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="X" size={11} className="text-rose-600" />
                  </div>
                  <p className="text-foreground text-[14px] sm:text-[15px] leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
              Это не слабость. Это барьеры — и у каждого из них есть имя, механика и способ работы с ним.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Результат</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Что ты узнаешь о своих барьерах</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                  <Icon name={item.icon} size={20} className="text-rose-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2">Видишь барьер — берёшь контроль</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Большинство людей борются с симптомами. Ты узнаешь причину — и меняешь правила игры.
                </p>
              </div>
              <button
                onClick={() => navigate("/barrier-bot")}
                className="mt-6 bg-white text-rose-600 font-bold px-5 py-3 rounded-xl text-sm hover:bg-rose-50 transition-colors w-full sm:w-auto"
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
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">4 шага к свободе от барьеров</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-4 sm:gap-5 bg-white rounded-3xl p-5 sm:p-6 border border-border">
                <span className="text-3xl sm:text-4xl font-black text-rose-200 leading-none shrink-0">{s.num}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 sm:mt-6 bg-rose-50 border border-rose-100 rounded-3xl p-5 sm:p-6 text-center">
            <Icon name="Lock" size={20} className="text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-rose-700 font-medium">Никакого AI при анализе ответов</p>
            <p className="text-xs text-rose-500 mt-1">
              Только математические формулы и проверенные психологические модели. Один и тот же ответ — всегда один и тот же результат.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-12 sm:py-16 px-4 bg-white/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-rose-600 font-semibold text-sm uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Как изменилось у других</h2>
          </div>
          <div className="rounded-3xl bg-white border border-border p-6 sm:p-8 md:p-10 min-h-[200px]">
            <Icon name="Quote" size={36} className="text-rose-100 mb-4" />
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
                  className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? "w-6 bg-rose-600" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-3xl p-7 sm:p-10 md:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">
              Хватит бороться с собой.
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-xl mx-auto">
              20 минут — и ты будешь знать, что именно тебя держит.
              Конкретный барьер, конкретная причина, конкретный путь вперёд.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/barrier-bot")}
                className="bg-white text-rose-600 font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-[15px] sm:text-base hover:bg-rose-50 transition-colors"
              >
                Выявить барьеры — 290 ₽
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