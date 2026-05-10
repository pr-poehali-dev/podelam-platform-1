import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import LandingFooter from "@/components/landing/LandingFooter";

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

const META = {
  title: "Для кого ПоДелам — если чувствуешь, что способен на большее",
  description: "Персональный разбор сильных сторон и модели роста — для тех, кто хочет двигаться увереннее, зарабатывать легче и не выгорать.",
};

const recognizeCards = [
  {
    icon: "Layers",
    title: "Есть потенциал, но нет структуры",
    text: "Ты чувствуешь, что можешь больше — но сложно собраться и выстроить понятный путь. Много идей, мало движения.",
  },
  {
    icon: "GitBranch",
    title: "Постоянные сомнения в выборе",
    text: "Распыляешься между направлениями и не можешь сосредоточиться на одном. Каждое решение даётся с трудом.",
  },
  {
    icon: "BatteryLow",
    title: "Быстро теряешь энергию",
    text: "Работаешь, стараешься — но ресурс заканчивается. Хочется большего, но не понимаешь, куда двигаться.",
  },
  {
    icon: "Compass",
    title: "Нет ясности и опоры на себя",
    text: "Пробовал разные варианты, но ощущения «это моё» так и не появилось. Чувствуешь, что теряешь ориентир.",
  },
];

const fitList = [
  "хочешь понять свои сильные стороны",
  "не понимаешь, какой формат реализации тебе подходит",
  "выгораешь от попыток двигаться вперёд",
  "хочешь больше ясности и внутренней опоры",
  "устал копировать чужие модели успеха",
  "чувствуешь потенциал, но не можешь собрать его в систему",
];

const notFitList = [
  "ищешь «волшебную кнопку» без усилий",
  "не готов смотреть на себя честно",
  "хочешь мотивацию вместо конкретики",
  "не собираешься ничего менять",
];

const resultCards = [
  { icon: "Zap", text: "В чём твои сильные стороны" },
  { icon: "Anchor", text: "Твоя внутренняя опора" },
  { icon: "TrendingUp", text: "Твой стиль роста" },
  { icon: "Banknote", text: "Твоя модель дохода" },
  { icon: "ShieldAlert", text: "Что тормозит твой потенциал" },
  { icon: "Target", text: "Конкретные рекомендации под тебя" },
];

const questions = [
  {
    q: "Что тебе ближе прямо сейчас?",
    options: [
      "Чувствую потенциал, но нет структуры",
      "Быстро теряю энергию на пути к цели",
      "Не могу выбрать одно направление",
      "Знаю куда, но что-то тормозит изнутри",
    ],
  },
  {
    q: "Как ты чаще всего принимаешь важные решения?",
    options: [
      "Долго анализирую и всё равно сомневаюсь",
      "Слушаю других больше, чем себя",
      "Начинаю двигаться, но теряю уверенность",
      "Откладываю, пока не стало слишком поздно",
    ],
  },
  {
    q: "Что тебе сейчас нужнее всего?",
    options: [
      "Понять свои сильные стороны",
      "Найти подходящий формат дохода",
      "Вернуть энергию и опору на себя",
      "Получить ясность и конкретный путь",
    ],
  },
];

const resultsByAnswer: Record<number, { label: string; desc: string; model: string }> = {
  0: {
    label: "Стратегический аналитик",
    desc: "Ты умеешь видеть систему, но перегруз вариантами и сомнения мешают двигаться. Тебе нужна структура и фокус на одном направлении.",
    model: "Стиль роста: постепенно, через структуру и чёткие шаги",
  },
  1: {
    label: "Энергичный инициатор",
    desc: "Легко загораешься, но быстро теряешь ресурс. Текущий формат работы не совпадает с твоей энергетикой.",
    model: "Стиль роста: гибкий формат с автономией и без рутины",
  },
  2: {
    label: "Человек с широким взглядом",
    desc: "Видишь много возможностей, но расфокус мешает выбрать одно и идти до конца.",
    model: "Стиль роста: экспертность или создание своего продукта",
  },
  3: {
    label: "Практик с внутренним тормозом",
    desc: "Понимаешь куда двигаться, но внутренние ограничения или чужие ожидания тормозят реализацию.",
    model: "Стиль роста: работа с паттернами откроет потенциал, который уже есть",
  },
};

