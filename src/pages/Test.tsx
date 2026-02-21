import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

type Question = {
  id: number;
  text: string;
  type: "choice" | "scale" | "open";
  options?: string[];
};

const склонностиQuestions: Question[] = [
  { id: 1, text: "Когда ты помогаешь другому человеку решить его проблему, ты чувствуешь...", type: "choice", options: ["Настоящее удовольствие и энергию", "Удовлетворение, но не главное", "Усталость, хотя понимаю важность", "Скорее раздражение"] },
  { id: 2, text: "В свободное время тебя больше всего привлекает...", type: "choice", options: ["Создавать что-то руками", "Читать, анализировать", "Общаться и придумывать идеи", "Организовывать, строить системы"] },
  { id: 3, text: "Ты скорее предпочтёшь работу, где...", type: "choice", options: ["Каждый день разные задачи", "Чёткая структура и результат", "Много контактов с людьми", "Самостоятельно и в тишине"] },
  { id: 4, text: "Когда тебе дают сложную задачу без инструкций, ты...", type: "choice", options: ["С энтузиазмом ищешь решение", "Разбиваешь на части и методично решаешь", "Советуешься с другими", "Испытываешь стресс, но справляешься"] },
  { id: 5, text: "Насколько тебе важно, чтобы твоя работа влияла на жизнь других людей?", type: "scale" },
  { id: 6, text: "Ты скорее человек идей или человек реализации?", type: "choice", options: ["Человек идей — генерирую, другие воплощают", "Баланс идей и реализации", "Человек реализации — воплощаю чужие идеи", "Зависит от задачи"] },
  { id: 7, text: "Какой формат работы тебе ближе?", type: "choice", options: ["Полная свобода и удалёнка", "Гибрид — офис + дом", "Команда в офисе", "Неважно, главное задачи"] },
  { id: 8, text: "Насколько ты готов к нестабильному доходу ради любимого дела?", type: "scale" },
  { id: 9, text: "Что для тебя важнее в работе?", type: "choice", options: ["Творческая свобода", "Высокий доход", "Влияние и смысл", "Стабильность и комфорт"] },
  { id: 10, text: "Что бы ты делал, если бы деньги не имели значения?", type: "open" },
];

const психологическийQuestions: Question[] = [
  { id: 1, text: "Когда ты принимаешь важное решение, ты больше опираешься на...", type: "choice", options: ["Логику и факты", "Интуицию и ощущения", "Мнение близких", "Анализ плюсов и минусов"] },
  { id: 2, text: "В конфликтной ситуации ты обычно...", type: "choice", options: ["Стараешься найти компромисс", "Отстаиваешь свою позицию", "Избегаешь конфронтации", "Анализируешь и ищешь объективный выход"] },
  { id: 3, text: "Насколько ты легко справляешься с неопределённостью?", type: "scale" },
  { id: 4, text: "Как ты восстанавливаешь силы после напряжённого периода?", type: "choice", options: ["В одиночестве, в тишине", "В компании людей", "Через физическую активность", "Через творчество или хобби"] },
  { id: 5, text: "Каков твой главный страх в профессиональной жизни?", type: "choice", options: ["Провал и критика", "Застой и рутина", "Потеря стабильности", "Одиночество и изоляция"] },
  { id: 6, text: "Насколько тебе важно признание и одобрение окружающих?", type: "scale" },
  { id: 7, text: "Ты скорее планируешь наперёд или живёшь настоящим?", type: "choice", options: ["Подробно планирую всё", "Планирую крупные шаги", "Больше живу в моменте", "Адаптируюсь по ситуации"] },
  { id: 8, text: "Что тебя чаще всего мотивирует?", type: "choice", options: ["Достижение цели и победа", "Признание и благодарность", "Интерес к процессу", "Помощь другим"] },
  { id: 9, text: "Насколько легко тебе говорить «нет» на просьбы других?", type: "scale" },
  { id: 10, text: "Опиши в нескольких словах свою самую сильную сторону", type: "open" },
];

