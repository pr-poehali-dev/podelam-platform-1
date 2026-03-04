import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FinancialSession } from "@/lib/financialTrainerTypes";

interface Props {
  sessions: FinancialSession[];
  onResume: (session: FinancialSession) => void;
  onDelete: (id: string) => void;
}

function getScoreColor(ifmp: number): string {
  if (ifmp >= 85) return "text-emerald-600";
  if (ifmp >= 70) return "text-green-600";
  if (ifmp >= 50) return "text-amber-600";
  if (ifmp >= 30) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(ifmp: number): string {
  if (ifmp >= 85) return "bg-emerald-600";
  if (ifmp >= 70) return "bg-green-600";
  if (ifmp >= 50) return "bg-amber-500";
  if (ifmp >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export default function FinancialHistory({ sessions, onResume, onDelete }: Props) {
  const completed = useMemo(
    () =>
      sessions
        .filter((s) => s.completedAt && s.results)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
        ),
    [sessions]
  );

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="BarChart3" size={24} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">Пока нет результатов</h3>
        <p className="text-sm text-slate-500">
          Завершите первую сессию, чтобы увидеть историю
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completed.map((s) => {
        const r = s.results!;
        const dateLabel = new Date(s.completedAt!).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getScoreBg(
                      r.ifmp
                    )}`}
                  >
                    {r.ifmp.toFixed(0)}
                  </span>
                  <span className={`text-sm font-semibold ${getScoreColor(r.ifmp)}`}>
                    {r.level}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{dateLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              <IndexChip label="CF" value={`${fmt(Math.round(r.indices.cf))} ₽`} />
              <IndexChip
                label="KDN"
                value={`${(r.indices.kdn * 100).toFixed(0)}%`}
              />
              <IndexChip
                label="KFP"
                value={`${r.indices.kfp.toFixed(1)} мес`}
              />
              <IndexChip
                label="IFD"
                value={`${(r.indices.ifd * 100).toFixed(0)}%`}
              />
              <IndexChip
                label="ISU"
                value={r.indices.isu.toFixed(2)}
              />
            </div>

            <Button
              onClick={() => onResume(s)}
              variant="outline"
              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-sm"
            >
              <Icon name="Eye" size={14} className="mr-2" />
              Посмотреть
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function IndexChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5 text-center">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
    </div>
  );
}
