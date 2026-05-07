import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import IndexNav from "@/components/index/IndexNav";
import LandingFooter from "@/components/landing/LandingFooter";

const recognizeCards = [
  {
    icon: "RefreshCw",
    title: "Постоянно думаешь о смене жизни",
    text: "Ты чувствуешь, что текущая работа или способ заработка тебе не подходит, но не понимаешь, куда идти дальше.",
  },
  {
    icon: "Zap",
    title: "Начинаешь — и бросаешь",
    text: "У тебя есть идеи и желание что-то изменить, но энергия быстро заканчивается.",
  },
  {
    icon: "Route",
    title: "Пробовал разные варианты",
    text: "Курсы, новые направления, попытки заработать — но ничего не дало ощущения «это моё».",
  },
  {
    icon: "BrainCog",
    title: "Устал от постоянного напряжения",
    text: "Ты много думаешь о будущем и деньгах, но вместо ясности появляется тревога и перегруз.",
  },
];

const fitList = [
  "хочешь понять, почему стоишь на месте",
  "не понимаешь, как тебе зарабатывать",
  "выгорел от постоянных попыток",
  "хочешь больше ясности и структуры",
  "устал сравнивать себя с другими",
  "хочешь понять свои сильные стороны",
];

const notFitList = [
  "ищешь «волшебную кнопку»",
  "не готов смотреть на себя честно",
  "хочешь мотивацию вместо конкретики",
  "не собираешься ничего менять",
];

const resultCards = [
  { icon: "Lock", text: "Что тебя тормозит" },
  { icon: "Flame", text: "Почему ты выгораешь" },
  { icon: "TrendingDown", text: "Где ты теряешь деньги" },
  { icon: "Briefcase", text: "Какой формат заработка тебе подходит" },
  { icon: "Map", text: "Как тебе двигаться дальше" },
  { icon: "Star", text: "В чём твои настоящие сильные стороны" },
];

const questions = [
  {
    q: "Что тебе ближе?",
    options: [
      "Мне сложно выбрать направление",
      "Я быстро выгораю",
      "Я начинаю и бросаю",
      "Я не расту в доходе",
    ],
  },
  {
    q: "Что происходит чаще?",
    options: ["Откладываю", "Перегружаю себя", "Сомневаюсь в себе", "Теряю мотивацию"],
  },
  {
    q: "Что тебе сейчас нужнее всего?",
    options: ["Понять себя", "Понять, как зарабатывать", "Вернуть энергию", "Найти направление"],
  },
];

export default function ForWhom() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (option: string) => {
    const next = [...answers, option];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />

      {/* HERO */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(252,60%,48%,0.06)] via-transparent to-[hsl(280,40%,92%,0.3)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Icon name="Users" size={15} />
                Для кого ПоДелам
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
                Для тех, кто чувствует, что может больше —&nbsp;но не понимает, почему не получается
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl lg:max-w-none">
                ПоДелам помогает понять: что тебя тормозит, где ты теряешь энергию и деньги, как тебе зарабатывать без выгорания.
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
                className="gradient-brand text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
              >
                Пройти тест
              </button>
            </div>
            {/* Image */}
            <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/741564a6-c2d0-4428-b0e2-641da5b4bbc2.jpg"
                  alt="Человек на перепутье — ищет своё направление"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* УЗНАЕШЬ СЕБЯ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Ты узнаешь себя, если…
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Эти ситуации знакомы большинству наших пользователей
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
        </div>
      </section>

      {/* CTA mid */}
      <section className="py-10 px-4 bg-gradient-to-r from-[hsl(252,60%,48%)] to-[hsl(280,60%,52%)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/90 text-base sm:text-lg font-medium mb-4">
            Если хоть один пункт откликнулся — сервис создан для тебя
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
            className="bg-white text-primary font-bold px-7 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
          >
            Пройти тест
          </button>
        </div>
      </section>

      {/* КОМУ ПОДОЙДЁТ / НЕ ПОДОЙДЁТ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Подойдёт */}
          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground">ПоДелам подойдёт тебе, если ты:</h2>
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

          {/* Не подойдёт */}
          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Icon name="XCircle" size={20} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-black text-foreground">Сервис не подойдёт, если ты:</h2>
            </div>
            <ul className="space-y-3">
              {notFitList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Icon name="X" size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground border-t border-border pt-4">
              Честность — основа нашего подхода. Мы не обещаем магию, только конкретику.
            </p>
          </div>
        </div>
      </section>

      {/* ЧТО ПОЙМЁШЬ */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Что ты поймёшь после прохождения
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultCards.map((card) => (
              <div
                key={card.text}
                className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5"
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

      {/* МИНИ-РАСЧЁТ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Icon name="Sparkles" size={15} />
              Быстрая проверка
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Проверь, что мешает тебе двигаться вперёд
            </h2>
            <p className="text-muted-foreground text-base">
              Ответь на 3 коротких вопроса и получи предварительный результат
            </p>
          </div>

          {!showResult ? (
            <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
              <div className="flex gap-1 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Вопрос {step + 1} из {questions.length}
              </p>
              <h3 className="text-lg font-bold text-foreground mb-5">
                {questions[step].q}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="text-left px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-accent/50 transition-all text-sm font-medium text-foreground"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-primary/20 bg-background overflow-hidden">
              <div className="gradient-brand p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Lightbulb" size={20} className="text-white/80" />
                  <span className="text-white/80 text-sm font-medium">Предварительный результат</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  Похоже, твой главный блок — перегруз и расфокус
                </h3>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Ты пытаешься держать слишком много задач и направлений одновременно. Из-за этого энергия рассеивается, а движение вперёд становится хаотичным.
                </p>
                <div className="bg-accent/50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-foreground mb-3">Полный разбор покажет:</p>
                  <ul className="space-y-2">
                    {[
                      "где именно ты теряешь энергию",
                      "какая модель заработка тебе подходит",
                      "что делать дальше",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="ArrowRight" size={14} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
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

      {/* БЛОК ДОВЕРИЯ */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6">
            Почему людям откликается этот разбор
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
            Потому что он показывает не абстрактную «личность», а реальные причины: почему не получается, где человек буксует, как ему лучше действовать и зарабатывать.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "Target", label: "Конкретные причины, не общие слова" },
              { icon: "BarChart2", label: "Анализ, а не тест на тип личности" },
              { icon: "Handshake", label: "Честно о том, что мешает" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-white p-5 text-center">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-3">
                  <Icon name={item.icon} fallback="Circle" size={20} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-3xl gradient-brand p-10 sm:p-14 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
              С тобой всё нормально. Нужно просто понять свою модель.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              Пройди тест и получи персональный разбор своих блоков, сильных сторон и подходящего способа заработка.
            </p>
            <button
              onClick={() => navigate(isLoggedIn ? "/cabinet" : "/auth")}
              className="bg-white text-primary font-bold px-10 py-4 rounded-2xl text-base hover:bg-white/90 transition-colors shadow-lg"
            >
              Пройти тест
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}