export default function Test() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [openText, setOpenText] = useState("");
  const [scaleVal, setScaleVal] = useState(5);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) navigate("/auth");
  }, [navigate]);

  const questions = type === "психологический" ? психологическийQuestions : склонностиQuestions;
  const q = questions[current];
  const progress = Math.round(((current) / questions.length) * 100);
  const isLast = current === questions.length - 1;

  const goNext = (answer?: string | number) => {
    const ans = answer ?? (q.type === "scale" ? scaleVal : openText);
    setAnswers({ ...answers, [q.id]: ans });

    if (isLast) {
      const testName = type === "психологический" ? "Психологический тест" : "Тест на склонности";
      const tests: { id: string; type: string; date: string; score: number }[] = JSON.parse(localStorage.getItem("pdd_tests") || "[]");
      const id = Date.now().toString();
      tests.push({ id, type: testName, date: new Date().toLocaleDateString("ru-RU"), score: Math.floor(Math.random() * 20) + 75 });
      localStorage.setItem("pdd_tests", JSON.stringify(tests));
      localStorage.setItem(`pdd_answers_${id}`, JSON.stringify({ ...answers, [q.id]: ans }));
      navigate(`/results/${id}`);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrent(current + 1);
      setOpenText("");
      setScaleVal(5);
      setAnimating(false);
    }, 250);
  };

  const goBack = () => {
    if (current === 0) { navigate("/cabinet"); return; }
    setAnimating(true);
    setTimeout(() => {
      setCurrent(current - 1);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="min-h-screen font-golos gradient-soft flex flex-col">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Icon name="ChevronLeft" size={18} />
            {current === 0 ? "Кабинет" : "Назад"}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {current + 1} / {questions.length}
          </div>
        </div>
        <div className="h-1 bg-secondary">
          <div
            className="h-full gradient-brand transition-all duration-500 ease-out"
            style={{ width: `${progress + (100 / questions.length)}%` }}
          />
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className={`transition-all duration-250 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            <div className="mb-3">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {type === "психологический" ? "Психологический тест" : "Тест на склонности"}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-foreground mb-8 leading-snug">
              {q.text}
            </h2>

            {/* CHOICE */}
            {q.type === "choice" && (
              <div className="space-y-3">
                {q.options!.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => goNext(opt)}
                    className="w-full text-left px-6 py-4 rounded-2xl border border-border bg-white hover:border-primary/50 hover:bg-accent/30 transition-all duration-150 font-medium text-foreground text-[15px] group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-secondary text-muted-foreground text-xs font-bold flex items-center justify-center group-hover:gradient-brand group-hover:text-white transition-all shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* SCALE */}
            {q.type === "scale" && (
              <div className="bg-white rounded-3xl border border-border p-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-6">
                  <span>Совсем нет</span>
                  <span className="text-3xl font-black text-gradient">{scaleVal}</span>
                  <span>Очень важно</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={scaleVal}
                  onChange={(e) => setScaleVal(Number(e.target.value))}
                  className="w-full accent-violet-600 h-2 cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <span key={n} className={`text-xs ${n === scaleVal ? "text-primary font-bold" : "text-border"}`}>|</span>
                  ))}
                </div>
                <button
                  onClick={() => goNext(scaleVal)}
                  className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl mt-6 hover:opacity-90 transition-opacity"
                >
                  {isLast ? "Завершить тест" : "Продолжить"}
                </button>
              </div>
            )}

            {/* OPEN */}
            {q.type === "open" && (
              <div className="bg-white rounded-3xl border border-border p-6">
                <textarea
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  placeholder="Напишите свой ответ..."
                  rows={4}
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-secondary/30 mb-4"
                />
                <button
                  onClick={() => goNext(openText || "—")}
                  disabled={!openText.trim()}
                  className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {isLast ? "Завершить тест" : "Продолжить"}
                </button>
                <button
                  onClick={() => goNext("пропущено")}
                  className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Пропустить вопрос
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