export default function ForWhom() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    return () => { document.title = prevTitle; };
  }, []);

  const [step, setStep] = useState(0);
  const [firstAnswer, setFirstAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    if (step === 0) setFirstAnswer(optionIndex);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setFirstAnswer(null);
    setShowResult(false);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const result = resultsByAnswer[firstAnswer ?? 0];

  return (
    <div className="min-h-screen bg-background font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />

      {/* HERO */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,60%,48%,0.06)] via-transparent to-[hsl(280,40%,92%,0.3)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Icon name="Users" size={15} />
                Для кого ПоДелам
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
                Для тех, кто чувствует, что способен на большее — но нет ясности, как это реализовать
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl lg:max-w-none">
                ПоДелам помогает собрать себя в систему: понять сильные стороны, найти свою модель роста и дохода — и двигаться увереннее без выгорания.
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
                className="gradient-brand text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
              >
                Пройти разбор
              </button>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground justify-center lg:justify-start">
                <div className="flex items-center gap-1.5"><Icon name="XCircle" size={14} className="text-muted-foreground" />Без абстрактной психологии</div>
                <div className="flex items-center gap-1.5"><Icon name="Target" size={14} className="text-primary" />Конкретные выводы</div>
                <div className="flex items-center gap-1.5"><Icon name="User" size={14} className="text-primary" />Под тебя, а не «для всех»</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/741564a6-c2d0-4428-b0e2-641da5b4bbc2.jpg"
                  alt="Пойми свои сильные стороны и выстрой свою модель"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* УЗНАЁШЬ СЕБЯ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Узнаёшь себя?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Ты чувствуешь, что способен на большее
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Дело не в усилиях — дело в том, что ты ещё не собрал себя в систему.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {recognizeCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <Icon name={card.icon} fallback="Circle" size={22} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-accent/40 border border-accent rounded-2xl p-5 text-center max-w-2xl mx-auto">
            <p className="text-foreground font-medium text-sm">
              👉 И в какой-то момент начинаешь <span className="font-bold text-primary">терять опору на себя</span> — хотя потенциал никуда не делся
            </p>
          </div>
        </div>
      </section>

      {/* CTA mid */}
      <section className="py-10 px-4 bg-gradient-to-r from-[hsl(252,60%,48%)] to-[hsl(280,60%,52%)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/90 text-base sm:text-lg font-medium mb-4">
            Если хоть один пункт откликнулся — разбор создан для тебя
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
            className="bg-white text-primary font-bold px-7 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            Пройти разбор
          </button>
        </div>
      </section>

      {/* ПРОБЛЕМА */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-foreground">Проблема не в тебе</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Большинство людей не реализуют потенциал не потому, что недостаточно стараются. А потому что:
            </p>
            <ul className="space-y-3">
              {[
                "не понимают свои сильные стороны",
                "пытаются жить «как правильно», а не «как подходит им»",
                "выбирают неподходящий формат работы и нагрузки",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Icon name="X" size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">
                👉 В результате — хаос, перегруз и постоянные сомнения
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground">ПоДелам подойдёт, если ты:</h2>
            </div>
            <ul className="space-y-3">
              {fitList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Icon name="Check" size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Icon name="XCircle" size={20} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-black text-foreground">Сервис не подойдёт, если ты:</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {notFitList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Icon name="X" size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground border-t border-border pt-4">
              Честность — основа нашего подхода. Мы не обещаем магию, только конкретику.
            </p>
          </div>
        </div>
      </section>

      {/* ЧТО ПОЛУЧИШЬ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Результат</p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Не просто описание — а понимание себя и своего пути
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Разбор, который можно применять в жизни — без воды и абстрактных формулировок
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultCards.map((card) => (
              <div
                key={card.text}
                className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Icon name={card.icon} fallback="Circle" size={20} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{card.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* МИНИ-РАЗБОР */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Icon name="Sparkles" size={15} />
              Мини-разбор
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Узнай свой тип за 3 вопроса
            </h2>
            <p className="text-muted-foreground text-base">
              Без правильных и неправильных ответов
            </p>
          </div>

          {!showResult ? (
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <div className="flex gap-1 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Вопрос {step + 1} из {questions.length}
              </p>
              <h3 className="text-lg font-bold text-foreground mb-5">
                {questions[step].q}
              </h3>
              <div className="space-y-3">
                {questions[step].options.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(i)}
                    className="w-full text-left px-5 py-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent/50 transition-all text-sm font-medium text-foreground"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-primary/20 bg-white overflow-hidden">
              <div className="gradient-brand p-6 sm:p-8 text-center">
                <p className="text-white/70 text-sm mb-2">Предварительный разбор</p>
                <h3 className="text-xl sm:text-2xl font-black text-white">{result.label}</h3>
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{result.desc}</p>
                <div className="bg-accent/40 border border-accent rounded-xl p-4">
                  <Icon name="TrendingUp" size={14} className="inline mr-1.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{result.model}</span>
                </div>
                <div className="bg-accent/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Полный разбор покажет:</p>
                  <ul className="space-y-2">
                    {[
                      "все твои сильные стороны и ограничения",
                      "подходящую модель дохода и реализации",
                      "конкретные шаги под твою ситуацию",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="ArrowRight" size={14} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
                    className="gradient-brand text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity flex-1 text-center"
                  >
                    Получить полный разбор
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="text-muted-foreground text-sm px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    Пройти снова
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ДОВЕРИЕ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Почему это работает</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6">
            Почему людям откликается этот разбор
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
            Потому что он помогает увидеть свои сильные стороны, причины внутреннего хаоса и подходящий формат реализации. И наконец почувствовать ясность и опору на себя.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "Target", label: "Конкретные выводы, не общие слова" },
              { icon: "BarChart2", label: "Разбор паттернов, не тест на тип" },
              { icon: "User", label: "Под тебя, а не «для всех»" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                  <Icon name={item.icon} fallback="Circle" size={18} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-brand rounded-3xl p-8 sm:p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-snug">
                У тебя уже есть потенциал.<br />Нужно понять, как раскрыть его правильно.
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
                Пройди персональный разбор и выстрой свою модель роста, реализации и дохода.
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
                className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
              >
                Пройти разбор
              </button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
