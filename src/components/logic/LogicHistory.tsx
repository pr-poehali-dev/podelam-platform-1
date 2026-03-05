import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { LogicSession } from "@/lib/logicTrainerTypes";

interface Props {
  sessions: LogicSession[];
  onResume: (session: LogicSession) => void;
  onDelete: (id: string) => void;
}

function ilmpBg(ilmp: number): string {
  if (ilmp >= 85) return "bg-indigo-600";
  if (ilmp >= 70) return "bg-emerald-600";
  if (ilmp >= 50) return "bg-amber-500";
  if (ilmp >= 30) return "bg-orange-500";
  return "bg-red-500";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogicHistory({ sessions, onResume, onDelete }: Props) {
  const completed = useMemo(
    () =>
      sessions
        .filter((s) => s.completedAt && s.results)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()),
    [sessions]
  );

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="BarChart3" size={24} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">Нет завершённых сессий</h3>
        <p className="text-sm text-slate-500">
          Завершите первую сессию, чтобы увидеть историю
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completed.map((s) => {
        const statement = s.data.step0?.statement || "Без названия";
        const dateStr = fmtDate(s.completedAt!);

        return (
          <div
            key={s.id}
            onClick={() => onResume(s)}
            className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{statement}</h3>
                  <span
                    className={`text-xs font-bold text-white px-2 py-0.5 rounded-full shrink-0 ${ilmpBg(
                      s.results!.ilmp
                    )}`}
                  >
                    {s.results!.ilmp}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{dateStr}</span>
                  <span className="text-slate-400">{s.results!.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Trash2" size={14} />
                </button>
                <Icon name="Eye" size={16} className="text-slate-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
