import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const RULES_SECTIONS = [
  {
    heading: "1. Правила шахмат",
    text: "В шахматы играют на квадратной доске, состоящей из восьми рядов (называемых горизонталями и обозначаемых числами от 1 до 8) и восьми столбцов (называемых вертикалями и обозначаемых буквами от a до h). Цвета шестидесяти четырех клеток чередуются между светлыми и темными и называются «светлыми клетками» и «темными клетками». Шахматная доска располагается таким образом, чтобы у каждого игрока в правом нижнем углу была светлая клетка."
  },
  {
    heading: "1.1. Король",
    text: "Когда король находится под прямой атакой одной (или, возможно, двумя) фигурами противника, игрок находится под шахом. В состоянии шах разрешаются только ходы, выводящие короля из-под атаки. Игрок не должен делать ходов, которые могли бы поставить его короля под шах. Цель игры — поставить мат противнику; это происходит, когда король противника находится под шахом, и нет ходов, выводящих короля из-под шаха."
  },
  {
    heading: "1.2. Ладья",
    text: "Ладья перемещается на любое количество свободных полей по вертикали или горизонтали (она также участвует в особом ходе короля — рокировке)."
  },
  {
    heading: "1.3. Слон",
    text: "Слон перемещается на любое количество свободных полей по диагонали в любом направлении. Обратите внимание, что цвет поля у слона никогда не меняется, поэтому игроки говорят о «светлопольных» или «темнопольных» слонах."
  },
  {
    heading: "1.4. Ферзь",
    text: "Ферзь может перемещаться на любое количество свободных клеток по диагонали, горизонтали или вертикали."
  },
  {
    heading: "1.5. Конь",
    text: "Конь может перепрыгивать через занятые клетки и перемещаться на две клетки по горизонтали и на одну клетку по вертикали или наоборот, образуя фигуру в форме буквы «L». Конь в центре доски имеет восемь клеток, на которые он может перемещаться. Обратите внимание, что каждый раз, когда конь перемещается, цвет его клетки меняется."
  },
  {
    heading: "1.6. Пешки",
    text: "Пешки имеют самые сложные правила передвижения: пешка может продвинуться на одну клетку вперед, если эта клетка свободна. Если она еще не двигалась, пешка может продвинуться на две клетки вперед, если обе клетки свободны. Пешка не может двигаться назад.\n\nПешки — единственные фигуры, которые бьют не так, как ходят. Пешка может захватить фигуру противника на одну клетку по диагонали вперед. Пешка не может двигаться вперед, если клетка перед ней занята. Если пешка достигает противоположного конца доски, она должна быть превращена в другую фигуру (ферзя, ладью, слона или коня)."
  },
  {
    heading: "2. Игры на время",
    text: "В игры можно играть с ограничением по времени, задав время хода при создании новой игры. В играх на время у каждого игрока есть определенное количество времени на принятие решения о том, какие ходы сделать, и оставшееся время уменьшается только тогда, когда наступает его очередь хода."
  },
  {
    heading: "3. Ничья в игре",
    text: "Игра, которая заканчивается без победы для любого из игроков. Большинство ничьих в играх заключаются по договоренности, основанной на правилах. Другие способы, которыми игра может закончиться ничьей, — это тупик, тройное повторение, правило пятидесяти ходов и недостаток материала. Позиция считается ничьей (или ничейной позицией), если любой из игроков, благодаря правильной игре, в конечном итоге может вынудить ничью."
  },
  {
    heading: "3.1. Патовая ситуация",
    text: "Это позиция, в которой игрок, чей ход, не имеет допустимых ходов, и его король не находится под шахом. Патовая ситуация приводит к немедленной ничьей."
  },
  {
    heading: "3.2. Тройное повторение",
    text: "Игра считается ничьей, если одна и та же позиция встречается три раза при одном и том же ходе одного и того же игрока, и при этом каждый игрок имеет один и тот же набор допустимых ходов (последнее включает право взять взятие на проходе и право рокировки)."
  },
  {
    heading: "3.3. Правило пятидесяти ходов",
    text: "Игра заканчивается ничьей после пятидесяти ходов с каждой стороны без ходов пешкой или взятия."
  },
  {
    heading: "3.4. Недостаточно материала",
    text: "Это ситуация, когда все пешки взяты, и у одной стороны остался только король, а у другой — только король, король плюс конь или слон. Позиция ничья, потому что доминирующая сторона не может поставить мат независимо от хода."
  }
];

const IndexFooter = () => {
  const [showRules, setShowRules] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);
  const footerContentRef = useRef<HTMLDivElement>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText("ligachess.ru@mail.ru");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if ((showRules || showSupport) && footerContentRef.current) {
      setTimeout(() => {
        footerContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [showRules, showSupport]);

  return (
    <footer className="mt-auto shrink-0">
      <div className="border-t border-slate-200 dark:border-white/10 sm:h-10 flex items-center">
      <div className="container mx-auto px-4 py-2 sm:py-0 text-gray-600 dark:text-gray-400 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full">
          <p className="text-sm">&copy; 2026 Лига Шахмат. Все права защищены.</p>
          <div className="flex gap-6">
            <button
              onClick={() => {
                setShowRules(!showRules);
                setShowSupport(false);
              }}
              className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Правила
            </button>
            <button
              onClick={() => {
                setShowSupport(!showSupport);
                setShowRules(false);
              }}
              className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Поддержка
            </button>
          </div>
        </div>

        {showRules && (
          <div ref={footerContentRef} className="mt-6 max-w-2xl mx-auto text-left bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-white/10">
            <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {RULES_SECTIONS.map((section, i) => (
                <div key={i}>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    {section.heading}
                  </h4>
                  {section.text.split("\n\n").map((paragraph, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {showSupport && (
          <div ref={footerContentRef} className="mt-6 max-w-md mx-auto">
            <button
              onClick={copyEmail}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Icon name="Mail" size={18} className="text-blue-500" />
              <span className="text-slate-900 dark:text-white font-medium">
                ligachess.ru@mail.ru
              </span>
              <Icon
                name={copied ? "Check" : "Copy"}
                size={16}
                className={copied ? "text-green-500" : "text-gray-400"}
              />
            </button>
            {copied && (
              <p className="text-green-500 text-sm mt-2">Скопировано!</p>
            )}
          </div>
        )}
      </div>
      </div>
    </footer>
  );
};

export default IndexFooter;