import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const demoQuestions = [
  {
    text: "Когда нужно принять важное решение, ты чаще всего...",
    options: [
      "Долго анализирую и сомневаюсь — боюсь ошибиться",
      "Начинаю двигаться, но быстро теряю уверенность",
      "Слушаю других больше, чем себя",
      "Принимаю решение, но потом перепроверяю снова",
    ],
    scores: [
      [3, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 3],
    ],
  },
  {
    text: "Как ты чаще всего работаешь — или хотел бы работать?",
    options: [
      "Самостоятельно, с гибким графиком и своими задачами",
      "В стабильной структуре с понятными обязанностями",
      "Помогаю людям — это даёт смысл",
      "Создаю что-то своё — продукт, бизнес, систему",
    ],
    scores: [
      [1, 0, 0, 2],
      [0, 2, 0, 0],
      [0, 0, 2, 1],
      [0, 0, 0, 3],
    ],
  },
  {
    text: "Что точнее всего описывает твоё состояние сейчас?",
    options: [
      "Чувствую потенциал, но не могу собрать его в систему",
      "Быстро устаю и теряю энергию на пути к цели",
      "Много направлений — не знаю, на чём сфокусироваться",
      "Знаю куда двигаться, но что-то внутри тормозит",
    ],
    scores: [
      [3, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 3],
    ],
  },
];

const resultProfiles = [
  {
    emoji: "🧠",
    label: "Стратегический аналитик",
    strength: "Умеешь видеть систему и принимать взвешенные решения",
    block: "Перегруз вариантами и постоянные сомнения мешают двигаться",
    growth: "Постепенное развитие через структуру и фокус на одном направлении",
    model: "Модель роста: убрать лишние задачи и выстроить понятную систему действий",
  },
  {
    emoji: "⚡",
    label: "Энергичный инициатор",
    strength: "Легко загораешься и запускаешь новое — это твоя сила",
    block: "Быстро теряешь ресурс, если формат работы не совпадает с твоей энергетикой",
    growth: "Гибкий формат с автономией — без жёсткой рутины и микроменеджмента",
    model: "Модель роста: фриланс, экспертность или своё небольшое дело",
  },
  {
    emoji: "🧭",
    label: "Человек с широким взглядом",
    strength: "Видишь много возможностей и умеешь думать нестандартно",
    block: "Расфокус и сложность выбора одного направления тормозят реализацию",
    growth: "Структура и чёткий фокус помогут превратить потенциал в конкретный результат",
    model: "Модель роста: экспертная деятельность или создание собственного продукта",
  },
  {
    emoji: "🚀",
    label: "Практик с внутренним тормозом",
    strength: "Понимаешь куда двигаться и умеешь работать системно",
    block: "Внутренние ограничивающие убеждения или чужие ожидания тормозят рост",
    growth: "Работа с внутренними паттернами откроет потенциал, который уже есть",
    model: "Модель роста: собственное дело или партнёрство с чёткими ролями",
  },
];

function getResult(answers: Record<number, number>) {
  const totals = [0, 0, 0, 0];
  demoQuestions.forEach((q, qi) => {
    const ai = answers[qi] ?? 0;
    q.scores[ai].forEach((s, ci) => { totals[ci] += s; });
  });
  let maxIdx = 0;
  for (let i = 1; i < totals.length; i++) {
    if (totals[i] > totals[maxIdx]) maxIdx = i;
  }
  return resultProfiles[maxIdx];
}

export default function IndexDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (qi: number, ai: number) => {
    setAnswers({ ...answers, [qi]: ai });
    if (qi < demoQuestions.length - 1) {
      setTimeout(() => setStep(qi + 1), 300);
    } else {
      setStep(demoQuestions.length);
    }
  };

  return (
    <section id="demo" className="py-12 md:py-20 bg-white/60">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Мини-разбор</p>
          <h2 className="text-3xl font-black text-foreground">Узнай свой тип за 3 вопроса</h2>
          <p className="text-muted-foreground mt-2">Честные вопросы — без правильных ответов</p>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm p-5 sm:p-8">
          {step < demoQuestions.length ? (
            <div className="animate-fade-in-up" key={step}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Вопрос {step + 1} из {demoQuestions.length}</span>
                <div className="flex gap-1.5">
                  {demoQuestions.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-8 gradient-brand" : "w-4 bg-secondary"}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-6 leading-snug">{demoQuestions[step].text}</h3>
              <div className="space-y-3">
                {demoQuestions[step].options.map((opt, ai) => (
                  <button
                    key={ai}
                    onClick={() => handleAnswer(step, ai)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-[14px] font-medium transition-all duration-200 ${
                      answers[step] === ai
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-secondary/30 text-foreground hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center animate-scale-in">
              {(() => { const r = getResult(answers); return (<>
              <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">{r.emoji}</span>
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">Вот твой предварительный разбор</h3>
              <div className="gradient-brand text-white font-bold text-base rounded-2xl px-6 py-3 inline-block mb-6">
                {r.emoji} {r.label}
              </div>
              <div className="space-y-3 text-left mb-6">
                <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-3">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Сильная сторона</p>
                  <p className="text-sm text-foreground">{r.strength}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide mb-1">Что мешает</p>
                  <p className="text-sm text-foreground">{r.block}</p>
                </div>
                <div className="bg-accent/40 border border-accent rounded-2xl px-5 py-3">
                  <Icon name="TrendingUp" size={14} className="inline mr-1.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{r.model}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs mb-8">Полный разбор из 40+ вопросов даёт точный профиль, все ограничения и конкретные рекомендации</p>
              </>); })()}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/auth")}
                  className="gradient-brand text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Получить полный разбор
                </button>
                <button
                  onClick={() => { setStep(0); setAnswers({}); }}
                  className="border border-border text-foreground font-medium px-6 py-3.5 rounded-2xl hover:bg-secondary transition-colors text-sm"
                >
                  Пройти снова
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
