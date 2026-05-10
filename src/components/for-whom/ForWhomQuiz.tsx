import { useState } from "react";
import Icon from "@/components/ui/icon";

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

interface ForWhomQuizProps {
  isLoggedIn: boolean;
  onNavigate: (path: string) => void;
}

export default function ForWhomQuiz({ isLoggedIn, onNavigate }: ForWhomQuizProps) {
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

  const result = resultsByAnswer[firstAnswer ?? 0];

  return (
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
                  onClick={() => onNavigate(isLoggedIn ? "/cabinet" : "/auth")}
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
  );
}
