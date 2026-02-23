import { useState } from "react";
import Icon from "@/components/ui/icon";
import { DiaryEntry } from "./diaryEngine";

type Props = { entries: DiaryEntry[] };

export default function DiaryHistory({ entries }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="BookOpen" size={24} className="text-violet-300" />
          </div>
          <p className="text-muted-foreground text-sm">Записей пока нет</p>
          <p className="text-muted-foreground text-xs mt-1">Первая запись появится после завершения разговора</p>
        </div>
      </div>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-3">
      {sorted.map((entry, i) => {
        const realIdx = entries.length - 1 - i;
        const isOpen = expanded === realIdx;
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
        const timeStr = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

        return (
          <div key={realIdx} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : realIdx)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <Icon name="CalendarDays" size={16} className="text-violet-500" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground">{dateStr}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{timeStr}</span>
                    <span>·</span>
                    <span>{entry.answers.length} {entry.answers.length === 1 ? "ответ" : entry.answers.length < 5 ? "ответа" : "ответов"}</span>
                    <span>·</span>
                    <span className="truncate">{entry.emotion_tags.join(", ")}</span>
                  </div>
                </div>
              </div>
              <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground shrink-0 ml-2" />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {entry.answers.map((qa, j) => (
                  <div key={j}>
                    <p className="text-xs text-violet-600 font-medium mb-1">{qa.question.replace(/^(Спасибо.*?\.|Я тебя слышу\.|Это важно.*?\.|Понимаю тебя\.) /, "")}</p>
                    <p className="text-sm text-foreground leading-relaxed bg-secondary/40 rounded-xl px-3 py-2">{qa.answer}</p>
                  </div>
                ))}
                {entry.supportText && (
                  <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-violet-800 leading-relaxed mt-2">
                    {entry.supportText.split("\n").map((line, k) => {
                      if (line === "") return <div key={k} className="h-1.5" />;
                      if (line === "---") return <hr key={k} className="border-violet-200 my-1.5" />;
                      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                      return <p key={k} dangerouslySetInnerHTML={{ __html: bold }} />;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
