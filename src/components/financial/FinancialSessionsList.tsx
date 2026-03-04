import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FinancialSession } from "@/lib/financialTrainerTypes";

const TOTAL_STEPS = 7;

interface Props {
  sessions: FinancialSession[];
  hasAccess: boolean;
  expiresLabel: string | null;
  onNewSession: () => void;
  onResume: (session: FinancialSession) => void;
  onDelete: (id: string) => void;
  onShowPayment: () => void;
  tab: "sessions" | "history";
  onTabChange: (tab: "sessions" | "history") => void;
}

function getLevelColor(ifmp: number): string {
  if (ifmp >= 85) return "bg-emerald-600";
  if (ifmp >= 70) return "bg-green-600";
  if (ifmp >= 50) return "bg-amber-500";
  if (ifmp >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export default function FinancialSessionsList({
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
  const inProgress = sessions.filter((s) => s.currentStep < TOTAL_STEPS && !s.completedAt);
  const completed = sessions.filter((s) => s.completedAt || s.currentStep >= TOTAL_STEPS);

  const displayed = tab === "sessions" ? inProgress : completed;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Финансовое мышление PRO</h1>
          {hasAccess && expiresLabel && (
            <p className="text-xs text-slate-500">Доступ до {expiresLabel}</p>
          )}
        </div>
        {hasAccess ? (
          <Button
            onClick={onNewSession}
            className="bg-slate-950 text-white hover:bg-slate-800 h-10"
          >
            <Icon name="Plus" size={16} />
            Новая сессия
          </Button>
        ) : (
          <Button
            onClick={onShowPayment}
            className="bg-slate-950 text-white hover:bg-slate-800 h-10"
          >
            <Icon name="Lock" size={16} />
            Купить доступ
          </Button>
        )}
      </div>

      <div
        className={`rounded-lg border p-3 flex items-center gap-2 mb-6 ${
          hasAccess
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <Icon
          name={hasAccess ? "ShieldCheck" : "ShieldAlert"}
          size={16}
          className={hasAccess ? "text-emerald-600" : "text-slate-400"}
        />
        <span
          className={`text-sm ${hasAccess ? "text-emerald-700" : "text-slate-500"}`}
        >
          {hasAccess
            ? `Доступ активен${expiresLabel ? ` до ${expiresLabel}` : ""}`
            : "Доступ не активен"}
        </span>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-slate-100">
        <button
          onClick={() => onTabChange("sessions")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
            tab === "sessions"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Сессии
          {inProgress.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
              {inProgress.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("history")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
            tab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
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
            <Icon
              name={tab === "sessions" ? "Wallet" : "BarChart3"}
              size={24}
              className="text-slate-400"
            />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">
            {tab === "sessions" ? "Нет активных сессий" : "Нет завершённых сессий"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {tab === "sessions"
              ? "Начните новую сессию финансового анализа"
              : "Завершите первую сессию, чтобы увидеть историю"}
          </p>
          {tab === "sessions" && hasAccess && (
            <Button
              onClick={onNewSession}
              className="bg-slate-950 text-white hover:bg-slate-800"
            >
              Начать
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((s) => {
            const isCompleted = s.completedAt || s.currentStep >= TOTAL_STEPS;
            const stepLabel = isCompleted
              ? "Завершено"
              : `Этап ${s.currentStep} из 6`;
            const dateLabel = formatDate(isCompleted && s.completedAt ? s.completedAt : s.createdAt);

            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => onResume(s)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        Сессия от {formatDate(s.createdAt).split(",")[0]}
                      </h3>
                      {isCompleted && s.results && (
                        <span
                          className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getLevelColor(
                            s.results.ifmp
                          )}`}
                        >
                          {s.results.ifmp.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{dateLabel}</span>
                      <span
                        className={isCompleted ? "text-emerald-600" : "text-slate-500"}
                      >
                        {stepLabel}
                      </span>
                      {isCompleted && s.results && (
                        <span className="text-slate-400">{s.results.level}</span>
                      )}
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
                    <Icon
                      name={isCompleted ? "Eye" : "ArrowRight"}
                      size={16}
                      className="text-slate-400"
                    />
                  </div>
                </div>
                {!isCompleted && (
                  <div className="mt-3">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all"
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
