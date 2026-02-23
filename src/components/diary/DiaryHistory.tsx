import { useState } from "react";
import Icon from "@/components/ui/icon";
import { JournalEntry, EMOTIONS_POSITIVE, EMOTIONS_NEGATIVE, getWeeklyStats } from "./diaryEngine";

type Props = { entries: JournalEntry[] };

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
          <p className="text-muted-foreground text-xs mt-1">Первая запись появится после завершения анализа</p>
        </div>
      </div>
    );
  }

  const sorted = [...entries].reverse();
  const weeklyStats = getWeeklyStats(entries);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-4">
      {weeklyStats && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="BarChart3" size={16} className="text-violet-600" />
            <span className="font-bold text-sm text-violet-800">
              {entries.length >= 30 ? "Динамика развития" : "Ваше состояние за неделю"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/70 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ср. энергия</p>
              <p className="text-lg font-bold text-foreground">{weeklyStats.avgEnergy}/10</p>
            </div>
            <div className="bg-white/70 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ср. стресс</p>
              <p className="text-lg font-bold text-foreground">{weeklyStats.avgStress}/10</p>
            </div>
            <div className="bg-white/70 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Достижений</p>
              <p className="text-lg font-bold text-foreground">{weeklyStats.totalAchievements}</p>
            </div>
            <div className="bg-white/70 rounded-xl px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Частые эмоции</p>
              <p className="text-xs font-medium text-foreground mt-1">{weeklyStats.topEmotions.slice(0, 3).join(", ") || "—"}</p>
            </div>
          </div>
          {weeklyStats.repeatingDifficulties.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700">
              <Icon name="AlertTriangle" size={12} className="inline mr-1" />
              Повторяющиеся сложности: {weeklyStats.repeatingDifficulties.join(", ")}
            </div>
          )}
        </div>
      )}

      {sorted.map((entry, i) => {
        const realIdx = entries.length - 1 - i;
        const isOpen = expanded === realIdx;
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
        const timeStr = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

        const emotionNames = entry.emotions.map(e => e.emotion);
        const posCount = emotionNames.filter(e => EMOTIONS_POSITIVE.includes(e)).length;
        const negCount = emotionNames.filter(e => EMOTIONS_NEGATIVE.includes(e)).length;
        const moodColor = posCount > negCount ? "bg-green-100 text-green-700" : negCount > posCount ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

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
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{timeStr}</span>
                    <span>·</span>
                    <span>{entry.context_area}</span>
                    {entry.energy_level > 0 && (
                      <>
                        <span>·</span>
                        <span>E:{entry.energy_level} S:{entry.stress_level}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {emotionNames.length > 0 && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${moodColor}`}>
                    {posCount > negCount ? "+" : negCount > posCount ? "−" : "~"}
                  </span>
                )}
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {entry.achievements.length > 0 && (
                  <Section icon="Trophy" title="Достижения" color="text-amber-600" bgColor="bg-amber-50">
                    {entry.achievements.map((a, j) => <li key={j}>{a}</li>)}
                  </Section>
                )}

                {entry.actions.length > 0 && (
                  <Section icon="Footprints" title="Действия" color="text-blue-600" bgColor="bg-blue-50">
                    {entry.actions.map((a, j) => <li key={j}>{a}</li>)}
                  </Section>
                )}

                {entry.emotions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="Heart" size={13} className="text-pink-600" />
                      <span className="text-xs font-semibold text-pink-600">Эмоции</span>
                    </div>
                    <div className="space-y-1.5">
                      {entry.emotions.map((em, j) => (
                        <div key={j} className="bg-pink-50 rounded-xl px-3 py-2">
                          <span className="text-xs font-semibold text-pink-700">{em.emotion}</span>
                          {em.trigger && <p className="text-xs text-pink-600 mt-0.5">{em.trigger}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(entry.energy_level > 0 || entry.stress_level > 0) && (
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-green-600 font-semibold uppercase">Энергия</p>
                      <p className="text-lg font-bold text-green-700">{entry.energy_level}/10</p>
                    </div>
                    <div className="flex-1 bg-orange-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-orange-600 font-semibold uppercase">Стресс</p>
                      <p className="text-lg font-bold text-orange-700">{entry.stress_level}/10</p>
                    </div>
                  </div>
                )}

                {entry.difficulties.length > 0 && (
                  <Section icon="CloudRain" title="Сложности" color="text-red-600" bgColor="bg-red-50">
                    {entry.difficulties.map((d, j) => <li key={j}>{d}</li>)}
                  </Section>
                )}

                {entry.insights.length > 0 && (
                  <Section icon="Lightbulb" title="Осознания" color="text-yellow-600" bgColor="bg-yellow-50">
                    {entry.insights.map((ins, j) => <li key={j}>{ins}</li>)}
                  </Section>
                )}

                {entry.gratitude.length > 0 && (
                  <Section icon="Sparkles" title="Благодарность" color="text-violet-600" bgColor="bg-violet-50">
                    {entry.gratitude.map((g, j) => <li key={j}>{g}</li>)}
                  </Section>
                )}

                {entry.report && (
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl px-3 py-2.5 text-sm text-violet-800 leading-relaxed mt-2">
                    {entry.report.split("\n").map((line, k) => {
                      if (line === "") return <div key={k} className="h-1.5" />;
                      if (line === "---") return <hr key={k} className="border-violet-200 my-1.5" />;
                      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                      const bullet = line.startsWith("· ") ? line.slice(2) : null;
                      if (bullet) {
                        const boldBullet = bullet.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                        return <p key={k} className="pl-3 before:content-['·'] before:mr-1.5" dangerouslySetInnerHTML={{ __html: boldBullet }} />;
                      }
                      return <p key={k} className={line.startsWith("**") ? "font-semibold" : ""} dangerouslySetInnerHTML={{ __html: bold }} />;
                    })}
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground text-right">
                  Завершено на этапе {entry.completion_stage}/8
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ icon, title, color, bgColor, children }: {
  icon: string; title: string; color: string; bgColor: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name={icon} size={13} className={color} />
        <span className={`text-xs font-semibold ${color}`}>{title}</span>
      </div>
      <ul className={`${bgColor} rounded-xl px-3 py-2 text-sm space-y-1 list-disc list-inside`}>
        {children}
      </ul>
    </div>
  );
}
