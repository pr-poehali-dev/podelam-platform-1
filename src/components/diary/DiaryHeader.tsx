import Icon from "@/components/ui/icon";
import { Phase, JournalEntry, stageLabel } from "./diaryEngine";

type ViewTab = "chat" | "history";

type Props = {
  onBack: () => void;
  phase: Phase;
  stageNumber: number;
  entries: JournalEntry[];
  tab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
};

export default function DiaryHeader({ onBack, phase, stageNumber, entries, tab, onTabChange }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="ArrowLeft" size={18} />
        <span className="text-sm font-medium">Кабинет</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
          <Icon name="BookOpen" size={14} className="text-violet-600" />
        </div>
        <span className="font-bold text-sm text-foreground">Дневник</span>
        {phase !== "done" && phase !== "finishing" && phase !== "intro" && (
          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md ml-1">
            {stageLabel(stageNumber)} ({stageNumber}/8)
          </span>
        )}
      </div>

      {entries.length > 0 ? (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
          <button
            onClick={() => onTabChange("chat")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Запись
          </button>
          <button
            onClick={() => onTabChange("history")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            История ({entries.length})
          </button>
        </div>
      ) : <div className="w-16" />}
    </header>
  );
}
