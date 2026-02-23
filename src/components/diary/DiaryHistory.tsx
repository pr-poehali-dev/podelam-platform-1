import { useState } from "react";
import Icon from "@/components/ui/icon";
import { DiaryEntry } from "./diaryEngine";

type Props = {
  entries: DiaryEntry[];
  onNewEntry: () => void;
};

const EMOTION_LABELS: Record<string, string> = {
  anxiety: "Тревога", anger: "Злость", sadness: "Грусть",
  guilt: "Вина", fatigue: "Усталость", shame: "Стыд", loneliness: "Одиночество",
};

export default function DiaryHistory({ entries, onNewEntry }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const sorted = [...entries].reverse();

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <Icon name="BookOpen" size={28} className="text-violet-500" />
        </div>
        <h3 className="font-bold text-lg text-foreground mb-1">Записей пока нет</h3>
        <p className="text-sm text-muted-foreground mb-4">Создайте первую запись — ответьте на 5 вопросов</p>
        <button
          onClick={onNewEntry}
          className="bg-violet-600 text-white font-semibold px-5 py-2.5 rounded-2xl hover:bg-violet-700 transition-colors text-sm"
        >
          Новая запись
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-lg text-foreground">История записей</h2>
        <button
          onClick={onNewEntry}
          className="bg-violet-100 text-violet-700 font-semibold px-4 py-2 rounded-xl hover:bg-violet-200 transition-colors text-xs flex items-center gap-1.5"
        >
          <Icon name="Plus" size={14} />
          Новая
        </button>
      </div>

      {sorted.map((entry, idx) => {
        const isOpen = expanded === idx;
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString("ru-RU", {
          day: "2-digit", month: "long", year: "numeric",
          timeZone: "Europe/Moscow",
        });
        const timeStr = d.toLocaleTimeString("ru-RU", {
          hour: "2-digit", minute: "2-digit",
          timeZone: "Europe/Moscow",
        });

        return (
          <div key={idx} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="w-full text-left px-4 py-3.5 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Icon name="FileText" size={16} className="text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{entry.situation}</div>
                <div className="text-xs text-muted-foreground">{dateStr}, {timeStr} (МСК)</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.emotion_tags.length > 0 && (
                  <div className="flex gap-1">
                    {entry.emotion_tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">
                        {EMOTION_LABELS[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                )}
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Что произошло", value: entry.situation },
                    { label: "Мысли", value: entry.thoughts },
                    { label: "Эмоции", value: entry.emotions },
                    { label: "Реакция тела", value: entry.body },
                    { label: "Действие", value: entry.action },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2">
                      <div className="text-[11px] text-muted-foreground font-medium mb-0.5">{item.label}</div>
                      <div className="text-sm text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>

                {entry.emotion_tags.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium mb-1">Определённые эмоции</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.emotion_tags.map((tag) => (
                        <span key={tag} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          {EMOTION_LABELS[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.reflectionAnswers && entry.reflectionAnswers.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium mb-1">Рефлексия</div>
                    <div className="space-y-1.5">
                      {entry.reflectionAnswers.map((ans, ri) => (
                        <div key={ri} className="bg-violet-50 rounded-xl px-3 py-2 text-sm text-foreground">
                          {ans}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.supportText && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                    <div className="text-[11px] text-green-600 font-medium mb-1 flex items-center gap-1">
                      <Icon name="Heart" size={11} />
                      Поддержка
                    </div>
                    <div className="text-sm text-green-800">{entry.supportText}</div>
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
