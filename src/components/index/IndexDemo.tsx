import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const demoQuestions = [
  {
    text: "Когда ты помогаешь другому человеку решить его проблему, ты чувствуешь...",
    options: ["Настоящее удовольствие и энергию", "Удовлетворение, но это не главное", "Усталость, хотя понимаю важность", "Скорее раздражение, чем радость"],
  },
  {
    text: "В свободное время тебя больше всего привлекает...",
    options: ["Создавать что-то своими руками", "Читать, учиться, анализировать", "Общаться и придумывать идеи вместе", "Организовывать, выстраивать системы"],
  },
  {
    text: "Ты скорее предпочтёшь работу, где...",
    options: ["Каждый день разные задачи", "Чёткая структура и понятный результат", "Много контактов с людьми", "Можно работать самостоятельно и в тишине"],
  },
];

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
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Демо</p>
          <h2 className="text-3xl font-black text-foreground">Попробуй прямо сейчас</h2>
          <p className="text-muted-foreground mt-2">Три вопроса из настоящего теста</p>
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
              <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-5">
                <Icon name="CheckCircle" size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">Отлично!</h3>
              <p className="text-muted-foreground mb-2">На основе твоих ответов видно склонность к</p>
              <div className="gradient-brand text-white font-bold text-lg rounded-2xl px-6 py-3 inline-block mb-5">
                🎨 Творческой и коммуникативной деятельности
              </div>
              <p className="text-muted-foreground text-sm mb-8">Полный тест даст точный профиль из 40+ вопросов и конкретные рекомендации</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/auth")}
                  className="gradient-brand text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Получить полный результат
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
