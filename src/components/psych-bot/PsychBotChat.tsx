import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Message, BotStep } from "./psychBotEngine";
import CourseRecommendation from "./CourseRecommendation";
import { findCourseForProfession } from "./courseOffers";

// ─── РЕНДЕР ТЕКСТА ────────────────────────────────────────────────────────────

function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="text-lg font-bold mt-4 mb-1 text-gray-900">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h2>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="my-3 border-gray-200" />;
    }
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <p key={i} className="flex gap-1.5 my-0.5 text-sm leading-relaxed">
          <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, "") }} />
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="my-0.5 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

// ─── ВИДЖЕТ ОЦЕНОК ────────────────────────────────────────────────────────────

function RatingWidget({ professions, onSubmit }: { professions: string[]; onSubmit: (ratings: Record<string, number>) => void }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const allRated = professions.every((p) => ratings[p] !== undefined);

  return (
    <div className="mt-2 space-y-3">
      {professions.map((prof) => (
        <div key={prof} className="bg-gray-50 rounded-xl p-3">
          <p className="text-sm font-medium text-gray-800 mb-2">{prof}</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setRatings((r) => ({ ...r, [prof]: score }))}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  ratings[prof] === score
                    ? "bg-violet-600 text-white shadow-md scale-110"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-violet-400"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      ))}
      {allRated && (
        <button
          onClick={() => onSubmit(ratings)}
          className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors text-sm mt-2"
        >
          Отправить оценки →
        </button>
      )}
    </div>
  );
}

// ─── КОМПОНЕНТ ЧАТА ───────────────────────────────────────────────────────────

type Props = {
  messages: Message[];
  loading: boolean;
  onButtonClick: (option: string) => void;
  onRatingsSubmit: (ratings: Record<string, number>) => void;
  onReset: () => void;
  onSave?: () => void;
  onExit?: () => void;
  bottomRef: React.RefObject<HTMLDivElement>;
  step: BotStep;
  paidOnce?: boolean;
  selectedProfession?: string;
};

export default function PsychBotChat({
  messages,
  loading,
  onButtonClick,
  onRatingsSubmit,
  onReset,
  onSave,
  onExit,
  bottomRef,
  step,
  paidOnce,
  selectedProfession,
}: Props) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave?.();
    setSaved(true);
    if (!paidOnce) {
      setTimeout(() => setSaved(false), 3000);
    }
  };
  const isFinished = step === "report";

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Icon name="Brain" size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[88%] ${msg.from === "user" ? "" : "w-full"}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.from === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm ml-auto inline-block"
                  : "bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800"
              }`}>
                {msg.from === "bot" ? (
                  <div className="text-sm leading-relaxed">{renderText(msg.text)}</div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {msg.from === "bot" && msg.widget && !isFinished && (
                <div className="mt-2 ml-0">
                  {msg.widget.type === "button_list" && (
                    <div className="flex flex-col gap-2">
                      {msg.widget.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => onButtonClick(opt)}
                          className="bg-white border border-violet-200 text-violet-800 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-violet-50 hover:border-violet-400 transition-all text-left"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.widget.type === "rating_list" && (
                    <RatingWidget
                      professions={msg.widget.professions}
                      onSubmit={onRatingsSubmit}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Icon name="Brain" size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {isFinished && !loading && selectedProfession && (() => {
          const course = findCourseForProfession(selectedProfession);
          return course ? <CourseRecommendation course={course} /> : null;
        })()}

        {isFinished && !loading && (
          <div className="mt-4 pb-6 space-y-2">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`w-full flex items-center gap-2 justify-center font-semibold py-3 rounded-xl transition-all text-sm ${
                saved
                  ? "bg-green-100 border border-green-300 text-green-700"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              <Icon name={saved ? "CheckCircle" : "Save"} size={15} />
              {saved ? "Результат сохранён!" : "Сохранить результат"}
            </button>
            {saved && paidOnce ? (
              <button
                onClick={onExit}
                className="w-full flex items-center gap-2 justify-center bg-white border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <Icon name="ArrowLeft" size={15} />
                Вернуться в кабинет
              </button>
            ) : !saved ? (
              <button
                onClick={onReset}
                className="w-full flex items-center gap-2 justify-center bg-white border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <Icon name="RotateCcw" size={15} />
                Пройти тест заново
              </button>
            ) : null}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
}