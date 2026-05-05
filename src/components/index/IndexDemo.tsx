import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const demoQuestions = [
  {
    text: "Когда что-то важное нужно сделать, ты чаще всего...",
    options: [
      "Откладываю — не могу заставить себя начать",
      "Начинаю, но быстро теряю энергию",
      "Делаю, но потом чувствую опустошение",
      "Делаю без проблем, мне комфортно",
    ],
    scores: [
      [3, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 3],
    ],
  },
  {
    text: "Как ты зарабатываешь деньги — или хотел бы зарабатывать?",
    options: [
      "Хочу сам решать, когда и сколько работать",
      "Мне нужна стабильность — фиксированный доход",
      "Хочу помогать людям и получать за это",
      "Хочу создавать что-то своё — продукт, бизнес",
    ],
    scores: [
      [1, 0, 0, 2],
      [0, 2, 0, 0],
      [0, 0, 2, 1],
      [0, 0, 0, 3],
    ],
  },
  {
    text: "Что лучше всего описывает твоё состояние сейчас?",
    options: [
      "Много планов, но ничего не двигается",
      "Устал, хочется отдохнуть и перезагрузиться",
      "Непонятно куда идти — нет ясного направления",
      "Есть направление, но что-то внутри тормозит",
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
    emoji: "🔒",
    label: "Твой блок: прокрастинация и страх старта",
    desc: "Ты знаешь, что делать — но что-то внутри останавливает. Скорее всего это страх ошибки или неопределённости. Тебе подойдёт модель с чёткой структурой и маленькими шагами.",
    model: "Модель дохода: фриланс с понятными задачами или найм с ростом",
  },
  {
    emoji: "🔋",
    label: "Твой блок: выгорание и перегруз",
    desc: "Ты много стараешься, но ресурс заканчивается. Текущая модель работы не совпадает с твоей энергетикой. Тебе нужен доход, который даёт восстановление, а не только нагрузку.",
    model: "Модель дохода: автономная занятость или гибкий формат",
  },
  {
    emoji: "🧭",
    label: "Твой блок: расфокус и отсутствие направления",
    desc: "Ты хочешь двигаться, но не понимаешь куда. Много вариантов — и ни одного выбора. Тебе нужна система, которая поможет выбрать одно и идти.",
    model: "Модель дохода: экспертная деятельность или создание своего продукта",
  },
  {
    emoji: "🚧",
    label: "Твой блок: внутренний тормоз",
    desc: "Направление есть, но что-то не даёт двигаться. Это могут быть убеждения, чужие ожидания или страх результата. Полный тест покажет точно.",
    model: "Модель дохода: собственное дело или партнёрство",
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
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Мини-тест</p>
          <h2 className="text-3xl font-black text-foreground">Узнай свой блок за 3 вопроса</h2>
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
              <div className="gradient-brand text-white font-bold text-base rounded-2xl px-6 py-3 inline-block mb-4">
                {r.emoji} {r.label}
              </div>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{r.desc}</p>
              <div className="bg-accent/40 border border-accent rounded-2xl px-5 py-3 mb-2 text-sm font-semibold text-foreground">
                <Icon name="Banknote" size={14} className="inline mr-1.5 text-primary" />
                {r.model}
              </div>
              <p className="text-muted-foreground text-xs mb-8">Полный тест из 40+ вопросов даст точный профиль, все блоки и конкретные рекомендации</p>
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
