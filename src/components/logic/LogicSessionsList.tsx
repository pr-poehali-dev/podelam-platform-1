import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { LogicSession } from "@/lib/logicTrainerTypes";

const TOTAL_STEPS = 7;

interface Props {
  sessions: LogicSession[];
  hasAccess: boolean;
  expiresLabel: string | null;
  onNewSession: () => void;
  onResume: (session: LogicSession) => void;
  onDelete: (id: string) => void;
  onShowPayment: () => void;
  tab: "sessions" | "history";
  onTabChange: (tab: "sessions" | "history") => void;
}

function ilmpBadgeBg(ilmp: number): string {
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

export default function LogicSessionsList({
  sessions,
  hasAccess,
  expiresLabel,
  onNewSession,
  onResume,
  onDelete,
  onShowPayment,
  tab,
  onTabChange,
}: Props) {
  const active = sessions.filter((s) => !s.completedAt && s.currentStep < TOTAL_STEPS);
  const completed = sessions.filter((s) => s.completedAt || s.currentStep >= TOTAL_STEPS);
  const displayed = tab === "sessions" ? active : completed;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">Логика мышления</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            PRO
          </span>
          {hasAccess && expiresLabel && (
            <span className="text-xs text-slate-400">до {expiresLabel}</span>
          )}
        </div>
        {hasAccess ? (
          <Button onClick={onNewSession} className="bg-indigo-600 text-white hover:bg-indigo-700 h-10">
            <Icon name="Plus" size={16} className="mr-1.5" />
            Новая сессия
          </Button>
        ) : (
          <Button onClick={onShowPayment} className="bg-indigo-600 text-white hover:bg-indigo-700 h-10">
            <Icon name="Lock" size={16} className="mr-1.5" />
            Купить доступ
          </Button>
        )}
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-slate-100">
        <button
          onClick={() => onTabChange("sessions")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
            tab === "sessions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Сессии
          {active.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
              {active.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("history")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
            tab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          История
          {completed.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
              {completed.length}
            </span>
          )}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lightbulb" size={24} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">
            {tab === "sessions" ? "Нет активных сессий" : "Нет завершённых сессий"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {tab === "sessions"
              ? "Начните первую логическую сессию"
              : "Завершите сессию, чтобы увидеть историю"}
          </p>
          {tab === "sessions" && hasAccess && (
            <Button onClick={onNewSession} className="bg-indigo-600 text-white hover:bg-indigo-700">
              Начать
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((s) => {
            const done = !!(s.completedAt || s.currentStep >= TOTAL_STEPS);
            const statement = s.data.step0?.statement || "Без названия";
            const dateStr = fmtDate(done && s.completedAt ? s.completedAt : s.createdAt);

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
                      {done && s.results && (
                        <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full shrink-0 ${ilmpBadgeBg(s.results.ilmp)}`}>
                          {s.results.ilmp}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{dateStr}</span>
                      <span className={done ? "text-indigo-600" : "text-slate-500"}>
                        {done ? "Завершено" : `Шаг ${s.currentStep} из ${TOTAL_STEPS}`}
                      </span>
                      {done && s.results && <span className="text-slate-400">{s.results.level}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                    <Icon name={done ? "Eye" : "ArrowRight"} size={16} className="text-slate-400" />
                  </div>
                </div>
                {!done && (
                  <div className="mt-3">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${(s.currentStep / TOTAL_STEPS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
